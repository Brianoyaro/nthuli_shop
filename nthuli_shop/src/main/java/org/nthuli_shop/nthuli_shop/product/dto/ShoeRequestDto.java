package org.nthuli_shop.nthuli_shop.product.dto;

import jakarta.validation.constraints.NotBlank;

public class ShoeRequestDto extends ProductRequestDto {
    @NotBlank(message = "shoe gender is requires")
    private String gender;
    @NotBlank(message = "shoe material is required")
    private String material;

    public ShoeRequestDto(String name, String type, Double price, String description, Long categoryId, String gender, String material) {
        super(name, type, price, description, categoryId);
        this.material = material;
        this.gender = gender;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }
}
