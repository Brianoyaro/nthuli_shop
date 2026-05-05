package org.nthuli_shop.nthuli_shop.payment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.payment.config.MpesaConfig;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaCallbackResponse;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaStkPushRequest;
import org.nthuli_shop.nthuli_shop.payment.dto.MpesaStkPushResponse;
import org.nthuli_shop.nthuli_shop.payment.entity.Payment;
import org.nthuli_shop.nthuli_shop.payment.enums.PaymentMethod;
import org.nthuli_shop.nthuli_shop.payment.enums.PaymentStatus;
import org.nthuli_shop.nthuli_shop.payment.repository.PaymentRepository;
import org.nthuli_shop.nthuli_shop.payment.util.MpesaUtil;
import org.nthuli_shop.nthuli_shop.order.repository.OrderRepository;
import org.nthuli_shop.nthuli_shop.order.entity.Order;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MpesaService {

    private final MpesaConfig mpesaConfig;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Get M-Pesa access token for API authentication
     */
    public String getAccessToken() {
        try {
            String auth = mpesaConfig.getConsumerKey() + ":" + mpesaConfig.getConsumerSecret();
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.setBasicAuth(mpesaConfig.getConsumerKey(), mpesaConfig.getConsumerSecret());
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>(headers);

            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    mpesaConfig.getAccessTokenUrl(),
                    HttpMethod.GET,
                    request,
                    JsonNode.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return response.getBody().get("access_token").asText();
            }

            throw new RuntimeException("Failed to get access token from M-Pesa");
        } catch (Exception e) {
            log.error("Error getting M-Pesa access token", e);
            throw new RuntimeException("Failed to get M-Pesa access token: " + e.getMessage(), e);
        }
    }

    /**
     * Initiate STK Push request for M-Pesa payment
     */
    public MpesaStkPushResponse initiateStkPush(User user, MpesaStkPushRequest request) {
        try {
            // Fetch order
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found with id: " + request.getOrderId()));
            
            // Sanitize phone number
            String phoneNumber = MpesaUtil.sanitizePhoneNumber(request.getPhoneNumber());
            
            // Generate timestamp and password
            String timestamp = MpesaUtil.generateTimestamp();
            String password = MpesaUtil.generatePassword(
                    mpesaConfig.getPartyB(),
                    mpesaConfig.getPassKey(),
                    timestamp
            );

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

            // Get access token
            String accessToken = getAccessToken();

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            HttpEntity<Map<String, Object>> httpRequest = new HttpEntity<>(requestBody, headers);

            // Make request to M-Pesa
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    mpesaConfig.getStkPushUrl(),
                    HttpMethod.POST,
                    httpRequest,
                    JsonNode.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode body = response.getBody();
                
                String merchantRequestId = body.get("MerchantRequestID").asText();
                String checkoutRequestId = body.get("CheckoutRequestID").asText();
                String responseCode = body.get("ResponseCode").asText();
                String responseDescription = body.get("ResponseDescription").asText();
                String customerMessage = body.get("CustomerMessage").asText();

                // Save payment record with authenticated user
                Payment payment = Payment.builder()
                        .user(user)
                        .order(order)
                        .amount(request.getAmount())
                        .paymentMethod(PaymentMethod.MPESA_STK_PUSH)
                        .paymentStatus(PaymentStatus.PENDING)
                        .transactionId(checkoutRequestId)
                        .mpesaReference(merchantRequestId)
                        .description(request.getDescription())
                        .build();
                
                paymentRepository.save(payment);

                log.info("STK Push initiated successfully for user: {} order: {}", user.getId(), order.getId());

                return MpesaStkPushResponse.builder()
                        .merchantRequestId(merchantRequestId)
                        .checkoutRequestId(checkoutRequestId)
                        .responseCode(responseCode)
                        .responseDescription(responseDescription)
                        .customerMessage(customerMessage)
                        .build();
            }

            throw new RuntimeException("Failed to initiate STK Push: " + 
                    response.getStatusCode());

        } catch (RestClientException e) {
            log.error("Error initiating M-Pesa STK Push", e);
            throw new RuntimeException("Failed to initiate STK Push: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error during STK Push initiation", e);
            throw new RuntimeException("Unexpected error: " + e.getMessage(), e);
        }
    }

    /**
     * Handle M-Pesa callback after user enters PIN
     */
    public void handleMpesaCallback(MpesaCallbackResponse callbackResponse) {
        try {
            if (callbackResponse == null || callbackResponse.getBody() == null) {
                log.error("Invalid callback response received");
                return;
            }

            MpesaCallbackResponse.CallbackBody.StkCallback stkCallback = 
                    callbackResponse.getBody().getStkCallback();

            if (stkCallback == null) {
                log.error("STK Callback is null");
                return;
            }

            String checkoutRequestId = stkCallback.getCheckoutRequestId();
            Integer resultCode = stkCallback.getResultCode();
            String resultDesc = stkCallback.getResultDesc();

            // Find payment by transaction ID
            Payment payment = paymentRepository.findByTransactionId(checkoutRequestId)
                    .orElse(null);

            if (payment == null) {
                log.error("Payment not found for checkoutRequestId: {}", checkoutRequestId);
                return;
            }

            if (resultCode == 0) {
                // Payment successful
                payment.setPaymentStatus(PaymentStatus.COMPLETED);
                
                // Extract callback metadata
                if (stkCallback.getCallbackMetadata() != null && 
                    stkCallback.getCallbackMetadata().getItems() != null) {
                    
                    List<MpesaCallbackResponse.CallbackBody.StkCallback.CallbackMetadata.CallbackItem> items = 
                            stkCallback.getCallbackMetadata().getItems();
                    
                    for (var item : items) {
                        if ("MpesaReceiptNumber".equals(item.getName())) {
                            payment.setMpesaReference(item.getValue().toString());
                        }
                    }
                }
                
                log.info("Payment successful for order: {}", payment.getOrder().getId());
            } else {
                // Payment failed
                payment.setPaymentStatus(PaymentStatus.FAILED);
                log.warn("Payment failed with result code: {} - {}", resultCode, resultDesc);
            }

            paymentRepository.save(payment);

        } catch (Exception e) {
            log.error("Error handling M-Pesa callback", e);
        }
    }

    /**
     * Get payment details by ID
     */
    public Payment getPaymentById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));
    }

    /**
     * Get payment by order ID
     */
    public Payment getPaymentByOrderId(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        return paymentRepository.findByOrder(order)
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderId));
    }

    /**
     * Get all payments for a user
     */
    public List<Payment> getUserPayments(Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    /**
     * Get completed payments for a user
     */
    public List<Payment> getUserCompletedPayments(Long userId) {
        return paymentRepository.findByUserIdAndPaymentStatus(userId, PaymentStatus.COMPLETED);
    }
}
