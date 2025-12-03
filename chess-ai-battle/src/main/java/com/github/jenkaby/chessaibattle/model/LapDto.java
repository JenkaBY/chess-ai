package com.github.jenkaby.chessaibattle.model;

import com.github.jenkaby.chessaibattle.persistence.entity.PlayerSettings;
import lombok.Builder;

import java.time.Instant;

@Builder
public record LapDto(
        String lapId,
        PlayerSettings whitePlayerSetting,
        PlayerSettings blackPlayerSetting,
        String status,
        String winner,
        Instant updatedAt) {
}
