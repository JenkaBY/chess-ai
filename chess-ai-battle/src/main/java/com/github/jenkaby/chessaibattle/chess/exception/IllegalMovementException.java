package com.github.jenkaby.chessaibattle.chess.exception;

import com.github.jenkaby.chessaibattle.chess.PieceType;
import com.github.jenkaby.chessaibattle.chess.Position;

public class IllegalMovementException extends ChessRuleException {
    public IllegalMovementException(PieceType pieceType, Position to) {
        super("No " + pieceType + " can move to " + to);
    }
}
