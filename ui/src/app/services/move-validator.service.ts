import {Injectable} from '@angular/core';
import {BoardPosition} from '../models/board-position';
import {ChessPiece} from '../models/chess-piece';
import {PieceType} from '../models/piece-type.enum';
import {PieceColor} from '../models/piece-color.enum';

/**
 * Interface for move validation strategies (Strategy Pattern - SOLID)
 */
export interface MoveValidationStrategy {
  getValidMoves(
    piece: ChessPiece,
    board: (ChessPiece | null)[][],
    enPassantTarget: BoardPosition | null
  ): BoardPosition[];
}

/**
 * Base class for move validation with common utilities
 */
export abstract class BaseMoveValidator implements MoveValidationStrategy {
  abstract getValidMoves(
    piece: ChessPiece,
    board: (ChessPiece | null)[][],
    enPassantTarget: BoardPosition | null
  ): BoardPosition[];

  protected isValidPosition(position: BoardPosition): boolean {
    return position.row >= 0 && position.row < 8 && position.col >= 0 && position.col < 8;
  }

  protected isSquareEmpty(position: BoardPosition, board: (ChessPiece | null)[][]): boolean {
    return board[position.row][position.col] === null;
  }

  protected isEnemyPiece(
    position: BoardPosition,
    board: (ChessPiece | null)[][],
    playerColor: PieceColor
  ): boolean {
    const piece = board[position.row][position.col];
    return piece !== null && piece.color !== playerColor;
  }

  protected canCapture(
    position: BoardPosition,
    board: (ChessPiece | null)[][],
    playerColor: PieceColor
  ): boolean {
    return this.isValidPosition(position) && this.isEnemyPiece(position, board, playerColor);
  }

  protected canMoveTo(
    position: BoardPosition,
    board: (ChessPiece | null)[][],
    playerColor: PieceColor
  ): boolean {
    if (!this.isValidPosition(position)) return false;
    const targetPiece = board[position.row][position.col];
    return targetPiece === null || targetPiece.color !== playerColor;
  }
}

/**
 * Pawn move validator
 */
@Injectable({providedIn: 'root'})
export class PawnMoveValidator extends BaseMoveValidator {
  getValidMoves(
    piece: ChessPiece,
    board: (ChessPiece | null)[][],
    enPassantTarget: BoardPosition | null
  ): BoardPosition[] {
    const moves: BoardPosition[] = [];
    const direction = piece.color === PieceColor.WHITE ? -1 : 1;
    const startRow = piece.color === PieceColor.WHITE ? 6 : 1;

    // Forward move
    const forwardOne = {row: piece.position.row + direction, col: piece.position.col};
    if (this.isValidPosition(forwardOne) && this.isSquareEmpty(forwardOne, board)) {
      moves.push(forwardOne);

      // Double move from starting position
      if (piece.position.row === startRow) {
        const forwardTwo = {row: piece.position.row + 2 * direction, col: piece.position.col};
        if (this.isSquareEmpty(forwardTwo, board)) {
          moves.push(forwardTwo);
        }
      }
    }

    // Captures
    const captureLeft = {row: piece.position.row + direction, col: piece.position.col - 1};
    const captureRight = {row: piece.position.row + direction, col: piece.position.col + 1};

    if (this.canCapture(captureLeft, board, piece.color)) {
      moves.push(captureLeft);
    }
    if (this.canCapture(captureRight, board, piece.color)) {
      moves.push(captureRight);
    }

    // En passant
    if (enPassantTarget) {
      if (
        captureLeft.row === enPassantTarget.row &&
        captureLeft.col === enPassantTarget.col
      ) {
        moves.push(captureLeft);
      }
      if (
        captureRight.row === enPassantTarget.row &&
        captureRight.col === enPassantTarget.col
      ) {
        moves.push(captureRight);
      }
    }

    return moves;
  }
}

/**
 * Rook move validator
 */
@Injectable({providedIn: 'root'})
export class RookMoveValidator extends BaseMoveValidator {
  getValidMoves(
    piece: ChessPiece,
    board: (ChessPiece | null)[][],
    enPassantTarget: BoardPosition | null
  ): BoardPosition[] {
    return this.getStraightMoves(piece, board);
  }

  private getStraightMoves(piece: ChessPiece, board: (ChessPiece | null)[][]): BoardPosition[] {
    const moves: BoardPosition[] = [];
    const directions = [
      {row: -1, col: 0}, // up
      {row: 1, col: 0},  // down
      {row: 0, col: -1}, // left
      {row: 0, col: 1}   // right
    ];

    for (const dir of directions) {
      let currentRow = piece.position.row + dir.row;
      let currentCol = piece.position.col + dir.col;

      while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
        const targetPos = {row: currentRow, col: currentCol};
        const targetPiece = board[currentRow][currentCol];

        if (targetPiece === null) {
          moves.push(targetPos);
        } else {
          if (targetPiece.color !== piece.color) {
            moves.push(targetPos);
          }
          break;
        }

        currentRow += dir.row;
        currentCol += dir.col;
      }
    }

    return moves;
  }
}

/**
 * Knight move validator
 */
@Injectable({providedIn: 'root'})
export class KnightMoveValidator extends BaseMoveValidator {
  getValidMoves(
    piece: ChessPiece,
    board: (ChessPiece | null)[][],
    enPassantTarget: BoardPosition | null
  ): BoardPosition[] {
    const moves: BoardPosition[] = [];
    const knightMoves = [
      {row: -2, col: -1}, {row: -2, col: 1},
      {row: -1, col: -2}, {row: -1, col: 2},
      {row: 1, col: -2}, {row: 1, col: 2},
      {row: 2, col: -1}, {row: 2, col: 1}
    ];

    for (const move of knightMoves) {
      const targetPos = {
        row: piece.position.row + move.row,
        col: piece.position.col + move.col
      };

      if (this.canMoveTo(targetPos, board, piece.color)) {
        moves.push(targetPos);
      }
    }

    return moves;
  }
}

