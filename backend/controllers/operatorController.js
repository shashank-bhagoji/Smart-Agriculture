const Operator = require('../models/Operator');

// @desc Create a new operator (admin or service provider can add)
// @route POST /api/operators
// @access Private (admin or service_provider)
exports.createOperator = async (req, res) => {
  try {
    const operator = await Operator.create({ ...req.body, user: req.user.id });
    res.status(201).json(operator);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get all operators (public)
// @route GET /api/operators
exports.getOperators = async (req, res) => {
  try {
    const operators = await Operator.find().populate('user', 'name email');
    res.json(operators);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Get a single operator by ID
// @route GET /api/operators/:id
exports.getOperatorById = async (req, res) => {
  try {
    const operator = await Operator.findById(req.params.id).populate('user', 'name email');
    if (!operator) return res.status(404).json({ message: 'Operator not found' });
    res.json(operator);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Update an operator (owner only)
// @route PUT /api/operators/:id
exports.updateOperator = async (req, res) => {
  try {
    const operator = await Operator.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, req.body, { new: true });
    if (!operator) return res.status(404).json({ message: 'Operator not found or not owned by you' });
    res.json(operator);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc Delete an operator
// @route DELETE /api/operators/:id
exports.deleteOperator = async (req, res) => {
  try {
    const operator = await Operator.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!operator) return res.status(404).json({ message: 'Operator not found or not owned by you' });
    res.json({ message: 'Operator deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
