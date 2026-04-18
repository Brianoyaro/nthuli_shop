package org.nthuli_shop.nthuli_shop.category.repository;

import org.nthuli_shop.nthuli_shop.category.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
}
