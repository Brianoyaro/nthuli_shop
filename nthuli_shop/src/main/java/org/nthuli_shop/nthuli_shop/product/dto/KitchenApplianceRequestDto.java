package org.nthuli_shop.nthuli_shop.product.dto;


import jakarta.validation.constraints.NotBlank;

public class KitchenApplianceRequestDto extends ProductRequestDto {
    @NotBlank(message = "wattage amount of the kitchen appliance is required")
    private Double wattage;
    @NotBlank(message = "kitchen appliance function is required")
    private String applianceFunction;

    public KitchenApplianceRequestDto(String name, String type, Double price, String description, Long categoryId, Double wattage, String applianceFunction) {
        super(name, type, price, description, categoryId);
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
