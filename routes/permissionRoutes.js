const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: Permission management and role-permission assignment endpoints
 */

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - PermissionName
 *             properties:
 *               PermissionName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Permission created successfully
 *       400:
 *         description: Permission already exists or missing data  
 */
router.post('/', authMiddleware, permissionController.createPermission);

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of permissions
 */
router.get('/', authMiddleware, permissionController.getAllPermissions);

/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     summary: Update a permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Permission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - PermissionName
 *             properties:
 *               PermissionName:
 *                 type: string
 *       responses:
 *       200:
 *         description: Permission updated successfully
 *       404:
 *         description: Permission not found
 */
router.put('/:id', authMiddleware, permissionController.updatePermission);

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: Delete a permission
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Permission ID
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 *       404:
 *         description: Permission not found
 */
router.delete('/:id', authMiddleware, permissionController.deletePermission);

/**
 * @swagger
 * /api/permissions/assign-to-role:
 *   post:
 *     summary: Assign a permission to a role
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - RoleID
 *               - PermissionID
 *             properties:
 *               RoleID:
 *                 type: integer
 *               PermissionID:
 *                 type: integer      
 *     responses:
 *       200:
 *         description: Permission assigned to role successfully
 *       404:
 *         description: Role or Permission not found
 */
router.post('/assign-to-role', authMiddleware, permissionController.assignPermissionToRole);

module.exports = router;