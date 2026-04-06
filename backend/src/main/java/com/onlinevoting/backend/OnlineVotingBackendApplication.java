package com.onlinevoting.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class OnlineVotingBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnlineVotingBackendApplication.class, args);
    }
}
