package org.nthuli_shop.nthuli_shop.repository;

import org.nthuli_shop.nthuli_shop.entity.Clothes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClothesRepository extends JpaRepository<Clothes, Long> {
}
