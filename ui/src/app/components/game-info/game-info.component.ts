import {ChangeDetectionStrategy, Component, OnDestroy, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GameService} from '../../services/game.service';
import {GameTabComponent} from '../game-tab/game-tab.component';
import {HistoryTabComponent} from '../history-tab/history-tab.component';
import {LapsTabComponent} from '../laps-tab/laps-tab.component';
import {AiGameService} from '../../services/ai-game.service';

/**
 * Component for displaying game information and controls
 */
@Component({
  selector: 'app-game-info',
  standalone: true,
  imports: [CommonModule, FormsModule, GameTabComponent, HistoryTabComponent, LapsTabComponent],
  templateUrl: './game-info.component.html',
  styleUrls: ['./game-info.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameInfoComponent implements OnDestroy {
  moveNotation = '';
  errorMessage = '';
  activeTab = signal<'game' | 'history' | 'replay'>('game');
  replayLapId = signal<string>('');

  constructor(
    protected gameService: GameService,
    private aiGameService: AiGameService
  ) {
  }

  ngOnDestroy(): void {
    console.log('🔴 GameInfoComponent destroyed');
  }

  setActiveTab(tab: 'game' | 'history' | 'replay'): void {
    this.activeTab.set(tab);
  }

  submitMove(): void {
    if (!this.moveNotation.trim()) {
      this.errorMessage = 'Please enter a move';
      return;
    }

    const moveResult = this.gameService.makeMoveByNotation(this.moveNotation.trim());

    if (moveResult.success) {
      this.moveNotation = '';
      this.errorMessage = '';
    } else {
      this.errorMessage = moveResult.errorMessage || 'Invalid move notation. Please check and try again.';
    }
  }

  resetGame(): void {
    this.gameService.resetGame();
    this.moveNotation = '';
    this.errorMessage = '';
  }

  getMoveDescription = (move: any): string => {
    const from = String.fromCharCode('a'.charCodeAt(0) + move.from.col) + (8 - move.from.row);
    const to = String.fromCharCode('a'.charCodeAt(0) + move.to.col) + (8 - move.to.row);
    return `${from}-${to}`;
  }

  handleReplayRequest(lapId: string): void {
    console.log('🎬 GameInfoComponent.handleReplayRequest() called for lapId:', lapId);

    // Reset the game board
    this.gameService.resetGame();

    // Pre-fill the AI lap ID input and switch to the game tab
    this.replayLapId.set(lapId);
    this.setActiveTab('game');

    // Delegate replay streaming to AiGameService so the Stop AI button controls it
    this.aiGameService.startReplay(lapId);
  }
}
