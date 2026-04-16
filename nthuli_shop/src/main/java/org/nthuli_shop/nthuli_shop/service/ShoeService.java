package org.nthuli_shop.nthuli_shop.service;

import org.nthuli_shop.nthuli_shop.dto.CreateShoeRequest;
import org.nthuli_shop.nthuli_shop.dto.ProductImageResponse;
import org.nthuli_shop.nthuli_shop.dto.ShoeResponse;
import org.nthuli_shop.nthuli_shop.entity.Category;
import org.nthuli_shop.nthuli_shop.entity.ProductImage;
import org.nthuli_shop.nthuli_shop.entity.Shoes;
import org.nthuli_shop.nthuli_shop.enums.GenderEnum;
import org.nthuli_shop.nthuli_shop.enums.ShoeMaterialEnum;
import org.nthuli_shop.nthuli_shop.repository.CategoryRepository;
import org.nthuli_shop.nthuli_shop.repository.ProductImageRepository;
import org.nthuli_shop.nthuli_shop.repository.ShoesRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class ShoeService {
    //
    private final ShoesRepository shoesRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;
    private final ProductImageRepository productImageRepository;

    public ShoeService(ShoesRepository shoesRepository, CategoryRepository categoryRepository, FileStorageService fileStorageService, ProductImageRepository productImageRepository) {
        this.shoesRepository = shoesRepository;
        this.categoryRepository = categoryRepository;
        this.fileStorageService = fileStorageService;
        this.productImageRepository = productImageRepository;
    }

    // get all shoes
    public List<ShoeResponse> getAllShoes() {
        //
        return shoesRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }
    // get a shoe
    public ShoeResponse getShoe(Long id) {
        Shoes shoe = shoesRepository.findById(id).orElseThrow(() -> new RuntimeException("Shoe Product not found."));
        return mapToResponse(shoe);
    }

    // create a shoe
    public ShoeResponse createShoe(
            CreateShoeRequest request,
            List<MultipartFile> images,
            Integer primaryImageIndex
    ) {
        //
        Category category = categoryRepository.findById(request.getCategoryId()).orElseThrow(() -> new RuntimeException("Category not found"));
        Shoes shoe = new Shoes();
        shoe.setGender(GenderEnum.valueOf(request.getGender()));
        shoe.setMaterial(ShoeMaterialEnum.valueOf(request.getMaterial()));
        shoe.setDescription(request.getDescription());
        shoe.setPrice(request.getPrice());
        shoe.setCategory(category);
        shoe.setName(request.getName());

        shoe = shoesRepository.save(shoe);
        // save the images

        List<ProductImage> imageEntities = new ArrayList<>();
        for (int i = 0; i < images.size(); i++) {
            MultipartFile file = images.get(i);
            String url = fileStorageService.saveFile(file);

            ProductImage img = new ProductImage();
            img.setProduct(shoe);
            img.setImageUrl(url);
            img.setPrimary(i == primaryImageIndex);

            imageEntities.add(img);
        }

        shoe.getImages().addAll(imageEntities);

        shoe = shoesRepository.save(shoe);
        return mapToResponse(shoe);
    }
    // update a shoe
    public ShoeResponse updateShoe(Long id, CreateShoeRequest request, List<MultipartFile> newImages) {
        Shoes shoe = shoesRepository.findById(id).orElseThrow(() -> new RuntimeException("Shoe not found"));

        // Add new images if provided
        if (newImages != null && !newImages.isEmpty()) {
            for (MultipartFile file : newImages) {
                String url = fileStorageService.saveFile(file);
                ProductImage img = new ProductImage();

                img.setImageUrl(url);
                img.setProduct(shoe);
                img.setPrimary(false);

                shoe.getImages().add(img);
            }
        }

        // Update category if provided
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            shoe.setCategory(category);
        }

        // add other fields if set
        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            shoe.setName(request.getName());
        }
        if (request.getDescription() != null && !request.getDescription().trim().isEmpty()) {
            shoe.setDescription(request.getDescription());
        }
        if (request.getPrice() != null && request.getPrice() > 0) {
            shoe.setPrice(request.getPrice());
        }
        if (request.getGender() != null) {
            shoe.setGender(GenderEnum.valueOf(request.getGender()));
        }
        if (request.getMaterial() != null) {
            shoe.setMaterial(ShoeMaterialEnum.valueOf(request.getMaterial()));
        }

        shoe = shoesRepository.save(shoe);
        return mapToResponse(shoe);
    }

    // delete a shoe
    public void deleteShoe(Long id) {
        Shoes shoe = shoesRepository.findById(id).orElseThrow(() -> new RuntimeException("Shoe not found"));
        // delete its images first
        shoe.getImages().forEach(img ->
                fileStorageService.deleteFile(img.getImageUrl())
        );
        shoesRepository.deleteById(id);
    }

    // mapper
    private ShoeResponse mapToResponse(Shoes shoe) {
        //
        ShoeResponse response = new ShoeResponse();
        response.setId(shoe.getId());
        response.setName(shoe.getName());
        response.setDescription(shoe.getDescription());
        response.setPrice(shoe.getPrice());
        response.setGender(shoe.getGender().name());
        response.setMaterial(shoe.getMaterial().name());
        response.setCategoryId(shoe.getCategory().getId());

        response.setImages(shoe.getImages().stream()
                .map(img -> {
                    ProductImageResponse imageResponse = new ProductImageResponse();
                    imageResponse.setId(img.getId());
                    imageResponse.setImageUrl(img.getImageUrl());
                    imageResponse.setPrimary(img.getPrimary());

                    return imageResponse;
                })
                .toList()
        );
        return response;
    }

    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11
    // ✅ ADD IMAGES
    public void addImages(Long productId, List<MultipartFile> files) {
        Shoes shoe = shoesRepository.findById(productId).orElseThrow();

        for (MultipartFile file : files) {
            String url = fileStorageService.saveFile(file);

            ProductImage img = new ProductImage();
            img.setProduct(shoe);
            img.setImageUrl(url);
            img.setPrimary(false);

            shoe.getImages().add(img);
        }

        shoesRepository.save(shoe);
    }

    // ✅ DELETE IMAGE
    public void deleteImage(Long imageId) {
        // productRepo.findAll().forEach(p ->
        //         p.getImages().removeIf(img -> img.getId().equals(imageId))
        // );
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));
        fileStorageService.deleteFile(image.getImageUrl()); // Delete from disk
        productImageRepository.delete(image); // Delete from DB
    }
}
