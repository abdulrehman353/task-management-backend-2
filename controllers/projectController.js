const { Project, Organization, User } = require('../models');

// 1. Create Project
exports.createProject = async (req, res) => {
  try {
    const { Name, Description, StartDate, EndDate, OrganizationID } = req.body;
    
    // Check if Organization exists
    const org = await Organization.findByPk(OrganizationID);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const project = await Project.create({
      Name,
      Description,
      StartDate,
      EndDate,
      OrganizationID,
      CreatedBy: req.user.id 
    });

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
};

// 2. Get All Projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        { model: Organization, attributes: ['OrganizationID', 'Name'] },
        { model: User, attributes: ['UserID', 'Name', 'Email'] }
      ]
    });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
};

// 3. Update Project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { Name, Description, StartDate, EndDate } = req.body;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.update({ Name, Description, StartDate, EndDate });
    res.status(200).json({ message: 'Project updated successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
};

// 4. Delete Project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.destroy();
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
};