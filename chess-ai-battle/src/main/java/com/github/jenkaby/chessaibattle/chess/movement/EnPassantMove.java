package com.github.jenkaby.chessaibattle.chess.movement;

import com.github.jenkaby.chessaibattle.chess.*;

/**
 * Represents an en passant capture move
 * Handles the special pawn capture where the captured pawn is not on the destination square
 */
public class EnPassantMove extends AbstractChessMovement {

    private final Position capturedPawnPosition;

    public EnPassantMove(String algebraicNotation, Position from, Position to,
                         Color color, Position capturedPawnPosition,
                         boolean isCheck, boolean isCheckmate) {
        super(algebraicNotation, from, to, PieceType.PAWN, color, true, isCheck, isCheckmate);
        this.capturedPawnPosition = capturedPawnPosition;
    }

    @Override
    public void applyTo(Board board) {
        Piece pawn = board.getPiece(from);

        if (pawn == null || pawn.getType() != PieceType.PAWN) {
            throw new IllegalStateException("No pawn at position " + from + " for en passant");
        }

        // Remove moving pawn from source
        board.removePiece(from);

        // Remove captured pawn (not at destination!)
        board.removePiece(capturedPawnPosition);

        // Place pawn at destination
        pawn.setHasMoved(true);
        board.setPiece(to, pawn);
    }

    public Position getCapturedPawnPosition() {
        return capturedPawnPosition;
    }
}

