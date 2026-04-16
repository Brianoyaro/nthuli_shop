package org.nthuli_shop.nthuli_shop.service;

import org.nthuli_shop.nthuli_shop.entity.Product;
import org.nthuli_shop.nthuli_shop.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    //
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // getProducts
    public void getProducts() {
        //
        List<Product> products = productRepository.findAll();
    }
}
