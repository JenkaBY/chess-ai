package com.github.jenkaby.chessaibattle.chess.movement;

import com.github.jenkaby.chessaibattle.chess.*;
import com.github.jenkaby.chessaibattle.model.Player;
import lombok.Getter;

/**
 * Represents a pawn promotion move
 * Handles promoting a pawn to another piece type (Queen, Rook, Bishop, Knight)
 */
@Getter
public class PawnPromotionMove extends AbstractChessMovement {

    private final PieceType promotionType;

    public PawnPromotionMove(String algebraicNotation, Position from, Position to,
                             Color color, PieceType promotionType, boolean isCapture,
                             boolean isCheck, boolean isCheckmate) {
        super(algebraicNotation, from, to, PieceType.PAWN, color, isCapture, isCheck, isCheckmate);

        if (promotionType == null || promotionType == PieceType.PAWN || promotionType == PieceType.KING) {
            throw new IllegalArgumentException("Invalid promotion type: " + promotionType);
        }

        this.promotionType = promotionType;
    }

    @Override
    public void applyTo(Board board) {
        Piece pawn = board.getPiece(from);

        if (pawn == null || pawn.getType() != PieceType.PAWN) {
            throw new IllegalStateException("No pawn at position " + from + " for promotion");
        }

        // Remove pawn from source
        board.removePiece(from);

        // Create promoted piece - convert Color to Player
        Player player = color == Color.WHITE ? Player.WHITE : Player.BLACK;
        Piece promotedPiece = new Piece(promotionType, player, true);

        // Place promoted piece at destination
        board.setPiece(to, promotedPiece);
    }
}

