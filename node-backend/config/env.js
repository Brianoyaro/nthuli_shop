require('dotenv').config();

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8080,
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  },
  upload: {
    dir: process.env.UPLOAD_DIR,
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE),
  },
  cors: {
    origin: process.env.CORS_ORIGIN ? JSON.parse(process.env.CORS_ORIGIN) : 'http://localhost:5173',
  },
};
