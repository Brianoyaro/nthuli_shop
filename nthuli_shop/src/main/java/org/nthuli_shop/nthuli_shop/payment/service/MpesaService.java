package org.nthuli_shop.nthuli_shop.payment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Credentials;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.payment.config.MpesaConfig;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaCallbackResponse;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaStkPushRequest;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaStkPushResponse;
import org.nthuli_shop.nthuli_shop.payment.entity.Payment_Payment;
import org.nthuli_shop.nthuli_shop.payment.enums.PaymentMethod;
import org.nthuli_shop.nthuli_shop.payment.enums.PaymentStatus;
import org.nthuli_shop.nthuli_shop.payment.repository.Payment_PaymentRepository;
import org.nthuli_shop.nthuli_shop.payment.util.MpesaUtil;
import org.nthuli_shop.nthuli_shop.order.repository.OrderRepository;
import org.nthuli_shop.nthuli_shop.order.entity.Order;
import org.nthuli_shop.nthuli_shop.cart.repository.CartItemRepository;
import org.nthuli_shop.nthuli_shop.cart.repository.CartRepository;
import org.nthuli_shop.nthuli_shop.Authentication.service.EmailService;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MpesaService {

    private final MpesaConfig mpesaConfig;
    private final Payment_PaymentRepository paymentPaymentRepository;
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OkHttpClient okHttpClient;
    private final ObjectMapper objectMapper;
    private final EmailService emailService;

    /**
     * Get M-Pesa access token for API authentication using OkHttp
     */
    public String getAccessToken() {
        log.info("[MPESA_SERVICE] getAccessToken START - Requesting token from M-Pesa API");
        try {
            // Get credentials
            String consumerKey = mpesaConfig.getConsumerKey();
            String consumerSecret = mpesaConfig.getConsumerSecret();
            String accessTokenUrl = mpesaConfig.getAccessTokenUrl();
            
            log.info("[MPESA_SERVICE] 🔍 Consumer Key loaded: {}", 
                consumerKey != null && !consumerKey.isEmpty() && !consumerKey.contains("YOUR_") ? 
                consumerKey.substring(0, Math.min(15, consumerKey.length())) + "..." : "NULL/EMPTY/PLACEHOLDER");
            log.info("[MPESA_SERVICE] 🔍 Consumer Secret loaded: {}", 
                consumerSecret != null && !consumerSecret.isEmpty() && !consumerSecret.contains("YOUR_") ? 
                consumerSecret.substring(0, Math.min(15, consumerSecret.length())) + "..." : "NULL/EMPTY/PLACEHOLDER");
            log.info("[MPESA_SERVICE] 🔍 Access Token URL: {}", accessTokenUrl);

            // Create authorization header using OkHttp's Credentials.basic()
            String credentials = Credentials.basic(consumerKey, consumerSecret);
            log.debug("[MPESA_SERVICE] getAccessToken - Credentials prepared");

            // Build request
            Request request = new Request.Builder()
                    .url(accessTokenUrl)
                    .get()
                    .addHeader("Authorization", credentials)
                    .addHeader("Content-Type", "application/json")
                    .build();
            
            log.debug("[MPESA_SERVICE] getAccessToken - Making GET request to {}", accessTokenUrl);

            // Execute request
            try (Response response = okHttpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    String errorBody = response.body() != null ? response.body().string() : "No response body";
                    log.error("[MPESA_SERVICE] getAccessToken FAILED - Status: {}, Body: {}", response.code(), errorBody);
                    throw new RuntimeException("Failed to get access token. Status: " + response.code());
                }

                String responseBody = response.body().string();
                JsonNode jsonResponse = objectMapper.readTree(responseBody);
                String token = jsonResponse.get("access_token").asText();
                
                log.info("[MPESA_SERVICE] getAccessToken SUCCESS - Token obtained");
                log.debug("[MPESA_SERVICE] getAccessToken - Token length: {}", token.length());
                return token;
            }
        } catch (IOException e) {
            log.error("[MPESA_SERVICE] getAccessToken IO ERROR", e);
            throw new RuntimeException("Failed to get M-Pesa access token: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("[MPESA_SERVICE] getAccessToken ERROR", e);
            throw new RuntimeException("Failed to get M-Pesa access token: " + e.getMessage(), e);
        }
    }

    /**
     * Initiate STK Push request for M-Pesa payment using OkHttp
     */
    public MpesaStkPushResponse initiateStkPush(User user, MpesaStkPushRequest request) {
        log.info("[MPESA_SERVICE] initiateStkPush START - UserId: {}, OrderId: {}, Amount: {}", 
                user.getId(), request.getOrderId(), request.getAmount());
        try {
            // Fetch order
            log.debug("[MPESA_SERVICE] initiateStkPush - Fetching order {}", request.getOrderId());
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found with id: " + request.getOrderId()));
            log.debug("[MPESA_SERVICE] initiateStkPush - Order found: {}", order.getId());
            
            // Sanitize phone number
            String phoneNumber = MpesaUtil.sanitizePhoneNumber(request.getPhoneNumber());
            log.debug("[MPESA_SERVICE] initiateStkPush - Phone sanitized to: {}", phoneNumber);
            
            // Generate timestamp and password
            String timestamp = MpesaUtil.generateTimestamp();
            log.debug("[MPESA_SERVICE] geneerating password with PartyB: {}, PassKey: {}, Timestamp: {}", 
                    mpesaConfig.getPartyB(), mpesaConfig.getPassKey(), timestamp);
            String password = MpesaUtil.generatePassword(
                    mpesaConfig.getPartyB(),
                    mpesaConfig.getPassKey(),
                    timestamp
            );
            log.debug("[MPESA_SERVICE] initiateStkPush - Timestamp: {}, Password generated", timestamp);

            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("BusinessShortCode", mpesaConfig.getPartyB());
            requestBody.put("Password", password);
            requestBody.put("Timestamp", timestamp);
            requestBody.put("TransactionType", "CustomerPayBillOnline");
            requestBody.put("Amount", request.getAmount().intValue());
            requestBody.put("PartyA", phoneNumber);
            requestBody.put("PartyB", mpesaConfig.getPartyB());
            requestBody.put("PhoneNumber", phoneNumber);
            requestBody.put("CallBackURL", mpesaConfig.getCallbackUrl());
            requestBody.put("AccountReference", "ORDER-" + order.getId());
            requestBody.put("TransactionDesc", request.getDescription() != null ? 
                    request.getDescription() : "Payment for order");
            log.debug("[MPESA_SERVICE] initiateStkPush - Request body prepared");

            // Get access token
            String accessToken = getAccessToken();
            log.debug("[MPESA_SERVICE] initiateStkPush - Access token retrieved successfully");

            // Serialize request body to JSON
            String jsonBody = objectMapper.writeValueAsString(requestBody);
            log.debug("[MPESA_SERVICE] initiateStkPush - Request JSON: {}", jsonBody);

            // Build request
            RequestBody body = RequestBody.create(jsonBody, okhttp3.MediaType.parse("application/json"));
            Request httpRequest = new Request.Builder()
                    .url(mpesaConfig.getStkPushUrl())
                    .post(body)
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .addHeader("Content-Type", "application/json")
                    .build();

            log.debug("[MPESA_SERVICE] initiateStkPush - Making POST request to {}", mpesaConfig.getStkPushUrl());

            // Execute request
            try (Response response = okHttpClient.newCall(httpRequest).execute()) {
                String responseBody = response.body().string();
                log.debug("[MPESA_SERVICE] initiateStkPush - Response Code: {}, Body: {}", response.code(), responseBody);

                if (!response.isSuccessful()) {
                    log.error("[MPESA_SERVICE] initiateStkPush FAILED - Status: {}, Response: {}", response.code(), responseBody);
                    throw new RuntimeException("Failed to initiate STK Push. Status: " + response.code() + ", Response: " + responseBody);
                }

                JsonNode responseNode = objectMapper.readTree(responseBody);
                
                String merchantRequestId = responseNode.get("MerchantRequestID").asText();
                String checkoutRequestId = responseNode.get("CheckoutRequestID").asText();
                String responseCode = responseNode.get("ResponseCode").asText();
                String responseDescription = responseNode.get("ResponseDescription").asText();
                String customerMessage = responseNode.get("CustomerMessage").asText();

                log.info("[MPESA_SERVICE] initiateStkPush - M-Pesa API response received - ResponseCode: {}", responseCode);
                log.debug("[MPESA_SERVICE] initiateStkPush - MerchantRequestID: {}, CheckoutRequestID: {}", 
                        merchantRequestId, checkoutRequestId);

                // Save payment record with authenticated user
                Payment_Payment paymentPayment = org.nthuli_shop.nthuli_shop.payment.entity.Payment_Payment.builder()
                        .user(user)
                        .order(order)
                        .amount(request.getAmount())
                        .paymentMethod(PaymentMethod.MPESA_STK_PUSH)
                        .paymentStatus(PaymentStatus.PENDING)
                        .transactionId(checkoutRequestId)
                        .mpesaReference(merchantRequestId)
                        .description(request.getDescription())
                        .build();
                
                log.debug("[MPESA_SERVICE] initiateStkPush - Saving payment record to database");
                paymentPaymentRepository.save(paymentPayment);
                log.info("[MPESA_SERVICE] initiateStkPush SUCCESS - Payment saved with ID: {}, Status: PENDING", 
                        paymentPayment.getId());

                return MpesaStkPushResponse.builder()
                        .merchantRequestId(merchantRequestId)
                        .checkoutRequestId(checkoutRequestId)
                        .responseCode(responseCode)
                        .responseDescription(responseDescription)
                        .customerMessage(customerMessage)
                        .build();
            }
        } catch (IOException e) {
            log.error("[MPESA_SERVICE] initiateStkPush IO ERROR", e);
            throw new RuntimeException("Failed to initiate STK Push: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("[MPESA_SERVICE] initiateStkPush UNEXPECTED ERROR", e);
            throw new RuntimeException("Unexpected error: " + e.getMessage(), e);
        }
    }

    /**
     * Handle M-Pesa callback after user enters PIN
     */
    public void handleMpesaCallback(MpesaCallbackResponse callbackResponse) {
        log.info("[MPESA_SERVICE] handleMpesaCallback START - Processing payment callback");
        try {
            if (callbackResponse == null || callbackResponse.getBody() == null) {
                log.error("[MPESA_SERVICE] handleMpesaCallback ERROR - Invalid callback response received: body is null");
                return;
            }

            MpesaCallbackResponse.CallbackBody.StkCallback stkCallback = 
                    callbackResponse.getBody().getStkCallback();

            if (stkCallback == null) {
                log.error("[MPESA_SERVICE] handleMpesaCallback ERROR - STK Callback is null");
                return;
            }

            String checkoutRequestId = stkCallback.getCheckoutRequestId();
            Integer resultCode = stkCallback.getResultCode();
            String resultDesc = stkCallback.getResultDesc();

            log.info("[MPESA_SERVICE] handleMpesaCallback - CheckoutRequestId: {}, ResultCode: {}, Description: {}", 
                    checkoutRequestId, resultCode, resultDesc);

            // Find payment by transaction ID
            Payment_Payment paymentPayment = paymentPaymentRepository.findByTransactionId(checkoutRequestId)
                    .orElse(null);

            if (paymentPayment == null) {
                log.error("[MPESA_SERVICE] handleMpesaCallback ERROR - Payment not found for checkoutRequestId: {}", 
                        checkoutRequestId);
                return;
            }

            log.debug("[MPESA_SERVICE] handleMpesaCallback - Payment found - PaymentId: {}, OrderId: {}", 
                    paymentPayment.getId(), paymentPayment.getOrder().getId());

            if (resultCode == 0) {
                // Payment successful
                log.info("[MPESA_SERVICE] handleMpesaCallback - Payment SUCCESSFUL - OrderId: {}", 
                        paymentPayment.getOrder().getId());
                paymentPayment.setPaymentStatus(PaymentStatus.COMPLETED);
                
                // Clear user's cart after successful payment
                try {
                    Long userId = paymentPayment.getUser().getId();
                    var cart = cartRepository.findByUserId(userId);
                    if (cart.isPresent()) {
                        cartItemRepository.deleteByCartId(cart.get().getId());
                        log.info("[MPESA_SERVICE] handleMpesaCallback - Cart cleared for user: {} after successful payment", userId);
                    }
                } catch (Exception e) {
                    log.warn("[MPESA_SERVICE] handleMpesaCallback - Failed to clear cart after successful payment", e);
                }
                
                // Extract callback metadata
                if (stkCallback.getCallbackMetadata() != null && 
                    stkCallback.getCallbackMetadata().getItems() != null) {
                    
                    List<MpesaCallbackResponse.CallbackBody.StkCallback.CallbackMetadata.CallbackItem> items = 
                            stkCallback.getCallbackMetadata().getItems();
                    
                    log.debug("[MPESA_SERVICE] handleMpesaCallback - Found {} callback metadata items", items.size());
                    for (var item : items) {
                        log.debug("[MPESA_SERVICE] handleMpesaCallback - Item: {}", item.getName());
                        if ("MpesaReceiptNumber".equals(item.getName())) {
                            String receipt = item.getValue().toString();
                            paymentPayment.setMpesaReference(receipt);
                            log.info("[MPESA_SERVICE] handleMpesaCallback - M-Pesa Receipt: {}", receipt);
                        }
                    }
                }
            } else if (resultCode == 1032) {
                // User cancelled the STK prompt
                log.info("[MPESA_SERVICE] handleMpesaCallback - Payment CANCELLED BY USER - OrderId: {}, ResultCode: {}", 
                        paymentPayment.getOrder().getId(), resultCode);
                paymentPayment.setPaymentStatus(PaymentStatus.CANCELLED);
            } else {
                // Payment failed (other error codes)
                log.warn("[MPESA_SERVICE] handleMpesaCallback - Payment FAILED - ResultCode: {}, Description: {}", 
                        resultCode, resultDesc);
                paymentPayment.setPaymentStatus(PaymentStatus.FAILED);
            }

            log.debug("[MPESA_SERVICE] handleMpesaCallback - Saving updated payment status to database");
            paymentPaymentRepository.save(paymentPayment);
            log.info("[MPESA_SERVICE] handleMpesaCallback SUCCESS - Payment status updated to: {}", 
                    paymentPayment.getPaymentStatus());

            // Notify admin on successful payment (non-fatal)
            if (paymentPayment.getPaymentStatus() == PaymentStatus.COMPLETED) {
                try {
                    emailService.sendAdminOrderNotification(paymentPayment.getOrder(), paymentPayment);
                } catch (Exception emailEx) {
                    log.warn("[MPESA_SERVICE] handleMpesaCallback - Admin notification failed for order #{}", 
                            paymentPayment.getOrder().getId(), emailEx);
                }
            }

        } catch (Exception e) {
            log.error("[MPESA_SERVICE] handleMpesaCallback ERROR - Exception during callback processing", e);
        }
    }

    /**
     * Get payment details by ID
     */
    public Payment_Payment getPaymentById(Long paymentId) {
        log.info("[MPESA_SERVICE] getPaymentById - PaymentId: {}", paymentId);
        return paymentPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));
    }

    /**
     * Get payment by order ID
     */
    public Payment_Payment getPaymentByOrderId(Long orderId) {
        log.info("[MPESA_SERVICE] getPaymentByOrderId - OrderId: {}", orderId);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        return paymentPaymentRepository.findByOrder(order)
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderId));
    }

    /**
     * Get payment by checkoutRequestId (stored as transactionId)
     */
    public Payment_Payment getPaymentByCheckoutRequestId(String checkoutRequestId) {
        log.info("[MPESA_SERVICE] getPaymentByCheckoutRequestId - CheckoutRequestId: {}", checkoutRequestId);
        return paymentPaymentRepository.findByTransactionId(checkoutRequestId)
                .orElseThrow(() -> new RuntimeException("Payment not found with checkoutRequestId: " + checkoutRequestId));
    }

    /**
     * Get all payments for a user
     */
    public List<Payment_Payment> getUserPayments(Long userId) {
        log.info("[MPESA_SERVICE] getUserPayments - UserId: {}", userId);
        return paymentPaymentRepository.findByUserId(userId);
    }

    /**
     * Get completed payments for a user
     */
    public List<Payment_Payment> getUserCompletedPayments(Long userId) {
        log.info("[MPESA_SERVICE] getUserCompletedPayments - UserId: {}", userId);
        return paymentPaymentRepository.findByUserIdAndPaymentStatus(userId, PaymentStatus.COMPLETED);
    }
}
