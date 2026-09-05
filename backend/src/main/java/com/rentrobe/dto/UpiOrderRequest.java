package com.rentrobe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UpiOrderRequest {
    private List<CheckoutRequest.CheckoutItem> items;
    private CheckoutRequest.DeliveryInfo delivery;
    private String upiTransactionId;
    private String screenshotUrl;
    private String promoCode;
    private BigDecimal promoDiscount;
    private BigDecimal protection;
    private BigDecimal depositTotal;
}
