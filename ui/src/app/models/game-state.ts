import {PieceColor} from './piece-color.enum';
import {ChessPiece} from './chess-piece';
import {ChessMove} from './chess-move';
import {BoardPosition} from './board-position';

/**
 * Represents the current state of the chess game
 */
export interface GameState {
  board: (ChessPiece | null)[][];
  currentTurn: PieceColor;
  moveHistory: ChessMove[];
  capturedPieces: ChessPiece[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  enPassantTarget: BoardPosition | null;
  halfMoveClock: number;
  fullMoveNumber: number;
}

