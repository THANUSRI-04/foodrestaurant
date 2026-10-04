/**
 * Food in Forest - Common Utilities
 */

const Utils = {
  // Format currency in Indian Rupees
  formatCurrency(amount) {
    const num = Number(amount) || 0;
    return '₹' + num.toLocaleString('en-IN', {
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    });
  },

  // Format ISO Date or timestamp
  formatDate(dateVal) {
    if (!dateVal) return 'N/A';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return dateVal;
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateVal;
    }
  },

  // Get URL Query Parameter
  getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  // Escape HTML to prevent XSS
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // Fallback image handler
  getFoodFallbackImage() {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
  },

  // Compress & read image file as Base64 Data URL for fast storage and instant preview
  compressImageFile(file, maxWidth = 1000, maxHeight = 1000, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve('');
      if (!file.type.startsWith('image/')) {
        return reject(new Error('Selected file is not an image'));
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  // Setup Modern Image Picker Component with Device Upload & URL
  setupImagePicker(config) {
    const {
      containerId,
      hiddenInputId,
      initialUrl = '',
      placeholder = 'Select image from device or enter URL'
    } = config;

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="image-picker-component">
        <div class="image-picker-tabs">
          <button type="button" class="image-picker-tab-btn active" data-tab="device">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
            <span>Device / Gallery</span>
          </button>
          <button type="button" class="image-picker-tab-btn" data-tab="url">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            <span>Image Web URL</span>
          </button>
        </div>

        <!-- Tab 1: Device Upload -->
        <div class="image-tab-content" data-tab-content="device">
          <label class="image-upload-dropzone">
            <input type="file" class="image-file-input" accept="image/*" style="display: none;">
            <svg class="image-upload-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
            <div style="font-weight: 600; font-size: 0.9rem; color: var(--color-forest-dark);">Click or Tap to Choose from Device / Gallery</div>
            <div style="font-size: 0.78rem; color: var(--color-text-muted);">Supports JPG, PNG, WEBP (auto-optimized)</div>
          </label>
        </div>

        <!-- Tab 2: URL Input -->
        <div class="image-tab-content" data-tab-content="url" style="display: none;">
          <input type="url" class="form-control image-url-input" placeholder="https://images.unsplash.com/..." value="${initialUrl || ''}">
        </div>

        <input type="hidden" id="${hiddenInputId}" name="${hiddenInputId}" value="${initialUrl || ''}">

        <!-- Preview Thumbnail -->
        <div class="image-preview-wrapper" style="${initialUrl ? 'display: inline-block;' : 'display: none;'}">
          <img class="image-preview-thumb" src="${initialUrl || ''}" alt="Image preview">
          <button type="button" class="image-preview-remove" title="Remove image" aria-label="Remove image">&times;</button>
        </div>
      </div>
    `;

    const hiddenInput = document.getElementById(hiddenInputId);
    const tabBtns = container.querySelectorAll('.image-picker-tab-btn');
    const tabContents = container.querySelectorAll('.image-tab-content');
    const fileInput = container.querySelector('.image-file-input');
    const urlInput = container.querySelector('.image-url-input');
    const previewWrapper = container.querySelector('.image-preview-wrapper');
    const previewThumb = container.querySelector('.image-preview-thumb');
    const removeBtn = container.querySelector('.image-preview-remove');

    // Tab switcher
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        tabContents.forEach(content => {
          content.style.display = content.getAttribute('data-tab-content') === tab ? 'block' : 'none';
        });
      });
    });

    // File selection handler
    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        try {
          if (window.Toast) Toast.info('Processing & optimizing image...');
          const compressedDataUrl = await Utils.compressImageFile(file);
          if (compressedDataUrl) {
            hiddenInput.value = compressedDataUrl;
            previewThumb.src = compressedDataUrl;
            previewWrapper.style.display = 'inline-block';
            if (urlInput) urlInput.value = '';
            if (window.Toast) Toast.success('Image selected from device!');
          }
        } catch (err) {
          console.error('Error processing device image:', err);
          if (window.Toast) Toast.error('Could not process image file.');
        }
      });
    }

    // URL input handler
    if (urlInput) {
      urlInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        hiddenInput.value = val;
        if (val) {
          previewThumb.src = val;
          previewWrapper.style.display = 'inline-block';
        } else {
          previewWrapper.style.display = 'none';
        }
      });
    }

    // Remove image handler
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        hiddenInput.value = '';
        if (fileInput) fileInput.value = '';
        if (urlInput) urlInput.value = '';
        previewThumb.src = '';
        previewWrapper.style.display = 'none';
      });
    }
  },

  // Generate unique Order ID
  generateOrderId() {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `FIF-${Date.now().toString().slice(-4)}${rand}`;
  },


  // Generate unique Food or Category ID
  generateId(prefix = 'item') {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
  },

  // Show/Hide page spinner
  showLoading(selector = '#loading-spinner') {
    const el = document.querySelector(selector);
    if (el) el.style.display = 'flex';
  },

  hideLoading(selector = '#loading-spinner') {
    const el = document.querySelector(selector);
    if (el) el.style.display = 'none';
  },

  // Format status badge HTML
  getStatusBadgeHtml(status) {
    const statusMap = {
      'Pending': 'badge-pending',
      'Confirmed': 'badge-confirmed',
      'Preparing': 'badge-preparing',
      'Ready': 'badge-ready',
      'Out for Delivery': 'badge-delivery',
      'Delivered': 'badge-delivered',
      'Cancelled': 'badge-cancelled'
    };

    const cls = statusMap[status] || 'badge-default';
    return `<span class="status-badge ${cls}">${Utils.escapeHtml(status || 'Pending')}</span>`;
  },

  // Veg/Non-Veg icon indicator HTML
  getDietIndicatorHtml(isVeg) {
    if (isVeg) {
      return `<span class="diet-badge diet-veg" title="Vegetarian"><span class="diet-dot"></span> Veg</span>`;
    }
    return `<span class="diet-badge diet-nonveg" title="Non-Vegetarian"><span class="diet-dot"></span> Non-Veg</span>`;
  },

  // Spice level indicator
  getSpiceIndicatorHtml(spicy, level = '') {
    if (!spicy) return '';
    const lvlText = level ? ` (${level})` : '';
    return `<span class="spice-badge" title="Spicy">🌶️ Spicy${lvlText}</span>`;
  },

  // Active status badge
  getActiveBadgeHtml(isActive) {
    return isActive 
      ? `<span class="status-badge badge-active">Active</span>`
      : `<span class="status-badge badge-inactive">Inactive</span>`;
  },

  // Availability badge
  getAvailabilityBadgeHtml(isAvailable) {
    return isAvailable
      ? `<span class="badge-instock">In Stock</span>`
      : `<span class="badge-outstock">Unavailable</span>`;
  },

  // Setup Password Visibility Toggles across all forms
  setupPasswordToggles() {
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('.password-toggle-btn');
      if (!toggleBtn) return;
      
      e.preventDefault();
      const targetId = toggleBtn.getAttribute('data-target');
      const input = targetId ? document.getElementById(targetId) : toggleBtn.previousElementSibling;
      
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        toggleBtn.innerHTML = '👁️‍🗨️'; // or open eye
        toggleBtn.setAttribute('title', 'Hide password');
      } else {
        input.type = 'password';
        toggleBtn.innerHTML = '👁️';
        toggleBtn.setAttribute('title', 'Show password');
      }
    });
  }
};

// Initialize password toggles on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Utils.setupPasswordToggles();
});


if (typeof window !== 'undefined') {
  window.Utils = Utils;
}
