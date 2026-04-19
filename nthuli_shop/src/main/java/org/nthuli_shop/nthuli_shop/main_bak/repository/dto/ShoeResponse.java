package org.nthuli_shop.nthuli_shop.main_bak.repository.dto;

import java.util.List;

public class ShoeResponse {
    //
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Long categoryId;
    private String gender;
    private String material;
    private List<ProductImageResponse> images;

    public ShoeResponse() {
    }

    public ShoeResponse(Long id, String description, String name, Double price, String gender, Long categoryId, String material, List<ProductImageResponse> images) {
        this.id = id;
        this.description = description;
        this.name = name;
        this.price = price;
        this.gender = gender;
        this.categoryId = categoryId;
        this.material = material;
        this.images = images;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
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

    public List<ProductImageResponse> getImages() {
        return images;
    }

    public void setImages(List<ProductImageResponse> images) {
        this.images = images;
    }
}
