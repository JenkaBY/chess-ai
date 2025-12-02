package com.github.jenkaby.chessaibattle.chess;

import com.github.jenkaby.chessaibattle.model.Player;

/**
 * Represents a chess piece type
 */
public enum PieceType {
    PAWN('P', '♙', '♟'),
    KNIGHT('N', '♘', '♞'),
    BISHOP('B', '♗', '♝'),
    ROOK('R', '♖', '♜'),
    QUEEN('Q', '♕', '♛'),
    KING('K', '♔', '♚');

    private final char notation;
    private final char whiteSymbol;
    private final char blackSymbol;

    PieceType(char notation, char whiteSymbol, char blackSymbol) {
        this.notation = notation;
        this.whiteSymbol = whiteSymbol;
        this.blackSymbol = blackSymbol;
    }

    public char getNotation() {
        return notation;
    }

    public char getSymbol(Player player) {
        return player == Player.WHITE ? whiteSymbol : blackSymbol;
    }

    /**
     * Get piece type from algebraic notation character
     */
    public static PieceType fromNotation(char notation) {
        return switch (notation) {
            case 'K' -> KING;
            case 'Q' -> QUEEN;
            case 'R' -> ROOK;
            case 'B' -> BISHOP;
            case 'N' -> KNIGHT;
            case 'P' -> PAWN;
            default -> throw new IllegalArgumentException("Invalid piece notation: " + notation);
        };
    }
}

