package com.github.jenkaby.chessaibattle.config.advisor;

import com.github.jenkaby.chessaibattle.chess.Board;
import com.github.jenkaby.chessaibattle.chess.BoardService;
import com.github.jenkaby.chessaibattle.model.Player;
import com.github.jenkaby.chessaibattle.persistence.entity.Movement;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class ChessRuleValidator {
    private final BoardService boardService;

    public ValidationResponse validate(Board theCurrentBoard, Player player, String nextMoveNotation) {
        try {
            boardService.getCurrentBoard(theCurrentBoard, List.of(Movement.builder()
                    .notation(nextMoveNotation)
                    .player(player)
                    .build()));
            return ValidationResponse.asValid(nextMoveNotation);
        } catch (IllegalArgumentException e) {
            return ValidationResponse.asInvalid(e.getMessage(), nextMoveNotation);
        }
    }

    record ValidationResponse(boolean isValid, String errorMessage, String notation) {
        public static ChessRuleValidator.ValidationResponse asValid(String notation) {
            return new ChessRuleValidator.ValidationResponse(true, null, notation);
        }

        public static ChessRuleValidator.ValidationResponse asInvalid(String message, String notation) {
            return new ChessRuleValidator.ValidationResponse(false, message, notation);
        }

        public static ChessRuleValidator.ValidationResponse asInvalid(String message) {
            return new ChessRuleValidator.ValidationResponse(false, message, null);
        }
    }
}