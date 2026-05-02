const { DataTypes } = require('sequelize');
const { PAYMENT_STATUS, PAYMENT_METHOD } = require('./enums');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'KES',
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
      defaultValue: PAYMENT_STATUS.PENDING,
    },
    method: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_METHOD)),
      allowNull: false,
    },
    transactionId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    indexes: [
      { fields: ['transactionId'] },
      { fields: ['userId'] },
    ],
  });

  return Payment;
};
