const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30 seconds
    });
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.error("\n💡 Troubleshooting Tips:");
    console.error("1. IP Whitelisting: Ensure your current IP is whitelisted in MongoDB Atlas (Network Access -> Allow Access from Anywhere / 0.0.0.0/0).");
    console.error("2. Internet connection: Verify you have a working internet connection.");
    console.error("3. Database URI: Verify that the MONGO_URI in backend/.env is correct.");
    console.error("4. VPN/Firewall: If you are on a restricted network (school/office), it might block MongoDB ports.");
    process.exit(1);
  }
};

module.exports = connectDB;