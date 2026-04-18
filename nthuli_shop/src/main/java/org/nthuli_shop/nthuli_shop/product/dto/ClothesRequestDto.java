package org.nthuli_shop.nthuli_shop.product.dto;

import jakarta.validation.constraints.NotBlank;


public class ClothesRequestDto extends ProductRequestDto {
    @NotBlank(message = "Clothe gender is required")
    private String clotheGender;
    @NotBlank(message = "Clothe material is required")
    private String clotheMaterial;
    @NotBlank(message = "clothe type is required")
    private String clotheType;

    public ClothesRequestDto(String name, String type, Double price, String description, Long categoryId, String clotheGender, String clotheMaterial, String clotheType) {
        super(name, type, price, description, categoryId);
        this.clotheGender = clotheGender;
        this.clotheMaterial = clotheMaterial;
        this.clotheType = clotheType;
    }

    public String getClotheGender() {
        return clotheGender;
    }

    public void setClotheGender(String clotheGender) {
        this.clotheGender = clotheGender;
    }

    public String getClotheMaterial() {
        return clotheMaterial;
    }

    public void setClotheMaterial(String clotheMaterial) {
        this.clotheMaterial = clotheMaterial;
    }

    public String getClotheType() {
        return clotheType;
    }

    public void setClotheType(String clotheType) {
        this.clotheType = clotheType;
    }
}
