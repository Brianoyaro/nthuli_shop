package org.nthuli_shop.nthuli_shop.product.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);
    private final String uploadDir = "uploads/";
    private static final long MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    private static final String[] ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"};

    public String saveFile(MultipartFile file) {
        logger.info("Starting file upload: {}", file.getOriginalFilename());
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            logger.warn("File upload rejected: Invalid content type - {}", contentType);
            throw new IllegalArgumentException("Only image files are allowed");
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            logger.warn("File upload rejected: File size {} exceeds max size {}", file.getSize(), MAX_FILE_SIZE);
            throw new IllegalArgumentException("File size must not exceed 20MB");
        }

        // Validate file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !isValidExtension(originalFilename)) {
            logger.warn("File upload rejected: Invalid file extension - {}", originalFilename);
            throw new IllegalArgumentException("File format not supported. Allowed: jpg, jpeg, png, gif, webp");
        }

        try {
            String filename = UUID.randomUUID() + "_" + originalFilename;

            Path path = Paths.get(uploadDir + filename);
            Files.createDirectories(path.getParent());

            Files.write(path, file.getBytes());
            
            logger.info("File uploaded successfully: {}", filename);
            return "/uploads/" + filename; // URL path
        } catch (IOException e) {
            logger.error("File upload failed for: {}", originalFilename, e);
            throw new RuntimeException("File upload failed: " + e.getMessage());
        }
    }

    public void deleteFile(String fileUrl) {
        logger.info("Starting file deletion: {}", fileUrl);
        try {
            // Extract filename from URL path: "/uploads/uuid_filename.jpg"
            String filename = fileUrl.substring("/uploads/".length());
            Path path = Paths.get(uploadDir + filename);
            Files.deleteIfExists(path);
            logger.info("File deleted successfully: {}", filename);
        } catch (IOException e) {
            logger.error("File deletion failed for: {}", fileUrl, e);
            throw new RuntimeException("File deletion failed: " + e.getMessage());
        }
    }

    private boolean isValidExtension(String filename) {
        String lowerFilename = filename.toLowerCase();
        for (String ext : ALLOWED_EXTENSIONS) {
            if (lowerFilename.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }
}

