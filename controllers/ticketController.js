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

// Helpers to sanitize incoming UI values to match exact MySQL ENUM definitions
const normalizeStatus = (val) => {
  const s = (val || '').toLowerCase().trim();
  if (s === 'ready to do' || s === 'ready_to_do' || s === 'todo' || s === 'to do') return 'todo';
  if (s === 'in progress' || s === 'in_progress') return 'in_progress';
  if (s === 'blocked') return 'blocked';
  if (s === 'testing') return 'testing';
  if (s === 'done') return 'done';
  return 'todo';
};

const normalizePriority = (val) => {
  const p = (val || '').toLowerCase().trim();
  if (['low', 'medium', 'high'].includes(p)) return p;
  return 'medium';
};

// Allowed transitions mapping based on MySQL ENUMs
const ALLOWED_TRANSITIONS = {
  'todo': ['in_progress', 'blocked'],
  'in_progress': ['todo', 'blocked', 'testing'],
  'blocked': ['todo', 'in_progress'],
  'testing': ['in_progress', 'done'],
  'done': []
};

// 1. Create Ticket
exports.createTicket = async (req, res) => {
  try {
    const { 
      Title, 
      title, 
      Description, 
      description, 
      Status, 
      status, 
      Priority, 
      priority, 
      ProjectID, 
      project_id, 
      AssignedToUserID, 
      AssignedTo,
      assigned_to 
    } = req.body;

    const targetTitle = Title || title;
    const targetDesc = Description || description;
    const targetProjectId = ProjectID || project_id;
    const currentUserId = req.user?.UserID || req.user?.id || 1;

    if (!targetTitle) {
      return res.status(400).json({ message: 'Ticket title is required' });
    }

    // Check if Project exists
    if (targetProjectId) {
      const project = await Project.findByPk(targetProjectId);
      if (!project) {
        return res.status(404).json({ message: `Project #${targetProjectId} not found` });
      }
    }

    let attachmentUrl = null;
    if (req.file) {
      attachmentUrl = await uploadToMinIO(req.file);
    } else if (req.body.Attachment || req.body.attachment_url) {
      attachmentUrl = req.body.Attachment || req.body.attachment_url;
    }

    const finalStatus = normalizeStatus(Status || status);
    const finalPriority = normalizePriority(Priority || priority);
    const assignedUser = AssignedToUserID || AssignedTo || assigned_to || null;

    const ticket = await Ticket.create({
      Title: targetTitle,
      Description: targetDesc,
      Status: finalStatus,
      Priority: finalPriority,
      ProjectID: targetProjectId ? Number(targetProjectId) : null,
      AssignedToUserID: assignedUser ? Number(assignedUser) : null,
      Attachment: attachmentUrl,
      CreatedByUserID: currentUserId
    });

    return res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({ message: 'Error creating ticket', error: error.message });
  }
};

// 2. Get All Tickets
exports.getAllTickets = async (req, res) => {
  try {
    const projectIdFilter = req.query.ProjectID || req.query.projectId;
    const whereCondition = projectIdFilter ? { ProjectID: projectIdFilter } : {};

    const tickets = await Ticket.findAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ message: 'Error fetching tickets', error: error.message });
  }
};

// 3. Update Ticket (Fixed ProjectID Assignment)
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      Title, 
      title, 
      Description, 
      description, 
      Status, 
      status, 
      Priority, 
      priority, 
      ProjectID,
      project_id,
      AssignedToUserID, 
      AssignedTo, 
      assigned_to 
    } = req.body;

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

    const assignedUser = AssignedToUserID ?? AssignedTo ?? assigned_to ?? ticket.AssignedToUserID;
    const targetProjectId = ProjectID !== undefined ? ProjectID : (project_id !== undefined ? project_id : ticket.ProjectID);

    await ticket.update({
      Title: Title ?? title ?? ticket.Title,
      Description: Description ?? description ?? ticket.Description,
      Status: Status || status ? normalizeStatus(Status || status) : ticket.Status,
      Priority: Priority || priority ? normalizePriority(Priority || priority) : ticket.Priority,
      ProjectID: targetProjectId ? Number(targetProjectId) : null,
      AssignedToUserID: assignedUser ? Number(assignedUser) : null,
      Attachment: attachmentUrl
    });

    return res.status(200).json({ message: 'Ticket updated successfully', ticket });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return res.status(500).json({ message: 'Error updating ticket', error: error.message });
  }
};

// 4. Attach Image
exports.attachImage = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    let attachmentUrl = null;
    if (req.file) {
      attachmentUrl = await uploadToMinIO(req.file);
    } else if (req.body.Attachment || req.body.image) {
      attachmentUrl = req.body.Attachment || req.body.image;
    } else {
      return res.status(400).json({ message: 'Please provide an image file or Attachment URL' });
    }

    await ticket.update({ Attachment: attachmentUrl });
    return res.status(200).json({ message: 'Image attached successfully', ticket });
  } catch (error) {
    console.error('Error attaching image:', error);
    return res.status(500).json({ message: 'Error attaching image', error: error.message });
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
    return res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return res.status(500).json({ message: 'Error deleting ticket', error: error.message });
  }
};

// 6. Status State Transitions (Fixed for MySQL ENUMs)
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, Status } = req.body;

    console.log(`[PATCH Status] Ticket #${id} request to change to:`, status || Status);

    // 1. Check if ticket exists
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Clean input status to match MySQL ENUM
    const rawNext = (status || Status || '').toLowerCase().trim();
    let nextStatus = rawNext;
    if (rawNext === 'ready to do' || rawNext === 'to do') nextStatus = 'todo';
    if (rawNext === 'in progress') nextStatus = 'in_progress';

    // Clean current ticket status
    let currentStatus = (ticket.Status || 'todo').toLowerCase().trim();
    if (currentStatus === 'ready to do' || currentStatus === 'to do') currentStatus = 'todo';
    if (currentStatus === 'in progress') currentStatus = 'in_progress';

    // Allowed transition map matching MySQL ENUM keys
    const allowedTransitions = {
      'todo': ['in_progress', 'blocked'],
      'in_progress': ['todo', 'blocked', 'testing'],
      'blocked': ['todo', 'in_progress'],
      'testing': ['in_progress', 'done'],
      'done': ['todo', 'in_progress']
    };

    if (currentStatus === nextStatus) {
      return res.status(200).json({ message: 'Status already up to date', ticket });
    }

    const allowedNext = allowedTransitions[currentStatus] || [];
    if (!allowedNext.includes(nextStatus)) {
      return res.status(400).json({
        message: `Cannot move ticket from '${currentStatus}' to '${nextStatus}'. Allowed moves: [${allowedNext.join(', ')}]`
      });
    }

    // 2. Save into database
    ticket.Status = nextStatus;
    await ticket.save();

    console.log(`[PATCH Status] Ticket #${id} updated successfully to: ${nextStatus}`);

    return res.status(200).json({
      message: `Ticket status successfully updated to '${nextStatus}'`,
      ticket
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return res.status(500).json({ message: 'Error updating ticket status', error: error.message });
  }
};