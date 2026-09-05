package com.rentrobe.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "products", schema = "public")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String designer;

    @Column(nullable = false)
    private String category;

    @Column(name = "rental_price", nullable = false)
    private BigDecimal rentalPrice;

    @Column(name = "retail_price", nullable = false)
    private BigDecimal retailPrice;

    @Column
    @org.hibernate.annotations.Array(length = 50)
    private String[] sizes;

    @Column
    @org.hibernate.annotations.Array(length = 20)
    private String[] colors;

    private BigDecimal rating;

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(columnDefinition = "text")
    private String description;

    @Column
    @org.hibernate.annotations.Array(length = 50)
    private String[] details;

    @Column
    @org.hibernate.annotations.Array(length = 20)
    private String[] images;

    @Column
    @org.hibernate.annotations.Array(length = 20)
    private String[] occasion;

    private Boolean available;

    @Column(name = "is_featured")
    private Boolean isFeatured;

    @Column(name = "is_new")
    private Boolean isNew;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    @Column(name = "security_deposit")
    private BigDecimal securityDeposit;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
