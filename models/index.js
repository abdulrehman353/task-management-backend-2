const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// 1. TABLES / MODELS DEFINITIONS

// User Table
const User = sequelize.define('User', {
  UserID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  OrganizationID: { type: DataTypes.INTEGER, allowNull: true },
  Name: { type: DataTypes.STRING, allowNull: false },
  Email: { type: DataTypes.STRING, allowNull: false, unique: true },
  Password: { type: DataTypes.STRING, allowNull: false },
  Date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
});

// Organization Table
const Organization = sequelize.define('Organization', {
  OrganizationID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Name: { type: DataTypes.STRING, allowNull: false },
  Email: { type: DataTypes.STRING, allowNull: true },
  Logo: { type: DataTypes.TEXT, allowNull: true }, 
  Theme: { type: DataTypes.STRING, defaultValue: 'light' },
});

// Role Table
const Role = sequelize.define('Role', {
  RoleID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  RoleName: { type: DataTypes.STRING, allowNull: false },
  Description: { type: DataTypes.STRING, allowNull: true },
});

// Permissions Table
const Permissions = sequelize.define('Permissions', {
  PermissionID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  PermissionName: { type: DataTypes.STRING, allowNull: false },
});

// OrganizationMembers Table
const OrganizationMembers = sequelize.define('OrganizationMembers', {
  OrganizationMemberID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

// Project Table
const Project = sequelize.define('Project', {
  ProjectID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Name: { type: DataTypes.STRING, allowNull: false },
  Description: { type: DataTypes.TEXT, allowNull: true },
  StartDate: { type: DataTypes.DATEONLY, allowNull: true },
  EndDate: { type: DataTypes.DATEONLY, allowNull: true },
});

// ProjectMembers Table
const ProjectMembers = sequelize.define('ProjectMembers', {
  ProjectMemberID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

// Tasks Table
const Tasks = sequelize.define('Tasks', {
  TaskID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Title: { type: DataTypes.STRING, allowNull: false },
  Description: { type: DataTypes.TEXT, allowNull: true },
  Status: { type: DataTypes.STRING, defaultValue: 'todo' },
  Priority: { type: DataTypes.STRING, defaultValue: 'medium' },
  DueDate: { type: DataTypes.DATEONLY, allowNull: true },
});

// Ticket Table
const Ticket = sequelize.define('Ticket', {
  TicketID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Title: { type: DataTypes.STRING, allowNull: false },
  Description: { type: DataTypes.TEXT, allowNull: true },
  Status: { 
    type: DataTypes.ENUM('todo', 'in_progress', 'done'), 
    defaultValue: 'todo' 
  },
  Priority: { 
    type: DataTypes.ENUM('low', 'medium', 'high'), 
    defaultValue: 'medium' 
  },
  Attachment: { type: DataTypes.TEXT, allowNull: true },
});

// Comments Table
const Comments = sequelize.define('Comments', {
  CommentID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Comment: { type: DataTypes.TEXT, allowNull: false },
});

// Attachments Table
const Attachments = sequelize.define('Attachments', {
  AttachmentID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  FileName: { type: DataTypes.STRING, allowNull: false },
  UploadDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

// ActivityHistory Table
const ActivityHistory = sequelize.define('ActivityHistory', {
  ActivityHistoryID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Action: { type: DataTypes.STRING, allowNull: false },
  entity_type: { type: DataTypes.STRING, allowNull: true },
  entity_ID: { type: DataTypes.INTEGER, allowNull: true },
});

// 2. RELATIONSHIPS (FOREIGN KEYS SETUP)


// User & Organization Direct Link
User.belongsTo(Organization, { foreignKey: 'OrganizationID' });
Organization.hasMany(User, { foreignKey: 'OrganizationID' });

// Organization Members (Mapping Table)
OrganizationMembers.belongsTo(Organization, { foreignKey: 'OrganizationID' });
Organization.hasMany(OrganizationMembers, { foreignKey: 'OrganizationID' });

OrganizationMembers.belongsTo(User, { foreignKey: 'UserID' });
User.hasMany(OrganizationMembers, { foreignKey: 'UserID' });

OrganizationMembers.belongsTo(Role, { foreignKey: 'RoleID' });
Role.hasMany(OrganizationMembers, { foreignKey: 'RoleID' });

// Role & Permissions
Permissions.belongsTo(Role, { foreignKey: 'RoleID' });
Role.hasMany(Permissions, { foreignKey: 'RoleID' });

// Project Relationships
Project.belongsTo(Organization, { foreignKey: 'OrganizationID' });
Organization.hasMany(Project, { foreignKey: 'OrganizationID' });

Project.belongsTo(User, { foreignKey: 'CreatedBy' });

// Project Members
ProjectMembers.belongsTo(Project, { foreignKey: 'ProjectID' });
Project.hasMany(ProjectMembers, { foreignKey: 'ProjectID' });

ProjectMembers.belongsTo(User, { foreignKey: 'UserID' });
User.hasMany(ProjectMembers, { foreignKey: 'UserID' });

// Tasks Relationships
Tasks.belongsTo(Project, { foreignKey: 'ProjectID' });
Project.hasMany(Tasks, { foreignKey: 'ProjectID' });

Tasks.belongsTo(User, { foreignKey: 'CreatedBy', as: 'Creator' });
Tasks.belongsTo(User, { foreignKey: 'AssignedTo', as: 'Assignee' });

// Ticket Relationships
Ticket.belongsTo(Project, { foreignKey: 'ProjectID' });
Project.hasMany(Ticket, { foreignKey: 'ProjectID' });

Ticket.belongsTo(User, { foreignKey: 'AssignedToUserID', as: 'AssignedUser' });
User.hasMany(Ticket, { foreignKey: 'AssignedToUserID', as: 'AssignedTickets' });

Ticket.belongsTo(User, { foreignKey: 'CreatedByUserID', as: 'Creator' });
User.hasMany(Ticket, { foreignKey: 'CreatedByUserID', as: 'CreatedTickets' });

// Comments, Attachments & Activity History
Comments.belongsTo(Tasks, { foreignKey: 'TaskID' });
Tasks.hasMany(Comments, { foreignKey: 'TaskID' });
Comments.belongsTo(User, { foreignKey: 'UserID' });

Attachments.belongsTo(Tasks, { foreignKey: 'TaskID' });
Tasks.hasMany(Attachments, { foreignKey: 'TaskID' });
Attachments.belongsTo(User, { foreignKey: 'UploadedBy' });

ActivityHistory.belongsTo(Tasks, { foreignKey: 'TaskID' });
ActivityHistory.belongsTo(User, { foreignKey: 'UserID' });

// 3. EXPORT ALL MODELS

module.exports = {
  sequelize,
  User,
  Organization,
  Role,
  Permissions,
  OrganizationMembers,
  Project,
  ProjectMembers,
  Tasks,
  Ticket,
  Comments,
  Attachments,
  ActivityHistory,
};