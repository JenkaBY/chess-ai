package com.github.jenkaby.chessaibattle.config;

import com.github.jenkaby.chessaibattle.model.AiChessMovement;
import com.github.jenkaby.chessaibattle.model.Player;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.client.advisor.StructuredOutputValidationAdvisor;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class AiConfig {

    private static final SimpleLoggerAdvisor SIMPLE_LOGGER_ADVISOR = new SimpleLoggerAdvisor();

    @Value("${app.white-player.model}")
    private String whitePlayerModel;
    @Value("${app.black-player.model}")
    private String blackPlayerModel;

    @Bean
    public ChatClient whitePlayerClient(ChatClient.Builder builder) {
        return createPlayerClient(builder, Player.WHITE, whitePlayerModel);
    }

    @Bean
    public ChatClient blackPlayerClient(ChatClient.Builder builder) {
        return createPlayerClient(builder, Player.BLACK, blackPlayerModel);
    }


    @Bean
    PromptTemplate promptTemplate() {
        return PromptTemplate.builder()
                .template("""
                        You are chess gross-master playing as {{color}} in a chess game. Your goal is win the game by making the best possible moves.
                        Make your move in standard algebraic notation based on the movements already made provided in the user prompts.
                        Respond with only object which schema is provided, no additional text.
                        """)
                .build();
    }

    private ChatClient createPlayerClient(ChatClient.Builder builder, Player player, String model) {
        var structuredValidatorAdvisor = StructuredOutputValidationAdvisor.builder()
                .outputType(AiChessMovement.class)
                .maxRepeatAttempts(2)
                .build();

        return builder
                .defaultSystem(promptTemplate().render(Map.of("color", player)))
                .defaultOptions(ChatOptions.builder()
                        .temperature(1.0)
                        .model(model)
                        .build()
                )
                .defaultAdvisors(SIMPLE_LOGGER_ADVISOR, structuredValidatorAdvisor)
                .build();
    }
}
