package org.nthuli_shop.nthuli_shop.product.dto;


import jakarta.validation.constraints.NotBlank;

public class FurnitureRequestDto extends ProductRequestDto {
    @NotBlank(message = "furniture material is required")
    private String furnitureMaterial;
    @NotBlank(message = "furniture type is required")
    private String furnitureType;
    @NotBlank(message = "furniture category is required")
    private String furnitureCategory;

    public FurnitureRequestDto(String name, String type, Double price, String description, Long categoryId, String furnitureMaterial, String furnitureType, String furnitureCategory) {
        super(name, type, price, description, categoryId);
        this.furnitureMaterial = furnitureMaterial;
        this.furnitureType = furnitureType;
        this.furnitureCategory = furnitureCategory;
    }

    public String getFurnitureMaterial() {
        return furnitureMaterial;
    }

    public void setFurnitureMaterial(String furnitureMaterial) {
        this.furnitureMaterial = furnitureMaterial;
    }

    public String getFurnitureType() {
        return furnitureType;
    }

    public void setFurnitureType(String furnitureType) {
        this.furnitureType = furnitureType;
    }

    public String getFurnitureCategory() {
        return furnitureCategory;
    }

    public void setFurnitureCategory(String furnitureCategory) {
        this.furnitureCategory = furnitureCategory;
    }
}
