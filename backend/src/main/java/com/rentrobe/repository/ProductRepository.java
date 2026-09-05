package com.rentrobe.repository;

import com.rentrobe.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Page<Product> findByIsFeaturedTrue(Pageable pageable);

    Page<Product> findByIsNewTrue(Pageable pageable);

    Page<Product> findByCategoryIgnoreCase(String category, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(p.designer) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Product> search(@Param("q") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE (:category IS NULL OR LOWER(p.category) = LOWER(:category)) AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.designer) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> findFiltered(@Param("category") String category, @Param("search") String search, Pageable pageable);

    List<Product> findByIsFeaturedTrueOrderByCreatedAtDesc();

    List<Product> findByIsNewTrueOrderByCreatedAtDesc();
}
