import {ChangeDetectionStrategy, Component, effect, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BoardSquareComponent} from '../board-square/board-square.component';
import {GameService} from '../../services/game.service';
import {BoardPosition} from '../../models/board-position';
import {ChessMove} from '../../models/chess-move';

/**
 * Main chess board component
 * Manages the board display and user interactions
 */
@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [CommonModule, BoardSquareComponent],
  templateUrl: './chess-board.component.html',
  styleUrls: ['./chess-board.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessBoardComponent {
  boardRows = Array(8).fill(0);
  boardCols = Array(8).fill(0);
  files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  ranks = ['8', '7', '6', '5', '4', '3', '2', '1']; // 8 at top, 1 at bottom

  private selectedSquare = signal<BoardPosition | null>(null);
  private validMoves = signal<BoardPosition[]>([]);
  private lastMove = signal<{ from: BoardPosition; to: BoardPosition } | null>(null);

  constructor(protected gameService: GameService) {
    effect(() => {
      const history = this.gameService.moveHistory();
      if (!history.length) {
        this.lastMove.set(null);
        return;
      }
      const latest: ChessMove = history[history.length - 1];
      this.lastMove.set({from: latest.from, to: latest.to});
    });
  }

  getPieceAt(row: number, col: number) {
    return this.gameService.board()[row][col];
  }

  isLightSquare(row: number, col: number): boolean {
    return (row + col) % 2 === 0;
  }

  isSquareSelected(row: number, col: number): boolean {
    const selected = this.selectedSquare();
    return selected !== null && selected.row === row && selected.col === col;
  }

  isSquareValidMove(row: number, col: number): boolean {
    return this.validMoves().some(move => move.row === row && move.col === col);
  }

  isSquareHighlighted(row: number, col: number): boolean {
    const last = this.lastMove();
    if (!last) return false;
    return (
      (last.from.row === row && last.from.col === col) ||
      (last.to.row === row && last.to.col === col)
    );
  }

  onSquareClick(position: BoardPosition): void {
    const selected = this.selectedSquare();

    // If a square is already selected
    if (selected) {
      // Try to make a move
      const moveSuccess = this.gameService.makeMove(selected, position);

      if (moveSuccess.success) {
        this.selectedSquare.set(null);
        this.validMoves.set([]);
      } else {
        // If move failed, check if clicked on own piece to select it
        const piece = this.getPieceAt(position.row, position.col);
        if (piece && piece.color === this.gameService.currentTurn()) {
          this.selectSquare(position);
        } else {
          // Deselect
          this.selectedSquare.set(null);
          this.validMoves.set([]);
        }
      }
    } else {
      // Select a piece
      const piece = this.getPieceAt(position.row, position.col);
      if (piece && piece.color === this.gameService.currentTurn()) {
        this.selectSquare(position);
      }
    }
  }

  private selectSquare(position: BoardPosition): void {
    this.selectedSquare.set(position);
    this.validMoves.set(this.gameService.getValidMoves(position));
  }
}
