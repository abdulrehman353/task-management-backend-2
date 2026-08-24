const { Role, User } = require('../models');

// 1. Create Role
exports.createRole = async (req, res) => {
  try {
    const { RoleName, Description } = req.body;

    if (!RoleName) {
      return res.status(400).json({ message: 'RoleName is required' });
    }

    const existingRole = await Role.findOne({ where: { RoleName } });
    if (existingRole) {
      return res.status(400).json({ message: 'Role already exists' });
    }

    const role = await Role.create({ RoleName, Description });
    return res.status(201).json({ message: 'Role created successfully', role });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating role', error: error.message });
  }
};

// 2. Get All Roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    return res.status(200).json(roles);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching roles', error: error.message });
  }
};

// 3. Update Role
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { RoleName, Description } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    await role.update({ RoleName, Description });
    return res.status(200).json({ message: 'Role updated successfully', role });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating role', error: error.message });
  }
};

// 4. Delete Role
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    await role.destroy();
    return res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting role', error: error.message });
  }
};

// 5. Assign Role to User
exports.assignRoleToUser = async (req, res) => {
  try {
    const { UserID, RoleID } = req.body;

    if (!UserID || !RoleID) {
      return res.status(400).json({ message: 'UserID and RoleID are required' });
    }

    const user = await User.findByPk(UserID);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = await Role.findByPk(RoleID);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    await user.update({ RoleID });

    return res.status(200).json({
      message: `Role '${role.RoleName}' assigned to user '${user.Name}' successfully!`,
      user: {
        UserID: user.UserID || user.id,
        Name: user.Name,
        Email: user.Email,
        RoleID: user.RoleID,
        RoleName: role.RoleName
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error assigning role', error: error.message });
  }
};