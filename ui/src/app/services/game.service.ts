import {computed, Injectable, signal, WritableSignal} from '@angular/core';
import {GameState} from '../models/game-state';
import {ChessMove} from '../models/chess-move';
import {BoardPosition, BoardPositionUtil} from '../models/board-position';
import {ChessPiece} from '../models/chess-piece';
import {PieceColor} from '../models/piece-color.enum';
import {PieceType} from '../models/piece-type.enum';
import {BoardInitializerService} from './board-initializer.service';
import {MoveValidatorService} from './move-validator.service';
import {NotationService} from './notation.service';
import {FenService} from './fen.service';
import {ChessMoveResult} from '../models/chess-move-response';

/**
 * Main game service that manages the chess game state
 * Uses signals for reactive state management (Angular v21)
 */
@Injectable({providedIn: 'root'})
export class GameService {
  // Signals for reactive state
  private gameStateSignal!: WritableSignal<GameState>;

  // Computed signals
  readonly gameState = computed(() => this.gameStateSignal());
  readonly currentTurn = computed(() => this.gameStateSignal().currentTurn);
  readonly board = computed(() => this.gameStateSignal().board);
  readonly isCheck = computed(() => this.gameStateSignal().isCheck);
  readonly isCheckmate = computed(() => this.gameStateSignal().isCheckmate);
  readonly isStalemate = computed(() => this.gameStateSignal().isStalemate);
  readonly moveHistory = computed(() => this.gameStateSignal().moveHistory);
  readonly capturedPieces = computed(() => this.gameStateSignal().capturedPieces);
  readonly fenNotation = computed(() => this.fenService.toFen(this.gameStateSignal()));

  constructor(
    private boardInitializer: BoardInitializerService,
    private moveValidator: MoveValidatorService,
    private notationService: NotationService,
    private fenService: FenService
  ) {
    this.gameStateSignal = signal<GameState>(this.boardInitializer.initializeGameState());
  }

  /**
   * Get valid moves for a piece at a position
   */
  getValidMoves(position: BoardPosition): BoardPosition[] {
    const state = this.gameStateSignal();
    const piece = state.board[position.row][position.col];

    if (!piece || piece.color !== state.currentTurn) {
      return [];
    }

    const validMoves = this.moveValidator.getValidMoves(
      piece,
      state.board,
      state.enPassantTarget
    );

    // Filter out moves that would leave the king in check
    return validMoves.filter(move =>
      !this.wouldBeInCheck(piece, position, move, state)
    );
  }

  /**
   * Attempt to make a move
   */
  makeMove(from: BoardPosition, to: BoardPosition): ChessMoveResult {
    const state = this.gameStateSignal();
    const piece = state.board[from.row][from.col];

    if (!piece || piece.color !== state.currentTurn) {

      return {
        success: false,
        errorMessage: 'No piece of current player at the source position'
      };
    }

    const validMoves = this.getValidMoves(from);
    const isValidMove = validMoves.some(move =>
      BoardPositionUtil.equals(move, to)
    );

    if (!isValidMove) {
      return {
        success: false,
        errorMessage: 'Invalid move for the selected piece'
      };
    }

    // Execute the move
    this.executeMoveInternal(from, to);
    return {
      success: true
    };
  }

