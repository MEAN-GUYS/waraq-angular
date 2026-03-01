import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  template: `
    @if (notificationService.current(); as n) {
      <div class="notification-container">
        <div class="notification-toast" [class]="n.type">
          {{ n.message }}
        </div>
      </div>
    }
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
      animation: slideIn 0.3s ease-out;
    }
    .notification-toast {
      padding: 1rem 2rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 250px;
      text-align: center;
    }
    .success { background-color: #2f855a; }
    .error { background-color: #e53e3e; }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
}
