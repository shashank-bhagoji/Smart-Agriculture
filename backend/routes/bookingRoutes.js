const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createBooking,
  getBookings,
  getOwnerBookings,
  getFarmerBookings,
  getProviderBookings,
  updateBookingStatus,
} = require("../controllers/bookingController");

// Public route to create booking (farmer)
router.post("/", protect, createBooking);

// Admin or owner can view all bookings
router.get("/", protect, getBookings);

// Farmer specific route
router.get("/farmer", protect, getFarmerBookings);

// Owner specific routes
router.get("/owner", protect, getOwnerBookings);

// Provider specific routes
router.get("/provider", protect, getProviderBookings);

router.patch("/status", protect, updateBookingStatus);

module.exports = router;