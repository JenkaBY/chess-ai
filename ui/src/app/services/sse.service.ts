import {inject, Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs';
import {API_BASE_URL} from '../core/tokens/api-base-url.token';

export interface ChessMoveEvent {
  lapId: number;
  turn: number;
  movement: string;
  player: 'WHITE' | 'BLACK';
  reason: string;
}

/** Emitted when the backend sends an `end_game` SSE event. */
export interface EndGameEvent {
  message: string;
}

/** Discriminated union of all SSE game events. */
export type SseGameEvent =
  | { type: 'move'; data: ChessMoveEvent }
  | { type: 'end_game'; data: EndGameEvent };

@Injectable({
  providedIn: 'root',
})
export class SseService {
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly zone = inject(NgZone);

  /**
   * Connect to SSE endpoint and listen for chess move events.
   * @param lapId The lap/game ID to stream
   * @returns Observable of SSE game events (move or end_game)
   */
  connectToGameStream(lapId: string): Observable<SseGameEvent> {
    return new Observable(observer => {
      const url = `${this.apiBaseUrl}/chess-laps/${lapId}/stream`;
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        this.zone.run(() => {
          try {
            const data = JSON.parse(event.data) as ChessMoveEvent;
            observer.next({type: 'move', data});
          } catch (error) {
            console.error('Error parsing SSE data:', error);
          }
        });
      };

      // Listen for named events (the backend sends events with name="move")
      eventSource.addEventListener('move', (event: MessageEvent) => {
        this.zone.run(() => {
          try {
            const data = JSON.parse(event.data) as ChessMoveEvent;
            observer.next({type: 'move', data});
          } catch (error) {
            console.error('Error parsing move event data:', error);
          }
        });
      });

      // Listen for end_game event – data is a plain string, not JSON
      eventSource.addEventListener('end_game', (event: MessageEvent) => {
        this.zone.run(() => {
          observer.next({type: 'end_game', data: {message: event.data as string}});
          eventSource.close();
          observer.complete();
        });
      });

      eventSource.onerror = () => {
        this.zone.run(() => {
          eventSource.close();
          if (eventSource.readyState === EventSource.CLOSED) {
            observer.complete();
          } else {
            observer.error(new Error('SSE connection error'));
          }
        });
      };

      return () => eventSource.close();
    });
  }

  /**
   * Start replaying a lap via SSE.
   * @param lapId The lap ID to replay
   * @param speedMs Speed in milliseconds between moves (default 1000ms)
   * @returns Observable of chess move events
   */
  replayLap(lapId: string, speedMs: number = 1000): Observable<ChessMoveEvent> {
    return new Observable(observer => {
      const url = `${this.apiBaseUrl}/chess-laps/${lapId}/replay?speedMs=${speedMs}`;
      const eventSource = new EventSource(url);
      let moveCount = 0;
      let isCompleted = false;

      const complete = (): void => {
        if (isCompleted) return;
        isCompleted = true;
        eventSource.close();
        observer.complete();
      };

      const fail = (err: Error): void => {
        if (isCompleted) return;
        isCompleted = true;
        eventSource.close();
        observer.error(err);
      };

      eventSource.addEventListener('move', (event: MessageEvent) => {
        if (isCompleted) return;
        moveCount++;
        this.zone.run(() => {
          try {
            observer.next(JSON.parse(event.data) as ChessMoveEvent);
          } catch (error) {
            console.error('Failed to parse replay move event:', error);
          }
        });
      });

      eventSource.addEventListener('complete', () => {
        this.zone.run(() => complete());
      });

      eventSource.onerror = () => {
        if (isCompleted) return;
        this.zone.run(() => {
          if (eventSource.readyState === EventSource.CLOSED) {
            moveCount > 0
              ? complete()
              : fail(new Error('Failed to connect to replay endpoint'));
          } else if (eventSource.readyState === EventSource.CONNECTING) {
            fail(new Error('Connection lost during replay'));
          }
        });
      };

      return () => {
        if (!isCompleted) {
          isCompleted = true;
          eventSource.close();
        }
      };
    });
  }
}
