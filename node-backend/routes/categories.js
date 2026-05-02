const express = require('express');
const categoryController = require('../controllers/categoryController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', categoryController.getAllCategories.bind(categoryController));
router.get('/:id', categoryController.getCategory.bind(categoryController));
router.get('/:id/products', categoryController.getProductsByCategory.bind(categoryController));

router.post('/', 
  // authMiddleware, 
  // adminMiddleware, 
  categoryController.createCategory.bind(categoryController)
);

router.put('/:id', 
  // authMiddleware, 
  // adminMiddleware, 
  categoryController.updateCategory.bind(categoryController)
);

router.delete('/:id', 
  // authMiddleware, 
  // adminMiddleware, 
  categoryController.deleteCategory.bind(categoryController)
);

module.exports = router;
