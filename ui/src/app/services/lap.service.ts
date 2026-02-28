import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LapDto} from '../models/lap.model';
import {API_BASE_URL} from '../core/tokens/api-base-url.token';

/**
 * Service for managing chess laps/games
 */
@Injectable({
  providedIn: 'root',
})
export class LapService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${inject(API_BASE_URL)}/chess-laps`;

  /**
   * Get latest laps with pagination
   * @param page Page number (0-based)
   * @param size Number of items per page
   */
  getLaps(page: number = 0, size: number = 10): Observable<LapDto[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'updatedAt,desc'); // Sort by most recent

    return this.http.get<LapDto[]>(this.apiUrl, {params});
  }
}
