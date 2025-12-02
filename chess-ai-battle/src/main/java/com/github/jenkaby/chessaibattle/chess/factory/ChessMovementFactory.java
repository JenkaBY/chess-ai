package com.github.jenkaby.chessaibattle.chess.factory;

import com.github.jenkaby.chessaibattle.chess.Color;
import com.github.jenkaby.chessaibattle.chess.PieceType;
import com.github.jenkaby.chessaibattle.chess.Position;
import com.github.jenkaby.chessaibattle.chess.movement.*;

/**
 * Factory for creating chess movement implementations
 * Follows Factory Pattern and Single Responsibility Principle
 */
public class ChessMovementFactory {

    /**
     * Create a regular move (non-special)
     */
    public static ChessMovement createRegularMove(String algebraicNotation, Position from, Position to,
                                                  PieceType pieceType, Color color, boolean isCapture,
                                                  boolean isCheck, boolean isCheckmate) {
        return new RegularMove(algebraicNotation, from, to, pieceType, color, isCapture, isCheck, isCheckmate);
    }

    /**
     * Create a castling move
     */
    public static ChessMovement createCastlingMove(String algebraicNotation, Position kingFrom, Position kingTo,
                                                   Color color, boolean isCheck, boolean isCheckmate) {
        return new CastlingMove(algebraicNotation, kingFrom, kingTo, color, isCheck, isCheckmate);
    }

    /**
     * Create a pawn promotion move
     */
    public static ChessMovement createPawnPromotionMove(String algebraicNotation, Position from, Position to,
                                                        Color color, PieceType promotionType, boolean isCapture,
                                                        boolean isCheck, boolean isCheckmate) {
        return new PawnPromotionMove(algebraicNotation, from, to, color, promotionType, isCapture, isCheck, isCheckmate);
    }

    /**
     * Create an en passant move
     */
    public static ChessMovement createEnPassantMove(String algebraicNotation, Position from, Position to,
                                                    Color color, Position capturedPawnPosition,
                                                    boolean isCheck, boolean isCheckmate) {
        return new EnPassantMove(algebraicNotation, from, to, color, capturedPawnPosition, isCheck, isCheckmate);
    }

    /**
     * Create the appropriate movement based on the parameters
     * This is a convenience method that determines the type automatically
     */
    public static ChessMovement createMovement(String algebraicNotation, Position from, Position to,
                                               PieceType pieceType, Color color, boolean isCapture,
                                               boolean isCastling, PieceType promotionType,
                                               boolean isCheck, boolean isCheckmate) {
        // Castling
        if (isCastling) {
            return createCastlingMove(algebraicNotation, from, to, color, isCheck, isCheckmate);
        }

        // Pawn promotion
        if (promotionType != null) {
            return createPawnPromotionMove(algebraicNotation, from, to, color, promotionType, isCapture, isCheck, isCheckmate);
        }

        // Regular move (including en passant which needs special detection)
        return createRegularMove(algebraicNotation, from, to, pieceType, color, isCapture, isCheck, isCheckmate);
    }
}

