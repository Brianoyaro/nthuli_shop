package org.nthuli_shop.nthuli_shop.controller;

import org.nthuli_shop.nthuli_shop.dto.ProductRequestDto;
import org.nthuli_shop.nthuli_shop.dto.ProductResponseDto;
import org.nthuli_shop.nthuli_shop.service.ProductService;
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
    public ResponseEntity<?> getProduct(@RequestParam Long id) {
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
            @RequestPart("images") List<MultipartFile > images,
            @RequestParam(defaultValue = "0") Integer primaryIndex
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

    @PutMapping("/{id}")
    public void updateProduct() {
        // update a product
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@RequestParam Long id) {
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