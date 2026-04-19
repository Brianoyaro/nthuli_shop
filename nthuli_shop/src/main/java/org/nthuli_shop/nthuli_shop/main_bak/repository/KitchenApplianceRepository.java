package org.nthuli_shop.nthuli_shop.main_bak.repository;

import org.nthuli_shop.nthuli_shop.main_bak.repository.entity.KitchenAppliance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KitchenApplianceRepository extends JpaRepository<KitchenAppliance, Long> {
}