/**
 * Bishop move validator
 */
@Injectable({providedIn: 'root'})
export class BishopMoveValidator extends BaseMoveValidator {
  getValidMoves(
    piece: ChessPiece,
    board: (ChessPiece | null)[][],
    enPassantTarget: BoardPosition | null
  ): BoardPosition[] {
    return this.getDiagonalMoves(piece, board);
  }

  private getDiagonalMoves(piece: ChessPiece, board: (ChessPiece | null)[][]): BoardPosition[] {
    const moves: BoardPosition[] = [];
    const directions = [
      {row: -1, col: -1}, // up-left
      {row: -1, col: 1},  // up-right
      {row: 1, col: -1},  // down-left
      {row: 1, col: 1}    // down-right
    ];

    for (const dir of directions) {
      let currentRow = piece.position.row + dir.row;
      let currentCol = piece.position.col + dir.col;

      while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
        const targetPos = {row: currentRow, col: currentCol};
        const targetPiece = board[currentRow][currentCol];

        if (targetPiece === null) {
          moves.push(targetPos);
        } else {
          if (targetPiece.color !== piece.color) {
            moves.push(targetPos);
          }
          break;
        }

        currentRow += dir.row;
        currentCol += dir.col;
      }
    }

    return moves;
  }
}

/**
 * Queen move validator
 */
@Injectable({providedIn: 'root'})
export class QueenMoveValidator extends BaseMoveValidator {
  constructor(
    private rookValidator: RookMoveValidator,
    private bishopValidator: BishopMoveValidator
  ) {
    super();
  }

  getValidMoves(
    piece: ChessPiece,
    board: (ChessPiece | null)[][],
    enPassantTarget: BoardPosition | null
  ): BoardPosition[] {
    return [
      ...this.rookValidator.getValidMoves(piece, board, enPassantTarget),
      ...this.bishopValidator.getValidMoves(piece, board, enPassantTarget)
    ];
  }
}

/**
 * King move validator
 */
@Injectable({providedIn: 'root'})
export class KingMoveValidator extends BaseMoveValidator {
  getValidMoves(
    piece: ChessPiece,
    board: (ChessPiece | null)[][],
    enPassantTarget: BoardPosition | null
  ): BoardPosition[] {
    const moves: BoardPosition[] = [];
    const kingMoves = [
      {row: -1, col: -1}, {row: -1, col: 0}, {row: -1, col: 1},
      {row: 0, col: -1}, {row: 0, col: 1},
      {row: 1, col: -1}, {row: 1, col: 0}, {row: 1, col: 1}
    ];

    for (const move of kingMoves) {
      const targetPos = {
        row: piece.position.row + move.row,
        col: piece.position.col + move.col
      };

      if (this.canMoveTo(targetPos, board, piece.color)) {
        moves.push(targetPos);
      }
    }

    // Add castling logic
    if (!piece.hasMoved) {
      // Kingside castling (O-O)
      const kingsideRook = board[piece.position.row][7];
      if (kingsideRook?.type === PieceType.ROOK &&
        kingsideRook.color === piece.color &&
        !kingsideRook.hasMoved) {
        // Check if squares between king and rook are empty
        const squaresBetween = [
          {row: piece.position.row, col: 5},
          {row: piece.position.row, col: 6}
        ];
        const pathClear = squaresBetween.every(pos => board[pos.row][pos.col] === null);

        if (pathClear) {
          // King moves to g-file (column 6)
          moves.push({row: piece.position.row, col: 6});
        }
      }

      // Queenside castling (O-O-O)
      const queensideRook = board[piece.position.row][0];
      if (queensideRook?.type === PieceType.ROOK &&
        queensideRook.color === piece.color &&
        !queensideRook.hasMoved) {
        // Check if squares between king and rook are empty
        const squaresBetween = [
          {row: piece.position.row, col: 1},
          {row: piece.position.row, col: 2},
          {row: piece.position.row, col: 3}
        ];
        const pathClear = squaresBetween.every(pos => board[pos.row][pos.col] === null);

        if (pathClear) {
          // King moves to c-file (column 2)
          moves.push({row: piece.position.row, col: 2});
        }
      }
    }

    return moves;
  }
}

/**
 * Main move validator service (Factory Pattern - SOLID)
 */
@Injectable({providedIn: 'root'})
export class MoveValidatorService {
  constructor(
    private pawnValidator: PawnMoveValidator,
    private rookValidator: RookMoveValidator,
    private knightValidator: KnightMoveValidator,
    private bishopValidator: BishopMoveValidator,
    private queenValidator: QueenMoveValidator,
    private kingValidator: KingMoveValidator
  ) {
  }

  getValidMoves(
    piece: ChessPiece,
    board: (ChessPiece | null)[][],
    enPassantTarget: BoardPosition | null
  ): BoardPosition[] {
    const validator = this.getValidator(piece.type);
    return validator.getValidMoves(piece, board, enPassantTarget);
  }

  private getValidator(pieceType: PieceType): MoveValidationStrategy {
    switch (pieceType) {
      case PieceType.PAWN:
        return this.pawnValidator;
      case PieceType.ROOK:
        return this.rookValidator;
      case PieceType.KNIGHT:
        return this.knightValidator;
      case PieceType.BISHOP:
        return this.bishopValidator;
      case PieceType.QUEEN:
        return this.queenValidator;
      case PieceType.KING:
        return this.kingValidator;
      default:
        throw new Error(`Unknown piece type: ${pieceType}`);
    }
  }
}

