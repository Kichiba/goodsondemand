// Firebase configuration
// Replace these values with your actual Firebase project config
// Get these from: Firebase Console → Project Settings → General → Your apps → Firebase SDK snippet

export const firebaseConfig = {
  apiKey: 'AIzaSyDaM4QI5DqRbCwlW6K986HGbXEfbpnsmyY',
  authDomain: 'good-on-demand.firebaseapp.com',
  projectId: 'good-on-demand',
  storageBucket: 'good-on-demand.firebasestorage.app',
  messagingSenderId: '864831931100',
  appId: '1:864831931100:web:56d8bc73b1c16c24912a19',
};

// Firestore collection names
export const COLLECTIONS = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CATEGORIES: 'categories',
} as const;

// Firebase Storage paths
export const STORAGE_PATHS = {
  PRODUCT_IMAGES: 'products',
  PAYMENT_QR: 'payment-qr',
} as const;
