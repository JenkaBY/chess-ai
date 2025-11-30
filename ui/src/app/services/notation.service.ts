import {Injectable} from '@angular/core';
import {ChessMove} from '../models/chess-move';
import {ChessPiece} from '../models/chess-piece';
import {PieceType} from '../models/piece-type.enum';
import {PieceColor} from '../models/piece-color.enum';
import {BoardPositionUtil} from '../models/board-position';

/**
 * Service for parsing and generating chess notation (Algebraic Notation)
 */
@Injectable({providedIn: 'root'})
export class NotationService {
  /**
   * Convert a move to Standard Algebraic Notation (SAN)
   */
  toAlgebraic(move: ChessMove, board: (ChessPiece | null)[][]): string {
    const piece = move.piece;

    // Castling
    if (move.isCastling) {
      return move.to.col > move.from.col ? 'O-O' : 'O-O-O';
    }

    let notation = '';

    // Piece prefix (except for pawns)
    if (piece.type !== PieceType.PAWN) {
      notation += this.getPiecePrefix(piece.type);
    }

    // Disambiguate if necessary (for pieces other than pawns and kings)
    if (piece.type !== PieceType.PAWN && piece.type !== PieceType.KING) {
      notation += this.getDisambiguation(move, board);
    }

    // Capture notation
    if (move.capturedPiece || move.isEnPassant) {
      if (piece.type === PieceType.PAWN) {
        // For pawn captures, include the file
        notation += String.fromCharCode('a'.charCodeAt(0) + move.from.col);
      }
      notation += 'x';
    }

    // Destination square
    notation += BoardPositionUtil.toAlgebraic(move.to);

    // Promotion
    if (move.promotionType) {
      notation += '=' + this.getPiecePrefix(move.promotionType);
    }

    // En passant indicator
    if (move.isEnPassant) {
      notation += ' e.p.';
    }

    return notation;
  }

  /**
   * Parse algebraic notation to extract move information
   */
  parseAlgebraic(notation: string, currentTurn: PieceColor): {
    pieceType: PieceType;
    toSquare: string;
    fromFile?: string;
    fromRank?: string;
    isCapture: boolean;
    isCastling: boolean;
    promotionType?: PieceType;
  } | null {
    // Remove check/checkmate indicators
    notation = notation.replace(/[+#]/, '').trim();

    // Check for castling
    if (notation === 'O-O' || notation === '0-0') {
      return {
        pieceType: PieceType.KING,
        toSquare: currentTurn === PieceColor.WHITE ? 'g1' : 'g8',
        isCastling: true,
        isCapture: false
      };
    }
    if (notation === 'O-O-O' || notation === '0-0-0') {
      return {
        pieceType: PieceType.KING,
        toSquare: currentTurn === PieceColor.WHITE ? 'c1' : 'c8',
        isCastling: true,
        isCapture: false
      };
    }

    // Parse regular moves
    const captureMatch = notation.includes('x');
    const promotionMatch = notation.match(/=([QRBN])/);

    // Remove promotion notation for further parsing
    let moveNotation = notation.replace(/=([QRBN])/, '');

    // Extract piece type
    let pieceType = PieceType.PAWN;
    if (/^[KQRBN]/.test(moveNotation)) {
      const pieceChar = moveNotation[0];
      pieceType = this.getPieceTypeFromChar(pieceChar);
      moveNotation = moveNotation.substring(1);
    }

    // Remove capture indicator
    moveNotation = moveNotation.replace('x', '');

    // Extract destination square (last two characters)
    const toSquare = moveNotation.slice(-2);

    // Extract disambiguation (file and/or rank)
    const disambiguation = moveNotation.slice(0, -2);
    let fromFile: string | undefined;
    let fromRank: string | undefined;

    if (disambiguation) {
      if (/[a-h]/.test(disambiguation[0])) {
        fromFile = disambiguation[0];
      }
      if (/[1-8]/.test(disambiguation[disambiguation.length - 1])) {
        fromRank = disambiguation[disambiguation.length - 1];
      }
    }

    return {
      pieceType,
      toSquare,
      fromFile,
      fromRank,
      isCapture: captureMatch,
      isCastling: false,
      promotionType: promotionMatch ? this.getPieceTypeFromChar(promotionMatch[1]) : undefined
    };
  }

  private getPiecePrefix(type: PieceType): string {
    switch (type) {
      case PieceType.KING:
        return 'K';
      case PieceType.QUEEN:
        return 'Q';
      case PieceType.ROOK:
        return 'R';
      case PieceType.BISHOP:
        return 'B';
      case PieceType.KNIGHT:
        return 'N';
      default:
        return '';
    }
  }

  private getPieceTypeFromChar(char: string): PieceType {
    switch (char.toUpperCase()) {
      case 'K':
        return PieceType.KING;
      case 'Q':
        return PieceType.QUEEN;
      case 'R':
        return PieceType.ROOK;
      case 'B':
        return PieceType.BISHOP;
      case 'N':
        return PieceType.KNIGHT;
      default:
        return PieceType.PAWN;
    }
  }

  private getDisambiguation(move: ChessMove, board: (ChessPiece | null)[][]): string {
    // This is a simplified version - a full implementation would check for ambiguous moves
    return '';
  }
}

