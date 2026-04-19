package org.nthuli_shop.nthuli_shop.product.dto;


import org.nthuli_shop.nthuli_shop.product.enums.ProductType;

import java.util.List;

public class ProductResponseDto {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private ProductType type;
    private String categoryName;
    private List<ProductImageResponseDto> images;


    public ProductResponseDto() {
    }

    public ProductResponseDto(Long id, String categoryName, ProductType productType, Double price, String description, String name, List<ProductImageResponseDto> images) {
        this.id = id;
        this.categoryName = categoryName;
        this.type = productType;
        this.price = price;
        this.description = description;
        this.name = name;
        this.images = images;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public ProductType getType() {
        return type;
    }

    public void setType(ProductType type) {
        this.type = type;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<ProductImageResponseDto> getImages() {
        return images;
    }

    public void setImages(List<ProductImageResponseDto> images) {
        this.images = images;
    }
}
