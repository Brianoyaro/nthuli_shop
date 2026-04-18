package org.nthuli_shop.nthuli_shop.dto;

import org.nthuli_shop.nthuli_shop.enums.ProductType;

import java.util.List;


public class KitchenApplianceResponseDto extends ProductResponseDto {
    private Double wattage;
    private String applianceFunction;

    public KitchenApplianceResponseDto() {
    }

    public KitchenApplianceResponseDto(Long id, String categoryName, ProductType productType, Double price, String description, String applianceName, Double wattage, String applianceFunction, List<org.nthuli_shop.nthuli_shop.dto_old.ProductImageResponseDto> images) {
        super(id, categoryName, productType, price, description, applianceName, images);
        this.wattage = wattage;
        this.applianceFunction = applianceFunction;
    }


    public Double getWattage() {
        return wattage;
    }

    public void setWattage(Double wattage) {
        this.wattage = wattage;
    }

    public String getApplianceFunction() {
        return applianceFunction;
    }

    public void setApplianceFunction(String applianceFunction) {
        this.applianceFunction = applianceFunction;
    }
}
