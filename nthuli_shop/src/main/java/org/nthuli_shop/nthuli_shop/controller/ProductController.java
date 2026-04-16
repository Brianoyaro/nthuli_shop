package org.nthuli_shop.nthuli_shop.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    // creating a product
    @GetMapping
    public static void getProducts() {
        //
    }

    // updating a product
    // getting all products
    // getting a specific product
    // deleting a product
}
