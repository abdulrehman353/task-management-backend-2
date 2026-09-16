const {
  Project,
  Organization,
  User,
  OrganizationMembers,
  Role,
  Permissions
} = require('../models');

// ==========================================
// 1. CREATE PROJECT
// ==========================================
exports.createProject = async (req, res) => {
  try {
    console.log('--- [POST /api/projects Debug] ---');
    console.log('Decoded Token (req.user):', req.user);
    console.log('Request Body:', req.body);

    const {
      Name,
      Description,
      StartDate,
      EndDate,
      OrganizationID,
      OrgID,
      org_id
    } = req.body;

    const targetOrgId = OrganizationID || OrgID || org_id;

    // Get logged-in user's ID from JWT
    const currentUserId = req.user?.UserID;

    console.log('Extracted User ID:', currentUserId);

    if (!currentUserId) {
      return res.status(401).json({
        message: 'Unauthorized: User ID missing from token'
      });
    }

    // ==========================================
    // CHECK ORGANIZATION
    // ==========================================
    const org = await Organization.findByPk(targetOrgId);

    if (!org) {
      return res.status(404).json({
        message: 'Organization not found'
      });
    }

    // ==========================================
    // CHECK USER + ROLE + PERMISSION
    // ==========================================
    const member = await OrganizationMembers.findOne({
      where: {
        OrganizationID: targetOrgId,
        UserID: currentUserId
      },
      include: [
        {
          model: Role,
          include: [
            {
              model: Permissions
            }
          ]
        }
      ]
    });

    console.log(
      'Organization Member:',
      member ? member.toJSON() : null
    );

    // User organization ka member nahi hai
    if (!member) {
      return res.status(403).json({
        message: 'You are not a member of this organization'
      });
    }

    // User ka role nahi hai
    if (!member.Role) {
      return res.status(403).json({
        message: 'No role assigned to this user'
      });
    }

    // ==========================================
    // CHECK CREATE PROJECT PERMISSION
    // ==========================================
    const permissions = member.Role.Permissions || [];

    const hasCreateProjectPermission = permissions.some(permission => {
      const permissionName = permission.PermissionName
        .toLowerCase()
        .replace(/[\s-]+/g, '_');

      return permissionName === 'create_project';
    });

    console.log(
      'Create Project Permission:',
      hasCreateProjectPermission
    );

    if (!hasCreateProjectPermission) {
      return res.status(403).json({
        message: 'You do not have permission to create projects'
      });
    }

    // ==========================================
    // CREATE PROJECT
    // ==========================================
    const project = await Project.create({
      Name,
      Description,
      StartDate,
      EndDate,
      OrganizationID: targetOrgId,
      CreatedBy: currentUserId
    });

    console.log(
      'Project Created Successfully:',
      project.toJSON()
    );

    return res.status(201).json({
      message: 'Project created successfully',
      project
    });

  } catch (error) {
    console.error('Error in createProject:', error);

    return res.status(500).json({
      message: 'Error creating project',
      error: error.message
    });
  }
};


// ==========================================
// 2. GET ALL PROJECTS
// ==========================================
exports.getAllProjects = async (req, res) => {
  try {
    console.log('--- [GET /api/projects Debug] ---');

    const orgFilter = req.query.OrganizationID || req.query.OrgID || req.query.org_id;
    const whereCondition = orgFilter ? { OrganizationID: orgFilter } : {};

    const projects = await Project.findAll({
      where: whereCondition,
      include: [
        {
          model: Organization,
          attributes: ['OrganizationID', 'Name']
        },
        {
          model: User,
          attributes: ['UserID', 'Name', 'Email']
        }
      ]
    });

    console.log('Fetched Projects Count:', projects.length);

    return res.status(200).json(projects);

  } catch (error) {
    console.error('Error in getAllProjects:', error);

    return res.status(500).json({
      message: 'Error fetching projects',
      error: error.message
    });
  }
};


// ==========================================
// 3. UPDATE PROJECT (Fixed OrganizationID Assignment)
// ==========================================
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      Name,
      Description,
      StartDate,
      EndDate,
      OrganizationID,
      OrgID,
      org_id
    } = req.body;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    const targetOrgId = OrganizationID ?? OrgID ?? org_id ?? project.OrganizationID;

    await project.update({
      Name: Name ?? project.Name,
      Description: Description ?? project.Description,
      StartDate: StartDate ?? project.StartDate,
      EndDate: EndDate ?? project.EndDate,
      OrganizationID: targetOrgId
    });

    return res.status(200).json({
      message: 'Project updated successfully',
      project
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error updating project',
      error: error.message
    });
  }
};


// ==========================================
// 4. DELETE PROJECT
// ==========================================
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({
        message: 'Project not found'
      });
    }

    await project.destroy();

    return res.status(200).json({
      message: 'Project deleted successfully'
    });

  } catch (error) {
    return res.status(500).json({
      message: 'Error deleting project',
      error: error.message
    });
  }
};