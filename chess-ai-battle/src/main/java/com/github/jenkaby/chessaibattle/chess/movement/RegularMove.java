package com.github.jenkaby.chessaibattle.chess.movement;

import com.github.jenkaby.chessaibattle.chess.*;
import com.github.jenkaby.chessaibattle.chess.exception.MissingPieceAtPositionException;

/**
 * Represents a regular (non-special) chess move
 * Handles normal piece movements and captures
 */
public class RegularMove extends AbstractChessMovement {

    public RegularMove(String algebraicNotation, Position from, Position to,
                       PieceType pieceType, Color color, boolean isCapture,
                       boolean isCheck, boolean isCheckmate) {
        super(algebraicNotation, from, to, pieceType, color, isCapture, isCheck, isCheckmate);
    }

    @Override
    public void applyTo(Board board) throws MissingPieceAtPositionException {
        Piece piece = board.getPiece(from);

        if (piece == null) {
            throw new MissingPieceAtPositionException(from);
        }

        // Mark piece as moved
        piece.setHasMoved(true);

        // Remove piece from source
        board.removePiece(from);

        // Place piece at destination (captures handled automatically by overwriting)
        board.setPiece(to, piece);
    }
}

