/**
 * Food in Forest - Orders & Checkout Controller
 * Handles customer checkout, order creation in Firebase, order tracking, and history.
 */

const OrderService = {
  async init() {
    if (document.getElementById('checkout-form')) {
      this.initCheckoutPage();
    } else if (document.getElementById('order-success-container')) {
      this.initOrderSuccessPage();
    } else if (document.getElementById('customer-orders-container')) {
      this.initOrdersHistoryPage();
    }
  },

  // 1. Checkout Handler
  initCheckoutPage() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    // Prefill form if user is logged in
    Auth.onAuthStateChanged((user, profile) => {
      if (user && profile) {
        const nameInput = document.getElementById('cust-name');
        const emailInput = document.getElementById('cust-email');
        const phoneInput = document.getElementById('cust-phone');
        const addressInput = document.getElementById('cust-address');

        if (nameInput && !nameInput.value) nameInput.value = profile.name || '';
        if (emailInput && !emailInput.value) emailInput.value = user.email || '';
        if (phoneInput && !phoneInput.value) phoneInput.value = profile.phone || '';
        if (addressInput && !addressInput.value) addressInput.value = profile.address || '';
      }
    });

    form.addEventListener('submit', (e) => this.handlePlaceOrder(e));
  },

  async handlePlaceOrder(e) {
    e.preventDefault();

    if (Cart.items.length === 0) {
      Toast.warning('Your cart is empty. Add food items before placing order.');
      return;
    }

    const name = document.getElementById('cust-name').value.trim();
    const email = document.getElementById('cust-email').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const city = (document.getElementById('cust-city')?.value || 'Nilgiris').trim();
    const instructions = (document.getElementById('cust-instructions')?.value || '').trim();
    const submitBtn = document.getElementById('place-order-btn');

    if (!name || !email || !phone || !address) {
      Toast.warning('Please complete all required customer details.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Transmitting Order to Forest Kitchen...';
    }

    try {
      const calc = Cart.getCalculations();
      const orderId = Utils.generateOrderId();
      const currentUser = Auth.getCurrentUser();

      const orderPayload = {
        orderId: orderId,
        userId: currentUser ? currentUser.uid : 'guest-user',
        customerName: name,
        customerEmail: email,
        phone: phone,
        address: address,
        city: city,
        specialInstructions: instructions,
        items: Cart.items.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
          veg: i.veg
        })),
        subtotal: calc.subtotal,
        discount: calc.discount,
        promoCode: Cart.appliedOffer ? Cart.appliedOffer.promoCode : null,
        deliveryCharge: calc.deliveryCharge,
        total: calc.total,
        orderStatus: 'Pending',
        paymentStatus: 'Pending',
        paymentMethod: 'Cash on Delivery / Pay at Restaurant',
        createdAt: new Date().toISOString()
      };

      // Save order to Firebase Realtime Database
      await DB.set(`orders/${orderId}`, orderPayload);

      // Clear shopping cart
      Cart.clearCart();

      Toast.success('Order placed successfully!');
      setTimeout(() => {
        window.location.href = `order-success.html?orderId=${encodeURIComponent(orderId)}`;
      }, 700);

    } catch (error) {
      console.error('Order creation failed:', error);
      Toast.error('Unable to place your order right now. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Place Order (Cash on Delivery)';
      }
    }
  },

  // 2. Order Success Page Handler
  async initOrderSuccessPage() {
    const orderId = Utils.getQueryParam('orderId');
    const container = document.getElementById('order-success-container');

    if (!orderId || !container) return;

    Utils.showLoading();
    try {
      // Real-time listener for this order so status updates reflect live
      DB.listen(`orders/${orderId}`, (order) => {
        if (!order) {
          container.innerHTML = `
            <div class="empty-state">
              <h3>Order Not Found</h3>
              <p>Could not retrieve details for Order ID: ${Utils.escapeHtml(orderId)}</p>
              <a href="menu.html" class="btn btn-primary">Back to Menu</a>
            </div>
          `;
          return;
        }

        this.renderOrderSuccessDetails(order, container);
      });
    } catch (e) {
      console.error('Error fetching order:', e);
    } finally {
      Utils.hideLoading();
    }
  },

  renderOrderSuccessDetails(order, container) {
    const statusSteps = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered'];
    const currentStatusIndex = statusSteps.indexOf(order.orderStatus);

    let trackerHtml = '<div class="order-status-tracker">';
    statusSteps.forEach((step, idx) => {
      const isCompleted = idx <= currentStatusIndex && order.orderStatus !== 'Cancelled';
      const isCurrent = idx === currentStatusIndex;
      trackerHtml += `
        <div class="tracker-step ${isCompleted ? 'step-completed' : ''} ${isCurrent ? 'step-current' : ''}">
          <div class="step-dot">${isCompleted ? '✓' : idx + 1}</div>
          <span class="step-label">${step}</span>
        </div>
      `;
    });
    trackerHtml += '</div>';

    let itemsHtml = '';
    (order.items || []).forEach(item => {
      itemsHtml += `
        <div class="success-item-row">
          <div class="item-name-col">
            ${Utils.getDietIndicatorHtml(item.veg)}
            <strong>${Utils.escapeHtml(item.name)}</strong> × ${item.quantity}
          </div>
          <div class="item-price-col">
            ${Utils.formatCurrency((item.price || 0) * item.quantity)}
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="order-success-card">
        <div class="success-header">
          <div class="success-badge-icon">🌿</div>
          <h1>Thank You For Dining With Us!</h1>
          <p class="success-subtitle">Your feast is being prepared by our forest chefs.</p>
          <div class="order-id-highlight">Order ID: <strong>#${Utils.escapeHtml(order.orderId)}</strong></div>
        </div>

        <div class="order-tracker-box">
          <h3>Live Order Status: ${Utils.getStatusBadgeHtml(order.orderStatus)}</h3>
          ${order.orderStatus === 'Cancelled' ? '<div class="alert-cancelled">This order was cancelled.</div>' : trackerHtml}
        </div>

        <div class="order-details-grid">
          <div class="details-section">
            <h4>Delivery & Contact Information</h4>
            <p><strong>Customer:</strong> ${Utils.escapeHtml(order.customerName)}</p>
            <p><strong>Phone:</strong> ${Utils.escapeHtml(order.phone)}</p>
            <p><strong>Email:</strong> ${Utils.escapeHtml(order.customerEmail)}</p>
            <p><strong>Address:</strong> ${Utils.escapeHtml(order.address)}, ${Utils.escapeHtml(order.city || '')}</p>
            ${order.specialInstructions ? `<p><strong>Note:</strong> <em>"${Utils.escapeHtml(order.specialInstructions)}"</em></p>` : ''}
            <p><strong>Payment Method:</strong> ${Utils.escapeHtml(order.paymentMethod || 'Cash on Delivery')}</p>
          </div>

          <div class="details-section">
            <h4>Ordered Delicacies</h4>
            <div class="success-items-list">
              ${itemsHtml}
            </div>
            <hr class="summary-divider">
            <div class="summary-line">
              <span>Subtotal:</span>
              <span>${Utils.formatCurrency(order.subtotal)}</span>
            </div>
            ${order.discount > 0 ? `
              <div class="summary-line text-success">
                <span>Discount (${Utils.escapeHtml(order.promoCode || 'PROMO')}):</span>
                <span>-${Utils.formatCurrency(order.discount)}</span>
              </div>
            ` : ''}
            <div class="summary-line">
              <span>Delivery Charges:</span>
              <span>${order.deliveryCharge === 0 ? '<strong class="text-success">FREE</strong>' : Utils.formatCurrency(order.deliveryCharge)}</span>
            </div>
            <div class="summary-line total-line">
              <strong>Total Amount:</strong>
              <strong class="total-price">${Utils.formatCurrency(order.total)}</strong>
            </div>
          </div>
        </div>

        <div class="order-success-actions">
          <a href="menu.html" class="btn btn-secondary">Order More</a>
          <a href="orders.html" class="btn btn-outline-forest">View All Orders</a>
        </div>
      </div>
    `;
  },

  // 3. Customer Orders History Handler
  async initOrdersHistoryPage() {
    const container = document.getElementById('customer-orders-container');
    if (!container) return;

    Utils.showLoading();

    Auth.onAuthStateChanged(async (user) => {
      if (!user) {
        Utils.hideLoading();
        container.innerHTML = `
          <div class="empty-state">
            <h3>Please Sign In</h3>
            <p>Log in to your account to view your past orders.</p>
            <a href="login.html?redirect=orders.html" class="btn btn-primary">Sign In</a>
          </div>
        `;
        return;
      }

      try {
        // Fetch all orders and filter by user ID (or guest email)
        const ordersData = await DB.get('orders');
        const ordersList = ordersData ? Object.values(ordersData) : [];
        const userOrders = ordersList.filter(o => o.userId === user.uid || o.customerEmail === user.email);

        // Sort descending by created timestamp
        userOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        if (userOrders.length === 0) {
          container.innerHTML = `
            <div class="empty-state">
              <div class="empty-icon">🍃</div>
              <h3>No Past Orders Found</h3>
              <p>You have not placed any orders yet. Discover our forest delicacies!</p>
              <a href="menu.html" class="btn btn-primary">Explore Menu</a>
            </div>
          `;
          return;
        }

        let html = '<div class="orders-history-list">';
        userOrders.forEach(order => {
          const itemsCount = (order.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);
          const firstItem = order.items && order.items[0] ? order.items[0].name : 'Forest Special';
          const moreItems = (order.items || []).length > 1 ? ` + ${(order.items.length - 1)} more` : '';

          html += `
            <div class="order-history-card">
              <div class="order-card-header">
                <div>
                  <span class="order-card-id">#${Utils.escapeHtml(order.orderId)}</span>
                  <span class="order-card-date">${Utils.formatDate(order.createdAt)}</span>
                </div>
                <div>${Utils.getStatusBadgeHtml(order.orderStatus)}</div>
              </div>

              <div class="order-card-body">
                <p class="order-items-preview"><strong>${Utils.escapeHtml(firstItem)}</strong>${moreItems} (${itemsCount} items)</p>
                <p class="order-destination">📍 Deliver to: ${Utils.escapeHtml(order.address || 'Dining Table')}</p>
              </div>

              <div class="order-card-footer">
                <div class="order-total-amount">
                  <small>Total Amount</small>
                  <strong>${Utils.formatCurrency(order.total)}</strong>
                </div>
                <a href="order-success.html?orderId=${encodeURIComponent(order.orderId)}" class="btn btn-sm btn-outline-forest">Track & Details</a>
              </div>
            </div>
          `;
        });
        html += '</div>';

        container.innerHTML = html;
      } catch (err) {
        console.error('Error loading user orders:', err);
        container.innerHTML = '<p class="text-danger">Failed to load order history.</p>';
      } finally {
        Utils.hideLoading();
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  OrderService.init();
});
