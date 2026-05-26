const Review = require('../models/Review');
const Equipment = require('../models/Equipment');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

exports.createReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  const farmerId = req.user.id;

  try {
    const booking = await Booking.findById(bookingId).populate('equipment').populate('service');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Check if review already exists
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) return res.status(400).json({ message: 'Review already submitted for this booking' });

    const reviewData = {
      booking: bookingId,
      farmer: farmerId,
      rating,
      comment
    };

    if (booking.equipment) {
      reviewData.equipment = booking.equipment._id;
    } else if (booking.service) {
      reviewData.service = booking.service._id;
    }

    const review = await Review.create(reviewData);

    // Update Equipment or Service average rating
    if (booking.equipment) {
      const eq = await Equipment.findById(booking.equipment._id);
      const totalRating = (eq.rating * eq.reviewsCount) + rating;
      eq.reviewsCount += 1;
      eq.rating = totalRating / eq.reviewsCount;
      await eq.save();
    } else if (booking.service) {
      const sv = await Service.findById(booking.service._id);
      const totalRating = (sv.rating * sv.reviewsCount) + rating;
      sv.reviewsCount += 1;
      sv.rating = totalRating / sv.reviewsCount;
      await sv.save();
    }

    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReviewsForItem = async (req, res) => {
  const { type, itemId } = req.params; // type: 'equipment' or 'service'
  try {
    const query = type === 'equipment' ? { equipment: itemId } : { service: itemId };
    const reviews = await Review.find(query).populate('farmer', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
