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
  { id: 'towels', name: 'Towels', icon: 'box' },
  { id: 'kitchenwares', name: 'Kitchenwares', icon: 'box' },
  { id: 'body-beauty', name: 'Body & Beauty', icon: 'spray-can' },
  { id: 'watch', name: 'Watch', icon: 'gem' },
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

// Calculate how long ago a product was purchased, based on an ISO date
// (YYYY-MM-DD) up to today. Returns a human-readable string like
// "3 months, 12 days" or null if the date is missing/invalid.
export function calculateAgeing(datePurchased?: string): string | null {
  if (!datePurchased) return null;

  const purchased = new Date(datePurchased);
  if (isNaN(purchased.getTime())) return null;

  const now = new Date();
  if (purchased > now) return '0 days';

  let years = now.getFullYear() - purchased.getFullYear();
  let months = now.getMonth() - purchased.getMonth();
  let days = now.getDate() - purchased.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);

  return parts.length > 0 ? parts.join(', ') : '0 days';
}

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
  customerContact: string,
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
Contact #: ${customerContact}

Payment: Sent via BPI InstaPay (screenshot attached below)

Please confirm my order. Thank you!`;

  return `${MESSENGER_LINK}?text=${encodeURIComponent(message)}`;
}
