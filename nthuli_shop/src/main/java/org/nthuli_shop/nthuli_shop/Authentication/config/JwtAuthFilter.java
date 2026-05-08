package org.nthuli_shop.nthuli_shop.Authentication.config;

import org.nthuli_shop.nthuli_shop.Authentication.service.CustomUserDetailsService;
import org.nthuli_shop.nthuli_shop.Authentication.service.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    public JwtAuthFilter(JwtService jwtService, CustomUserDetailsService customUserDetailsService) {
        this.jwtService = jwtService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Skip JWT authentication for endpoints that are public
        final String requestPath = request.getServletPath();
        if (requestPath.startsWith("/api/auth/")) {
            log.debug("Skipping JWT auth for public endpoint: {}", requestPath);
            filterChain.doFilter(request, response);
            return;
        }

        // Extract the token
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);
        // Validate token format before parsing
        if (!token.contains(".")) {
            logger.warn("Invalid token format - not a valid JWT");
            filterChain.doFilter(request, response);
            return;
        }

        final String userEmail;
        // work on jwtService then continue with the jwtFilter logic
        try {
            // extract username from jwt
            userEmail = jwtService.extractUsername(token);
            log.info("✅ Extracted email from token: " + userEmail);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(userEmail);
                log.info("✅ Loaded user details for: " + userEmail);

                if (jwtService.isTokenValid(token, userDetails)) {
                    log.info("✅ Token is valid for user: " + userEmail);
                    
                    // validate the audience and issuer to prevent JWT tampering
                    boolean audienceValid = jwtService.validateAudience(token);
                    boolean issuerValid = jwtService.validateIssuer(token);
                    
                    log.info("🔐 Token validation - Audience valid: " + audienceValid + ", Issuer valid: " + issuerValid);
                    
                    if (audienceValid && issuerValid) {
                        // create authentication token
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                        // set additional details
                        authentication.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );

                        // set authentication in the security context
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.info("✅ Authentication set for user: " + userEmail);
                    } else {
                        log.warn("❌ Token validation failed - Audience: " + audienceValid + ", Issuer: " + issuerValid);
                    }
                } else {
                    log.warn("❌ Token is invalid for user: " + userEmail);
                }
            }
        } catch (ExpiredJwtException e) {
            // JWT token has expired - return 401 Unauthorized for frontend to refresh
            log.warn("[JWT_AUTH] Token expired: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Token expired\", \"status\": 401}");
            return;
        } catch (Exception e) {
            log.error("❌ JWT authentication exception: " + e.getMessage(), e);
        }

        // continue with the next filter chain
        filterChain.doFilter(request, response);
    }
}
