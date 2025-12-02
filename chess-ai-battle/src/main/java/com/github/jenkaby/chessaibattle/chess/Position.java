package com.github.jenkaby.chessaibattle.chess;

import lombok.Data;

/**
 * Represents a position on the chess board (0-7 for both row and column)
 */
@Data
public class Position {
    private final int row;
    private final int col;

    public Position(int row, int col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) {
            throw new IllegalArgumentException("Invalid position: row=" + row + ", col=" + col);
        }
        this.row = row;
        this.col = col;
    }

    /**
     * Create position from algebraic notation (e.g., "e4", "a1")
     */
    public static Position fromAlgebraic(String algebraic) {
        if (algebraic == null || algebraic.length() != 2) {
            throw new IllegalArgumentException("Invalid algebraic notation: " + algebraic);
        }

        char file = algebraic.charAt(0);
        char rank = algebraic.charAt(1);

        if (file < 'a' || file > 'h' || rank < '1' || rank > '8') {
            throw new IllegalArgumentException("Invalid algebraic notation: " + algebraic);
        }

        int col = file - 'a';
        int row = 8 - (rank - '0');

        return new Position(row, col);
    }

    /**
     * Convert position to algebraic notation (e.g., "e4", "a1")
     */
    public String toAlgebraic() {
        char file = (char) ('a' + col);
        char rank = (char) ('8' - row);
        return "" + file + rank;
    }

    @Override
    public String toString() {
        return toAlgebraic();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Position position)) return false;
        return row == position.row && col == position.col;
    }

    @Override
    public int hashCode() {
        return 31 * row + col;
    }
}

