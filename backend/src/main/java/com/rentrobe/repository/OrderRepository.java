package com.rentrobe.repository;

import com.rentrobe.entity.Order;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserId(UUID userId, Sort sort);
    List<Order> findByStripeSessionId(String stripeSessionId);
    List<Order> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.productId = :productId AND o.size = :size AND o.status <> 'cancelled' AND o.rentalStart <= :rentalEnd AND o.rentalEnd >= :rentalStart")
    long countOverlappingOrders(UUID productId, String size, LocalDate rentalStart, LocalDate rentalEnd);

    boolean existsByUserIdAndProductIdAndPaymentStatus(UUID userId, UUID productId, String paymentStatus);

    @Query("SELECT o FROM Order o WHERE o.productId = :productId AND o.status <> 'cancelled' AND o.rentalEnd >= :fromDate AND o.rentalStart <= :toDate")
    List<Order> findOverlappingOrders(UUID productId, LocalDate fromDate, LocalDate toDate);
}

