package org.nthuli_shop.nthuli_shop.repository;

import org.nthuli_shop.nthuli_shop.entity.KitchenAppliance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KitchenApplianceRepository extends JpaRepository<KitchenAppliance, Long> {
}
