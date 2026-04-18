package org.nthuli_shop.nthuli_shop.product.dto;


import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXISTING_PROPERTY,
        property = "type",
        visible = true
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = ShoeRequestDto.class, name = "SHOES"),
        @JsonSubTypes.Type(value = FurnitureRequestDto.class, name = "FURNITURE"),
        @JsonSubTypes.Type(value = KitchenApplianceRequestDto.class, name = "KITCHEN_APPLIANCE"),
        @JsonSubTypes.Type(value = ClothesRequestDto.class, name = "CLOTHES")
})
public class ProductRequestDto {
    @NotBlank(message = "product name is required")
    private String name;
    @NotBlank(message = "product description is required")
    private String description;
    @NotNull
    private Double price;
    @NotNull
    private Long categoryId;
    @NotBlank(message = "product type is required")
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
