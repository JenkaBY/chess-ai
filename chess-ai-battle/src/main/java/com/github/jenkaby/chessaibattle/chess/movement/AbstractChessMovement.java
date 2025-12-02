package com.github.jenkaby.chessaibattle.chess.movement;

import com.github.jenkaby.chessaibattle.chess.Color;
import com.github.jenkaby.chessaibattle.chess.PieceType;
import com.github.jenkaby.chessaibattle.chess.Position;
import lombok.Getter;

/**
 * Abstract base class for chess movements
 * Implements common behavior for all movement types
 */
@Getter
public abstract class AbstractChessMovement implements ChessMovement {

    protected final String rawAlgebraicNotation;
    protected final String algebraicNotation;
    protected final Position from;
    protected final Position to;
    protected final PieceType pieceType;
    protected final Color color;
    protected final boolean isCapture;
    protected final boolean isCheck;
    protected final boolean isCheckmate;

    protected AbstractChessMovement(String algebraicNotation, Position from, Position to,
                                    PieceType pieceType, Color color, boolean isCapture,
                                    boolean isCheck, boolean isCheckmate) {
        this.algebraicNotation = algebraicNotation.replaceAll("[+#]", "");
        this.rawAlgebraicNotation = algebraicNotation;
        this.from = from;
        this.to = to;
        this.pieceType = pieceType;
        this.color = color;
        this.isCapture = isCapture;
        this.isCheck = isCheck;
        this.isCheckmate = isCheckmate;
    }

    @Override
    public boolean isCastling() {
        return false;
    }

    @Override
    public PieceType getPromotionType() {
        return null;
    }

    @Override
    public String toString() {
        return algebraicNotation;
    }
}

