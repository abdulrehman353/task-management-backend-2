module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    TicketID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    Status: {
      type: DataTypes.ENUM('todo', 'in_progress', 'done'),
      defaultValue: 'todo',
    },
    Priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    Attachment: {
      type: DataTypes.TEXT, 
      allowNull: true,
    },
  });

  return Ticket;
};