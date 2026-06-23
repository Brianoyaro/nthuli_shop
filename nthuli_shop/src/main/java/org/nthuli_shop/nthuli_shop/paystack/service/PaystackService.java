package org.nthuli_shop.nthuli_shop.paystack.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaystackService {

    private final WebClient webClient;

    @Value("${paystack.secret}")
    private String secret;

    @Value("${paystack.base-url}")
    private String baseUrl;

    public String initializeTransaction(String email,
                                        BigDecimal amount,
                                        String reference) {

        Map<String, Object> payload = new HashMap<>();

        payload.put("email", email);

        // Paystack uses smallest currency unit
        payload.put(
                "amount",
                amount.multiply(BigDecimal.valueOf(100)).intValue()
        );

        payload.put("currency", "KES");

        payload.put("reference", reference);

        payload.put("callback_url", "http://localhost:5173/payment/success");

//        Map response =
//                webClient.post()
//                        .uri(baseUrl + "/transaction/initialize")
//                        .header("Authorization", "Bearer " + secret)
//                        .bodyValue(payload)
//                        .retrieve()
//                        .bodyToMono(Map.class)
//                        .block();
//
//        Map data = (Map) response.get("data");
//
//        return (String) data.get("authorization_url");
        try {

            Map response =
                    webClient.post()
                            .uri(baseUrl + "/transaction/initialize")
                            .header("Authorization", "Bearer " + secret)
                            .bodyValue(payload)
                            .retrieve()
                            .bodyToMono(Map.class)
                            .block();

            log.info("Paystack response: {}", response);

            Map data = (Map) response.get("data");

            return (String) data.get("authorization_url");

        } catch (Exception e) {

            log.error("Paystack initialization failed", e);

            throw e;
        }
    }

    public Map verifyTransaction(String reference) {

        return  webClient.get()
                .uri(baseUrl + "/transaction/verify/" + reference)
                .header("Authorization", "Bearer " + secret)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
}
