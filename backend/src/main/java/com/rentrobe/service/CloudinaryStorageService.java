package com.rentrobe.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryStorageService {

    private final Cloudinary cloudinary;

    public String uploadProductImage(MultipartFile file) {
        return uploadFile("rentrobe/product-images", file);
    }

    public String uploadPaymentScreenshot(MultipartFile file) {
        return uploadFile("rentrobe/payment-screenshots", file);
    }

    private String uploadFile(String folder, MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String baseName = UUID.randomUUID().toString();
        if (originalFilename != null && originalFilename.contains(".")) {
            baseName = originalFilename.substring(0, originalFilename.lastIndexOf("."))
                    + "-" + UUID.randomUUID();
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "public_id", baseName,
                            "resource_type", "image",
                            "overwrite", true
                    ));

            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("File uploaded to Cloudinary. URL: {}", secureUrl);
            return secureUrl;

        } catch (IOException e) {
            log.error("Failed to read file bytes", e);
            throw new RuntimeException("Failed to read file data", e);
        } catch (Exception e) {
            log.error("Error uploading to Cloudinary", e);
            throw new RuntimeException("Error during file upload: " + e.getMessage(), e);
        }
    }
}
