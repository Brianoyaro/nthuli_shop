const { DataTypes } = require('sequelize');
const { ORDER_STATUS } = require('./enums');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ORDER_STATUS)),
      defaultValue: ORDER_STATUS.PENDING,
    },
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Payments',
        key: 'id',
      },
    },
    couponId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Coupons',
        key: 'id',
      },
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

  return Order;
};
