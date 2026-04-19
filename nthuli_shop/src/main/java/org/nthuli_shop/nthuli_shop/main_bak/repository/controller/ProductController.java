package org.nthuli_shop.nthuli_shop.main_bak.repository.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    @GetMapping
    public static void getAllProducts() {
        // get all products
    }

    @GetMapping("/{id}")
    public void getProduct(@RequestParam Long id) {
        //get a product
    }

    @PostMapping("/create")
    public void createProduct() {
        // create with images
    }

    @PutMapping("/{id}")
    public void updateProduct() {
        // update a product
    }

    @DeleteMapping("/{id}")
    public void deleteProduct() {
        // delete a product
    }

}