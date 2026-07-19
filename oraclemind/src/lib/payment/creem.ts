/**
 * Creem Payment Integration
 * 
 * Products:
 * - Premium Monthly: $9.99/month (prod_oraclemind_premium)
 * - Deep Analysis: $4.99/analysis (prod_oraclemind_deep)
 * - Premium Yearly: $99/year (prod_oraclemind_yearly)
 */

const CREEM_API_KEY = process.env.CREEM_API_KEY || '';
const CREEM_BASE_URL = 'https://api.creem.io/v1';

export interface CreemProduct {
  id: string;
  name: string;
  price: number;
  billing: 'once' | 'every-month' | 'every-year';
}

export const PRODUCTS: CreemProduct[] = [
  {
    id: 'prod_oraclemind_premium',
    name: 'OracleMind Premium (Monthly)',
    price: 9.99,
    billing: 'every-month',
  },
  {
    id: 'prod_oraclemind_yearly',
    name: 'OracleMind Premium (Yearly)',
    price: 99.00,
    billing: 'every-year',
  },
  {
    id: 'prod_oraclemind_deep',
    name: 'OracleMind Deep Analysis',
    price: 4.99,
    billing: 'once',
  },
];

/**
 * Create checkout session
 */
export async function createCheckout(productId: string, userId: string, successUrl?: string) {
  const response = await fetch(`${CREEM_BASE_URL}/checkouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CREEM_API_KEY}`,
    },
    body: JSON.stringify({
      product_id: productId,
      request_id: `om_${userId}_${Date.now()}`,
      success_url: successUrl || 'https://oraclemind.io/dashboard?upgrade=success',
      metadata: { userId },
    }),
  });

  if (!response.ok) {
    throw new Error(`Creem checkout failed: ${response.status}`);
  }

  const data = await response.json();
  return data.checkout_url as string;
}

/**
 * Verify license key
 */
export async function verifyLicense(licenseKey: string) {
  const response = await fetch(`${CREEM_BASE_URL}/license-keys/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CREEM_API_KEY}`,
    },
    body: JSON.stringify({ license_key: licenseKey }),
  });

  if (!response.ok) {
    return { valid: false };
  }

  const data = await response.json();
  return {
    valid: data.valid || data.status === 'active',
    productId: data.product_id,
    userId: data.metadata?.userId,
  };
}

/**
 * Get product checkout URL (direct link)
 */
export function getProductUrl(productId: string): string {
  return `https://www.creem.io/product/${productId}`;
}
