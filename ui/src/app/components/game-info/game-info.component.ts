import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GameService} from '../../services/game.service';
import {HelpModalComponent} from '../help-modal/help-modal.component';
import {MoveHistoryComponent} from '../move-history/move-history.component';

/**
 * Component for displaying game information and controls
 */
@Component({
  selector: 'app-game-info',
  standalone: true,
  imports: [CommonModule, FormsModule, HelpModalComponent, MoveHistoryComponent],
  templateUrl: './game-info.component.html',
  styleUrls: ['./game-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameInfoComponent {
  moveNotation = '';
  errorMessage = '';
  showHelp = signal(false);

  constructor(protected gameService: GameService) {
  }

  toggleHelp(): void {
    this.showHelp.set(!this.showHelp());
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
