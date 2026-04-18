package org.nthuli_shop.nthuli_shop.service;

import org.nthuli_shop.nthuli_shop.entity.Category;
import org.nthuli_shop.nthuli_shop.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // get all categories
    public List<org.nthuli_shop.nthuli_shop.dto_old.CategoryResponseDto> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // get a category
    public org.nthuli_shop.nthuli_shop.dto_old.CategoryResponseDto getCategory(Long id) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        return mapToResponse(category);
    }

    // Create category
    public org.nthuli_shop.nthuli_shop.dto_old.CategoryResponseDto createCategory(org.nthuli_shop.nthuli_shop.dto_old.CreateCategoryRequestDto request) {
        // check if a similar category already exists in the database
        String categoryName = request.getName();
        Optional<Category> existingCategory = categoryRepository.findByName(categoryName);
        if (existingCategory.isPresent()) {
            throw new RuntimeException("Category exists!");
        }

        Category category = new Category(request.getName());
        return mapToResponse(category);
    }

    // update category
    public org.nthuli_shop.nthuli_shop.dto_old.CategoryResponseDto updateCategory(Long id, org.nthuli_shop.nthuli_shop.dto_old.CreateCategoryRequestDto request) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(request.getName());
        return mapToResponse(category);
    }

    // delete category
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    // mapper
    private org.nthuli_shop.nthuli_shop.dto_old.CategoryResponseDto mapToResponse(Category category) {
        //
        org.nthuli_shop.nthuli_shop.dto_old.CategoryResponseDto response = new org.nthuli_shop.nthuli_shop.dto_old.CategoryResponseDto();
        response.setId(category.getId());
        response.setName(category.getName());

        return response;
    }
}