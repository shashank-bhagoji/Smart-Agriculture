const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private (any authenticated user)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Block unapproved owners
    if (user.role === "owner" && !user.isApproved) {
      return res.status(403).json({ message: 'Your account is pending admin approval.' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private (any authenticated user)
exports.updateMe = async (req, res) => {
  try {
    const updates = { ...req.body };
    // Prevent role or password changes via this endpoint
    delete updates.role;
    delete updates.password;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const { itemId, itemType } = req.body; // itemType: 'equipment' or 'service'
    const user = await User.findById(req.user.id);
    const field = itemType === 'equipment' ? 'favoriteEquipment' : 'favoriteServices';
    
    const index = user[field].indexOf(itemId);
    if (index === -1) {
      user[field].push(itemId);
    } else {
      user[field].splice(index, 1);
    }
    
    await user.save();
    res.json({ message: 'Favorites updated', favorites: user[field] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favoriteEquipment')
      .populate('favoriteServices');
    res.json({ 
      equipment: user.favoriteEquipment, 
      services: user.favoriteServices 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
