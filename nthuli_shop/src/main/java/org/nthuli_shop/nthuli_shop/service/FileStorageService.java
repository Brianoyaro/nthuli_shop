package org.nthuli_shop.nthuli_shop.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final String uploadDir = "uploads/";

    public String saveFile(MultipartFile file) {
        // Validate file type
        String contentType = file.getContentType();
        assert contentType != null;
        if (!contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }

        try {
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();

            Path path = Paths.get(uploadDir + filename);
            Files.createDirectories(path.getParent());

            Files.write(path, file.getBytes());

            return "/uploads/" + filename; // URL path
        } catch (IOException e) {
            throw new RuntimeException("File upload failed");
        }
    }

    public void deleteFile(String fileUrl) {
        try {
            // Extract filename from URL path: "/uploads/uuid_filename.jpg"
            String filename = fileUrl.substring("/uploads/".length());
            Path path = Paths.get(uploadDir + filename);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException("File deletion failed: " + e.getMessage());
        }
    }
}

