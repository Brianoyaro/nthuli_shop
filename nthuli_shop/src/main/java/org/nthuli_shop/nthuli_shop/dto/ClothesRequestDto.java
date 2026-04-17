package org.nthuli_shop.nthuli_shop.dto;

import org.nthuli_shop.nthuli_shop.enums.ClothesMaterialEnum;
import org.nthuli_shop.nthuli_shop.enums.ClothesTypeEnum;
import org.nthuli_shop.nthuli_shop.enums.GenderEnum;
import org.nthuli_shop.nthuli_shop.enums.ProductType;


public class ClothesRequestDto extends ProductRequestDto {
    private String clotheGender;
    private String clotheMaterial;
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
