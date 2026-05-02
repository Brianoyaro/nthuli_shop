const sequelize = require('../config/database');
const UserModel = require('./User');
const CategoryModel = require('./Category');
const ProductModel = require('./Product');
const ProductImageModel = require('./ProductImage');
const PaymentModel = require('./Payment');

const User = UserModel(sequelize);
const Category = CategoryModel(sequelize);
const Product = ProductModel(sequelize);
const ProductImage = ProductImageModel(sequelize);
const Payment = PaymentModel(sequelize);

// Define associations
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });

Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  Payment,
};
