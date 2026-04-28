package com.ecommerce.ecommerce.Services;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Service interface for handling file-related operations.
 */
public interface FileService {
    String uploadImage(String path, MultipartFile file) throws IOException;
}