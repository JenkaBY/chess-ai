package com.github.jenkaby.chessaibattle.persistence.entity;

import com.github.jenkaby.chessaibattle.model.GameStatus;
import com.github.jenkaby.chessaibattle.model.Player;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Builder(toBuilder = true)
@Document(collection = "laps")
public record Lap(
        @Id
        String id,
        String lapId,

        @Field
        GameStatus status,

        @Field
        Player winner,

        @Field
        Instant startedAt,

        @Field
        Instant updatedAt
) {
}
