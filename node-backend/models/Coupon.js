const { DataTypes } = require('sequelize');
const { DISCOUNT_TYPE } = require('./enums');

module.exports = (sequelize) => {
  const Coupon = sequelize.define('Coupon', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      uppercase: true,
    },
    discountType: {
      type: DataTypes.ENUM(...Object.values(DISCOUNT_TYPE)),
      allowNull: false,
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    maxUses: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    usedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    validUntil: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return Coupon;
};
