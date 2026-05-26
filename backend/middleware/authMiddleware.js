const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    token = token.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized to access this route, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains id and role
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed or expired" });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden: Not authorized as an admin" });
  }
};