/**
 * Food in Forest - Notification Toast System
 * Non-blocking, beautiful toast alerts for real-time user feedback.
 */

class ToastManager {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createContainer());
    } else {
      this.createContainer();
    }
  }

  createContainer() {
    if (!this.container && !document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }
  }

  show(message, type = 'info', duration = 3500) {
    this.createContainer();

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    
    // Icon based on type
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    const iconStr = icons[type] || 'ℹ';

    toast.innerHTML = `
      <span class="toast-icon">${iconStr}</span>
      <span class="toast-message">${this.escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Close notification">&times;</button>
    `;

    // Close button event
    toast.querySelector('.toast-close').addEventListener('click', () => {
      this.dismiss(toast);
    });

    this.container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(toast);
      }, duration);
    }
  }

  dismiss(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }

  success(message, duration) {
    this.show(message, 'success', duration);
  }

  error(message, duration) {
    this.show(message, 'error', duration);
  }

  warning(message, duration) {
    this.show(message, 'warning', duration);
  }

  info(message, duration) {
    this.show(message, 'info', duration);
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

// Global Toast instance
window.Toast = new ToastManager();
