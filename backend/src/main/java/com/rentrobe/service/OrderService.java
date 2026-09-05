package com.rentrobe.service;

import com.rentrobe.entity.Order;
import com.rentrobe.entity.Product;
import com.rentrobe.dto.CheckoutRequest;
import com.rentrobe.dto.UpiOrderRequest;
import com.rentrobe.repository.OrderRepository;
import com.rentrobe.repository.ProductRepository;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    public List<Order> getOrdersForUser(UUID userId) {
        List<Order> orders = orderRepository.findByUserId(userId, Sort.by(Sort.Direction.DESC, "createdAt"));
        // Enrich with product info
        orders.forEach(this::enrichWithProductInfo);
        return orders;
    }

    public Order getOrderById(UUID orderId, UUID userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!isAdmin && !order.getUserId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }
        enrichWithProductInfo(order);
        return order;
    }

    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        orders.forEach(this::enrichWithProductInfo);
        return orders;
    }

    @Transactional
    public Map<String, String> createStripeSession(CheckoutRequest request, UUID userId) {
        if (stripeSecretKey == null || stripeSecretKey.isBlank() || stripeSecretKey.startsWith("mock")) {
            // Local dev: return a simulated success URL
            String mockSessionId = "mock_session_" + UUID.randomUUID().toString().replace("-", "");
            String origin = request.getOrigin() != null ? request.getOrigin() : "http://localhost:8081";
            return Map.of("url", origin + "/payment-success?session_id=" + mockSessionId, "sessionId", mockSessionId);
        }
        Stripe.apiKey = stripeSecretKey;

        try {
            List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();
            BigDecimal totalAmount = BigDecimal.ZERO;

            for (CheckoutRequest.CheckoutItem item : request.getItems()) {
                BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                totalAmount = totalAmount.add(itemTotal);

                long unitAmountPaise = item.getPrice()
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(0, RoundingMode.HALF_UP)
                        .longValue();

                String dateDesc;
                if (item.getUsageDate() != null) {
                    LocalDate u = LocalDate.parse(item.getUsageDate());
                    LocalDate d = u.minusDays(1);
                    LocalDate p = u.plusDays(1);
                    dateDesc = "Size: " + item.getSize() + " | Usage: " + u + " (Delivery: " + d + ", Pickup: " + p + ")";
                } else {
                    dateDesc = "Size: " + item.getSize() + " | " + item.getRentalStart() + " to " + item.getRentalEnd();
                }

                lineItems.add(SessionCreateParams.LineItem.builder()
                        .setQuantity((long) item.getQuantity())
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("inr")
                                .setUnitAmount(unitAmountPaise)
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName(item.getName() + " - " + item.getDesigner())
                                        .setDescription(dateDesc)
                                        .build())
                                .build())
                        .build());
            }

            String origin = request.getOrigin() != null ? request.getOrigin() : "http://localhost:5173";
            String sessionId = UUID.randomUUID().toString().replace("-", "");

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(origin + "/payment-success?session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(origin + "/checkout")
                    .addAllLineItem(lineItems)
                    .putMetadata("userId", userId.toString())
                    .putMetadata("delivery", serializeDelivery(request.getDelivery()))
                    .build();

            Session session = Session.create(params);

            // Pre-create orders with stripe_session_id
            createOrdersFromStripe(request, userId, session.getId());

            return Map.of("url", session.getUrl(), "sessionId", session.getId());
        } catch (Exception e) {
            throw new RuntimeException("Failed to create Stripe session: " + e.getMessage());
        }
    }

    @Transactional
    public List<Map<String, Object>> validateCheckoutAvailability(List<Map<String, String>> items) {
        List<Map<String, Object>> conflicts = new ArrayList<>();
        for (Map<String, String> item : items) {
            String productIdStr = item.get("product_id");
            if (productIdStr == null) continue;
            UUID productId = UUID.fromString(productIdStr);
            String size = item.get("size");

            LocalDate deliveryDate;
            LocalDate pickupDate;

            if (item.containsKey("usage_date") && item.get("usage_date") != null && !item.get("usage_date").isBlank()) {
                LocalDate usage = LocalDate.parse(item.get("usage_date"));
                deliveryDate = usage.minusDays(1);
                pickupDate = usage.plusDays(1);
            } else {
                deliveryDate = LocalDate.parse(item.get("rental_start"));
                pickupDate = LocalDate.parse(item.get("rental_end"));
            }

            long count = orderRepository.countOverlappingOrders(productId, size, deliveryDate, pickupDate);
            if (count > 0) {
                Map<String, Object> conflict = new HashMap<>();
                conflict.put("product_id", productIdStr);
                conflict.put("size", size);
                conflict.put("delivery_date", deliveryDate.toString());
                conflict.put("pickup_date", pickupDate.toString());
                conflict.put("rental_start", deliveryDate.toString());
                conflict.put("rental_end", pickupDate.toString());
                conflict.put("available", false);
                conflicts.add(conflict);
            }
        }
        return conflicts;
    }

    @Transactional
    public List<Order> createUpiOrders(UpiOrderRequest request, UUID userId) {
        CheckoutRequest.DeliveryInfo delivery = request.getDelivery();
        List<Order> orders = new ArrayList<>();

        for (CheckoutRequest.CheckoutItem item : request.getItems()) {
            BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            if (request.getDepositTotal() != null && request.getItems().size() == 1) {
                itemTotal = itemTotal.add(request.getDepositTotal());
            }

            String orderNum = "RR-" + System.currentTimeMillis() + "-" +
                    UUID.randomUUID().toString().substring(0, 4).toUpperCase();

            LocalDate usageDate = null;
            LocalDate deliveryDate = null;
            LocalDate pickupDate = null;

            if (item.getUsageDate() != null && !item.getUsageDate().isBlank()) {
                usageDate = LocalDate.parse(item.getUsageDate());
                deliveryDate = usageDate.minusDays(1);
                pickupDate = usageDate.plusDays(1);
            } else if (item.getRentalStart() != null) {
                deliveryDate = LocalDate.parse(item.getRentalStart());
                pickupDate = LocalDate.parse(item.getRentalEnd());
                usageDate = deliveryDate.plusDays(1);
            }

            Order order = Order.builder()
                    .userId(userId)
                    .productId(item.getProductId() != null ? UUID.fromString(item.getProductId()) : null)
                    .orderNumber(orderNum)
                    .size(item.getSize())
                    .usageDate(usageDate)
                    .deliveryDate(deliveryDate)
                    .pickupDate(pickupDate)
                    .rentalStart(deliveryDate)
                    .rentalEnd(pickupDate)
                    .totalPrice(itemTotal)
                    .securityDeposit(item.getSecurityDeposit() != null ? item.getSecurityDeposit() : BigDecimal.ZERO)
                    .depositStatus("held")
                    .depositDeductionAmount(BigDecimal.ZERO)
                    .status("upcoming")
                    .deliveryName(delivery.getFirstName() + " " + delivery.getLastName())
                    .deliveryEmail(delivery.getEmail())
                    .deliveryPhone(delivery.getPhone())
                    .deliveryAddress(delivery.getAddress())
                    .deliveryCity(delivery.getCity())
                    .deliveryPin(delivery.getPin())
                    .promoCode(request.getPromoCode())
                    .promoDiscount(request.getPromoDiscount())
                    .paymentMethod("upi_qr")
                    .paymentStatus("pending_verification")
                    .upiTransactionId(request.getUpiTransactionId())
                    .paymentScreenshotUrl(request.getScreenshotUrl())
                    .build();

            orders.add(orderRepository.save(order));
        }

        return orders;
    }

    @Transactional
    public Order updateOrder(UUID orderId, Map<String, Object> updates) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (updates.containsKey("status")) order.setStatus((String) updates.get("status"));
        if (updates.containsKey("deliveryStatus")) order.setDeliveryStatus((String) updates.get("deliveryStatus"));
        if (updates.containsKey("trackingNumber")) order.setTrackingNumber((String) updates.get("trackingNumber"));
        if (updates.containsKey("estimatedDeliveryDate")) {
            String d = (String) updates.get("estimatedDeliveryDate");
            order.setEstimatedDeliveryDate(d != null ? LocalDate.parse(d) : null);
        }
        if (updates.containsKey("depositStatus")) order.setDepositStatus((String) updates.get("depositStatus"));
        if (updates.containsKey("depositDeductionAmount")) {
            order.setDepositDeductionAmount(new BigDecimal(updates.get("depositDeductionAmount").toString()));
        }

        return orderRepository.save(order);
    }

    @Transactional
    public Order verifyPayment(UUID orderId, String action) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if ("verified".equals(action)) {
            order.setPaymentStatus("verified");
            order.setStatus("upcoming");
            order.setPaymentVerifiedAt(OffsetDateTime.now());
        } else if ("rejected".equals(action)) {
            order.setPaymentStatus("rejected");
            order.setStatus("cancelled");
        }

        return orderRepository.save(order);
    }

    @Transactional
    public List<Order> handleStripeSuccess(String sessionId) {
        List<Order> orders = orderRepository.findByStripeSessionId(sessionId);
        if (orders.isEmpty()) {
            throw new RuntimeException("Order not found for session: " + sessionId);
        }
        for (Order order : orders) {
            order.setPaymentStatus("paid");
            order.setStatus("upcoming");
            order.setPaymentVerifiedAt(OffsetDateTime.now());
            orderRepository.save(order);
        }
        return orders;
    }

    private void createOrdersFromStripe(CheckoutRequest request, UUID userId, String stripeSessionId) {
        CheckoutRequest.DeliveryInfo delivery = request.getDelivery();

        for (CheckoutRequest.CheckoutItem item : request.getItems()) {
            BigDecimal total = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            String orderNum = "RR-" + System.currentTimeMillis() + "-" +
                    UUID.randomUUID().toString().substring(0, 4).toUpperCase();

            LocalDate usageDate = null;
            LocalDate deliveryDate = null;
            LocalDate pickupDate = null;

            if (item.getUsageDate() != null && !item.getUsageDate().isBlank()) {
                usageDate = LocalDate.parse(item.getUsageDate());
                deliveryDate = usageDate.minusDays(1);
                pickupDate = usageDate.plusDays(1);
            } else if (item.getRentalStart() != null) {
                deliveryDate = LocalDate.parse(item.getRentalStart());
                pickupDate = LocalDate.parse(item.getRentalEnd());
                usageDate = deliveryDate.plusDays(1);
            }

            Order order = Order.builder()
                    .userId(userId)
                    .productId(item.getProductId() != null ? UUID.fromString(item.getProductId()) : null)
                    .orderNumber(orderNum)
                    .size(item.getSize())
                    .usageDate(usageDate)
                    .deliveryDate(deliveryDate)
                    .pickupDate(pickupDate)
                    .rentalStart(deliveryDate)
                    .rentalEnd(pickupDate)
                    .totalPrice(total)
                    .securityDeposit(item.getSecurityDeposit() != null ? item.getSecurityDeposit() : BigDecimal.ZERO)
                    .depositStatus("held")
                    .depositDeductionAmount(BigDecimal.ZERO)
                    .status("upcoming")
                    .deliveryName(delivery.getFirstName() + " " + delivery.getLastName())
                    .deliveryEmail(delivery.getEmail())
                    .deliveryPhone(delivery.getPhone())
                    .deliveryAddress(delivery.getAddress())
                    .deliveryCity(delivery.getCity())
                    .deliveryPin(delivery.getPin())
                    .promoCode(request.getPromoCode())
                    .promoDiscount(request.getPromoDiscount())
                    .paymentMethod("stripe")
                    .paymentStatus("pending")
                    .stripeSessionId(stripeSessionId)
                    .build();

            orderRepository.save(order);
        }
    }

    private void enrichWithProductInfo(Order order) {
        if (order.getProductId() != null) {
            productRepository.findById(order.getProductId()).ifPresent(p -> {
                order.setProductName(p.getName());
                order.setProductDesigner(p.getDesigner());
                order.setProductImage(p.getImages() != null && p.getImages().length > 0 ? p.getImages()[0] : null);
                order.setProductRentalPrice(p.getRentalPrice());
                order.setProductRetailPrice(p.getRetailPrice());
            });
        }
    }

    private String serializeDelivery(CheckoutRequest.DeliveryInfo d) {
        if (d == null) return "";
        return d.getFirstName() + " " + d.getLastName() + "|" + d.getPhone() + "|" + d.getAddress() + " " + d.getCity() + " " + d.getPin();
    }
}
