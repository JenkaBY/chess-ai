import {Injectable} from '@angular/core';
import {GameState} from '../models/game-state';
import {PieceColor} from '../models/piece-color.enum';
import {PieceType} from '../models/piece-type.enum';
import {ChessPiece} from '../models/chess-piece';

/**
 * Service for FEN (Forsyth-Edwards Notation) operations
 */
@Injectable({providedIn: 'root'})
export class FenService {
  /**
   * Convert game state to FEN notation
   */
  toFen(gameState: GameState): string {
    const piecePlacement = this.getBoardFen(gameState.board);
    const activeColor = gameState.currentTurn === PieceColor.WHITE ? 'w' : 'b';
    const castling = this.getCastlingRights(gameState.board);
    const enPassant = this.getEnPassantTarget(gameState.enPassantTarget);
    const halfMove = gameState.halfMoveClock.toString();
    const fullMove = gameState.fullMoveNumber.toString();

    return `${piecePlacement} ${activeColor} ${castling} ${enPassant} ${halfMove} ${fullMove}`;
  }

  private getBoardFen(board: (ChessPiece | null)[][]): string {
    const rows: string[] = [];

    for (let row = 0; row < 8; row++) {
      let rowStr = '';
      let emptyCount = 0;

      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];

        if (piece === null) {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            rowStr += emptyCount.toString();
            emptyCount = 0;
          }
          rowStr += this.getPieceFenChar(piece);
        }
      }

      if (emptyCount > 0) {
        rowStr += emptyCount.toString();
      }

      rows.push(rowStr);
    }

    return rows.join('/');
  }

  private getPieceFenChar(piece: ChessPiece): string {
    let char = '';
    switch (piece.type) {
      case PieceType.PAWN:
        char = 'p';
        break;
      case PieceType.ROOK:
        char = 'r';
        break;
      case PieceType.KNIGHT:
        char = 'n';
        break;
      case PieceType.BISHOP:
        char = 'b';
        break;
      case PieceType.QUEEN:
        char = 'q';
        break;
      case PieceType.KING:
        char = 'k';
        break;
    }
    return piece.color === PieceColor.WHITE ? char.toUpperCase() : char;
  }

  private getCastlingRights(board: (ChessPiece | null)[][]): string {
    let rights = '';

    // Check white castling rights
    const whiteKing = board[7][4];
    const whiteKingRook = board[7][7];
    const whiteQueenRook = board[7][0];

    if (
      whiteKing?.type === PieceType.KING &&
      whiteKing.color === PieceColor.WHITE &&
      !whiteKing.hasMoved
    ) {
      if (
        whiteKingRook?.type === PieceType.ROOK &&
        whiteKingRook.color === PieceColor.WHITE &&
        !whiteKingRook.hasMoved
      ) {
        rights += 'K';
      }
      if (
        whiteQueenRook?.type === PieceType.ROOK &&
        whiteQueenRook.color === PieceColor.WHITE &&
        !whiteQueenRook.hasMoved
      ) {
        rights += 'Q';
      }
    }

    // Check black castling rights
    const blackKing = board[0][4];
    const blackKingRook = board[0][7];
    const blackQueenRook = board[0][0];

    if (
      blackKing?.type === PieceType.KING &&
      blackKing.color === PieceColor.BLACK &&
      !blackKing.hasMoved
    ) {
      if (
        blackKingRook?.type === PieceType.ROOK &&
        blackKingRook.color === PieceColor.BLACK &&
        !blackKingRook.hasMoved
      ) {
        rights += 'k';
      }
      if (
        blackQueenRook?.type === PieceType.ROOK &&
        blackQueenRook.color === PieceColor.BLACK &&
        !blackQueenRook.hasMoved
      ) {
        rights += 'q';
      }
    }

    return rights || '-';
  }

  private getEnPassantTarget(enPassantTarget: { row: number; col: number } | null): string {
    if (!enPassantTarget) return '-';
    const file = String.fromCharCode('a'.charCodeAt(0) + enPassantTarget.col);
    const rank = (8 - enPassantTarget.row).toString();
    return file + rank;
  }
}

