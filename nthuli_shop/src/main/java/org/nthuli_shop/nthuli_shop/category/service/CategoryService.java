package org.nthuli_shop.nthuli_shop.category.service;

import org.nthuli_shop.nthuli_shop.category.dto.CategoryResponseDto;
import org.nthuli_shop.nthuli_shop.category.dto.CreateCategoryRequestDto;
import org.nthuli_shop.nthuli_shop.category.entity.Category;
import org.nthuli_shop.nthuli_shop.category.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // get all categories
    public List<CategoryResponseDto> getAllCategories() {
        logger.info("Fetching all categories");
        List<Category> categories = categoryRepository.findAll();
        logger.info("Retrieved {} categories from database", categories.size());
        return categories
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // get a category
    public CategoryResponseDto getCategory(Long id) {
        logger.info("Fetching category with ID: {}", id);
        Category category = categoryRepository.findById(id).orElseThrow(() -> {
            logger.error("Category not found with ID: {}", id);
            return new RuntimeException("Category not found");
        });
        logger.info("Category found with ID: {}, Name: {}", id, category.getName());
        return mapToResponse(category);
    }

    // Create category
    public CategoryResponseDto createCategory(CreateCategoryRequestDto request) {
        logger.info("Creating new category: {}", request.getName());
        // check if a similar category already exists in the database
        String categoryName = request.getName();
        Optional<Category> existingCategory = categoryRepository.findByName(categoryName);
        if (existingCategory.isPresent()) {
            logger.warn("Category creation failed - category with name '{}' already exists", categoryName);
            throw new RuntimeException("Category exists!");
        }

        Category category = new Category();
        category.setName(request.getName());
        categoryRepository.save(category);
        logger.info("Category created successfully with ID: {}, Name: {}", category.getId(), category.getName());
        return mapToResponse(category);
    }

    // update category
    public CategoryResponseDto updateCategory(Long id, CreateCategoryRequestDto request) {
        logger.info("Updating category with ID: {}", id);
        Category category = categoryRepository.findById(id).orElseThrow(() -> {
            logger.error("Category not found for update with ID: {}", id);
            return new RuntimeException("Category not found");
        });
        logger.debug("Category found, updating name from '{}' to '{}'", category.getName(), request.getName());
        category.setName(request.getName());
        categoryRepository.save(category);
        logger.info("Category updated successfully with ID: {}, New name: {}", id, request.getName());
        return mapToResponse(category);
    }

    // delete category
    public void deleteCategory(Long id) {
        logger.info("Attempting to delete category with ID: {}", id);
        categoryRepository.deleteById(id);
        logger.info("Category deleted successfully with ID: {}", id);
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