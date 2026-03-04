import {Component, EventEmitter, inject, Input, OnChanges, Output, signal, SimpleChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GameService} from '../../services/game.service';
import {HelpModalComponent} from '../help-modal/help-modal.component';
import {AiGameService} from '../../services/ai-game.service';
import {AiDisabledModalComponent} from '../ai-disabled-modal/ai-disabled-modal.component';
import {AiGameHelpModalComponent} from '../ai-game-help-modal/ai-game-help-modal.component';
import {ENABLE_LIVE_AI_GAME} from '../../core/tokens/enable-live-ai-game.token';

@Component({
  selector: 'app-game-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, HelpModalComponent, AiDisabledModalComponent, AiGameHelpModalComponent],
  templateUrl: './game-tab.component.html',
  styleUrls: ['./game-tab.component.css']
})
export class GameTabComponent implements OnChanges {
  @Input() gameService!: GameService;
  @Input() moveNotation = '';
  @Input() errorMessage = '';
  @Input() initialAiLapId = '';
  @Output() moveNotationChange = new EventEmitter<string>();
  @Output() errorMessageChange = new EventEmitter<string>();
  @Output() submitMoveEvent = new EventEmitter<void>();
  @Output() resetGameEvent = new EventEmitter<void>();
  @Output() openReplayTab = new EventEmitter<void>();

  showHelp = false;
  aiLapId = '';

  readonly showAiDisabledModal = signal(false);
  readonly showAiHelp = signal(false);

  readonly liveAiGameEnabled = inject(ENABLE_LIVE_AI_GAME);

  constructor(public aiGameService: AiGameService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialAiLapId'] && changes['initialAiLapId'].currentValue) {
      this.aiLapId = changes['initialAiLapId'].currentValue;
    }
  }

  toggleHelp(): void {
    this.showHelp = !this.showHelp;
  }

  toggleAiHelp(): void {
    this.showAiHelp.update(v => !v);
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
    if (!this.liveAiGameEnabled) {
      this.showAiDisabledModal.set(true);
      return;
    }
    if (this.aiLapId.trim()) {
      this.aiGameService.startAiGame(this.aiLapId.trim());
    }
  }

  stopAiGame(): void {
    this.aiGameService.stopAiGame();
  }

  onAiDisabledModalOpenReplay(): void {
    this.openReplayTab.emit();
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
