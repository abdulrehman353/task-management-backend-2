const { Ticket, Project, User } = require('../models');
const minioClient = require('../config/minioClient');

const uploadToMinIO = async (file) => {
  const bucketName = process.env.MINIO_BUCKET_NAME || 'task-attachments';
  const fileName = `tickets/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

  await minioClient.putObject(
    bucketName,
    fileName,
    file.buffer,
    file.size,
    { 'Content-Type': file.mimetype }
  );

  return `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${bucketName}/${fileName}`;
};

// 1. Create Ticket (With MinIO File Upload Support)
exports.createTicket = async (req, res) => {
  try {
    const { Title, Description, Status, Priority, ProjectID, AssignedToUserID } = req.body;

    // Check if Project exists
    const project = await Project.findByPk(ProjectID);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    let attachmentUrl = null;


    if (req.file) {
      attachmentUrl = await uploadToMinIO(req.file);
    } else if (req.body.Attachment) {
      attachmentUrl = req.body.Attachment;
    }

    const ticket = await Ticket.create({
      Title,
      Description,
      Status: Status || 'to do',
      Priority: Priority || 'medium',
      ProjectID,
      AssignedToUserID: AssignedToUserID || null,
      Attachment: attachmentUrl,
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

// 3. Update Ticket
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { Title, Description, Status, Priority, AssignedToUserID } = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    let attachmentUrl = ticket.Attachment;

    
    if (req.file) {
      attachmentUrl = await uploadToMinIO(req.file);
    } else if (req.body.Attachment !== undefined) {
      attachmentUrl = req.body.Attachment;
    }

    await ticket.update({
      Title: Title || ticket.Title,
      Description: Description || ticket.Description,
      Status: Status || ticket.Status,
      Priority: Priority || ticket.Priority,
      AssignedToUserID: AssignedToUserID || ticket.AssignedToUserID,
      Attachment: attachmentUrl
    });

    res.status(200).json({ message: 'Ticket updated successfully', ticket });
  } catch (error) {
    res.status(500).json({ message: 'Error updating ticket', error: error.message });
  }
};

// 4. Attach Image (Direct File Upload to MinIO)
exports.attachImage = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    let attachmentUrl = null;

    if (req.file) {mentUrl = await uploadToMinIO(req.file);
    } else if (req.body.Attachment) {
      attachmentUrl = req.body.Attachment;
    } else {
      return res.status(400).json({ message: 'Please provide an image file or Attachment URL' });
    }

    await ticket.update({ Attachment: attachmentUrl });
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

// Allowed transitions mapping
const ALLOWED_TRANSITIONS = {
  'to do': ['in progress', 'blocked'],
  'todo': ['in progress', 'blocked'],
  'in progress': ['to do', 'blocked', 'testing'],
  'blocked': ['to do', 'in progress'],
  'testing': ['in progress', 'done'],
  'done': [] // Done ticket cannot be moved
};

exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Check if ticket exists
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const currentStatus = ticket.Status;
    const nextStatus = status?.toLowerCase();

    // 2. Validate if provided status is a valid status
    const validStatuses = Object.keys(ALLOWED_TRANSITIONS);
    if (!validStatuses.includes(nextStatus)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    // 3. Check if transition is allowed
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(nextStatus)) {
      return res.status(400).json({
        message: `Cannot move ticket from '${currentStatus}' to '${nextStatus}'. Allowed moves: [${allowedNext.join(', ')}]`
      });
    }

    // 4. Update status
    ticket.Status = nextStatus;
    await ticket.save();

    res.status(200).json({
      message: `Ticket status successfully updated to '${nextStatus}'`,
      ticket
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ message: 'Error updating ticket status', error: error.message });
  }
};
