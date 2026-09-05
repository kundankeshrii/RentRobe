package com.rentrobe.controller;

import com.rentrobe.dto.CartItemRequest;
import com.rentrobe.dto.CartItemResponse;
import com.rentrobe.security.AuthenticatedUser;
import com.rentrobe.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCart(@AuthenticationPrincipal AuthenticatedUser user) {
        List<CartItemResponse> items = cartService.getCartForUser(user.getUserId());
        return ResponseEntity.ok(Map.of("items", items));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addItem(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody CartItemRequest request) {
        List<CartItemResponse> items = cartService.addItem(user.getUserId(), request);
        return ResponseEntity.ok(Map.of("items", items));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<Map<String, Object>> updateQuantity(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID itemId,
            @RequestBody Map<String, Integer> body) {
        List<CartItemResponse> items = cartService.updateQuantity(user.getUserId(), itemId, body.get("quantity"));
        return ResponseEntity.ok(Map.of("items", items));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Map<String, Object>> removeItem(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID itemId) {
        List<CartItemResponse> items = cartService.removeItem(user.getUserId(), itemId);
        return ResponseEntity.ok(Map.of("items", items));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal AuthenticatedUser user) {
        cartService.clearCart(user.getUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/clean-expired")
    public ResponseEntity<Void> cleanExpired() {
        cartService.cleanExpiredItems();
        return ResponseEntity.noContent().build();
    }
}
