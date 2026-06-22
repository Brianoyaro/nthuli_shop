package org.nthuli_shop.nthuli_shop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NthuliShopApplication {

    public static void main(String[] args) {
        SpringApplication.run(NthuliShopApplication.class, args);
    }

}
