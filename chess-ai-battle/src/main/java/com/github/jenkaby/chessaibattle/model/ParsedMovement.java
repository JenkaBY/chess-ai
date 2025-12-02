package com.github.jenkaby.chessaibattle.model;

import lombok.Data;

/**
 * Represents a parsed chess move with source and destination positions
 * This is an internal model used during move parsing and validation
 */
@Data
public class ParsedMovement {
    private final String algebraicNotation;
    private final Position from;
    private final Position to;
    private final PieceType pieceType;
    private final Player player;
    private final boolean isCapture;
    private final boolean isCastling;
    private final PieceType promotionType;
    private final boolean isCheck;
    private final boolean isCheckmate;

    public ParsedMovement(String algebraicNotation, Position from, Position to, PieceType pieceType,
                          Player player, boolean isCapture, boolean isCastling, PieceType promotionType,
                          boolean isCheck, boolean isCheckmate) {
        this.algebraicNotation = algebraicNotation;
        this.from = from;
        this.to = to;
        this.pieceType = pieceType;
        this.player = player;
        this.isCapture = isCapture;
        this.isCastling = isCastling;
        this.promotionType = promotionType;
        this.isCheck = isCheck;
        this.isCheckmate = isCheckmate;
    }

    @Override
    public String toString() {
        return algebraicNotation;
    }
}

