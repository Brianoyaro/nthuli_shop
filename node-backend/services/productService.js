const { Product, ProductImage, Category } = require('../models');
const { PRODUCT_TYPE, getFurnitureCategory } = require('../models/enums');
const fileService = require('./fileService');
const categoryService = require('./categoryService');

class ProductService {
  async getAllProducts() {
    return Product.findAll({
      include: [{ association: 'images' }],
      order: [['createdAt', 'DESC']],
    });
  }

  async getAllProductsGroupedByType() {
    const products = await Product.findAll({
      include: [{ association: 'images' }],
      order: [['type', 'ASC'], ['createdAt', 'DESC']],
    });

    const grouped = {};
    for (const product of products) {
      if (!grouped[product.type]) {
        grouped[product.type] = [];
      }
      grouped[product.type].push(this.mapToResponse(product));
    }
    return grouped;
  }

  async getProductById(id) {
    const product = await Product.findByPk(id, {
      include: [
        { association: 'images' },
        { association: 'category' },
      ],
    });
    if (!product) throw new Error('Product not found');
    return this.mapToResponse(product);
  }

  async createProduct(data, images) {
    // Check for duplicate
    const existing = await Product.findOne({ where: { name: data.name } });
    if (existing) throw new Error(`Product with name '${data.name}' already exists`);

    // Get category by type
    const category = await categoryService.getCategoryByName(data.type);
    if (!category) {
      throw new Error(
        `Category '${data.type}' not found. ` +
        'Please ensure the following categories exist: SHOES, FURNITURE, CLOTHES, KITCHEN_APPLIANCES'
      );
    }

    // Create product
    const productData = {
      name: data.name,
      description: data.description,
      price: data.price,
      type: data.type,
      categoryId: category.id,
    };

    // Add type-specific attributes
    if (data.type === PRODUCT_TYPE.SHOES) {
      productData.gender = data.gender;
      productData.material = data.material;
    } else if (data.type === PRODUCT_TYPE.FURNITURE) {
      productData.furnitureType = data.furnitureType;
      productData.furnitureMaterial = data.furnitureMaterial;
      productData.furnitureCategory = getFurnitureCategory(data.furnitureType);
    } else if (data.type === PRODUCT_TYPE.CLOTHES) {
      productData.clotheGender = data.clotheGender;
      productData.clotheType = data.clotheType;
      productData.clotheMaterial = data.clotheMaterial;
    } else if (data.type === PRODUCT_TYPE.KITCHEN_APPLIANCE) {
      productData.wattage = data.wattage;
      productData.applianceFunction = data.applianceFunction;
    }

    let product = await Product.create(productData);

    // Add images
    if (images && images.length > 0) {
      const imageEntities = await Promise.all(
        images.map(async (file, index) => {
          const imageUrl = await fileService.saveFile(file);
          return ProductImage.create({
            productId: product.id,
            imageUrl,
            isPrimary: index === 0,
          });
        })
      );
      product.images = imageEntities;
    }

    return this.mapToResponse(product);
  }

  async updateProduct(id, data, images, imagesToKeep = [], primaryIndex = 0) {
    let product = await Product.findByPk(id, {
      include: [{ association: 'images' }],
    });
    if (!product) throw new Error('Product not found');

    // Update category if type changed
    if (data.type && data.type !== product.type) {
      const category = await categoryService.getCategoryByName(data.type);
      if (!category) throw new Error(`Category '${data.type}' not found`);
      product.categoryId = category.id;
      product.type = data.type;
    }

    // Update basic fields
    if (data.name) product.name = data.name;
    if (data.description) product.description = data.description;
    if (data.price) product.price = data.price;

    // Update type-specific attributes
    if (data.type === PRODUCT_TYPE.SHOES) {
      if (data.gender) product.gender = data.gender;
      if (data.material) product.material = data.material;
    } else if (data.type === PRODUCT_TYPE.FURNITURE) {
      if (data.furnitureType) {
        product.furnitureType = data.furnitureType;
        product.furnitureCategory = getFurnitureCategory(data.furnitureType);
      }
      if (data.furnitureMaterial) product.furnitureMaterial = data.furnitureMaterial;
    } else if (data.type === PRODUCT_TYPE.CLOTHES) {
      if (data.clotheGender) product.clotheGender = data.clotheGender;
      if (data.clotheType) product.clotheType = data.clotheType;
      if (data.clotheMaterial) product.clotheMaterial = data.clotheMaterial;
    } else if (data.type === PRODUCT_TYPE.KITCHEN_APPLIANCE) {
      if (data.wattage) product.wattage = data.wattage;
      if (data.applianceFunction) product.applianceFunction = data.applianceFunction;
    }

    // Handle images
    if (imagesToKeep && imagesToKeep.length > 0) {
      const imagesToDelete = product.images.filter(
        img => !imagesToKeep.includes(img.id)
      );
      for (const img of imagesToDelete) {
        await fileService.deleteFile(img.imageUrl);
        await img.destroy();
      }
    } else if (images && images.length > 0) {
      // Delete all old images
      for (const img of product.images) {
        await fileService.deleteFile(img.imageUrl);
        await img.destroy();
      }
    }

    // Add new images
    if (images && images.length > 0) {
      const imageEntities = await Promise.all(
        images.map(async (file, index) => {
          const imageUrl = await fileService.saveFile(file);
          return ProductImage.create({
            productId: product.id,
            imageUrl,
            isPrimary: index === primaryIndex,
          });
        })
      );
      product.images = imageEntities;
    }

    await product.save();
    product = await Product.findByPk(id, {
      include: [{ association: 'images' }],
    });
    return this.mapToResponse(product);
  }

  async deleteProduct(id) {
    const product = await Product.findByPk(id, {
      include: [{ association: 'images' }],
    });
    if (!product) throw new Error('Product not found');

    // Delete images
    for (const img of product.images) {
      await fileService.deleteFile(img.imageUrl);
    }

    await product.destroy();
  }

  mapToResponse(product) {
    const images = product.images?.map(img => ({
      id: img.id,
      imageUrl: img.imageUrl,
      primary: img.isPrimary,
    })) || [];

    const response = {
      id: product.id,
      name: product.name,
      categoryName: product.category?.name || '',
      productType: product.type,
      price: product.price,
      description: product.description,
      images,
    };

    // Add type-specific fields
    if (product.type === PRODUCT_TYPE.SHOES) {
      response.gender = product.gender;
      response.material = product.material;
    } else if (product.type === PRODUCT_TYPE.FURNITURE) {
      response.furnitureType = product.furnitureType;
      response.furnitureCategory = product.furnitureCategory;
      response.furnitureMaterial = product.furnitureMaterial;
    } else if (product.type === PRODUCT_TYPE.CLOTHES) {
      response.clotheGender = product.clotheGender;
      response.clotheType = product.clotheType;
      response.clotheMaterial = product.clotheMaterial;
    } else if (product.type === PRODUCT_TYPE.KITCHEN_APPLIANCE) {
      response.wattage = product.wattage;
      response.applianceFunction = product.applianceFunction;
    }

    return response;
  }
}

module.exports = new ProductService();
