package com.github.jenkaby.chessaibattle;

import com.github.jenkaby.chessaibattle.config.AppFeaturesProperties;
import com.github.jenkaby.chessaibattle.config.CorsProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({CorsProperties.class, AppFeaturesProperties.class})
public class ChessAiBattleApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChessAiBattleApplication.class, args);
    }

}
