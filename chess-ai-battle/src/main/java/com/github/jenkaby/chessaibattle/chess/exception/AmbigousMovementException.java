package com.github.jenkaby.chessaibattle.chess.exception;

import com.github.jenkaby.chessaibattle.chess.PieceType;
import com.github.jenkaby.chessaibattle.chess.Position;

import java.util.List;

public class AmbigousMovementException extends ChessRuleException {

    public AmbigousMovementException(PieceType pieceType, Position to, List<Position> candidates) {
        super("Ambiguous move: multiple " + pieceType +
                " pieces can move to " + to + ". Candidates: " + candidates);
    }

    ;
}
