package org.nthuli_shop.nthuli_shop.Authentication.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.dto.*;
import org.nthuli_shop.nthuli_shop.Authentication.entity.PasswordResetToken;
import org.nthuli_shop.nthuli_shop.Authentication.entity.Role;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.Authentication.repository.PasswordResetTokenRepository;
import org.nthuli_shop.nthuli_shop.Authentication.repository.UserRepository;
import org.nthuli_shop.nthuli_shop.cart.service.CartService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final CartService cartService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;
    
    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder, CartService cartService, PasswordResetTokenRepository passwordResetTokenRepository, EmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.cartService = cartService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    // register
    @Transactional
    public AuthResponse register(@RequestBody RegisterRequest registerRequest, HttpServletRequest httpServletRequest) {
        // check if user exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalStateException("Email already exists");
        }

        User user = new User(
                registerRequest.getEmail(),
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getRole() != null ? registerRequest.getRole() : Role.USER
        );

        // add metadata
        user.setLastLogin(LocalDateTime.now());
        user.setLastLoginIp(getClientIp(httpServletRequest));

        userRepository.save(user);

        // create cart for each user when they're created
        if (user.getRole() != Role.ADMIN) {
            cartService.createCartForUser(user);
        }

        // generate access and refresh access tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponse(
                accessToken,
                refreshToken,
                jwtService.getAccessTokenExpiration()
        );
    }

    public AuthResponse authenticate(@RequestBody AuthRequest authRequest, HttpServletRequest request) {
        // authenticate the user
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getEmail(), authRequest.getPassword())
        );

        // load the user
        User user = userRepository.findByEmail(authRequest.getEmail()).orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // add metadata
        user.setLastLogin(LocalDateTime.now());
        user.setLastLoginIp(getClientIp(request));

        userRepository.save(user);

        // generate access and refresh tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponse(
                accessToken,
                refreshToken,
                jwtService.getAccessTokenExpiration()
        );
    }

    // refresh access token
    public AuthResponse refreshToken(RefreshTokenRequest refreshTokenRequest, HttpServletRequest httpServletRequest) {
        final String refreshToken = refreshTokenRequest.getToken();
        final String userEmail;

        try {
            // extract username from refreshToken
            userEmail = jwtService.extractUsername(refreshToken);
            if (userEmail != null) {
                // load user details from the database
                User user = userRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                // validate the refresh token
                if (jwtService.isTokenValid(refreshToken, user)) {
                    // validate issuer and audience
                    if (jwtService.validateAudience(refreshToken) && jwtService.validateIssuer(refreshToken)) {
                        // Perform IP/device check for anomaly detection (best practice)
                        String currentIp = getClientIp(httpServletRequest);
                        String lastLoginIp = user.getLastLoginIp();
                        // Optional: Implement more sophisticated device/IP validation here
                        // For now, we'll log the IP change but still allow token refresh
                        if (lastLoginIp != null && !lastLoginIp.equals(currentIp)) {
                            // Log potential security event
                            System.out.println("Warning: IP address changed during token refresh for user: " + userEmail);
                        }


                        // generate access token only because refresh token is already passed as the function argument
                        String accessToken = jwtService.generateAccessToken(user);

                        return new AuthResponse(
                                accessToken,
                                refreshToken,
                                jwtService.getAccessTokenExpiration()
                        );
                    }
                }
            }
        } catch (Exception e) {
            throw new IllegalStateException("Invalid refresh token");
        }
        throw new IllegalStateException("Invalid refresh token");
    }

    // extract client IP from the request
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    // Password Reset Methods
    @Transactional
    public PasswordResetResponse requestPasswordReset(ForgotPasswordRequest request, String baseUrl) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User with email " + request.getEmail() + " not found"));

        // Generate reset token
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(24);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(expiryDate)
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Send email with reset link using frontend URL
        String resetLink = frontendBaseUrl + "/reset-password/" + token;
        try {
            emailService.sendPasswordResetEmail(user, resetLink);
            log.info("Password reset email sent successfully to: {}", user.getEmail());
        } catch (Exception e) {
            // Log the error but don't fail the request - token is already created
            log.warn("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
            log.warn("User can still use the reset link: {}", resetLink);
        }

        return PasswordResetResponse.builder()
                .success(true)
                .message("Password reset link has been sent to your email")
                .email(user.getEmail())
                .build();
    }

    public PasswordResetToken validateResetToken(String token) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalStateException("Invalid password reset token"));

        if (!resetToken.isValid()) {
            throw new IllegalStateException("Password reset token has expired or has already been used");
        }

        return resetToken;
    }

    @Transactional
    public PasswordResetResponse resetPassword(PasswordResetRequest request) {
        PasswordResetToken resetToken = validateResetToken(request.getToken());
        User user = resetToken.getUser();

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return PasswordResetResponse.builder()
                .success(true)
                .message("Password has been reset successfully")
                .email(user.getEmail())
                .build();
    }
}