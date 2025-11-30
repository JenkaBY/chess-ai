import {Injectable} from '@angular/core';
import {GameState} from '../models/game-state';
import {ChessPiece, ChessPieceFactory} from '../models/chess-piece';
import {PieceType} from '../models/piece-type.enum';
import {PieceColor} from '../models/piece-color.enum';

/**
 * Service for initializing the chess board (Single Responsibility - SOLID)
 */
@Injectable({providedIn: 'root'})
export class BoardInitializerService {
  initializeBoard(): (ChessPiece | null)[][] {
    const board: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

    // Place black pieces
    this.placeBackRank(board, 0, PieceColor.BLACK);
    this.placePawns(board, 1, PieceColor.BLACK);

    // Place white pieces
    this.placePawns(board, 6, PieceColor.WHITE);
    this.placeBackRank(board, 7, PieceColor.WHITE);

    return board;
  }

  private placeBackRank(board: (ChessPiece | null)[][], row: number, color: PieceColor): void {
    board[row][0] = ChessPieceFactory.create(PieceType.ROOK, color, {row, col: 0});
    board[row][1] = ChessPieceFactory.create(PieceType.KNIGHT, color, {row, col: 1});
    board[row][2] = ChessPieceFactory.create(PieceType.BISHOP, color, {row, col: 2});
    board[row][3] = ChessPieceFactory.create(PieceType.QUEEN, color, {row, col: 3});
    board[row][4] = ChessPieceFactory.create(PieceType.KING, color, {row, col: 4});
    board[row][5] = ChessPieceFactory.create(PieceType.BISHOP, color, {row, col: 5});
    board[row][6] = ChessPieceFactory.create(PieceType.KNIGHT, color, {row, col: 6});
    board[row][7] = ChessPieceFactory.create(PieceType.ROOK, color, {row, col: 7});
  }

  private placePawns(board: (ChessPiece | null)[][], row: number, color: PieceColor): void {
    for (let col = 0; col < 8; col++) {
      board[row][col] = ChessPieceFactory.create(PieceType.PAWN, color, {row, col});
    }
  }

  initializeGameState(): GameState {
    return {
      board: this.initializeBoard(),
      currentTurn: PieceColor.WHITE,
      moveHistory: [],
      capturedPieces: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      enPassantTarget: null,
      halfMoveClock: 0,
      fullMoveNumber: 1
    };
  }
}
