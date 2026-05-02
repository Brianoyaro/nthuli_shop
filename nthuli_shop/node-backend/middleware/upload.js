const multer = require('multer');
const config = require('../config/env');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('Invalid file type. Only images are allowed.'));
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter,
});

module.exports = upload;
