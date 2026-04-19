package org.nthuli_shop.nthuli_shop.main_bak.repository;

import org.nthuli_shop.nthuli_shop.main_bak.repository.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
}
