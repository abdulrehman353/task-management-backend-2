const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload'); // Multer Memory Storage Middleware

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management endpoints
 */

/**
 * @swagger
 * /api/tickets:
 *   post:
 *     summary: Create a new ticket (with optional file upload)
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - Title
 *               - ProjectID
 *             properties:
 *               Title:
 *                 type: string
 *               Description:
 *                 type: string
 *               Status:
 *                 type: string
 *                 enum: [to do, in_progress, blocked, testing, done]
 *               Priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               ProjectID:
 *                 type: integer
 *               AssignedToUserID:
 *                 type: integer
 *               Attachment:
 *                 type: string
 *                 format: binary
 *                 description: Image/attachment file to upload
 *     responses:
 *       201:
 *         description: Ticket created successfully
 */
router.post('/', authMiddleware, upload.single('Attachment'), ticketController.createTicket);

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get all tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tickets
 */
router.get('/', authMiddleware, ticketController.getAllTickets);

/**
 * @swagger
 * /api/tickets/{id}:
 *   put:
 *     summary: Update ticket details or assign user
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *               Description:
 *                 type: string
 *               Status:
 *                 type: string
 *                 enum: [to do, in_progress, blocked, testing, done]
 *               Priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               AssignedToUserID:
 *                 type: integer
 *               Attachment:
 *                 type: string
 *                 format: binary
 *                 description: Optional new image to replace
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 */
router.put('/:id', authMiddleware, upload.single('Attachment'), ticketController.updateTicket);

/**
 * @swagger
 * /api/tickets/{id}/attach-image:
 *   post:
 *     summary: Attach image file to an existing ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - Attachment
 *             properties:
 *               Attachment:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Image attached successfully
 */
router.post('/:id/attach-image', authMiddleware, upload.single('Attachment'), ticketController.attachImage);

/**
 * @swagger
 * /api/tickets/{id}:
 *   delete:
 *     summary: Delete a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 */
router.delete('/:id', authMiddleware, ticketController.deleteTicket);

/**
 * @swagger
 * /api/tickets/{id}/status:
 *   patch:
 *     summary: Update ticket status workflow
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [to do, in progress, blocked, testing, done]
 *                 example: in progress
 *     responses:
 *       200:
 *         description: Ticket status successfully updated
 *       400:
 *         description: Invalid status transition
 *       404:
 *         description: Ticket not found
 */
router.patch('/:id/status', authMiddleware, ticketController.updateTicketStatus);

module.exports = router;