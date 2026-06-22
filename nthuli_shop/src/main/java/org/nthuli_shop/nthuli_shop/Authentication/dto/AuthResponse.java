package org.nthuli_shop.nthuli_shop.Authentication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Will be used when we log in a user in the service layer
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType =  "Bearer";
    private Long expiresIn;
    private Long id;

}
