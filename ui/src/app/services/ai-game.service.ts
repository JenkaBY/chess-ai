import {Injectable} from '@angular/core';
import {GameService} from './game.service';
import {ChessMoveEvent, SseService} from './sse.service';
import {ToastService} from './toast.service';
import {Subscription} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AiGameService {
  private streamSubscription?: Subscription;
  private currentLapId?: string;

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

    // Subscribe to SSE stream
    this.streamSubscription = this.sseService.connectToGameStream(lapId).subscribe({
      next: (event: ChessMoveEvent) => {
        this.handleMoveEvent(event);
      },
      error: (error) => {
        console.error('SSE stream error:', error);
        this.toastService.show('Connection to AI game lost', 'error');
      },
      complete: () => {
        console.log('SSE stream completed');
        this.toastService.show('AI game ended', 'info');
      }
    });

    this.toastService.show('AI game started', 'success');
  }

  /**
   * Stop listening to AI game stream
   */
  stopAiGame(): void {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
      this.streamSubscription = undefined;
    }
    this.currentLapId = undefined;
  }

  /**
   * Handle incoming move event from SSE stream
   */
  private handleMoveEvent(event: ChessMoveEvent): void {
    console.log('Received move event:', event);

    // Make the move using algebraic notation
    const success = this.gameService.makeMoveByNotation(event.movement);

    if (success) {
      // Show toast with player and reason
      const toastMessage = `${event.player}: ${event.reason}`;
      const toastType = event.player === 'WHITE' ? 'info' : 'success';
      this.toastService.show(toastMessage, toastType, 6000);
    } else {
      console.error('Failed to make move:', event.movement);
      this.toastService.show(`Invalid move: ${event.movement}`, 'error');
    }
  }

  /**
   * Check if AI game is currently active
   */
  isAiGameActive(): boolean {
    return !!this.streamSubscription && !this.streamSubscription.closed;
  }

  /**
   * Get current lap ID
   */
  getCurrentLapId(): string | undefined {
    return this.currentLapId;
  }
}

