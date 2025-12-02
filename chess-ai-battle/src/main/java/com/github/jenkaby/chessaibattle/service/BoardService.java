package com.github.jenkaby.chessaibattle.service;

import com.github.jenkaby.chessaibattle.model.*;
import com.github.jenkaby.chessaibattle.persistence.entity.Movement;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for reconstructing chess board state from algebraic notation movements
 * Follows SOLID principles with clear separation of concerns
 * Accepts persistence entity Movement from MongoDB
 */
@Slf4j
@Service
public class BoardService {

    public Board getCurrentBoard(List<Movement> movements) {
        Board board = new Board();

        for (int i = 0; i < movements.size(); i++) {
            Movement movement = movements.get(i);
            String notation = movement.notation();
            Player player = movement.player();

            try {
                ParsedMovement parsedMovement = parseMovement(notation, board, player);
                applyMovement(board, parsedMovement);
                board.switchTurn();

                log.debug("Applied move {}: {} ({}) - {}", i + 1, notation, player, movement.reason());
            } catch (Exception e) {
                log.error("Failed to apply move {}: {} for player {} - {}",
                        i + 1, notation, player, movement.reason(), e);
                throw new IllegalArgumentException(
                        String.format("Invalid move at position %d: %s (player: %s, reason: %s)",
                                i + 1, notation, player, movement.reason()), e);
            }
        }

        return board;
    }

    /**
     * Get the current board state from string algebraic notations
     *
     * @param notations List of algebraic notation strings
     * @return The resulting board state
     */
    public Board getCurrentBoardFromNotations(List<String> notations) {
        Board board = new Board();

        for (int i = 0; i < notations.size(); i++) {
            String notation = notations.get(i);
            Player currentPlayer = board.getCurrentTurn();

            try {
                ParsedMovement movement = parseMovement(notation, board, currentPlayer);
                applyMovement(board, movement);
                board.switchTurn();

                log.debug("Applied move {}: {} ({})", i + 1, notation, currentPlayer);
            } catch (Exception e) {
                log.error("Failed to apply move {}: {} for player {}", i + 1, notation, currentPlayer, e);
                throw new IllegalArgumentException("Invalid move at position " + (i + 1) + ": " + notation, e);
            }
        }

        return board;
    }

    /**
     * Parse algebraic notation into a ParsedMovement object
     */
    public ParsedMovement parseMovement(String notation, Board board, Player player) {
        notation = notation.trim();

        // Remove check/checkmate indicators for parsing
        boolean isCheck = notation.endsWith("+");
        boolean isCheckmate = notation.endsWith("#");
        notation = notation.replaceAll("[+#]", "");

        // Handle castling
        if ("O-O".equals(notation) || "0-0".equals(notation)) {
            return parseCastling(board, player, true, isCheck, isCheckmate);
        }
        if ("O-O-O".equals(notation) || "0-0-0".equals(notation)) {
            return parseCastling(board, player, false, isCheck, isCheckmate);
        }

        // Parse regular moves
        return parseRegularMove(notation, board, player, isCheck, isCheckmate);
    }

    /**
     * Parse castling moves
     */
    private ParsedMovement parseCastling(Board board, Player player, boolean kingSide,
                                         boolean isCheck, boolean isCheckmate) {
        int row = player == Player.WHITE ? 7 : 0;
        Position kingFrom = new Position(row, 4);
        Position kingTo = new Position(row, kingSide ? 6 : 2);

        String notation = kingSide ? "O-O" : "O-O-O";

        return new ParsedMovement(notation, kingFrom, kingTo, PieceType.KING, player,
                false, true, null, isCheck, isCheckmate);
    }

    /**
     * Parse regular (non-castling) moves
     */
    private ParsedMovement parseRegularMove(String notation, Board board, Player player,
                                            boolean isCheck, boolean isCheckmate) {
        boolean isCapture = notation.contains("x");
        notation = notation.replace("x", "");

        // Check for promotion
        PieceType promotionType = null;
        if (notation.contains("=")) {
            String[] parts = notation.split("=");
            notation = parts[0];
            promotionType = PieceType.fromNotation(parts[1].charAt(0));
        }

        // Determine piece type
        PieceType pieceType = PieceType.PAWN;
        int startIdx = 0;

        if (Character.isUpperCase(notation.charAt(0))) {
            pieceType = PieceType.fromNotation(notation.charAt(0));
            startIdx = 1;
        }

        // Extract destination (last 2 characters)
        String destSquare = notation.substring(notation.length() - 2);
        Position to = Position.fromAlgebraic(destSquare);

        // Extract disambiguation (between piece type and destination)
        String disambiguation = notation.substring(startIdx, notation.length() - 2);

        // Find the piece that can make this move
        Position from = findSourcePosition(board, pieceType, player, to, disambiguation);

        return new ParsedMovement(notation, from, to, pieceType, player, isCapture,
                false, promotionType, isCheck, isCheckmate);
    }

