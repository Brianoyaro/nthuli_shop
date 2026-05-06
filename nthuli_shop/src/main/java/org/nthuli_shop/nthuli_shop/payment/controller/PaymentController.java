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
            log.info("[PAYMENT_FLOW] STK Push request received - User: {}, Order: {}, Amount: {}, Phone: {}",
                    user.getId(), request.getOrderId(), request.getAmount(), request.getPhoneNumber());
            
            // Validate phone number
            if (request.getPhoneNumber() == null || request.getPhoneNumber().isEmpty()) {
                log.warn("[PAYMENT_FLOW] Validation failed: Phone number is required");
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Phone number is required"));
            }

            // Validate amount
            if (request.getAmount() == null || request.getAmount().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                log.warn("[PAYMENT_FLOW] Validation failed: Invalid amount - {}", request.getAmount());
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Amount must be greater than 0"));
            }

            // Validate order ID
            if (request.getOrderId() == null) {
                log.warn("[PAYMENT_FLOW] Validation failed: Order ID is required");
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Order ID is required"));
            }

            log.info("[PAYMENT_FLOW] All validations passed, calling PaymentService");
            MpesaStkPushResponse response = paymentService.initiateMpesaPayment(user, request);
            
            log.info("[PAYMENT_FLOW] STK Push response received - CheckoutRequestId: {}, ResponseCode: {}",
                    response.getCheckoutRequestId(), response.getResponseCode());
            return ResponseEntity.ok()
                    .body(createSuccessResponse("STK Push initiated successfully", response));

        } catch (Exception e) {
            log.error("[PAYMENT_FLOW] ERROR initiating M-Pesa STK Push", e);
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
            log.info("[PAYMENT_FLOW] M-Pesa callback received");
            log.debug("[PAYMENT_FLOW] Callback payload: {}", callbackResponse);
            
            mpesaService.handleMpesaCallback(callbackResponse);
            
            log.info("[PAYMENT_FLOW] Callback processed successfully");
            // M-Pesa expects a success response
            return ResponseEntity.ok()
                    .body(Map.of("ResultCode", 0, "ResultDesc", "Callback received successfully"));

        } catch (Exception e) {
            log.error("[PAYMENT_FLOW] ERROR processing M-Pesa callback", e);
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
            log.info("[PAYMENT_FLOW] Get payment request - PaymentId: {}, UserId: {}", paymentId, user.getId());
            PaymentResponseDto payment = paymentService.getPaymentById(paymentId);
            log.info("[PAYMENT_FLOW] Payment retrieved - Status: {}", payment.getPaymentStatus());
            return ResponseEntity.ok(createSuccessResponse("Payment retrieved successfully", payment));
        } catch (Exception e) {
            log.error("[PAYMENT_FLOW] ERROR retrieving payment - PaymentId: {}", paymentId, e);
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
            log.info("[PAYMENT_FLOW] Get payment by order - OrderId: {}", orderId);
            PaymentResponseDto payment = paymentService.getPaymentByOrderId(orderId);
            log.info("[PAYMENT_FLOW] Payment found - PaymentId: {}, Status: {}", payment.getId(), payment.getPaymentStatus());
            return ResponseEntity.ok(createSuccessResponse("Payment retrieved successfully", payment));
        } catch (Exception e) {
            log.error("[PAYMENT_FLOW] ERROR retrieving payment for order - OrderId: {}", orderId, e);
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
                log.warn("[PAYMENT_FLOW] User not authenticated for get all payments");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("User not authenticated"));
            }

            log.info("[PAYMENT_FLOW] Get all payments for user - UserId: {}", user.getId());
            List<PaymentResponseDto> payments = paymentService.getUserPayments(user);
            log.info("[PAYMENT_FLOW] Retrieved {} payments for user", payments.size());
            
            return ResponseEntity.ok(createSuccessResponse("User payments retrieved successfully", payments));

        } catch (Exception e) {
            log.error("[PAYMENT_FLOW] ERROR retrieving user payments", e);
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
                log.warn("[PAYMENT_FLOW] User not authenticated for get completed payments");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("User not authenticated"));
            }

            log.info("[PAYMENT_FLOW] Get completed payments for user - UserId: {}", user.getId());
            List<PaymentResponseDto> payments = paymentService.getUserCompletedPayments(user);
            log.info("[PAYMENT_FLOW] Retrieved {} completed payments for user", payments.size());
            
            return ResponseEntity.ok(createSuccessResponse("Completed payments retrieved successfully", payments));

        } catch (Exception e) {
            log.error("[PAYMENT_FLOW] ERROR retrieving completed payments", e);
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
