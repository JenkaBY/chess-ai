import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GameService} from '../../services/game.service';

/**
 * Component for displaying game information and controls
 */
@Component({
  selector: 'app-game-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="game-info">
      <h2>Chess Game</h2>

      <div class="status-section">
        <h3>Game Status</h3>
        <div class="status-item">
          <strong>Current Turn:</strong>
          <span [class.white-turn]="gameService.currentTurn() === 'WHITE'"
                [class.black-turn]="gameService.currentTurn() === 'BLACK'">
            {{ gameService.currentTurn() }}
          </span>
        </div>

        @if (gameService.isCheck()) {
          <div class="status-item alert">
            <strong>⚠️ CHECK!</strong>
          </div>
        }

        @if (gameService.isCheckmate()) {
          <div class="status-item alert">
            <strong>♔ CHECKMATE!</strong>
            <p>{{ getWinner() }} wins!</p>
          </div>
        }

        @if (gameService.isStalemate()) {
          <div class="status-item alert">
            <strong>Draw by Stalemate</strong>
          </div>
        }
      </div>

      <div class="fen-section">
        <h3>FEN Notation</h3>
        <div class="fen-display">
          <code>{{ gameService.fenNotation() }}</code>
        </div>
      </div>

      <div class="notation-input-section">
        <h3>Enter Move Notation</h3>
        <div class="input-group">
          <input
            type="text"
            [(ngModel)]="moveNotation"
            placeholder="e.g., e4, Nf3, O-O"
            (keydown.enter)="submitMove()"
            [disabled]="gameService.isCheckmate() || gameService.isStalemate()"
            aria-label="Enter chess move in algebraic notation"
          />
          <button
            (click)="submitMove()"
            [disabled]="gameService.isCheckmate() || gameService.isStalemate()"
          >
            Submit Move
          </button>
        </div>
        @if (errorMessage) {
          <div class="error-message">{{ errorMessage }}</div>
        }
        <div class="notation-help">
          <small>Examples: e4 (pawn), Nf3 (knight), Bxc4 (bishop captures), O-O (castle)</small>
        </div>
      </div>

      <div class="move-history-section">
        <h3>Move History</h3>
        <div class="move-history">
          @if (gameService.moveHistory().length === 0) {
            <p class="no-moves">No moves yet</p>
          } @else {
            <ol>
              @for (move of gameService.moveHistory(); track $index) {
                <li>{{ move.notation || getMoveDescription(move) }}</li>
              }
            </ol>
          }
        </div>
      </div>

      <div class="captured-pieces-section">
        <h3>Captured Pieces</h3>
        <div class="captured-white">
          <strong>White:</strong>
          @for (piece of getCapturedPiecesByColor('BLACK'); track $index) {
            <span class="captured-piece">{{ getPieceSymbol(piece) }}</span>
          }
        </div>
        <div class="captured-black">
          <strong>Black:</strong>
          @for (piece of getCapturedPiecesByColor('WHITE'); track $index) {
            <span class="captured-piece">{{ getPieceSymbol(piece) }}</span>
          }
        </div>
      </div>

      <div class="controls-section">
        <button (click)="resetGame()" class="reset-button">
          New Game
        </button>
      </div>
    </div>
  `,
  styles: [`
    .game-info {
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 8px;
      min-width: 300px;
      max-width: 400px;
    }

    h2 {
      margin-top: 0;
      color: #333;
    }

    h3 {
      margin: 16px 0 8px 0;
      color: #555;
      font-size: 1.1rem;
      border-bottom: 2px solid #ddd;
      padding-bottom: 4px;
    }

    .status-section {
      margin-bottom: 20px;
    }

    .status-item {
      margin: 8px 0;
      padding: 8px;
      background-color: white;
      border-radius: 4px;
    }

    .status-item.alert {
      background-color: #fff3cd;
      border: 2px solid #ffc107;
      font-weight: bold;
    }

    .white-turn {
      color: #2196F3;
      font-weight: bold;
    }

    .black-turn {
      color: #333;
      font-weight: bold;
    }

    .fen-section {
      margin-bottom: 20px;
    }

    .fen-display {
      background-color: white;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }

    .fen-display code {
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      word-break: break-all;
    }

    .notation-input-section {
      margin-bottom: 20px;
    }

    .input-group {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }

    .input-group input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .input-group button {
      padding: 8px 16px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }

    .input-group button:hover:not(:disabled) {
      background-color: #45a049;
    }

    .input-group button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .error-message {
      color: #d32f2f;
      font-size: 0.9rem;
      padding: 4px;
      background-color: #ffebee;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .notation-help {
      color: #666;
      font-size: 0.85rem;
    }

    .move-history-section {
      margin-bottom: 20px;
    }

    .move-history {
      background-color: white;
      padding: 10px;
      border-radius: 4px;
      max-height: 200px;
      overflow-y: auto;
    }

    .move-history ol {
      margin: 0;
      padding-left: 20px;
    }

    .move-history li {
      margin: 4px 0;
      font-family: 'Courier New', monospace;
    }

    .no-moves {
      color: #999;
      font-style: italic;
      margin: 0;
    }

    .captured-pieces-section {
      margin-bottom: 20px;
    }

    .captured-white, .captured-black {
      background-color: white;
      padding: 8px;
      margin: 8px 0;
      border-radius: 4px;
    }

    .captured-piece {
      font-size: 1.5rem;
      margin: 0 4px;
    }

    .controls-section {
      margin-top: 20px;
    }

    .reset-button {
      width: 100%;
      padding: 12px;
      background-color: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
    }

    .reset-button:hover {
      background-color: #da190b;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameInfoComponent {
  moveNotation = '';
  errorMessage = '';

  constructor(protected gameService: GameService) {
  }

  submitMove(): void {
    if (!this.moveNotation.trim()) {
      this.errorMessage = 'Please enter a move';
      return;
    }

    const success = this.gameService.makeMoveByNotation(this.moveNotation.trim());

    if (success) {
      this.moveNotation = '';
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Invalid move notation. Please check and try again.';
    }
  }

  resetGame(): void {
    this.gameService.resetGame();
    this.moveNotation = '';
    this.errorMessage = '';
  }

  getWinner(): string {
    const currentTurn = this.gameService.currentTurn();
    return currentTurn === 'WHITE' ? 'Black' : 'White';
  }

  getCapturedPiecesByColor(color: string) {
    return this.gameService.capturedPieces().filter(piece => piece.color === color);
  }

  getPieceSymbol(piece: any): string {
    const symbols: any = {
      'WHITE': {
        'KING': '♔',
        'QUEEN': '♕',
        'ROOK': '♖',
        'BISHOP': '♗',
        'KNIGHT': '♘',
        'PAWN': '♙'
      },
      'BLACK': {
        'KING': '♚',
        'QUEEN': '♛',
        'ROOK': '♜',
        'BISHOP': '♝',
        'KNIGHT': '♞',
        'PAWN': '♟'
      }
    };
    return symbols[piece.color][piece.type];
  }

  getMoveDescription(move: any): string {
    const from = String.fromCharCode('a'.charCodeAt(0) + move.from.col) + (8 - move.from.row);
    const to = String.fromCharCode('a'.charCodeAt(0) + move.to.col) + (8 - move.to.row);
    return `${from}-${to}`;
  }
}

