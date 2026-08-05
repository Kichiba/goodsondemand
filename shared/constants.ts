import type { ProductCategory } from './types';

// Facebook Page ID for Messenger integration
// This is used to generate m.me links for order submission
export const FACEBOOK_PAGE_ID = '100063829217498';

// Messenger deep link base URL
export const MESSENGER_LINK = `https://m.me/${FACEBOOK_PAGE_ID}`;

// Product categories with display info
export const CATEGORIES: { id: ProductCategory; name: string; icon: string }[] = [
  { id: 'bags', name: 'Bags', icon: 'shopping-bag' },
  { id: 'wallets', name: 'Wallets', icon: 'wallet' },
  { id: 'perfumes', name: 'Perfumes & Mist', icon: 'spray-can' },
  { id: 'clothes', name: 'Clothes', icon: 'tshirt' },
  { id: 'belts', name: 'Belts', icon: 'belt' },
  { id: 'accessories', name: 'Accessories', icon: 'gem' },
  { id: 'other', name: 'Other', icon: 'box' },
];

// Order status display labels and colors
export const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b' },
  paid: { label: 'Paid', color: '#3b82f6' },
  shipped: { label: 'Shipped', color: '#8b5cf6' },
  completed: { label: 'Completed', color: '#10b981' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
} as const;

// Currency configuration
export const CURRENCY = {
  code: 'PHP',
  symbol: '₱',
  locale: 'en-PH',
};

// Format price with peso sign
export function formatPrice(amount: number): string {
  return `${CURRENCY.symbol}${amount.toLocaleString(CURRENCY.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Generate Messenger link with pre-filled order message
export function generateMessengerOrderLink(
  customerName: string,
  items: { name: string; quantity: number; price: number }[],
  total: number
): string {
  const itemLines = items
    .map((item) => `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`)
    .join('\n');

  const message = `Hi Goods On Demand! I'd like to place an order:

ORDER DETAILS:
${itemLines}

Total Amount: ${formatPrice(total)}

Customer: ${customerName}

Payment: Sent via BPI InstaPay (screenshot attached below)

Please confirm my order. Thank you!`;

  return `${MESSENGER_LINK}?text=${encodeURIComponent(message)}`;
}
