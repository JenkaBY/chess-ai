package com.github.jenkaby.chessaibattle.controller;

import com.github.jenkaby.chessaibattle.controller.payload.GameStatusRequest;
import com.github.jenkaby.chessaibattle.model.GameStatus;
import com.github.jenkaby.chessaibattle.persistence.entity.Lap;
import com.github.jenkaby.chessaibattle.service.GameService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ExecutorService;

@CrossOrigin("http://localhost:4200")
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/v1/chess-laps")
@RestController
public class ChessLapRestController {

    private final GameService gameService;
    private final ExecutorService executorService;

    @PutMapping(path = "/{lapId}",
            consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> createChessLap(@RequestBody GameStatusRequest request, @PathVariable("lapId") String lapId) {
        log.info("Update chess lap {} with status {}", lapId, request.status());
        Lap lap = gameService.updateGame(lapId, request.status());
        return ResponseEntity.ok(lap);
    }

    @GetMapping(path = "/{lapId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChessUpdates(@PathVariable("lapId") String lapId) {
        log.info("Requesting SSE for lap {}", lapId);

        var emitter = new SseEmitter(0L); // No timeout

        // Set up callbacks for SSE lifecycle events
        emitter.onCompletion(() -> log.info("SSE completed for lapId: {}", lapId));
        emitter.onTimeout(() -> log.warn("SSE timeout for lapId: {}", lapId));
        emitter.onError((ex) -> log.error("SSE error for lapId {}: {}", lapId, ex.getMessage()));

        // Run the game loop in a separate thread to avoid blocking the HTTP response
        executorService.submit(() -> {
            try {
                gameService.updateGame(emitter, lapId, GameStatus.START);
            } catch (IOException e) {
                log.error("Error during game execution for lapId {}: {}", lapId, e.getMessage(), e);
                emitter.completeWithError(e);
            } catch (Exception e) {
                log.error("Unexpected error during game execution for lapId {}: {}", lapId, e.getMessage(), e);
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }
}
