package org.nthuli_shop.nthuli_shop.main_bak.repository;

import org.nthuli_shop.nthuli_shop.main_bak.repository.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
}
