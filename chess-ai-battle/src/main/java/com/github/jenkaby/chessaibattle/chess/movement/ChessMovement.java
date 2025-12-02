package com.github.jenkaby.chessaibattle.chess.movement;

import com.github.jenkaby.chessaibattle.chess.Board;
import com.github.jenkaby.chessaibattle.chess.Color;
import com.github.jenkaby.chessaibattle.chess.PieceType;
import com.github.jenkaby.chessaibattle.chess.Position;
import com.github.jenkaby.chessaibattle.chess.exception.MissingPieceAtPositionException;

/**
 * Interface representing a chess movement
 */
public interface ChessMovement {

    /**
     * Get the algebraic notation of the move (e.g., "e4", "Nf3", "O-O")
     */
    String getAlgebraicNotation();

    /**
     * Get the source position of the piece
     */
    Position getFrom();

    /**
     * Get the destination position of the piece
     */
    Position getTo();

    /**
     * Get the type of piece being moved
     */
    PieceType getPieceType();

    /**
     * Get the color of the piece
     */
    Color getColor();

    /**
     * Check if this is a capture move
     */
    boolean isCapture();

    /**
     * Check if this is a castling move
     */
    boolean isCastling();

    /**
     * Get the promotion piece type (null if not a promotion)
     */
    PieceType getPromotionType();

    /**
     * Check if this move results in check
     */
    default boolean isCheck() {
        return getRawAlgebraicNotation().endsWith("+");
    }

    /**
     * Check if this move results in checkmate
     */
    default boolean isCheckmate() {
        return getRawAlgebraicNotation().endsWith("#");
    }

    String getRawAlgebraicNotation();

    /**
     * Apply this movement to the board
     *
     * @param board The board to apply the movement to
     */
    void applyTo(Board board) throws MissingPieceAtPositionException;
}

