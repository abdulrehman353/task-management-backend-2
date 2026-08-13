const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');

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
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *                 enum: [todo, in_progress, done]
 *               Priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               ProjectID:
 *                 type: integer
 *               AssignedToUserID:
 *                 type: integer
 *               Attachment:
 *                 type: string
 *                 description: Image URL text string
 *     responses:
 *       201:
 *         description: Ticket created successfully
 */
router.post('/', authMiddleware, ticketController.createTicket);

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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *               Description:
 *                 type: string
 *               Status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *               Priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               AssignedToUserID:
 *                 type: integer
 *               Attachment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 */
router.put('/:id', authMiddleware, ticketController.updateTicket);

/**
 * @swagger
 * /api/tickets/{id}/attach-image:
 *   post:
 *     summary: Attach image URL to a ticket
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
 *             properties:
 *               Attachment:
 *                 type: string
 *                 example: "https://i.imgur.com/example.png"
 *     responses:
 *       200:
 *         description: Image URL attached successfully
 */
router.post('/:id/attach-image', authMiddleware, ticketController.attachImage);

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

module.exports = router;