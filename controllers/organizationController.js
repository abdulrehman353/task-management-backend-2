const { Organization, User, Role, OrganizationMembers } = require('../models');

// 1. Create Organization
exports.createOrganization = async (req, res) => {
  try {
    const { Name, Email, Logo, Theme } = req.body;
    const newOrg = await Organization.create({
      Name,
      Email,
      Logo,
      Theme: Theme || 'light',
    });
    res.status(201).json({ message: 'Organization created successfully!', organization: newOrg });
  } catch (error) {
    res.status(500).json({ message: 'Error creating organization', error: error.message });
  }
};

// 2. Get All Organizations
exports.getAllOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.findAll();
    res.status(200).json(orgs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organizations', error: error.message });
  }
};

// 3. Update Organization
exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const org = await Organization.findByPk(id);

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    await org.update(req.body);
    res.status(200).json({ message: 'Organization updated successfully!', organization: org });
  } catch (error) {
    res.status(500).json({ message: 'Error updating organization', error: error.message });
  }
};

// 4. Delete Organization
exports.deleteOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const org = await Organization.findByPk(id);

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    await org.destroy();
    res.status(200).json({ message: 'Organization deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting organization', error: error.message });
  }
};

// 5. Assign User to Org
exports.assignUserToOrg = async (req, res) => {
  try {
    const { UserID, OrganizationID, RoleID } = req.body;

    const user = await User.findByPk(UserID);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const org = await Organization.findByPk(OrganizationID);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    // User table update
    await user.update({ OrganizationID });

    // OrganizationMembers table entry
    if (OrganizationMembers) {
      await OrganizationMembers.create({
        OrganizationID,
        UserID,
        RoleID: RoleID || null
      });
    }

    res.status(200).json({ message: 'User assigned to organization successfully!', user });
  } catch (error) {
    res.status(500).json({ message: 'Error assigning user to organization', error: error.message });
  }
};

// 6. Remove User from Org
exports.removeUserFromOrg = async (req, res) => {
  try {
    const { UserID, OrganizationID } = req.body;

    const user = await User.findByPk(UserID);
    if (user && user.OrganizationID === OrganizationID) {
      await user.update({ OrganizationID: null });
    }

    if (OrganizationMembers) {
      await OrganizationMembers.destroy({
        where: { UserID, OrganizationID }
      });
    }

    res.status(200).json({ message: 'User removed from organization successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing user from organization', error: error.message });
  }
};

// 7. Transfer Org Ownership
exports.transferOrgOwner = async (req, res) => {
  try {
    const { OrganizationID, NewOwnerUserID } = req.body;

    const org = await Organization.findByPk(OrganizationID);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const newOwner = await User.findByPk(NewOwnerUserID);
    if (!newOwner) return res.status(404).json({ message: 'New owner user not found' });

    await newOwner.update({ OrganizationID });

    let ownerRole = await Role.findOne({ where: { RoleName: 'Owner' } });
    if (!ownerRole) {
      ownerRole = await Role.create({ RoleName: 'Owner', Description: 'Full Organization Control' });
    }

    if (OrganizationMembers) {
      const member = await OrganizationMembers.findOne({ where: { OrganizationID, UserID: NewOwnerUserID } });
      if (member) {
        await member.update({ RoleID: ownerRole.RoleID });
      } else {
        await OrganizationMembers.create({
          OrganizationID,
          UserID: NewOwnerUserID,
          RoleID: ownerRole.RoleID
        });
      }
    }

    res.status(200).json({ message: 'Organization ownership transferred successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error transferring ownership', error: error.message });
  }
};

// 8. Create Role
exports.createRole = async (req, res) => {
  try {
    const { RoleName, Description } = req.body;

    const newRole = await Role.create({ RoleName, Description });
    res.status(201).json({ message: 'Role created successfully!', role: newRole });
  } catch (error) {
    res.status(500).json({ message: 'Error creating role', error: error.message });
  }
};

// 9. Assign Role to User
exports.assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId, organizationId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({ message: 'userId and roleId are required' });
    }

    // User check 
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Role check 
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Assign role to user
    user.RoleId = roleId;
    if (organizationId) {
      user.OrganizationID = organizationId;
    }
    await user.save();

    return res.status(200).json({
      message: `Role '${role.RoleName}' assigned to user '${user.Name}' successfully!`,
      user: {
        id: user.UserID || user.id,
        name: user.Name,
        email: user.Email,
        role: role.RoleName,
        organizationId: user.OrganizationID
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error assigning role', error: error.message });
  }
};