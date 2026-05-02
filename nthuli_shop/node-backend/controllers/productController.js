const productService = require('../services/productService');

class ProductController {
  async getAllProducts(req, res) {
    try {
      const products = await productService.getAllProductsGroupedByType();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getProduct(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json(product);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async createProduct(req, res) {
    try {
      const productData = JSON.parse(req.body.product);
      const product = await productService.createProduct(productData, req.files);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      const productData = JSON.parse(req.body.product);
      const imagesToKeep = req.body.imagesToKeep 
        ? JSON.parse(req.body.imagesToKeep) 
        : [];
      const primaryIndex = parseInt(req.body.primaryIndex) || 0;

      const product = await productService.updateProduct(
        req.params.id,
        productData,
        req.files,
        imagesToKeep,
        primaryIndex
      );
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(req.params.id);
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new ProductController();
