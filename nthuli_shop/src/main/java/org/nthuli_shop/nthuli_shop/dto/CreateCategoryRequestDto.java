package org.nthuli_shop.nthuli_shop.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCategoryRequestDto {
    @NotBlank(message = "Category name is required")
    private String name;

    public CreateCategoryRequestDto() {
    }
    public CreateCategoryRequestDto( String name) {
        this.name = name;
    }

    public  String getName() {
        return name;
    }

    public void setName( String name) {
        this.name = name;
    }
}