  /**
   * Make a move using algebraic notation
   */
  makeMoveByNotation(notation: string): ChessMoveResult {
    // TODO return object with success and error message
    const state = this.gameStateSignal();
    const parsedMove = this.notationService.parseAlgebraic(notation, state.currentTurn);

    if (!parsedMove) {
      return {
        success: false,
        errorMessage: `Notation '${notation}' could not be parsed`
      };
    }

    // Find the piece that can make this move
    const toPosition = BoardPositionUtil.fromAlgebraic(parsedMove.toSquare);

    // Find all pieces of the specified type and color
    const candidatePieces: { piece: ChessPiece; position: BoardPosition }[] = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row][col];
        if (piece && piece.type === parsedMove.pieceType && piece.color === state.currentTurn) {
          const position = {row, col};

          // Check disambiguation
          if (parsedMove.fromFile && String.fromCharCode('a'.charCodeAt(0) + col) !== parsedMove.fromFile) {
            continue;
          }
          if (parsedMove.fromRank && (8 - row).toString() !== parsedMove.fromRank) {
            continue;
          }

          candidatePieces.push({piece, position});
        }
      }
    }

    // Try each candidate piece
    for (const candidate of candidatePieces) {
      const validMoves = this.getValidMoves(candidate.position);
      if (validMoves.some(move => BoardPositionUtil.equals(move, toPosition))) {
        return this.makeMove(candidate.position, toPosition);
      }
    }

    return {
      success: false,
      errorMessage: `No valid piece found to make the move '${notation}'`
    };
  }

  /**
   * Reset the game to initial state
   */
  resetGame(): void {
    this.gameStateSignal.set(this.boardInitializer.initializeGameState());
  }

  /**
   * Get piece at position
   */
  getPieceAt(position: BoardPosition): ChessPiece | null {
    const state = this.gameStateSignal();
    return state.board[position.row][position.col];
  }

  /**
   * Execute a move internally
   */
  private executeMoveInternal(from: BoardPosition, to: BoardPosition): void {
    const state = this.gameStateSignal();
    const newBoard = state.board.map(row => [...row]);
    const piece = newBoard[from.row][from.col]!;
    const capturedPiece = newBoard[to.row][to.col];

    // Create move record
    const move: ChessMove = {
      from,
      to,
      piece: {...piece},
      capturedPiece: capturedPiece || undefined
    };

    // Check for en passant capture
    if (
      piece.type === PieceType.PAWN &&
      state.enPassantTarget &&
      BoardPositionUtil.equals(to, state.enPassantTarget)
    ) {
      const captureRow = piece.color === PieceColor.WHITE ? to.row + 1 : to.row - 1;
      move.capturedPiece = newBoard[captureRow][to.col]!;
      move.isEnPassant = true;
      newBoard[captureRow][to.col] = null;
    }

    // Move the piece
    newBoard[to.row][to.col] = {...piece, position: to, hasMoved: true};
    newBoard[from.row][from.col] = null;

    // Handle pawn promotion (auto-promote to queen for now)
    if (piece.type === PieceType.PAWN && (to.row === 0 || to.row === 7)) {
      newBoard[to.row][to.col]!.type = PieceType.QUEEN;
      move.promotionType = PieceType.QUEEN;
    }

    // Set en passant target for next turn
    let newEnPassantTarget: BoardPosition | null = null;
    if (piece.type === PieceType.PAWN && Math.abs(from.row - to.row) === 2) {
      newEnPassantTarget = {
        row: piece.color === PieceColor.WHITE ? from.row - 1 : from.row + 1,
        col: from.col
      };
    }

    // Update captured pieces
    const newCapturedPieces = [...state.capturedPieces];
    if (move.capturedPiece) {
      newCapturedPieces.push(move.capturedPiece);
    }

    // Generate notation
    move.notation = this.notationService.toAlgebraic(move, state.board);

    // Update move history
    const newMoveHistory = [...state.moveHistory, move];

    // Switch turn
    const newTurn = state.currentTurn === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;

    // Check for check/checkmate
    const isCheck = this.isKingInCheck(newBoard, newTurn);
    const isCheckmate = isCheck && this.hasNoLegalMoves(newBoard, newTurn, newEnPassantTarget);
    const isStalemate = !isCheck && this.hasNoLegalMoves(newBoard, newTurn, newEnPassantTarget);

    // Update game state
    this.gameStateSignal.set({
      board: newBoard,
      currentTurn: newTurn,
      moveHistory: newMoveHistory,
      capturedPieces: newCapturedPieces,
      isCheck,
      isCheckmate,
      isStalemate,
      enPassantTarget: newEnPassantTarget,
      halfMoveClock: capturedPiece ? 0 : state.halfMoveClock + 1,
      fullMoveNumber: newTurn === PieceColor.WHITE ? state.fullMoveNumber + 1 : state.fullMoveNumber
    });
  }

  /**
   * Check if a move would leave the king in check
   */
  private wouldBeInCheck(
    piece: ChessPiece,
    from: BoardPosition,
    to: BoardPosition,
    state: GameState
  ): boolean {
    // Create a temporary board with the move applied
    const tempBoard = state.board.map(row => [...row]);
    tempBoard[to.row][to.col] = {...piece, position: to};
    tempBoard[from.row][from.col] = null;

    return this.isKingInCheck(tempBoard, piece.color);
  }

  /**
   * Check if the king is in check
   */
  private isKingInCheck(board: (ChessPiece | null)[][], color: PieceColor): boolean {
    // Find the king
    let kingPosition: BoardPosition | null = null;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece?.type === PieceType.KING && piece.color === color) {
          kingPosition = {row, col};
          break;
        }
      }
      if (kingPosition) break;
    }

    if (!kingPosition) return false;

    // Check if any enemy piece can attack the king
    const enemyColor = color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece?.color === enemyColor) {
          const validMoves = this.moveValidator.getValidMoves(piece, board, null);
          if (validMoves.some(move => BoardPositionUtil.equals(move, kingPosition!))) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Check if the player has no legal moves (used for checkmate/stalemate detection)
   */
  private hasNoLegalMoves(
    board: (ChessPiece | null)[][],
    color: PieceColor,
    enPassantTarget: BoardPosition | null
  ): boolean {
    // Check if the player has any legal moves
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece?.color === color) {
          const validMoves = this.moveValidator.getValidMoves(piece, board, enPassantTarget);

          // Check if any move wouldn't leave the king in check
          for (const move of validMoves) {
            const tempBoard = board.map(r => [...r]);
            tempBoard[move.row][move.col] = {...piece, position: move};
            tempBoard[row][col] = null;

            if (!this.isKingInCheck(tempBoard, color)) {
              return false; // Found a legal move
            }
          }
        }
      }
    }

    return true; // No legal moves available
  }
}

