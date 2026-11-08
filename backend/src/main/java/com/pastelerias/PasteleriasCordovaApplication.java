package com.pastelerias;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.pastelerias")
public class PasteleriasCordovaApplication {
    public static void main(String[] args) {
        SpringApplication.run(PasteleriasCordovaApplication.class, args);
    }
}
