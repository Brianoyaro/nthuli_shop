package org.nthuli_shop.nthuli_shop.Authentication.repository;

import org.nthuli_shop.nthuli_shop.Authentication.entity.PasswordResetToken;
import org.nthuli_shop.nthuli_shop.Authentication.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUser(User user);
}
