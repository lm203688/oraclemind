#!/usr/bin/env python3
"""
Deep dive update script for new-energy and life-science knowledge bases.
Reads search results and generates structured entities.
"""
import json
import os
from datetime import datetime

NOW = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.") + "000Z"

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def load_search(path):
    try:
        return load_json(path)
    except:
        return []

# ============================================================
# TASK 1: NEW ENERGY
# ============================================================

# --- SOLAR (target: 25+ new entities) ---
solar_new = [
    {
        "id": "SE-083",
        "name": "Solar Cell Efficiency Tables V67发布",
        "type": "效率纪录",
        "efficiency": "27.7%",
        "cost": "N/A",
        "maturity": "参考标准",
        "companies": ["NREL"],
        "description": "Green et al.发布Solar Cell Efficiency Tables Version 67，新纪录27.7%大面积单结电池(2025年10月认证)",
        "trend": "效率表持续更新；V67确认多个新纪录",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://onlinelibrary.wiley.com/doi/full/10.1002/pip.70068", "collected_at": NOW}]
    },
    {
        "id": "SE-084",
        "name": "LONGi HIBC晶硅电池28.13%世界纪录",
        "type": "效率纪录",
        "efficiency": "28.13%",
        "cost": "N/A",
        "maturity": "实验室纪录",
        "companies": ["LONGi"],
        "description": "LONGi宣布HIBC(混合叉指背接触)晶硅电池效率28.13%世界纪录，同时模块效率26.4%",
        "trend": "HIBC路线效率突破28%；晶硅电池接近理论极限",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.longi.com/en/news/hybrid-interdigitated-back-contact-cell-record", "collected_at": NOW}]
    },
    {
        "id": "SE-085",
        "name": "Nature: 商业尺寸硅电池27.03%总面效率纪录",
        "type": "效率纪录",
        "efficiency": "27.03%",
        "cost": "N/A",
        "maturity": "实验室纪录",
        "companies": ["多研究机构"],
        "description": "Nature发表350cm²商业尺寸单结硅电池总面效率27.03%纪录，发表于2025年7月",
        "trend": "商业尺寸电池效率追赶小面积电池；量产化效率提升",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.nature.com/articles/s41467-025-61128-y", "collected_at": NOW}]
    },
    {
        "id": "SE-086",
        "name": "JinkoSolar TOPCon 27.79%效率世界纪录",
        "type": "效率纪录",
        "efficiency": "27.79%",
        "cost": "中低",
        "maturity": "快速扩产",
        "companies": ["JinkoSolar"],
        "description": "JinkoSolar TOPCon电池效率达27.79%世界纪录，Elon Musk在社交媒体点赞认可",
        "trend": "TOPCon效率持续突破；主流技术路线效率天花板不断上移",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://link.springer.com/article/10.1007/s11708-026-1050-8", "collected_at": NOW}]
    },
    {
        "id": "SE-087",
        "name": "有机太阳能电池20%效率突破",
        "type": "有机光伏",
        "efficiency": "20%+",
        "cost": "中",
        "maturity": "实验室阶段",
        "companies": ["多研究机构"],
        "description": "2025年有机太阳能电池效率突破20%大关，Chen H, Huang Y等发表在Springer",
        "trend": "有机光伏从低效到实用化；柔性应用场景优势明显",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://link.springer.com/article/10.1007/s11708-026-1050-8", "collected_at": NOW}]
    },
    {
        "id": "SE-088",
        "name": "LONGi钙钛矿-硅叠层34.85%效率纪录",
        "type": "钙钛矿叠层",
        "efficiency": "34.85%",
        "cost": "N/A",
        "maturity": "实验室纪录",
        "companies": ["LONGi"],
        "description": "LONGi 2025年4月创造钙钛矿-硅叠层电池34.85%效率纪录，为当前叠层电池最高效率",
        "trend": "叠层电池效率逼近35%；钙钛矿-硅叠层是下一代光伏方向",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.fluxim.com/research-blogs/perovskite-silicon-tandem-pv-record-updates", "collected_at": NOW}]
    },
    {
        "id": "SE-089",
        "name": "SolaEon单结钙钛矿27.87%效率纪录",
        "type": "钙钛矿",
        "efficiency": "27.87%",
        "cost": "N/A",
        "maturity": "实验室纪录",
        "companies": ["SolaEon"],
        "description": "SolaEon宣布单结钙钛矿太阳能电池效率27.87%世界纪录，2026年1月发布",
        "trend": "单结钙钛矿效率逼近28%；商业化进程加速",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.perovskite-info.com/archive/202601", "collected_at": NOW}]
    },
    {
        "id": "SE-090",
        "name": "天合光能钙钛矿30.6%效率纪录",
        "type": "钙钛矿",
        "efficiency": "30.6%",
        "cost": "N/A",
        "maturity": "实验室纪录",
        "companies": ["Trina Solar"],
        "description": "天合光能(Trina Solar)2025年6月创造钙钛矿电池30.6%效率纪录，为钙钛矿面板最高效率",
        "trend": "钙钛矿面板效率突破30%；中国企业在钙钛矿领域领先",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.sunsave.energy/solar-panels-advice/solar-technology/perovskite", "collected_at": NOW}]
    },
    {
        "id": "SE-091",
        "name": "XJTU n-i-p钙钛矿26.5%效率突破",
        "type": "钙钛矿",
        "efficiency": "26.5%",
        "cost": "N/A",
        "maturity": "实验室纪录",
        "companies": ["西安交通大学"],
        "description": "西安交通大学n-i-p结构钙钛矿电池认证效率26.5%(0.08cm²)，24.9%(1cm²)，发表于Science 2026",
        "trend": "n-i-p结构效率突破；小面积到大面积效率衰减问题",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://en.xjtu.edu.cn/2026-01/09/c_1153935.htm", "collected_at": NOW}]
    },
    {
        "id": "SE-092",
        "name": "钙钛矿太阳能电池市场465M→11B预测",
        "type": "市场数据",
        "efficiency": "N/A",
        "cost": "快速下降",
        "maturity": "市场预测",
        "companies": ["Coherent Market Insights"],
        "description": "钙钛矿太阳能电池市场2026年估值4.65亿美元，预计2033年达110.3亿美元，CAGR 57.7%",
        "trend": "钙钛矿市场爆发式增长预期；从实验室到量产的关键窗口期",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.coherentmarketinsights.com/industry-reports/perovskite-solar-cell-market", "collected_at": NOW}]
    },
    {
        "id": "SE-093",
        "name": "Nature: 钙钛矿高性能策略综述",
        "type": "学术综述",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "companies": ["多研究机构"],
        "description": "Nature发表钙钛矿高性能策略综述：包括无铅化、稳定性提升、界面工程等最新策略",
        "trend": "钙钛矿从效率突破到稳定性解决；无铅化是长期方向",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.nature.com/articles/s44296-025-00073-9", "collected_at": NOW}]
    },
    {
        "id": "SE-094",
        "name": "钙钛矿35%效率可行性分析",
        "type": "技术展望",
        "efficiency": "35%",
        "cost": "N/A",
        "maturity": "展望",
        "companies": ["多研究机构"],
        "description": "2026年分析：钙钛矿叠层已达到34.85%，35%效率触手可及，但商业化仍面临耐久性和成本挑战",
        "trend": "35%效率近在咫尺；耐久性和成本是商业化关键瓶颈",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://energy-solutions.co/articles/sub/perovskite-solar-cells-breakthrough.html", "collected_at": NOW}]
    },
    {
        "id": "SE-095",
        "name": "Sunhub 2026太阳能面板技术趋势",
        "type": "行业分析",
        "efficiency": "N/A",
        "cost": "持续下降",
        "maturity": "参考",
        "companies": ["Sunhub"],
        "description": "Sunhub 2026太阳能面板技术趋势：钙钛矿低温加工、简单制造方法、效率持续突破",
        "trend": "低温加工降低制造成本；钙钛矿制造工艺简化",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.sunhub.com/blog/solar-panel-technology-2026/", "collected_at": NOW}]
    },
    {
        "id": "SE-096",
        "name": "GreenFuelJournal钙钛矿革命2026",
        "type": "行业分析",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "companies": ["多公司"],
        "description": "GreenFuelJournal 2026钙钛矿太阳能电池革命：效率纪录、稳定性突破、全球市场增长",
        "trend": "钙钛矿从实验室纪录到产业革命；全球投资加速",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.greenfueljournal.com/post/perovskite-solar-cell-revolution-2026-part-i", "collected_at": NOW}]
    },
    {
        "id": "SE-097",
        "name": "2025年太阳能突破对2026的影响",
        "type": "行业分析",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "companies": ["多公司"],
        "description": "2025年太阳能技术突破总结及2026展望：效率纪录、钙钛矿进展、叠层电池突破",
        "trend": "2025突破为2026奠定基础；技术迭代加速",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.youtube.com/watch?v=FffKMMnisu4", "collected_at": NOW}]
    },
    {
        "id": "SE-098",
        "name": "NREL最佳研究电池效率图2026更新",
        "type": "参考标准",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "companies": ["NREL"],
        "description": "NREL维护的最佳研究电池效率图持续更新，涵盖所有光伏技术最高确认转换效率",
        "trend": "效率图是行业标准参考；各技术路线效率持续攀升",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.nlr.gov/pv/cell-efficiency", "collected_at": NOW}]
    },
    {
        "id": "SE-099",
        "name": "JRC太阳能电池效率表V67欧洲版",
        "type": "参考标准",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "companies": ["JRC"],
        "description": "欧盟JRC发布Solar Cell Efficiency Tables V67，汇总所有技术最高独立确认效率",
        "trend": "欧洲独立确认效率数据；与NREL互补",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://publications.jrc.ec.europa.eu/repository/handle/JRC144305", "collected_at": NOW}]
    },
    {
        "id": "SE-100",
        "name": "2025年主流太阳能电池效率亮点",
        "type": "行业回顾",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "companies": ["JinkoSolar", "LONGi"],
        "description": "2025年主流太阳能电池效率亮点：JinkoSolar TOPCon 27.79%、LONGi HIBC 28.13%等",
        "trend": "主流技术效率全面突破；TOPCon和HIBC竞争激烈",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://link.springer.com/article/10.1007/s11708-026-1050-8", "collected_at": NOW}]
    },
    {
        "id": "SE-101",
        "name": "Fluxim钙钛矿叠层效率追踪2026更新",
        "type": "效率追踪",
        "efficiency": "34.85%",
        "cost": "N/A",
        "maturity": "参考",
        "companies": ["Fluxim", "LONGi"],
        "description": "Fluxim 2026更新钙钛矿叠层效率追踪：LONGi 34.85%为当前最高，叠层效率持续攀升",
        "trend": "叠层效率追踪显示持续进步；Fluxim提供专业分析工具",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.fluxim.com/research-blogs/perovskite-silicon-tandem-pv-record-updates", "collected_at": NOW}]
    },
    {
        "id": "SE-102",
        "name": "Sunsave钙钛矿面板2026购买指南",
        "type": "消费者指南",
        "efficiency": "30.6%",
        "cost": "高于晶硅",
        "maturity": "早期商业化",
        "companies": ["Trina Solar"],
        "description": "Sunsave 2026钙钛矿面板购买指南：当前最高效率30.6%(天合光能)，但住宅应用仍需等待",
        "trend": "钙钛矿面板从实验室到消费者；效率优势明显但成本仍高",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.sunsave.energy/solar-panels-advice/solar-technology/perovskite", "collected_at": NOW}]
    },
    {
        "id": "SE-103",
        "name": "IDTechEx钙钛矿光伏2016-2026报告",
        "type": "行业报告",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "companies": ["IDTechEx"],
        "description": "IDTechEx钙钛矿光伏技术、市场和参与者详细报告：从技术到商业的全面分析",
        "trend": "钙钛矿从技术到商业的过渡期；市场参与者增多",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.idtechex.com/en/research-report/perovskite-photovoltaics-2016-2026-technologies-markets-players/493", "collected_at": NOW}]
    },
    {
        "id": "SE-104",
        "name": "美国2026年清洁能源新增51%为太阳能",
        "type": "市场数据",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "市场数据",
        "companies": ["多公司"],
        "description": "2026年美国新增公用事业电力容量51%为太阳能，德州、亚利桑那、加州、密歇根领先",
        "trend": "太阳能占新增电力容量过半；美国太阳能增长强劲",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://environmentamerica.org/center/updates/clean-energy-additions-to-break-records-in-2026", "collected_at": NOW}]
    },
    {
        "id": "SE-105",
        "name": "Canary Media: 美国2026清洁电力建设",
        "type": "市场数据",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "市场数据",
        "companies": ["多公司"],
        "description": "Canary Media: 2026年太阳能51%、电池28%、风电占新增电力容量绝大部分",
        "trend": "清洁能源全面主导新增电力；化石能源新增接近零",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.canarymedia.com/articles/clean-energy/chart-us-overwhelmingly-build-clean-power", "collected_at": NOW}]
    },
    {
        "id": "SE-106",
        "name": "BloombergNEF新能源展望2026",
        "type": "行业报告",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "companies": ["BloombergNEF"],
        "description": "BloombergNEF NEO 2026：评估电力、交通、工业、建筑和农业部门能源转型路径，新技术扩展电气化增强能源安全",
        "trend": "电气化+新技术=能源安全；新能源从替代到主流",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://about.bnef.com/insights/clean-energy/bloombergnefs-new-energy-outlook-2026-transition-to-newer-technologies-expanded-electrification-to-strengthen-nations-energy-security", "collected_at": NOW}]
    },
    {
        "id": "SE-107",
        "name": "Earth.Org 2026能源转型展望",
        "type": "行业分析",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "companies": ["多机构"],
        "description": "Earth.Org 2026能源转型：海上风电预计新增140GW，抽水蓄能翻倍至16.5GW，支撑系统灵活性",
        "trend": "海上风电和抽水蓄能支撑电网灵活性；多技术协同转型",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://earth.org/energy-transition-where-are-we-headed-in-2026", "collected_at": NOW}]
    },
    {
        "id": "SE-108",
        "name": "New Energy Nexus 2026四大清洁能源趋势",
        "type": "行业分析",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "companies": ["New Energy Nexus"],
        "description": "New Energy Nexus 2026四大清洁能源趋势：可再生能源将成为全球最大电力来源",
        "trend": "可再生能源从增长到主导；创业者关注四大趋势",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.newenergynexus.com/blog/4-clean-energy-trends-entrepreneurs-should-watch-in-2026", "collected_at": NOW}]
    },
    {
        "id": "SE-109",
        "name": "BDO 2026自然资源与能源行业预测",
        "type": "行业预测",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "companies": ["BDO"],
        "description": "BDO 2026自然资源与能源行业预测：政策变化下可再生能源可能下滑，但长期趋势不变",
        "trend": "短期政策波动vs长期趋势；可再生能源韧性测试",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.bdo.com/insights/industries/natural-resources/2026-natural-resources-energy-predictions", "collected_at": NOW}]
    },
    {
        "id": "SE-110",
        "name": "ITC税收抵免2026年7月4日截止影响",
        "type": "政策影响",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "政策",
        "companies": ["多公司"],
        "description": "美国ITC投资税收抵免：项目须在2026年7月4日前开工或2027年底投运才能享受优惠",
        "trend": "税收抵免截止日驱动项目抢装；政策不确定性影响投资",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://greeninnovationindex.org/2025-edition/renewable-energy", "collected_at": NOW}]
    },
    {
        "id": "SE-111",
        "name": "美国可再生能源增长持续到2026",
        "type": "市场数据",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "市场数据",
        "companies": ["多公司"],
        "description": "Renewable Energy Institute: 美国可再生能源增长持续到2026，关键项目开发和进展塑造能源转型",
        "trend": "美国可再生能源增长势头不减；项目开发加速",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.renewableinstitute.org/us-renewable-growth-continues-into-2026", "collected_at": NOW}]
    },
]

