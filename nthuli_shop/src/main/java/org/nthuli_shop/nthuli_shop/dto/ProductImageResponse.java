package org.nthuli_shop.nthuli_shop.dto;

public class ProductImageResponse {
    private Long id;
    private Boolean isPrimary;
    private String imageUrl;

    public ProductImageResponse() {
    }

    public ProductImageResponse(Long id, boolean isPrimary, String imageUrl) {
        this.id = id;
        this.isPrimary = isPrimary;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public boolean isPrimary() {
        return isPrimary;
    }

    public void setPrimary(boolean primary) {
        isPrimary = primary;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
