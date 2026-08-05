import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { firebaseConfig, COLLECTIONS } from '@shared/firebase-config';
import type { Product } from '@shared/types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Fetch all available products
export async function getProducts(): Promise<Product[]> {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  const q = query(productsRef, orderBy('createdAt', 'desc'));

  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  // Filter on client side to avoid needing composite index
  return products.filter((p) => p.isAvailable !== false);
}
