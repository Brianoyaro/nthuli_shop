package org.nthuli_shop.nthuli_shop.Authentication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetResponse {
    private String message;
    private boolean success;
    private String email;
}