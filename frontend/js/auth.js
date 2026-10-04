/**
 * Food in Forest - Customer Authentication & Access Control
 */

const AuthService = {
  currentUser: null,
  userProfile: null,

  init() {
    if (typeof window.Auth === 'undefined') {
      console.error('Auth helper not available.');
      return;
    }

    // Monitor Firebase Auth State
    window.Auth.onAuthStateChanged((user, profile) => {
      this.currentUser = user;
      this.userProfile = profile;
      this.updateNavbarUI();
      this.handleProtectedRoutes();
    });

    this.bindEvents();
  },

  bindEvents() {
    // Customer Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Customer Register Form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Customer Profile Update Form
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
    }

    // Global Logout buttons
    document.addEventListener('click', (e) => {
      if (e.target.matches('.btn-logout') || e.target.closest('.btn-logout')) {
        e.preventDefault();
        this.handleLogout();
      }
    });
  },

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const submitBtn = document.getElementById('login-submit-btn');

    if (!email || !password) {
      Toast.warning('Please enter both email and password.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Signing In...';
    }

    try {
      const result = await Auth.login(email, password);
      
      // Determine user role from Firebase profile
      let role = result.profile ? result.profile.role : 'user';
      if (!role && result.user) {
        try {
          const fresh = await DB.get(`users/${result.user.uid}`);
          role = fresh ? fresh.role : 'user';
        } catch (e) {
          console.warn('Could not read user profile role:', e);
        }
      }

      if (role === 'admin') {
        Toast.success('Admin verified successfully! Redirecting to Admin Dashboard...');
        setTimeout(() => {
          window.location.href = 'admin-dashboard.html';
        }, 600);
      } else {
        Toast.success('Logged in successfully! Welcome back.');
        const redirectUrl = Utils.getQueryParam('redirect') || 'index.html';
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 700);
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMsg = error.message || 'Invalid email or password.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMsg = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed login attempts. Please try again later.';
      } else if (error.code === 'auth/api-key-not-valid') {
        errorMsg = 'Firebase API Key is invalid or restricted. Please copy your valid Web API Key from Firebase Console > Project Settings into frontend/js/firebase-config.js.';
      }
      Toast.error(errorMsg, 6000);
    } finally {


      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Sign In';
      }
    }
  },

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const submitBtn = document.getElementById('reg-submit-btn');

    if (!name || !email || !phone || !password) {
      Toast.warning('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      Toast.warning('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Toast.warning('Passwords do not match.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Creating Account...';
    }

    try {
      await Auth.register(email, password, {
        name: name,
        phone: phone,
        address: ''
      });

      Toast.success('Account created successfully! Welcome to Food in Forest.');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    } catch (error) {
      console.error('Registration error:', error);
      Toast.error(error.message || 'Unable to create account. Please try again.', 5000);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Create Account';
      }
    }
  },


  async handleProfileUpdate(e) {
    e.preventDefault();
    if (!this.currentUser) {
      Toast.error('You must be logged in to update your profile.');
      return;
    }

    const name = document.getElementById('profile-name').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();
    const address = document.getElementById('profile-address').value.trim();
    const submitBtn = document.getElementById('profile-save-btn');

    if (!name) {
      Toast.warning('Name cannot be empty.');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Saving Changes...';
    }

    try {
      await DB.update(`users/${this.currentUser.uid}`, {
        name,
        phone,
        address,
        updatedAt: new Date().toISOString()
      });

      Toast.success('Profile updated successfully!');
      this.userProfile = {
        ...this.userProfile,
        name,
        phone,
        address
      };
      this.updateNavbarUI();
    } catch (error) {
      console.error('Profile update failed:', error);
      Toast.error('Failed to update profile. Please try again.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = 'Save Profile Changes';
      }
    }
  },

  async handleLogout() {
    try {
      await Auth.logout();
      Toast.info('You have been logged out.');
      // If currently on a protected customer page, redirect to home
      const protectedPages = ['profile.html', 'orders.html', 'checkout.html'];
      const curPage = window.location.pathname.split('/').pop();
      if (protectedPages.includes(curPage)) {
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      } else {
        this.updateNavbarUI();
      }
    } catch (error) {
      Toast.error('Logout failed.');
    }
  },

  updateNavbarUI() {
    const authContainer = document.getElementById('nav-auth-container');
    const mobileAuthContainer = document.getElementById('mobile-nav-auth');

    if (this.currentUser) {
      const displayName = this.userProfile?.name || this.currentUser.email.split('@')[0];
      const navHtml = `
        <div class="user-dropdown">
          <button class="user-dropdown-btn" id="userMenuBtn">
            <span class="user-avatar-icon">🌿</span>
            <span class="user-display-name">${Utils.escapeHtml(displayName)}</span>
            <span class="dropdown-arrow">▾</span>
          </button>
          <div class="user-dropdown-menu" id="userMenuDropdown">
            <a href="profile.html" class="dropdown-item">👤 My Profile</a>
            <a href="orders.html" class="dropdown-item">📦 My Orders</a>
            <hr class="dropdown-divider">
            <button class="dropdown-item btn-logout text-danger">🚪 Logout</button>
          </div>
        </div>
      `;

      if (authContainer) authContainer.innerHTML = navHtml;
      if (mobileAuthContainer) {
        mobileAuthContainer.innerHTML = `
          <div class="mobile-user-info">
            <p>Signed in as <strong>${Utils.escapeHtml(displayName)}</strong></p>
            <div class="mobile-user-links">
              <a href="profile.html" class="btn btn-secondary btn-sm">My Profile</a>
              <a href="orders.html" class="btn btn-secondary btn-sm">My Orders</a>
              <button class="btn btn-outline-danger btn-sm btn-logout">Logout</button>
            </div>
          </div>
        `;
      }

      // Dropdown toggle handler
      const menuBtn = document.getElementById('userMenuBtn');
      const menuDropdown = document.getElementById('userMenuDropdown');
      if (menuBtn && menuDropdown) {
        menuBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          menuDropdown.classList.toggle('show');
        });
        document.addEventListener('click', () => {
          menuDropdown.classList.remove('show');
        });
      }
    } else {
      const guestHtml = `
        <a href="login.html" class="btn btn-outline-forest btn-sm">Sign In</a>
        <a href="register.html" class="btn btn-primary btn-sm">Register</a>
      `;
      if (authContainer) authContainer.innerHTML = guestHtml;
      if (mobileAuthContainer) {
        mobileAuthContainer.innerHTML = `
          <div class="mobile-guest-links">
            <a href="login.html" class="btn btn-outline-forest btn-block">Sign In</a>
            <a href="register.html" class="btn btn-primary btn-block">Register</a>
          </div>
        `;
      }
    }
  },

  handleProtectedRoutes() {
    const page = window.location.pathname.split('/').pop();
    const protectedPages = ['profile.html', 'orders.html', 'checkout.html'];

    if (protectedPages.includes(page) && !this.currentUser) {
      // Delay slightly to give auth state a chance to restore from session storage
      setTimeout(() => {
        if (!Auth.getCurrentUser()) {
          Toast.warning('Please sign in to view this page.');
          window.location.href = `login.html?redirect=${encodeURIComponent(page)}`;
        }
      }, 600);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AuthService.init();
});
