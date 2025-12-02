package com.github.jenkaby.chessaibattle.service;

import com.github.jenkaby.chessaibattle.chess.BoardService;
import com.github.jenkaby.chessaibattle.model.AiChessMovement;
import com.github.jenkaby.chessaibattle.model.Player;
import com.github.jenkaby.chessaibattle.persistence.entity.Movement;
import com.github.jenkaby.chessaibattle.persistence.repository.MovementRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;

import java.time.Instant;
import java.util.stream.Collectors;

import static com.github.jenkaby.chessaibattle.config.advisor.ChessRulesAdvisor.BOARD_KEY;
import static com.github.jenkaby.chessaibattle.config.advisor.ChessRulesAdvisor.NEXT_MOVE_PLAYER_KEY;

@Slf4j
@RequiredArgsConstructor
public class AiPlayerService implements PlayerService {

    private final ChatClient chatClient;
    @Getter
    private final Player player;
    private final MovementRepository movementRepository;
    private final BoardService boardService;

    @Override
    public AiChessMovement move(String lapId) {
        var allMovements = movementRepository.findAllByLapIdOrderByMovedAt(lapId);
        var movements = allMovements.stream()
                .map(Movement::notation)
                .collect(Collectors.joining(",", "[", "]"));

        log.debug("lap id {} player {}", lapId, player.name());

        var newTurn = chatClient.prompt().user(movements)
                .advisors(a ->
                        a.param("lapId", lapId)
                                .param(NEXT_MOVE_PLAYER_KEY, player)
                                .param(BOARD_KEY, boardService.getCurrentBoard(allMovements)))
                .call()
                .entity(AiChessMovement.class);
        log.info("lapId {} player {} made the movement: {}", lapId, player.name(), newTurn);

        var playerMovement = Movement.builder()
                .lapId(lapId)
                .player(player)
                .notation(newTurn.notation())
                .reason(newTurn.reason())
                .movedAt(Instant.now())
                .build();

        movementRepository.save(playerMovement);
        return newTurn;
    }
}
