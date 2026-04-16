package org.nthuli_shop.nthuli_shop.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import org.nthuli_shop.nthuli_shop.enums.ClothesMaterialEnum;
import org.nthuli_shop.nthuli_shop.enums.ClothesTypeEnum;
import org.nthuli_shop.nthuli_shop.enums.GenderEnum;

@Entity
public class Clothes extends Product{
    //
    @Enumerated(EnumType.STRING)
    private GenderEnum gender;

    @Enumerated(EnumType.STRING)
    private ClothesMaterialEnum clotheMaterial;

    // size will be selected during checkout.

    @Enumerated(EnumType.STRING)
    private ClothesTypeEnum clotheType;

    public Clothes() {
    }

    public Clothes(String name, String description, Double price, Category category, GenderEnum gender, ClothesMaterialEnum clotheMaterial, ClothesTypeEnum clotheType) {
        super(name, description, price, category);
        this.gender = gender;
        this.clotheMaterial = clotheMaterial;
        this.clotheType = clotheType;
    }

    public GenderEnum getGender() {
        return gender;
    }

    public void setGender(GenderEnum gender) {
        this.gender = gender;
    }

    public ClothesMaterialEnum getClotheMaterial() {
        return clotheMaterial;
    }

    public void setClotheMaterial(ClothesMaterialEnum clotheMaterial) {
        this.clotheMaterial = clotheMaterial;
    }

    public ClothesTypeEnum getClotheType() {
        return clotheType;
    }

    public void setClotheType(ClothesTypeEnum clotheType) {
        this.clotheType = clotheType;
    }
}
