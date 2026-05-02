require('express-async-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const config = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(config.upload.dir));

// Routes
app.use(routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');

    await sequelize.sync();
    console.log('Database models synchronized');

    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
