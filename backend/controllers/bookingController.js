const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { createNotification } = require("./notificationController");
const { sendCalendarInvite } = require("../services/emailService");

exports.createBooking = async (req, res) => {
  const { equipment, service, operator, startDate, endDate, farmer } = req.body;

  try {
    // Conflict Check: Check for bookings that overlap with requested dates
    const query = {
      status: { $in: ['accepted', 'pending'] },
      $or: [
        { startDate: { $lt: new Date(endDate) }, endDate: { $gt: new Date(startDate) } }
      ]
    };

    if (equipment) query.equipment = equipment;
    if (service) query.service = service;
    if (operator) query.operator = operator;

    const existingBooking = await Booking.findOne(query);

    if (existingBooking) {
      const statusMsg = existingBooking.status === 'accepted' ? "already booked" : "currently requested by someone else";
      return res.status(400).json({ 
        message: `This item is ${statusMsg} for the selected dates. Please choose different dates.` 
      });
    }

    const booking = await Booking.create(req.body);
    
    let typeStr = "item";
    if (equipment) typeStr = "equipment";
    else if (service) typeStr = "service";
    else if (operator) typeStr = "operator";
    
    // Notify the farmer
    await createNotification(
      farmer,
      `Your booking for ${typeStr} has been submitted. Status: Pending.`,
      'booking'
    );

    // Notify the recipient (Owner, Provider, or Operator)
    let recipientId = null;
    if (equipment) {
      const eq = await mongoose.model('Equipment').findById(equipment);
      recipientId = eq.owner;
    } else if (service) {
      const sv = await mongoose.model('Service').findById(service);
      recipientId = sv.provider;
    } else if (operator) {
      const op = await mongoose.model('Operator').findById(operator);
      recipientId = op.user;
    }

    if (recipientId) {
      await createNotification(
        recipientId,
        `New booking request received for your ${typeStr}.`,
        'booking_request'
      );
    }

    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('equipment').populate('service').populate('farmer');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFarmerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ farmer: req.user.id })
      .populate({ path: 'equipment', populate: { path: 'owner' } })
      .populate({ path: 'service', populate: { path: 'provider' } })
      .populate('farmer');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOwnerBookings = async (req, res) => {
  // Find bookings where the equipment belongs to the logged‑in owner
  const bookings = await Booking.find()
    .populate('equipment')
    .populate('farmer');
  
  const ownerBookings = bookings.filter(b => b.equipment && b.equipment.owner.toString() === req.user.id);
  res.json(ownerBookings);
};

exports.getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('service')
      .populate('farmer');
    
    const providerBookings = bookings.filter(b => b.service && b.service.provider.toString() === req.user.id);
    res.json(providerBookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  const { bookingId, status } = req.body; // status: 'accepted' or 'rejected'
  const booking = await Booking.findById(bookingId).populate('equipment').populate('service').populate('operator');
  if (!booking) return res.status(404).json({ message: 'Booking not found' });

  // Ensure the owner, provider, or operator is the one updating
  const isOwner = booking.equipment && booking.equipment.owner.toString() === req.user.id;
  const isProvider = booking.service && booking.service.provider.toString() === req.user.id;
  const isOperator = booking.operator && booking.operator.user && booking.operator.user.toString() === req.user.id;
  
  if (!isOwner && !isProvider && !isOperator) {
    return res.status(403).json({ message: 'Not authorized to modify this booking' });
  }

  booking.status = status;
  await booking.save();

  const itemName = booking.equipment ? booking.equipment.name : (booking.service ? booking.service.name : booking.operator.name);

  // Notify the farmer about the status change
  await createNotification(
    booking.farmer,
    `Your booking for ${itemName} has been ${status}.`,
    'approval'
  );

  // Background Calendar Sync via Email Invite
  if (status === 'accepted') {
    const fullUser = await User.findById(req.user.id);
    const fullBooking = await Booking.findById(booking._id).populate('farmer').populate('equipment').populate('service').populate('operator');
    await sendCalendarInvite(fullBooking, fullBooking.farmer?.email, fullUser.email);
  }

  res.json(booking);
};