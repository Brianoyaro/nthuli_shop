module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Categories', [
      {
        name: 'SHOES',
        description: 'Footwear products',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'FURNITURE',
        description: 'Furniture products',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'CLOTHES',
        description: 'Clothing products',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'KITCHEN_APPLIANCES',
        description: 'Kitchen appliance products',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Categories', null, {});
  },
};
