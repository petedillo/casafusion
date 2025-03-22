'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations
      User.hasMany(models.JoinRequest, { foreignKey: 'userId' });
      User.belongsToMany(models.Household, { through: models.HouseholdMember, foreignKey: 'userId' });
      User.hasMany(models.HouseholdMember, { foreignKey: 'userId' });
    }

    // Instance method to check password
    async isValidPassword(password) {
      return await bcrypt.compare(password, this.password);
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true // Allows for OAuth users with no password
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isOAuth: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password && !user.isOAuth) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password') && !user.isOAuth) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });
  return User;
};