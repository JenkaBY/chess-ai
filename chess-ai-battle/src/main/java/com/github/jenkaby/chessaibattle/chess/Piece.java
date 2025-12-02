package com.github.jenkaby.chessaibattle.chess;

import com.github.jenkaby.chessaibattle.model.Player;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Represents a chess piece on the board
 */
@Data
@AllArgsConstructor
public class Piece {
    private PieceType type;
    private Player owner;
    private boolean hasMoved;

    public Piece(PieceType type, Player owner) {
        this.type = type;
        this.owner = owner;
        this.hasMoved = false;
    }

    public Piece copy() {
        return new Piece(type, owner, hasMoved);
    }

    public char getSymbol() {
        return type.getSymbol(owner);
    }

    @Override
    public String toString() {
        return String.valueOf(getSymbol());
    }
}

