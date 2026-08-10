module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define('Organization', {
    OrgID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    Theme: {
      type: DataTypes.STRING,
      defaultValue: 'light',
    },
  });

  return Organization;
};