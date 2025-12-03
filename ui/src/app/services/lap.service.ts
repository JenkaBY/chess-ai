import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {LapDto} from '../models/lap.model';

/**
 * Service for managing chess laps/games
 */
@Injectable({
  providedIn: 'root'
})
export class LapService {
  private readonly apiUrl = 'http://localhost:8080/api/v1/chess-laps';

  constructor(private http: HttpClient) {
  }

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

