package com.rentrobe.controller;

import com.rentrobe.entity.Review;
import com.rentrobe.security.AuthenticatedUser;
import com.rentrobe.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/{productId}")
    public ResponseEntity<List<Review>> getReviews(@PathVariable String productId) {
        return ResponseEntity.ok(reviewService.getReviewsForProduct(productId));
    }

    @GetMapping("/eligible/{productId}")
    public ResponseEntity<Map<String, Boolean>> checkEligibility(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID productId) {
        boolean eligible = user != null && reviewService.userHasCompletedOrder(user.getUserId(), productId);
        return ResponseEntity.ok(Map.of("eligible", eligible));
    }

    @PostMapping
    public ResponseEntity<Review> createReview(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestBody Review review) {
        return ResponseEntity.ok(reviewService.createReview(review, user.getUserId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID id,
            @RequestBody Review review) {
        return ResponseEntity.ok(reviewService.updateReview(id, review, user.getUserId()));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<List<Review>> getMyReviews(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(reviewService.getReviewsForUser(user.getUserId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID id) {
        reviewService.deleteReview(id, user.getUserId());
        return ResponseEntity.noContent().build();
    }
}
