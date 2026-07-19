import { NextResponse } from 'next/server';

// ALB 健康检查端点
// 返回 200，确保 ALB 认为容器健康，持续转发流量
export function GET() {
  return NextResponse.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
