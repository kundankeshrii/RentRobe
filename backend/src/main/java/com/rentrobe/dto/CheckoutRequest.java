package com.rentrobe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CheckoutRequest {
    private List<CheckoutItem> items;
    private DeliveryInfo delivery;
    private String promoCode;
    private BigDecimal promoDiscount;
    private BigDecimal protection;
    private BigDecimal depositTotal;
    private String origin; // for Stripe redirect URLs

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CheckoutItem {
        private String productId;
        private String name;
        private String designer;
        private String image;
        private String size;
        private String usageDate;
        private String deliveryDate;
        private String pickupDate;
        private String rentalStart;
        private String rentalEnd;
        private BigDecimal price;
        private Integer quantity;
        private Integer days;
        private BigDecimal securityDeposit;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class DeliveryInfo {
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String address;
        private String city;
        private String pin;
    }
}
