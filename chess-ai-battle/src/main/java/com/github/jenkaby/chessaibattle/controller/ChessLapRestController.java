package com.github.jenkaby.chessaibattle.controller;

import com.github.jenkaby.chessaibattle.controller.payload.GameStatusRequest;
import com.github.jenkaby.chessaibattle.model.GameStatus;
import com.github.jenkaby.chessaibattle.model.LapDto;
import com.github.jenkaby.chessaibattle.persistence.entity.Lap;
import com.github.jenkaby.chessaibattle.service.GameService;
import com.github.jenkaby.chessaibattle.service.LapService;
import com.github.jenkaby.chessaibattle.service.ReplayChessGameService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ExecutorService;

@CrossOrigin("http://localhost:4200")
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/v1/chess-laps")
@RestController
public class ChessLapRestController {

    private final GameService gameService;
    private final ExecutorService executorService;
    private final ReplayChessGameService replayChessGameService;
    private final LapService lapService;

    @PutMapping(path = "/{lapId}",
            consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> createChessLap(@RequestBody GameStatusRequest request, @PathVariable("lapId") String lapId) {
        log.info("Update chess lap {} with status {}", lapId, request.status());
        Lap lap = gameService.updateGame(lapId, request.status());
        return ResponseEntity.ok(lap);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<LapDto>> getLaps(Pageable pageable) {
        log.info("Get chess laps request");
        List<LapDto> page = lapService.getPage(pageable.getPageNumber(), pageable.getPageSize());
        return ResponseEntity.ok(page);
    }

    @GetMapping(path = "/{lapId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChessUpdates(@PathVariable("lapId") String lapId) {
        log.info("Requesting SSE for lap {}", lapId);

        var emitter = new SseEmitter(0L); // No timeout

        setupEmitter(lapId, emitter);

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

    @GetMapping(path = "/{lapId}/replay", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter replayGame(@PathVariable("lapId") String lapId, @RequestParam int speedMs) {
        log.info("Requesting replay for lap {}, speed {}", lapId, speedMs);

        var emitter = new SseEmitter(0L); // No timeout

        setupEmitter(lapId, emitter);

        executorService.submit(() -> {
            try {
                replayChessGameService.emitMovementsForLap(emitter, lapId, speedMs);
            } catch (IOException e) {
                log.error("Error during replaying the lap {}: {}", lapId, e.getMessage(), e);
                emitter.completeWithError(e);
            } catch (Exception e) {
                log.error("Unexpected error during game execution for lapId {}: {}", lapId, e.getMessage(), e);
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    private static void setupEmitter(String lapId, SseEmitter emitter) {
        emitter.onCompletion(() -> log.info("SSE completed for lapId: {}", lapId));
        emitter.onTimeout(() -> log.warn("SSE timeout for lapId: {}", lapId));
        emitter.onError((ex) -> log.error("SSE error for lapId {}: {}", lapId, ex.getMessage()));
    }
}
