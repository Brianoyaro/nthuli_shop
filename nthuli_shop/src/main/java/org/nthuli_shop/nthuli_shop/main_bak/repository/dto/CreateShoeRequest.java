package org.nthuli_shop.nthuli_shop.main_bak.repository.dto;

public class CreateShoeRequest {
    private String name;
    private String description;
    private Double price;
    private Long categoryId;
    private String gender;
    private String material;

    public CreateShoeRequest() {
    }

    public CreateShoeRequest(String name, String description, Double price, Long categoryId, String gender, String material) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.categoryId = categoryId;
        this.gender = gender;
        this.material = material;
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
}
