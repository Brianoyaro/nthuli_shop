const express = require('express');
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.get('/', productController.getAllProducts.bind(productController));
router.get('/:id', productController.getProduct.bind(productController));

router.post('/', 
  authMiddleware, 
  adminMiddleware, 
  upload.array('images', 10),
  productController.createProduct.bind(productController)
);

router.put('/:id', 
  authMiddleware, 
  adminMiddleware, 
  upload.array('images', 10),
  productController.updateProduct.bind(productController)
);

router.delete('/:id', 
  authMiddleware, 
  adminMiddleware, 
  productController.deleteProduct.bind(productController)
);

module.exports = router;
