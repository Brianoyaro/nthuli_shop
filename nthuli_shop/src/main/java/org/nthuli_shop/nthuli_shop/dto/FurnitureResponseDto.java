package org.nthuli_shop.nthuli_shop.dto;

import org.nthuli_shop.nthuli_shop.enums.ProductType;

import java.util.List;

public class FurnitureResponseDto extends ProductResponseDto {
    private String furnitureMaterial;
    private String furnitureType;

    public FurnitureResponseDto() {
    }

    public FurnitureResponseDto(Long id, String categoryName, ProductType productType, Double price, String description, String furnitureName, String furnitureMaterial, String furnitureType, List<ProductImageResponseDto> images) {
        super(id, categoryName, productType, price, description, furnitureName, images);
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
