/**
 * Food in Forest - Hotel Admin Portal Controller
 * Manages secure role authorization, dashboard analytics, food CRUD, category CRUD,
 * live order lifecycle management, customer statistics, hotel profile, and promotions.
 */

const AdminApp = {
  currentAdmin: null,

  async init() {
    this.setupSidebarToggle();

    // Check if on Admin Login page
    if (document.getElementById('admin-login-form')) {
      this.initAdminLogin();
      return;
    }

    // Protect all other admin pages
    await this.verifyAdminAuth();
    this.routeAdminPage();
  },

  // 1. Sidebar and Responsive Menu Toggle
  setupSidebarToggle() {
    const toggleBtn = document.getElementById('admin-sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    const overlay = document.getElementById('admin-sidebar-overlay');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('sidebar-open');
        if (overlay) overlay.classList.toggle('show');
      });
    }

    if (overlay && sidebar) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('sidebar-open');
        overlay.classList.remove('show');
      });
    }
  },

  // 2. Role-Based Admin Access Verification
  async verifyAdminAuth() {
    const isSubfolder = window.location.pathname.includes('/admin/');
    const guestHomeUrl = isSubfolder ? '../index.html' : 'index.html';
    const loginUrl = isSubfolder ? '../login.html' : 'login.html';

    return new Promise((resolve) => {
      Auth.onAuthStateChanged(async (user, profile) => {
        // Case 1: Unauthenticated visitor
        if (!user) {
          window.location.href = loginUrl;
          return;
        }

        // Case 2: Authenticated user -> fetch role from Firebase Realtime Database
        let userRole = profile ? profile.role : null;
        if (!userRole) {
          try {
            const freshProfile = await DB.get(`users/${user.uid}`);
            userRole = freshProfile ? freshProfile.role : null;
          } catch (e) {
            console.error('Error fetching user role from Firebase:', e);
          }
        }

        // Case 3: Role is NOT admin -> strictly deny and redirect
        if (userRole !== 'admin') {
          console.warn('[Security] Access denied: User is not an admin. Role:', userRole);
          if (window.Toast) {
            Toast.error('Access Denied: You do not have administrator permissions.');
          }
          await Auth.logout();
          setTimeout(() => {
            window.location.href = guestHomeUrl;
          }, 400);
          return;
        }

        // Case 4: Verified Admin -> reveal and initialize admin portal
        this.currentAdmin = user;
        document.body.classList.add('admin-authorized');
        this.updateAdminHeader(user, profile);
        resolve(true);
      });
    });
  },


  updateAdminHeader(user, profile) {
    const nameEl = document.getElementById('admin-user-display');
    if (nameEl) {
      nameEl.textContent = (profile && profile.name) ? profile.name : user.email;
    }
  },

  // 3. Admin Login Handler
  initAdminLogin() {
    const form = document.getElementById('admin-login-form');
    if (!form) return;

    // Check if already logged in as admin
    Auth.onAuthStateChanged(async (user, profile) => {
      if (user) {
        const userRec = profile || await DB.get(`users/${user.uid}`);
        if (userRec && userRec.role === 'admin') {
          window.location.href = 'dashboard.html';
        }
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-password').value;
      const submitBtn = document.getElementById('admin-login-btn');

      if (!email || !password) {
        Toast.warning('Please enter both admin email and password.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Verifying Authorization...';
      }

      try {
        const result = await Auth.login(email, password);
        const profile = await DB.get(`users/${result.user.uid}`);

        if (!profile || profile.role !== 'admin') {
          await Auth.logout();
          Toast.error('Access Denied: You do not have permission to access this area.');
          return;
        }

        Toast.success('Admin verified successfully! Loading dashboard...');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 600);
      } catch (err) {
        console.error('Admin login error:', err);
        Toast.error('Invalid email or password.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = 'Access Admin Dashboard';
        }
      }
    });
  },

  // 4. Page Router Dispatcher
  routeAdminPage() {
    const rawPath = (window.location.pathname.split('/').pop() || '').replace(/\.html$/, '');

    // Check specific DOM IDs first (100% resilient across clean URLs and static routing)
    if (document.getElementById('admin-foods-tbody') || rawPath === 'foods') {
      this.initFoodsManagement();
    } else if (document.getElementById('add-food-form') || rawPath === 'add-food') {
      this.initAddFood();
    } else if (document.getElementById('edit-food-form') || rawPath === 'edit-food') {
      this.initEditFood();
    } else if (document.getElementById('admin-categories-tbody') || rawPath === 'categories') {
      this.initCategories();
    } else if (document.getElementById('admin-orders-tbody') || rawPath === 'orders') {
      this.initOrdersManagement();
    } else if (document.getElementById('admin-customers-tbody') || rawPath === 'customers') {
      this.initCustomersManagement();
    } else if (document.getElementById('hotel-profile-form') || rawPath === 'hotel-profile') {
      this.initHotelProfile();
    } else if (document.getElementById('offers-tbody') || rawPath === 'offers') {
      this.initOffersManagement();
    } else if (document.getElementById('btn-force-seed') || document.getElementById('btn-seed-data') || rawPath === 'settings' || rawPath.includes('settings')) {
      this.initSettings();
    } else if (document.getElementById('salesChart') || document.getElementById('stat-total-revenue') || rawPath === 'dashboard' || rawPath === 'admin-dashboard' || rawPath === '' || rawPath === 'admin') {
      this.initDashboard();
    }
  },

  // 5. Dashboard Page
  async initDashboard() {
    Utils.showLoading();
    try {
      // Listen to orders, foods, and users for live stats
      DB.listen('orders', (ordersData) => {
        const orders = ordersData ? Object.values(ordersData) : [];
        this.updateDashboardStats(orders);
        this.renderRecentOrdersTable(orders);
        this.renderSalesChart(orders);
      });

      const [foodsData, usersData] = await Promise.all([
        DB.get('foods'),
        DB.get('users')
      ]);

      const foods = foodsData ? Object.values(foodsData) : [];
      const users = usersData ? Object.values(usersData) : [];

      const totalFoodsEl = document.getElementById('stat-total-foods');
      const activeFoodsEl = document.getElementById('stat-active-foods');
      const totalCustEl = document.getElementById('stat-total-customers');

      if (totalFoodsEl) totalFoodsEl.textContent = foods.length;
      if (activeFoodsEl) activeFoodsEl.textContent = foods.filter(f => f.available !== false).length;
      if (totalCustEl) totalCustEl.textContent = users.filter(u => u.role !== 'admin').length;
    } catch (e) {
      console.error('Error in initDashboard:', e);
    } finally {
      Utils.hideLoading();
    }
  },

  updateDashboardStats(orders) {
    const totalOrdersEl = document.getElementById('stat-total-orders');
    const pendingOrdersEl = document.getElementById('stat-pending-orders');
    const completedOrdersEl = document.getElementById('stat-completed-orders');
    const totalRevenueEl = document.getElementById('stat-total-revenue');

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery'].includes(o.orderStatus)).length;
    const completedOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
    const revenue = orders.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
    if (completedOrdersEl) completedOrdersEl.textContent = completedOrders;
    if (totalRevenueEl) totalRevenueEl.textContent = Utils.formatCurrency(revenue);
  },

  renderRecentOrdersTable(orders) {
    const tbody = document.getElementById('dashboard-recent-orders');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No orders received yet.</td></tr>';
      return;
    }

    const sorted = [...orders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 7);

    tbody.innerHTML = sorted.map(order => `
      <tr>
        <td><strong>#${Utils.escapeHtml(order.orderId)}</strong></td>
        <td>${Utils.escapeHtml(order.customerName)}<br><small class="text-muted">${Utils.escapeHtml(order.phone || '')}</small></td>
        <td>${Utils.formatDate(order.createdAt)}</td>
        <td>${Utils.formatCurrency(order.total)}</td>
        <td>${Utils.getStatusBadgeHtml(order.orderStatus)}</td>
        <td>
          <a href="orders.html?search=${encodeURIComponent(order.orderId)}" class="btn btn-xs btn-outline-forest">Manage</a>
        </td>
      </tr>
    `).join('');
  },

  renderSalesChart(orders) {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Build last 7 days aggregation
    const days = [];
    const revenueByDay = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      days.push({ key, label });
      revenueByDay[key] = 0;
    }

    orders.forEach(o => {
      if (o.orderStatus !== 'Cancelled' && o.createdAt) {
        const dateKey = o.createdAt.split('T')[0];
        if (revenueByDay[dateKey] !== undefined) {
          revenueByDay[dateKey] += Number(o.total) || 0;
        }
      }
    });

    // Clear canvas
    const width = canvas.width = canvas.parentElement.clientWidth || 500;
    const height = canvas.height = 220;
    ctx.clearRect(0, 0, width, height);

    const padding = { top: 30, right: 20, bottom: 40, left: 50 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const values = days.map(d => revenueByDay[d.key]);
    const maxVal = Math.max(...values, 1000);

    // Draw horizontal gridlines
    ctx.strokeStyle = '#e6dec8';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#7a7062';
    ctx.font = '11px sans-serif';

    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const y = padding.top + (chartH / steps) * i;
      const val = Math.round(maxVal - (maxVal / steps) * i);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText('₹' + val, 5, y + 4);
    }

    // Draw Bars
    const barWidth = Math.min(36, (chartW / days.length) - 16);
    days.forEach((day, idx) => {
      const val = revenueByDay[day.key];
      const barH = (val / maxVal) * chartH;
      const x = padding.left + (idx * (chartW / days.length)) + ((chartW / days.length) - barWidth) / 2;
      const y = padding.top + chartH - barH;

      // Bar fill (Forest Green Gradient)
      const grad = ctx.createLinearGradient(0, y, 0, padding.top + chartH);
      grad.addColorStop(0, '#2d5a3f');
      grad.addColorStop(1, '#1b3b2b');
      ctx.fillStyle = grad;

      // Rounded rectangle top
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]) : ctx.rect(x, y, barWidth, barH);
      ctx.fill();

      // Bar top value
      if (val > 0) {
        ctx.fillStyle = '#1b3b2b';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('₹' + Math.round(val), x - 2, y - 6);
      }

      // X-Axis Day label
      ctx.fillStyle = '#4a4036';
      ctx.font = '11px sans-serif';
      ctx.fillText(day.label, x - 2, height - 12);
    });
  },

  // 6. Food Management Page (admin/foods.html)
  async initFoodsManagement() {
    const tbody = document.getElementById('admin-foods-tbody');
    let foods = [];
    let categories = [];

    const renderTable = () => {
      if (!tbody) return;
      const searchTerm = (document.getElementById('admin-food-search')?.value || '').toLowerCase();
      const selectedCat = document.getElementById('admin-food-category-filter')?.value || 'all';
      const selectedAvail = document.getElementById('admin-food-avail-filter')?.value || 'all';

      let filtered = foods.filter(f => {
        const matchName = (f.name || '').toLowerCase().includes(searchTerm) || (f.description || '').toLowerCase().includes(searchTerm);
        const matchCat = (selectedCat === 'all' || f.categoryId === selectedCat);
        const matchAvail = (selectedAvail === 'all' || (selectedAvail === '1' && f.available !== false) || (selectedAvail === '0' && f.available === false));
        return matchName && matchCat && matchAvail;
      });

      if (filtered.length === 0) {
        if (foods.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="7" class="text-center" style="padding: 2.5rem 1rem;">
                <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">No food items in database yet</div>
                <div style="color: var(--color-text-muted); margin-bottom: 1rem;">Seed default forest cuisine items or add your first specialty dish.</div>
                <a href="settings.html" class="btn btn-secondary btn-sm" style="margin-right: 0.5rem;">🌱 Go to Database Seeder</a>
                <a href="add-food.html" class="btn btn-primary btn-sm">+ Add Food Item</a>
              </td>
            </tr>`;
        } else {
          tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted" style="padding: 2rem;">No foods found matching the search/filter criteria.</td></tr>';
        }
        return;
      }

      tbody.innerHTML = filtered.map(food => `
        <tr data-id="${food.id}">
          <td>
            <img src="${Utils.escapeHtml(food.image || Utils.getFoodFallbackImage())}" alt="${Utils.escapeHtml(food.name)}" class="admin-table-thumb" onerror="this.src='${Utils.getFoodFallbackImage()}'">
          </td>
          <td>
            <strong>${Utils.escapeHtml(food.name)}</strong>
            <div>${Utils.getDietIndicatorHtml(food.veg)} ${food.spicy ? Utils.getSpiceIndicatorHtml(true) : ''}</div>
          </td>
          <td>${Utils.escapeHtml(food.categoryName || food.categoryId || '')}</td>
          <td>${Utils.formatCurrency(food.price)}</td>
          <td>
            <label class="switch">
              <input type="checkbox" class="toggle-food-avail" data-id="${food.id}" ${food.available !== false ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
            <small class="d-block">${food.available !== false ? 'Available' : 'Disabled'}</small>
          </td>
          <td>
            <label class="switch">
              <input type="checkbox" class="toggle-food-featured" data-id="${food.id}" ${food.featured ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
            <small class="d-block">${food.featured ? '⭐ Featured' : 'Normal'}</small>
          </td>
          <td>
            <div class="admin-table-actions">
              <a href="edit-food.html?id=${encodeURIComponent(food.id)}" class="btn btn-xs btn-outline-forest">Edit</a>
              <button class="btn btn-xs btn-outline-danger btn-delete-food" data-id="${food.id}" data-name="${Utils.escapeHtml(food.name)}">Delete</button>
            </div>
          </td>
        </tr>
      `).join('');
    };

    const updateCategoriesDropdown = () => {
      const catSelect = document.getElementById('admin-food-category-filter');
      if (catSelect && categories.length > 0) {
        catSelect.innerHTML = '<option value="all">All Categories</option>';
        categories.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat.id;
          opt.textContent = cat.name;
          catSelect.appendChild(opt);
        });
      }
    };

    // Attach search & filter listeners once
    document.getElementById('admin-food-search')?.addEventListener('input', renderTable);
    document.getElementById('admin-food-category-filter')?.addEventListener('change', renderTable);
    document.getElementById('admin-food-avail-filter')?.addEventListener('change', renderTable);

    // Delegate Toggle & Delete events
    tbody?.addEventListener('change', async (e) => {
      if (e.target.matches('.toggle-food-avail')) {
        const id = e.target.getAttribute('data-id');
        const isAvail = e.target.checked;
        await DB.update(`foods/${id}`, { available: isAvail });
        Toast.success(`Updated availability status.`);
      }
      if (e.target.matches('.toggle-food-featured')) {
        const id = e.target.getAttribute('data-id');
        const isFeat = e.target.checked;
        await DB.update(`foods/${id}`, { featured: isFeat });
        Toast.success(`Updated featured status.`);
      }
    });

    tbody?.addEventListener('click', async (e) => {
      if (e.target.matches('.btn-delete-food')) {
        const id = e.target.getAttribute('data-id');
        const name = e.target.getAttribute('data-name');
        if (confirm(`Are you sure you want to delete "${name}"?\nThis action cannot be undone.`)) {
          await DB.remove(`foods/${id}`);
          Toast.success(`"${name}" deleted successfully.`);
        }
      }
    });

    // 1. Initial Quick Fetch
    try {
      const [foodsData, categoriesData] = await Promise.all([
        DB.get('foods'),
        DB.get('categories')
      ]);

      foods = foodsData ? (Array.isArray(foodsData) ? foodsData : Object.values(foodsData)) : [];
      categories = categoriesData ? (Array.isArray(categoriesData) ? categoriesData : Object.values(categoriesData)) : [];

      updateCategoriesDropdown();
      renderTable();
    } catch (e) {
      console.warn('Initial foods fetch notice:', e);
    }

    // 2. Real-time Firebase Listener for Live Sync
    DB.listen('foods', (liveFoods) => {
      if (liveFoods) {
        foods = Array.isArray(liveFoods) ? liveFoods : Object.values(liveFoods);
      } else {
        foods = [];
      }
      renderTable();
    });

    DB.listen('categories', (liveCats) => {
      if (liveCats) {
        categories = Array.isArray(liveCats) ? liveCats : Object.values(liveCats);
        updateCategoriesDropdown();
        renderTable();
      }
    });
  },

  // 7. Add Food (admin/add-food.html)
  async initAddFood() {
    // Initialize Device Image Picker
    Utils.setupImagePicker({
      containerId: 'food-image-picker',
      hiddenInputId: 'food-image',
      placeholder: 'Select dish photo from device or enter URL'
    });

    // Populate categories
    try {
      const categoriesData = await DB.get('categories');
      const categories = categoriesData ? Object.values(categoriesData) : [];
      const catSelect = document.getElementById('food-category');
      if (catSelect) {
        catSelect.innerHTML = categories.filter(c => c.active !== false).map(cat => 
          `<option value="${cat.id}" data-name="${Utils.escapeHtml(cat.name)}">${Utils.escapeHtml(cat.name)}</option>`
        ).join('');
      }
    } catch (e) {
      console.error('Could not populate categories:', e);
    }

    const form = document.getElementById('add-food-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('food-name').value.trim();
      const catSelect = document.getElementById('food-category');
      const categoryId = catSelect.value;
      const categoryName = catSelect.options[catSelect.selectedIndex]?.getAttribute('data-name') || '';
      const price = parseFloat(document.getElementById('food-price').value);
      const description = document.getElementById('food-description').value.trim();
      const ingredientsRaw = document.getElementById('food-ingredients').value.trim();
      const imageEl = document.getElementById('food-image');
      const image = (imageEl ? imageEl.value.trim() : '') || Utils.getFoodFallbackImage();
      const isVeg = document.getElementById('food-veg').value === 'true';
      const isSpicy = document.getElementById('food-spicy').checked;
      const spiceLevel = document.getElementById('food-spice-level').value;
      const prepTime = parseInt(document.getElementById('food-prep-time').value, 10) || 15;
      const isAvailable = document.getElementById('food-available').checked;
      const isFeatured = document.getElementById('food-featured').checked;

      if (!name || isNaN(price) || price < 0 || !description) {
        Toast.warning('Please fill in all required fields properly.');
        return;
      }

      const ingredients = ingredientsRaw ? ingredientsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
      const foodId = Utils.generateId('food');

      const newFood = {
        id: foodId,
        name,
        categoryId,
        categoryName,
        price,
        description,
        ingredients,
        image,
        veg: isVeg,
        spicy: isSpicy,
        spiceLevel: isSpicy ? spiceLevel : 'None',
        preparationTime: prepTime,
        available: isAvailable,
        featured: isFeatured,
        createdAt: new Date().toISOString()
      };

      try {
        await DB.set(`foods/${foodId}`, newFood);
        Toast.success(`Delicacy "${name}" added successfully!`);
        setTimeout(() => {
          window.location.href = 'foods.html';
        }, 700);
      } catch (err) {
        console.error('Error adding food:', err);
        Toast.error('Failed to save food. Check Firebase permissions.');
      }
    });
  },

  // 8. Edit Food (admin/edit-food.html)
  async initEditFood() {
    const foodId = Utils.getQueryParam('id');
    if (!foodId) {
      Toast.error('No food ID specified.');
      setTimeout(() => location.href = 'foods.html', 1000);
      return;
    }

    Utils.showLoading();
    try {
      const [food, categoriesData] = await Promise.all([
        DB.get(`foods/${foodId}`),
        DB.get('categories')
      ]);

      if (!food) {
        Toast.error('Food item not found.');
        setTimeout(() => location.href = 'foods.html', 1000);
        return;
      }

      // Initialize Device Image Picker with current food image
      Utils.setupImagePicker({
        containerId: 'food-image-picker',
        hiddenInputId: 'food-image',
        initialUrl: food.image || '',
        placeholder: 'Select dish photo from device or enter URL'
      });

      // Populate Categories
      const catSelect = document.getElementById('food-category');
      const categories = categoriesData ? Object.values(categoriesData) : [];
      if (catSelect) {
        catSelect.innerHTML = categories.map(cat => 
          `<option value="${cat.id}" data-name="${Utils.escapeHtml(cat.name)}" ${cat.id === food.categoryId ? 'selected' : ''}>${Utils.escapeHtml(cat.name)}</option>`
        ).join('');
      }

      // Fill form values
      document.getElementById('food-name').value = food.name || '';
      document.getElementById('food-price').value = food.price || '';
      document.getElementById('food-description').value = food.description || '';
      document.getElementById('food-ingredients').value = Array.isArray(food.ingredients) ? food.ingredients.join(', ') : '';
      const imageHidden = document.getElementById('food-image');
      if (imageHidden) imageHidden.value = food.image || '';
      document.getElementById('food-veg').value = String(Boolean(food.veg));
      document.getElementById('food-spicy').checked = Boolean(food.spicy);
      document.getElementById('food-spice-level').value = food.spiceLevel || 'Medium Hot';
      document.getElementById('food-prep-time').value = food.preparationTime || 20;
      document.getElementById('food-available').checked = food.available !== false;
      document.getElementById('food-featured').checked = Boolean(food.featured);

      // Handle Edit Submit
      const form = document.getElementById('edit-food-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = document.getElementById('food-name').value.trim();
          const selectedCatOption = catSelect.options[catSelect.selectedIndex];
          const categoryId = catSelect.value;
          const categoryName = selectedCatOption?.getAttribute('data-name') || '';
          const price = parseFloat(document.getElementById('food-price').value);
          const description = document.getElementById('food-description').value.trim();
          const ingredientsRaw = document.getElementById('food-ingredients').value.trim();
          const imageEl = document.getElementById('food-image');
          const image = (imageEl ? imageEl.value.trim() : '') || food.image || Utils.getFoodFallbackImage();
          const isVeg = document.getElementById('food-veg').value === 'true';
          const isSpicy = document.getElementById('food-spicy').checked;
          const spiceLevel = document.getElementById('food-spice-level').value;
          const prepTime = parseInt(document.getElementById('food-prep-time').value, 10) || 15;
          const isAvailable = document.getElementById('food-available').checked;
          const isFeatured = document.getElementById('food-featured').checked;

          const ingredients = ingredientsRaw ? ingredientsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

          const updatedPayload = {
            ...food,
            name,
            categoryId,
            categoryName,
            price,
            description,
            ingredients,
            image,
            veg: isVeg,
            spicy: isSpicy,
            spiceLevel: isSpicy ? spiceLevel : 'None',
            preparationTime: prepTime,
            available: isAvailable,
            featured: isFeatured,
            updatedAt: new Date().toISOString()
          };

          await DB.set(`foods/${foodId}`, updatedPayload);
          Toast.success(`"${name}" updated successfully!`);
          setTimeout(() => {
            window.location.href = 'foods.html';
          }, 700);
        });
      }
    } catch (e) {
      console.error('Error loading edit food:', e);
    } finally {
      Utils.hideLoading();
    }
  },

  // 9. Categories Management (admin/categories.html)
  async initCategories() {
    Utils.showLoading();
    try {
      // Initialize Device Image Picker for Category
      Utils.setupImagePicker({
        containerId: 'cat-image-picker',
        hiddenInputId: 'cat-image',
        placeholder: 'Select category banner from device or enter URL'
      });

      const renderCategories = async () => {
        const categoriesData = await DB.get('categories');
        const categories = categoriesData ? Object.values(categoriesData) : [];
        const tbody = document.getElementById('categories-tbody');
        if (!tbody) return;

        if (categories.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No categories created yet.</td></tr>';
          return;
        }

        tbody.innerHTML = categories.map(cat => `
          <tr data-id="${cat.id}">
            <td>
              <img src="${Utils.escapeHtml(cat.image || Utils.getFoodFallbackImage())}" alt="${Utils.escapeHtml(cat.name)}" class="admin-table-thumb" onerror="this.src='${Utils.getFoodFallbackImage()}'">
            </td>
            <td><strong>${Utils.escapeHtml(cat.name)}</strong></td>
            <td>${Utils.escapeHtml(cat.description || '')}</td>
            <td>
              <label class="switch">
                <input type="checkbox" class="toggle-cat-active" data-id="${cat.id}" ${cat.active !== false ? 'checked' : ''}>
                <span class="slider round"></span>
              </label>
            </td>
            <td>
              <div class="admin-table-actions">
                <button class="btn btn-xs btn-outline-danger btn-delete-cat" data-id="${cat.id}" data-name="${Utils.escapeHtml(cat.name)}">Delete</button>
              </div>
            </td>
          </tr>
        `).join('');
      };

      // Add Category Form Handler
      const addForm = document.getElementById('add-category-form');
      if (addForm) {
        addForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const name = document.getElementById('cat-name').value.trim();
          const desc = document.getElementById('cat-desc').value.trim();
          const imageEl = document.getElementById('cat-image');
          const image = (imageEl ? imageEl.value.trim() : '') || Utils.getFoodFallbackImage();

          if (!name) {
            Toast.warning('Category name is required.');
            return;
          }

          const catId = `cat-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36).slice(-3)}`;
          await DB.set(`categories/${catId}`, {
            id: catId,
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: desc,
            image,
            active: true,
            createdAt: new Date().toISOString()
          });

          Toast.success(`Category "${name}" added!`);
          addForm.reset();
          const hiddenCat = document.getElementById('cat-image');
          if (hiddenCat) hiddenCat.value = '';
          const preview = document.querySelector('#cat-image-picker .image-preview-wrapper');
          if (preview) preview.style.display = 'none';
          renderCategories();
        });
      }

      // Category actions delegation
      document.getElementById('categories-tbody')?.addEventListener('change', async (e) => {
        if (e.target.matches('.toggle-cat-active')) {
          const id = e.target.getAttribute('data-id');
          await DB.update(`categories/${id}`, { active: e.target.checked });
          Toast.success('Category status updated.');
        }
      });

      document.getElementById('categories-tbody')?.addEventListener('click', async (e) => {
        if (e.target.matches('.btn-delete-cat')) {
          const id = e.target.getAttribute('data-id');
          const name = e.target.getAttribute('data-name');
          if (confirm(`Delete category "${name}"? Dishes in this category may become unassigned.`)) {
            await DB.remove(`categories/${id}`);
            Toast.success(`Category "${name}" deleted.`);
            renderCategories();
          }
        }
      });

      await renderCategories();
    } catch (e) {
      console.error('Error loading categories:', e);
    } finally {
      Utils.hideLoading();
    }
  },

  // 10. Orders Management (admin/orders.html)
  async initOrdersManagement() {
    Utils.showLoading();
    try {
      const allowedStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];

      DB.listen('orders', (ordersData) => {
        const orders = ordersData ? Object.values(ordersData) : [];
        const tbody = document.getElementById('admin-orders-tbody');
        if (!tbody) return;

        const filterStatus = document.getElementById('admin-order-status-filter')?.value || 'all';
        const searchVal = (document.getElementById('admin-order-search')?.value || '').toLowerCase();

        let filtered = orders.filter(o => {
          const matchStatus = (filterStatus === 'all' || o.orderStatus === filterStatus);
          const matchSearch = (o.orderId || '').toLowerCase().includes(searchVal) ||
                              (o.customerName || '').toLowerCase().includes(searchVal) ||
                              (o.phone || '').toLowerCase().includes(searchVal);
          return matchStatus && matchSearch;
        });

        // Sort descending by created timestamp
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        if (filtered.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No orders found.</td></tr>';
          return;
        }

        tbody.innerHTML = filtered.map(o => {
          const itemsSummary = (o.items || []).map(i => `${i.name} (×${i.quantity})`).join(', ');

          return `
            <tr data-id="${o.orderId}">
              <td><strong>#${Utils.escapeHtml(o.orderId)}</strong></td>
              <td>
                <strong>${Utils.escapeHtml(o.customerName)}</strong><br>
                <small class="text-muted">📞 ${Utils.escapeHtml(o.phone || '')}</small><br>
                <small class="text-muted">✉️ ${Utils.escapeHtml(o.customerEmail || '')}</small>
              </td>
              <td>${Utils.formatDate(o.createdAt)}</td>
              <td>
                <div class="order-items-preview-cell" title="${Utils.escapeHtml(itemsSummary)}">
                  ${Utils.escapeHtml(itemsSummary)}
                </div>
                ${o.specialInstructions ? `<small class="text-warning">Note: "${Utils.escapeHtml(o.specialInstructions)}"</small>` : ''}
              </td>
              <td><strong>${Utils.formatCurrency(o.total)}</strong></td>
              <td>
                <select class="form-control form-control-sm select-order-status" data-id="${o.orderId}">
                  ${allowedStatuses.map(st => `<option value="${st}" ${st === o.orderStatus ? 'selected' : ''}>${st}</option>`).join('')}
                </select>
              </td>
              <td>${Utils.getStatusBadgeHtml(o.orderStatus)}</td>
              <td>
                <button class="btn btn-xs btn-outline-danger btn-cancel-order" data-id="${o.orderId}" ${o.orderStatus === 'Cancelled' ? 'disabled' : ''}>Cancel</button>
              </td>
            </tr>
          `;
        }).join('');
      });

      // Filter events
      document.getElementById('admin-order-status-filter')?.addEventListener('change', () => {
        // Trigger re-render from local cache or listener
      });
      document.getElementById('admin-order-search')?.addEventListener('input', () => {
        // Trigger re-render
      });

      // Status change delegation
      document.getElementById('admin-orders-tbody')?.addEventListener('change', async (e) => {
        if (e.target.matches('.select-order-status')) {
          const orderId = e.target.getAttribute('data-id');
          const newStatus = e.target.value;
          await DB.update(`orders/${orderId}`, {
            orderStatus: newStatus,
            updatedAt: new Date().toISOString()
          });
          Toast.success(`Order #${orderId} status updated to "${newStatus}"!`);
        }
      });

      // Order cancellation button
      document.getElementById('admin-orders-tbody')?.addEventListener('click', async (e) => {
        if (e.target.matches('.btn-cancel-order')) {
          const orderId = e.target.getAttribute('data-id');
          if (confirm(`Are you sure you want to cancel Order #${orderId}?`)) {
            await DB.update(`orders/${orderId}`, {
              orderStatus: 'Cancelled',
              updatedAt: new Date().toISOString()
            });
            Toast.info(`Order #${orderId} cancelled.`);
          }
        }
      });
    } catch (e) {
      console.error('Error in orders management:', e);
    } finally {
      Utils.hideLoading();
    }
  },

  // 11. Customer Management (admin/customers.html)
  async initCustomersManagement() {
    Utils.showLoading();
    try {
      const [usersData, ordersData] = await Promise.all([
        DB.get('users'),
        DB.get('orders')
      ]);

      const users = usersData ? Object.values(usersData) : [];
      const orders = ordersData ? Object.values(ordersData) : [];

      const tbody = document.getElementById('admin-customers-tbody');
      if (!tbody) return;

      const customers = users.filter(u => u.role !== 'admin');

      if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No registered customers found.</td></tr>';
        return;
      }

      tbody.innerHTML = customers.map(cust => {
        const custOrders = orders.filter(o => o.userId === cust.uid || o.customerEmail === cust.email);
        const totalSpent = custOrders.filter(o => o.orderStatus !== 'Cancelled').reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        return `
          <tr>
            <td><strong>${Utils.escapeHtml(cust.name || 'Anonymous Guest')}</strong></td>
            <td>${Utils.escapeHtml(cust.email)}</td>
            <td>${Utils.escapeHtml(cust.phone || 'N/A')}</td>
            <td><strong>${custOrders.length}</strong> orders</td>
            <td><strong>${Utils.formatCurrency(totalSpent)}</strong></td>
            <td>${Utils.formatDate(cust.createdAt)}</td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.error('Error loading customers:', e);
    } finally {
      Utils.hideLoading();
    }
  },

  // 12. Hotel Profile Management (admin/hotel-profile.html)
  async initHotelProfile() {
    Utils.showLoading();
    try {
      const hotelsData = await DB.get('hotels');
      const hotel = hotelsData ? Object.values(hotelsData)[0] : null;

      // Initialize Hero & About Image Pickers
      Utils.setupImagePicker({
        containerId: 'hotel-hero-img-picker',
        hiddenInputId: 'hotel-hero-img',
        initialUrl: hotel ? (hotel.heroImage || '') : ''
      });
      Utils.setupImagePicker({
        containerId: 'hotel-about-img-picker',
        hiddenInputId: 'hotel-about-img',
        initialUrl: hotel ? (hotel.aboutImage || '') : ''
      });

      if (hotel) {
        document.getElementById('hotel-name').value = hotel.name || '';
        document.getElementById('hotel-tagline').value = hotel.tagline || '';
        document.getElementById('hotel-phone').value = hotel.phone || '';
        document.getElementById('hotel-email').value = hotel.email || '';
        document.getElementById('hotel-address').value = hotel.address || '';
        document.getElementById('hotel-map-url').value = hotel.mapUrl || '';
        document.getElementById('hotel-opening').value = hotel.openingTime || '';
        document.getElementById('hotel-closing').value = hotel.closingTime || '';
        const heroHidden = document.getElementById('hotel-hero-img');
        if (heroHidden) heroHidden.value = hotel.heroImage || '';
        const aboutHidden = document.getElementById('hotel-about-img');
        if (aboutHidden) aboutHidden.value = hotel.aboutImage || '';
        document.getElementById('hotel-desc').value = hotel.description || '';
        document.getElementById('hotel-about-text').value = hotel.aboutText || '';
      }

      const form = document.getElementById('hotel-profile-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const heroEl = document.getElementById('hotel-hero-img');
          const aboutEl = document.getElementById('hotel-about-img');
          const hotelPayload = {
            id: 'hotel-001',
            name: document.getElementById('hotel-name').value.trim(),
            tagline: document.getElementById('hotel-tagline').value.trim(),
            phone: document.getElementById('hotel-phone').value.trim(),
            email: document.getElementById('hotel-email').value.trim(),
            address: document.getElementById('hotel-address').value.trim(),
            mapUrl: document.getElementById('hotel-map-url').value.trim(),
            openingTime: document.getElementById('hotel-opening').value.trim(),
            closingTime: document.getElementById('hotel-closing').value.trim(),
            heroImage: (heroEl ? heroEl.value.trim() : ''),
            aboutImage: (aboutEl ? aboutEl.value.trim() : ''),
            description: document.getElementById('hotel-desc').value.trim(),
            aboutText: document.getElementById('hotel-about-text').value.trim(),
            updatedAt: new Date().toISOString()
          };

          await DB.set('hotels/hotel-001', hotelPayload);
          Toast.success('Hotel profile updated successfully! Changes reflect on public website.');
        });
      }
    } catch (e) {
      console.error('Error loading hotel profile:', e);
    } finally {
      Utils.hideLoading();
    }
  },

  // 13. Offers Management (admin/offers.html)
  async initOffersManagement() {
    Utils.showLoading();
    try {
      const renderOffers = async () => {
        const offersData = await DB.get('offers');
        const offers = offersData ? Object.values(offersData) : [];
        const tbody = document.getElementById('admin-offers-tbody');
        if (!tbody) return;

        if (offers.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No offers configured yet.</td></tr>';
          return;
        }

        tbody.innerHTML = offers.map(o => `
          <tr data-id="${o.id}">
            <td><strong class="promo-code-tag">${Utils.escapeHtml(o.promoCode)}</strong></td>
            <td>${Utils.escapeHtml(o.title)}</td>
            <td><strong>${o.discountPercentage}%</strong></td>
            <td>${o.minOrderAmount > 0 ? Utils.formatCurrency(o.minOrderAmount) : 'No Minimum'}</td>
            <td>${o.startDate || ''} to ${o.endDate || ''}</td>
            <td>
              <label class="switch">
                <input type="checkbox" class="toggle-offer-active" data-id="${o.id}" ${o.active !== false ? 'checked' : ''}>
                <span class="slider round"></span>
              </label>
            </td>
            <td>
              <button class="btn btn-xs btn-outline-danger btn-delete-offer" data-id="${o.id}">Delete</button>
            </td>
          </tr>
        `).join('');
      };

      const form = document.getElementById('add-offer-form');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const code = document.getElementById('offer-code').value.trim().toUpperCase();
          const title = document.getElementById('offer-title').value.trim();
          const desc = document.getElementById('offer-desc').value.trim();
          const pct = parseFloat(document.getElementById('offer-pct').value);
          const minOrder = parseFloat(document.getElementById('offer-min-order').value) || 0;
          const start = document.getElementById('offer-start').value;
          const end = document.getElementById('offer-end').value;

          if (!code || isNaN(pct) || pct <= 0) {
            Toast.warning('Please enter valid promo code and discount percentage.');
            return;
          }

          const offerId = `offer-${Date.now().toString(36)}`;
          await DB.set(`offers/${offerId}`, {
            id: offerId,
            promoCode: code,
            title,
            description: desc,
            discountPercentage: pct,
            minOrderAmount: minOrder,
            startDate: start,
            endDate: end,
            active: true,
            createdAt: new Date().toISOString()
          });

          Toast.success(`Promo code "${code}" added!`);
          form.reset();
          renderOffers();
        });
      }

      document.getElementById('admin-offers-tbody')?.addEventListener('change', async (e) => {
        if (e.target.matches('.toggle-offer-active')) {
          const id = e.target.getAttribute('data-id');
          await DB.update(`offers/${id}`, { active: e.target.checked });
          Toast.success('Offer status updated.');
        }
      });

      document.getElementById('admin-offers-tbody')?.addEventListener('click', async (e) => {
        if (e.target.matches('.btn-delete-offer')) {
          const id = e.target.getAttribute('data-id');
          if (confirm('Delete this promo offer?')) {
            await DB.remove(`offers/${id}`);
            Toast.success('Offer removed.');
            renderOffers();
          }
        }
      });

      await renderOffers();
    } catch (e) {
      console.error('Error loading offers:', e);
    } finally {
      Utils.hideLoading();
    }
  },

  // 14. Settings & Data Seed (admin/settings.html)
  async initSettings() {
    const seedBtn = document.getElementById('btn-force-seed') || document.getElementById('btn-seed-data');
    if (seedBtn) {
      seedBtn.onclick = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (confirm('This will seed/reset dummy foods, categories, and hotel details to defaults in Firebase Realtime Database. Proceed?')) {
          seedBtn.disabled = true;
          const origText = seedBtn.innerText;
          seedBtn.innerText = 'Seeding Data to Firebase...';
          try {
            if (typeof SeedService === 'undefined') {
              throw new Error('SeedService is not defined. Please check if js/firebase.js is loaded.');
            }
            await SeedService.forceSeed();
            if (window.Toast) {
              Toast.success('Firebase seeded with default restaurant data!');
            } else {
              alert('Firebase seeded with default restaurant data!');
            }
          } catch (err) {
            console.error('Seeding error:', err);
            if (window.Toast) {
              Toast.error('Seeding error: ' + (err.message || err));
            } else {
              alert('Seeding error: ' + (err.message || err));
            }
          } finally {
            seedBtn.disabled = false;
            seedBtn.innerText = origText;
          }
        }
      };
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});
