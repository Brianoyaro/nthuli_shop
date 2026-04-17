package org.nthuli_shop.nthuli_shop.dto;


import org.nthuli_shop.nthuli_shop.enums.ProductType;

public class ProductRequestDto {
    private String name;
    private String description;
    private Double price;
    private Long categoryId;
    private String type;
//    private List<ProductImage> images;


    public ProductRequestDto() {
    }

    public ProductRequestDto(String name, String type, Double price, String description, Long categoryId) {
        this.name = name;
        this.type = type;
        this.price = price;
        this.description = description;
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
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
}
