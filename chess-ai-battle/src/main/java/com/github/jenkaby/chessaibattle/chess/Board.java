package com.github.jenkaby.chessaibattle.chess;

import com.github.jenkaby.chessaibattle.model.Player;

/**
 * Represents a chess board with pieces and provides visualization
 */
public class Board {
    private final Piece[][] squares;
    private Player currentTurn;

    public Board() {
        this.squares = new Piece[8][8];
        this.currentTurn = Player.WHITE;
        initializeBoard();
    }

    /**
     * Initialize the board with starting chess position
     */
    private void initializeBoard() {
        // Place pawns
        for (int col = 0; col < 8; col++) {
            squares[1][col] = new Piece(PieceType.PAWN, Player.BLACK);
            squares[6][col] = new Piece(PieceType.PAWN, Player.WHITE);
        }

        // Place rooks
        squares[0][0] = new Piece(PieceType.ROOK, Player.BLACK);
        squares[0][7] = new Piece(PieceType.ROOK, Player.BLACK);
        squares[7][0] = new Piece(PieceType.ROOK, Player.WHITE);
        squares[7][7] = new Piece(PieceType.ROOK, Player.WHITE);

        // Place knights
        squares[0][1] = new Piece(PieceType.KNIGHT, Player.BLACK);
        squares[0][6] = new Piece(PieceType.KNIGHT, Player.BLACK);
        squares[7][1] = new Piece(PieceType.KNIGHT, Player.WHITE);
        squares[7][6] = new Piece(PieceType.KNIGHT, Player.WHITE);

        // Place bishops
        squares[0][2] = new Piece(PieceType.BISHOP, Player.BLACK);
        squares[0][5] = new Piece(PieceType.BISHOP, Player.BLACK);
        squares[7][2] = new Piece(PieceType.BISHOP, Player.WHITE);
        squares[7][5] = new Piece(PieceType.BISHOP, Player.WHITE);

        // Place queens
        squares[0][3] = new Piece(PieceType.QUEEN, Player.BLACK);
        squares[7][3] = new Piece(PieceType.QUEEN, Player.WHITE);

        // Place kings
        squares[0][4] = new Piece(PieceType.KING, Player.BLACK);
        squares[7][4] = new Piece(PieceType.KING, Player.WHITE);
    }

    public Piece getPiece(Position position) {
        return squares[position.getRow()][position.getCol()];
    }

    public void setPiece(Position position, Piece piece) {
        squares[position.getRow()][position.getCol()] = piece;
    }

    public void removePiece(Position position) {
        squares[position.getRow()][position.getCol()] = null;
    }

    public Player getCurrentTurn() {
        return currentTurn;
    }

    public void switchTurn() {
        currentTurn = currentTurn == Player.WHITE ? Player.BLACK : Player.WHITE;
    }

    public void setCurrentTurn(Player player) {
        this.currentTurn = player;
    }

    /**
     * Create a deep copy of the board
     */
    public Board copy() {
        Board newBoard = new Board();
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                newBoard.squares[row][col] = this.squares[row][col] != null ?
                        this.squares[row][col].copy() : null;
            }
        }
        newBoard.currentTurn = this.currentTurn;
        return newBoard;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("\n");
        sb.append("  +---+---+---+---+---+---+---+---+\n");

        for (int row = 0; row < 8; row++) {
            sb.append(8 - row).append(" |");

            for (int col = 0; col < 8; col++) {
                Piece piece = squares[row][col];
                if (piece == null) {
                    boolean isDarkSquare = (row + col) % 2 == 1;
                    sb.append(isDarkSquare ? " . " : "   ");
                } else {
                    sb.append(" ").append(piece.getSymbol());
                }
                sb.append("|");
            }

            sb.append(" ").append(8 - row);

            if (row < 7) {
                sb.append("\n  +---+---+---+---+---+---+---+---+\n");
            }
        }

        sb.append("\n  +---+---+---+---+---+---+---+---+\n");
        sb.append("    a   b   c   d   e   f   g   h\n");
        sb.append("\n  Turn: ").append(currentTurn).append("\n");

        return sb.toString();
    }

    /**
     * Get a simple text representation of the board (for logging)
     */
    public String toSimpleString() {
        StringBuilder sb = new StringBuilder("\n  a b c d e f g h\n");
        for (int row = 0; row < 8; row++) {
            sb.append(8 - row).append(" ");
            for (int col = 0; col < 8; col++) {
                Piece piece = squares[row][col];
                sb.append(piece == null ? "." : piece.getSymbol()).append(" ");
            }
            sb.append(8 - row).append("\n");
        }
        sb.append("  a b c d e f g h\n");
        sb.append("\n  Turn: ").append(currentTurn).append("\n");
        return sb.toString();
    }
}