    /**
     * Find which piece of the given type can move to the destination
     */
    private Position findSourcePosition(Board board, PieceType pieceType, Player player,
                                        Position to, String disambiguation) {
        List<Position> candidates = new ArrayList<>();

        // Search for all pieces of the given type and color
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                Position pos = new Position(row, col);
                Piece piece = board.getPiece(pos);

                if (piece != null && piece.getType() == pieceType && piece.getOwner() == player) {
                    if (canPieceMoveTo(board, piece, pos, to)) {
                        // Check disambiguation
                        if (matchesDisambiguation(pos, disambiguation)) {
                            candidates.add(pos);
                        }
                    }
                }
            }
        }

        if (candidates.isEmpty()) {
            throw new IllegalArgumentException("No " + pieceType + " can move to " + to);
        }

        if (candidates.size() > 1) {
            throw new IllegalArgumentException("Ambiguous move: multiple " + pieceType +
                    " pieces can move to " + to + ". Candidates: " + candidates);
        }

        return candidates.get(0);
    }

    /**
     * Check if position matches disambiguation string
     */
    private boolean matchesDisambiguation(Position pos, String disambiguation) {
        if (disambiguation.isEmpty()) {
            return true;
        }

        String posAlgebraic = pos.toAlgebraic();

        // Check file disambiguation
        if (disambiguation.length() == 1 && Character.isLetter(disambiguation.charAt(0))) {
            return posAlgebraic.charAt(0) == disambiguation.charAt(0);
        }

        // Check rank disambiguation
        if (disambiguation.length() == 1 && Character.isDigit(disambiguation.charAt(0))) {
            return posAlgebraic.charAt(1) == disambiguation.charAt(0);
        }

        // Full square disambiguation
        return posAlgebraic.equals(disambiguation);
    }

    /**
     * Check if a piece can theoretically move to a position (basic move validation)
     */
    private boolean canPieceMoveTo(Board board, Piece piece, Position from, Position to) {
        int rowDiff = to.getRow() - from.getRow();
        int colDiff = to.getCol() - from.getCol();
        int absRowDiff = Math.abs(rowDiff);
        int absColDiff = Math.abs(colDiff);

        return switch (piece.getType()) {
            case PAWN -> canPawnMove(board, piece, from, to, rowDiff, colDiff);
            case KNIGHT -> (absRowDiff == 2 && absColDiff == 1) || (absRowDiff == 1 && absColDiff == 2);
            case BISHOP -> absRowDiff == absColDiff && absRowDiff > 0 && isPathClear(board, from, to);
            case ROOK -> (rowDiff == 0 || colDiff == 0) && isPathClear(board, from, to);
            case QUEEN -> ((absRowDiff == absColDiff) || (rowDiff == 0 || colDiff == 0)) &&
                    isPathClear(board, from, to);
            case KING -> absRowDiff <= 1 && absColDiff <= 1;
        };
    }

    /**
     * Validate pawn movement
     */
    private boolean canPawnMove(Board board, Piece piece, Position from, Position to,
                                int rowDiff, int colDiff) {
        int direction = piece.getOwner() == Player.WHITE ? -1 : 1;
        Piece targetPiece = board.getPiece(to);

        // Forward move
        if (colDiff == 0) {
            if (targetPiece != null) return false;
            if (rowDiff == direction) return true;
            // Double move from starting position
            if (rowDiff == 2 * direction && !piece.isHasMoved()) {
                Position intermediate = new Position(from.getRow() + direction, from.getCol());
                return board.getPiece(intermediate) == null;
            }
        }

        // Diagonal capture
        if (Math.abs(colDiff) == 1 && rowDiff == direction) {
            return targetPiece != null && targetPiece.getOwner() != piece.getOwner();
        }

        return false;
    }

    /**
     * Check if path between two positions is clear (for sliding pieces)
     */
    private boolean isPathClear(Board board, Position from, Position to) {
        int rowStep = Integer.compare(to.getRow() - from.getRow(), 0);
        int colStep = Integer.compare(to.getCol() - from.getCol(), 0);

        int currentRow = from.getRow() + rowStep;
        int currentCol = from.getCol() + colStep;

        while (currentRow != to.getRow() || currentCol != to.getCol()) {
            if (board.getPiece(new Position(currentRow, currentCol)) != null) {
                return false;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }

        return true;
    }

    /**
     * Apply a movement to the board
     */
    private void applyMovement(Board board, ParsedMovement movement) {
        if (movement.isCastling()) {
            applyCastling(board, movement);
        } else {
            applyRegularMove(board, movement);
        }
    }

    /**
     * Apply castling move
     */
    private void applyCastling(Board board, ParsedMovement movement) {
        // Move king
        Piece king = board.getPiece(movement.getFrom());
        board.removePiece(movement.getFrom());
        king.setHasMoved(true);
        board.setPiece(movement.getTo(), king);

        // Move rook
        int row = movement.getFrom().getRow();
        boolean kingSide = movement.getTo().getCol() > movement.getFrom().getCol();

        Position rookFrom = new Position(row, kingSide ? 7 : 0);
        Position rookTo = new Position(row, kingSide ? 5 : 3);

        Piece rook = board.getPiece(rookFrom);
        board.removePiece(rookFrom);
        rook.setHasMoved(true);
        board.setPiece(rookTo, rook);
    }

    /**
     * Apply regular (non-castling) move
     */
    private void applyRegularMove(Board board, ParsedMovement movement) {
        Piece piece = board.getPiece(movement.getFrom());

        if (piece == null) {
            throw new IllegalStateException("No piece at position " + movement.getFrom());
        }

        // Handle promotion
        if (movement.getPromotionType() != null) {
            piece = new Piece(movement.getPromotionType(), piece.getOwner(), true);
        } else {
            piece.setHasMoved(true);
        }

        // Remove piece from source
        board.removePiece(movement.getFrom());

        // Place piece at destination (captures handled automatically)
        board.setPiece(movement.getTo(), piece);
    }
}

