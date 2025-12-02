package com.github.jenkaby.chessaibattle.chess.exception;

import com.github.jenkaby.chessaibattle.chess.Position;

public class MissingPieceAtPositionException extends ChessRuleException {
    private final Position position;

    public MissingPieceAtPositionException(Position position) {
        super("No piece at " + position);
        this.position = position;
    }
}
