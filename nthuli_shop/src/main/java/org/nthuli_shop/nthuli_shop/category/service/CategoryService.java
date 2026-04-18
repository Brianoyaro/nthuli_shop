package org.nthuli_shop.nthuli_shop.category.service;

import org.nthuli_shop.nthuli_shop.category.dto.CategoryResponseDto;
import org.nthuli_shop.nthuli_shop.category.dto.CreateCategoryRequestDto;
import org.nthuli_shop.nthuli_shop.category.entity.Category;
import org.nthuli_shop.nthuli_shop.category.repository.CategoryRepository;
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
    public List<CategoryResponseDto> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return categories
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // get a category
    public CategoryResponseDto getCategory(Long id) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        return mapToResponse(category);
    }

    // Create category
    public CategoryResponseDto createCategory(CreateCategoryRequestDto request) {
        // check if a similar category already exists in the database
        String categoryName = request.getName();
        Optional<Category> existingCategory = categoryRepository.findByName(categoryName);
        if (existingCategory.isPresent()) {
            throw new RuntimeException("Category exists!");
        }

        Category category = new Category();
        category.setName(request.getName());
        categoryRepository.save(category);
        return mapToResponse(category);
    }

    // update category
    public CategoryResponseDto updateCategory(Long id, CreateCategoryRequestDto request) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(request.getName());
        categoryRepository.save(category);
        return mapToResponse(category);
    }

    // delete category
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    // mapper
    private CategoryResponseDto mapToResponse(Category category) {
        //
        CategoryResponseDto response = new CategoryResponseDto();
        response.setId(category.getId());
        response.setName(category.getName());

        return response;
    }
}