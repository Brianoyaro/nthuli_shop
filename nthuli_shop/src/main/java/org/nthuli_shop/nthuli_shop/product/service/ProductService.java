package org.nthuli_shop.nthuli_shop.product.service;

import org.nthuli_shop.nthuli_shop.product.dto.*;
import org.nthuli_shop.nthuli_shop.category.entity.Category;
import org.nthuli_shop.nthuli_shop.product.entity.Product;
import org.nthuli_shop.nthuli_shop.product.entity.ProductImage;
import org.nthuli_shop.nthuli_shop.product.enums.*;
import org.nthuli_shop.nthuli_shop.category.repository.CategoryRepository;
import org.nthuli_shop.nthuli_shop.product.repository.ProductImageRepository;
import org.nthuli_shop.nthuli_shop.product.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {
    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);
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
        logger.info("Fetching all products");
        List<Product> products = productRepository.findAll();
        logger.info("Retrieved {} products from database", products.size());
        return products.stream()
                .map(this::mapToResponse)
                .toList();
    }

    // get all products grouped by type (optimized for frontend rendering)
    public Map<String, List<ProductResponseDto>> getAllProductsGroupedByType() {
        logger.info("Fetching all products grouped by product type");
        long startTime = System.currentTimeMillis();
        
        List<Product> products = productRepository.findAllByOrderByTypeAsc();
        logger.info("Retrieved {} products from database", products.size());
        
        Map<String, List<ProductResponseDto>> groupedProducts = products.stream()
                .map(p -> new java.util.AbstractMap.SimpleEntry<>(p.getType().name(), this.mapToResponse(p)))
                .collect(Collectors.groupingBy(
                        java.util.Map.Entry::getKey,
                        Collectors.mapping(java.util.Map.Entry::getValue, Collectors.toList())
                ));
        
        long duration = System.currentTimeMillis() - startTime;
        logger.info("Products grouped by type - Found {} type categories in {} ms", groupedProducts.size(), duration);
        groupedProducts.forEach((type, prods) -> logger.debug("Type: {} - Count: {}", type, prods.size()));
        
        return groupedProducts;
    }

    // get one product
    public ProductResponseDto getProduct(Long id) {
        logger.info("Fetching product with ID: {}", id);
        Product product = productRepository.findById(id).orElseThrow(() -> {
            logger.error("Product not found with ID: {}", id);
            return new RuntimeException("Product with that ID does not exist!");
        });
        logger.info("Product found with ID: {}", id);
        return mapToResponse(product);
    }

    // create a product starts here
    //-----------------------------------------------------------------
    public ProductResponseDto createProduct(
            ProductRequestDto request,
            List<MultipartFile> images,
            Integer primaryImageIndex
    ) {
        logger.info("Creating new product: {}", request.getName());
        
        // Check for duplicate product
        if (productRepository.findByName(request.getName()).isPresent()) {
            logger.warn("Product creation failed - duplicate product name: {}", request.getName());
            throw new IllegalArgumentException("A product with the name '" + request.getName() + "' already exists!");
        }

        logger.debug("Product type: {}", request.getType());
        Product product = switch (ProductType.valueOf(request.getType())) {
            case SHOES -> createShoeEntity((ShoeRequestDto) request);
            case FURNITURE -> createFurnitureEntity((FurnitureRequestDto) request);
            case KITCHEN_APPLIANCE -> createKitchenEntity((KitchenApplianceRequestDto) request);
            case CLOTHES -> createClothesEntity((ClothesRequestDto) request);
            default -> throw new IllegalArgumentException("Unsupported product type: " + request.getType());
        };

        // save product first
        product = productRepository.save(product);
        logger.info("Product saved with ID: {}", product.getId());

        // handle images (shared logic)
        attachImages(product, images, primaryImageIndex);

        product = productRepository.save(product);
        logger.info("Product created successfully with ID: {}, Type: {}", product.getId(), product.getType());

        return mapToResponse(product);
    }

    private void attachImages(Product product, List<MultipartFile> images, Integer primaryImageIndex) {
        logger.info("Attaching {} images to product ID: {}", images.size(), product.getId());

        List<ProductImage> imageEntities = new ArrayList<>();

        for (int i = 0; i < images.size(); i++) {
            MultipartFile file = images.get(i);
            logger.debug("Processing image {}: {}", i + 1, file.getOriginalFilename());
            String url = fileStorageService.saveFile(file);

            ProductImage img = new ProductImage();
            img.setProduct(product);
            img.setImageUrl(url);
            img.setPrimary(i == primaryImageIndex);

            imageEntities.add(img);
        }

        product.getImages().addAll(imageEntities);
        logger.info("Successfully attached {} images to product ID: {}", imageEntities.size(), product.getId());
    }

    private Category getCategory(Long categoryId) {
        logger.debug("Fetching category with ID: {}", categoryId);
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> {
                    logger.error("Category not found with ID: {}", categoryId);
                    return new RuntimeException("Category not found");
                });
    }

    private Product createShoeEntity(ShoeRequestDto request) {
        logger.debug("Creating shoe entity with name: {}, gender: {}, material: {}", 
            request.getName(), request.getGender(), request.getMaterial());
        Category category = getCategory(request.getCategoryId());

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setType(ProductType.SHOES);

        product.setGender(GenderEnum.valueOf(request.getGender()));
        product.setMaterial(ShoeMaterialEnum.valueOf(request.getMaterial()));

        logger.debug("Shoe entity created with type: SHOES");
        return product;
    }

    private Product createFurnitureEntity(FurnitureRequestDto request) {
        logger.debug("Creating furniture entity with name: {}, type: {}, material: {}", 
            request.getName(), request.getFurnitureType(), request.getFurnitureMaterial());
        Category category = getCategory(request.getCategoryId());

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setType(ProductType.FURNITURE);

        product.setFurnitureMaterial(
                FurnitureMaterialEnum.valueOf(request.getFurnitureMaterial())
        );
        product.setFurnitureType(
                FurnitureTypeEnum.valueOf(request.getFurnitureType())
        );

        logger.debug("Furniture entity created with type: FURNITURE");
        return product;
    }

    private Product createKitchenEntity(KitchenApplianceRequestDto request) {
        logger.debug("Creating kitchen appliance entity with name: {}, wattage: {}, function: {}", 
            request.getName(), request.getWattage(), request.getApplianceFunction());
        Category category = getCategory(request.getCategoryId());

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setType(ProductType.KITCHEN_APPLIANCE);

        product.setWattage(request.getWattage());
        product.setApplianceFunction(KitchenApplianceFunctionEnum.valueOf(request.getApplianceFunction()));

        logger.debug("Kitchen appliance entity created with type: KITCHEN_APPLIANCE");
        return product;
    }

    private Product createClothesEntity(ClothesRequestDto request) {
        logger.debug("Creating clothes entity with name: {}, gender: {}, type: {}, material: {}", 
            request.getName(), request.getClotheGender(), request.getClotheType(), request.getClotheMaterial());
        Category category = getCategory(request.getCategoryId());

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setType(ProductType.CLOTHES);

        product.setClotheGender(GenderEnum.valueOf(request.getClotheGender()));
        product.setClotheMaterial(
                ClothesMaterialEnum.valueOf(request.getClotheMaterial())
        );
        product.setClotheType(
                ClothesTypeEnum.valueOf(request.getClotheType())
        );

        logger.debug("Clothes entity created with type: CLOTHES");
        return product;
    }
    // create ends here
    //-------------------------------------------------------------------------------------------------------------

    // update a product
    public ProductResponseDto updateProduct(Long prodId, ProductRequestDto request, List<MultipartFile> images) {
        logger.info("Updating product with ID: {}", prodId);
        Product product = productRepository.findById(prodId).orElseThrow(() -> {
            logger.error("Product not found for update with ID: {}", prodId);
            return new RuntimeException("product to update does not exist");
        });
        
        // update images if provided
        if (images != null && !images.isEmpty()) {
            logger.info("Updating {} images for product ID: {}", images.size(), prodId);
            attachImages(product, images, -1);
        }
        
        // update name, description, price, category_id, product_type
        if (request.getName() != null && !request.getName().trim().isEmpty()){
            logger.debug("Updating product name to: {}", request.getName());
            product.setName(request.getName());
        }
        if (request.getDescription() != null && !request.getDescription().trim().isEmpty()){
            logger.debug("Updating product description");
            product.setDescription(request.getDescription());
        }
        if (!request.getPrice().isNaN()){
            logger.debug("Updating product price to: {}", request.getPrice());
            product.setPrice(request.getPrice());
        }
        if (request.getType() != null && !request.getType().trim().isEmpty()){
            logger.debug("Updating product type to: {}", request.getType());
            product.setType(ProductType.valueOf(request.getType()));
        }
        if (request.getCategoryId() != null) {
            logger.debug("Updating product category to ID: {}", request.getCategoryId());
            Category newCategory = getCategory(request.getCategoryId());
            product.setCategory(newCategory);
        }
        
        switch(product.getType()) {
            case ProductType.SHOES -> {
                request = (ShoeRequestDto) request;
                if (((ShoeRequestDto) request).getGender() != null && !((ShoeRequestDto) request).getGender().trim().isEmpty()) {
                    logger.debug("Updating shoe gender to: {}", ((ShoeRequestDto) request).getGender());
                    product.setGender(GenderEnum.valueOf(((ShoeRequestDto) request).getGender()));
                }
                if (((ShoeRequestDto) request).getMaterial() != null && !((ShoeRequestDto) request).getMaterial().trim().isEmpty()) {
                    logger.debug("Updating shoe material to: {}", ((ShoeRequestDto) request).getMaterial());
                    product.setMaterial(ShoeMaterialEnum.valueOf(((ShoeRequestDto) request).getMaterial()));
                }
            }
            case ProductType.KITCHEN_APPLIANCE -> {
                request = (KitchenApplianceRequestDto) request;
                if (((KitchenApplianceRequestDto) request).getWattage() != null) {
                    logger.debug("Updating appliance wattage to: {}", ((KitchenApplianceRequestDto) request).getWattage());
                    product.setWattage(((KitchenApplianceRequestDto) request).getWattage());
                }
                if (((KitchenApplianceRequestDto) request).getApplianceFunction() != null && !((KitchenApplianceRequestDto) request).getApplianceFunction().trim().isEmpty()) {
                    logger.debug("Updating appliance function to: {}", ((KitchenApplianceRequestDto) request).getApplianceFunction());
                    product.setApplianceFunction(KitchenApplianceFunctionEnum.valueOf(((KitchenApplianceRequestDto) request).getApplianceFunction()));
                }
            }
            case ProductType.FURNITURE -> {
                request = (FurnitureRequestDto) request;
                if (((FurnitureRequestDto) request).getFurnitureMaterial() != null && !(((FurnitureRequestDto) request).getFurnitureMaterial().trim().isEmpty())) {
                    logger.debug("Updating furniture material to: {}", ((FurnitureRequestDto) request).getFurnitureMaterial());
                    product.setFurnitureMaterial(FurnitureMaterialEnum.valueOf(((FurnitureRequestDto) request).getFurnitureMaterial()));
                }
                if (((FurnitureRequestDto) request).getFurnitureType() != null && !(((FurnitureRequestDto) request).getFurnitureType().trim().isEmpty())) {
                    logger.debug("Updating furniture type to: {}", ((FurnitureRequestDto) request).getFurnitureType());
                    product.setFurnitureType(FurnitureTypeEnum.valueOf(((FurnitureRequestDto) request).getFurnitureType()));
                }
            }
            case ProductType.CLOTHES -> {
                request = (ClothesRequestDto) request;
                if (((ClothesRequestDto) request).getClotheGender() != null && !(((ClothesRequestDto) request).getClotheGender().trim().isEmpty())) {
                    logger.debug("Updating clothes gender to: {}", ((ClothesRequestDto) request).getClotheGender());
                    product.setClotheGender(GenderEnum.valueOf(((ClothesRequestDto) request).getClotheGender()));
                }
                if (((ClothesRequestDto) request).getClotheMaterial() != null && !(((ClothesRequestDto) request).getClotheMaterial().trim().isEmpty())) {
                    logger.debug("Updating clothes material to: {}", ((ClothesRequestDto) request).getClotheMaterial());
                    product.setClotheMaterial(ClothesMaterialEnum.valueOf(((ClothesRequestDto) request).getClotheMaterial()));
                }
                if (((ClothesRequestDto) request).getClotheType() != null && !(((ClothesRequestDto) request).getClotheType().trim().isEmpty())){
                    logger.debug("Updating clothes type to: {}", ((ClothesRequestDto) request).getClotheType());
                    product.setClotheType(ClothesTypeEnum.valueOf(((ClothesRequestDto) request).getClotheType()));
                }
            }
        }
        
        productRepository.save(product);
        logger.info("Product updated successfully with ID: {}", prodId);
        return mapToResponse(product);
    }

    //---------------------------------------------------------------------------------------
    // delete a product
    public void deleteProduct(Long id) {
        logger.info("Attempting to delete product with ID: {}", id);
        Product product = productRepository.findById(id).orElseThrow(() -> {
            logger.error("Product not found for deletion with ID: {}", id);
            return new RuntimeException("Product with that ID not found");
        });
        
        // delete its images first
        int imageCount = product.getImages().size();
        logger.info("Deleting {} images for product ID: {}", imageCount, id);
        product.getImages().forEach(img -> {
            logger.debug("Deleting image: {}", img.getImageUrl());
            fileStorageService.deleteFile(img.getImageUrl());
        });
        
        productRepository.deleteById(id);
        logger.info("Product deleted successfully with ID: {}", id);
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
