import { Injectable, signal } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  current = signal<Notification | null>(null);
  private timeoutId?: ReturnType<typeof setTimeout>;

  show(message: string, type: 'success' | 'error' = 'error', duration = 3000): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.current.set({ message, type });
    this.timeoutId = setTimeout(() => {
      this.current.set(null);
      this.timeoutId = undefined;
    }, duration);
  }

  dismiss(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.current.set(null);
  }
}
