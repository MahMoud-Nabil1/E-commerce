package com.ecommerce.ecommerce.Services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileServiceImpl implements FileService {

    @Override
    public String uploadImage(String path, MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null || originalFileName.trim().isEmpty()) {
            throw new IllegalArgumentException("Uploaded file must have a valid original filename");
        }

        int extensionIndex = originalFileName.lastIndexOf('.');
        if (extensionIndex <= 0 || extensionIndex == originalFileName.length() - 1) {
            throw new IllegalArgumentException("Uploaded file must have a valid filename extension");
        }

        String extension = originalFileName.substring(extensionIndex);

        // Generate a unique identifier to prevent file name collisions
        String randomId = UUID.randomUUID().toString();
        String fileName = randomId.concat(extension);
        String filePath = path + File.separator + fileName;

        // Ensure the target directory exists, create it if necessary
        File folder = new File(path);
        if (!folder.exists())
            folder.mkdirs();

        // Save the file to the specified path
        Files.copy(file.getInputStream(), Paths.get(filePath));
        return fileName;
    }
}