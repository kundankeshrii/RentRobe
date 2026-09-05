package com.rentrobe.service;

import com.rentrobe.entity.Product;
import com.rentrobe.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getFeatured() {
        return productRepository.findByIsFeaturedTrueOrderByCreatedAtDesc();
    }

    public List<Product> getNewArrivals() {
        return productRepository.findByIsNewTrueOrderByCreatedAtDesc();
    }

    public Page<Product> getAll(String category, String search, Boolean featured, Boolean isNew,
                                  int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (Boolean.TRUE.equals(featured)) {
            return productRepository.findByIsFeaturedTrue(pageable);
        }
        if (Boolean.TRUE.equals(isNew)) {
            return productRepository.findByIsNewTrue(pageable);
        }
        if (category != null && !category.isBlank() && search != null && !search.isBlank()) {
            return productRepository.findFiltered(category, search, pageable);
        }
        if (category != null && !category.isBlank()) {
            return productRepository.findByCategoryIgnoreCase(category, pageable);
        }
        if (search != null && !search.isBlank()) {
            return productRepository.search(search, pageable);
        }
        return productRepository.findAll(pageable);
    }

    public Product getById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Transactional
    public Product create(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public Product update(UUID id, Product updated) {
        Product existing = getById(id);
        existing.setName(updated.getName());
        existing.setDesigner(updated.getDesigner());
        existing.setCategory(updated.getCategory());
        existing.setRentalPrice(updated.getRentalPrice());
        existing.setRetailPrice(updated.getRetailPrice());
        existing.setSizes(updated.getSizes());
        existing.setColors(updated.getColors());
        existing.setDescription(updated.getDescription());
        existing.setDetails(updated.getDetails());
        existing.setImages(updated.getImages());
        existing.setOccasion(updated.getOccasion());
        existing.setAvailable(updated.getAvailable());
        existing.setIsFeatured(updated.getIsFeatured());
        existing.setIsNew(updated.getIsNew());
        existing.setStockQuantity(updated.getStockQuantity());
        existing.setSecurityDeposit(updated.getSecurityDeposit());
        return productRepository.save(existing);
    }

    public List<Product> getByIds(List<UUID> ids) {
        return productRepository.findAllById(ids);
    }

    @Transactional
    public void delete(UUID id) {
        productRepository.deleteById(id);
    }
}
