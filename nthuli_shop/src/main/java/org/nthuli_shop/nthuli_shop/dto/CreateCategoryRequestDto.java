package org.nthuli_shop.nthuli_shop.dto_old;

public class CreateCategoryRequestDto {
    private String name;

    public CreateCategoryRequestDto() {}
    public CreateCategoryRequestDto(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
