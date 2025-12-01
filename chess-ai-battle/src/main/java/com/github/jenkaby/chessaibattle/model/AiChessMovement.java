package com.github.jenkaby.chessaibattle.model;

import lombok.Builder;

@Builder
public record AiChessMovement(String notation, String reason) {

    public boolean isMate() {
        return notation.endsWith("#");
    }

    public boolean isDraw() {
        return "1/2-1/2".equals(notation);
    }

    public boolean isGameEnd() {
        return isMate() || isDraw();
    }
}
