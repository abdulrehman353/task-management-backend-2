const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, sequelize } = require('../models');

// 1. SIGNUP API
exports.signup = async (req, res) => {
  try {
    const { Name, Email, Password, Date_of_birth } = req.body;

    const existingUser = await User.findOne({ where: { Email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const newUser = await User.create({
      Name,
      Email,
      Password: hashedPassword,
      Date_of_birth: Date_of_birth || null,
    }); 

    res.status(201).json({
      message: 'User registered successfully!',
      user: { UserID: newUser.UserID || newUser.id, Name: newUser.Name, Email: newUser.Email },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error during signup', error: error.message });
  }
};

// 2. LOGIN API (Exact OrganizationMembers & Roles query)
exports.login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    const user = await User.findOne({ where: { Email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const activeUserId = user.UserID || user.id;

    // Database se OrganizationMembers aur Roles ka data fetch karein
    let roleName = null;
    let roleId = null;
    let orgId = user.OrganizationID || null;

    try {
      const [roleResults] = await sequelize.query(`
        SELECT r.RoleID, r.RoleName, om.OrganizationID
        FROM Roles r
        JOIN OrganizationMembers om ON r.RoleID = om.RoleID
        WHERE om.UserID = :userId
        ORDER BY om.OrganizationMemberID DESC
        LIMIT 1
      `, {
        replacements: { userId: activeUserId }
      });

      if (roleResults && roleResults.length > 0) {
        roleName = roleResults[0].RoleName;
        roleId = roleResults[0].RoleID;
        orgId = roleResults[0].OrganizationID || orgId;
      }
    } catch (err) {
      // Fallback in case of lowercase table names
      try {
        const [fallbackResults] = await sequelize.query(`
          SELECT r.RoleID, r.RoleName, om.OrganizationID
          FROM roles r
          JOIN organizationmembers om ON r.RoleID = om.RoleID
          WHERE om.UserID = :userId
          ORDER BY om.OrganizationMemberID DESC
          LIMIT 1
        `, {
          replacements: { userId: activeUserId }
        });
        if (fallbackResults && fallbackResults.length > 0) {
          roleName = fallbackResults[0].RoleName;
          roleId = fallbackResults[0].RoleID;
          orgId = fallbackResults[0].OrganizationID || orgId;
        }
      } catch (e) {
        console.warn("Role fetch fallback warning:", e.message);
      }
    }

    // JWT Token with dynamic role payload
    const token = jwt.sign(
      { 
        UserID: activeUserId, 
        Email: user.Email,
        RoleName: roleName,
        RoleID: roleId,
        OrganizationID: orgId
      },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: { 
        UserID: activeUserId, 
        Name: user.Name, 
        Email: user.Email,
        OrganizationID: orgId,
        RoleName: roleName,
        RoleID: roleId
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error during login', error: error.message });
  }
};

// 3. FORGOT PASSWORD API
exports.forgotPassword = async (req, res) => {
  try {
    const { Email, email } = req.body;
    const targetEmail = Email || email;

    if (!targetEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { Email: targetEmail } });
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    const secret = (process.env.JWT_SECRET || 'supersecretkey') + user.Password;
    const resetToken = jwt.sign(
      { UserID: user.UserID || user.id, Email: user.Email },
      secret,
      { expiresIn: '15m' }
    );

    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}&id=${user.UserID || user.id}`;

    res.status(200).json({
      message: 'Password reset link generated successfully!',
      resetToken,
      resetLink,
      expiresIn: '15 minutes'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error during forgot password', error: error.message });
  }
};

// 4. RESET PASSWORD API
exports.resetPassword = async (req, res) => {
  try {
    const { token, resetToken, userId, UserID, newPassword, NewPassword, Password, password } = req.body;
    
    const activeToken = token || resetToken;
    const targetUserId = userId || UserID;
    const targetPassword = newPassword || NewPassword || Password || password;

    if (!activeToken || !targetUserId || !targetPassword) {
      return res.status(400).json({ 
        message: 'Token, UserID, and New Password are required' 
      });
    }

    const user = await User.findByPk(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const secret = (process.env.JWT_SECRET || 'supersecretkey') + user.Password;
    try {
      jwt.verify(activeToken, secret);
    } catch (tokenErr) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(targetPassword, 10);
    user.Password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: 'Password has been reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error during reset password', error: error.message });
  }
};