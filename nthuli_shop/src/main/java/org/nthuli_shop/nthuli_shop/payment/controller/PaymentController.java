package org.nthuli_shop.nthuli_shop.payment.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaStkPushRequest;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaStkPushResponse;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaCallbackResponse;
import org.nthuli_shop.nthuli_shop.payment.dto.PaymentResponseDto;
import org.nthuli_shop.nthuli_shop.payment.service.MpesaService;
import org.nthuli_shop.nthuli_shop.payment.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final MpesaService mpesaService;

    /**
     * Initiate M-Pesa STK Push payment
     * POST /api/payments/mpesa/stk-push
     * Authentication: REQUIRED
     */
    @PostMapping("/mpesa/stk-push")
    public ResponseEntity<?> initiateMpesaStkPush(
            @AuthenticationPrincipal User user,
            @RequestBody MpesaStkPushRequest request) {
        try {
            // Validate phone number
            if (request.getPhoneNumber() == null || request.getPhoneNumber().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Phone number is required"));
            }

            // Validate amount
            if (request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Amount must be greater than 0"));
            }

            // Validate order ID
            if (request.getOrderId() == null) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Order ID is required"));
            }

            MpesaStkPushResponse response = paymentService.initiateMpesaPayment(user, request);
            
            return ResponseEntity.ok()
                    .body(createSuccessResponse("STK Push initiated successfully", response));

        } catch (Exception e) {
            log.error("Error initiating M-Pesa STK Push", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to initiate STK Push: " + e.getMessage()));
        }
    }

    /**
     * M-Pesa Callback endpoint - receives payment confirmation
     * POST /api/payments/mpesa/callback
     */
    @PostMapping("/mpesa/callback")
    public ResponseEntity<?> mpesaCallback(@RequestBody MpesaCallbackResponse callbackResponse) {
        try {
            log.info("Received M-Pesa callback");
            mpesaService.handleMpesaCallback(callbackResponse);
            
            // M-Pesa expects a success response
            return ResponseEntity.ok()
                    .body(Map.of("ResultCode", 0, "ResultDesc", "Callback received successfully"));

        } catch (Exception e) {
            log.error("Error processing M-Pesa callback", e);
            return ResponseEntity.ok()
                    .body(Map.of("ResultCode", 1, "ResultDesc", "Error processing callback"));
        }
    }

    /**
     * Get authenticated user's payment by payment ID
     * GET /api/payments/{paymentId}
     * Authentication: REQUIRED
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getPayment(
            @AuthenticationPrincipal User user,
            @PathVariable Long paymentId) {
        try {
            PaymentResponseDto payment = paymentService.getPaymentById(paymentId);
            return ResponseEntity.ok(createSuccessResponse("Payment retrieved successfully", payment));
        } catch (Exception e) {
            log.error("Error retrieving payment", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Payment not found"));
        }
    }

    /**
     * Get payment by order ID
     * GET /api/payments/order/{orderId}
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getPaymentByOrderId(@PathVariable Long orderId) {
        try {
            PaymentResponseDto payment = paymentService.getPaymentByOrderId(orderId);
            return ResponseEntity.ok(createSuccessResponse("Payment retrieved successfully", payment));
        } catch (Exception e) {
            log.error("Error retrieving payment for order", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Payment not found for this order"));
        }
    }

    /**
     * Get all payments for authenticated user
     * GET /api/payments/user/all
     * Authentication: REQUIRED
     */
    @GetMapping("/user/all")
    public ResponseEntity<?> getUserPayments(@AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("User not authenticated"));
            }

            List<PaymentResponseDto> payments = paymentService.getUserPayments(user);
            
            return ResponseEntity.ok(createSuccessResponse("User payments retrieved successfully", payments));

        } catch (Exception e) {
            log.error("Error retrieving user payments", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve payments"));
        }
    }

    /**
     * Get completed payments for authenticated user
     * GET /api/payments/user/completed
     * Authentication: REQUIRED
     */
    @GetMapping("/user/completed")
    public ResponseEntity<?> getUserCompletedPayments(@AuthenticationPrincipal User user) {
        try {
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("User not authenticated"));
            }

            List<PaymentResponseDto> payments = paymentService.getUserCompletedPayments(user);
            
            return ResponseEntity.ok(createSuccessResponse("Completed payments retrieved successfully", payments));

        } catch (Exception e) {
            log.error("Error retrieving completed payments", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve completed payments"));
        }
    }

    private Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("success", "false");
        response.put("message", message);
        return response;
    }
}
