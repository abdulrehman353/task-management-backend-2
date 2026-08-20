const express = require('express');
const router = express.Router();
const orgController = require('../controllers/organizationController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/orgs:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *               Email:
 *                 type: string
 *               Logo:
 *                 type: string
 *               Theme:
 *                 type: string
 *     responses:
 *       201:
 *         description: Organization created successfully
 */
router.post('/', authMiddleware, orgController.createOrganization);

/**
 * @swagger
 * /api/orgs:
 *   get:
 *     summary: Get all organizations
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all organizations
 */
router.get('/', authMiddleware, orgController.getAllOrganizations);

/**
 * @swagger
 * /api/orgs/{id}:
 *   put:
 *     summary: Update an organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *               Email:
 *                 type: string
 *               Logo:
 *                 type: string
 *               Theme:
 *                 type: string
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *       404:
 *         description: Organization not found
 */
router.put('/:id', authMiddleware, orgController.updateOrganization);

/**
 * @swagger
 * /api/orgs/{id}:
 *   delete:
 *     summary: Delete an organization
 *     tags: [Organizations]
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
 *         description: Organization deleted
 */
router.delete('/:id', authMiddleware, orgController.deleteOrganization);

/**
 * @swagger
 * /api/orgs/assign-user:
 *   post:
 *     summary: Assign user to an organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UserID:
 *                 type: integer
 *               OrganizationID:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User assigned successfully
 */
router.post('/assign-user', authMiddleware, orgController.assignUserToOrg);

/**
 * @swagger
 * /api/orgs/remove-user:
 *   post:
 *     summary: Remove user from organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UserID:
 *                 type: integer
 *               OrganizationID:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User removed successfully
 */
router.post('/remove-user', authMiddleware, orgController.removeUserFromOrg);

/**
 * @swagger
 * /api/orgs/transfer-owner:
 *   post:
 *     summary: Transfer organization ownership
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               OrganizationID:
 *                 type: integer
 *               NewOwnerUserID:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Ownership transferred successfully
 */
router.post('/transfer-owner', authMiddleware, orgController.transferOrgOwner);

/**
 * @swagger
 * /api/orgs/roles:
 *   post:
 *     summary: Create a role
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
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
 *       201:
 *         description: Role created successfully
 */
router.post('/roles', authMiddleware, orgController.createRole);

/**
 * @swagger
 * /api/orgs/assign-role:
 *   post:
 *     summary: Assign role to user
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roleId
 *             properties:
 *               userId:
 *                 type: integer
 *               roleId:
 *                 type: integer
 *               organizationId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *       404:
 *         description: User or Role not found
 */
router.post('/assign-role', authMiddleware,  orgController.assignRoleToUser);

module.exports = router;