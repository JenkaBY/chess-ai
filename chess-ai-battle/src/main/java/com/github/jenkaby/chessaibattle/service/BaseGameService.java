package com.github.jenkaby.chessaibattle.service;

import com.github.jenkaby.chessaibattle.model.AiChessMovement;
import com.github.jenkaby.chessaibattle.model.ChessMovementEvent;
import com.github.jenkaby.chessaibattle.model.GameStatus;
import com.github.jenkaby.chessaibattle.model.Player;
import com.github.jenkaby.chessaibattle.persistence.entity.Lap;
import com.github.jenkaby.chessaibattle.persistence.entity.Movement;
import com.github.jenkaby.chessaibattle.persistence.entity.PlayerSettings;
import com.github.jenkaby.chessaibattle.persistence.repository.LapRepository;
import com.github.jenkaby.chessaibattle.persistence.repository.MovementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@Service
public class BaseGameService implements GameService {

    @Value("${app.max-turns}")
    private final Integer maxTurnsNumber;
    @Qualifier("whitePlayerService")
    private final PlayerService whitePlayer;

    @Qualifier("blackPlayerService")
    private final PlayerService blackPlayer;
    private final LapRepository lapRepository;
    private final MovementRepository movementRepository;
    @Value("${app.white-player.model}")
    private final String whitePlayerModel;
    @Value("${app.black-player.model}")
    private final String blackPlayerModel;
    private final PromptTemplate promptTemplate;

    @Override
    public Lap updateGame(SseEmitter emitter, String lapId, GameStatus status) throws IOException {

        var lap = updateGame(lapId, status);

        log.info("Loop started for lapId: {} with status: {}", lapId, lap.status());

        while (lap.status() == GameStatus.START) {
            List<Movement> allMovements = movementRepository.findAllByLapIdOrderByMovedAt(lap.lapId());
            var currentTurn = allMovements.size() + 1;
            if (currentTurn > maxTurnsNumber) {
                emitter.send(
                        SseEmitter.event()
                                .id(String.valueOf(currentTurn))
                                .name("end_game")
                                .data("Game is over. The number of turns has reached the maximum limit of " + maxTurnsNumber + ". The game is a draw."));
                makeDraw(lap);
                break;
            }
            var currentPlayerColor = getCurrentPlayer(allMovements);
            log.info("{} player is making {} turn for lapId {}", currentPlayerColor, currentTurn, lapId);
            var playerToMove = currentPlayerColor == Player.WHITE ? whitePlayer : blackPlayer;
            var move = makeMove(lapId, playerToMove, emitter, currentTurn);

            if (move.isMate()) {
                lap = lap.toBuilder()
                        .updatedAt(Instant.now())
                        .status(GameStatus.STOP)
                        .winner(currentPlayerColor)
                        .build();
                lapRepository.save(lap);
                break;
            }
            if (move.isDraw()) {
                lap = makeDraw(lap);
                break;
            }
            lap = lapRepository.findDistinctByLapId(lapId).get();
        }
        emitter.complete();
        return lap;
    }

    private @NonNull Lap makeDraw(Lap lap) {
        lap = lap.toBuilder()
                .updatedAt(Instant.now())
                .status(GameStatus.DRAW)
                .build();
        lapRepository.save(lap);
        return lap;
    }

    private static @NonNull Player getCurrentPlayer(List<Movement> allMovements) {
        if (CollectionUtils.isEmpty(allMovements)) {
            return Player.WHITE;
        }
        return Optional.ofNullable(allMovements.getLast())
                .map(Movement::player)
                .map(player -> player == Player.WHITE ? Player.BLACK : Player.WHITE)
                .orElse(Player.WHITE);
    }

    @Override
    public Lap updateGame(String lapId, GameStatus status) {
        var now = Instant.now();
        var lap = lapRepository.findDistinctByLapId(lapId)
                .orElse(Lap.builder()
                        .blackPlayerSettings(new PlayerSettings(blackPlayerModel, promptTemplate.getTemplate()))
                        .whitePlayerSettings(new PlayerSettings(whitePlayerModel, promptTemplate.getTemplate()))
                        .lapId(lapId)
                        .status(GameStatus.START)
                        .startedAt(now)
                        .updatedAt(now)
                        .build()
                );

        if (status == GameStatus.STOP || status == GameStatus.PAUSE) {
            lap = lap.toBuilder()
                    .status(status)
                    .updatedAt(now)
                    .build();
        }
        return lapRepository.save(lap);
    }

    private AiChessMovement makeMove(String lapId, PlayerService player, SseEmitter emitter, Integer id) throws IOException {
        var movement = player.move(lapId);
        try {
            SseEmitter.SseEventBuilder event = SseEmitter.event()
                    .id(String.valueOf(id))
                    .data(ChessMovementEvent.builder()
                            .turn(id)
                            .lapId(lapId)
                            .movement(movement.notation())
                            .player(player.getPlayer())
                            .reason(movement.reason())
                            .build())
                    .name("move");
            emitter.send(event);
            log.debug("Sent SSE for lapId {}: player={}, movement={}", lapId, player.getPlayer(), movement.notation());
        } catch (IOException e) {
            log.error("Failed to send SSE for lapId {}: {}", lapId, e.getMessage());
            throw e;
        }
        return movement;
    }
}
