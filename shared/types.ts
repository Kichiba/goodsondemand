// Product categories available in the store
export type ProductCategory = 'bags' | 'wallets' | 'perfumes' | 'clothes' | 'belts' | 'accessories' | 'other';

// Order status progression
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

// Generic timestamp interface (compatible with Firebase Timestamp)
export interface AppTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  images: string[];          // Firebase Storage URLs
  stock: number;
  isAvailable: boolean;
  createdAt: AppTimestamp;
  updatedAt: AppTimestamp;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;            // First product image for display
}

export interface Order {
  id: string;
  items: OrderItem[];
  customerName: string;
  customerContact: string;   // Messenger name or phone number
  totalAmount: number;
  status: OrderStatus;
  paymentProof?: string;     // Screenshot URL (optional)
  notes?: string;
  createdAt: AppTimestamp;
  updatedAt: AppTimestamp;
}

export interface Category {
  id: string;
  name: string;
  icon: string;              // Icon identifier (FontAwesome or similar)
  order: number;             // Display order
}

// Cart item for localStorage (storefront only)
export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}
