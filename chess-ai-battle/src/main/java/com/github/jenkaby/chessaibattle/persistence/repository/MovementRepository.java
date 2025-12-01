package com.github.jenkaby.chessaibattle.persistence.repository;

import com.github.jenkaby.chessaibattle.persistence.entity.Movement;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;


public interface MovementRepository extends MongoRepository<Movement, String> {

    List<Movement> findAllByLapIdOrderByMovedAt(String lapId);

}
