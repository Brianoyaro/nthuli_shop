package org.nthuli_shop.nthuli_shop.product.controller;

import jakarta.validation.Valid;
import org.nthuli_shop.nthuli_shop.product.dto.ProductRequestDto;
import org.nthuli_shop.nthuli_shop.product.dto.ProductResponseDto;
import org.nthuli_shop.nthuli_shop.product.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger logger = LoggerFactory.getLogger(ProductController.class);
    private final ObjectMapper objectMapper;
    private final ProductService productService;

    public ProductController(ObjectMapper objectMapper, ProductService productService) {
        this.objectMapper = objectMapper;
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        // get all products grouped by type
        logger.info("GET /api/products - Fetching all products grouped by type");
        try {
            Map<String, List<ProductResponseDto>> groupedProducts = productService.getAllProductsGroupedByType();
            logger.info("Successfully retrieved grouped products - Categories: {}", groupedProducts.keySet());
            return ResponseEntity.ok(groupedProducts);
        } catch (Exception e) {
            logger.error("Error fetching grouped products", e);
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Internal Server Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProduct(@PathVariable Long id) {
        //get a product
        logger.info("GET /api/products/{} - Fetching product", id);
        try {
            ProductResponseDto product = productService.getProduct(id);
            logger.info("Successfully retrieved product with ID: {}", id);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            logger.warn("Product not found with ID: {}", id);
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            logger.error("Error fetching product with ID: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createProduct(
            @RequestPart("product") String productJson,
            @Valid @RequestPart("images") List<MultipartFile > images,
            @Valid @RequestParam(defaultValue = "0") Integer primaryIndex
    ) {
        // create with images
        logger.info("POST /api/products/create - Received request with {} images", images.size());
        try {
            ProductRequestDto request = objectMapper.readValue(productJson, ProductRequestDto.class);
            logger.debug("Product request parsed - Name: {}, Type: {}", request.getName(), request.getType());
            ProductResponseDto response = productService.createProduct(request, images, primaryIndex);
            logger.info("Product created successfully - ID: {}, Name: {}", response.getId(), response.getName());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.warn("Product creation validation failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (RuntimeException e) {
            logger.error("Product creation failed", e);
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error creating product", e);
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @Valid  @RequestPart("product") ProductRequestDto productJson,
            @Valid @RequestPart("images") List<MultipartFile> images
    ) {
        // update a product
        logger.info("PUT /api/products/{} - Update request with {} images", id, images.size());
        try {
            logger.debug("Updating product ID: {}", id);
            ProductResponseDto response = productService.updateProduct(id, productJson, images);
            logger.info("Product updated successfully - ID: {}", id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn("Product update failed for ID: {}", id);
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error updating product ID: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        // delete a product
        logger.info("DELETE /api/products/{} - Delete request", id);
        try {
             logger.debug("Deleting product ID: {}", id);
             productService.deleteProduct(id);
             Map<String, String> response = new HashMap<>();
             response.put("Message", "Product deleted successfully.");
             logger.info("Product deleted successfully - ID: {}", id);
             return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn("Product deletion failed for ID: {}", id);
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error deleting product ID: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

}