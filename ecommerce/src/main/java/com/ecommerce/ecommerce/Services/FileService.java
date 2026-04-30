// Contract for file upload operations (images, etc).
package com.ecommerce.ecommerce.Services;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface FileService {
    String uploadImage(String path, MultipartFile file) throws IOException;
}
