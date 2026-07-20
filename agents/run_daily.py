#!/usr/bin/env python3
"""每日全流程调度入口——增强版

用法: python3 run_daily.py
等同: python3 eve_enhanced.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from eve_enhanced import EveEnhanced

if __name__ == "__main__":
    eve = EveEnhanced()
    report = eve.run_daily_enhanced()
    
    # 检查P0异常
    p0_issues = []
    if "all_healthy" in report and "False" in report:
        p0_issues.append("ECS服务异常")
    
    if p0_issues:
        import urllib.request
        msg = "+".join(p0_issues)
        try:
            urllib.request.urlopen(
                f"https://api.day.app/LxB8pdfWq9q72fguikNQoa/Eve增强日报P0告警/{msg}",
                timeout=5
            )
            print(f"\n📱 Bark推送: {msg}")
        except:
            pass
    
    print("\n✅ 增强版每日全流程完成")
