/**
 * Food in Forest - Foods, Menu & Details Controller
 * Handles dynamic catalog loading, real-time client-side search, multi-faceted filtering, sorting, and detail views.
 */

const FoodService = {
  allFoods: [],
  categories: [],
  activeFilters: {
    search: '',
    category: 'all',
    diet: 'all', // 'all', 'veg', 'non-veg'
    priceRange: 'all', // 'all', 'under200', '200to350', 'above350'
    availability: 'all', // 'all', 'available'
    sortBy: 'featured' // 'featured', 'price-asc', 'price-desc', 'popular', 'newest'
  },

  async init() {
    // Check if on Landing page, Menu page, or Details page
    if (document.getElementById('menu-grid-container')) {
      await this.initMenuPage();
    } else if (document.getElementById('food-detail-container')) {
      await this.initFoodDetailsPage();
    } else if (document.getElementById('featured-foods-grid')) {
      await this.initLandingPage();
    }

    // Always load dynamic hotel profile info in footer/headers
    this.loadHotelProfileInfo();
  },

  // 1. Landing Page Handler
  async initLandingPage() {
    Utils.showLoading();
    try {
      // Auto seed if empty
      await SeedService.checkAndSeed();

      const [foodsData, categoriesData] = await Promise.all([
        DB.get('foods'),
        DB.get('categories')
      ]);

      const foods = foodsData ? Object.values(foodsData) : [];
      const categories = categoriesData ? Object.values(categoriesData) : [];

      this.renderFeaturedFoods(foods.filter(f => f.featured && f.available !== false));
      this.renderLandingCategories(categories.filter(c => c.active !== false));
      this.renderSpecialOffers();
    } catch (err) {
      console.error('Error loading landing page data:', err);
    } finally {
      Utils.hideLoading();
    }
  },

  renderFeaturedFoods(featuredList) {
    const container = document.getElementById('featured-foods-grid');
    if (!container) return;

    if (!featuredList || featuredList.length === 0) {
      container.innerHTML = '<p class="text-center text-muted">No featured items at the moment.</p>';
      return;
    }

    container.innerHTML = featuredList.slice(0, 6).map(food => this.createFoodCardHtml(food)).join('');
  },

  renderLandingCategories(categories) {
    const container = document.getElementById('landing-categories-grid');
    if (!container) return;

    if (!categories || categories.length === 0) {
      container.innerHTML = '<p class="text-center text-muted">No categories found.</p>';
      return;
    }

    // Sort by order field
    categories.sort((a, b) => (a.order || 99) - (b.order || 99));

    container.innerHTML = categories.map(cat => `
      <a href="menu.html?category=${encodeURIComponent(cat.id || cat.slug)}" class="category-card">
        <div class="category-card-img-wrapper">
          <img src="${Utils.escapeHtml(cat.image)}" alt="${Utils.escapeHtml(cat.name)}" onerror="this.src='${Utils.getFoodFallbackImage()}'">
        </div>
        <div class="category-card-content">
          <h3>${Utils.escapeHtml(cat.name)}</h3>
          <p>${Utils.escapeHtml(cat.description || '')}</p>
          <span class="category-link-text">Explore Dishes &rarr;</span>
        </div>
      </a>
    `).join('');
  },

  async renderSpecialOffers() {
    const container = document.getElementById('special-offers-grid');
    if (!container) return;

    try {
      const offersData = await DB.get('offers');
      if (!offersData) return;

      const offers = Object.values(offersData).filter(o => o.active !== false);
      if (offers.length === 0) {
        container.closest('.section-offers')?.classList.add('d-none');
        return;
      }

      container.innerHTML = offers.map(offer => `
        <div class="offer-card">
          <div class="offer-badge-pill">${offer.discountPercentage}% OFF</div>
          <div class="offer-content">
            <div class="offer-code-badge">PROMO: <strong>${Utils.escapeHtml(offer.promoCode)}</strong></div>
            <h3>${Utils.escapeHtml(offer.title)}</h3>
            <p>${Utils.escapeHtml(offer.description)}</p>
            ${offer.minOrderAmount > 0 ? `<small class="text-muted">Valid on orders above ${Utils.formatCurrency(offer.minOrderAmount)}</small>` : ''}
          </div>
          <a href="menu.html" class="btn btn-secondary btn-sm">Use in Menu</a>
        </div>
      `).join('');
    } catch (e) {
      console.warn('Could not load offers:', e);
    }
  },

  // 2. Menu Page Handler
  async initMenuPage() {
    Utils.showLoading();
    try {
      await SeedService.checkAndSeed();

      const [foodsData, categoriesData] = await Promise.all([
        DB.get('foods'),
        DB.get('categories')
      ]);

      this.allFoods = foodsData ? Object.values(foodsData) : [];
      this.categories = categoriesData ? Object.values(categoriesData) : [];

      // Check URL query parameters for pre-selected category or search
      const paramCat = Utils.getQueryParam('category');
      const paramSearch = Utils.getQueryParam('search');

      if (paramCat) this.activeFilters.category = paramCat;
      if (paramSearch) this.activeFilters.search = paramSearch;

      this.renderCategoryPills();
      this.bindMenuEventListeners();
      this.applyFiltersAndRender();
    } catch (err) {
      console.error('Error loading menu:', err);
      const container = document.getElementById('menu-grid-container');
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <p class="text-danger">Unable to load menu right now. Please check your internet connection.</p>
            <button onclick="location.reload()" class="btn btn-secondary">Retry</button>
          </div>
        `;
      }
    } finally {
      Utils.hideLoading();
    }
  },

  renderCategoryPills() {
    const container = document.getElementById('category-filter-pills');
    if (!container) return;

    let html = `
      <button class="filter-pill ${this.activeFilters.category === 'all' ? 'active' : ''}" data-category="all">
        All Categories
      </button>
    `;

    this.categories.filter(c => c.active !== false).forEach(cat => {
      const isSelected = (this.activeFilters.category === cat.id || this.activeFilters.category === cat.slug);
      html += `
        <button class="filter-pill ${isSelected ? 'active' : ''}" data-category="${cat.id}">
          ${Utils.escapeHtml(cat.name)}
        </button>
      `;
    });

    container.innerHTML = html;
  },

  bindMenuEventListeners() {
    // Real-time Search input
    const searchInput = document.getElementById('menu-search-input');
    if (searchInput) {
      if (this.activeFilters.search) searchInput.value = this.activeFilters.search;
      searchInput.addEventListener('input', (e) => {
        this.activeFilters.search = e.target.value.trim().toLowerCase();
        this.applyFiltersAndRender();
      });
    }

    // Category pills click
    const categoryContainer = document.getElementById('category-filter-pills');
    if (categoryContainer) {
      categoryContainer.addEventListener('click', (e) => {
        if (e.target.matches('.filter-pill')) {
          categoryContainer.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
          e.target.classList.add('active');
          this.activeFilters.category = e.target.getAttribute('data-category');
          this.applyFiltersAndRender();
        }
      });
    }

    // Diet Filter (All, Veg, Non-Veg)
    const dietRadios = document.querySelectorAll('input[name="diet-filter"]');
    dietRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.activeFilters.diet = e.target.value;
        this.applyFiltersAndRender();
      });
    });

    // Price Filter
    const priceSelect = document.getElementById('price-filter-select');
    if (priceSelect) {
      priceSelect.addEventListener('change', (e) => {
        this.activeFilters.priceRange = e.target.value;
        this.applyFiltersAndRender();
      });
    }

    // Availability Filter Toggle
    const availCheckbox = document.getElementById('filter-available-only');
    if (availCheckbox) {
      availCheckbox.addEventListener('change', (e) => {
        this.activeFilters.availability = e.target.checked ? 'available' : 'all';
        this.applyFiltersAndRender();
      });
    }

    // Sort By Dropdown
    const sortSelect = document.getElementById('menu-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.activeFilters.sortBy = e.target.value;
        this.applyFiltersAndRender();
      });
    }

    // Reset Filters Button
    const resetBtn = document.getElementById('btn-reset-filters');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.activeFilters = {
          search: '',
          category: 'all',
          diet: 'all',
          priceRange: 'all',
          availability: 'all',
          sortBy: 'featured'
        };

        if (searchInput) searchInput.value = '';
        if (priceSelect) priceSelect.value = 'all';
        if (availCheckbox) availCheckbox.checked = false;
        if (sortSelect) sortSelect.value = 'featured';
        
        const allDietRadio = document.querySelector('input[name="diet-filter"][value="all"]');
        if (allDietRadio) allDietRadio.checked = true;

        this.renderCategoryPills();
        this.applyFiltersAndRender();
      });
    }
  },

  applyFiltersAndRender() {
    let filtered = [...this.allFoods];

    // 1. Search Filter (by name, description, ingredients)
    if (this.activeFilters.search) {
      const term = this.activeFilters.search.toLowerCase();
      filtered = filtered.filter(f => {
        const nameMatch = (f.name || '').toLowerCase().includes(term);
        const descMatch = (f.description || '').toLowerCase().includes(term);
        const catMatch = (f.categoryName || '').toLowerCase().includes(term);
        const ingMatch = Array.isArray(f.ingredients) && f.ingredients.some(ing => ing.toLowerCase().includes(term));
        return nameMatch || descMatch || catMatch || ingMatch;
      });
    }

    // 2. Category Filter
    if (this.activeFilters.category !== 'all') {
      filtered = filtered.filter(f => 
        f.categoryId === this.activeFilters.category || 
        f.categorySlug === this.activeFilters.category
      );
    }

    // 3. Diet Filter
    if (this.activeFilters.diet === 'veg') {
      filtered = filtered.filter(f => Boolean(f.veg) === true);
    } else if (this.activeFilters.diet === 'non-veg') {
      filtered = filtered.filter(f => Boolean(f.veg) === false);
    }

    // 4. Price Filter
    if (this.activeFilters.priceRange === 'under200') {
      filtered = filtered.filter(f => Number(f.price) < 200);
    } else if (this.activeFilters.priceRange === '200to350') {
      filtered = filtered.filter(f => Number(f.price) >= 200 && Number(f.price) <= 350);
    } else if (this.activeFilters.priceRange === 'above350') {
      filtered = filtered.filter(f => Number(f.price) > 350);
    }

    // 5. Availability Filter
    if (this.activeFilters.availability === 'available') {
      filtered = filtered.filter(f => f.available !== false);
    }

    // 6. Sorting
    if (this.activeFilters.sortBy === 'price-asc') {
      filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (this.activeFilters.sortBy === 'price-desc') {
      filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (this.activeFilters.sortBy === 'popular') {
      filtered.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (this.activeFilters.sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else {
      // 'featured' first
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    this.renderMenuGrid(filtered);
  },

  renderMenuGrid(foods) {
    const container = document.getElementById('menu-grid-container');
    const countBadge = document.getElementById('menu-results-count');

    if (!container) return;

    if (countBadge) {
      countBadge.textContent = `${foods.length} dish${foods.length === 1 ? '' : 'es'} found`;
    }

    if (foods.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🍃</div>
          <h3>No delicacies match your search</h3>
          <p>Try clearing some filters or search for another forest specialty.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = foods.map(food => this.createFoodCardHtml(food)).join('');
  },

  // 3. Food Card Template
  createFoodCardHtml(food) {
    const foodJson = encodeURIComponent(JSON.stringify({
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      veg: food.veg,
      available: food.available
    }));

    const isOut = food.available === false;

    return `
      <div class="food-card ${isOut ? 'food-card-unavailable' : ''}">
        <div class="food-card-image-wrap">
          <img src="${Utils.escapeHtml(food.image || Utils.getFoodFallbackImage())}" alt="${Utils.escapeHtml(food.name)}" onerror="this.src='${Utils.getFoodFallbackImage()}'" loading="lazy">
          <div class="food-card-badges">
            ${Utils.getDietIndicatorHtml(food.veg)}
            ${food.spicy ? Utils.getSpiceIndicatorHtml(true, food.spiceLevel) : ''}
          </div>
          ${food.featured ? `<span class="badge-featured">⭐ Signature</span>` : ''}
          ${isOut ? `<div class="food-out-overlay">Sold Out</div>` : ''}
        </div>
        <div class="food-card-body">
          <div class="food-card-meta">
            <span class="food-card-category">${Utils.escapeHtml(food.categoryName || 'Forest Special')}</span>
            ${food.rating ? `<span class="food-card-rating">★ ${food.rating}</span>` : ''}
          </div>
          <h3 class="food-card-title">
            <a href="food-details.html?id=${encodeURIComponent(food.id)}">${Utils.escapeHtml(food.name)}</a>
          </h3>
          <p class="food-card-desc">${Utils.escapeHtml(food.description || '')}</p>
          
          <div class="food-card-footer">
            <div class="food-card-price-block">
              <span class="food-price">${Utils.formatCurrency(food.price)}</span>
              ${food.preparationTime ? `<small class="prep-time">⏱️ ${food.preparationTime} mins</small>` : ''}
            </div>
            
            <div class="food-card-actions">
              <a href="food-details.html?id=${encodeURIComponent(food.id)}" class="btn btn-sm btn-outline-forest">Details</a>
              <button 
                class="btn btn-sm btn-primary btn-add-to-cart" 
                data-food="${foodJson}" 
                ${isOut ? 'disabled title="Currently unavailable"' : ''}>
                ${isOut ? 'Sold Out' : '+ Add'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 4. Food Details Page Handler
  async initFoodDetailsPage() {
    const foodId = Utils.getQueryParam('id');
    const container = document.getElementById('food-detail-container');
    const recommendedContainer = document.getElementById('recommended-foods-grid');

    if (!foodId) {
      if (container) {
        container.innerHTML = `
          <div class="empty-state">
            <h3>Dish Not Specified</h3>
            <p>Please select a delicacy from our menu.</p>
            <a href="menu.html" class="btn btn-primary">Browse Menu</a>
          </div>
        `;
      }
      return;
    }

    Utils.showLoading();
    try {
      const [food, allFoodsData] = await Promise.all([
        DB.get(`foods/${foodId}`),
        DB.get('foods')
      ]);

      if (!food) {
        if (container) {
          container.innerHTML = `
            <div class="empty-state">
              <h3>Delicacy Not Found</h3>
              <p>The requested forest dish may have been updated or removed.</p>
              <a href="menu.html" class="btn btn-primary">Explore Menu</a>
            </div>
          `;
        }
        return;
      }

      document.title = `${food.name} | Food in Forest`;

      const foodJson = encodeURIComponent(JSON.stringify({
        id: food.id,
        name: food.name,
        price: food.price,
        image: food.image,
        veg: food.veg,
        available: food.available
      }));

      const isOut = food.available === false;

      // Ingredients chips
      const ingredientsHtml = Array.isArray(food.ingredients) && food.ingredients.length > 0
        ? food.ingredients.map(ing => `<span class="ingredient-chip">🌿 ${Utils.escapeHtml(ing)}</span>`).join('')
        : '<span class="text-muted">Fresh mountain herbs and natural spices</span>';

      container.innerHTML = `
        <div class="food-detail-layout">
          <div class="food-detail-image-box">
            <img src="${Utils.escapeHtml(food.image || Utils.getFoodFallbackImage())}" alt="${Utils.escapeHtml(food.name)}" onerror="this.src='${Utils.getFoodFallbackImage()}'" class="food-detail-img">
            ${isOut ? `<div class="food-out-banner">Currently Unavailable</div>` : ''}
          </div>

          <div class="food-detail-info-box">
            <div class="food-detail-header">
              <div class="food-detail-badges">
                ${Utils.getDietIndicatorHtml(food.veg)}
                ${food.spicy ? Utils.getSpiceIndicatorHtml(true, food.spiceLevel) : ''}
                ${food.featured ? `<span class="badge-featured">⭐ Signature Dish</span>` : ''}
              </div>
              <h1 class="food-detail-title">${Utils.escapeHtml(food.name)}</h1>
              <div class="food-detail-meta-row">
                <span class="meta-tag">Category: <strong>${Utils.escapeHtml(food.categoryName || 'Forest Special')}</strong></span>
                ${food.preparationTime ? `<span class="meta-tag">⏱️ Prep Time: <strong>${food.preparationTime} mins</strong></span>` : ''}
                ${food.rating ? `<span class="meta-tag">★ Rating: <strong>${food.rating} / 5.0</strong></span>` : ''}
              </div>
            </div>

            <div class="food-detail-price-row">
              <span class="detail-price">${Utils.formatCurrency(food.price)}</span>
              <span class="detail-availability ${isOut ? 'text-danger' : 'text-success'}">
                ${isOut ? '✕ Currently Sold Out' : '✓ Freshly Available Today'}
              </span>
            </div>

            <div class="food-detail-section">
              <h3>Description</h3>
              <p class="food-detail-description">${Utils.escapeHtml(food.description || '')}</p>
            </div>

            <div class="food-detail-section">
              <h3>Wild & Natural Ingredients</h3>
              <div class="ingredients-list">
                ${ingredientsHtml}
              </div>
            </div>

            <div class="food-detail-order-actions">
              <div class="detail-qty-control">
                <label for="food-detail-quantity">Quantity:</label>
                <div class="quantity-controller">
                  <button type="button" class="qty-btn" onclick="const q = document.getElementById('food-detail-quantity'); if (q.value > 1) q.value--;">−</button>
                  <input type="number" id="food-detail-quantity" value="1" min="1" max="50" class="qty-input">
                  <button type="button" class="qty-btn" onclick="const q = document.getElementById('food-detail-quantity'); q.value++;">+</button>
                </div>
              </div>

              <button 
                class="btn btn-primary btn-lg btn-add-to-cart" 
                data-food="${foodJson}" 
                ${isOut ? 'disabled title="Unavailable"' : ''}>
                🛒 Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;

      // Render Recommended dishes in same category
      if (recommendedContainer && allFoodsData) {
        const allList = Object.values(allFoodsData);
        const related = allList.filter(f => f.id !== food.id && (f.categoryId === food.categoryId || f.featured));
        if (related.length > 0) {
          recommendedContainer.innerHTML = related.slice(0, 3).map(f => this.createFoodCardHtml(f)).join('');
        } else {
          recommendedContainer.parentElement?.classList.add('d-none');
        }
      }
    } catch (err) {
      console.error('Error rendering details:', err);
    } finally {
      Utils.hideLoading();
    }
  },

  // 5. Dynamic Hotel Profile Synchronizer
  async loadHotelProfileInfo() {
    try {
      const hotelsData = await DB.get('hotels');
      if (!hotelsData) return;
      const hotel = Object.values(hotelsData)[0];
      if (!hotel) return;

      // Update phone, address, email, hours across public elements if present (excluding navbar brand)
      document.querySelectorAll('.hotel-dyn-name:not(.brand-text)').forEach(el => el.textContent = hotel.name);
      document.querySelectorAll('.hotel-dyn-tagline').forEach(el => el.textContent = hotel.tagline || '');
      document.querySelectorAll('.hotel-dyn-phone').forEach(el => {
        el.textContent = hotel.phone;
        if (el.tagName === 'A') el.href = `tel:${hotel.phone}`;
      });
      document.querySelectorAll('.hotel-dyn-email').forEach(el => {
        el.textContent = hotel.email;
        if (el.tagName === 'A') el.href = `mailto:${hotel.email}`;
      });
      document.querySelectorAll('.hotel-dyn-address').forEach(el => el.textContent = hotel.address);
      document.querySelectorAll('.hotel-dyn-hours').forEach(el => {
        el.textContent = `${hotel.openingTime || '08:00 AM'} - ${hotel.closingTime || '10:00 PM'}`;
      });
      document.querySelectorAll('.hotel-dyn-about-text').forEach(el => el.textContent = hotel.aboutText || hotel.description);
    } catch (e) {
      // Non-blocking
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  FoodService.init();
});
