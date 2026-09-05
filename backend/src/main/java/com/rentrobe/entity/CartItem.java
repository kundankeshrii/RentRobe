package com.rentrobe.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cart_items", schema = "public")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "product_id", nullable = false)
    private UUID productId;

    private String name;
    private String designer;
    private String image;
    private String size;

    @Column(name = "usage_date")
    private LocalDate usageDate;

    @Column(name = "rental_start")
    private LocalDate rentalStart;

    @Column(name = "rental_end")
    private LocalDate rentalEnd;

    @Column(name = "rental_price")
    private BigDecimal rentalPrice;

    @Column(name = "security_deposit")
    private BigDecimal securityDeposit;

    private Integer quantity;

    @CreationTimestamp
    @Column(name = "reserved_at")
    private OffsetDateTime reservedAt;
}
