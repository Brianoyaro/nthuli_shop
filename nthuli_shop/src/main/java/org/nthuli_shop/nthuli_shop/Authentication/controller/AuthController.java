package org.nthuli_shop.nthuli_shop.Authentication.controller;

import org.nthuli_shop.nthuli_shop.Authentication.dto.AuthRequest;
import org.nthuli_shop.nthuli_shop.Authentication.dto.AuthResponse;
import org.nthuli_shop.nthuli_shop.Authentication.dto.RefreshTokenRequest;
import org.nthuli_shop.nthuli_shop.Authentication.dto.RegisterRequest;

import org.nthuli_shop.nthuli_shop.Authentication.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/")
public class AuthController {
    //
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

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
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
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
