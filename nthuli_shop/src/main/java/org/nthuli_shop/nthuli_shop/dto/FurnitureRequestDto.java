package org.nthuli_shop.nthuli_shop.dto;


import org.nthuli_shop.nthuli_shop.enums.FurnitureMaterialEnum;
import org.nthuli_shop.nthuli_shop.enums.FurnitureTypeEnum;
import org.nthuli_shop.nthuli_shop.enums.ProductType;

public class FurnitureRequestDto extends ProductRequestDto {
    private String furnitureMaterial;
    private String furnitureType;

    public FurnitureRequestDto(String name, String type, Double price, String description, Long categoryId, String furnitureMaterial, String furnitureType) {
        super(name, type, price, description, categoryId);
        this.furnitureMaterial = furnitureMaterial;
        this.furnitureType = furnitureType;
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
}
