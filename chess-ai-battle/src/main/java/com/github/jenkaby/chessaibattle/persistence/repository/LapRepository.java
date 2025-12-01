package com.github.jenkaby.chessaibattle.persistence.repository;

import com.github.jenkaby.chessaibattle.persistence.entity.Lap;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface LapRepository extends MongoRepository<Lap, String> {

    Optional<Lap> findDistinctByLapId(String lapId);
}
