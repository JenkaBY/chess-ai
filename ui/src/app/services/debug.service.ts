import {Injectable} from '@angular/core';
import {ChessPiece} from '../models/chess-piece';
import {PieceType} from '../models/piece-type.enum';
import {PieceColor} from '../models/piece-color.enum';
import {BoardPosition} from '../models/board-position';

/**
 * Debug service for logging chess board state
 * Helps diagnose move validation issues
 */
@Injectable({
  providedIn: 'root'
})
export class DebugService {

  /**
   * Print the current board state to console with detailed information
   */
  printBoardState(
    board: (ChessPiece | null)[][],
    message: string,
    additionalInfo?: {
      attemptedMove?: { from: BoardPosition; to: BoardPosition; notation: string };
      currentTurn?: PieceColor;
      enPassantTarget?: BoardPosition | null;
      validMoves?: BoardPosition[];
    }
  ): void {
    console.group(`🐛 DEBUG: ${message}`);

    // Print board visualization
    this.printBoardVisualization(board);

    // Print board state in JSON format
    console.log('\n📊 Board State (JSON):');
    this.printBoardJson(board);

    // Print additional information
    if (additionalInfo) {
      if (additionalInfo.attemptedMove) {
        console.log('\n❌ Attempted Move:');
        console.log('  Notation:', additionalInfo.attemptedMove.notation);
        console.log('  From:', this.positionToAlgebraic(additionalInfo.attemptedMove.from));
        console.log('  To:', this.positionToAlgebraic(additionalInfo.attemptedMove.to));
        const fromPiece = board[additionalInfo.attemptedMove.from.row][additionalInfo.attemptedMove.from.col];
        console.log('  Piece at source:', fromPiece ? this.formatPiece(fromPiece) : 'EMPTY');
        const toPiece = board[additionalInfo.attemptedMove.to.row][additionalInfo.attemptedMove.to.col];
        console.log('  Piece at destination:', toPiece ? this.formatPiece(toPiece) : 'EMPTY');
      }

      if (additionalInfo.currentTurn) {
        console.log('\n🎯 Current Turn:', additionalInfo.currentTurn);
      }

      if (additionalInfo.enPassantTarget) {
        console.log('\n⚡ En Passant Target:', this.positionToAlgebraic(additionalInfo.enPassantTarget));
      }

      if (additionalInfo.validMoves && additionalInfo.validMoves.length > 0) {
        console.log('\n✅ Valid Moves Available:');
        additionalInfo.validMoves.forEach(pos => {
          console.log('  -', this.positionToAlgebraic(pos));
        });
      }
    }

    console.groupEnd();
  }

  /**
   * Print a visual representation of the board
   */
  private printBoardVisualization(board: (ChessPiece | null)[][]): void {
    console.log('\n♟️ Board Visualization:\n');
    console.log('  ┌───┬───┬───┬───┬───┬───┬───┬───┐');

    for (let row = 0; row < 8; row++) {
      let rowStr = `${8 - row} │`;

      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          rowStr += ` ${this.getPieceSymbol(piece)} │`;
        } else {
          // Empty square - show light/dark pattern
          const isDark = (row + col) % 2 === 1;
          rowStr += isDark ? ' · │' : '   │';
        }
      }

      rowStr += ` ${8 - row}`;
      console.log(rowStr);

      if (row < 7) {
        console.log('  ├───┼───┼───┼───┼───┼───┼───┼───┤');
      }
    }

    console.log('  └───┴───┴───┴───┴───┴───┴───┴───┘');
    console.log('    a   b   c   d   e   f   g   h  ');
  }

  /**
   * Print board state as structured JSON
   */
  private printBoardJson(board: (ChessPiece | null)[][]): void {
    const pieces: Array<{
      type: string;
      color: string;
      position: string;
      hasMoved: boolean;
    }> = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          pieces.push({
            type: PieceType[piece.type],
            color: PieceColor[piece.color],
            position: this.positionToAlgebraic({row, col}),
            hasMoved: piece.hasMoved
          });
        }
      }
    }

    console.table(pieces);
  }

  /**
   * Get Unicode symbol for a piece
   */
  private getPieceSymbol(piece: ChessPiece): string {
    const symbols: { [key in PieceType]: { [key in PieceColor]: string } } = {
      [PieceType.KING]: {[PieceColor.WHITE]: '♔', [PieceColor.BLACK]: '♚'},
      [PieceType.QUEEN]: {[PieceColor.WHITE]: '♕', [PieceColor.BLACK]: '♛'},
      [PieceType.ROOK]: {[PieceColor.WHITE]: '♖', [PieceColor.BLACK]: '♜'},
      [PieceType.BISHOP]: {[PieceColor.WHITE]: '♗', [PieceColor.BLACK]: '♝'},
      [PieceType.KNIGHT]: {[PieceColor.WHITE]: '♘', [PieceColor.BLACK]: '♞'},
      [PieceType.PAWN]: {[PieceColor.WHITE]: '♙', [PieceColor.BLACK]: '♟'}
    };

    return symbols[piece.type][piece.color];
  }

  /**
   * Convert board position to algebraic notation
   */
  private positionToAlgebraic(pos: BoardPosition): string {
    const file = String.fromCharCode('a'.charCodeAt(0) + pos.col);
    const rank = (8 - pos.row).toString();
    return file + rank;
  }

  /**
   * Format piece information as string
   */
  private formatPiece(piece: ChessPiece): string {
    const colorStr = PieceColor[piece.color];
    const typeStr = PieceType[piece.type];
    const movedStr = piece.hasMoved ? '(moved)' : '(not moved)';
    return `${colorStr} ${typeStr} ${movedStr}`;
  }

  /**
   * Print summary of all pieces and their valid moves
   */
  printAllValidMoves(
    board: (ChessPiece | null)[][],
    currentTurn: PieceColor,
    getValidMoves: (piece: ChessPiece) => BoardPosition[]
  ): void {
    console.group('🎯 All Valid Moves for', PieceColor[currentTurn]);

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === currentTurn) {
          const validMoves = getValidMoves(piece);
          const pos = this.positionToAlgebraic({row, col});

          console.log(
            `${this.getPieceSymbol(piece)} at ${pos}:`,
            validMoves.length > 0
              ? validMoves.map(m => this.positionToAlgebraic(m)).join(', ')
              : 'No valid moves'
          );
        }
      }
    }

    console.groupEnd();
  }
}

