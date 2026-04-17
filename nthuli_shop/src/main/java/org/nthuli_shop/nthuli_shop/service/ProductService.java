package org.nthuli_shop.nthuli_shop.service;

import org.nthuli_shop.nthuli_shop.dto.*;
import org.nthuli_shop.nthuli_shop.dto_old.ProductImageResponse;
import org.nthuli_shop.nthuli_shop.entity.*;
import org.nthuli_shop.nthuli_shop.enums.*;
import org.nthuli_shop.nthuli_shop.repository.CategoryRepository;
import org.nthuli_shop.nthuli_shop.repository.ProductImageRepository;
import org.nthuli_shop.nthuli_shop.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class ProductService {
    private final ProductRepository productRepository;
    private final FileStorageService fileStorageService;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, FileStorageService fileStorageService, ProductImageRepository productImageRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.fileStorageService = fileStorageService;
        this.productImageRepository = productImageRepository;
        this.categoryRepository = categoryRepository;
    }

    // get all products
    public List<ProductResponseDto> getAllProducts() {

        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(this::mapToResponse)
                .toList();
    }

    // get one product
    public ProductResponseDto getProduct(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product with that ID does not exist!"));
        return mapToResponse(product);
    }

    // create a product starts here
    //-----------------------------------------------------------------
    public ProductResponseDto createProduct(
            ProductRequestDto request,
            List<MultipartFile> images,
            Integer primaryImageIndex
    ) {

        Product product = switch (ProductType.valueOf(request.getType())) {
            case SHOES -> createShoeEntity((ShoeRequestDto) request);
            case FURNITURE -> createFurnitureEntity((FurnitureRequestDto) request);
            case KITCHEN_APPLIANCE -> createKitchenEntity((KitchenApplianceRequestDto) request);
            case CLOTHES -> createClothesEntity((ClothesRequestDto) request);
            default -> throw new IllegalArgumentException("Unsupported product type: " + request.getType());
        };

        // save product first
        product = productRepository.save(product);

        // handle images (shared logic)
        attachImages(product, images, primaryImageIndex);

        product = productRepository.save(product);

        return mapToResponse(product);
    }
    private void attachImages(Product product, List<MultipartFile> images, Integer primaryImageIndex) {

        List<ProductImage> imageEntities = new ArrayList<>();

        for (int i = 0; i < images.size(); i++) {
            MultipartFile file = images.get(i);
            String url = fileStorageService.saveFile(file);

            ProductImage img = new ProductImage();
            img.setProduct(product);
            img.setImageUrl(url);
            img.setPrimary(i == primaryImageIndex);

            imageEntities.add(img);
        }

        product.getImages().addAll(imageEntities);
    }
    private Category getCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }
    private Shoes createShoeEntity(ShoeRequestDto request) {
        Category category = getCategory(request.getCategoryId());

        Shoes shoe = new Shoes();
        shoe.setName(request.getName());
        shoe.setDescription(request.getDescription());
        shoe.setPrice(request.getPrice());
        shoe.setCategory(category);

        shoe.setGender(GenderEnum.valueOf(request.getGender()));
        shoe.setMaterial(ShoeMaterialEnum.valueOf(request.getMaterial()));

        return shoe;
    }
    private Furniture createFurnitureEntity(FurnitureRequestDto request) {
        Category category = getCategory(request.getCategoryId());

        Furniture furniture = new Furniture();
        furniture.setName(request.getName());
        furniture.setDescription(request.getDescription());
        furniture.setPrice(request.getPrice());
        furniture.setCategory(category);

        furniture.setFurnitureMaterial(
                FurnitureMaterialEnum.valueOf(request.getFurnitureMaterial())
        );
        furniture.setFurnitureType(
                FurnitureTypeEnum.valueOf(request.getFurnitureType())
        );

        return furniture;
    }
    private KitchenAppliance createKitchenEntity(KitchenApplianceRequestDto request) {
        Category category = getCategory(request.getCategoryId());

        KitchenAppliance product = new KitchenAppliance();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);

        product.setWattage(request.getWattage());
        product.setApplianceFunction(request.getApplianceFunction());

        return product;
    }
    private Clothes createClothesEntity(ClothesRequestDto request) {
        Category category = getCategory(request.getCategoryId());

        Clothes clothes = new Clothes();
        clothes.setName(request.getName());
        clothes.setDescription(request.getDescription());
        clothes.setPrice(request.getPrice());
        clothes.setCategory(category);

        clothes.setClotheGender(GenderEnum.valueOf(request.getClotheGender()));
        clothes.setClotheMaterial(
                ClothesMaterialEnum.valueOf(request.getClotheMaterial())
        );
        clothes.setClotheType(
                ClothesTypeEnum.valueOf(request.getClotheType())
        );

        return clothes;
    }
    // create ends here
    //-------------------------------------------------------------------------------------------------------------


    // update a product
    // delete a product





    // mapper function section starts here
    private void mapBaseProductFields(Product product, ProductResponseDto response) {
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setType(product.getType());
        response.setCategoryName(product.getCategory().getName());

        response.setImages(
                product.getImages().stream()
                        .map(img -> {
                            ProductImageResponse imageResponse = new ProductImageResponse();
                            imageResponse.setId(img.getId());
                            imageResponse.setImageUrl(img.getImageUrl());
                            imageResponse.setPrimary(img.getPrimary());
                            return imageResponse;
                        })
                        .toList()
        );
    }

    private ShoeResponseDto mapShoe(Shoes shoe) {
        ShoeResponseDto response = new ShoeResponseDto();
        mapBaseProductFields(shoe, response);

        response.setGender(shoe.getGender().name());
        response.setMaterial(shoe.getMaterial().name());

        return response;
    }
    private FurnitureResponseDto mapFurniture(Furniture furniture) {
        FurnitureResponseDto response = new FurnitureResponseDto();
        mapBaseProductFields(furniture, response);

        response.setFurnitureMaterial(furniture.getFurnitureMaterial().name());
        response.setFurnitureType(furniture.getFurnitureType().name());

        return response;
    }
    private KitchenApplianceResponseDto mapKitchen(KitchenAppliance product) {
        KitchenApplianceResponseDto response = new KitchenApplianceResponseDto();
        mapBaseProductFields(product, response);

        response.setWattage(product.getWattage());
        response.setApplianceFunction(product.getApplianceFunction().name());

        return response;
    }
    private ClothesResponseDto mapClothes(Clothes clothes) {
        ClothesResponseDto response = new ClothesResponseDto();
        mapBaseProductFields(clothes, response);

        response.setClotheGender(clothes.getClotheGender().name());
        response.setClotheMaterial(clothes.getClotheMaterial().name());
        response.setClotheType(clothes.getClotheType().name());

        return response;
    }
    public ProductResponseDto mapToResponse(Product product) {

        return switch (product.getType()) {
            case SHOES -> mapShoe((Shoes) product);
            case FURNITURE -> mapFurniture((Furniture) product);
            case KITCHEN_APPLIANCE -> mapKitchen((KitchenAppliance) product);
            case CLOTHES -> mapClothes((Clothes) product);
            default -> throw new IllegalArgumentException("Unsupported product type: " + product.getType());
        };
    }
    // mapper section ends here


    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11
    // ✅ ADD IMAGES
    public void addImages(Long productId, List<MultipartFile> files) {
        Product product = productRepository.findById(productId).orElseThrow();

        for (MultipartFile file : files) {
            String url = fileStorageService.saveFile(file);

            ProductImage img = new ProductImage();
            img.setProduct(product);
            img.setImageUrl(url);
            img.setPrimary(false);

            product.getImages().add(img);
        }

        productRepository.save(product);
    }

    // ✅ DELETE IMAGE
    public void deleteImage(Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));
        fileStorageService.deleteFile(image.getImageUrl()); // Delete from disk
        productImageRepository.delete(image); // Delete from DB
    }
}
