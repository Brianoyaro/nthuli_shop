const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/env');

class FileService {
  async saveFile(file) {
    const uploadDir = config.upload.dir;
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${uuidv4()}_${file.originalname}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, file.buffer);
    return `/uploads/${filename}`;
  }

  async deleteFile(fileUrl) {
    if (!fileUrl) return;
    const filename = fileUrl.replace('/uploads/', '');
    const filepath = path.join(config.upload.dir, filename);

    try {
      await fs.unlink(filepath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async deleteFiles(fileUrls) {
    for (const url of fileUrls) {
      await this.deleteFile(url);
    }
  }
}

module.exports = new FileService();
