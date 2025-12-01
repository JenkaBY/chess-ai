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
      <div class="board-files board-files-top">
        @for (file of files; track file) {
          <span>{{ file }}</span>
        }
      </div>

      <!-- Main board with ranks on both sides -->
      <div class="board-main-row">
        <!-- Left rank numbers -->
        <div class="board-ranks board-ranks-left">
          @for (rank of ranks; track rank) {
            <span>{{ rank }}</span>
          }
        </div>

        <!-- Chess board -->
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

        <!-- Right rank numbers -->
        <div class="board-ranks board-ranks-right">
          @for (rank of ranks; track rank) {
            <span>{{ rank }}</span>
          }
        </div>
      </div>

      <!-- File letters at the bottom -->
      <div class="board-files board-files-bottom">
        @for (file of files; track file) {
          <span>{{ file }}</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .chess-board-container {
      position: relative;
      display: inline-block;
      padding: 40px 60px;
      background: transparent;
    }

    .board-main-row {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .chess-board {
      display: grid;
      grid-template-rows: repeat(8, 1fr);
      width: 600px;
      height: 600px;
      border: 2px solid #333;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      position: relative;
    }

    .board-row {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
    }

    .board-files {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      width: 600px;
      margin: 0 auto;
      font-weight: bold;
      color: #333;
      font-size: 1.2rem;
      user-select: none;
    }

    .board-files-top {
      margin-bottom: 8px;
    }

    .board-files-bottom {
      margin-top: 8px;
    }

    .board-files span {
      width: calc(100% / 8);
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .board-ranks {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 600px;
      font-weight: bold;
      color: #333;
      font-size: 1.2rem;
      user-select: none;
    }

    .board-ranks-left {
      margin-right: 8px;
    }

    .board-ranks-right {
      margin-left: 8px;
    }

    .board-ranks span {
      height: calc(100% / 8);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 768px) {
      .chess-board, .board-files {
        width: 400px;
        height: 400px;
        font-size: 1rem;
      }

      .board-ranks {
        height: 400px;
        font-size: 1rem;
      }

      .chess-board-container {
        padding: 20px 30px;
      }
    }
  `],
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

