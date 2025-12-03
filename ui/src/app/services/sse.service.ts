import {Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs';

export interface ChessMoveEvent {
  lapId: number,
  turn: number;
  movement: string;
  player: 'WHITE' | 'BLACK';
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class SseService {
  constructor(private zone: NgZone) {
  }

  /**
   * Connect to SSE endpoint and listen for chess move events
   * @param lapId The lap/game ID to stream
   * @returns Observable of chess move events
   */
  connectToGameStream(lapId: string): Observable<ChessMoveEvent> {
    return new Observable(observer => {
      const url = `http://localhost:8080/api/v1/chess-laps/${lapId}/stream`;
      console.log('Connecting to SSE endpoint:', url);

      const eventSource = new EventSource(url);

      eventSource.onopen = (event) => {
        console.log('SSE connection opened:', event);
      };

      eventSource.onmessage = (event) => {
        console.log('SSE message received:', event);
        this.zone.run(() => {
          try {
            const data: ChessMoveEvent = JSON.parse(event.data);
            console.log('Parsed SSE data:', data);
            observer.next(data);
          } catch (error) {
            console.error('Error parsing SSE data:', error, 'Raw data:', event.data);
          }
        });
      };

      // Listen for named events (the backend sends events with name="move")
      eventSource.addEventListener('move', (event: any) => {
        console.log('SSE move event received:', event);
        this.zone.run(() => {
          try {
            const data: ChessMoveEvent = JSON.parse(event.data);
            console.log('Parsed move data:', data);
            observer.next(data);
          } catch (error) {
            console.error('Error parsing move event data:', error, 'Raw data:', event.data);
          }
        });
      });

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        console.error('EventSource readyState:', eventSource.readyState);
        this.zone.run(() => {
          if (eventSource.readyState === EventSource.CLOSED) {
            console.log('SSE connection closed by server');
            observer.complete();
          } else {
            console.error('SSE connection error occurred');
            observer.error(error);
          }
          eventSource.close();
        });
      };

      // Cleanup function
      return () => {
        console.log('Closing SSE connection');
        eventSource.close();
      };
    });
  }

  /**
   * Start replaying a lap via SSE
   * @param lapId The lap ID to replay
   * @param speedMs Speed in milliseconds between moves (default 1000ms = 1 second)
   * @returns Observable of chess move events
   */
  replayLap(lapId: string, speedMs: number = 1000): Observable<ChessMoveEvent> {
    console.log('🎬 Starting replay for lap:', lapId, 'with speed:', speedMs, 'ms');
    return new Observable(observer => {
      const url = `http://localhost:8080/api/v1/chess-laps/${lapId}/replay?speedMs=${speedMs}`;
      console.log('🔌 Connecting to replay SSE endpoint:', url);

      const eventSource = new EventSource(url);
      let moveCount = 0;
      let isConnected = false;
      let isCompleted = false; // Flag to prevent duplicate completion/reconnection

      eventSource.onopen = (event) => {
        isConnected = true;
        console.log('✅ Replay SSE connection opened successfully:', event);
        console.log('EventSource readyState:', eventSource.readyState, '(OPEN=1)');
      };

      // Listen for 'move' events from replay endpoint
      eventSource.addEventListener('move', (event: MessageEvent) => {
        if (isCompleted) {
          console.warn('⚠️ Received move event after completion, ignoring');
          return;
        }

        moveCount++;
        console.log(`🎯 Replay move #${moveCount} event received`);
        console.log('📦 Event data:', event.data);

        this.zone.run(() => {
          try {
            const moveData = JSON.parse(event.data) as ChessMoveEvent;
            console.log(`♟️ Parsed move #${moveCount} - Turn ${moveData.turn}: ${moveData.player} ${moveData.movement}`);
            observer.next(moveData);
          } catch (error) {
            console.error('❌ Failed to parse replay move event:', error);
            console.error('Raw data:', event.data);
          }
        });
      });

      // Listen for 'complete' event to know when replay is finished
      eventSource.addEventListener('complete', () => {
        if (isCompleted) {
          console.warn('⚠️ Duplicate complete event received, ignoring');
          return;
        }

        isCompleted = true;
        console.log('🏁 Replay complete event received - total moves:', moveCount);
        this.zone.run(() => {
          console.log('🏁 Completing observer and closing connection');
          observer.complete();
          eventSource.close();
        });
      });

      eventSource.onerror = (error) => {
        if (isCompleted) {
          console.log('ℹ️ Error event after completion (expected), ignoring');
          return;
        }

        console.error('💥 Replay SSE error occurred:', error);
        console.error('EventSource readyState:', eventSource.readyState, '(CONNECTING=0, OPEN=1, CLOSED=2)');
        console.error('Was connected:', isConnected);
        console.error('Moves received before error:', moveCount);

        this.zone.run(() => {
          if (eventSource.readyState === EventSource.CLOSED) {
            console.log('🔌 Replay SSE connection closed by server');
            if (moveCount === 0 && !isConnected) {
              console.error('❌ Connection failed - server may be unreachable or endpoint invalid');
              isCompleted = true;
              observer.error(new Error('Failed to connect to replay endpoint'));
              eventSource.close();
            } else {
              // Connection was closed after receiving some moves (likely normal completion)
              console.log('ℹ️ Connection closed after receiving', moveCount, 'moves - treating as normal completion');
              if (!isCompleted) {
                isCompleted = true;
                observer.complete();
              }
              eventSource.close();
            }
          } else if (eventSource.readyState === EventSource.CONNECTING) {
            // EventSource is trying to reconnect, prevent this for replay
            console.log('⛔ Preventing auto-reconnection for replay');
            isCompleted = true;
            observer.error(new Error('Connection lost during replay'));
            eventSource.close();
          }
        });
      };

      // Cleanup function
      return () => {
        console.log('🛑 Unsubscribed from replay - closing connection');
        console.log('   Total moves received:', moveCount);
        console.log('   Connection state:', eventSource.readyState);
        if (!isCompleted) {
          isCompleted = true;
          eventSource.close();
        }
      };
    });
  }
}

