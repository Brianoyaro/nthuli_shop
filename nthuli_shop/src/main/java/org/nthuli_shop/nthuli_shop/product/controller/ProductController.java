package org.nthuli_shop.nthuli_shop.product.controller;

import jakarta.validation.Valid;
import org.nthuli_shop.nthuli_shop.product.dto.ProductRequestDto;
import org.nthuli_shop.nthuli_shop.product.dto.ProductResponseDto;
import org.nthuli_shop.nthuli_shop.product.service.ProductService;
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

    private final ObjectMapper objectMapper;
    private final ProductService productService;

    public ProductController(ObjectMapper objectMapper, ProductService productService) {
        this.objectMapper = objectMapper;
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<?> getAllProducts() {
        // get all products
        try {
            List<ProductResponseDto> products = productService.getAllProducts();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Internal Server Error" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProduct(@PathVariable Long id) {
        //get a product
        try {
            ProductResponseDto product = productService.getProduct(id);
            return ResponseEntity.ok(product);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Internal server error" + e.getMessage());
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
        try {
            ProductRequestDto request = objectMapper.readValue(productJson, ProductRequestDto.class);
            ProductResponseDto repsonse = productService.createProduct(request, images, primaryIndex);
            return ResponseEntity.ok(repsonse);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Internal server error" + e.getMessage());
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
        try {
            ProductResponseDto response = productService.updateProduct(id, productJson, images);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Internal server error" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        // delete a product
        try {
             productService.deleteProduct(id);
             Map<String, String> response = new HashMap<>();
             response.put("Message", "Product deleted successfully.");
             return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Internal server error" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

}