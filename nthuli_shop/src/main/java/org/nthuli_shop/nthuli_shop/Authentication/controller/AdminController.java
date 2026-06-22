package org.nthuli_shop.nthuli_shop.Authentication.controller;

import org.nthuli_shop.nthuli_shop.Authentication.dto.RolePromotionRequest;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.Authentication.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> adminHomePage() {
        Map<String, String> homeData = new HashMap<>();

        homeData.put("Message", "Welcome to the admin home-page");
        homeData.put("Access", "Access granted to you because you're an admin user");

        return ResponseEntity.ok(homeData);
    }

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

    /**
     * Promote an existing user to a different role (e.g., USER to ADMIN)
     * Only accessible by existing ADMIN users
     * @param userId ID of the user to promote
     * @param request RolePromotionRequest containing the new role
     * @return Updated user profile
     */
    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<?> promoteUser(
            @PathVariable Long userId,
            @RequestBody RolePromotionRequest request) {
        try {
            // Validate input
            if (userId == null || userId <= 0) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Invalid user ID"));
            }

            if (request.getRole() == null) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("Role is required"));
            }

            // Get current admin for audit purposes
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String adminEmail = authentication != null ? authentication.getName() : "SYSTEM";

            // Find the user to promote
            User targetUser = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

            // Update role
            targetUser.setRole(request.getRole());
            User updatedUser = userRepository.save(targetUser);

            // Return updated user info
            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedUser.getId());
            response.put("email", updatedUser.getEmail());
            response.put("role", updatedUser.getRole());
            response.put("updated_by", adminEmail);
            response.put("updated_at", updatedUser.getUpdatedAt());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error updating user role: " + e.getMessage()));
        }
    }
}