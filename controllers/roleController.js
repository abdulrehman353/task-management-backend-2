const { Role, User, Permissions, OrganizationMembers } = require('../models');

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

// 5. Assign Role to User (Updated: Ab ye OrganizationMembers table me save karega)
exports.assignRoleToUser = async (req, res) => {
  try {
    const targetUserId = req.body.UserID || req.body.userId;
    const targetRoleId = req.body.RoleID || req.body.roleId;
    const targetOrgId = req.body.OrganizationID || req.body.organizationId || 1;

    if (!targetUserId || !targetRoleId) {
      return res.status(400).json({ message: 'UserID and RoleID are required' });
    }

    const user = await User.findByPk(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = await Role.findByPk(targetRoleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // OrganizationMembers table me dhoondein ya naya create karein
    let member = await OrganizationMembers.findOne({
      where: { UserID: targetUserId }
    });

    if (member) {
      await member.update({ RoleID: targetRoleId, OrganizationID: member.OrganizationID || targetOrgId });
    } else {
      await OrganizationMembers.create({
        OrganizationID: targetOrgId,
        UserID: targetUserId,
        RoleID: targetRoleId
      });
    }

    return res.status(200).json({
      message: `Role '${role.RoleName}' assigned to user '${user.Name}' successfully!`,
      user: {
        UserID: user.UserID || user.id,
        Name: user.Name,
        Email: user.Email,
        RoleID: targetRoleId,
        RoleName: role.RoleName
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error assigning role', error: error.message });
  }
};

// Remove Role from User
exports.removeRoleFromUser = async (req, res) => {
  try {
    const { UserID, OrganizationID } = req.body;

    const member = await OrganizationMembers.findOne({
      where: { UserID, OrganizationID }
    });

    if (!member) {
      return res.status(404).json({ message: 'User not found in the organization' });
    }

    await member.update({ RoleID: null });

    return res.status(200).json({ message: 'Role removed from user successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error removing role', error: error.message });
  }
};

// Get All Permissions Assigned to a Role (Many-to-Many include)
exports.getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [
        {
          model: Permissions,
          as: 'permissions',
          attributes: ['PermissionID', 'PermissionName'],
          through: { attributes: [] }
        }
      ]
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    return res.status(200).json({
      role: role.RoleName,
      permissions: role.permissions || []
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching permissions for role', error: error.message });
  }
};