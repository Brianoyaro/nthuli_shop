package org.nthuli_shop.nthuli_shop.Authentication.service;

//import com.oyaro_corp.oyaro.corporation.cart.service.CartService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.nthuli_shop.nthuli_shop.Authentication.dto.AuthResponse;
import org.nthuli_shop.nthuli_shop.Authentication.dto.RefreshTokenRequest;
import org.nthuli_shop.nthuli_shop.Authentication.dto.AuthRequest;
import org.nthuli_shop.nthuli_shop.Authentication.dto.RegisterRequest;
import org.nthuli_shop.nthuli_shop.Authentication.entity.Role;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.Authentication.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;


import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

//    private CartService cartService;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
//        this.cartService = cartService;
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
//        if (user.getRole() != Role.ADMIN) {
//            //
//            cartService.createCartForUser(user);
//        }

        // generate access and refresh access tokens
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponse(
                accessToken,
                refreshToken,
                jwtService.getAccessTokenExpiration()
        );
    }


    // login
    @Transactional
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

        try{
            // extract username from refreshToken
            userEmail = jwtService.extractUsername(refreshToken);
            if (userEmail != null){
                // load user details from the database
                User user = userRepository.findByEmail(userEmail)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

                // validate the refresh token
                if (jwtService.isTokenValid(refreshToken, user)){
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
}
