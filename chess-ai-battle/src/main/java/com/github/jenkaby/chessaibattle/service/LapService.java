package com.github.jenkaby.chessaibattle.service;

import com.github.jenkaby.chessaibattle.model.LapDto;
import com.github.jenkaby.chessaibattle.model.Player;
import com.github.jenkaby.chessaibattle.persistence.repository.LapRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Slf4j
@Service
public class LapService {

    private final LapRepository lapRepository;

    public List<LapDto> getPage(Integer page, Integer size) {
        return lapRepository.findAll(PageRequest.of(page, size, Sort.by("updatedAt").descending()))
                .get()
                .map(e -> LapDto.builder()
                        .lapId(e.lapId())
                        .blackPlayerSetting(e.blackPlayerSettings())
                        .whitePlayerSetting(e.whitePlayerSettings())
                        .status(e.status().name())
                        .winner(Optional.ofNullable(e.winner()).map(Player::name).orElse(null))
                        .updatedAt(e.updatedAt())
                        .build()
                )
                .toList();
    }
}
