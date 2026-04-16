package org.nthuli_shop.nthuli_shop.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import org.nthuli_shop.nthuli_shop.enums.GenderEnum;
import org.nthuli_shop.nthuli_shop.enums.ShoeMaterialEnum;

import java.util.List;

@Entity
public class Shoes extends Product{
    //
    @Enumerated(EnumType.STRING)
    private GenderEnum gender;

    @Enumerated(EnumType.STRING)
    private ShoeMaterialEnum material;

    public Shoes() {
    }

    public Shoes(String name, String description, Double price, Category category, List<ProductImage> images, GenderEnum gender, ShoeMaterialEnum material) {
        super(name, description, price, category, images);
        this.gender = gender;
        this.material = material;
    }

    public GenderEnum getGender() {
        return gender;
    }

    public void setGender(GenderEnum gender) {
        this.gender = gender;
    }

    public ShoeMaterialEnum getMaterial() {
        return material;
    }

    public void setMaterial(ShoeMaterialEnum material) {
        this.material = material;
    }
}
