require('dotenv').config();
const { sequelize, Category } = require('./models');

const seedCategories = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    await sequelize.sync();
    console.log('Database synced');

    const categories = await Category.bulkCreate([
      {
        name: 'SHOES',
        description: 'Footwear products',
      },
      {
        name: 'FURNITURE',
        description: 'Furniture products',
      },
      {
        name: 'CLOTHES',
        description: 'Clothing products',
      },
      {
        name: 'KITCHEN_APPLIANCES',
        description: 'Kitchen appliance products',
      },
    ], { ignoreDuplicates: true });

    console.log('Categories seeded successfully');
    console.log('Seeded categories:', categories.map(c => c.name));
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
