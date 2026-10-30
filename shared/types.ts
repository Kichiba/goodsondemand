// Product categories available in the store
export type ProductCategory =
  | 'bags'
  | 'wallets'
  | 'perfumes'
  | 'clothes'
  | 'belts'
  | 'accessories'
  | 'towels'
  | 'kitchenwares'
  | 'body-beauty'
  | 'watch'
  | 'other';

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
  salePrice?: number | null;
  costPrice?: number | null;
  promoLabel?: string | null;
  layaway?: {
    enabled: boolean;
    amountPerPayday: number;
    numberOfMonths: number;
  } | null;
  category: ProductCategory;
  images: string[];
  imageLabels?: string[];    // Caption for each image, aligned by index with `images`
  datePurchased?: string | null;    // ISO date (YYYY-MM-DD) when the product was bought
  country?: string | null;          // Country where the product was bought
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
  originalPrice?: number;    // Original price before sale (for display)
  quantity: number;
  image?: string;
}
