package com.rentrobe.controller;

import com.rentrobe.entity.Order;
import com.rentrobe.entity.Profile;
import com.rentrobe.entity.PromoCode;
import com.rentrobe.repository.OrderRepository;
import com.rentrobe.repository.ProfileRepository;
import com.rentrobe.repository.PromoCodeRepository;
import com.rentrobe.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final ProfileRepository profileRepository;
    private final PromoCodeRepository promoCodeRepository;

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/orders/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable UUID id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(orderService.updateOrder(id, updates));
    }

    @PutMapping("/orders/{id}/payment")
    public ResponseEntity<Order> verifyPayment(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String action = body.get("action"); // "verified" or "rejected"
        return ResponseEntity.ok(orderService.verifyPayment(id, action));
    }

    @GetMapping("/users")
    public ResponseEntity<List<Profile>> getAllUsers() {
        return ResponseEntity.ok(profileRepository.findAll());
    }

    @PostMapping("/users/profiles")
    public ResponseEntity<List<Profile>> getUserProfiles(@RequestBody List<String> userIds) {
        List<UUID> uuids = userIds.stream().map(UUID::fromString).collect(Collectors.toList());
        return ResponseEntity.ok(profileRepository.findByUserIdIn(uuids));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        List<Order> all = orderRepository.findAllByOrderByCreatedAtDesc();
        BigDecimal revenue = all.stream()
                .filter(o -> "paid".equals(o.getPaymentStatus()) || "verified".equals(o.getPaymentStatus()))
                .map(o -> o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long upcoming = all.stream().filter(o -> "upcoming".equals(o.getStatus())).count();
        long active = all.stream().filter(o -> "active".equals(o.getStatus())).count();
        long completed = all.stream().filter(o -> "completed".equals(o.getStatus())).count();
        long cancelled = all.stream().filter(o -> "cancelled".equals(o.getStatus())).count();
        return ResponseEntity.ok(Map.of(
                "totalRevenue", revenue,
                "totalOrders", all.size(),
                "upcoming", upcoming,
                "active", active,
                "completed", completed,
                "cancelled", cancelled
        ));
    }

    @PostMapping("/promo-codes")
    public ResponseEntity<PromoCode> createPromoCode(@RequestBody PromoCode promoCode) {
        if (promoCode.getTimesUsed() == null) {
            promoCode.setTimesUsed(0);
        }
        return ResponseEntity.ok(promoCodeRepository.save(promoCode));
    }
}
