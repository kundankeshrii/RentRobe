package com.rentrobe.controller;

import com.rentrobe.entity.Order;
import com.rentrobe.dto.UpiOrderRequest;
import com.rentrobe.security.AuthenticatedUser;
import com.rentrobe.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<Order>> getMyOrders(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(orderService.getOrdersForUser(user.getUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderDetail(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderById(id, user.getUserId(), false));
    }

    @PostMapping("/upi")
    public ResponseEntity<List<Order>> createUpiOrder(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody UpiOrderRequest request) {
        return ResponseEntity.ok(orderService.createUpiOrders(request, user.getUserId()));
    }
}
