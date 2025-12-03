package com.github.jenkaby.chessaibattle.controller.payload;

import com.github.jenkaby.chessaibattle.persistence.entity.PlayerSettings;

import java.time.Instant;

public record LapResponse(
        String lapId,
        PlayerSettings whitePlayerSetting,
        PlayerSettings blackPlayerSetting,
        String status,
        String winner,
        Instant updatedAt
) {
}
