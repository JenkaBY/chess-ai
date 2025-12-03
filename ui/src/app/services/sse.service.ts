import {Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs';

export interface ChessMoveEvent {
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
}

