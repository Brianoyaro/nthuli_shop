package org.nthuli_shop.nthuli_shop.payment.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "mpesa")
@Data
public class MpesaConfig {
    private String consumerKey;
    private String consumerSecret;
    private String stkPushUrl;
    private String accessTokenUrl;
    private String callbackUrl;
    private String partyA;
    private String partyB;
    private String passKey;
}
