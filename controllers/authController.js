const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 1. SIGNUP API
exports.signup = async (req, res) => {
  try {
    const { Name, Email, Password, Date_of_birth } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { Email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Password Hash (Security)
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Save User to DB
    const newUser = await User.create({
      Name,
      Email,
      Password: hashedPassword,
      Date_of_birth: Date_of_birth || null,
    }); 

    res.status(201).json({
      message: 'User registered successfully!',
      user: { UserID: newUser.UserID, Name: newUser.Name, Email: newUser.Email },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error during signup', error: error.message });
  }
};

// 2. LOGIN API
exports.login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { Email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { UserID: user.UserID, Email: user.Email },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: { UserID: user.UserID, Name: user.Name, Email: user.Email },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error during login', error: error.message });
  }
};