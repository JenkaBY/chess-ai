import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GameService} from '../../services/game.service';
import {HelpModalComponent} from '../help-modal/help-modal.component';
import {AiGameService} from '../../services/ai-game.service';

@Component({
  selector: 'app-game-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, HelpModalComponent],
  templateUrl: './game-tab.component.html',
  styleUrls: ['./game-tab.component.css']
})
export class GameTabComponent {
  @Input() gameService!: GameService;
  @Input() moveNotation = '';
  @Input() errorMessage = '';
  @Output() moveNotationChange = new EventEmitter<string>();
  @Output() errorMessageChange = new EventEmitter<string>();
  @Output() submitMoveEvent = new EventEmitter<void>();
  @Output() resetGameEvent = new EventEmitter<void>();

  showHelp = false;
  aiLapId = '';

  constructor(public aiGameService: AiGameService) {
  }

  toggleHelp(): void {
    this.showHelp = !this.showHelp;
  }

  onMoveNotationChange(value: string): void {
    this.moveNotationChange.emit(value);
  }

  submitMove(): void {
    this.submitMoveEvent.emit();
  }

  resetGame(): void {
    this.resetGameEvent.emit();
  }

  startAiGame(): void {
    if (this.aiLapId.trim()) {
      this.aiGameService.startAiGame(this.aiLapId.trim());
    }
  }

  stopAiGame(): void {
    this.aiGameService.stopAiGame();
  }

  getLastTenMoves(): any[] {
    const history = this.gameService.moveHistory();
    return history.slice(Math.max(0, history.length - 10));
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
