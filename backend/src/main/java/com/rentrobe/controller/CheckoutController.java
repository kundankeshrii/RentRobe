package com.rentrobe.controller;

import com.rentrobe.dto.CheckoutRequest;
import com.rentrobe.security.AuthenticatedUser;
import com.rentrobe.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final OrderService orderService;

    @PostMapping("/stripe")
    public ResponseEntity<Map<String, String>> createStripeSession(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(orderService.createStripeSession(request, user.getUserId()));
    }

    @PostMapping("/validate")
    public ResponseEntity<List<Map<String, Object>>> validateCheckout(
            @RequestBody List<Map<String, String>> items) {
        return ResponseEntity.ok(orderService.validateCheckoutAvailability(items));
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Boolean>> verifyPayment(
            @RequestBody Map<String, String> body) {
        String sessionId = body.get("sessionId");
        orderService.handleStripeSuccess(sessionId);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
