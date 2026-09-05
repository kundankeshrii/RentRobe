package com.rentrobe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CartItemRequest {
    private String productId;
    private String name;
    private String designer;
    private String image;
    private String size;
    private String usageDate;   // yyyy-MM-dd
    private String rentalStart; // yyyy-MM-dd
    private String rentalEnd;   // yyyy-MM-dd
    private BigDecimal rentalPrice;
    private BigDecimal securityDeposit;
    private Integer quantity;
}
