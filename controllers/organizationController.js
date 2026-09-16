const { Organization, User, Role, OrganizationMembers } = require('../models');

// 1. Create Organization
exports.createOrganization = async (req, res) => {
  try {
    const { Name, Email, Logo, Theme, OwnerID } = req.body;

    // Check if Owner exists (if provided)
    if (OwnerID) {
      const ownerUser = await User.findByPk(OwnerID);
      if (!ownerUser) {
        return res.status(404).json({ message: 'Owner user not found' });
      }
    }

    const newOrg = await Organization.create({
      Name,
      Email,
      Logo,
      Theme: Theme || 'light',
      OwnerID: OwnerID || null,
    });

    // If OwnerID provided, automatically assign them as Owner in OrganizationMembers
    if (OwnerID) {
      await User.update({ OrganizationID: newOrg.OrganizationID }, { where: { UserID: OwnerID } });

      let ownerRole = await Role.findOne({ where: { RoleName: 'Owner' } });
      if (!ownerRole) {
        ownerRole = await Role.create({ RoleName: 'Owner', Description: 'Full Organization Control' });
      }

      await OrganizationMembers.create({
        OrganizationID: newOrg.OrganizationID,
        UserID: OwnerID,
        RoleID: ownerRole.RoleID,
      });
    }

    res.status(201).json({ message: 'Organization created successfully!', organization: newOrg });
  } catch (error) {
    res.status(500).json({ message: 'Error creating organization', error: error.message });
  }
};

// 2. Get All Organizations
exports.getAllOrganizations = async (req, res) => {
  try {
    const orgs = await Organization.findAll({
      include: [
        { model: User, as: 'Owner', attributes: ['UserID', 'Name', 'Email'] }
      ]
    });
    res.status(200).json(orgs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching organizations', error: error.message });
  }
};

// 3. Update Organization (Name, Email, Logo, Theme, OwnerID)
exports.updateOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Email, Logo, Theme, OwnerID } = req.body;

    const org = await Organization.findByPk(id);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    if (OwnerID) {
      const ownerUser = await User.findByPk(OwnerID);
      if (!ownerUser) {
        return res.status(404).json({ message: 'Owner user not found' });
      }
    }

    await org.update({
      Name: Name ?? org.Name,
      Email: Email ?? org.Email,
      Logo: Logo ?? org.Logo,
      Theme: Theme ?? org.Theme,
      OwnerID: OwnerID !== undefined ? OwnerID : org.OwnerID,
    });

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

// 5. Assign User to Org (with Role)
exports.assignUserToOrg = async (req, res) => {
  try {
    const { UserID, OrganizationID, RoleID } = req.body;

    const user = await User.findByPk(UserID);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const org = await Organization.findByPk(OrganizationID);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    if (RoleID) {
      const role = await Role.findByPk(RoleID);
      if (!role) return res.status(404).json({ message: 'Role not found' });
    }

    // Update Direct Link in User table
    await user.update({ OrganizationID });

    // Check if membership already exists, else create/update
    const existingMember = await OrganizationMembers.findOne({
      where: { UserID, OrganizationID }
    });

    if (existingMember) {
      await existingMember.update({ RoleID: RoleID || existingMember.RoleID });
    } else {
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

    await OrganizationMembers.destroy({
      where: { UserID, OrganizationID }
    });

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

    // 1. Update OwnerID column on Organization
    await org.update({ OwnerID: NewOwnerUserID });
    await newOwner.update({ OrganizationID });

    // 2. Get or Create Owner Role
    let ownerRole = await Role.findOne({ where: { RoleName: 'Owner' } });
    if (!ownerRole) {
      ownerRole = await Role.create({ RoleName: 'Owner', Description: 'Full Organization Control' });
    }

    // 3. Update new owner's role in OrganizationMembers
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

    res.status(200).json({ message: 'Organization ownership transferred successfully!', organization: org });
  } catch (error) {
    res.status(500).json({ message: 'Error transferring ownership', error: error.message });
  }
};