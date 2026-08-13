const { Ticket, Project, User } = require('../models');

// 1. Create Ticket
exports.createTicket = async (req, res) => {
  try {
    const { Title, Description, Status, Priority, ProjectID, AssignedToUserID, Attachment } = req.body;

    // Check if Project exists
    const project = await Project.findByPk(ProjectID);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const ticket = await Ticket.create({
      Title,
      Description,
      Status,
      Priority,
      ProjectID,
      AssignedToUserID,
      Attachment,
      CreatedByUserID: req.user.id
    });

    res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error creating ticket', error: error.message });
  }
};

// 2. Get All Tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        { 
          model: Project, 
          attributes: ['ProjectID', 'Name'] 
        },
        { 
          model: User, 
          as: 'AssignedUser', 
          attributes: ['UserID', 'Name', 'Email'] 
        },
        { 
          model: User, 
          as: 'Creator', 
          attributes: ['UserID', 'Name', 'Email'] 
        }
      ]
    });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
};

// 3. Update Ticket (Includes Updating Status/Details & Assigning Users)
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { Title, Description, Status, Priority, AssignedToUserID, Attachment } = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await ticket.update({
      Title: Title || ticket.Title,
      Description: Description || ticket.Description,
      Status: Status || ticket.Status,
      Priority: Priority || ticket.Priority,
      AssignedToUserID: AssignedToUserID || ticket.AssignedToUserID,
      Attachment: Attachment || ticket.Attachment
    });

    res.status(200).json({ message: 'Ticket updated successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket', error: error.message });
  }
};

// 4. Attach Image URL to Ticket
exports.attachImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { Attachment } = req.body; 

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await ticket.update({ Attachment });
    res.status(200).json({ message: 'Image attached successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error attaching image', error: error.message });
  }
};

// 5. Delete Ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await ticket.destroy();
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting ticket', error: error.message });
  }
};