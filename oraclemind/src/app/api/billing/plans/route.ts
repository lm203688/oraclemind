import { NextResponse } from 'next/server';
import { getProductUrl } from '@/lib/payment/creem';

export async function GET() {
  return NextResponse.json({
    plans: [
      {
        name: 'Free',
        price: '$0',
        period: 'forever',
        features: [
          '5 predictions per day',
          '1 What-If analysis per IP',
          'Bazi calculation',
          'Daily forecast (registered)',
          'History & sharing',
        ],
        cta: 'Start Free',
      },
      {
        name: 'Premium',
        price: '$9.99',
        period: '/month',
        features: [
          'Unlimited L1 + L2 predictions',
          'Unlimited What-If',
          'Personal analysis (birth info)',
          'Detailed AI reasoning',
          'Priority speed',
          'Referral rewards (+3 per invite)',
        ],
        cta: 'Subscribe',
        checkoutUrl: getProductUrl('prod_oraclemind_premium'),
        highlight: true,
      },
      {
        name: 'Premium Yearly',
        price: '$99',
        period: '/year',
        features: [
          'All Premium features',
          'Save 17% vs monthly',
          '2 months free',
        ],
        cta: 'Subscribe Yearly',
        checkoutUrl: getProductUrl('prod_oraclemind_yearly'),
      },
      {
        name: 'Deep Analysis',
        price: '$4.99',
        period: '/analysis',
        features: [
          '5 modern AI agents × 5 ancient manuscripts',
          '5×5 cross-validation matrix',
          '8 rounds of deep reasoning',
          '3 scenario paths',
          'Full reasoning transparency',
          'Exportable report',
        ],
        cta: 'Get Deep Analysis',
        checkoutUrl: getProductUrl('prod_oraclemind_deep'),
      },
    ],
  });
}
