package com.acessolivre;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AcessolivreApplication {

	public static void main(String[] args) {
		SpringApplication.run(AcessolivreApplication.class, args);
	}

}
