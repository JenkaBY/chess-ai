package com.github.jenkaby.chessaibattle.chess.movement;

import com.github.jenkaby.chessaibattle.chess.*;

/**
 * Represents a castling move (O-O or O-O-O)
 * Handles the special case of moving both king and rook
 */
public class CastlingMove extends AbstractChessMovement {

    private final boolean kingSide;

    public CastlingMove(String algebraicNotation, Position kingFrom, Position kingTo,
                        Color color, boolean isCheck, boolean isCheckmate) {
        super(algebraicNotation, kingFrom, kingTo, PieceType.KING, color, false, isCheck, isCheckmate);
        this.kingSide = kingTo.getCol() > kingFrom.getCol();
    }

    @Override
    public boolean isCastling() {
        return true;
    }

    @Override
    public void applyTo(Board board) {
        // Move king
        Piece king = board.getPiece(from);
        if (king == null || king.getType() != PieceType.KING) {
            throw new IllegalStateException("No king at position " + from + " for castling");
        }

        board.removePiece(from);
        king.setHasMoved(true);
        board.setPiece(to, king);

        // Move rook
        int row = from.getRow();
        Position rookFrom = new Position(row, kingSide ? 7 : 0);
        Position rookTo = new Position(row, kingSide ? 5 : 3);

        Piece rook = board.getPiece(rookFrom);
        if (rook == null || rook.getType() != PieceType.ROOK) {
            throw new IllegalStateException("No rook at position " + rookFrom + " for castling");
        }

        board.removePiece(rookFrom);
        rook.setHasMoved(true);
        board.setPiece(rookTo, rook);
    }

    public boolean isKingSide() {
        return kingSide;
    }
}

