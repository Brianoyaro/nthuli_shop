const { Category, Product } = require('../models');

class CategoryService {
  async getAllCategories() {
    return Category.findAll();
  }

  async getCategoryById(id) {
    return Category.findByPk(id);
  }

  async getCategoryByName(name) {
    return Category.findOne({ where: { name } });
  }

  async getProductsByCategory(categoryId) {
    return Product.findAll({
      where: { categoryId },
      include: [{ association: 'images' }],
    });
  }

  async createCategory(name, description) {
    return Category.create({ name, description });
  }

  async updateCategory(id, name, description) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category.update({ name, description });
  }

  async deleteCategory(id) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error('Category not found');
    }
    await category.destroy();
  }
}

module.exports = new CategoryService();
