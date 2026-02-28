import {InjectionToken} from '@angular/core';
import {environment} from '../../../environments/environment';

/**
 * Injection token for the API base URL.
 * The host is environment-specific (`environment.apiHost`);
 * the `/api/v1` path prefix is fixed here so it never needs to be repeated.
 * Override this token in tests to change the base URL.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => `${environment.apiHost}/api/v1`,
});

