const User = require("../models/User");
const Service = require("../models/Service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createNotification } = require("./notificationController");
const { sendRegistrationAlert } = require("../services/emailService");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, serviceType } = req.body;

    // Password validation: > 8 characters, at least one uppercase, at least one special character
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < 8 || password.length > 12) {
      return res.status(400).json({ message: "Password must be between 8 and 12 characters long." });
    }
    if (!hasUpperCase) {
      return res.status(400).json({ message: "Password must contain at least one uppercase letter." });
    }
    if (!hasSpecialChar) {
      return res.status(400).json({ message: "Password must contain at least one special character." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Block manual admin registration
    if (role === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be registered manually." });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    // Set isApproved: false ONLY for Equipment Owners
    const isApproved = role === "owner" ? false : true;

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
      isApproved,
      serviceType: role === "service_provider" ? serviceType : undefined
    });

    if (role === "owner") {
      // 1. Notify Super Admin in the DB
      let admin = await User.findOne({ role: "admin" });
      
      // If admin doesn't exist in DB yet, create it using env credentials
      if (!admin) {
        admin = await User.create({
          name: "Super Admin",
          email: process.env.SUPER_ADMIN_EMAIL,
          password: await bcrypt.hash(process.env.SUPER_ADMIN_PASS, 10),
          role: "admin",
          isApproved: true
        });
      }

      await createNotification(
        admin._id,
        `New Owner Registration: ${name} (${email}) is requesting approval.`,
        'registration'
      );

      // 2. Send email to Super Admin
      await sendRegistrationAlert(user);

      return res.json({ 
        message: "Registration submitted! Your account is pending admin approval. You will receive an email once approved.",
        pendingApproval: true 
      });
    }

    if (role === "service_provider" && serviceType) {
      await Service.create({
        name: `${name}'s ${serviceType} Services`,
        description: `Professional ${serviceType} services provided by ${name}.`,
        price: 500,
        provider: user._id,
        category: serviceType
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({ token, user });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: err.message || "Server error during registration." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Check if it's the Super Admin
  if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASS) {
    // Upsert admin user in DB to ensure it exists for notifications
    let adminUser = await User.findOne({ email });
    if (!adminUser) {
      adminUser = await User.create({
        name: "Super Admin",
        email,
        password: await bcrypt.hash(password, 10),
        role: "admin",
        isApproved: true
      });
    }

    const token = jwt.sign({ id: adminUser._id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "30d" });
    return res.json({ token, user: adminUser });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  // 2. Check Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid password" });

  // 3. Check Approval Status (Only for Equipment Owners)
  if (user.role === "owner" && !user.isApproved) {
    return res.status(403).json({ 
      message: "Your account is pending admin approval. You will receive an email once your registration is accepted." 
    });
  }

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });

  res.json({ token, user });
};