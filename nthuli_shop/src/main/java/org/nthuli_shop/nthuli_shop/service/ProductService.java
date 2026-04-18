package org.nthuli_shop.nthuli_shop.service;

import org.nthuli_shop.nthuli_shop.dto.*;
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
    private Product createShoeEntity(ShoeRequestDto request) {
        Category category = getCategory(request.getCategoryId());

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);

        product.setGender(GenderEnum.valueOf(request.getGender()));
        product.setMaterial(ShoeMaterialEnum.valueOf(request.getMaterial()));

        return product;
    }
    private Product createFurnitureEntity(FurnitureRequestDto request) {
        Category category = getCategory(request.getCategoryId());

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);

        product.setFurnitureMaterial(
                FurnitureMaterialEnum.valueOf(request.getFurnitureMaterial())
        );
        product.setFurnitureType(
                FurnitureTypeEnum.valueOf(request.getFurnitureType())
        );

        return product;
    }
    private Product createKitchenEntity(KitchenApplianceRequestDto request) {
        Category category = getCategory(request.getCategoryId());

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);

        product.setWattage(request.getWattage());
        product.setApplianceFunction(KitchenApplianceFunctionEnum.valueOf(request.getApplianceFunction()));

        return product;
    }
    private Product createClothesEntity(ClothesRequestDto request) {
        Category category = getCategory(request.getCategoryId());

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);

        product.setClotheGender(GenderEnum.valueOf(request.getClotheGender()));
        product.setClotheMaterial(
                ClothesMaterialEnum.valueOf(request.getClotheMaterial())
        );
        product.setClotheType(
                ClothesTypeEnum.valueOf(request.getClotheType())
        );

        return product;
    }
    // create ends here
    //-------------------------------------------------------------------------------------------------------------

    // update a product
    public ProductResponseDto updateProduct(Long prodId, ProductRequestDto request, List<MultipartFile> images) {
        Product product = productRepository.findById(prodId).orElseThrow(() -> new RuntimeException("product to update does not exist"));
        // update images if provided
        attachImages(product, images, -1);
        //if (request.getName() != null && !request.getName().trim().isEmpty())************************************************************
        // update name, description, price, category_id, product_type
        if (request.getName() != null && !request.getName().trim().isEmpty()){
            product.setName(request.getName());
        }
        if (request.getDescription() != null && !request.getDescription().trim().isEmpty()){
            product.setDescription(request.getDescription());
        }
        if (!request.getPrice().isNaN()){
            product.setPrice(request.getPrice());
        }
        if (request.getType() != null && !request.getType().trim().isEmpty()){
            product.setType(ProductType.valueOf(request.getType()));
        }
        if (request.getCategoryId() != null) {
            Category newCategory = getCategory(request.getCategoryId());
            product.setCategory(newCategory);
        }
        //################33
        switch(product.getType()) {
            case ProductType.SHOES -> {
                //
                request = (ShoeRequestDto) request;
                if (((ShoeRequestDto) request).getGender() != null && !((ShoeRequestDto) request).getGender().trim().isEmpty()) {
                    product.setGender(GenderEnum.valueOf(((ShoeRequestDto) request).getGender()));
                }
                if (((ShoeRequestDto) request).getMaterial() != null && !((ShoeRequestDto) request).getMaterial().trim().isEmpty()) {
                    product.setMaterial(ShoeMaterialEnum.valueOf(((ShoeRequestDto) request).getMaterial()));
                }
            }
            case ProductType.KITCHEN_APPLIANCE -> {
                //
                request = (KitchenApplianceRequestDto) request;
                if (((KitchenApplianceRequestDto) request).getWattage() != null) {
                    product.setWattage(((KitchenApplianceRequestDto) request).getWattage());
                }
                if (((KitchenApplianceRequestDto) request).getApplianceFunction() != null && !((KitchenApplianceRequestDto) request).getApplianceFunction().trim().isEmpty()) {
                    product.setApplianceFunction(KitchenApplianceFunctionEnum.valueOf(((KitchenApplianceRequestDto) request).getApplianceFunction()));
                }
            }
            case ProductType.FURNITURE -> {
                //
                request = (FurnitureRequestDto) request;
                if (((FurnitureRequestDto) request).getFurnitureMaterial() != null && !(((FurnitureRequestDto) request).getFurnitureMaterial().trim().isEmpty())) {
                    product.setFurnitureMaterial(FurnitureMaterialEnum.valueOf(((FurnitureRequestDto) request).getFurnitureMaterial()));
                }
                if (((FurnitureRequestDto) request).getFurnitureType() != null && !(((FurnitureRequestDto) request).getFurnitureType().trim().isEmpty())) {
                    product.setFurnitureType(FurnitureTypeEnum.valueOf(((FurnitureRequestDto) request).getFurnitureType()));
                }
            }
            case ProductType.CLOTHES -> {
                //
                request = (ClothesRequestDto) request;
                if (((ClothesRequestDto) request).getClotheGender() != null && !(((ClothesRequestDto) request).getClotheGender().trim().isEmpty())) {
                    product.setClotheGender(GenderEnum.valueOf(((ClothesRequestDto) request).getClotheGender()));
                }
                if (((ClothesRequestDto) request).getClotheMaterial() != null && !(((ClothesRequestDto) request).getClotheMaterial().trim().isEmpty())) {
                    product.setClotheMaterial(ClothesMaterialEnum.valueOf(((ClothesRequestDto) request).getClotheMaterial()));
                }
                if (((ClothesRequestDto) request).getClotheType() != null && !(((ClothesRequestDto) request).getClotheType().trim().isEmpty())){
                    product.setClotheType(ClothesTypeEnum.valueOf(((ClothesRequestDto) request).getClotheType()));
                }
            }
        }
        //#########################3
        productRepository.save(product);
        return mapToResponse(product);
    }

    //---------------------------------------------------------------------------------------
    // delete a product
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product with that ID not found"));
        // delete its images first
        product.getImages().forEach(img ->
                fileStorageService.deleteFile(img.getImageUrl())
        );
        productRepository.deleteById(id);
    }


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
                            ProductImageResponseDto imageResponse = new ProductImageResponseDto();
                            imageResponse.setId(img.getId());
                            imageResponse.setImageUrl(img.getImageUrl());
                            imageResponse.setPrimary(img.getPrimary());
                            return imageResponse;
                        })
                        .toList()
        );
    }

    private ShoeResponseDto mapShoe(Product product) {
        ShoeResponseDto response = new ShoeResponseDto();
        mapBaseProductFields(product, response);

        response.setGender(product.getGender().name());
        response.setMaterial(product.getMaterial().name());

        return response;
    }
    private FurnitureResponseDto mapFurniture(Product product) {
        FurnitureResponseDto response = new FurnitureResponseDto();
        mapBaseProductFields(product, response);

        response.setFurnitureMaterial(product.getFurnitureMaterial().name());
        response.setFurnitureType(product.getFurnitureType().name());

        return response;
    }
    private KitchenApplianceResponseDto mapKitchen(Product product) {
        KitchenApplianceResponseDto response = new KitchenApplianceResponseDto();
        mapBaseProductFields(product, response);

        response.setWattage(product.getWattage());
        response.setApplianceFunction(product.getApplianceFunction().name());

        return response;
    }
    private ClothesResponseDto mapClothes(Product product) {
        ClothesResponseDto response = new ClothesResponseDto();
        mapBaseProductFields(product, response);

        response.setClotheGender(product.getClotheGender().name());
        response.setClotheMaterial(product.getClotheMaterial().name());
        response.setClotheType(product.getClotheType().name());

        return response;
    }
    public ProductResponseDto mapToResponse(Product product) {

        return switch (product.getType()) {
            case SHOES -> mapShoe(product);
            case FURNITURE -> mapFurniture(product);
            case KITCHEN_APPLIANCE -> mapKitchen(product);
            case CLOTHES -> mapClothes(product);
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
