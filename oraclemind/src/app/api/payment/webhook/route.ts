/**
 * Creem Webhook Handler
 * Events: checkout.completed, subscription.active, subscription.canceled, license.created
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('creem-signature') || '';

  // TODO: Verify webhook signature when CREEM_WEBHOOK_SECRET is set
  // const expected = crypto.createHmac('sha256', process.env.CREEM_WEBHOOK_SECRET)
  //   .update(body).digest('hex');

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType = event.type || event.event_type;
  const data = event.data || event;

  try {
    switch (eventType) {
      case 'checkout.completed':
      case 'subscription.active': {
        const userId = data.metadata?.userId;
        const productId = data.product_id;
        
        if (userId) {
          // 更新用户订阅
          let tier = 'free';
          if (productId === 'prod_oraclemind_premium' || productId === 'prod_oraclemind_yearly') {
            tier = 'premium';
          } else if (productId === 'prod_oraclemind_deep') {
            tier = 'deep';
          }
          
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionTier: tier,
              subscriptionStatus: 'active',
              subscriptionEndsAt: productId === 'prod_oraclemind_yearly' 
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        }
        break;
      }

      case 'subscription.canceled': {
        const userId = data.metadata?.userId;
        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              subscriptionTier: 'free',
              subscriptionStatus: 'canceled',
            },
          });
        }
        break;
      }

      case 'license.created': {
        // 存储license key
        const userId = data.metadata?.userId;
        const licenseKey = data.license_key;
        if (userId && licenseKey) {
          await prisma.licenseKey.create({
            data: {
              userId,
              key: licenseKey,
              productId: data.product_id,
              status: 'active',
            },
          }).catch(() => {}); // 忽略重复key错误
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Creem webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
