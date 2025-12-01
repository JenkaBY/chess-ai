package com.github.jenkaby.chessaibattle.service;

import com.github.jenkaby.chessaibattle.model.AiChessMovement;
import com.github.jenkaby.chessaibattle.model.Player;

public interface PlayerService {

    AiChessMovement move(String lapId);

    Player getPlayer();
}
