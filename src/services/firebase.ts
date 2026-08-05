import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig, COLLECTIONS } from '@shared/firebase-config';
import type { Product } from '@shared/types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Fetch all available products
export async function getProducts(): Promise<Product[]> {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const q = query(
    productsRef,
    where('isAvailable', '==', true),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}

// Fetch products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const q = query(
    productsRef,
    where('isAvailable', '==', true),
    where('category', '==', category),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}
