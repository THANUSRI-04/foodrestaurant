/**
 * Food in Forest - Shopping Cart Manager
 * Manages client cart state, localStorage persistence, discounts, and real-time calculations.
 */

const Cart = {
  storageKey: 'fif_forest_cart',
  discountStorageKey: 'fif_applied_offer',
  
  items: [],
  appliedOffer: null,

  init() {
    this.loadCart();
    this.updateCartBadge();
    this.bindEvents();
    
    // If on cart or checkout page, render UI
    if (document.getElementById('cart-items-container')) {
      this.renderCartPage();
    }
    if (document.getElementById('checkout-summary-container')) {
      this.renderCheckoutSummary();
    }
  },

  loadCart() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      this.items = stored ? JSON.parse(stored) : [];
      const storedOffer = localStorage.getItem(this.discountStorageKey);
      this.appliedOffer = storedOffer ? JSON.parse(storedOffer) : null;
    } catch (e) {
      this.items = [];
      this.appliedOffer = null;
    }
  },

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      if (this.appliedOffer) {
        localStorage.setItem(this.discountStorageKey, JSON.stringify(this.appliedOffer));
      } else {
        localStorage.removeItem(this.discountStorageKey);
      }
      this.updateCartBadge();
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  },

  addItem(food, quantity = 1) {
    if (!food || !food.id) return;
    
    if (food.available === false) {
      Toast.warning('This item is currently unavailable.');
      return;
    }

    const qty = parseInt(quantity, 10) || 1;
    const existingIndex = this.items.findIndex(item => item.id === food.id);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += qty;
    } else {
      this.items.push({
        id: food.id,
        name: food.name,
        price: Number(food.price) || 0,
        image: food.image || Utils.getFoodFallbackImage(),
        veg: Boolean(food.veg),
        quantity: qty
      });
    }

    this.saveCart();
    Toast.success(`Added "${food.name}" to cart!`);

    // If on cart page, re-render
    if (document.getElementById('cart-items-container')) {
      this.renderCartPage();
    }
  },

  updateQuantity(foodId, newQuantity) {
    const qty = parseInt(newQuantity, 10);
    const index = this.items.findIndex(item => item.id === foodId);

    if (index > -1) {
      if (qty <= 0) {
        this.removeItem(foodId);
      } else {
        this.items[index].quantity = qty;
        this.saveCart();
        if (document.getElementById('cart-items-container')) {
          this.renderCartPage();
        }
        if (document.getElementById('checkout-summary-container')) {
          this.renderCheckoutSummary();
        }
      }
    }
  },

  removeItem(foodId) {
    const item = this.items.find(i => i.id === foodId);
    this.items = this.items.filter(i => i.id !== foodId);
    this.saveCart();
    if (item) {
      Toast.info(`Removed "${item.name}" from cart.`);
    }

    if (document.getElementById('cart-items-container')) {
      this.renderCartPage();
    }
    if (document.getElementById('checkout-summary-container')) {
      this.renderCheckoutSummary();
    }
  },

  clearCart() {
    this.items = [];
    this.appliedOffer = null;
    this.saveCart();
  },

  getItemCount() {
    return this.items.reduce((total, item) => total + (item.quantity || 1), 0);
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  },

  getDeliveryCharge(subtotal) {
    if (subtotal === 0) return 0;
    // Free delivery over ₹500
    return subtotal >= 500 ? 0 : 40;
  },

  getDiscount(subtotal) {
    if (!this.appliedOffer || subtotal === 0) return 0;
    const minOrder = Number(this.appliedOffer.minOrderAmount) || 0;
    if (subtotal < minOrder) return 0;
    
    const pct = Number(this.appliedOffer.discountPercentage) || 0;
    return Math.round(((subtotal * pct) / 100) * 100) / 100;
  },

  getCalculations() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount(subtotal);
    const delivery = this.getDeliveryCharge(subtotal);
    const total = Math.max(0, Math.round((subtotal - discount + delivery) * 100) / 100);

    return {
      subtotal,
      discount,
      deliveryCharge: delivery,
      total,
      itemCount: this.getItemCount()
    };
  },

  async applyPromoCode(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) {
      Toast.warning('Please enter a promo code.');
      return false;
    }

    const subtotal = this.getSubtotal();
    if (subtotal === 0) {
      Toast.warning('Your cart is empty.');
      return false;
    }

    try {
      // Check Firebase offers table
      const offers = await DB.get('offers');
      if (!offers) {
        Toast.error('No active offers found.');
        return false;
      }

      let matchedOffer = null;
      for (const key in offers) {
        const offer = offers[key];
        if (offer.promoCode && offer.promoCode.toUpperCase() === cleanCode && offer.active !== false) {
          matchedOffer = offer;
          break;
        }
      }

      if (!matchedOffer) {
        Toast.error('Invalid or expired promo code.');
        return false;
      }

      const minOrder = Number(matchedOffer.minOrderAmount) || 0;
      if (subtotal < minOrder) {
        Toast.warning(`This promo code requires a minimum order of ${Utils.formatCurrency(minOrder)}.`);
        return false;
      }

      this.appliedOffer = matchedOffer;
      this.saveCart();
      Toast.success(`Promo code "${cleanCode}" applied! ${matchedOffer.discountPercentage}% OFF.`);
      
      if (document.getElementById('cart-items-container')) {
        this.renderCartPage();
      }
      if (document.getElementById('checkout-summary-container')) {
        this.renderCheckoutSummary();
      }
      return true;
    } catch (e) {
      console.error('Promo code error:', e);
      Toast.error('Could not apply promo code. Please try again.');
      return false;
    }
  },

  removePromoCode() {
    this.appliedOffer = null;
    this.saveCart();
    Toast.info('Promo code removed.');
    if (document.getElementById('cart-items-container')) {
      this.renderCartPage();
    }
    if (document.getElementById('checkout-summary-container')) {
      this.renderCheckoutSummary();
    }
  },

  updateCartBadge() {
    const badge = document.getElementById('cart-count-badge');
    const mobileBadge = document.getElementById('mobile-cart-count-badge');
    const count = this.getItemCount();

    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
    if (mobileBadge) {
      mobileBadge.textContent = count;
      mobileBadge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  },

  renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const emptyState = document.getElementById('cart-empty-state');
    const summaryContainer = document.getElementById('cart-summary-section');

    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (summaryContainer) summaryContainer.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (summaryContainer) summaryContainer.style.display = 'block';

    let html = `
      <div class="cart-table-wrapper">
        <table class="cart-table">
          <thead>
            <tr>
              <th>Dish</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
    `;

    this.items.forEach(item => {
      const lineTotal = (item.price || 0) * (item.quantity || 1);
      html += `
        <tr class="cart-item-row" data-id="${item.id}">
          <td class="cart-item-info">
            <img src="${Utils.escapeHtml(item.image)}" alt="${Utils.escapeHtml(item.name)}" class="cart-item-thumb" onerror="this.src='${Utils.getFoodFallbackImage()}'">
            <div class="cart-item-details">
              <h4>${Utils.escapeHtml(item.name)}</h4>
              <div>${Utils.getDietIndicatorHtml(item.veg)}</div>
            </div>
          </td>
          <td class="cart-item-price">${Utils.formatCurrency(item.price)}</td>
          <td class="cart-item-quantity">
            <div class="quantity-controller">
              <button class="qty-btn btn-qty-minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
              <input type="number" class="qty-input" value="${item.quantity}" min="1" max="99" data-id="${item.id}">
              <button class="qty-btn btn-qty-plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
          </td>
          <td class="cart-item-subtotal">${Utils.formatCurrency(lineTotal)}</td>
          <td class="cart-item-action">
            <button class="btn-remove-item" data-id="${item.id}" title="Remove item">&times;</button>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
    this.renderCartSummary();
  },

  renderCartSummary() {
    const subtotalEl = document.getElementById('cart-subtotal-val');
    const discountEl = document.getElementById('cart-discount-val');
    const deliveryEl = document.getElementById('cart-delivery-val');
    const totalEl = document.getElementById('cart-total-val');
    const promoMsgEl = document.getElementById('applied-promo-info');

    const calc = this.getCalculations();

    if (subtotalEl) subtotalEl.textContent = Utils.formatCurrency(calc.subtotal);
    if (deliveryEl) {
      deliveryEl.textContent = calc.deliveryCharge === 0 ? 'FREE' : Utils.formatCurrency(calc.deliveryCharge);
    }
    if (discountEl) {
      discountEl.textContent = calc.discount > 0 ? `-${Utils.formatCurrency(calc.discount)}` : '₹0';
    }
    if (totalEl) totalEl.textContent = Utils.formatCurrency(calc.total);

    if (promoMsgEl) {
      if (this.appliedOffer) {
        promoMsgEl.innerHTML = `
          <div class="applied-promo-tag">
            <span>🎉 Promo <strong>${Utils.escapeHtml(this.appliedOffer.promoCode)}</strong> (${this.appliedOffer.discountPercentage}% OFF) applied</span>
            <button class="btn-remove-promo" id="btn-remove-promo">Remove</button>
          </div>
        `;
        const removePromoBtn = document.getElementById('btn-remove-promo');
        if (removePromoBtn) {
          removePromoBtn.addEventListener('click', () => this.removePromoCode());
        }
      } else {
        promoMsgEl.innerHTML = '';
      }
    }
  },

  renderCheckoutSummary() {
    const container = document.getElementById('checkout-summary-container');
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `
        <div class="empty-checkout-notice">
          <p>Your cart is empty.</p>
          <a href="menu.html" class="btn btn-primary">Return to Menu</a>
        </div>
      `;
      const placeOrderBtn = document.getElementById('place-order-btn');
      if (placeOrderBtn) placeOrderBtn.disabled = true;
      return;
    }

    const calc = this.getCalculations();

    let itemsHtml = `<div class="checkout-items-list">`;
    this.items.forEach(item => {
      itemsHtml += `
        <div class="checkout-item-row">
          <div class="checkout-item-name">
            <strong>${Utils.escapeHtml(item.name)}</strong> × ${item.quantity}
          </div>
          <div class="checkout-item-price">
            ${Utils.formatCurrency((item.price || 0) * item.quantity)}
          </div>
        </div>
      `;
    });
    itemsHtml += `</div>`;

    let summaryHtml = `
      <div class="checkout-summary-box">
        <h3>Order Summary (${calc.itemCount} items)</h3>
        ${itemsHtml}
        <hr class="summary-divider">
        <div class="summary-line">
          <span>Subtotal</span>
          <span>${Utils.formatCurrency(calc.subtotal)}</span>
        </div>
        <div class="summary-line">
          <span>Discount</span>
          <span class="text-success">${calc.discount > 0 ? `-${Utils.formatCurrency(calc.discount)}` : '₹0'}</span>
        </div>
        <div class="summary-line">
          <span>Delivery Charges</span>
          <span>${calc.deliveryCharge === 0 ? '<strong class="text-success">FREE</strong>' : Utils.formatCurrency(calc.deliveryCharge)}</span>
        </div>
        <hr class="summary-divider">
        <div class="summary-line total-line">
          <strong>Final Total</strong>
          <strong class="total-price">${Utils.formatCurrency(calc.total)}</strong>
        </div>
      </div>
    `;

    container.innerHTML = summaryHtml;
  },

  bindEvents() {
    // Delegate quantity increment/decrement/remove on cart page
    document.addEventListener('click', (e) => {
      // Plus button
      if (e.target.matches('.btn-qty-plus')) {
        const id = e.target.getAttribute('data-id');
        const item = this.items.find(i => i.id === id);
        if (item) this.updateQuantity(id, item.quantity + 1);
      }
      // Minus button
      if (e.target.matches('.btn-qty-minus')) {
        const id = e.target.getAttribute('data-id');
        const item = this.items.find(i => i.id === id);
        if (item) this.updateQuantity(id, item.quantity - 1);
      }
      // Remove item
      if (e.target.matches('.btn-remove-item')) {
        const id = e.target.getAttribute('data-id');
        this.removeItem(id);
      }
      // Global Add to Cart button delegation
      const addCartBtn = e.target.closest('.btn-add-to-cart');
      if (addCartBtn) {
        e.preventDefault();
        const foodJson = addCartBtn.getAttribute('data-food');
        const qtyInput = document.getElementById('food-detail-quantity');
        const qty = qtyInput ? parseInt(qtyInput.value, 10) : 1;

        if (foodJson) {
          try {
            const food = JSON.parse(decodeURIComponent(foodJson));
            this.addItem(food, qty);
          } catch (err) {
            console.error('Error parsing food data:', err);
          }
        }
      }
    });

    // Promo code apply button
    const promoForm = document.getElementById('promo-form');
    if (promoForm) {
      promoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('promo-input');
        if (input) this.applyPromoCode(input.value);
      });
    }

    // Checkout button check
    const proceedCheckoutBtn = document.getElementById('btn-proceed-checkout');
    if (proceedCheckoutBtn) {
      proceedCheckoutBtn.addEventListener('click', (e) => {
        if (this.items.length === 0) {
          e.preventDefault();
          Toast.warning('Your cart is empty. Add delicious forest dishes first!');
        }
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Cart.init();
});
