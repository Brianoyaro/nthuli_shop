package org.nthuli_shop.nthuli_shop.Authentication.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nthuli_shop.nthuli_shop.Authentication.entity.Role;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.nthuli_shop.nthuli_shop.Authentication.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Bootstrap mechanism to create initial admin user on application startup
 * Runs once if no admin exists in the database
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@gmail.com}")
    private String defaultAdminEmail;

    @Value("${app.admin.default-password:password}")
    private String defaultAdminPassword;

//    public AdminBootstrap(UserRepository userRepository, PasswordEncoder passwordEncoder) {
//        this.userRepository = userRepository;
//        this.passwordEncoder = passwordEncoder;
//    }

    @Override
    public void run(String... args) {
        try {
            // Check if any ADMIN user already exists
            boolean adminExists = userRepository.findAll().stream()
                    .anyMatch(user -> user.getRole() == Role.ADMIN);

            if (!adminExists) {
                log.info("No admin user found. Creating initial admin user...");

                User adminUser = new User(
                        defaultAdminEmail,
                        passwordEncoder.encode(defaultAdminPassword),
                        Role.ADMIN
                );
                adminUser.setLastLogin(LocalDateTime.now());
//                adminUser.setLastLoginIp("BOOTSTRAP");

                userRepository.save(adminUser);

                log.warn("========================================");
                log.warn("INITIAL ADMIN USER CREATED");
                log.warn("========================================");
                log.warn("Email: {}", defaultAdminEmail);
                log.warn("Password: {}", defaultAdminPassword);
                log.warn("⚠️  IMPORTANT: Change this password immediately!");
                log.warn("========================================");
            } else {
                log.info("Admin user already exists. Skipping bootstrap.");
            }
        } catch (Exception e) {
            log.error("Error during admin bootstrap", e);
        }
    }
}
