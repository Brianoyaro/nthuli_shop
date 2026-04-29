package org.nthuli_shop.nthuli_shop.product.enums;

public enum FurnitureTypeEnum {
    // Home Furniture Types
    BED,
    SOFAS,
    DINING_SET,
    DINING_TABLE,
    DINING_CHAIR,
    HOME_OTHER,
    // Office Furniture Types
    OFFICE_CHAIR,
    BOARDROOM_TABLE,
    WORKSTATION,
    OFFICE_SOFA,
    OFFICE_DESK,
    OFFICE_OTHER;

    /**
     * Infers the furniture category from the furniture type
     * @return FurnitureCategoryEnum (HOME or OFFICE)
     */
    public FurnitureCategoryEnum getCategory() {
        return switch(this) {
            case BED, SOFAS, DINING_SET, DINING_TABLE, DINING_CHAIR, HOME_OTHER -> FurnitureCategoryEnum.HOME;
            case OFFICE_CHAIR, BOARDROOM_TABLE, WORKSTATION, OFFICE_SOFA, OFFICE_DESK, OFFICE_OTHER -> FurnitureCategoryEnum.OFFICE;
        };
    }
}
