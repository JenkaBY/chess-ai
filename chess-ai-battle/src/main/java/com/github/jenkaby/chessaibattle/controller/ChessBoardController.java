package com.github.jenkaby.chessaibattle.controller;


import com.github.jenkaby.chessaibattle.persistence.entity.Movement;
import com.github.jenkaby.chessaibattle.persistence.repository.MovementRepository;
import com.github.jenkaby.chessaibattle.service.BoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/v1/chessboards")
@RestController
public class ChessBoardController {

    private static final Integer UNLIMITED_MOVES = -1;

    private final BoardService boardService;
    private final MovementRepository movementRepository;

    @GetMapping(value = "/laps/{lapId}/text", produces = MediaType.TEXT_PLAIN_VALUE)
    public String getChessBoardText(@PathVariable("lapId") String lapId,
                                    @RequestParam(value = "count", required = false) Integer count) {
        log.info("ChessBoardController.getChessBoardText lapId: {}", lapId);
        List<Movement> allMoves = movementRepository.findAllByLapIdOrderByMovedAt(lapId);
        log.info("Found {} movements for lapId: {}", allMoves.size(), lapId);

        // If count is provided and not -1 (unlimited), limit the moves
        List<Movement> movements = (count != null && !count.equals(UNLIMITED_MOVES))
                ? allMoves.stream().limit(count).toList()
                : allMoves;

        var board = boardService.getCurrentBoard(movements);
        return board.toSimpleString();
    }
}
