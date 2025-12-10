import {ChangeDetectionStrategy, Component, OnDestroy, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GameService} from '../../services/game.service';
import {GameTabComponent} from '../game-tab/game-tab.component';
import {HistoryTabComponent} from '../history-tab/history-tab.component';
import {LapsTabComponent} from '../laps-tab/laps-tab.component';
import {SseService} from '../../services/sse.service';
import {ToastService} from '../../services/toast.service';
import {Subscription} from 'rxjs';

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
  activeTab = signal<'game' | 'history' | 'laps'>('game');

  private replaySubscription?: Subscription;

  constructor(
    protected gameService: GameService,
    private sseService: SseService,
    private toastService: ToastService
  ) {
  }

  ngOnDestroy(): void {
    console.log('🔴 GameInfoComponent destroyed');
    // Clean up replay subscription
    if (this.replaySubscription) {
      console.log('⏹️ Unsubscribing from replay on GameInfo destroy');
      this.replaySubscription.unsubscribe();
    }
  }

  setActiveTab(tab: 'game' | 'history' | 'laps'): void {
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

    // Prevent multiple concurrent replays
    if (this.replaySubscription && !this.replaySubscription.closed) {
      console.warn('⚠️ Replay already in progress, ignoring new request');
      this.toastService.show('Replay already in progress', 'warning', 2000);
      return;
    }

    // Stop any existing replay (safety check)
    if (this.replaySubscription) {
      console.log('⏹️ Stopping existing replay subscription');
      this.replaySubscription.unsubscribe();
      this.replaySubscription = undefined;
    }

    // Reset the game board
    console.log('🔄 Resetting game board');
    this.gameService.resetGame();

    // Switch to game tab to show the replay
    console.log('🔄 Switching to game tab');
    this.setActiveTab('game');

    // Show notification
    this.toastService.show('Starting replay...', 'info', 3000);

    console.log('📡 Creating replay subscription in GameInfoComponent for lapId:', lapId);

    this.replaySubscription = this.sseService.replayLap(lapId, 2000).subscribe({
      next: (moveEvent) => {
        console.log('✅ Replay move received in GameInfoComponent:', moveEvent);

        // Make the move on the board
        const result = this.gameService.makeMoveByNotation(moveEvent.movement);

        if (result.success) {
          console.log('✅ Move applied successfully');
          // Show move info as toast
          this.toastService.show(
            `${moveEvent.player}: ${moveEvent.movement} - ${moveEvent.reason}`,
            moveEvent.player === 'WHITE' ? 'info' : 'success',
            2000
          );
        } else {
          console.error('❌ Failed to apply move:', moveEvent.movement, result.errorMessage);
          console.error('🛑 Stopping replay due to invalid move');

          this.toastService.show(
            `Replay stopped: Invalid move ${moveEvent.movement} - ${result.errorMessage}`,
            'error',
            5000
          );

          // Stop the replay by unsubscribing
          if (this.replaySubscription) {
            this.replaySubscription.unsubscribe();
            this.replaySubscription = undefined;
          }
        }
      },
      error: (err) => {
        console.error('💥 Replay subscription error in GameInfoComponent:', err);
        this.toastService.show('Replay failed. Please try again.', 'error', 5000);
        console.log('🧹 Cleaning up replay subscription after error');
        this.replaySubscription = undefined;
      },
      complete: () => {
        console.log('🏁 Replay subscription completed in GameInfoComponent');
        this.toastService.show('Replay completed!', 'success', 3000);
        console.log('🧹 Cleaning up replay subscription after completion');
        this.replaySubscription = undefined;
      }
    });

    console.log('📡 Replay subscription created:', this.replaySubscription ? 'SUCCESS' : 'FAILED');
    console.log('📡 Subscription closed state:', this.replaySubscription?.closed);
  }
}
