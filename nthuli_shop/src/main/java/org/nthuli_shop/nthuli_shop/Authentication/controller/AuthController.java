package org.nthuli_shop.nthuli_shop.Authentication.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.dto.*;
import org.nthuli_shop.nthuli_shop.Authentication.entity.PasswordResetToken;

import org.nthuli_shop.nthuli_shop.Authentication.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    //
    private final AuthService authService;

//    public AuthController(AuthService authService) {
//        this.authService = authService;
//    }





    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest, HttpServletRequest httpServletRequest) {
        //
        try {
            AuthResponse authResponse = authService.register(registerRequest, httpServletRequest);
            return ResponseEntity.ok(authResponse);
            // email already exists error captured here.
        } catch (IllegalStateException e) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(e.getMessage()));
            // general errors captured here.
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest, HttpServletRequest httpServletRequest) {
        //
        try {
            AuthResponse authResponse = authService.authenticate(authRequest, httpServletRequest);
            return ResponseEntity.status(HttpStatus.OK).body(authResponse);
        } catch (Exception e) {
            log.error(e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Authentication failed. Invalid credentials."));
        }
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Authentication service is running");
    }


    // refresh tokens
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest refreshTokenRequest, HttpServletRequest httpServletRequest) {
        try {
            AuthResponse authResponse = authService.refreshToken(refreshTokenRequest, httpServletRequest);
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("Token refresh failed: " + e.getMessage()));
        }
    }

    // Forgot Password - Request reset token
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request, HttpServletRequest httpServletRequest) {
        try {
            String baseUrl = getBaseUrl(httpServletRequest);
            PasswordResetResponse response = authService.requestPasswordReset(request, baseUrl);
            return ResponseEntity.ok(response);
        } catch (UsernameNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error processing password reset request: " + e.getMessage()));
        }
    }

    // Validate Reset Token
    @GetMapping("/reset-password/validate/{token}")
    public ResponseEntity<?> validateResetToken(@PathVariable String token) {
        try {
            PasswordResetToken resetToken = authService.validateResetToken(token);
            return ResponseEntity.ok(new ErrorResponse("Token is valid"));
        } catch (IllegalStateException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    // Reset Password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody PasswordResetRequest request) {
        try {
            PasswordResetResponse response = authService.resetPassword(request);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (UsernameNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error resetting password: " + e.getMessage()));
        }
    }

    // Helper method to get base URL
    private String getBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int serverPort = request.getServerPort();
        String contextPath = request.getContextPath();

        String baseUrl = scheme + "://" + serverName;
        if ((scheme.equals("http") && serverPort != 80) || (scheme.equals("https") && serverPort != 443)) {
            baseUrl += ":" + serverPort;
        }
        baseUrl += contextPath;
        return baseUrl;
    }

    // ErrorResponse DTO
    private static class ErrorResponse {
        private String message;
        private long timestamp;

        public ErrorResponse(String message) {
            this.message = message;
            this.timestamp = System.currentTimeMillis();
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public long getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(long timestamp) {
            this.timestamp = timestamp;
        }
    }
}
