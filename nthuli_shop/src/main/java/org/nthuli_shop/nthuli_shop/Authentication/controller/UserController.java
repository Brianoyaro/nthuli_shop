package org.nthuli_shop.nthuli_shop.Authentication.controller;

import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user/")
public class UserController {
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> profile() {
        //
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

            return ResponseEntity.ok(profileData);
        }
        return ResponseEntity.status(401).build();
    }
}
