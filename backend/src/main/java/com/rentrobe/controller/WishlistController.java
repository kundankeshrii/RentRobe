package com.rentrobe.controller;

import com.rentrobe.entity.WishlistItem;
import com.rentrobe.repository.WishlistRepository;
import com.rentrobe.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistRepository wishlistRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWishlist(@AuthenticationPrincipal AuthenticatedUser user) {
        List<String> productIds = wishlistRepository.findByUserId(user.getUserId())
                .stream()
                .map(WishlistItem::getProductId)
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("productIds", productIds));
    }

    @PostMapping("/{productId}")
    @Transactional
    public ResponseEntity<Map<String, String>> addToWishlist(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable String productId) {
        if (!wishlistRepository.existsByUserIdAndProductId(user.getUserId(), productId)) {
            WishlistItem item = WishlistItem.builder()
                    .userId(user.getUserId())
                    .productId(productId)
                    .build();
            wishlistRepository.save(item);
        }
        return ResponseEntity.ok(Map.of("status", "added"));
    }

    @DeleteMapping("/{productId}")
    @Transactional
    public ResponseEntity<Map<String, String>> removeFromWishlist(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable String productId) {
        wishlistRepository.deleteByUserIdAndProductId(user.getUserId(), productId);
        return ResponseEntity.ok(Map.of("status", "removed"));
    }
}
