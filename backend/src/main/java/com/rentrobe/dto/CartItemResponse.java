package com.rentrobe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CartItemResponse {
    private String id;
    private String productId;
    private String name;
    private String designer;
    private String image;
    private String size;
    private String usageDate;
    private String rentalStart;
    private String rentalEnd;
    private BigDecimal rentalPrice;
    private BigDecimal securityDeposit;
    private Integer quantity;
}
