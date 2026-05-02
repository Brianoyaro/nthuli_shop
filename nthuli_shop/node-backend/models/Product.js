const { DataTypes } = require('sequelize');
const { PRODUCT_TYPE, GENDER, SHOE_MATERIAL, FURNITURE_TYPE, FURNITURE_CATEGORY, FURNITURE_MATERIAL, CLOTHES_TYPE, CLOTHES_MATERIAL, KITCHEN_APPLIANCE_FUNCTION } = require('./enums');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(PRODUCT_TYPE)),
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Categories',
        key: 'id',
      },
    },
    // Shoe attributes
    gender: {
      type: DataTypes.ENUM(...Object.values(GENDER)),
      allowNull: true,
    },
    material: {
      type: DataTypes.ENUM(...Object.values(SHOE_MATERIAL)),
      allowNull: true,
    },
    // Furniture attributes
    furnitureType: {
      type: DataTypes.ENUM(...Object.values(FURNITURE_TYPE)),
      allowNull: true,
    },
    furnitureCategory: {
      type: DataTypes.ENUM(...Object.values(FURNITURE_CATEGORY)),
      allowNull: true,
    },
    furnitureMaterial: {
      type: DataTypes.ENUM(...Object.values(FURNITURE_MATERIAL)),
      allowNull: true,
    },
    // Clothes attributes
    clotheGender: {
      type: DataTypes.ENUM(...Object.values(GENDER)),
      allowNull: true,
    },
    clotheType: {
      type: DataTypes.ENUM(...Object.values(CLOTHES_TYPE)),
      allowNull: true,
    },
    clotheMaterial: {
      type: DataTypes.ENUM(...Object.values(CLOTHES_MATERIAL)),
      allowNull: true,
    },
    // Kitchen appliance attributes
    wattage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    applianceFunction: {
      type: DataTypes.ENUM(...Object.values(KITCHEN_APPLIANCE_FUNCTION)),
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
      { fields: ['name'] },
      { fields: ['type'] },
      { fields: ['categoryId'] },
    ],
  });

  return Product;
};
