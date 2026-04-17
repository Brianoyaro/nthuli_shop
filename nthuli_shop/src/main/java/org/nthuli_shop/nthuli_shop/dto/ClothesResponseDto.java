package org.nthuli_shop.nthuli_shop.dto;

import org.nthuli_shop.nthuli_shop.dto_old.ProductImageResponse;
import org.nthuli_shop.nthuli_shop.enums.ClothesMaterialEnum;
import org.nthuli_shop.nthuli_shop.enums.ClothesTypeEnum;
import org.nthuli_shop.nthuli_shop.enums.GenderEnum;
import org.nthuli_shop.nthuli_shop.enums.ProductType;

import java.util.List;

public class ClothesResponseDto extends ProductResponseDto{
    private String clotheGender;
    private String clotheMaterial;
    private String clotheType;

    public ClothesResponseDto() {
    }

    public ClothesResponseDto(Long id, String categoryName, ProductType productType, Double price, String description, String name, String clotheGender, String clotheMaterial, String clotheType, List<ProductImageResponse> images) {
        super(id, categoryName, productType, price, description, name, images);
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

    public String getClotheType() {
        return clotheType;
    }

    public void setClotheType(String clotheType) {
        this.clotheType = clotheType;
    }

    public String getClotheMaterial() {
        return clotheMaterial;
    }

    public void setClotheMaterial(String clotheMaterial) {
        this.clotheMaterial = clotheMaterial;
    }
}
