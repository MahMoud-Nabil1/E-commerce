// Uploads and deletes images via Cloudinary CDN.
package com.ecommerce.ecommerce.Services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

@Service
@Primary
public class CloudinaryServiceImpl implements FileService {

    @Autowired
    private Cloudinary cloudinary;

    @Override
    public String uploadImage(String path, MultipartFile file) throws IOException {
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "ecommerce/products",
                "resource_type", "image"
        ));
        return (String) uploadResult.get("secure_url");
    }

    @Override
    public InputStream getResource(String path, String fileName) throws FileNotFoundException {
        // Cloudinary stores images remotely, so we don't retrieve as InputStream
        // This method is not used with Cloudinary but required by FileService interface
        throw new UnsupportedOperationException("Cloudinary does not support getResource - images are accessed via URL");
    }

    public void deleteImage(String imageUrl) throws IOException {
        if (imageUrl == null || imageUrl.isBlank() || "default.png".equals(imageUrl)) {
            return;
        }
        // Extract public ID from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud}/image/upload/v123/ecommerce/products/abc.jpg
        try {
            String[] parts = imageUrl.split("/upload/");
            if (parts.length == 2) {
                String pathWithVersion = parts[1];
                // Remove version prefix (v123456789/)
                String publicIdWithExt = pathWithVersion.replaceFirst("v\\d+/", "");
                // Remove file extension
                String publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            // Log but don't fail — the image might have been manually deleted
            System.err.println("Warning: Could not delete Cloudinary image: " + e.getMessage());
        }
    }
}
