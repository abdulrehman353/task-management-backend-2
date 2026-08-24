const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management and assignment endpoints
 */

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - RoleName
 *             properties:
 *               RoleName:
 *                 type: string      
 *               Description:
 *                 type: string                   
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Role already exists or validation error
 */
router.post('/', authMiddleware, roleController.createRole);                  

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 */
router.get('/', authMiddleware, roleController.getAllRoles);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               RoleName:
 *                 type: string             
 *               Description:
 *                 type: string           
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       404:
 *         description: Role not found
 */
router.put('/:id', authMiddleware, roleController.updateRole);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 */
router.delete('/:id', authMiddleware, roleController.deleteRole);

/**
 * @swagger
 * /api/roles/assign:
 *   post:
 *     summary: Assign role to user
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - UserID
 *               - RoleID
 *             properties:
 *               UserID:
 *                 type: integer
 *               RoleID:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *       404:
 *         description: User or Role not found
 */
router.post('/assign', authMiddleware, roleController.assignRoleToUser);

module.exports = router;