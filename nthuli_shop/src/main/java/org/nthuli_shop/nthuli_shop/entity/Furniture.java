package org.nthuli_shop.nthuli_shop.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import org.nthuli_shop.nthuli_shop.enums.FurnitureMaterialEnum;
import org.nthuli_shop.nthuli_shop.enums.FurnitureTypeEnum;

@Entity
public class Furniture extends Product{
    //
    @Enumerated(EnumType.STRING)
    private FurnitureMaterialEnum furnitureMaterial;

    @Enumerated(EnumType.STRING)
    private FurnitureTypeEnum furnitureType;

    public Furniture() {
    }

    public Furniture(String name, String description, Double price, Category category, FurnitureMaterialEnum furnitureMaterial, FurnitureTypeEnum furnitureType) {
        super(name, description, price, category);
        this.furnitureMaterial = furnitureMaterial;
        this.furnitureType = furnitureType;
    }

    public FurnitureMaterialEnum getFurnitureMaterial() {
        return furnitureMaterial;
    }

    public void setFurnitureMaterial(FurnitureMaterialEnum furnitureMaterial) {
        this.furnitureMaterial = furnitureMaterial;
    }

    public FurnitureTypeEnum getFurnitureType() {
        return furnitureType;
    }

    public void setFurnitureType(FurnitureTypeEnum furnitureType) {
        this.furnitureType = furnitureType;
    }
}
