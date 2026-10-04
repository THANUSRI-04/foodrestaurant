/**
 * Food in Forest - Firebase Configuration
 * Contains project connection keys and database reference URL.
 */

const firebaseConfig = {
  apiKey: "AIzaSyCDPpkDnuiueLVbrzdZx6HMF6uLs8CqHA",
  authDomain: "food-in-forest.firebaseapp.com",
  projectId: "food-in-forest",
  storageBucket: "food-in-forest.firebasestorage.app",
  messagingSenderId: "930097862545",
  appId: "1:930097862545:web:b3c31ac9df2c84343e6c30",
  measurementId: "G-LDZPX0JLJW",
  databaseURL: "https://food-in-forest-default-rtdb.firebaseio.com/"
};

// Expose configuration globally if needed
if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
}
