import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import type { Notification } from '../../services/app-state.service';

@Component({
  selector: 'app-notification-container',
  imports: [CommonModule],
  template: `
    <div class="notification-container" [class]="'position-' + position">
      <div 
        *ngFor="let notification of notifications" 
        class="notification"
        [class]="'notification-' + notification.type"
        [class.notification-unread]="!notification.read"
      >
        <div class="notification-content">
          <div class="notification-header">
            <h4 class="notification-title">{{ notification.title }}</h4>
            <button 
              class="notification-close"
              (click)="removeNotification(notification.id)"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
          <p class="notification-message">{{ notification.message }}</p>
          <div class="notification-meta">
            <small class="notification-time">{{ formatTime(notification.timestamp) }}</small>
            <button 
              *ngIf="!notification.read"
              class="notification-mark-read"
              (click)="markAsRead(notification.id)"
            >
              Mark as read
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      z-index: 9999;
      max-width: 400px;
      pointer-events: none;
    }

    .position-top-right {
      top: 1rem;
      right: 1rem;
    }

    .position-top-left {
      top: 1rem;
      left: 1rem;
    }

    .position-bottom-right {
      bottom: 1rem;
      right: 1rem;
    }

    .position-bottom-left {
      bottom: 1rem;
      left: 1rem;
    }

    .position-top-center {
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
    }

    .notification {
      background: var(--background-primary, #ffffff);
      border: 1px solid var(--border-color, #dee2e6);
      border-radius: 0.5rem;
      box-shadow: var(--shadow, 0 0.5rem 1rem rgba(0, 0, 0, 0.15));
      margin-bottom: 0.5rem;
      padding: 1rem;
      pointer-events: auto;
      opacity: 0.95;
      transition: all 0.3s ease;
      animation: slideIn 0.3s ease-out;
    }

    .notification:hover {
      opacity: 1;
      transform: translateX(-2px);
    }

    .notification-success {
      border-left: 4px solid var(--success-color, #28a745);
    }

    .notification-error {
      border-left: 4px solid var(--error-color, #dc3545);
    }

    .notification-warning {
      border-left: 4px solid var(--warning-color, #ffc107);
    }

    .notification-info {
      border-left: 4px solid var(--info-color, #17a2b8);
    }

    .notification-unread {
      border-width: 2px;
      font-weight: 500;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .notification-title {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
      color: var(--text-primary, #212529);
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-secondary, #6c757d);
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-close:hover {
      color: var(--text-primary, #212529);
    }

    .notification-message {
      margin: 0 0 0.75rem 0;
      color: var(--text-secondary, #6c757d);
      line-height: 1.4;
    }

    .notification-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .notification-time {
      color: var(--text-muted, #868e96);
      font-size: 0.875rem;
    }

    .notification-mark-read {
      background: none;
      border: 1px solid var(--primary-color, #007bff);
      color: var(--primary-color, #007bff);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .notification-mark-read:hover {
      background: var(--primary-color, #007bff);
      color: white;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 0.95;
      }
    }

    /* Dark theme adjustments */
    :host-context(.dark-theme) .notification {
      background: var(--background-secondary, #2d2d2d);
      border-color: var(--border-color, #404040);
    }

    /* High contrast adjustments */
    :host-context(.high-contrast) .notification {
      border-width: 3px;
    }

    :host-context(.high-contrast) .notification-title {
      font-weight: 700;
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .notification {
        animation: none;
        transition: none;
      }

      .notification:hover {
        transform: none;
      }
    }

    :host-context(.reduced-motion) .notification {
      animation: none;
      transition: none;
    }

    :host-context(.reduced-motion) .notification:hover {
      transform: none;
    }
  `]
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' = 'top-right';
  
  private subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications.slice(-5); // Show only last 5 notifications
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeNotification(id: string): void {
    this.notificationService.remove(id);
  }

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id);
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  }
}
