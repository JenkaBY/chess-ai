package com.github.jenkaby.chessaibattle.config.advisor;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.jenkaby.chessaibattle.chess.Board;
import com.github.jenkaby.chessaibattle.chess.BoardService;
import com.github.jenkaby.chessaibattle.model.AiChessMovement;
import com.github.jenkaby.chessaibattle.model.Player;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClientRequest;
import org.springframework.ai.chat.client.ChatClientResponse;
import org.springframework.ai.chat.client.advisor.api.*;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.util.json.JsonParser;
import org.springframework.util.Assert;
import reactor.core.publisher.Flux;

import java.util.Map;

public final class ChessRulesAdvisor implements CallAdvisor, StreamAdvisor {

    private static final Logger logger = LoggerFactory.getLogger(ChessRulesAdvisor.class);
    public static final String BOARD_KEY = "board";
    public static final String NEXT_MOVE_PLAYER_KEY = "nextMovePlayer";

    private final int advisorOrder;

    private final int maxRepeatAttempts;
    private final ObjectMapper objectMapper;
    private final ChessRuleValidator chessRuleValidator;

    private ChessRulesAdvisor(int advisorOrder, BoardService boardService, int maxRepeatAttempts,
                              ObjectMapper objectMapper) {
        Assert.notNull(advisorOrder, "advisorOrder must not be null");
        Assert.isTrue(advisorOrder > BaseAdvisor.HIGHEST_PRECEDENCE && advisorOrder < BaseAdvisor.LOWEST_PRECEDENCE,
                "advisorOrder must be between HIGHEST_PRECEDENCE and LOWEST_PRECEDENCE");
        Assert.isTrue(maxRepeatAttempts >= 0, "repeatAttempts must be greater than or equal to 0");
        Assert.notNull(objectMapper, "objectMapper must not be null");

        this.advisorOrder = advisorOrder;

        this.maxRepeatAttempts = maxRepeatAttempts;

        this.objectMapper = objectMapper;
        this.chessRuleValidator = new ChessRuleValidator(boardService);
    }

    @SuppressWarnings("null")
    @Override
    public String getName() {
        return "Chess Rules Validation Advisor";
    }

    @Override
    public int getOrder() {
        return this.advisorOrder;
    }

    @SuppressWarnings("null")
    @Override
    public ChatClientResponse adviseCall(ChatClientRequest chatClientRequest, CallAdvisorChain callAdvisorChain) {
        Assert.notNull(callAdvisorChain, "callAdvisorChain must not be null");
        Assert.notNull(chatClientRequest, "chatClientRequest must not be null");
        ChatClientResponse chatClientResponse = null;

        var repeatCounter = 0;

        boolean isValidationSuccess = true;

        var processedChatClientRequest = chatClientRequest;

        do {
            // Before Call
            repeatCounter++;

            // Next Call
            chatClientResponse = callAdvisorChain.copy(this).nextCall(processedChatClientRequest);

            // After Call

            // We should not validate tool call requests, only the content of the final
            // response.
            if (chatClientResponse.chatResponse() == null || !chatClientResponse.chatResponse().hasToolCalls()) {

                var validationResponse = this.validateNextMovement(chatClientResponse);

                isValidationSuccess = validationResponse.isValid();

                if (!isValidationSuccess) {

                    logger.warn("The next movement is invalid: " + validationResponse);

                    String validationErrorMessage = "Generated movement of algebraic notation " + validationResponse.notation()
                            + " is invalid: " + validationResponse.errorMessage();

                    Prompt augmentedPrompt = chatClientRequest.prompt()
                            .augmentUserMessage(userMessage -> userMessage.mutate()
                                    .text(userMessage.getText() + System.lineSeparator() + validationErrorMessage)
                                    .build());

                    processedChatClientRequest = chatClientRequest.mutate().prompt(augmentedPrompt).build();
                }
            }
        }
        while (!isValidationSuccess && repeatCounter <= this.maxRepeatAttempts);

        return chatClientResponse;
    }

    private ChessRuleValidator.ValidationResponse validateNextMovement(ChatClientResponse chatClientResponse) {
        if (chatClientResponse == null || chatClientResponse.chatResponse() == null) {
            return ChessRuleValidator.ValidationResponse.asInvalid("The chat client response is null");
        }
        // assumption that response has been already validated as JSON and AiChessMovement object
        String json = chatClientResponse.chatResponse().getResult().getOutput().getText();
        try {
            var nextAiMovement = this.objectMapper.readValue(json, AiChessMovement.class);
            logger.debug("Validating next movement: " + nextAiMovement.notation());
            var validationResponse = this.chessRuleValidator.validate(
                    getCurrentBoard(chatClientResponse.context()),
                    getNextMovePlayer(chatClientResponse.context()),
                    nextAiMovement.notation());

            logger.debug("next movement validation response: " + validationResponse);

            return validationResponse;
        } catch (JsonProcessingException e) {
            return ChessRuleValidator.ValidationResponse.asInvalid("The response is not valid JSON", json);
        }
    }

    @SuppressWarnings("null")
    @Override
    public Flux<ChatClientResponse> adviseStream(ChatClientRequest chatClientRequest,
                                                 StreamAdvisorChain streamAdvisorChain) {

        return Flux.error(new UnsupportedOperationException(
                "The " + getName() + " does not support streaming."));
    }

    public static ChessRulesAdvisor.Builder builder() {
        return new ChessRulesAdvisor.Builder();
    }

    public Board getCurrentBoard(Map<String, Object> context) {
//        TODO validate existence of board in context
        return (Board) context.get(BOARD_KEY);
    }

    public Player getNextMovePlayer(Map<String, Object> context) {
//        TODO validate existence of board in context
        return (Player) context.get(NEXT_MOVE_PLAYER_KEY);
    }

    public final static class Builder {

        private int advisorOrder = BaseAdvisor.LOWEST_PRECEDENCE - 3000;

        private int maxRepeatAttempts = 3;

        private ObjectMapper objectMapper = JsonParser.getObjectMapper();
        private BoardService boardService = new BoardService();

        private Builder() {
        }

        public ChessRulesAdvisor.Builder objectMapper(ObjectMapper objectMapper) {
            this.objectMapper = objectMapper;
            return this;
        }

        public ChessRulesAdvisor.Builder advisorOrder(int advisorOrder) {
            this.advisorOrder = advisorOrder;
            return this;
        }

        public ChessRulesAdvisor.Builder maxRepeatAttempts(int repeatAttempts) {
            this.maxRepeatAttempts = repeatAttempts;
            return this;
        }

        public ChessRulesAdvisor.Builder boardService(BoardService boardService) {
            this.boardService = boardService;
            return this;
        }

        public ChessRulesAdvisor build() {

            return new ChessRulesAdvisor(this.advisorOrder, this.boardService, this.maxRepeatAttempts,
                    this.objectMapper);
        }

    }

}
