package com.github.jenkaby.chessaibattle.service;


import com.github.jenkaby.chessaibattle.model.ChessMovementEvent;
import com.github.jenkaby.chessaibattle.persistence.entity.Movement;
import com.github.jenkaby.chessaibattle.persistence.repository.MovementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class ReplayChessGameService {

    private final MovementRepository movementRepository;

    public void emitMovementsForLap(SseEmitter emitter, String lapId, int delayMs) throws IOException, InterruptedException {
        List<Movement> movements = movementRepository.findAllByLapIdOrderByMovedAt(lapId);
        for (int i = 0; i < movements.size(); i++) {
            int turn = i + 1;
            sendEvent(emitter, turn, movements.get(i), delayMs);
        }
        emitter.complete();
    }

    private void sendEvent(SseEmitter emitter, int id, Movement movement, int delayMs) throws IOException, InterruptedException {
        SseEmitter.SseEventBuilder event = SseEmitter.event()
                .id(String.valueOf(id))
                .data(ChessMovementEvent.builder()
                        .turn(id)
                        .lapId(movement.lapId())
                        .movement(movement.notation())
                        .player(movement.player())
                        .reason(movement.reason())
                        .build())
                .name("move");
        emitter.send(event);
        log.debug("Sent SSE event {} for lapId {}: player={}, movement={}", id, movement.lapId(), movement.player(), movement.notation());
        Thread.sleep(delayMs);
    }
}
