package org.nthuli_shop.nthuli_shop.dto;

import org.nthuli_shop.nthuli_shop.enums.ProductType;

import java.util.List;


public class ShoeResponseDto extends ProductResponseDto {
    private String gender;
    private String material;

    public ShoeResponseDto() {
    }

    public ShoeResponseDto(Long id, String categoryName, ProductType productType, Double price, String description, String name, String gender, String material, List<ProductImageResponseDto> images) {
        super(id, categoryName, productType, price, description, name, images);
        this.gender = gender;
        this.material = material;
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
