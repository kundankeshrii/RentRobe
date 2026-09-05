package com.rentrobe.controller;

import com.rentrobe.entity.Order;
import com.rentrobe.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final OrderRepository orderRepository;

    @PostMapping("/unavailable-dates")
    public ResponseEntity<List<String>> getUnavailableDates(@RequestBody Map<String, String> body) {
        String productIdStr = body.get("productId");
        String fromDateStr = body.get("fromDate");
        String toDateStr = body.get("toDate");

        if (productIdStr == null || fromDateStr == null || toDateStr == null) {
            return ResponseEntity.badRequest().build();
        }

        UUID productId = UUID.fromString(productIdStr);
        LocalDate fromDate = LocalDate.parse(fromDateStr);
        LocalDate toDate = LocalDate.parse(toDateStr);

        List<Order> orders = orderRepository.findOverlappingOrders(productId, fromDate, toDate);
        Set<LocalDate> unavailableSet = new HashSet<>();

        for (Order order : orders) {
            LocalDate start = order.getRentalStart();
            LocalDate end = order.getRentalEnd();
            
            LocalDate current = start;
            while (!current.isAfter(end)) {
                if (!current.isBefore(fromDate) && !current.isAfter(toDate)) {
                    unavailableSet.add(current);
                }
                current = current.plusDays(1);
            }
        }

        List<String> sortedDates = unavailableSet.stream()
                .sorted()
                .map(LocalDate::toString)
                .collect(Collectors.toList());

        return ResponseEntity.ok(sortedDates);
    }
}
