import {InjectionToken} from '@angular/core';
import {environment} from '../../../environments/environment';

/**
 * Feature flag: controls whether the live AI game streaming feature is enabled.
 * When `false`, clicking "Start AI" shows an informational modal instead of
 * connecting to the backend stream.
 *
 * Set to `true` in `environment.ts` (local dev) and `false` in production
 * environments until the feature is stable.
 */
export const ENABLE_LIVE_AI_GAME = new InjectionToken<boolean>('ENABLE_LIVE_AI_GAME', {
  providedIn: 'root',
  factory: () => environment.enableLiveAiGame,
});

