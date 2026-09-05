package com.rentrobe.service;

import com.rentrobe.dto.CartItemRequest;
import com.rentrobe.dto.CartItemResponse;
import com.rentrobe.entity.CartItem;
import com.rentrobe.repository.CartRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public List<CartItemResponse> getCartForUser(UUID userId) {
        return cartRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<CartItemResponse> addItem(UUID userId, CartItemRequest request) {
        LocalDate start = LocalDate.parse(request.getRentalStart());
        LocalDate end = LocalDate.parse(request.getRentalEnd());
        LocalDate usage = request.getUsageDate() != null && !request.getUsageDate().isBlank()
                ? LocalDate.parse(request.getUsageDate())
                : start.plusDays(1);
        UUID productId = UUID.fromString(request.getProductId());

        // Check for duplicate
        cartRepository.findDuplicate(userId, productId, request.getSize(), start, end)
                .ifPresentOrElse(
                        existing -> {
                            existing.setQuantity(existing.getQuantity() + 1);
                            if (existing.getUsageDate() == null) {
                                existing.setUsageDate(usage);
                            }
                            cartRepository.save(existing);
                        },
                        () -> {
                            CartItem item = CartItem.builder()
                                    .userId(userId)
                                    .productId(productId)
                                    .name(request.getName())
                                    .designer(request.getDesigner())
                                    .image(request.getImage())
                                    .size(request.getSize())
                                    .usageDate(usage)
                                    .rentalStart(start)
                                    .rentalEnd(end)
                                    .rentalPrice(request.getRentalPrice())
                                    .securityDeposit(request.getSecurityDeposit())
                                    .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                                    .build();
                            cartRepository.save(item);
                        }
                );

        return getCartForUser(userId);
    }

    @Transactional
    public List<CartItemResponse> updateQuantity(UUID userId, UUID itemId, int quantity) {
        CartItem item = cartRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }

        if (quantity < 1) {
            cartRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartRepository.save(item);
        }

        return getCartForUser(userId);
    }

    @Transactional
    public List<CartItemResponse> removeItem(UUID userId, UUID itemId) {
        CartItem item = cartRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }

        cartRepository.delete(item);
        return getCartForUser(userId);
    }

    @Transactional
    public void clearCart(UUID userId) {
        cartRepository.deleteByUserId(userId);
    }

    @Transactional
    public void cleanExpiredItems() {
        entityManager.createQuery(
                "DELETE FROM CartItem c WHERE c.reservedAt < :threshold"
        )
        .setParameter("threshold", java.time.OffsetDateTime.now().minusMinutes(15))
        .executeUpdate();
    }

    // Auto-clean every 5 minutes
    @Scheduled(fixedDelay = 300000)
    @Transactional
    public void scheduledClean() {
        cleanExpiredItems();
    }

    private CartItemResponse toResponse(CartItem item) {
        LocalDate usage = item.getUsageDate() != null
                ? item.getUsageDate()
                : (item.getRentalStart() != null ? item.getRentalStart().plusDays(1) : null);
        return CartItemResponse.builder()
                .id(item.getId().toString())
                .productId(item.getProductId().toString())
                .name(item.getName())
                .designer(item.getDesigner())
                .image(item.getImage())
                .size(item.getSize())
                .usageDate(usage != null ? usage.toString() : null)
                .rentalStart(item.getRentalStart().toString())
                .rentalEnd(item.getRentalEnd().toString())
                .rentalPrice(item.getRentalPrice())
                .securityDeposit(item.getSecurityDeposit())
                .quantity(item.getQuantity())
                .build();
    }
}
