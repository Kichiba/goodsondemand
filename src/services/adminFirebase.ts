// Admin write operations for the inventory manager.
// Mirrors the phone app's services/firebase.ts so behavior stays consistent.

import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getApp } from 'firebase/app';

import { COLLECTIONS } from '@shared/firebase-config';
import type { Product, Order, OrderStatus } from '@shared/types';

// Reuse the Firebase app already initialized in services/firebase.ts
const app = getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

// ============ AUTH ============

export function adminLogin(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function adminLogout() {
  return signOut(auth);
}

export function onAdminAuthChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

// ============ PRODUCTS ============

export function subscribeToProducts(callback: (products: Product[]) => void): Unsubscribe {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const q = query(productsRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
    callback(products);
  });
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  return addDoc(productsRef, {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, id);
  return updateDoc(productRef, { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id: string) {
  const productRef = doc(db, COLLECTIONS.PRODUCTS, id);
  return deleteDoc(productRef);
}

// ============ ORDERS ============

export function subscribeToOrders(callback: (orders: Order[]) => void): Unsubscribe {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];
    callback(orders);
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  orderItems?: { productId: string; quantity: number }[]
) {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  await updateDoc(orderRef, { status, updatedAt: serverTimestamp() });

  // Keep the customer-facing invoice status in sync (best effort).
  try {
    const invoiceRef = doc(db, COLLECTIONS.INVOICES, orderId);
    await updateDoc(invoiceRef, { status });
  } catch {
    // Older orders may not have an invoice doc; ignore.
  }

  // Deduct stock when an order is marked paid
  if (status === 'paid' && orderItems) {
    for (const item of orderItems) {
      const productRef = doc(db, COLLECTIONS.PRODUCTS, item.productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const currentStock = productSnap.data().stock || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        await updateDoc(productRef, {
          stock: newStock,
          isAvailable: newStock > 0,
          updatedAt: serverTimestamp(),
        });
      }
    }
  }

  // Restore stock if a previously-paid order is cancelled
  if (status === 'cancelled' && orderItems) {
    for (const item of orderItems) {
      const productRef = doc(db, COLLECTIONS.PRODUCTS, item.productId);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const currentStock = productSnap.data().stock || 0;
        await updateDoc(productRef, {
          stock: currentStock + item.quantity,
          isAvailable: true,
          updatedAt: serverTimestamp(),
        });
      }
    }
  }
}

export async function deleteOrder(orderId: string) {
  const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
  await deleteDoc(orderRef);
  // Also remove the public invoice, if present.
  try {
    await deleteDoc(doc(db, COLLECTIONS.INVOICES, orderId));
  } catch {
    // ignore if it doesn't exist
  }
}
