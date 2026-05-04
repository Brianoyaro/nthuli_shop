const sequelize = require('../config/database');
const UserModel = require('./User');
const CategoryModel = require('./Category');
const ProductModel = require('./Product');
const ProductImageModel = require('./ProductImage');
const PaymentModel = require('./Payment');
const CartModel = require('./Cart');
const CartItemModel = require('./CartItem');
const OrderModel = require('./Order');
const OrderItemModel = require('./OrderItem');
const CouponModel = require('./Coupon');

const User = UserModel(sequelize);
const Category = CategoryModel(sequelize);
const Product = ProductModel(sequelize);
const ProductImage = ProductImageModel(sequelize);
const Payment = PaymentModel(sequelize);
const Cart = CartModel(sequelize);
const CartItem = CartItemModel(sequelize);
const Order = OrderModel(sequelize);
const OrderItem = OrderItemModel(sequelize);
const Coupon = CouponModel(sequelize);

// Define associations
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });

Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });

CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });

CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });

// Order associations
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });

Order.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });
Payment.hasOne(Order, { foreignKey: 'paymentId', as: 'order' });

Order.belongsTo(Coupon, { foreignKey: 'couponId', as: 'coupon' });
Coupon.hasMany(Order, { foreignKey: 'couponId', as: 'orders' });

OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });

OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  Payment,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Coupon,
};
