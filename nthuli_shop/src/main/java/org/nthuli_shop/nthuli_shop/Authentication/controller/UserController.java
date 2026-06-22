package org.nthuli_shop.nthuli_shop.Authentication.controller;

import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.Authentication.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/")
@Slf4j
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<?> profile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();

            Map<String, Object> profileData = new HashMap<>();
            profileData.put("id", user.getId());
            profileData.put("email", user.getEmail());
            profileData.put("role", user.getRole());
            profileData.put("last_login", user.getLastLogin());
            profileData.put("last_login_ip", user.getLastLoginIp());
            profileData.put("created_at", user.getCreatedAt());

            log.warn("ProfileData: {}", profileData);
            return ResponseEntity.status(HttpStatus.OK).body(profileData);
        }
        return ResponseEntity.status(401).build();
    }

    /**
     * Change password for authenticated user
     * PUT /api/user/profile/password
     */
    @PutMapping("/profile/password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @AuthenticationPrincipal User principal,
            @RequestBody Map<String, String> body) {

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || currentPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is required"));
        }
        if (newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 8 characters"));
        }
        if (!passwordEncoder.matches(currentPassword, principal.getPassword())) {
            return ResponseEntity.status(400).body(Map.of("message", "Current password is incorrect"));
        }

        User user = userRepository.findById(principal.getId())
                .orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}

