package org.nthuli_shop.nthuli_shop.payment.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaStkPushRequest;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaStkPushResponse;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaCallbackResponse;
import org.nthuli_shop.nthuli_shop.payment.dto.PaymentResponseDto;
import org.nthuli_shop.nthuli_shop.payment.service.MpesaService;
import org.nthuli_shop.nthuli_shop.payment.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
     * Authentication: NOT REQUIRED (unauthenticated users can make payments)
     */
    @PostMapping("/mpesa/stk-push")
    public ResponseEntity<?> initiateMpesaStkPush(
            @RequestBody MpesaStkPushRequest request) {
        try {
            // Validate email
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Email is required"));
            }

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

            MpesaStkPushResponse response = paymentService.initiateMpesaPayment(request);
            
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
     * Get payment by payment ID
     * GET /api/payments/{paymentId}
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<?> getPayment(@PathVariable Long paymentId) {
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
     */
    @GetMapping("/user/all")
    public ResponseEntity<?> getUserPayments(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("User not authenticated"));
            }

            Long userId = extractUserIdFromAuth(authentication);
            List<PaymentResponseDto> payments = paymentService.getUserPayments(userId);
            
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
     */
    @GetMapping("/user/completed")
    public ResponseEntity<?> getUserCompletedPayments(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("User not authenticated"));
            }

            Long userId = extractUserIdFromAuth(authentication);
            List<PaymentResponseDto> payments = paymentService.getUserCompletedPayments(userId);
            
            return ResponseEntity.ok(createSuccessResponse("Completed payments retrieved successfully", payments));

        } catch (Exception e) {
            log.error("Error retrieving completed payments", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve completed payments"));
        }
    }

    /**
     * Get all payments by email (for unauthenticated users)
     * GET /api/payments/email/{email}
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<?> getPaymentsByEmail(@PathVariable String email) {
        try {
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Email is required"));
            }

            List<PaymentResponseDto> payments = paymentService.getPaymentsByEmail(email);
            
            return ResponseEntity.ok(createSuccessResponse("Payments retrieved successfully", payments));

        } catch (Exception e) {
            log.error("Error retrieving payments by email", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve payments"));
        }
    }

    /**
     * Get completed payments by email (for unauthenticated users)
     * GET /api/payments/email/{email}/completed
     */
    @GetMapping("/email/{email}/completed")
    public ResponseEntity<?> getCompletedPaymentsByEmail(@PathVariable String email) {
        try {
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Email is required"));
            }

            List<PaymentResponseDto> payments = paymentService.getCompletedPaymentsByEmail(email);
            
            return ResponseEntity.ok(createSuccessResponse("Completed payments retrieved successfully", payments));

        } catch (Exception e) {
            log.error("Error retrieving completed payments by email", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to retrieve completed payments"));
        }
    }

    // Helper methods

    private Long extractUserIdFromAuth(Authentication authentication) {
        // Extract user ID from authentication principal
        Object principal = authentication.getPrincipal();
        if (principal instanceof org.nthuli_shop.nthuli_shop.Authentication.entity.User) {
            org.nthuli_shop.nthuli_shop.Authentication.entity.User user = 
                    (org.nthuli_shop.nthuli_shop.Authentication.entity.User) principal;
            return user.getId();
        }
        // Fallback - return 1L if unable to extract
        return 1L;
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
