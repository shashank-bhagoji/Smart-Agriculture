const nodemailer = require('nodemailer');
const ics = require('ics');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Basic format check and reject common fake emails
  const fakeDomains = ['example.com', 'test.com', 'fake.com', 'temp.com'];
  if (!re.test(email)) return false;
  const domain = email.split('@')[1];
  return !fakeDomains.includes(domain.toLowerCase());
};

exports.sendCalendarInvite = async (booking, farmerEmail, ownerEmail) => {
  const isFarmerValid = validateEmail(farmerEmail);
  const isOwnerValid = validateEmail(ownerEmail);

  if (!isFarmerValid || !isOwnerValid) {
    console.log(`Skipping calendar invite: One or more emails are invalid (${farmerEmail}, ${ownerEmail})`);
    return;
  }

  const isService = !!booking.service;
  const item = isService ? booking.service : booking.equipment;
  
  const start = new Date(booking.startDate);
  const end = new Date(booking.endDate);

  const event = {
    start: [start.getFullYear(), start.getMonth() + 1, start.getDate()],
    end: [end.getFullYear(), end.getMonth() + 1, end.getDate()],
    title: `AgriShare: ${item.name}`,
    description: `Booking confirmed for ${item.name}.`,
    location: 'Online / Field',
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: { name: 'AgriShare Platform', email: process.env.EMAIL_USER },
    attendees: [
      { name: 'Farmer', email: farmerEmail, rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' },
      { name: 'Owner', email: ownerEmail, rsvp: true, partstat: 'ACCEPTED', role: 'REQ-PARTICIPANT' }
    ]
  };

  ics.createEvent(event, async (error, value) => {
    if (error) {
      console.error('Error creating ICS file:', error);
      return;
    }

    const icsContent = value;

    // 1. Email to the Farmer
    const farmerMailOptions = {
      from: `AgriShare Admin <${process.env.EMAIL_USER}>`,
      to: farmerEmail,
      subject: `✅ Request Accepted: ${item.name}`,
      text: `Hello! The ${isService ? 'Service Provider' : 'Equipment Owner'} (${ownerEmail}) has accepted your request for ${item.name} from ${start.toDateString()} to ${end.toDateString()}. The event has been added to your calendar.`,
      icalEvent: {
        filename: 'booking.ics',
        method: 'REQUEST',
        content: icsContent
      }
    };

    // 2. Email to the Owner/Provider
    const ownerMailOptions = {
      from: `AgriShare Admin <${process.env.EMAIL_USER}>`,
      to: ownerEmail,
      subject: `📅 Booking Confirmed: ${item.name}`,
      text: `Hello! You have successfully accepted the booking request from Farmer (${farmerEmail}) for ${item.name} on ${start.toDateString()}. We have added this to your calendar and notified the farmer.`,
      icalEvent: {
        filename: 'booking.ics',
        method: 'REQUEST',
        content: icsContent
      }
    };

    try {
      await transporter.sendMail(farmerMailOptions);
      await transporter.sendMail(ownerMailOptions);
      console.log('Personalized calendar invites sent to both farmer and owner.');
    } catch (err) {
      console.error('Error sending email invites:', err);
    }
  });
};

// Notify Admin about new Owner registration
exports.sendRegistrationAlert = async (owner) => {
  const mailOptions = {
    from: `AgriShare Platform <${process.env.EMAIL_USER}>`,
    to: process.env.SUPER_ADMIN_EMAIL,
    subject: `🔔 New Owner Registration: ${owner.name}`,
    text: `Hello Admin,\n\nA new Equipment Owner has registered and is waiting for your approval.\n\nName: ${owner.name}\nEmail: ${owner.email}\n\nPlease log in to your admin dashboard to accept or reject this request.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Registration alert sent to Admin.');
  } catch (err) {
    console.error('Error sending registration alert:', err);
  }
};

// Notify Owner about Admin approval
exports.sendApprovalNotification = async (ownerEmail, isAccepted) => {
  const mailOptions = {
    from: `AgriShare Admin <${process.env.EMAIL_USER}>`,
    to: ownerEmail,
    subject: isAccepted ? "✅ Account Approved" : "❌ Account Rejected",
    text: isAccepted 
      ? `Congratulations! Your Equipment Owner account has been approved by the Admin. You can now login using your registered email and password.\n\nLogin here: http://localhost:3000/login`
      : `We regret to inform you that your Equipment Owner registration has been rejected. Please contact support if you believe this is a mistake.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Approval email (${isAccepted ? 'Accepted' : 'Rejected'}) sent to ${ownerEmail}.`);
  } catch (err) {
    console.error('Error sending approval email:', err);
  }
};

// Notify User about account deletion
exports.sendDeletionNotification = async (userEmail) => {
  const mailOptions = {
    from: `AgriShare Admin <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "⚠️ Account Deleted",
    text: `Your account has been deleted by the Admin. You will no longer be able to access the AgriShare platform. If you have any pending business, please contact the support team.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Deletion notification sent to ${userEmail}.`);
  } catch (err) {
    console.error('Error sending deletion email:', err);
  }
};
