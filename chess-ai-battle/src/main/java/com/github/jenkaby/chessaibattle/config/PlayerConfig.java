package com.github.jenkaby.chessaibattle.config;

import com.github.jenkaby.chessaibattle.chess.BoardService;
import com.github.jenkaby.chessaibattle.model.Player;
import com.github.jenkaby.chessaibattle.persistence.repository.MovementRepository;
import com.github.jenkaby.chessaibattle.service.AiPlayerService;
import com.github.jenkaby.chessaibattle.service.PlayerService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PlayerConfig {

    @Bean
    public BoardService boardService() {
        return new BoardService();
    }

    @Bean
    public PlayerService whitePlayerService(ChatClient whitePlayerClient, MovementRepository movementRepository) {
        return new AiPlayerService(whitePlayerClient, Player.WHITE, movementRepository, boardService());
    }

    @Bean
    public PlayerService blackPlayerService(ChatClient blackPlayerClient, MovementRepository movementRepository) {
        return new AiPlayerService(blackPlayerClient, Player.BLACK, movementRepository, boardService());
    }
}
