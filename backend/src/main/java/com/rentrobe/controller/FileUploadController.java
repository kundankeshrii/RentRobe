package com.rentrobe.controller;

import com.rentrobe.service.CloudinaryStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final CloudinaryStorageService storageService;

    @PostMapping("/payment-screenshot")
    public ResponseEntity<Map<String, String>> uploadPaymentScreenshot(@RequestParam("file") MultipartFile file) {
        String url = storageService.uploadPaymentScreenshot(file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
