package com.github.jenkaby.chessaibattle.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Slf4j
@Configuration
public class ConcurrencyConfig {

    @Bean
    public ExecutorService executorService() {
        log.info("Creating ExecutorService bean with fixed thread pool of size 2");
        ExecutorService executorService = Executors.newFixedThreadPool(2);
        return executorService;
    }
}
