const { protect } = require('./authMiddleware');

// authorize(...roles) returns middleware that checks if the authenticated user's role is among allowed roles.
module.exports = function authorize(...roles) {
  return (req, res, next) => {
    // req.user is set by protect middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
};
