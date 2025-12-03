package com.github.jenkaby.chessaibattle.model;

import lombok.Builder;

@Builder
public record ChessMovementEvent(
        int turn,
        String lapId,
        String movement,
        Player player,
        String reason
) {
}
