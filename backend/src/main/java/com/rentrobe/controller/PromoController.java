package com.rentrobe.controller;

import com.rentrobe.entity.PromoCode;
import com.rentrobe.repository.PromoCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/promo")
@RequiredArgsConstructor
public class PromoController {

    private final PromoCodeRepository promoCodeRepository;

    @PostMapping("/validate")
    public ResponseEntity<?> validatePromoCode(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        if (code == null || code.isBlank()) {
            return ResponseEntity.ok(Map.of("valid", false, "error", "Promo code cannot be empty"));
        }

        PromoCode promo = promoCodeRepository.findByCodeIgnoreCaseAndIsActiveTrue(code.trim())
                .orElse(null);

        if (promo == null) {
            return ResponseEntity.ok(Map.of("valid", false, "error", "Invalid or inactive promo code"));
        }

        if (promo.getExpiryDate() != null && promo.getExpiryDate().isBefore(LocalDate.now())) {
            return ResponseEntity.ok(Map.of("valid", false, "error", "Promo code has expired"));
        }

        if (promo.getUsageLimit() != null && promo.getTimesUsed() != null && promo.getTimesUsed() >= promo.getUsageLimit()) {
            return ResponseEntity.ok(Map.of("valid", false, "error", "Promo code usage limit reached"));
        }

        return ResponseEntity.ok(Map.of(
                "valid", true,
                "code", promo.getCode(),
                "discountType", promo.getDiscountType(),
                "value", promo.getValue()
        ));
    }
}
