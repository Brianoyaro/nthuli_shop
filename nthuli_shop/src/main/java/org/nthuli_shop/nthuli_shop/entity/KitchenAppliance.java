package org.nthuli_shop.nthuli_shop.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import org.nthuli_shop.nthuli_shop.enums.KitchenApplianceFunctionEnum;

@Entity
public class KitchenAppliance extends Product{
    //
    private Double wattage; //energy consumption of the material

    // applianceFunction -> cutting, serving, cooking, ...
    @Enumerated(EnumType.STRING)
    private KitchenApplianceFunctionEnum applianceFunction;

    public KitchenAppliance() {
    }

    public KitchenAppliance(String name, String description, Double price, Category category, KitchenApplianceFunctionEnum applianceFunction, Double wattage) {
        super(name, description, price, category);
        this.applianceFunction = applianceFunction;
        this.wattage = wattage;
    }

    public Double getWattage() {
        return wattage;
    }

    public void setWattage(Double wattage) {
        this.wattage = wattage;
    }

    public KitchenApplianceFunctionEnum getApplianceFunction() {
        return applianceFunction;
    }

    public void setApplianceFunction(KitchenApplianceFunctionEnum applianceFunction) {
        this.applianceFunction = applianceFunction;
    }
}
