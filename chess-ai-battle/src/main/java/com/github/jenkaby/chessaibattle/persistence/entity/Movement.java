package com.github.jenkaby.chessaibattle.persistence.entity;

import com.github.jenkaby.chessaibattle.model.Player;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Builder
@Document(collection = "movements")
public record Movement(
        @Id
        String id,
        String lapId,
        Player player,
        String notation,
        String reason,
        Instant movedAt
) {
}
