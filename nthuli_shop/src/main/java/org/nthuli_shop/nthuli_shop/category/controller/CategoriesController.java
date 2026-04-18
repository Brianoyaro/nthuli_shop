package org.nthuli_shop.nthuli_shop.category.controller;

import jakarta.validation.Valid;
import org.nthuli_shop.nthuli_shop.category.dto.CategoryResponseDto;
import org.nthuli_shop.nthuli_shop.category.dto.CreateCategoryRequestDto;
import org.nthuli_shop.nthuli_shop.category.service.CategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/category")
public class CategoriesController {
    private static final Logger logger = LoggerFactory.getLogger(CategoriesController.class);
    private final CategoryService categoryService;

    public CategoriesController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // create a category
    @PostMapping("/create")
    public ResponseEntity<?> createCategory(@Valid  @RequestBody CreateCategoryRequestDto request) {
        logger.info("POST /api/category/create - Create category request: {}", request.getName());
        try {
            CategoryResponseDto response = categoryService.createCategory(request);
            logger.info("Category created successfully - ID: {}, Name: {}", response.getId(), response.getName());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // similar category exists in the database
            logger.warn("Category creation failed: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }catch (Exception e) {
            // internal server error
            logger.error("Unexpected error creating category", e);
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Failed to create category: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // get a category
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategory(@PathVariable Long id) {
        logger.info("GET /api/category/{} - Fetch category", id);
        try {
            CategoryResponseDto category = categoryService.getCategory(id);
            logger.info("Category found with ID: {}, Name: {}", id, category.getName());
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            // category does not exist in the database
            logger.warn("Category not found with ID: {}", id);
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }catch (Exception e) {
            // internal server error
            logger.error("Unexpected error fetching category with ID: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Failed to fetch category: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // get categories
    @GetMapping
    public ResponseEntity<List<CategoryResponseDto>> getAllCategories() {
        logger.info("GET /api/category - Fetch all categories");
        List<CategoryResponseDto> categories =  categoryService.getAllCategories();
        logger.info("Retrieved {} categories", categories.size());
        return ResponseEntity.ok(categories);
    }

    // update a category
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @Valid @RequestBody CreateCategoryRequestDto request) {
        logger.info("PUT /api/category/{} - Update category to: {}", id, request.getName());
        try {
            CategoryResponseDto response = categoryService.updateCategory(id, request);
            logger.info("Category updated successfully - ID: {}, New Name: {}", id, response.getName());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // category to update does not exist in the database
            logger.warn("Category update failed for ID: {}", id);
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }catch (Exception e) {
            // internal server error
            logger.error("Unexpected error updating category with ID: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Failed to update category: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    // delete a category
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        logger.info("DELETE /api/category/{} - Delete category", id);
        try {
            categoryService.deleteCategory(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Category deleted successfully");
            logger.info("Category deleted successfully - ID: {}", id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            logger.warn("Category deletion failed for ID: {}", id);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            logger.error("Unexpected error deleting category with ID: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete category: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}