package org.nthuli_shop.nthuli_shop.controller;

import org.nthuli_shop.nthuli_shop.dto.CategoryResponse;
import org.nthuli_shop.nthuli_shop.dto.CreateCategoryRequest;
import org.nthuli_shop.nthuli_shop.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/category")
public class CategoriesController {
    private final CategoryService categoryService;

    public CategoriesController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // create a category
    @PostMapping("/create")
    public ResponseEntity<?> createCategory(@RequestBody CreateCategoryRequest request) {
        //
        try {
            CategoryResponse response = categoryService.createCategory(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // similar category exists in the database
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }catch (Exception e) {
            // internal server error
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Failed to create category" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // get a category
    @GetMapping("/{id")
    public ResponseEntity<?> getCategory(@RequestParam Long id) {
        try {
            CategoryResponse category = categoryService.getCategory(id);
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            // category does not exist in the database
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }catch (Exception e) {
            // internal server error
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Failed to create category" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // get categories
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        List<CategoryResponse> categories =  categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    // update a category
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@RequestParam Long id, CreateCategoryRequest request) {
        try {
            CategoryResponse response = categoryService.updateCategory(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // category to update does not exist in the database
            Map<String, String> error = new HashMap<>();
            error.put("Message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }catch (Exception e) {
            // internal server error
            Map<String, String> error = new HashMap<>();
            error.put("Message", "Failed to create category" + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    // delete a category
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Category deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete category: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}