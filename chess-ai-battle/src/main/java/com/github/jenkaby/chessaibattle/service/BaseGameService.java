package com.github.jenkaby.chessaibattle.service;

import com.github.jenkaby.chessaibattle.model.AiChessMovement;
import com.github.jenkaby.chessaibattle.model.GameStatus;
import com.github.jenkaby.chessaibattle.model.Player;
import com.github.jenkaby.chessaibattle.persistence.entity.Lap;
import com.github.jenkaby.chessaibattle.persistence.repository.LapRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RequiredArgsConstructor
@Service
public class BaseGameService implements GameService {

    @Qualifier("whitePlayerService")
    private final PlayerService whitePlayer;

    @Qualifier("blackPlayerService")
    private final PlayerService blackPlayer;
    private final LapRepository lapRepository;
    private final Map<String, Integer> moveCounters = new ConcurrentHashMap<>();

    @Override
    public Lap updateGame(SseEmitter emitter, String lapId, GameStatus status) throws IOException {

        var lap = updateGame(lapId, status);

        log.info("Cycle start for lapId: {} with status: {}", lapId, lap.status());

        while (lap.status() == GameStatus.START) {
//             TODO define first player move
            var currentTurn = moveCounters.compute(lapId, (key, value) -> value == null ? 1 : value + 1);
            log.info("Current move count for lapId {} : {}", lapId, currentTurn);
//            white player move
            var whiteMove = makeMove(lapId, whitePlayer, emitter, currentTurn);
            if (whiteMove.isMate()) {
                lap = lap.toBuilder()
                        .updatedAt(Instant.now())
                        .status(GameStatus.STOP)
                        .winner(Player.WHITE)
                        .build();
                lapRepository.save(lap);
                break;
            }
            if (whiteMove.isDraw()) {
                lap = lap.toBuilder()
                        .updatedAt(Instant.now())
                        .status(GameStatus.DRAW)
                        .build();
                lapRepository.save(lap);
                break;
            }

//            black player move
            var blackMove = makeMove(lapId, blackPlayer, emitter, currentTurn);
            if (blackMove.isMate()) {
                lap = lap.toBuilder()
                        .updatedAt(Instant.now())
                        .status(GameStatus.STOP)
                        .winner(Player.BLACK)
                        .build();
                lapRepository.save(lap);
                break;
            }
            if (blackMove.isDraw()) {
                lap = lap.toBuilder()
                        .updatedAt(Instant.now())
                        .status(GameStatus.DRAW)
                        .build();
                lapRepository.save(lap);
                break;
            }
            lap = lapRepository.findDistinctByLapId(lapId).get();
        }
        emitter.complete();
        return lap;
    }

    @Override
    public Lap updateGame(String lapId, GameStatus status) {
        var now = Instant.now();
        var lap = lapRepository.findDistinctByLapId(lapId)
                .orElse(Lap.builder()
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
                    .data(Map.of(
                            "turn", id,
                            "lapId", lapId,
                            "movement", movement.notation(),
                            "player", player.getPlayer(),
                            "reason", movement.reason()))
                    .name("move");
            emitter.send(event);
            log.debug("Sent SSE event for lapId {}: player={}, movement={}", lapId, player.getPlayer(), movement.notation());
        } catch (IOException e) {
            log.error("Failed to send SSE event for lapId {}: {}", lapId, e.getMessage());
            throw e;
        }
        return movement;
    }
}
