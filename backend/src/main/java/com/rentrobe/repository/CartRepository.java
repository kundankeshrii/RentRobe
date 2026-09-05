package com.rentrobe.repository;

import com.rentrobe.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<CartItem, UUID> {

    List<CartItem> findByUserId(UUID userId);

    void deleteByUserId(UUID userId);



    @Query("SELECT c FROM CartItem c WHERE c.userId = :userId AND c.productId = :productId AND c.size = :size AND c.rentalStart = :rentalStart AND c.rentalEnd = :rentalEnd")
    Optional<CartItem> findDuplicate(UUID userId, UUID productId, String size, java.time.LocalDate rentalStart, java.time.LocalDate rentalEnd);
}
