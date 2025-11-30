import {BoardPosition} from './board-position';
import {ChessPiece} from './chess-piece';
import {PieceType} from './piece-type.enum';

/**
 * Represents a chess move
 */
export interface ChessMove {
  from: BoardPosition;
  to: BoardPosition;
  piece: ChessPiece;
  capturedPiece?: ChessPiece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  promotionType?: PieceType;
  notation?: string;
}