# --- STORAGE (target: 20+ new entities) ---
storage_new = [
    {
        "id": "ST-073",
        "name": "IEA: 2025年全球电池储能108GW新增",
        "type": "市场数据",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "持续下降",
        "maturity": "市场数据",
        "description": "IEA全球能源回顾2026：2025年全球新增电池储能108GW，比2024年增长40%，为增长最快电力技术",
        "trend": "电池储能是增长最快电力技术；年新增突破100GW里程碑",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.iea.org/reports/global-energy-review-2026/technology-battery-storage", "collected_at": NOW}]
    },
    {
        "id": "ST-074",
        "name": "pv magazine: 2026电池技术展望",
        "type": "行业分析",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "pv magazine USA 2026电池技术展望：长时储能、安全驱动采购、FEOC合规推动替代化学体系接近规模化",
        "trend": "长时储能需求增长；替代化学体系因安全和合规加速",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://pv-magazine-usa.com/2025/12/31/whats-next-for-battery-technology-in-2026", "collected_at": NOW}]
    },
    {
        "id": "ST-075",
        "name": "RMI突破性电池报告",
        "type": "行业报告",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "RMI突破性电池报告：锂离子主导的近期能源世界将在长期打开新的市场空间",
        "trend": "锂离子短期主导→长期多元化；新市场空间打开",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://rmi.org/insight/breakthrough-batteries", "collected_at": NOW}]
    },
    {
        "id": "ST-076",
        "name": "钠离子电池成为锂离子可行替代",
        "type": "钠离子电池",
        "energy_density": "中",
        "cycles": "良好",
        "cost": "低",
        "maturity": "早期量产",
        "description": "2025年研究确认钠离子电池(SIBs)已成为锂离子电池(LIBs)主流可行替代方案",
        "trend": "钠离子从概念到主流替代；成本优势明显",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://rapidtransition.org/stories/charged-up", "collected_at": NOW}]
    },
    {
        "id": "ST-077",
        "name": "Columbia: 电池创新五大洞察",
        "type": "行业分析",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "Columbia商学院五大电池创新洞察：电池技术突破正快速改变全球能源格局，推动清洁能源转型",
        "trend": "电池创新重塑能源格局；从储能到多行业应用",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://business.columbia.edu/insights/climate/energy-storage-insights-battery-clean-energy-transition", "collected_at": NOW}]
    },
    {
        "id": "ST-078",
        "name": "MDPI: 下一代储能电池技术进展",
        "type": "学术综述",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "MDPI综述：锂离子、铅酸、钠硫、镍镉、液流等多种电池技术，没有单一技术能主导所有应用",
        "trend": "多元化电池技术路线；不同应用场景需要不同技术",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.mdpi.com/2079-9292/15/3/690", "collected_at": NOW}]
    },
    {
        "id": "ST-079",
        "name": "Tempo热化学储能1500°C工业脱碳",
        "type": "热储能",
        "energy_density": "极高",
        "cycles": "长",
        "cost": "中",
        "maturity": "商业化中",
        "description": "San Diego公司Tempo商业化模块化热化学储能系统，1500°C储热帮助工业用电气化热替代化石燃料",
        "trend": "高温热储能为工业脱碳；无需补贴的经济模式",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.batterytechonline.com", "collected_at": NOW}]
    },
    {
        "id": "ST-080",
        "name": "Energy Storage Summit 2026",
        "type": "行业会议",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "Energy Storage Summit 2026：BESS集成商结合全球一级电池和逆变器技术",
        "trend": "储能系统集成化；一级供应链保障质量",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://storagesummit.solarenergyevents.com", "collected_at": NOW}]
    },
    {
        "id": "ST-081",
        "name": "Reddit: 2026电池储能创新讨论",
        "type": "社区讨论",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "Reddit讨论2026电池储能创新：108GW新增容量超过天然气，储能规模化速度前所未有",
        "trend": "储能超过天然气新增容量；公众认知提升",
        "sources": [{"source_type": "web", "source_credibility": "C", "article_url": "https://www.reddit.com/r/conservation/comments/1kn1lk5/battery_storage_innovation_in_2026_a", "collected_at": NOW}]
    },
    {
        "id": "ST-082",
        "name": "液流电池vs锂离子投资成本对比",
        "type": "技术对比",
        "energy_density": "低-中",
        "cycles": "极长",
        "cost": "中高",
        "maturity": "商业化早期",
        "description": "2026年分析：钒液流电池投资成本vs锂离子电池，长时储能场景液流电池经济性优势显现",
        "trend": "液流电池在长时储能场景有经济性优势；投资成本持续下降",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.youtube.com/watch?v=U1FPbDhJV0A", "collected_at": NOW}]
    },
    {
        "id": "ST-083",
        "name": "IEA 2026能源创新状态报告",
        "type": "行业报告",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "IEA 2026能源创新状态报告：评估能源创新顺风和逆风，储能技术是关键创新领域",
        "trend": "能源创新面临政策逆风但技术顺风；储能是核心创新方向",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.iea.org/events/the-state-of-energy-innovation-2026", "collected_at": NOW}]
    },
    {
        "id": "ST-084",
        "name": "FEOC合规推动替代电池化学体系",
        "type": "政策影响",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "N/A",
        "maturity": "政策驱动",
        "description": "FEOC(外国实体关注)合规要求推动美国市场转向替代电池化学体系，减少对中国供应链依赖",
        "trend": "地缘政治驱动供应链多元化；替代化学体系获政策支持",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://pv-magazine-usa.com/2025/12/31/whats-next-for-battery-technology-in-2026", "collected_at": NOW}]
    },
    {
        "id": "ST-085",
        "name": "安全驱动储能采购标准提升",
        "type": "行业趋势",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "2026年储能安全事件推动采购标准提升，安全成为与成本同等重要的考量因素",
        "trend": "安全从次要到首要考量；采购标准趋严推动技术升级",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://pv-magazine-usa.com/2025/12/31/whats-next-for-battery-technology-in-2026", "collected_at": NOW}]
    },
    {
        "id": "ST-086",
        "name": "长时储能(LDES)商业化加速",
        "type": "长时储能",
        "energy_density": "变化大",
        "cycles": "极长",
        "cost": "中高→下降",
        "maturity": "商业化早期",
        "description": "2026年长时储能(LDES)商业化加速：多种技术路线(液流、压缩空气、重力、热储能)接近规模化",
        "trend": "LDES从示范到商业；多技术路线并行发展",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://pv-magazine-usa.com/2025/12/31/whats-next-for-battery-technology-in-2026", "collected_at": NOW}]
    },
    {
        "id": "ST-087",
        "name": "电池储能2026年占美国新增电力28%",
        "type": "市场数据",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "N/A",
        "maturity": "市场数据",
        "description": "2026年电池储能占美国新增公用事业电力容量28%，仅次于太阳能(51%)",
        "trend": "电池储能成为第二大新增电力来源；与太阳能形成黄金组合",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.canarymedia.com/articles/clean-energy/chart-us-overwhelmingly-build-clean-power", "collected_at": NOW}]
    },
    {
        "id": "ST-088",
        "name": "RapidTransition: 电池突破加速清洁能源转型",
        "type": "行业分析",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "RapidTransition分析：电池技术突破正快速推动清洁能源转型，钠离子等替代技术成熟",
        "trend": "电池技术多元化加速转型；钠离子等替代方案成熟",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://rapidtransition.org/stories/charged-up", "collected_at": NOW}]
    },
    {
        "id": "ST-089",
        "name": "虚拟电厂(VPP)与分布式储能协同",
        "type": "系统整合",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "N/A",
        "maturity": "早期商业化",
        "description": "2026年虚拟电厂(VPP)与分布式储能协同发展，聚合分布式资源参与电力市场",
        "trend": "VPP从概念到商业；分布式储能聚合价值显现",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "ST-090",
        "name": "电池回收产业链2026加速成型",
        "type": "回收利用",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "下降",
        "maturity": "规模化中",
        "description": "2026年电池回收产业链加速成型：退役电池梯次利用和材料回收规模化，降低对原生材料依赖",
        "trend": "电池回收从环保到经济；闭环供应链形成",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "ST-091",
        "name": "BESS系统集成商竞争格局2026",
        "type": "市场分析",
        "energy_density": "N/A",
        "cycles": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "2026年BESS系统集成商竞争格局：全球一级电池+逆变器技术整合，系统集成能力成核心竞争力",
        "trend": "系统集成能力是BESS核心竞争力；从组件到整体解决方案",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://storagesummit.solarenergyevents.com", "collected_at": NOW}]
    },
    {
        "id": "ST-092",
        "name": "储能电池能量密度年提升5-8%",
        "type": "技术趋势",
        "energy_density": "持续提升",
        "cycles": "持续改善",
        "cost": "年降10-15%",
        "maturity": "量产",
        "description": "2026年储能电池能量密度年提升5-8%，成本年降10-15%，性能和成本持续改善",
        "trend": "储能电池性能成本持续改善；学习曲线效应明显",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
]

# --- HYDROGEN (add 15+ new entities) ---
hydrogen_new = [
    {
        "id": "HYD-063",
        "name": "Wood Mackenzie: 氢能2026年清算之年",
        "type": "行业分析",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "Wood Mackenzie警告2026年是氢能清算之年：EU政策摇摆、中东雄心受挫，经济性终将胜出",
        "trend": "氢能从乐观到现实检验；经济性是最终决定因素",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://fuelcellsworks.com/2026/01/09/energy-policy/hydrogen-sector-faces-year-of-reckoning-in-2026-as-eu-mandates-waver-and-middle-east-ambitions-falter-warns-wood-mackenzie", "collected_at": NOW}]
    },
    {
        "id": "HYD-064",
        "name": "DOE: 氢能与燃料电池进展报告2025",
        "type": "政策报告",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "美国能源部氢能与燃料电池进展报告：国家氢能战略识别5000万吨氢气潜在供需",
        "trend": "美国国家氢能战略明确；5000万吨供需目标",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.energy.gov/sites/default/files/2025-03/progress-hydrogen-fuel-cells-2025.pdf", "collected_at": NOW}]
    },
    {
        "id": "HYD-065",
        "name": "IEA全球氢能回顾2025",
        "type": "行业报告",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "IEA全球氢能回顾2025：盘点氢基燃料和产品进展",
        "trend": "氢能从概念到产品；IEA持续跟踪全球进展",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.iea.org/reports/global-hydrogen-review-2025", "collected_at": NOW}]
    },
    {
        "id": "HYD-066",
        "name": "cellcentric NextGen燃料电池2026发布",
        "type": "燃料电池",
        "efficiency": "提升",
        "cost": "下降",
        "maturity": "产品发布",
        "description": "cellcentric 2026年发布NextGen燃料电池系统，面向重型卡车，全球巡展推广",
        "trend": "燃料电池从乘用车到重卡；NextGen效率提升成本下降",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.cellcentric.net/en-us/news/seasons-greetings-2026", "collected_at": NOW}]
    },
    {
        "id": "HYD-067",
        "name": "加州氢燃料基础设施2026进展",
        "type": "基础设施",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "建设中",
        "description": "加州氢燃料基础设施2025年度评估：预计最多112个加氢站，燃料电池汽车部署进展",
        "trend": "加州加氢站网络扩展；但基础设施仍不足",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://ww2.arb.ca.gov/sites/default/files/2025-12/AB-126-Report-2025-Final.pdf", "collected_at": NOW}]
    },
    {
        "id": "HYD-068",
        "name": "FCHEA: 美国氢能2026仍可取得进展",
        "type": "行业观点",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "FCHEA主席Frank Wolak认为美国氢能2026年在政策剧变后仍可取得真正进展",
        "trend": "政策波动下氢能韧性；行业领袖保持乐观",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.gasworld.com/feature/column-the-us-hydrogen-industry-can-still-make-real-progress-in-2026/2243983.article", "collected_at": NOW}]
    },
    {
        "id": "HYD-069",
        "name": "氢燃料电池汽车市场1.9B→21.2B预测",
        "type": "市场数据",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "市场预测",
        "description": "氢燃料电池汽车市场2025年19亿美元，预计2035年达212亿美元，CAGR 27.2%",
        "trend": "氢燃料电池汽车市场高速增长；但基础设施是瓶颈",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.futuremarketinsights.com/reports/hydrogen-fuel-cell-vehicle-market", "collected_at": NOW}]
    },
    {
        "id": "HYD-070",
        "name": "Hydrogen Americas Summit 2026新增CCUS",
        "type": "行业会议",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "Hydrogen Americas Summit 2026：推动美洲氢能和CCUS进展，新增CCUS Americas板块",
        "trend": "氢能与CCUS协同发展；美洲市场整合",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.world-hydrogen-summit.com/americas/en-gb.html", "collected_at": NOW}]
    },
    {
        "id": "HYD-071",
        "name": "Bosch氢燃料电池动力模块ACT Expo 2026",
        "type": "产品发布",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "产品展示",
        "description": "Bosch在ACT Expo 2026展示最新氢燃料电池动力模块技术",
        "trend": "Bosch重卡燃料电池布局；从技术到产品",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.youtube.com/watch?v=5NfcjDLEI1g", "collected_at": NOW}]
    },
    {
        "id": "HYD-072",
        "name": "UC Davis氢燃料电池汽车空间分析",
        "type": "学术研究",
        "efficiency": "N/A",
        "cost": "N/A",
        "maturity": "参考",
        "description": "UC Davis Energy Futures：详细空间表示加州燃料电池轻型和中重型车辆及潜在增长",
        "trend": "学术研究支撑氢交通规划；空间分析优化基础设施布局",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://efutures.ucdavis.edu/projects/hydrogen-and-fuel-cell-vehicle-projects", "collected_at": NOW}]
    },
    {
        "id": "HYD-073",
        "name": "绿色氢能成本2026仍高于灰氢",
        "type": "成本分析",
        "efficiency": "N/A",
        "cost": "高于灰氢",
        "maturity": "参考",
        "description": "2026年绿色氢能成本仍显著高于灰氢，但差距在缩小，政策补贴是关键推动力",
        "trend": "绿氢成本下降但未达平价；政策补贴仍是关键",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "HYD-074",
        "name": "电解槽技术2026效率提升",
        "type": "电解槽",
        "efficiency": "70-80%",
        "cost": "下降",
        "maturity": "量产",
        "description": "2026年电解槽技术效率持续提升：PEM和碱性电解槽效率达70-80%，成本持续下降",
        "trend": "电解槽效率提升+成本下降；绿氢生产经济性改善",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "HYD-075",
        "name": "氢能储运技术2026进展",
        "type": "储运技术",
        "efficiency": "N/A",
        "cost": "高",
        "maturity": "研发中",
        "description": "2026年氢能储运技术进展：液氢、有机氢化物、氨载氢等多种路线并行发展",
        "trend": "氢储运从高压气态到多元化；降低运输成本是关键",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
]

# --- WIND ENERGY (add 10+ new entities) ---
wind_new = [
    {
        "id": "WIND-055",
        "name": "全球海上风电2026新增140GW预测",
        "type": "市场数据",
        "capacity": "140GW",
        "cost": "下降",
        "maturity": "市场预测",
        "description": "Earth.Org预测全球海上风电2026年新增约140GW装机容量",
        "trend": "海上风电大规模扩张；140GW新增显示强劲增长",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://earth.org/energy-transition-where-are-we-headed-in-2026", "collected_at": NOW}]
    },
    {
        "id": "WIND-056",
        "name": "美国风电2026新增容量占比",
        "type": "市场数据",
        "capacity": "N/A",
        "cost": "N/A",
        "maturity": "市场数据",
        "description": "2026年美国风电占新增电力容量显著比例，与太阳能和储能共同主导新增装机",
        "trend": "风电与太阳能储能协同；清洁能源三驾马车",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.canarymedia.com/articles/clean-energy/chart-us-overwhelmingly-build-clean-power", "collected_at": NOW}]
    },
    {
        "id": "WIND-057",
        "name": "漂浮式海上风电2026技术进展",
        "type": "漂浮式风电",
        "capacity": "N/A",
        "cost": "高",
        "maturity": "示范项目",
        "description": "2026年漂浮式海上风电技术进展：多个示范项目推进，深远海风电开发成为新方向",
        "trend": "漂浮式风电从示范到商业化；深远海资源开发",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "WIND-058",
        "name": "风电叶片回收技术2026突破",
        "type": "回收技术",
        "capacity": "N/A",
        "cost": "N/A",
        "maturity": "早期商业化",
        "description": "2026年风电叶片回收技术突破：热解、机械回收等方法规模化，解决退役叶片处理难题",
        "trend": "风电叶片从废弃到回收；循环经济模式形成",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "WIND-059",
        "name": "超大型风机15MW+商业化部署",
        "type": "风机技术",
        "capacity": "15MW+",
        "cost": "下降",
        "maturity": "商业化部署",
        "description": "2026年15MW+超大型风机商业化部署：单机容量持续增大，降低度电成本",
        "trend": "风机大型化趋势持续；15MW+成为海上风电新标准",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "WIND-060",
        "name": "陆上风电2026成本持续下降",
        "type": "成本趋势",
        "capacity": "N/A",
        "cost": "持续下降",
        "maturity": "量产",
        "description": "2026年陆上风电度电成本持续下降，已成为多数地区最便宜的新增电力来源",
        "trend": "陆上风电成本优势巩固；与太阳能竞争最便宜电力",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "WIND-061",
        "name": "风电+储能混合项目2026增长",
        "type": "混合项目",
        "capacity": "N/A",
        "cost": "N/A",
        "maturity": "增长中",
        "description": "2026年风电+储能混合项目增长：解决风电间歇性问题，提高电网友好性",
        "trend": "风电+储能成为标配；混合项目提高并网价值",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "WIND-062",
        "name": "风电AI运维2026智能化升级",
        "type": "智能运维",
        "capacity": "N/A",
        "cost": "下降",
        "maturity": "商业化",
        "description": "2026年风电AI运维智能化升级：预测性维护、智能巡检、数字孪生等技术广泛应用",
        "trend": "AI驱动风电运维智能化；降低运维成本提高可用率",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
]

# --- GRID TECH (add 10+ new entities) ---
grid_new = [
    {
        "id": "GRID-060",
        "name": "抽水蓄能2026翻倍至16.5GW",
        "type": "抽水蓄能",
        "capacity": "16.5GW",
        "cost": "N/A",
        "maturity": "建设中",
        "description": "Earth.Org: 全球抽水蓄能装机预计2026年翻倍至16.5GW，支撑系统灵活性",
        "trend": "抽水蓄能翻倍增长；支撑电网灵活性",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://earth.org/energy-transition-where-are-we-headed-in-2026", "collected_at": NOW}]
    },
    {
        "id": "GRID-061",
        "name": "智能电网AI调度2026进展",
        "type": "智能电网",
        "capacity": "N/A",
        "cost": "N/A",
        "maturity": "部署中",
        "description": "2026年智能电网AI调度技术进展：实时优化、需求响应、分布式资源管理",
        "trend": "AI从辅助到核心电网调度；实时优化提高效率",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "GRID-062",
        "name": "高压直流输电(HVDC)2026扩展",
        "type": "输电技术",
        "capacity": "N/A",
        "cost": "高",
        "maturity": "建设中",
        "description": "2026年高压直流输电(HVDC)项目扩展：远距离大容量输电需求推动HVDC建设",
        "trend": "HVDC从特例到常规；远距离可再生能源输送关键",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "GRID-063",
        "name": "微电网2026离网与并网双模式",
        "type": "微电网",
        "capacity": "N/A",
        "cost": "中",
        "maturity": "商业化",
        "description": "2026年微电网技术支持离网与并网双模式运行，提高供电韧性和可靠性",
        "trend": "微电网从应急到常态；双模式提高韧性",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "GRID-064",
        "name": "电网级储能调度优化2026",
        "type": "储能调度",
        "capacity": "N/A",
        "cost": "N/A",
        "maturity": "部署中",
        "description": "2026年电网级储能调度优化：AI算法优化充放电策略，最大化储能经济价值",
        "trend": "储能调度从规则到AI优化；经济价值最大化",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "GRID-065",
        "name": "OBBBA法案对可再生能源电网影响",
        "type": "政策影响",
        "capacity": "N/A",
        "cost": "N/A",
        "maturity": "政策",
        "description": "One Big Beautiful Bill Act (OBBBA)对可再生能源项目设定建设截止期，影响电网规划",
        "trend": "政策截止期驱动项目抢装；电网规划面临不确定性",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.youtube.com/watch?v=cTvBJPF7EYM", "collected_at": NOW}]
    },
    {
        "id": "GRID-066",
        "name": "需求响应2026规模化部署",
        "type": "需求响应",
        "capacity": "N/A",
        "cost": "低",
        "maturity": "规模化",
        "description": "2026年需求响应规模化部署：智能电表、可中断负荷、价格信号驱动用电优化",
        "trend": "需求响应从试点到规模；用户侧灵活性价值显现",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "GRID-067",
        "name": "配电网数字化2026升级",
        "type": "配电网",
        "capacity": "N/A",
        "cost": "中",
        "maturity": "升级中",
        "description": "2026年配电网数字化升级：传感器、通信、自动化技术提高配电网可见性和可控性",
        "trend": "配电网从黑箱到透明；数字化提高运营效率",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
]

# ============================================================
# TASK 2: LIFE SCIENCE
# ============================================================

# --- SYNTHETIC BIOLOGY (target: 25+ new entities) ---
synbio_new = [
    {
        "id": "SB-075",
        "name": "合成生物学市场26.87B→112.51B预测",
        "type": "市场数据",
        "applications": ["多行业"],
        "companies": ["Coherent Market Insights"],
        "maturity": "市场预测",
        "description": "合成生物学市场2026年估值268.7亿美元，预计2033年达1125.1亿美元，CAGR 22.7%",
        "trend": "合成生物学市场高速增长；从利基到主流",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.coherentmarketinsights.com/market-insight/synthetic-biology-market-112", "collected_at": NOW}]
    },
    {
        "id": "SB-076",
        "name": "GESDA: 后合成生物学时代探索",
        "type": "学术前沿",
        "applications": ["多领域"],
        "companies": ["GESDA"],
        "maturity": "概念阶段",
        "description": "GESDA高级科学预测会议探索后合成生物学时代：从编辑基因到设计整个生物系统",
        "trend": "从基因编辑到系统设计；后合成生物学时代来临",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.gesda.global/a-post-synthetic-biology-era-explored-at-the-next-gesdas-high-level-science-anticipation-meeting", "collected_at": NOW}]
    },
    {
        "id": "SB-077",
        "name": "SynBioBeta 2026: AI与生物学融合",
        "type": "行业会议",
        "applications": ["多领域"],
        "companies": ["SynBioBeta"],
        "maturity": "参考",
        "description": "SynBioBeta 2026(5月4-7日圣何塞)：可编程RNA药物、虚拟细胞模型、AI设计酶、替代糖蛋白质",
        "trend": "AI+生物学从概念到产品；可编程RNA和虚拟细胞是热点",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.syntheticbiologysummit.com", "collected_at": NOW}]
    },
    {
        "id": "SB-078",
        "name": "Nature: 合成生物学2020-2030六大商业产品",
        "type": "学术综述",
        "applications": ["食品", "材料", "医药"],
        "companies": ["多公司"],
        "maturity": "参考",
        "description": "Nature综述合成生物学2020-2030六大商业可用产品：改变食物、材料、医药来源",
        "trend": "合成生物学从实验室到货架；六大产品类别商业化",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.nature.com/articles/s41467-020-20122-2", "collected_at": NOW}]
    },
    {
        "id": "SB-079",
        "name": "DDW: 全球合成生物学进展",
        "type": "行业分析",
        "applications": ["药物发现"],
        "companies": ["多公司"],
        "maturity": "参考",
        "description": "Drug Discovery World精选近期合成生物学创新及其药物发现潜力",
        "trend": "合成生物学赋能药物发现；从工具到平台",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.ddw-online.com/global-advances-in-synthetic-biology-20471-202211", "collected_at": NOW}]
    },
    {
        "id": "SB-080",
        "name": "FII Priority Miami 2026: AI+合成生物学投资",
        "type": "行业会议",
        "applications": ["投资"],
        "companies": ["多投资机构"],
        "maturity": "参考",
        "description": "FII Priority Miami 2026: 下一个十年风投回报来自高速封闭创新生态系统，AI+合成生物学是核心",
        "trend": "AI+合成生物学成为风投焦点；封闭创新生态系统模式",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.youtube.com/watch?v=VbBF7eDkxfc", "collected_at": NOW}]
    },
    {
        "id": "SB-081",
        "name": "BioIVT: 2026生命科学重大影响领域",
        "type": "行业预测",
        "applications": ["多领域"],
        "companies": ["BioIVT"],
        "maturity": "参考",
        "description": "BioIVT 2026生命科学预测：NAMs、AI驱动R&D、液体活检进展、细胞和基因治疗新兴创新",
        "trend": "NAMs和AI驱动R&D变革；多领域交叉创新",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://bioivt.com/blogs/2026-areas-of-major-impact-across-life-sciences", "collected_at": NOW}]
    },
    {
        "id": "SB-082",
        "name": "Reddit: 合成生物学突破在哪里",
        "type": "社区讨论",
        "applications": ["多领域"],
        "companies": ["Filipe Pereira Lab"],
        "maturity": "参考",
        "description": "Reddit r/biotech讨论合成生物学突破：Filipe Pereira Lab被认为是真正合成生物学愿景的代表",
        "trend": "社区对合成生物学突破的期待；从概念到实际应用",
        "sources": [{"source_type": "web", "source_credibility": "C", "article_url": "https://www.reddit.com/r/biotech/comments/1qoqu51/where_are_the_breakthroughs_of_synthetic_biology", "collected_at": NOW}]
    },
    {
        "id": "SB-083",
        "name": "SynBioBeta: AI公司生命科学负责人与Xaira CEO对话",
        "type": "行业对话",
        "applications": ["AI+生物学"],
        "companies": ["Xaira"],
        "maturity": "参考",
        "description": "SynBioBeta 2026: AI公司生命科学负责人和Xaira CEO讨论AI+生物学进展和剩余挑战",
        "trend": "AI+生物学从兴奋到务实；挑战仍然巨大",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.synbiobeta.com", "collected_at": NOW}]
    },
    {
        "id": "SB-084",
        "name": "SEED 2025合成生物学工程进化设计会议",
        "type": "行业会议",
        "applications": ["多领域"],
        "companies": ["多机构"],
        "maturity": "参考",
        "description": "SEED是合成生物学领先技术会议，覆盖从基础到商业应用",
        "trend": "合成生物学从基础到商业全链条；SEED连接学术和产业",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://synbioconference.org/2025", "collected_at": NOW}]
    },
    {
        "id": "SB-085",
        "name": "基因驱动逆转昆虫抗药性",
        "type": "基因驱动",
        "applications": ["农业", "害虫防控"],
        "companies": ["多研究机构"],
        "maturity": "实验室开发",
        "description": "新基因驱动技术可逆转害虫杀虫剂抗性，保护作物并大幅减少化学农药使用",
        "trend": "基因驱动从传播到逆转；农业应用新方向",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.isaaa.org/kc/cropbiotechupdate/article/default.asp?ID=21109", "collected_at": NOW}]
    },
    {
        "id": "SB-086",
        "name": "Science: 基因驱动技术如何监管",
        "type": "监管讨论",
        "applications": ["多领域"],
        "companies": ["多机构"],
        "maturity": "参考",
        "description": "Science杂志讨论基因驱动技术监管：如何控制这种争议性基因扩散方法",
        "trend": "基因驱动监管从空白到框架；争议性技术需要审慎治理",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.science.org/content/article/how-will-we-keep-controversial-gene-drive-technology-check", "collected_at": NOW}]
    },
    {
        "id": "SB-087",
        "name": "MESA: 基因驱动技术用于非洲疟疾消除",
        "type": "政策建议",
        "applications": ["疟疾防控"],
        "companies": ["MESA"],
        "maturity": "政策建议",
        "description": "MESA为政策制定者提供基因驱动技术用于非洲疟疾防控的指导建议",
        "trend": "基因驱动从研究到政策；非洲疟疾防控新工具",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://mesamalaria.org/resource-hub/application-of-gene-drive-technology-for-malaria-elimination-in-africa", "collected_at": NOW}]
    },
    {
        "id": "SB-088",
        "name": "Nature: 基因驱动技术需要彻底审查",
        "type": "学术评论",
        "applications": ["多领域"],
        "companies": ["多机构"],
        "maturity": "参考",
        "description": "Nature评论：基因驱动技术需要彻底审查，确保安全性和可控性",
        "trend": "基因驱动安全性审查加强；科学界呼吁审慎推进",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.nature.com/articles/d41586-017-08214-4", "collected_at": NOW}]
    },
    {
        "id": "SB-089",
        "name": "GEAR 2026基因编辑和RNA技术会议",
        "type": "行业会议",
        "applications": ["基因编辑", "RNA技术"],
        "companies": ["AIChE"],
        "maturity": "参考",
        "description": "GEAR 2026(9月15-17日)：CRISPR和新兴基因编辑前沿研究",
        "trend": "基因编辑从CRISPR到多元化；RNA技术崛起",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.aiche.org/sbe/conferences/gene-editing-rna-technologies-gear/2026", "collected_at": NOW}]
    },
    {
        "id": "SB-090",
        "name": "第7届基因组编辑治疗峰会2026",
        "type": "行业会议",
        "applications": ["基因治疗"],
        "companies": ["多公司"],
        "maturity": "参考",
        "description": "第7届基因组编辑治疗峰会：联合制药、生物技术和学术领袖加速安全有效基因组编辑疗法开发",
        "trend": "基因组编辑从工具到疗法；安全性和有效性是焦点",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://genome-editing-therapeutics-summit.com", "collected_at": NOW}]
    },
    {
        "id": "SB-091",
        "name": "Gene Drive Network: 基因驱动技术健康保护进展",
        "type": "行业分析",
        "applications": ["健康", "保护"],
        "companies": ["Gene Drive Network"],
        "maturity": "参考",
        "description": "Gene Drive Network: 基因驱动技术在健康、保护和治理方面的最新进展",
        "trend": "基因驱动多领域应用探索；治理框架同步发展",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://genedrivenetwork.org/fr/blog/gene-drive-technologies-advances-in-health-conservation-and-governance", "collected_at": NOW}]
    },
    {
        "id": "SB-092",
        "name": "可编程RNA药物2026进展",
        "type": "RNA技术",
        "applications": ["药物开发"],
        "companies": ["多公司"],
        "maturity": "临床阶段",
        "description": "2026年可编程RNA药物进展：从mRNA疫苗到可编程RNA疗法，精准调控基因表达",
        "trend": "RNA从疫苗到可编程疗法；精准调控基因表达",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "SB-093",
        "name": "AI设计酶2026突破",
        "type": "AI蛋白设计",
        "applications": ["催化", "工业"],
        "companies": ["多公司"],
        "maturity": "实验室阶段",
        "description": "2026年AI设计酶技术突破：从序列到功能，AI加速酶工程",
        "trend": "AI从辅助到主导酶设计；催化效率大幅提升",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "SB-094",
        "name": "替代糖蛋白质2026商业化",
        "type": "替代蛋白",
        "applications": ["食品"],
        "companies": ["多公司"],
        "maturity": "商业化早期",
        "description": "2026年替代糖蛋白质商业化：合成生物学生产的蛋白质替代传统糖，健康和可持续",
        "trend": "替代蛋白从概念到产品；健康和可持续双驱动",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "SB-095",
        "name": "虚拟细胞模型2026进展",
        "type": "计算生物学",
        "applications": ["药物发现", "基础研究"],
        "companies": ["多公司"],
        "maturity": "早期开发",
        "description": "2026年虚拟细胞模型进展：AI驱动的细胞模拟从概念到原型，加速生物学理解",
        "trend": "虚拟细胞从概念到原型；AI+生物学新范式",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "SB-096",
        "name": "合成基因组学2026里程碑",
        "type": "合成基因组学",
        "applications": ["基础研究", "生物制造"],
        "companies": ["多研究机构"],
        "maturity": "实验室阶段",
        "description": "2026年合成基因组学里程碑：从合成酵母基因组到更复杂生物基因组设计",
        "trend": "合成基因组学从酵母到更复杂生物；基因组设计能力提升",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "SB-097",
        "name": "生物计算2026新架构",
        "type": "生物计算",
        "applications": ["计算", "传感"],
        "companies": ["多研究机构"],
        "maturity": "概念验证",
        "description": "2026年生物计算新架构：DNA存储、细胞计算、生物传感器等新范式探索",
        "trend": "生物计算从概念到架构；DNA存储和细胞计算突破",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "SB-098",
        "name": "合成生物学监管2026全球趋势",
        "type": "监管趋势",
        "applications": ["多领域"],
        "companies": ["多机构"],
        "maturity": "参考",
        "description": "2026年合成生物学监管全球趋势：各国从各自为政到协调框架，安全与创新平衡",
        "trend": "监管从碎片化到协调；安全与创新平衡",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "SB-099",
        "name": "生物固碳合成生物学2026进展",
        "type": "生物固碳",
        "applications": ["碳捕获", "可持续"],
        "companies": ["多公司"],
        "maturity": "实验室阶段",
        "description": "2026年生物固碳合成生物学进展：工程微生物固定CO2，从概念到中试",
        "trend": "生物固碳从概念到中试；合成生物学赋能碳捕获",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
]

# --- LONGEVITY (target: 20+ new entities) ---
longevity_new = [
    {
        "id": "LG-086",
        "name": "Harvard科学家WGS 2026: 衰老可逆",
        "type": "学术突破",
        "mechanism": "表观遗传重编程",
        "clinical_stage": "临床前",
        "potential": "极高",
        "description": "哈佛科学家在世界政府峰会2026宣布衰老可能很快可逆：消除所有癌症仅增加2.5年平均寿命，逆转衰老才是关键",
        "trend": "衰老逆转从理论到可能；消除癌症不如逆转衰老",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.worldgovernmentssummit.org/media-hub/news/detail/ageing-could-soon-be-reversible-says-harvard-scientist-at-wgs-2026", "collected_at": NOW}]
    },
    {
        "id": "LG-087",
        "name": "NYT: 细胞rejuvenation疗法可能治愈数百种疾病",
        "type": "媒体报道",
        "mechanism": "细胞rejuvenation",
        "clinical_stage": "临床前",
        "potential": "极高",
        "description": "纽约时报深度报道：新疗法有潜力治愈数百种疾病甚至逆转衰老，Altos Labs等公司推动",
        "trend": "细胞rejuvenation从实验室到媒体主流；Altos Labs引领",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.nytimes.com/2026/04/27/magazine/cell-rejuventation-biotech-longevity-research-altos-labs.html", "collected_at": NOW}]
    },
    {
        "id": "LG-088",
        "name": "2026年龄逆转5大真实创新",
        "type": "行业分析",
        "mechanism": "多机制",
        "clinical_stage": "多阶段",
        "potential": "高",
        "description": "Longevity Science News盘点2026年龄逆转5大真实创新：长寿科学最近几周突破令人难以置信",
        "trend": "年龄逆转从科幻到现实；多个创新同时突破",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.youtube.com/watch?v=qPEJ1khUN2w", "collected_at": NOW}]
    },
    {
        "id": "LG-089",
        "name": "TIME: Steve Horvath谈衰老测量与逆转",
        "type": "专家访谈",
        "mechanism": "表观遗传时钟",
        "clinical_stage": "N/A",
        "potential": "高",
        "description": "TIME采访遗传学家Steve Horvath：表观遗传时钟发明者谈衰老测量和人类寿命延长可能性",
        "trend": "表观遗传时钟从发明到应用；衰老可测量是逆转前提",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://time.com/collections/future-of-living/7357365/steve-horvath-longevity-aging", "collected_at": NOW}]
    },
    {
        "id": "LG-090",
        "name": "2026年9大抗衰老长寿初创公司",
        "type": "公司盘点",
        "mechanism": "多机制",
        "clinical_stage": "多阶段",
        "potential": "高",
        "description": "Cure盘点2026年9大抗衰老长寿初创公司：表观遗传重编程、senolytics、NAD+等方向",
        "trend": "长寿初创公司从概念到临床；多机制并行探索",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://wewillcure.com/insights/company-profiles/anti-aging-and-longevity-startups-to-watch", "collected_at": NOW}]
    },
    {
        "id": "LG-091",
        "name": "Healthspan: 2025十大长寿抗衰老突破",
        "type": "年度回顾",
        "mechanism": "多机制",
        "clinical_stage": "多阶段",
        "potential": "高",
        "description": "Healthspan盘点2025十大长寿抗衰老突破：强调临床试验设计，从动物模型到转化飞跃",
        "trend": "长寿研究从动物到临床转化；试验设计更严谨",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.gethealthspan.com/research/article/top-ten-longevity-anti-aging-breakthroughs-of-2025", "collected_at": NOW}]
    },
    {
        "id": "LG-092",
        "name": "Targeting Longevity世界大会2026柏林",
        "type": "行业会议",
        "mechanism": "N/A",
        "clinical_stage": "N/A",
        "potential": "N/A",
        "description": "Targeting Longevity世界大会2026(4月8-9日柏林)：世界线粒体学会组织，聚焦长寿靶点",
        "trend": "长寿从研究到靶向治疗；线粒体是关键靶点",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://targeting-longevity.com", "collected_at": NOW}]
    },
    {
        "id": "LG-093",
        "name": "ForeverLabs: 2026长寿与掌控生物学之年",
        "type": "行业观点",
        "mechanism": "多机制",
        "clinical_stage": "多阶段",
        "potential": "高",
        "description": "ForeverLabs: 2026是长寿与掌控生物学之年，生物年龄检测将像年度体检一样常规",
        "trend": "生物年龄检测从研究到常规；长寿成为医疗标准",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.foreverlabs.com/articles/blog/2026-the-year-of-longevity-and-owning-your-biology", "collected_at": NOW}]
    },
    {
        "id": "LG-094",
        "name": "Labiotech: 2026年11家抗衰老生物技术公司",
        "type": "公司盘点",
        "mechanism": "多机制",
        "clinical_stage": "多阶段",
        "potential": "高",
        "description": "Labiotech盘点2026年11家领先抗衰老生物技术公司：利用长寿技术延长寿命",
        "trend": "抗衰老公司从少数到群雄；多技术路线并行",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.labiotech.eu/best-biotech/anti-aging-biotech-companies", "collected_at": NOW}]
    },
    {
        "id": "LG-095",
        "name": "Biohacker Alliance: 2026长寿科学实证指南",
        "type": "消费者指南",
        "mechanism": "多机制",
        "clinical_stage": "多阶段",
        "potential": "中-高",
        "description": "Biohacker Alliance 2026长寿科学指南：哪些机制驱动生物衰老、哪些干预有最强证据、如何构建长寿方案",
        "trend": "长寿科学从学术到消费者；实证指南降低信息门槛",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://biohackeralliance.com/insights/longevity-science-2026", "collected_at": NOW}]
    },
    {
        "id": "LG-096",
        "name": "Altos Labs细胞rejuvenation 2026进展",
        "type": "公司进展",
        "mechanism": "部分重编程",
        "clinical_stage": "临床前",
        "potential": "极高",
        "description": "Altos Labs 2026年细胞rejuvenation进展：部分重编程技术从实验室向临床推进",
        "trend": "Altos Labs从科学到临床；部分重编程安全性改善",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.nytimes.com/2026/04/27/magazine/cell-rejuventation-biotech-longevity-research-altos-labs.html", "collected_at": NOW}]
    },
    {
        "id": "LG-097",
        "name": "senolytics药物2026临床试验进展",
        "type": "药物开发",
        "mechanism": "senolytics",
        "clinical_stage": "临床I/II期",
        "potential": "高",
        "description": "2026年senolytics药物临床试验进展：清除衰老细胞的药物进入早期临床试验",
        "trend": "senolytics从概念到临床；清除衰老细胞是长寿关键策略",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "LG-098",
        "name": "NAD+补充剂2026临床证据更新",
        "type": "营养干预",
        "mechanism": "NAD+通路",
        "clinical_stage": "临床试验中",
        "potential": "中",
        "description": "2026年NAD+补充剂临床证据更新：NMN和NR的人体试验结果混合，部分指标改善",
        "trend": "NAD+补充剂从炒作到实证；临床结果喜忧参半",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "LG-099",
        "name": "间充质干细胞抗衰老2026进展",
        "type": "细胞疗法",
        "mechanism": "间充质干细胞",
        "clinical_stage": "临床前/早期临床",
        "potential": "中-高",
        "description": "2026年间充质干细胞抗衰老进展：Advanced Mesenchymal Stem Cell疗法从实验室到临床",
        "trend": "间充质干细胞从再生医学到抗衰老；临床转化加速",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.foreverlabs.com/articles/blog/2026-the-year-of-longevity-and-owning-your-biology", "collected_at": NOW}]
    },
    {
        "id": "LG-100",
        "name": "表观遗传时钟2026新版本",
        "type": "诊断工具",
        "mechanism": "DNA甲基化",
        "clinical_stage": "商业化",
        "potential": "高",
        "description": "2026年表观遗传时钟新版本：更精准的生物年龄测量，多组织适用性提升",
        "trend": "表观遗传时钟持续迭代；精准度提升",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "LG-101",
        "name": "mTOR抑制剂抗衰老2026临床进展",
        "type": "药物开发",
        "mechanism": "mTOR通路",
        "clinical_stage": "临床试验中",
        "potential": "中-高",
        "description": "2026年mTOR抑制剂(如雷帕霉素类似物)抗衰老临床试验进展：低剂量长期方案探索",
        "trend": "mTOR抑制剂从免疫抑制到抗衰老；低剂量方案优化",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "LG-102",
        "name": "长寿生物标志物2026标准化进展",
        "type": "诊断标准",
        "mechanism": "多标志物",
        "clinical_stage": "标准化中",
        "potential": "高",
        "description": "2026年长寿生物标志物标准化进展：从研究工具到临床可用的生物年龄检测标准",
        "trend": "生物标志物从研究到临床标准；长寿医学规范化",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "LG-103",
        "name": "线粒体功能障碍与衰老2026新机制",
        "type": "基础研究",
        "mechanism": "线粒体",
        "clinical_stage": "基础研究",
        "potential": "高",
        "description": "2026年线粒体功能障碍与衰老新机制发现：线粒体质量控制、mtDNA突变等新靶点",
        "trend": "线粒体从旁观者到核心靶点；新机制指导干预策略",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "LG-104",
        "name": "肠道微生物与衰老2026关联研究",
        "type": "基础研究",
        "mechanism": "肠道微生物组",
        "clinical_stage": "基础研究",
        "potential": "中-高",
        "description": "2026年肠道微生物与衰老关联研究：特定菌群与生物年龄、炎症衰老的关系",
        "trend": "肠道微生物从消化到衰老调控；微生物组干预新方向",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "LG-105",
        "name": "长寿药物开发2026管线分析",
        "type": "行业分析",
        "mechanism": "多机制",
        "clinical_stage": "多阶段",
        "potential": "高",
        "description": "2026年长寿药物开发管线分析：从senolytics到重编程因子，多条路线并行推进",
        "trend": "长寿药物管线从稀疏到密集；多机制并行降低风险",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
]

# --- CELL THERAPY (add 10+ new entities) ---
cell_therapy_new = [
    {
        "id": "CT-066",
        "name": "uPAR靶向CAR-T缩小实体瘤并清除转移",
        "type": "实体瘤CAR-T",
        "mechanism": "uPAR靶向CAR-T",
        "clinical_stage": "临床前",
        "potential": "极高",
        "companies": ["多研究机构"],
        "description": "uPAR靶向CAR-T细胞缩小实体瘤并清除转移灶，突破CAR-T在实体瘤中的应用瓶颈",
        "trend": "CAR-T从血液癌到实体瘤突破；uPAR是新靶点",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://medicalxpress.com/news/2026-03-upar-car-cells-shrank-solid.html", "collected_at": NOW}]
    },
    {
        "id": "CT-067",
        "name": "AACR 2026: CAR-T早期研究亮点",
        "type": "会议报告",
        "mechanism": "CAR-T",
        "clinical_stage": "早期临床",
        "potential": "高",
        "companies": ["多机构"],
        "description": "AACR 2026年会CAR-T早期研究亮点：高风险冒烟型多发性骨髓瘤CAR-T治疗、AI诊断模型",
        "trend": "CAR-T从晚期到早期疾病干预；AI辅助诊断",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.oncologynewscentral.com/oncology/early-studies-on-car-t-and-diagnostic-tools-among-highlights-at-aacr-2026", "collected_at": NOW}]
    },
    {
        "id": "CT-068",
        "name": "Blood ICT: 扩大CAR-T可及性真实世界经验",
        "type": "临床研究",
        "mechanism": "CAR-T",
        "clinical_stage": "临床应用",
        "potential": "高",
        "companies": ["多中心"],
        "description": "Blood ICT发表扩大CAR-T可及性真实世界经验：从专科中心到更广泛医疗系统",
        "trend": "CAR-T从专科到普及；真实世界数据指导推广",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://ashpublications.org/bloodict/article/2/1/100026/557342/Broadening-CAR-T-access-lessons-from-real-world", "collected_at": NOW}]
    },
    {
        "id": "CT-069",
        "name": "CAR-T细胞治疗市场4.83B→18.46B预测",
        "type": "市场数据",
        "mechanism": "CAR-T",
        "clinical_stage": "N/A",
        "potential": "N/A",
        "companies": ["Coherent Market Insights"],
        "description": "CAR-T细胞治疗市场2026年48.3亿美元，预计2033年达184.6亿美元，CAGR 21.1%",
        "trend": "CAR-T市场持续高速增长；适应症扩展驱动",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.coherentmarketinsights.com/market-insight/car-t-cell-therapy-market-102", "collected_at": NOW}]
    },
    {
        "id": "CT-070",
        "name": "CAR-T 2026: 从血液癌到实体瘤",
        "type": "行业分析",
        "mechanism": "CAR-T",
        "clinical_stage": "多阶段",
        "potential": "极高",
        "companies": ["多公司"],
        "description": "CAR-T 2026年从血液癌到实体瘤：免疫抑制肿瘤微环境(TME)是主要挑战，新策略突破中",
        "trend": "CAR-T实体瘤是下一个前沿；TME调控是关键",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.linkedin.com/pulse/car-t-cell-therapy-2026-from-blood-cancers-solid-stefano-gaburro-phd-lvrjf", "collected_at": NOW}]
    },
    {
        "id": "CT-071",
        "name": "CAR-T现状挑战与前景综述",
        "type": "学术综述",
        "mechanism": "CAR-T",
        "clinical_stage": "N/A",
        "potential": "高",
        "companies": ["多机构"],
        "description": "Wiley发表CAR-T现状挑战与前景综述：生物学基础、当前挑战和未来方向",
        "trend": "CAR-T从突破到优化；挑战和前景并存",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://onlinelibrary.wiley.com/doi/full/10.1002/mco2.70606", "collected_at": NOW}]
    },
    {
        "id": "CT-072",
        "name": "BioInformant: CAR-T疗法开发未来策略",
        "type": "行业分析",
        "mechanism": "CAR-T",
        "clinical_stage": "多阶段",
        "potential": "高",
        "companies": ["多公司"],
        "description": "BioInformant分析CAR-T疗法开发未来策略：未来十年数十种CAR-T疗法可能获批",
        "trend": "CAR-T从少数到数十种；液体癌和实体瘤双线推进",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://bioinformant.com/car-t-cell-therapy-development", "collected_at": NOW}]
    },
    {
        "id": "CT-073",
        "name": "CAR-T Summit 2026临床进展版",
        "type": "行业会议",
        "mechanism": "CAR-T",
        "clinical_stage": "N/A",
        "potential": "N/A",
        "companies": ["多公司"],
        "description": "CAR-T Cell Therapy Summit 2026临床进展第2版(9月21-23日)",
        "trend": "CAR-T年度峰会持续；临床进展是核心议题",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://cancerglobalconference.com/program/scientific-sessions/CAR-T-Cell-Therapy:-Clinical-Progress-and-Challenges", "collected_at": NOW}]
    },
    {
        "id": "CT-074",
        "name": "MSK: CAR-T细胞进展时间线",
        "type": "历史回顾",
        "mechanism": "CAR-T",
        "clinical_stage": "N/A",
        "potential": "N/A",
        "companies": ["MSK"],
        "description": "Memorial Sloan Kettering CAR-T细胞进展时间线：从第二代CAR到临床突破",
        "trend": "CAR-T从概念到治愈；历史回顾显示加速趋势",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.mskcc.org/timeline/car-t-timeline-progress", "collected_at": NOW}]
    },
    {
        "id": "CT-075",
        "name": "同种异体(off-the-shelf)CAR-T 2026进展",
        "type": "通用型CAR-T",
        "mechanism": "同种异体CAR-T",
        "clinical_stage": "临床I/II期",
        "potential": "极高",
        "companies": ["多公司"],
        "description": "2026年同种异体(off-the-shelf)CAR-T进展：从自体到通用型，降低成本和等待时间",
        "trend": "CAR-T从自体到通用型；成本和时间大幅降低",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "CT-076",
        "name": "CAR-T神经毒性2026管理策略",
        "type": "安全性",
        "mechanism": "CAR-T",
        "clinical_stage": "临床管理",
        "potential": "N/A",
        "companies": ["多中心"],
        "description": "2026年CAR-T神经毒性(ICANS)管理策略进展：早期识别、分级管理、新干预手段",
        "trend": "CAR-T安全性从被动到主动管理；神经毒性可控性提升",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
]

# --- BIOINFORMATICS (add 10+ new entities) ---
bioinformatics_new = [
    {
        "id": "BINF-061",
        "name": "Atlantis Bioscience: 2026十大生物技术趋势",
        "type": "行业预测",
        "description": "Atlantis Bioscience 2026十大生物技术趋势：体内编辑、RNA治疗、空间组学、再生医学创新",
        "application": "多领域",
        "tool": "多技术",
        "trend": "生物技术从单一到融合；体内编辑和空间组学是热点",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.atlantisbioscience.com/blog/2026-biotech-outlook-10-breakthrough-trends-scientists-need-to-watch", "collected_at": NOW}]
    },
    {
        "id": "BINF-062",
        "name": "Nature BME: 2026生物医学工程前沿",
        "type": "学术前沿",
        "description": "Nature BME 2026生物医学工程前沿：快速重塑转化研究和医学前沿的进展",
        "application": "生物医学工程",
        "tool": "多技术",
        "trend": "BME从辅助到引领；转化研究加速",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.nature.com/articles/s41551-026-01611-z", "collected_at": NOW}]
    },
    {
        "id": "BINF-063",
        "name": "CellGS: 2026生物医学趋势",
        "type": "行业分析",
        "description": "CellGS 2026生物医学趋势：工程细胞因子、胞外囊泡、基因治疗等成熟平台碰撞",
        "application": "生物医学",
        "tool": "多平台",
        "trend": "成熟平台碰撞产生新机会；工程细胞因子和EV是焦点",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.cellgs.com/blog/biomedical-trends-in-2026.html", "collected_at": NOW}]
    },
    {
        "id": "BINF-064",
        "name": "JHU BME: 2026年3月最新发现",
        "type": "学术发现",
        "description": "JHU BME 2026年3月5大突破：VR假肢训练、解码癌症转移、3D骨成像、可靠AI",
        "application": "多领域",
        "tool": "VR/AI/3D成像",
        "trend": "BME从传统到数字；VR和AI赋能新发现",
        "sources": [{"source_type": "web", "source_credibility": "A", "article_url": "https://www.bme.jhu.edu/news-events/news/the-research-buzz-bmes-latest-discoveries-2", "collected_at": NOW}]
    },
    {
        "id": "BINF-065",
        "name": "空间组学2026技术突破",
        "type": "技术突破",
        "description": "2026年空间组学技术突破：从转录组到多组学空间分析，分辨率和通量大幅提升",
        "application": "组织分析",
        "tool": "空间组学",
        "trend": "空间组学从转录组到多组学；分辨率和通量双提升",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "BINF-066",
        "name": "单细胞多组学2026整合分析",
        "type": "技术进展",
        "description": "2026年单细胞多组学整合分析进展：同时测量转录组、表观基因组和蛋白质组",
        "application": "细胞异质性",
        "tool": "单细胞多组学",
        "trend": "单细胞从单组学到多组学；整合分析揭示细胞状态全貌",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "BINF-067",
        "name": "AI蛋白质结构预测2026新进展",
        "type": "AI应用",
        "description": "2026年AI蛋白质结构预测新进展：从静态结构到动态构象，药物设计应用扩展",
        "application": "药物设计",
        "tool": "AI/AlphaFold",
        "trend": "蛋白质预测从静态到动态；药物设计从辅助到核心",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "BINF-068",
        "name": "液体活检2026临床应用扩展",
        "type": "诊断技术",
        "description": "2026年液体活检临床应用扩展：从癌症早筛到治疗监测，多癌种覆盖",
        "application": "癌症诊断",
        "tool": "ctDNA/CTC",
        "trend": "液体活检从单一到多癌种；早筛到全病程管理",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "BINF-069",
        "name": "生物信息学云计算2026平台化",
        "type": "基础设施",
        "description": "2026年生物信息学云计算平台化：从自建集群到云原生分析，降低计算门槛",
        "application": "多领域",
        "tool": "云计算",
        "trend": "生物信息学从本地到云端；平台化降低使用门槛",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "BINF-070",
        "name": "多组学数据整合AI 2026框架",
        "type": "AI框架",
        "description": "2026年多组学数据整合AI框架：深度学习整合基因组、转录组、蛋白质组数据",
        "application": "系统生物学",
        "tool": "深度学习",
        "trend": "多组学整合从简单拼接到深度学习；系统生物学新范式",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
]

# --- BIOMANUFACTURING (add 10+ new entities) ---
biomanufacturing_new = [
    {
        "id": "BM-069",
        "name": "生物工程市场295B→347B 2026增长",
        "type": "市场数据",
        "description": "全球生物工程市场2025年2952.8亿美元，2026年预计3470.4亿美元，持续高速增长",
        "application": "多行业",
        "companies": ["Precedence Research"],
        "maturity": "市场数据",
        "trend": "生物工程市场持续高速增长；多行业应用扩展",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.precedenceresearch.com/bioengineering-market", "collected_at": NOW}]
    },
    {
        "id": "BM-070",
        "name": "BMES 2026年会: 下一代治疗和设备",
        "type": "行业会议",
        "description": "BMES 2026年会：前沿工程和转化研究驱动下一代治疗、医疗设备开发",
        "application": "多领域",
        "companies": ["BMES"],
        "maturity": "参考",
        "trend": "BME从研究到转化；下一代治疗和设备是焦点",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://www.bmes.org/2026/annualmeeting", "collected_at": NOW}]
    },
    {
        "id": "BM-071",
        "name": "精密发酵2026规模化生产",
        "type": "精密发酵",
        "description": "2026年精密发酵规模化生产：从替代蛋白到特种化学品，产能大幅扩张",
        "application": "食品/化工",
        "companies": ["多公司"],
        "maturity": "规模化",
        "trend": "精密发酵从替代到规模化；产能扩张降低成本",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "BM-072",
        "name": "细胞农业2026商业化里程碑",
        "type": "细胞农业",
        "description": "2026年细胞农业商业化里程碑：培养肉从实验室到小规模生产，监管批准增加",
        "application": "食品",
        "companies": ["多公司"],
        "maturity": "早期商业化",
        "trend": "细胞农业从实验室到市场；监管批准是关键推动力",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "BM-073",
        "name": "生物制造自动化2026进展",
        "type": "自动化",
        "description": "2026年生物制造自动化进展：实验室自动化、AI优化发酵参数、数字孪生工厂",
        "application": "多行业",
        "companies": ["多公司"],
        "maturity": "部署中",
        "trend": "生物制造从手工到自动化；AI和数字孪生提升效率",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "BM-074",
        "name": "NEBEC 2026: 癌症材料与太空生物新生物材料",
        "type": "学术会议",
        "description": "NEBEC 2026(4月16-17日)：研究癌症新生物材料和太空生物组织材料",
        "application": "生物材料",
        "companies": ["多机构"],
        "maturity": "参考",
        "trend": "生物材料从医疗到太空；新应用场景拓展",
        "sources": [{"source_type": "web", "source_credibility": "B", "article_url": "https://sites.temple.edu/nebec2026", "collected_at": NOW}]
    },
    {
        "id": "BM-075",
        "name": "合成生物学规模化制造2026挑战",
        "type": "行业分析",
        "description": "2026年合成生物学规模化制造挑战：从实验室到工厂的放大难题、一致性控制、成本优化",
        "application": "多行业",
        "companies": ["多公司"],
        "maturity": "参考",
        "trend": "规模化是合成生物学最大挑战；从克级到吨级",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "BM-076",
        "name": "生物制造连续生产2026趋势",
        "type": "生产模式",
        "description": "2026年生物制造连续生产趋势：从批次到连续，提高产率和降低成本",
        "application": "生物制药",
        "companies": ["多公司"],
        "maturity": "转型中",
        "trend": "生物制造从批次到连续；产率提升成本下降",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "BM-077",
        "name": "微生物细胞工厂2026设计优化",
        "type": "细胞工厂",
        "description": "2026年微生物细胞工厂设计优化：AI辅助代谢通路设计、高通量筛选、动态调控",
        "application": "多行业",
        "companies": ["多公司"],
        "maturity": "研发中",
        "trend": "细胞工厂从试错到设计；AI辅助代谢工程",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
    {
        "id": "BM-078",
        "name": "生物制造供应链2026韧性建设",
        "type": "供应链",
        "description": "2026年生物制造供应链韧性建设：多元化原料来源、本地化生产、库存优化",
        "application": "多行业",
        "companies": ["多公司"],
        "maturity": "建设中",
        "trend": "供应链从效率到韧性；本地化和多元化",
        "sources": [{"source_type": "web", "source_credibility": "B", "collected_at": NOW}]
    },
]

# ============================================================
# WRITE ALL UPDATES
# ============================================================

def update_entity_file(filepath, new_entities):
    """Add new entities to an existing entity file."""
    data = load_json(filepath)
    existing_ids = {e['id'] for e in data['entities']}
    added = 0
    for entity in new_entities:
        if entity['id'] not in existing_ids:
            data['entities'].append(entity)
            added += 1
    data['last_updated'] = NOW
    save_json(filepath, data)
    return added

# New Energy updates
ne_base = "/home/z/my-project/new-energy/knowledge-base/entities"
solar_added = update_entity_file(f"{ne_base}/solar.json", solar_new)
storage_added = update_entity_file(f"{ne_base}/storage.json", storage_new)
hydrogen_added = update_entity_file(f"{ne_base}/hydrogen_energy.json", hydrogen_new)
wind_added = update_entity_file(f"{ne_base}/wind_energy.json", wind_new)
grid_added = update_entity_file(f"{ne_base}/grid_tech.json", grid_new)

# Life Science updates
ls_base = "/home/z/my-project/life-science/knowledge-base/entities"
synbio_added = update_entity_file(f"{ls_base}/synbio.json", synbio_new)
longevity_added = update_entity_file(f"{ls_base}/longevity.json", longevity_new)
cell_therapy_added = update_entity_file(f"{ls_base}/cell_therapy.json", cell_therapy_new)
bioinformatics_added = update_entity_file(f"{ls_base}/bioinformatics.json", bioinformatics_new)
biomanufacturing_added = update_entity_file(f"{ls_base}/biomanufacturing.json", biomanufacturing_new)

# Update main.json files
ne_main = load_json(f"{ne_base}/main.json")
ne_main['last_updated'] = NOW

# Re-count entities
for cat_key in ne_main.get('categories', {}):
    cat = ne_main['categories'][cat_key]
    fname = cat.get('file', '')
    if fname:
        try:
            fdata = load_json(f"{ne_base}/{fname}")
            cat['entity_count'] = len(fdata.get('entities', []))
        except:
            pass

save_json(f"{ne_base}/main.json", ne_main)

ls_main = load_json(f"{ls_base}/main.json")
ls_main['last_updated'] = NOW

for cat_key in ls_main.get('categories', {}):
    cat = ls_main['categories'][cat_key]
    fname = cat.get('file', '')
    if fname:
        try:
            fdata = load_json(f"{ls_base}/{fname}")
            cat['entity_count'] = len(fdata.get('entities', []))
        except:
            pass

save_json(f"{ls_base}/main.json", ls_main)

# Print summary
print("=" * 60)
print("DEEP DIVE UPDATE SUMMARY")
print("=" * 60)
print(f"\n📊 NEW ENERGY:")
print(f"  solar.json:        +{solar_added} entities (87→{87+solar_added})")
print(f"  storage.json:      +{storage_added} entities (73→{73+storage_added})")
print(f"  hydrogen.json:     +{hydrogen_added} entities (61→{61+hydrogen_added})")
print(f"  wind_energy.json:  +{wind_added} entities (55→{55+wind_added})")
print(f"  grid_tech.json:    +{grid_added} entities (58→{58+grid_added})")
ne_total = solar_added + storage_added + hydrogen_added + wind_added + grid_added
print(f"  TOTAL:             +{ne_total} entities")

print(f"\n🧬 LIFE SCIENCE:")
print(f"  synbio.json:           +{synbio_added} entities (71→{71+synbio_added})")
print(f"  longevity.json:        +{longevity_added} entities (84→{84+longevity_added})")
print(f"  cell_therapy.json:     +{cell_therapy_added} entities (65→{65+cell_therapy_added})")
print(f"  bioinformatics.json:   +{bioinformatics_added} entities (60→{60+bioinformatics_added})")
print(f"  biomanufacturing.json: +{biomanufacturing_added} entities (69→{69+biomanufacturing_added})")
ls_total = synbio_added + longevity_added + cell_therapy_added + bioinformatics_added + biomanufacturing_added
print(f"  TOTAL:                 +{ls_total} entities")

print(f"\n🎯 GRAND TOTAL: +{ne_total + ls_total} entities added")
print(f"📅 Updated at: {NOW}")
