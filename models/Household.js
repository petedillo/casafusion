'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Household extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations
      Household.hasMany(models.JoinRequest, { foreignKey: 'householdId' });
      Household.belongsToMany(models.User, { through: models.HouseholdMember, foreignKey: 'householdId' });
      Household.hasMany(models.HouseholdMember, { foreignKey: 'householdId' });
      Household.belongsTo(models.User, { foreignKey: 'adminId', as: 'admin' });
    }
  }
  Household.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Household',
  });
  return Household;
};