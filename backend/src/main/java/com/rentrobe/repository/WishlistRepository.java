package com.rentrobe.repository;

import com.rentrobe.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistItem, UUID> {
    List<WishlistItem> findByUserId(UUID userId);
    Optional<WishlistItem> findByUserIdAndProductId(UUID userId, String productId);
    void deleteByUserIdAndProductId(UUID userId, String productId);
    boolean existsByUserIdAndProductId(UUID userId, String productId);
}
