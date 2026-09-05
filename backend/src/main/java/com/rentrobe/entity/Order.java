package com.rentrobe.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "orders", schema = "public")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "product_id")
    private UUID productId;

    @Column(name = "order_number")
    private String orderNumber;

    private String size;

    @Column(name = "usage_date")
    private LocalDate usageDate;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "pickup_date")
    private LocalDate pickupDate;

    @Column(name = "rental_start")
    private LocalDate rentalStart;

    @Column(name = "rental_end")
    private LocalDate rentalEnd;

    @Column(name = "total_price")
    private BigDecimal totalPrice;

    private String status;

    @Column(name = "delivery_status")
    private String deliveryStatus;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;

    @Column(name = "security_deposit")
    private BigDecimal securityDeposit;

    @Column(name = "deposit_status")
    private String depositStatus;

    @Column(name = "deposit_deduction_amount")
    private BigDecimal depositDeductionAmount;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "upi_transaction_id")
    private String upiTransactionId;

    @Column(name = "payment_screenshot_url")
    private String paymentScreenshotUrl;

    @Column(name = "payment_verified_at")
    private OffsetDateTime paymentVerifiedAt;

    @Column(name = "delivery_name")
    private String deliveryName;

    @Column(name = "delivery_email")
    private String deliveryEmail;

    @Column(name = "delivery_phone")
    private String deliveryPhone;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "delivery_city")
    private String deliveryCity;

    @Column(name = "delivery_pin")
    private String deliveryPin;

    @Column(name = "promo_code")
    private String promoCode;

    @Column(name = "promo_discount")
    private BigDecimal promoDiscount;

    @Column(name = "stripe_session_id")
    private String stripeSessionId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    // Transient join for product info
    @Transient
    private String productName;

    @Transient
    private String productDesigner;

    @Transient
    private String productImage;

    @Transient
    private BigDecimal productRentalPrice;

    @Transient
    private BigDecimal productRetailPrice;
}
