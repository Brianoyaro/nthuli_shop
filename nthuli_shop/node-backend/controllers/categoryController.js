const categoryService = require('../services/categoryService');

class CategoryController {
  async getAllCategories(req, res) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getCategory(req, res) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getProductsByCategory(req, res) {
    try {
      const products = await categoryService.getProductsByCategory(req.params.id);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async createCategory(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
      }

      const category = await categoryService.createCategory(name, description);
      res.status(201).json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateCategory(req, res) {
    try {
      const { name, description } = req.body;
      const category = await categoryService.updateCategory(req.params.id, name, description);
      res.json(category);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteCategory(req, res) {
    try {
      await categoryService.deleteCategory(req.params.id);
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new CategoryController();
