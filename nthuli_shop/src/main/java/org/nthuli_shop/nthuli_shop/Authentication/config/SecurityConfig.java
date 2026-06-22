package org.nthuli_shop.nthuli_shop.Authentication.config;

import org.nthuli_shop.nthuli_shop.Authentication.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(CustomUserDetailsService customUserDetailsService, JwtAuthFilter jwtAuthFilter) {
        this.customUserDetailsService = customUserDetailsService;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    // security filter chain bean
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        //
        http
                // disable csrf
                .csrf(csrf -> csrf.disable())

                // handle CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // disable state fullness
                .sessionManagement(sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Authorise endpoints
                .authorizeHttpRequests(authorizeRequests -> authorizeRequests
                        // PUBLIC endpoints - no authentication required
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/health",
                                "/api/auth/refresh-token",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password/**",
                                "/api/auth/reset-password/validate/**",
                                "/uploads/**",
                                "/api/category",          // GET all categories
                                "/api/category/{id}",     // GET category by ID
                                "/api/category/*/products", // GET products by category
                                "/api/products",          // GET all products
                                "/api/products/**",       // GET specific product (READ-ONLY)
                                "/api/payments/mpesa/callback", // M-Pesa webhook callback
                                "/api/payments/status/**"  // GET payment status by checkoutRequestId (M-Pesa polling)
                        ).permitAll()
                        
                        // AUTHENTICATED USER endpoints (excluding admin methods)
                        .requestMatchers(
                                "/api/cart/**",
                                "/api/user/profile",
                                "/api/payments/mpesa/stk-push",
                                "/api/payments/user/**",
                                "/api/orders/from-cart",
                                "/api/orders/user/**",
                                "/api/orders/*/cancel",
                                "/api/payments/*"
                        ).authenticated()
                        
                        // ADMIN ONLY endpoints
                        .requestMatchers(
                                "/api/admin/**",
                                "/api/category/create",
                                "/api/category/*",        // PUT & DELETE for update/delete
                                "/api/products/create",
                                "/api/products/*",        // PUT & DELETE for update/delete
                                "/api/orders/admin/**",
                                "/api/orders/*/status/**"
                        ).hasRole("ADMIN")
                        
                        // All other endpoints require authentication
                        .anyRequest().authenticated())

                // set authentication provider
                .authenticationProvider(authenticationProvider())

                // add jwtFilter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    // authentication manager bean
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }


    // password encoder bean
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    //authentication provider bean
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider(customUserDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return daoAuthenticationProvider;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow specific origins (update for production)
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:5174",
                "http://localhost:5173",
                "http://localhost:5175"
        ));

        // Allow specific HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // Allow specific headers
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "X-Requested-With"
        ));

        // Expose headers
        configuration.setExposedHeaders(List.of("Authorization"));

        // Allow credentials
        configuration.setAllowCredentials(true);

        // Max age for preflight requests
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
