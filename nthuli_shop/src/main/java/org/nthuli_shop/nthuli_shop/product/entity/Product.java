package org.nthuli_shop.nthuli_shop.product.entity;

import jakarta.persistence.*;
import org.nthuli_shop.nthuli_shop.category.entity.Category;
import org.nthuli_shop.nthuli_shop.product.enums.*;

import java.util.List;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
//@Discriminator(name = "category")
public class Product {
    //
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String description;
    @Column(nullable = false)
    private Double price;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images;

    @Enumerated(EnumType.STRING)
    private ProductType type;

    // shoe related attributes
    @Enumerated(EnumType.STRING)
    private GenderEnum gender;
    @Enumerated(EnumType.STRING)
    private ShoeMaterialEnum material;

    // kitchen appliance related attributes
    private Double wattage; //energy consumption of the material
    @Enumerated(EnumType.STRING)
    private KitchenApplianceFunctionEnum applianceFunction; // applianceFunction -> cutting, serving, cooking, ...

    // furniture related attributes
    @Enumerated(EnumType.STRING)
    private FurnitureMaterialEnum furnitureMaterial;
    @Enumerated(EnumType.STRING)
    private FurnitureTypeEnum furnitureType;

    // clothes related attributes
    @Enumerated(EnumType.STRING)
    private GenderEnum clotheGender;
    @Enumerated(EnumType.STRING)
    private ClothesMaterialEnum clotheMaterial;
    // size will be selected during checkout.
    @Enumerated(EnumType.STRING)
    private ClothesTypeEnum clotheType;

    // CONSTRUCTORS
    //--------------------------------------------------------------
    // no-args constructor
    public Product() {
    }
    // base class constructor - common attributes
    public Product(String name, String description, Double price, Category category, List<ProductImage> images, ProductType type) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.images = images;
        this.type = type;
    }
    // clothes constructor
    public Product(String name, String description, Double price, Category category, List<ProductImage> images, ProductType type, GenderEnum gender, ClothesMaterialEnum clotheMaterial, ClothesTypeEnum clotheType) {
        this(name, description, price, category, images, type);
        this.gender = gender;
        this.clotheMaterial = clotheMaterial;
        this.clotheType = clotheType;
    }
    // furniture constructor
    public Product(String name, String description, Double price, Category category, List<ProductImage> images, ProductType type, FurnitureTypeEnum furnitureType, FurnitureMaterialEnum furnitureMaterial) {
        this(name, description, price, category, images, type);
        this.furnitureType = furnitureType;
        this.furnitureMaterial = furnitureMaterial;
    }
    // kitchen appliance constructor
    public Product(String name, String description, Double price, Category category, List<ProductImage> images, ProductType type, Double wattage, KitchenApplianceFunctionEnum applianceFunction) {
        this(name, description, price, category, images, type);
        this.wattage = wattage;
        this.applianceFunction = applianceFunction;
    }
    // shoe constructor
    public Product(String name, String description, Double price, Category category, List<ProductImage> images, ProductType type, GenderEnum gender, ShoeMaterialEnum material) {
        this(name, description, price, category, images, type);
        this.gender = gender;
        this.material = material;
    }

    // getters and setters

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

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public List<ProductImage> getImages() {
        return images;
    }

    public void setImages(List<ProductImage> images) {
        this.images = images;
    }

    public GenderEnum getGender() {
        return gender;
    }

    public void setGender(GenderEnum gender) {
        this.gender = gender;
    }

    public ShoeMaterialEnum getMaterial() {
        return material;
    }

    public void setMaterial(ShoeMaterialEnum material) {
        this.material = material;
    }

    public Double getWattage() {
        return wattage;
    }

    public void setWattage(Double wattage) {
        this.wattage = wattage;
    }

    public KitchenApplianceFunctionEnum getApplianceFunction() {
        return applianceFunction;
    }

    public void setApplianceFunction(KitchenApplianceFunctionEnum applianceFunction) {
        this.applianceFunction = applianceFunction;
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

    public GenderEnum getClotheGender() {
        return clotheGender;
    }

    public void setClotheGender(GenderEnum clotheGender) {
        this.clotheGender = clotheGender;
    }

    public ClothesMaterialEnum getClotheMaterial() {
        return clotheMaterial;
    }

    public void setClotheMaterial(ClothesMaterialEnum clotheMaterial) {
        this.clotheMaterial = clotheMaterial;
    }

    public ClothesTypeEnum getClotheType() {
        return clotheType;
    }

    public void setClotheType(ClothesTypeEnum clotheType) {
        this.clotheType = clotheType;
    }

    public ProductType getType() {
        return type;
    }

    public void setType(ProductType type) {
        this.type = type;
    }
}
