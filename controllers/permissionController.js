const { Permissions, Role } = require('../models');

// 1. Create Permission
exports.createPermission = async (req, res) => {
  try {
    const { PermissionName } = req.body;

    if (!PermissionName) {
      return res.status(400).json({ message: 'PermissionName is required' });
    }

    const existingPerm = await Permissions.findOne({ where: { PermissionName } });
    if (existingPerm) {
      return res.status(400).json({ message: 'Permission already exists' });
    }

    const permission = await Permissions.create({ PermissionName });
    return res.status(201).json({ message: 'Permission created successfully', permission });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating permission', error: error.message });
  }
};

// 2. Get All Permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permissions.findAll();
    return res.status(200).json(permissions);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching permissions', error: error.message });
  }
};

// 3. Update Permission
exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { PermissionName } = req.body;

    const permission = await Permissions.findByPk(id);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    await permission.update({ PermissionName });
    return res.status(200).json({ message: 'Permission updated successfully', permission });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating permission', error: error.message });
  }
};

// 4. Delete Permission
exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await Permissions.findByPk(id);

    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    await permission.destroy();
    return res.status(200).json({ message: 'Permission deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting permission', error: error.message });
  }
};

// 5. Assign Permission to Role
exports.assignPermissionToRole = async (req, res) => {
  try {
    const { RoleID, PermissionID } = req.body;

    if (!RoleID || !PermissionID) {
      return res.status(400).json({ message: 'RoleID and PermissionID are required' });
    }

    const role = await Role.findByPk(RoleID);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    const permission = await Permissions.findByPk(PermissionID);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    // Sequelize association helper
    if (role.addPermission) {
      await role.addPermission(permission);
    }

    return res.status(200).json({
      message: `Permission '${permission.PermissionName}' assigned to Role '${role.RoleName}' successfully!`
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error assigning permission', error: error.message });
  }
};                                                          