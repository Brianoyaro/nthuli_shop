const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await queryInterface.bulkInsert('Users', [
      {
        email: 'admin@nthulishop.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'admin@nthulishop.com' });
  },
};
