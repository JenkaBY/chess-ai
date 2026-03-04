import {Injectable} from '@angular/core';
import {GameService} from './game.service';
import {ChessMoveEvent, SseGameEvent, SseService} from './sse.service';
import {ToastService} from './toast.service';
import {Subscription} from 'rxjs';

type ActiveMode = 'ai' | 'replay';

@Injectable({
  providedIn: 'root'
})
export class AiGameService {
  private streamSubscription?: Subscription;
  private currentLapId?: string;
  private activeMode?: ActiveMode;

  constructor(
    private gameService: GameService,
    private sseService: SseService,
    private toastService: ToastService
  ) {
  }

  /**
   * Start listening to AI game stream
   * @param lapId The game/lap ID to stream
   */
  startAiGame(lapId: string): void {
    // Stop any existing stream
    this.stopAiGame();

    this.currentLapId = lapId;
    this.activeMode = 'ai';

    // Subscribe to SSE stream
    this.streamSubscription = this.sseService.connectToGameStream(lapId).subscribe({
      next: (event: SseGameEvent) => {
        if (event.type === 'move') {
          this.handleMoveEvent(event.data);
        } else if (event.type === 'end_game') {
          this.handleEndGameEvent(event.data.message);
        }
      },
      error: (error) => {
        console.error('SSE stream error:', error);
        this.toastService.show('Connection to AI game lost', 'error');
        this.activeMode = undefined;
      },
      complete: () => {
        console.log('SSE stream completed');
        // end_game event already shows a specific toast; no additional notification needed
        this.activeMode = undefined;
      }
    });

    this.toastService.show('AI game started', 'success');
  }

  /**
   * Start replaying a recorded lap
   * @param lapId The lap ID to replay
   * @param intervalMs Delay between moves in milliseconds
   */
  startReplay(lapId: string, intervalMs = 2000): void {
    // Stop any existing stream or replay
    this.stopAiGame();

    this.currentLapId = lapId;
    this.activeMode = 'replay';

    this.toastService.show('Starting replay...', 'info', 3000);

    this.streamSubscription = this.sseService.replayLap(lapId, intervalMs).subscribe({
      next: (event: ChessMoveEvent) => {
        const result = this.gameService.makeMoveByNotation(event.movement);

        if (result.success) {
          this.toastService.show(
            `${event.player}: ${event.movement} - ${event.reason}`,
            event.player === 'WHITE' ? 'info' : 'success',
            2000
          );
        } else {
          console.error('❌ Failed to apply replay move:', event.movement, result.errorMessage);
          this.toastService.show(
            `Replay stopped: Invalid move ${event.movement} - ${result.errorMessage}`,
            'error',
            5000
          );
          this.stopAiGame();
        }
      },
      error: (err) => {
        console.error('💥 Replay error:', err);
        this.toastService.show('Replay failed. Please try again.', 'error', 5000);
        this.activeMode = undefined;
        this.streamSubscription = undefined;
      },
      complete: () => {
        console.log('🏁 Replay completed');
        this.toastService.show('Replay completed!', 'success', 3000);
        this.activeMode = undefined;
        this.streamSubscription = undefined;
      }
    });
  }

  /**
   * Stop listening to AI game stream or replay
   */
  stopAiGame(): void {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
      this.streamSubscription = undefined;
    }
    this.currentLapId = undefined;
    this.activeMode = undefined;
  }

  /**
   * Handle incoming move event from SSE stream
   */
  private handleMoveEvent(event: ChessMoveEvent): void {
    // Make the move using algebraic notation
    const moveResult = this.gameService.makeMoveByNotation(event.movement);

    if (moveResult.success) {
      // Show toast with player and reason
      const toastMessage = `${event.player}: ${event.reason}`;
      const toastType = event.player === 'WHITE' ? 'info' : 'success';
      this.toastService.show(toastMessage, toastType, 10000);
    } else {
      console.error(`Failed to make move: ${event.movement} by reason: ${moveResult.errorMessage}`);
      this.toastService.show(`Invalid move: ${event.movement}. Reason ${moveResult.errorMessage}`, 'error');

      this.stopAiGame();
    }
  }

  /**
   * Handle end_game event from SSE stream.
   * Displays the game-over message and cleans up the active session.
   */
  private handleEndGameEvent(message: string): void {
    console.log('🏁 Game ended:', message);
    this.toastService.show(message, 'warning', 8000);
    this.stopAiGame();
  }

  /**
   * Check if AI game or replay is currently active
   */
  isAiGameActive(): boolean {
    return !!this.streamSubscription && !this.streamSubscription.closed;
  }

  /**
   * Returns true when the active session is a replay
   */
  isReplayActive(): boolean {
    return this.activeMode === 'replay' && this.isAiGameActive();
  }

  /**
   * Get current lap ID
   */
  getCurrentLapId(): string | undefined {
    return this.currentLapId;
  }
}
