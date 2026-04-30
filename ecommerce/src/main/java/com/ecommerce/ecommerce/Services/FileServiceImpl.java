// Saves uploaded files to disk with unique names.
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

    // Stores file with UUID name to avoid collisions. Returns filename.
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

        // UUID prevents overwrites when users upload same-named files.
        String randomId = UUID.randomUUID().toString();
        String fileName = randomId.concat(extension);
        String filePath = path + File.separator + fileName;

        File folder = new File(path);
        if (!folder.exists())
            folder.mkdirs();

        Files.copy(file.getInputStream(), Paths.get(filePath));
        return fileName;
    }
}
