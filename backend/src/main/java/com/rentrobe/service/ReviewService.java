package com.rentrobe.service;

import com.rentrobe.entity.Review;
import com.rentrobe.repository.ProfileRepository;
import com.rentrobe.repository.ReviewRepository;
import com.rentrobe.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final ProfileRepository profileRepository;

    public List<Review> getReviewsForProduct(String productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    public boolean userHasCompletedOrder(UUID userId, UUID productId) {
        // Checking if a paid or verified order exists for this user and product
        boolean existsPaid = orderRepository.existsByUserIdAndProductIdAndPaymentStatus(userId, productId, "paid");
        boolean existsVerified = orderRepository.existsByUserIdAndProductIdAndPaymentStatus(userId, productId, "verified");
        return existsPaid || existsVerified;
    }

    @Transactional
    public Review createReview(Review review, UUID userId) {
        UUID productUuid = UUID.fromString(review.getProductId());
        if (!userHasCompletedOrder(userId, productUuid)) {
            throw new RuntimeException("You must complete an order for this product before reviewing it.");
        }
        review.setUserId(userId);
        
        profileRepository.findByUserId(userId).ifPresent(profile -> {
            review.setUserName(profile.getFullName());
        });
        if (review.getUserName() == null || review.getUserName().isBlank()) {
            review.setUserName("Anonymous");
        }
        
        return reviewRepository.save(review);
    }

    @Transactional
    public Review updateReview(UUID id, Review reviewDetails, UUID userId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (!review.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this review");
        }

        review.setRating(reviewDetails.getRating());
        review.setComment(reviewDetails.getComment());
        review.setSize(reviewDetails.getSize());
        
        return reviewRepository.save(review);
    }

    @Transactional
    public void deleteReview(UUID id, UUID userId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        
        if (!review.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this review");
        }

        reviewRepository.delete(review);
    }

    public List<Review> getReviewsForUser(UUID userId) {
        return reviewRepository.findByUserId(userId);
    }
}
