package com.github.jenkaby.chessaibattle.service;

import com.github.jenkaby.chessaibattle.model.GameStatus;
import com.github.jenkaby.chessaibattle.persistence.entity.Lap;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

public interface GameService {

    Lap updateGame(SseEmitter emitter, String lapId, GameStatus status) throws IOException;

    Lap updateGame(String lapId, GameStatus status);
}
