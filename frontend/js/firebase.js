/**
 * Food in Forest - Firebase Centralized Integration Layer
 * Unified Auth and Realtime Database helper functions.
 */

(function() {
  // Ensure Firebase scripts are loaded
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded. Ensure Firebase scripts are included before firebase.js');
    return;
  }

  // Initialize Firebase App if not already initialized
  if (!firebase.apps.length) {
    if (typeof firebaseConfig === 'undefined') {
      console.error('firebaseConfig not found. Ensure firebase-config.js is loaded.');
      return;
    }
    firebase.initializeApp(firebaseConfig);
  }

  const app = firebase.app();
  const auth = firebase.auth();
  const database = firebase.database();

  // Database helper methods
  const DB = {
    ref(path) {
      return database.ref(path);
    },

    // Read once
    async get(path) {
      try {
        const snapshot = await database.ref(path).once('value');
        return snapshot.val();
      } catch (error) {
        console.error(`Error reading ${path}:`, error);
        throw error;
      }
    },

    // Write / overwrite
    async set(path, data) {
      try {
        await database.ref(path).set(data);
        return true;
      } catch (error) {
        console.error(`Error writing ${path}:`, error);
        throw error;
      }
    },

    // Update partial fields
    async update(path, data) {
      try {
        await database.ref(path).update(data);
        return true;
      } catch (error) {
        console.error(`Error updating ${path}:`, error);
        throw error;
      }
    },

    // Delete node
    async remove(path) {
      try {
        await database.ref(path).remove();
        return true;
      } catch (error) {
        console.error(`Error removing ${path}:`, error);
        throw error;
      }
    },

    // Push new item with auto key
    async push(path, data) {
      try {
        const newRef = database.ref(path).push();
        await newRef.set({ ...data, id: newRef.key });
        return newRef.key;
      } catch (error) {
        console.error(`Error pushing to ${path}:`, error);
        throw error;
      }
    },

    // Real-time listener
    listen(path, callback) {
      const ref = database.ref(path);
      ref.on('value', (snapshot) => {
        callback(snapshot.val());
      }, (error) => {
        console.error(`Realtime listener error on ${path}:`, error);
      });
      return () => ref.off('value');
    },

    // Query helper
    query(path, orderByChild, equalToVal) {
      let q = database.ref(path);
      if (orderByChild) {
        q = q.orderByChild(orderByChild);
      }
      if (equalToVal !== undefined) {
        q = q.equalTo(equalToVal);
      }
      return q.once('value').then(snap => snap.val());
    }
  };

  // Realtime Database-driven Authentication & Session Management
  const Auth = {
    _sessionKey: 'fif_active_session_user',
    _userIdKey: 'fif_logged_user_id',
    _authListeners: [],

    // 1. Register user directly in RTDB users/{uid}
    async register(email, password, profileData = {}) {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail || !password) {
        throw new Error('Please enter both email and password.');
      }

      // Check if email already exists in RTDB users
      const users = await DB.get('users') || {};
      for (const key in users) {
        if (users[key] && users[key].email && users[key].email.trim().toLowerCase() === cleanEmail) {
          throw new Error('An account with this email already exists. Please log in.');
        }
      }

      // Generate unique user ID
      const newUid = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
      
      const userRecord = {
        uid: newUid,
        id: newUid,
        name: profileData.name || email.split('@')[0],
        email: cleanEmail,
        phone: profileData.phone || '',
        password: password,
        address: profileData.address || '',
        role: 'user', // Default role is strictly normal user
        createdAt: new Date().toISOString()
      };

      // Save to Firebase Realtime Database
      await DB.set(`users/${newUid}`, userRecord);

      // Save session in localStorage
      this._setSession(userRecord);
      return userRecord;
    },

    // 2. Login user by validating credentials against RTDB users
    async login(email, password) {
      const cleanEmail = (email || '').trim().toLowerCase();
      if (!cleanEmail || !password) {
        throw new Error('Please enter both email and password.');
      }

      const users = await DB.get('users');
      if (!users || typeof users !== 'object') {
        throw new Error('Invalid email or password.');
      }

      let matchedUser = null;
      for (const key in users) {
        const u = users[key];
        if (u && u.email && u.email.trim().toLowerCase() === cleanEmail) {
          // Verify password match if password field is stored in user object
          if (!u.password || u.password === password) {
            matchedUser = { ...u, uid: u.uid || u.id || key };
            break;
          }
        }
      }

      if (!matchedUser) {
        throw new Error('Invalid email or password.');
      }

      // Save session in localStorage
      this._setSession(matchedUser);
      return { user: matchedUser, profile: matchedUser };
    },

    // 3. Logout user
    async logout() {
      localStorage.removeItem(this._sessionKey);
      localStorage.removeItem(this._userIdKey);
      this._notifyListeners(null, null);
      return true;
    },

    // 4. Get Current Logged In User from session
    getCurrentUser() {
      const session = localStorage.getItem(this._sessionKey);
      if (session) {
        try {
          return JSON.parse(session);
        } catch (e) {
          return null;
        }
      }
      return null;
    },

    getLoggedUserId() {
      return localStorage.getItem(this._userIdKey);
    },

    // 5. Auth State Listener with RTDB synchronization
    onAuthStateChanged(callback) {
      this._authListeners.push(callback);

      const cachedUser = this.getCurrentUser();
      if (cachedUser && cachedUser.uid) {
        callback(cachedUser, cachedUser);
        
        // Sync with live RTDB record asynchronously to ensure up-to-date role/profile
        DB.get(`users/${cachedUser.uid}`).then(freshProfile => {
          if (freshProfile) {
            const updated = { ...freshProfile, uid: cachedUser.uid };
            this._setSession(updated, false);
            callback(updated, updated);
          }
        }).catch(() => {
          // Non-blocking
        });
      } else {
        callback(null, null);
      }

      return () => {
        this._authListeners = this._authListeners.filter(cb => cb !== callback);
      };
    },

    _setSession(userRecord, notify = true) {
      if (!userRecord) return;
      localStorage.setItem(this._sessionKey, JSON.stringify(userRecord));
      localStorage.setItem(this._userIdKey, userRecord.uid || userRecord.id);
      if (notify) {
        this._notifyListeners(userRecord, userRecord);
      }
    },

    _notifyListeners(user, profile) {
      this._authListeners.forEach(cb => {
        try { cb(user, profile); } catch(e){}
      });
    },

    // Get user profile from RTDB
    async getUserProfile(uid) {
      if (!uid) return null;
      return await DB.get(`users/${uid}`);
    }
  };



  // Auto seed helper if database is fresh
  const SeedService = {
    async _fetchSeedData() {
      // 1. Check if embedded seed data is available globally
      if (typeof window !== 'undefined' && window.DEFAULT_SEED_DATA) {
        return JSON.parse(JSON.stringify(window.DEFAULT_SEED_DATA));
      }

      // 2. Try fetching from known local and static server paths
      const paths = [
        '../js/seed-data.js',
        '../firebase/seed-data.json',
        'firebase/seed-data.json',
        '/firebase/seed-data.json',
        '../seed-data.json',
        'seed-data.json',
        '/seed-data.json'
      ];
      for (const p of paths) {
        try {
          const res = await fetch(p);
          if (res.ok) {
            return await res.json();
          }
        } catch (e) {}
      }

      // 3. Fallback hardcoded minimal seed if everything else fails
      if (typeof window !== 'undefined' && window.DEFAULT_SEED_DATA) {
        return window.DEFAULT_SEED_DATA;
      }
      throw new Error('Seed data could not be loaded. Please ensure js/seed-data.js is included.');
    },

    async checkAndSeed() {
      try {
        const foods = await DB.get('foods');
        if (!foods || Object.keys(foods).length === 0) {
          console.log('No food records detected in Firebase. Fetching default seed data...');
          try {
            const seedData = await this._fetchSeedData();
            if (seedData) {
              await database.ref().update(seedData);
              console.log('Database successfully seeded with default Food in Forest items!');
            }
          } catch (fetchErr) {
            console.warn('Could not auto-fetch seed data:', fetchErr);
          }
        }
      } catch (e) {
        console.warn('Seed check completed with status:', e.message);
      }
    },

    async forceSeed(onProgress) {
      try {
        const seedData = await this._fetchSeedData();
        if (!seedData) {
          throw new Error('Seed data is empty or could not be loaded.');
        }

        const report = (msg) => {
          if (typeof onProgress === 'function') onProgress(msg);
          console.log('[SeedService]', msg);
        };

        report('Uploading 7 food categories...');
        if (seedData.categories) await database.ref('categories').set(seedData.categories);

        report('Uploading 14+ forest dishes...');
        if (seedData.foods) await database.ref('foods').set(seedData.foods);

        report('Uploading eco-resort profile...');
        if (seedData.hotels) await database.ref('hotels').set(seedData.hotels);

        report('Uploading promotional offers...');
        if (seedData.offers) await database.ref('offers').set(seedData.offers);

        report('Uploading restaurant settings...');
        if (seedData.settings) await database.ref('settings').set(seedData.settings);

        // Ensure default admin user is present
        report('Configuring admin authorization...');
        const existingUsers = await DB.get('users');
        if (!existingUsers || Object.keys(existingUsers).length === 0) {
          if (seedData.users) await database.ref('users').set(seedData.users);
        } else if (seedData.users && seedData.users['admin-user-001']) {
          await database.ref('users/admin-user-001').set(seedData.users['admin-user-001']);
        }

        report('Database successfully seeded!');
        return true;
      } catch (e) {
        console.error('Force seed failed:', e);
        throw e;
      }
    }
  };

  // Expose globally
  window.FirebaseApp = app;
  window.FirebaseAuth = auth;
  window.FirebaseDB = database;
  window.DB = DB;
  window.Auth = Auth;
  window.SeedService = SeedService;

})();
