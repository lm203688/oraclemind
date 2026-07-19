/**
 * 每日运程推送 API
 * 仅注册用户可用——通过NextAuth session验证
 * 非注册用户返回401
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // 1. 验证注册用户
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json(
      { 
        error: 'Daily forecast is available for registered users only',
        hint: 'Sign up for free to get your daily forecast',
      },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  
  // 2. 检查今日是否已获取
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const existing = await prisma.dailyForecast.findFirst({
    where: {
      userId,
      date: { gte: today },
    },
  });

  if (existing) {
    return NextResponse.json({
      status: 'cached',
      forecast: existing,
    });
  }

  // 3. 生成今日运程（调用AI）
  const userEvents = await prisma.lifeEvent.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });

  const eventSummary = userEvents
    .map(e => `${e.type}: ${e.title}`)
    .join('; ');

  const today_date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  // 用GLM-4生成运程
  const prompt = `You are an ancient oracle combined with modern AI. Generate a daily forecast for a user.

User's recent life events: ${eventSummary || 'No recent events'}
Today: ${today_date}

Generate a mystical but practical daily forecast with:
1. Overall energy (1-100)
2. Luck areas (career/love/health/finance - rate each 1-5 stars)
3. A mystical message (combine Eastern wisdom with modern insight)
4. What to avoid today
5. What to embrace today

Format as JSON. Keep it mysterious but actionable. Add a touch of Eastern mysticism.`;

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ZAI_API_KEY || process.env.GLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    
    let forecast;
    try {
      forecast = JSON.parse(content);
    } catch {
      forecast = {
        overallEnergy: 75,
        message: content.slice(0, 200),
        luckAreas: { career: 4, love: 3, health: 4, finance: 3 },
        avoid: 'Rushing important decisions',
        embrace: 'Listening to your intuition',
      };
    }

    // 4. 存入数据库
    const saved = await prisma.dailyForecast.create({
      data: {
        userId,
        date: new Date(),
        forecast: JSON.stringify(forecast),
      },
    });

    return NextResponse.json({
      status: 'success',
      date: today_date,
      forecast,
    });
  } catch (error) {
    // Fallback——生成基础运程
    const fallback = {
      overallEnergy: 70 + Math.floor(Math.random() * 20),
      message: 'The stars align in your favor today. Trust the path you are on.',
      luckAreas: {
        career: 3 + Math.floor(Math.random() * 3),
        love: 3 + Math.floor(Math.random() * 3),
        health: 3 + Math.floor(Math.random() * 3),
        finance: 3 + Math.floor(Math.random() * 3),
      },
      avoid: 'Negative self-talk',
      embrace: 'New opportunities disguised as challenges',
    };

    return NextResponse.json({
      status: 'fallback',
      date: today_date,
      forecast: fallback,
    });
  }
}
