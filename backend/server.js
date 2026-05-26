const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // Set security HTTP headers and allow cross-origin image loads
app.use(xss()); // Prevent XSS attacks
app.use(mongoSanitize()); // Prevent NoSQL injection
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Limit body size

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Raise limit in development to avoid blocks during live presentation/testing
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", limiter);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/equipment", require("./routes/equipmentRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/operators", require("./routes/operatorRoutes"));
app.use("/api/transport", require("./routes/transportRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));

app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/group-bookings", require("./routes/groupBookingRoutes"));
app.use("/api/disputes", require("./routes/disputeRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/ml", require("./routes/mlRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../', 'frontend', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));