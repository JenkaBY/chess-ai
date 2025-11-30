import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BoardSquareComponent} from '../board-square/board-square.component';
import {GameService} from '../../services/game.service';
import {BoardPosition} from '../../models/board-position';

/**
 * Main chess board component
 * Manages the board display and user interactions
 */
@Component({
  selector: 'app-chess-board',
  standalone: true,
  imports: [CommonModule, BoardSquareComponent],
  template: `
    <div class="chess-board-container">
      <div class="chess-board" role="grid" aria-label="Chess board">
        @for (row of boardRows; track row; let rowIndex = $index) {
          <div class="board-row" role="row">
            @for (col of boardCols; track col; let colIndex = $index) {
              <app-board-square
                [position]="{ row: rowIndex, col: colIndex }"
                [piece]="getPieceAt(rowIndex, colIndex)"
                [isLight]="isLightSquare(rowIndex, colIndex)"
                [isSelected]="isSquareSelected(rowIndex, colIndex)"
                [isValidMove]="isSquareValidMove(rowIndex, colIndex)"
                [isHighlighted]="isSquareHighlighted(rowIndex, colIndex)"
                (squareClicked)="onSquareClick($event)"
              />
            }
          </div>
        }
      </div>

      <div class="board-coordinates">
        <div class="files">
          @for (file of files; track file) {
            <span>{{ file }}</span>
          }
        </div>
        <div class="ranks">
          @for (rank of ranks; track rank) {
            <span>{{ rank }}</span>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chess-board-container {
      position: relative;
      display: inline-block;
      padding: 20px;
    }

    .chess-board {
      display: grid;
      grid-template-rows: repeat(8, 1fr);
      width: 600px;
      height: 600px;
      border: 2px solid #333;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .board-row {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
    }

    .board-coordinates {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .files {
      position: absolute;
      bottom: 0;
      left: 20px;
      right: 20px;
      display: flex;
      justify-content: space-around;
      padding: 2px 0;
      font-weight: bold;
      color: #333;
    }

    .files span {
      width: calc(100% / 8);
      text-align: center;
    }

    .ranks {
      position: absolute;
      left: 0;
      top: 20px;
      bottom: 20px;
      display: flex;
      flex-direction: column-reverse;
      justify-content: space-around;
      padding: 0 2px;
      font-weight: bold;
      color: #333;
    }

    .ranks span {
      height: calc(100% / 8);
      display: flex;
      align-items: center;
    }

    @media (max-width: 768px) {
      .chess-board {
        width: 400px;
        height: 400px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChessBoardComponent {
  boardRows = Array(8).fill(0);
  boardCols = Array(8).fill(0);
  files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

  private selectedSquare = signal<BoardPosition | null>(null);
  private validMoves = signal<BoardPosition[]>([]);
  private lastMove = signal<{ from: BoardPosition; to: BoardPosition } | null>(null);

  constructor(protected gameService: GameService) {
  }

  getPieceAt(row: number, col: number) {
    return this.gameService.board()[row][col];
  }

  isLightSquare(row: number, col: number): boolean {
    return (row + col) % 2 !== 0;
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

      if (moveSuccess) {
        this.lastMove.set({from: selected, to: position});
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

