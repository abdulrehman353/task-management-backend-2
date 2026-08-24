const { User } = require('../models');

// 1. Get All Users        
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['Password'] } // Password hide rahega
    });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// 2. Get User By ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['Password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};