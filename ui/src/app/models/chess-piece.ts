import {PieceType} from './piece-type.enum';
import {PieceColor} from './piece-color.enum';
import {BoardPosition} from './board-position';

/**
 * Represents a chess piece
 */
export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  position: BoardPosition;
  hasMoved: boolean; // Track for castling and pawn double-move
}

/**
 * Factory for creating chess pieces
 */
export class ChessPieceFactory {
  static create(
    type: PieceType,
    color: PieceColor,
    position: BoardPosition,
    hasMoved: boolean = false
  ): ChessPiece {
    return {type, color, position, hasMoved};
  }
}

