package com.rentrobe.controller;

import com.rentrobe.entity.Product;
import com.rentrobe.service.ProductService;
import com.rentrobe.service.CloudinaryStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final CloudinaryStorageService storageService;

    @GetMapping
    public ResponseEntity<?> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean isNew,
            @RequestParam(required = false) List<UUID> ids,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        if (ids != null && !ids.isEmpty()) {
            return ResponseEntity.ok(productService.getByIds(ids));
        }
        // Return flat list for home page requests, paged for shop
        if (Boolean.TRUE.equals(featured) && size <= 10) {
            return ResponseEntity.ok(productService.getFeatured());
        }
        if (Boolean.TRUE.equals(isNew) && size <= 10) {
            return ResponseEntity.ok(productService.getNewArrivals());
        }
        Page<Product> result = productService.getAll(category, search, featured, isNew, page, size);
        return ResponseEntity.ok(Map.of(
                "content", result.getContent(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages(),
                "page", page,
                "size", size
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.create(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable UUID id, @RequestBody Product product) {
        return ResponseEntity.ok(productService.update(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable UUID id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = storageService.uploadProductImage(file);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
