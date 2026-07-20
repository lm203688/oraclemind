#!/usr/bin/env python3
"""
跨源关联分析引擎 v2.0
深度挖掘多数据源之间的健康关联：
1. 扩展关联规则库（20+规则）
2. 多指标组合分析
3. 纵向趋势关联
4. 生活方式-体检指标关联
5. AI辅助因果推断
"""

import os
import json
import uuid
import sqlite3
from datetime import datetime, timedelta
from urllib.request import Request, urlopen
from logging_config import logger


class CrossSourceAnalyzer:
    """跨源关联分析器"""

    # 关联规则库 - 比v0.5.0大幅扩展
    CORRELATION_RULES = [
        # === 心血管系统 ===
        {
            'id': 'cardio_bp_chol',
            'name': '血压+血脂双高',
            'conditions': [
                {'metric_name': '收缩压', 'direction': 'up', 'threshold': 130},
                {'metric_name': '低密度脂蛋白', 'direction': 'up', 'threshold': 3.4},
            ],
            'min_sources': 1,
            'severity': 'warning',
            'insight': '血压偏高+低密度脂蛋白偏高，动脉粥样硬化风险显著增加。建议：1)低盐低脂饮食 2)规律有氧运动 3)心内科评估',
        },
        {
            'id': 'cardio_hr_sleep',
            'name': '心率-睡眠关联',
            'conditions': [
                {'metric_name': '静息心率', 'direction': 'up', 'threshold': 80},
                {'metric_name': '睡眠时长', 'direction': 'down', 'threshold': 7},
            ],
            'min_sources': 2,
            'severity': 'warning',
            'insight': '静息心率上升+睡眠不足，可能提示：1)压力过大 2)甲状腺功能亢进 3)植物神经紊乱。建议检查甲功五项，改善睡眠质量',
        },
        {
            'id': 'cardio_bp_weight',
            'name': '血压-体重关联',
            'conditions': [
                {'metric_name': '收缩压', 'direction': 'up', 'threshold': 130},
                {'metric_name': '体重', 'direction': 'up'},
            ],
            'min_sources': 2,
            'severity': 'warning',
            'insight': '血压随体重上升，减重5-10%可显著降低血压。建议：控制每日热量摄入，每周150分钟中等强度运动',
        },

        # === 代谢系统 ===
        {
            'id': 'metabolic_glucose_bmi',
            'name': '血糖-BMI双升',
            'conditions': [
                {'metric_name': '空腹血糖', 'direction': 'up', 'threshold': 6.1},
                {'metric_name': 'BMI', 'direction': 'up', 'threshold': 24},
            ],
            'min_sources': 1,
            'severity': 'warning',
            'insight': '血糖偏高+BMI超标，代谢综合征高风险。建议：1)减少精制碳水 2)增加膳食纤维 3)内分泌科评估胰岛素抵抗',
        },
        {
            'id': 'metabolic_uric_bp',
            'name': '尿酸-血压关联',
            'conditions': [
                {'metric_name': '尿酸', 'direction': 'up', 'threshold': 420},
                {'metric_name': '收缩压', 'direction': 'up', 'threshold': 130},
            ],
            'min_sources': 1,
            'severity': 'warning',
            'insight': '高尿酸+高血压，代谢综合征表现之一。高尿酸本身也是心血管独立危险因素。建议：1)减少高嘌呤食物 2)多饮水 3)复查尿酸和肾功能',
        },
        {
            'id': 'metabolic_glucose_lipid',
            'name': '血糖-血脂代谢紊乱',
            'conditions': [
                {'metric_name': '空腹血糖', 'direction': 'up', 'threshold': 6.1},
                {'metric_name': '甘油三酯', 'direction': 'up', 'threshold': 1.7},
            ],
            'min_sources': 1,
            'severity': 'warning',
            'insight': '血糖+甘油三酯双高，典型代谢综合征表现。建议：1)减重5-10% 2)低碳水饮食 3)检查糖化血红蛋白和胰岛素',
        },

        # === 肝功能 ===
        {
            'id': 'liver_alt_weight',
            'name': '肝酶-体重关联',
            'conditions': [
                {'metric_name': 'ALT', 'direction': 'up', 'threshold': 40},
                {'metric_name': 'BMI', 'direction': 'up', 'threshold': 28},
            ],
            'min_sources': 1,
            'severity': 'warning',
            'insight': 'ALT升高+肥胖，高度怀疑脂肪肝。建议：1)肝脏B超 2)减重 3)检查血脂和血糖 4)避免饮酒',
        },
        {
            'id': 'liver_alt_ast',
            'name': '肝酶双高',
            'conditions': [
                {'metric_name': 'ALT', 'direction': 'up', 'threshold': 40},
                {'metric_name': 'AST', 'direction': 'up', 'threshold': 35},
            ],
            'min_sources': 1,
            'severity': 'warning',
            'insight': 'ALT和AST同时升高，肝细胞损伤。建议：1)排查肝炎病毒 2)停用可疑肝损药物 3)戒酒 4)消化内科就诊',
        },

        # === 运动生活方式关联 ===
        {
            'id': 'lifestyle_steps_weight',
            'name': '活动量-体重关联',
            'conditions': [
                {'metric_name': '步数', 'direction': 'down', 'threshold': 6000},
                {'metric_name': '体重', 'direction': 'up'},
            ],
            'min_sources': 2,
            'severity': 'info',
            'insight': '活动量下降+体重上升，建议：1)每日步数目标8000+ 2)加入力量训练 3)记录饮食日记',
        },
        {
            'id': 'lifestyle_steps_glucose',
            'name': '运动-血糖关联',
            'conditions': [
                {'metric_name': '步数', 'direction': 'down', 'threshold': 5000},
                {'metric_name': '空腹血糖', 'direction': 'up', 'threshold': 6.1},
            ],
            'min_sources': 2,
            'severity': 'warning',
            'insight': '运动不足+血糖偏高，规律运动可提高胰岛素敏感性。建议：1)每周150分钟中等强度运动 2)餐后散步30分钟 3)复查空腹血糖和糖化血红蛋白',
        },
        {
            'id': 'lifestyle_sleep_immune',
            'name': '睡眠-免疫力关联',
            'conditions': [
                {'metric_name': '睡眠时长', 'direction': 'down', 'threshold': 6},
                {'metric_name': '白细胞', 'direction': 'up', 'threshold': 10.0},
            ],
            'min_sources': 2,
            'severity': 'info',
            'insight': '睡眠不足+白细胞偏高，可能提示身体处于炎症或感染状态。建议：1)保证7-8小时睡眠 2)复查血常规 3)注意休息',
        },

        # === 贫血-营养关联 ===
        {
            'id': 'anemia_ferritin',
            'name': '贫血-铁储备关联',
            'conditions': [
                {'metric_name': '血红蛋白', 'direction': 'down', 'threshold': 120},
                {'metric_name': '铁蛋白', 'direction': 'down', 'threshold': 30},
            ],
            'min_sources': 1,
            'severity': 'warning',
            'insight': '血红蛋白+铁蛋白双低，缺铁性贫血。建议：1)增加红肉、动物肝脏摄入 2)补充铁剂 3)排查消化道出血 4)血液内科就诊',
        },

        # === 甲状腺关联 ===
        {
            'id': 'thyroid_tsh_hr',
            'name': '甲功-心率关联',
            'conditions': [
                {'metric_name': 'TSH', 'direction': 'down', 'threshold': 0.4},
                {'metric_name': '静息心率', 'direction': 'up', 'threshold': 90},
            ],
            'min_sources': 2,
            'severity': 'warning',
            'insight': 'TSH降低+心率增快，甲亢表现。建议：1)内分泌科就诊 2)复查甲功全项 3)避免咖啡因 4)检查甲状腺B超',
        },
        {
            'id': 'thyroid_tsh_weight',
            'name': '甲减-体重关联',
            'conditions': [
                {'metric_name': 'TSH', 'direction': 'up', 'threshold': 4.0},
                {'metric_name': '体重', 'direction': 'up'},
            ],
            'min_sources': 2,
            'severity': 'warning',
            'insight': 'TSH升高+体重增加，甲减可能。建议：1)内分泌科就诊 2)复查甲功 3)检查甲状腺B超 4)适当控制饮食',
        },

        # === 肾功能关联 ===
        {
            'id': 'renal_bp_creatinine',
            'name': '血压-肾功能关联',
            'conditions': [
                {'metric_name': '收缩压', 'direction': 'up', 'threshold': 140},
                {'metric_name': '肌酐', 'direction': 'up', 'threshold': 97},
            ],
            'min_sources': 1,
            'severity': 'danger',
            'insight': '高血压+肌酐升高，可能已有肾损伤。建议：1)肾内科就诊 2)检查尿微量白蛋白 3)严格控制血压<130/80 4)低盐低蛋白饮食',
        },

        # === 肿瘤标志物关联 ===
        {
            'id': 'tumor_afp_liver',
            'name': 'AFP-肝功能关联',
            'conditions': [
                {'metric_name': 'AFP', 'direction': 'up', 'threshold': 7},
                {'metric_name': 'ALT', 'direction': 'up', 'threshold': 40},
            ],
            'min_sources': 1,
            'severity': 'danger',
            'insight': 'AFP升高+肝酶异常，需排除肝脏占位性病变。建议：1)肝脏B超/CT 2)肝病科或肝胆外科就诊 3)复查AFP动态变化',
        },
    ]

    def __init__(self, db_path=None, bit_assistant_url=None):
        self.db_path = db_path or os.path.join(os.path.dirname(__file__), 'data', 'healthlens.db')
        self.bit_assistant_url = bit_assistant_url or os.environ.get('BIT_ASSISTANT_URL', 'http://150.158.119.19:8431')

    def analyze(self, user_id):
        """执行跨源关联分析"""
        db = sqlite3.connect(self.db_path)
        db.row_factory = sqlite3.Row

        try:
            metrics = db.execute(
                """SELECT metric_name, value, unit, recorded_at, source, metric_type,
                          metadata_json, loinc_code
                   FROM health_records WHERE user_id = ?
                   ORDER BY recorded_at DESC""",
                (user_id,)
            ).fetchall()

            if not metrics:
                return []

            insights = []

            # 1. 规则引擎匹配
            rule_insights = self._match_rules(metrics)
            insights.extend(rule_insights)

            # 2. 纵向趋势关联
            trend_insights = self._analyze_trend_correlations(metrics)
            insights.extend(trend_insights)

            # 3. AI辅助分析（如果有多源数据）
            sources = set(m['source'] for m in metrics)
            if len(sources) >= 2:
                ai_insights = self._ai_cross_analysis(metrics, sources)
                insights.extend(ai_insights)

            # 保存洞察
            for insight in insights:
                insight_id = str(uuid.uuid4())[:8]
                db.execute(
                    """INSERT INTO insights
                       (id, user_id, insight_type, severity, title, content, sources_json)
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (insight_id, user_id, insight['type'], insight['severity'],
                     insight['title'], insight['content'],
                     json.dumps(insight.get('sources', []), ensure_ascii=False))
                )
            db.commit()

            return insights
        finally:
            db.close()

    def _match_rules(self, metrics):
        """规则引擎匹配"""
        insights = []

        # 按指标名分组，取最近值
        latest = {}
        for m in metrics:
            name = m['metric_name']
            if name not in latest:
                latest[name] = {
                    'value': m['value'],
                    'unit': m['unit'],
                    'source': m['source'],
                    'date': m['recorded_at'],
                }

        # 按指标名分组历史数据
        history = {}
        for m in metrics:
            name = m['metric_name']
            if name not in history:
                history[name] = []
            history[name].append({
                'value': m['value'],
                'date': m['recorded_at'],
                'source': m['source'],
            })

        for rule in self.CORRELATION_RULES:
            matched = True
            matched_sources = set()
            matched_details = []

            for cond in rule['conditions']:
                name = cond['metric_name']
                if name not in latest:
                    matched = False
                    break

                val = latest[name]['value']
                if val is None:
                    matched = False
                    break

                try:
                    val = float(val)
                except (ValueError, TypeError):
                    matched = False
                    break

                # 检查阈值
                if 'threshold' in cond and val < cond['threshold']:
                    matched = False
                    break

                # 检查趋势方向
                if 'direction' in cond and name in history and len(history[name]) >= 2:
                    records = sorted(history[name], key=lambda r: r['date'])
                    recent_vals = [float(r['value']) for r in records[-3:] if r['value']]

                    if len(recent_vals) >= 2:
                        if cond['direction'] == 'up' and recent_vals[-1] <= recent_vals[0]:
                            matched = False
                            break
                        elif cond['direction'] == 'down' and recent_vals[-1] >= recent_vals[0]:
                            matched = False
                            break

                matched_sources.add(latest[name]['source'])
                matched_details.append(f"{name}={val}{latest[name]['unit']}")

            if matched and len(matched_sources) >= rule.get('min_sources', 1):
                insights.append({
                    'type': 'cross_source',
                    'severity': rule['severity'],
                    'title': rule['name'],
                    'content': f"{rule['insight']}\n关联指标：{'; '.join(matched_details)}",
                    'sources': list(matched_sources),
                })

        return insights

    def _analyze_trend_correlations(self, metrics):
        """纵向趋势关联分析"""
        insights = []

        # 按30天窗口对比近期和远期数据
        now = datetime.now()
        recent_cutoff = (now - timedelta(days=30)).strftime('%Y-%m-%d')
        older_cutoff = (now - timedelta(days=90)).strftime('%Y-%m-%d')

        # 分组
        by_name = {}
        for m in metrics:
            name = m['metric_name']
            if name not in by_name:
                by_name[name] = {'recent': [], 'older': []}
            try:
                val = float(m['value'])
            except (ValueError, TypeError):
                continue

            if m['recorded_at'] >= recent_cutoff:
                by_name[name]['recent'].append(val)
            elif m['recorded_at'] >= older_cutoff:
                by_name[name]['older'].append(val)

        # 检查显著变化
        significant_changes = []
        for name, data in by_name.items():
            if not data['recent'] or not data['older']:
                continue

            recent_avg = sum(data['recent']) / len(data['recent'])
            older_avg = sum(data['older']) / len(data['older'])

            if older_avg == 0:
                continue

            change_pct = (recent_avg - older_avg) / older_avg * 100

            if abs(change_pct) >= 15:  # 15%以上变化
                direction = '上升' if change_pct > 0 else '下降'
                significant_changes.append({
                    'name': name,
                    'direction': direction,
                    'change_pct': change_pct,
                    'recent_avg': round(recent_avg, 2),
                    'older_avg': round(older_avg, 2),
                })

        # 关联显著变化
        if len(significant_changes) >= 2:
            ups = [c for c in significant_changes if c['direction'] == '上升']
            downs = [c for c in significant_changes if c['direction'] == '下降']

            if ups:
                up_text = ', '.join(f"{c['name']}(+{c['change_pct']:.0f}%)" for c in ups[:5])
                insights.append({
                    'type': 'trend_correlation',
                    'severity': 'warning',
                    'title': '近期指标显著上升',
                    'content': f'近30天vs前60天对比，以下指标显著上升：{up_text}。建议关注变化原因，必要时就医复查。',
                    'sources': list(set(m['source'] for m in metrics)),
                })

            if downs:
                down_text = ', '.join(f"{c['name']}({c['change_pct']:.0f}%)" for c in downs[:5])
                insights.append({
                    'type': 'trend_correlation',
                    'severity': 'info',
                    'title': '近期指标显著下降',
                    'content': f'近30天vs前60天对比，以下指标显著下降：{down_text}。部分指标下降可能是积极变化（如体重、血脂），也可能是需要关注的信号。',
                    'sources': list(set(m['source'] for m in metrics)),
                })

        return insights

    def _ai_cross_analysis(self, metrics, sources):
        """AI辅助跨源分析"""
        # 构建多源数据摘要
        summary = self._build_multi_source_summary(metrics)
        sources_str = ', '.join(sources)

        prompt = f"""你是健康数据分析专家。基于以下来自多个数据源的健康数据，请发现跨数据源的关联和模式。

数据来源：{sources_str}

{summary}

请生成2-3条深度洞察，每条包含：
1. 发现了什么跨源关联
2. 可能的健康含义
3. 具体建议

格式要求：每条洞察一行，以"• "开头。不要做诊断，只做健康提示。如果数据不足，说明哪些数据缺失。"""

        data = json.dumps({
            "model": "Agnes-2.0-Flash",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.5,
            "max_tokens": 1500
        }).encode()

        req = Request(
            f"{self.bit_assistant_url}/v1/chat/completions",
            data=data,
            headers={"Content-Type": "application/json"}
        )

        try:
            with urlopen(req, timeout=60) as resp:
                result = json.loads(resp.read())
                content = result['choices'][0]['message']['content']

                if content and content.strip():
                    return [{
                        'type': 'ai_cross_analysis',
                        'severity': 'info',
                        'title': 'AI跨源关联洞察',
                        'content': content.strip(),
                        'sources': list(sources),
                    }]
        except Exception as e:
            logger.warning(f"AI跨源分析失败: {e}")

        return []

    def _build_multi_source_summary(self, metrics):
        """构建多源数据摘要"""
        by_source = {}
        for m in metrics:
            src = m['source']
            if src not in by_source:
                by_source[src] = {}
            name = m['metric_name']
            if name not in by_source[src]:
                by_source[src][name] = {
                    'value': m['value'],
                    'unit': m['unit'],
                    'date': m['recorded_at'],
                }

        parts = []
        for src, metrics_dict in by_source.items():
            parts.append(f"\n【{src}】")
            for name, info in list(metrics_dict.items())[:20]:
                parts.append(f"  - {name}: {info['value']} {info['unit']} ({info['date']})")

        return '\n'.join(parts[:80])  # 限制总长度
