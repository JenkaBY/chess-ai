import {Injectable, signal} from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastIdCounter = 0;
  public toasts = signal<Toast[]>([]);

  /**
   * Show a toast notification
   * @param message The message to display
   * @param type The type of toast (default: 'info')
   * @param duration Duration in milliseconds (default: 5000)
   */
  show(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 5000): void {
    const id = this.toastIdCounter++;
    const toast: Toast = {id, message, type};

    this.toasts.update(toasts => [...toasts, toast]);

    // Auto-remove after duration
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  /**
   * Remove a toast by ID
   */
  remove(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  /**
   * Clear all toasts
   */
  clear(): void {
    this.toasts.set([]);
  }
}

