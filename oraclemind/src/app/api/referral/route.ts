/**
 * 推荐奖励API
 * 用户邀请1人注册→双方各+3次免费预测
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const { referredUserId } = await req.json();
  
  // 检查是否已奖励
  const existing = await prisma.referral.findFirst({
    where: { referrerId: session.user.id, referredId: referredUserId },
  });
  
  if (existing) {
    return NextResponse.json({ status: 'already_rewarded' });
  }
  
  // 创建推荐记录
  await prisma.referral.create({
    data: {
      referrerId: session.user.id,
      referredId: referredUserId,
      reward: '3_free_predictions',
    },
  });
  
  // 给双方各+3次免费额度
  await prisma.user.update({
    where: { id: session.user.id },
    data: { bonusPredictions: { increment: 3 } },
  });
  await prisma.user.update({
    where: { id: referredUserId },
    data: { bonusPredictions: { increment: 3 } },
  });
  
  return NextResponse.json({
    status: 'success',
    message: 'Both users received 3 bonus predictions!',
  });
}

export async function GET() {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }
  
  const referrals = await prisma.referral.findMany({
    where: { referrerId: session.user.id },
    include: { referred: { select: { name: true } } },
  });
  
  return NextResponse.json({
    totalReferrals: referrals.length,
    bonusEarned: referrals.length * 3,
    referrals: referrals.map(r => ({
      user: r.referred?.name,
      reward: r.reward,
      date: r.createdAt,
    })),
  });
}
