package org.nthuli_shop.nthuli_shop.main_bak.repository.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import org.nthuli_shop.nthuli_shop.main_bak.repository.enums.FurnitureMaterialEnum;
import org.nthuli_shop.nthuli_shop.main_bak.repository.enums.FurnitureTypeEnum;

import java.util.List;

@Entity
public class Furniture extends Product{
    //
    @Enumerated(EnumType.STRING)
    private FurnitureMaterialEnum furnitureMaterial;

    @Enumerated(EnumType.STRING)
    private FurnitureTypeEnum furnitureType;

    public Furniture() {
    }

    public Furniture(String name, String description, Double price, Category category, List<ProductImage> images, FurnitureTypeEnum furnitureType, FurnitureMaterialEnum furnitureMaterial) {
        super(name, description, price, category, images);
        this.furnitureType = furnitureType;
        this.furnitureMaterial = furnitureMaterial;
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
