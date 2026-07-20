#!/usr/bin/env python3
"""
OCR语义增强模块
在传统OCR文字提取基础上，增加LLM语义理解层：
1. 异常指标自动识别与分级（红/黄/绿）
2. 诊断结论提取
3. 用药建议提取
4. 健康风险标签生成
"""

import json
import re
from datetime import datetime
from urllib.request import Request, urlopen
from logging_config import logger


class OCRSemanticEnhancer:
    """OCR语义增强器"""

    def __init__(self, bit_assistant_url="http://150.158.119.19:8431"):
        self.bit_assistant_url = bit_assistant_url

    def enhance(self, raw_text, metrics):
        """
        对OCR提取的原始文本和结构化指标进行语义增强

        返回:
            {
                'severity_tags': {指标名: 'red'|'yellow'|'green'},
                'diagnostic_conclusions': [...],  # 诊断结论
                'medication_suggestions': [...],   # 用药建议
                'risk_labels': [...],              # 风险标签
                'health_warnings': [...],          # 健康警告
                'enhanced_summary': str,           # 增强摘要
            }
        """
        result = {
            'severity_tags': {},
            'diagnostic_conclusions': [],
            'medication_suggestions': [],
            'risk_labels': [],
            'health_warnings': [],
            'enhanced_summary': '',
        }

        # 1. 基于规则的快速分级
        result['severity_tags'] = self._rule_based_severity(metrics)

        # 2. AI语义提取
        ai_result = self._ai_semantic_extract(raw_text, metrics)
        if ai_result:
            result.update(ai_result)

        # 3. 生成增强摘要
        result['enhanced_summary'] = self._generate_enhanced_summary(metrics, result)

        return result

    def _rule_based_severity(self, metrics):
        """基于规则的指标三级分级"""
        tags = {}

        # 危险阈值（红色）- 需要立即就医
        danger_rules = {
            '收缩压': lambda v: v >= 140,
            '舒张压': lambda v: v >= 90,
            '空腹血糖': lambda v: v >= 7.0,
            '餐后血糖': lambda v: v >= 11.1,
            '糖化血红蛋白': lambda v: v >= 6.5,
            '总胆固醇': lambda v: v >= 6.2,
            '低密度脂蛋白': lambda v: v >= 4.1,
            '甘油三酯': lambda v: v >= 2.3,
            'ALT': lambda v: v >= 80,
            'AST': lambda v: v >= 80,
            '肌酐': lambda v: v >= 133,
            '尿酸': lambda v: v >= 480,
            '血红蛋白': lambda v: v < 90,
            '血小板': lambda v: v < 100 or v > 400,
            '白细胞': lambda v: v < 3.0 or v > 12.0,
            'NT-proBNP': lambda v: v >= 450,
            'D-二聚体': lambda v: v >= 1.0,
            'AFP': lambda v: v >= 20,
            'CEA': lambda v: v >= 10,
        }

        # 警告阈值（黄色）- 需要关注
        warning_rules = {
            '收缩压': lambda v: 130 <= v < 140,
            '舒张压': lambda v: 85 <= v < 90,
            '空腹血糖': lambda v: 6.1 <= v < 7.0,
            '餐后血糖': lambda v: 7.8 <= v < 11.1,
            '糖化血红蛋白': lambda v: 5.7 <= v < 6.5,
            '总胆固醇': lambda v: 5.2 <= v < 6.2,
            '低密度脂蛋白': lambda v: 3.4 <= v < 4.1,
            '甘油三酯': lambda v: 1.7 <= v < 2.3,
            'ALT': lambda v: 40 <= v < 80,
            'AST': lambda v: 35 <= v < 80,
            'BMI': lambda v: v >= 24,
            '尿酸': lambda v: 420 <= v < 480,
            '血红蛋白': lambda v: 90 <= v < 110,
        }

        for m in metrics:
            name = m.get('name', '')
            value = m.get('value_num')
            if value is None:
                continue

            try:
                val = float(value)
            except (ValueError, TypeError):
                continue

            if name in danger_rules and danger_rules[name](val):
                tags[name] = 'red'
            elif name in warning_rules and warning_rules[name](val):
                tags[name] = 'yellow'
            else:
                tags[name] = 'green'

        return tags

    def _ai_semantic_extract(self, raw_text, metrics):
        """用AI提取诊断结论、用药建议、风险标签"""
        # 准备指标摘要
        abnormal_metrics = [m for m in metrics if m.get('status') in ('high', 'low', 'abnormal')]
        all_metrics_text = '\n'.join(
            f"- {m.get('name','')}: {m.get('value','')} {m.get('unit','')} "
            f"(参考: {m.get('reference','')}, 状态: {m.get('status','')})"
            for m in metrics[:50]
        )

        prompt = f"""请分析以下体检报告，提取结构化信息。

报告原始文本（节选）：
{raw_text[:4000]}

结构化指标：
{all_metrics_text}

请返回JSON格式（只输出JSON，不要其他内容）：
{{
    "diagnostic_conclusions": ["诊断结论1", "诊断结论2"],
    "medication_suggestions": ["用药建议1"],
    "risk_labels": ["高血压风险", "糖尿病风险"],
    "health_warnings": ["需要重点关注的问题1"]
}}

注意：
1. diagnostic_conclusions: 从报告中提取的诊断印象、体检结论
2. medication_suggestions: 报告中提到的用药建议或用药调整
3. risk_labels: 基于异常指标识别的健康风险标签（如"心血管风险"、"代谢综合征"等）
4. health_warnings: 需要特别关注的健康问题
5. 如果某项没有内容，返回空数组
6. 只输出JSON，不要其他文字"""

        data = json.dumps({
            "model": "Agnes-2.0-Flash",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3,
            "max_tokens": 2000
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

                # 提取JSON
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group())
                    return {
                        'diagnostic_conclusions': parsed.get('diagnostic_conclusions', []),
                        'medication_suggestions': parsed.get('medication_suggestions', []),
                        'risk_labels': parsed.get('risk_labels', []),
                        'health_warnings': parsed.get('health_warnings', []),
                    }
        except Exception as e:
            logger.warning(f"AI语义提取失败，使用规则兜底: {e}")

        # 规则兜底
        return self._rule_based_extract(metrics)

    def _rule_based_extract(self, metrics):
        """规则兜底的语义提取"""
        risk_labels = []
        warnings = []

        abnormal = {m['name']: m.get('value_num') for m in metrics if m.get('status') in ('high', 'low', 'abnormal') and m.get('value_num')}

        # 心血管风险
        cardio_metrics = ['收缩压', '舒张压', '总胆固醇', '低密度脂蛋白', '甘油三酯', '尿酸']
        cardio_abnormal = [m for m in cardio_metrics if m in abnormal]
        if len(cardio_abnormal) >= 2:
            risk_labels.append('心血管风险')
            warnings.append(f'多项心血管指标异常：{", ".join(cardio_abnormal)}，建议心内科就诊')

        # 代谢综合征风险
        metabolic_metrics = ['空腹血糖', '餐后血糖', '糖化血红蛋白', 'BMI', '尿酸']
        metabolic_abnormal = [m for m in metabolic_metrics if m in abnormal]
        if len(metabolic_abnormal) >= 2:
            risk_labels.append('代谢综合征风险')
            warnings.append(f'多项代谢指标异常：{", ".join(metabolic_abnormal)}，建议内分泌科就诊')

        # 肝功能异常
        liver_metrics = ['ALT', 'AST', 'GGT', '总胆红素']
        liver_abnormal = [m for m in liver_metrics if m in abnormal]
        if liver_abnormal:
            risk_labels.append('肝功能异常')
            warnings.append(f'肝功能指标异常：{", ".join(liver_abnormal)}，建议消化内科/肝病科就诊')

        # 贫血风险
        if '血红蛋白' in abnormal:
            risk_labels.append('贫血')
            warnings.append('血红蛋白偏低，建议检查贫血原因')

        # 肿瘤标志物
        tumor_metrics = ['AFP', 'CEA', 'CA125', 'CA199', 'PSA']
        tumor_abnormal = [m for m in tumor_metrics if m in abnormal]
        if tumor_abnormal:
            risk_labels.append('肿瘤标志物异常')
            warnings.append(f'肿瘤标志物异常：{", ".join(tumor_abnormal)}，建议专科复查')

        return {
            'diagnostic_conclusions': [],
            'medication_suggestions': [],
            'risk_labels': risk_labels,
            'health_warnings': warnings,
        }

    def _generate_enhanced_summary(self, metrics, semantic_result):
        """生成增强摘要"""
        total = len(metrics)
        red_count = sum(1 for v in semantic_result['severity_tags'].values() if v == 'red')
        yellow_count = sum(1 for v in semantic_result['severity_tags'].values() if v == 'yellow')
        green_count = total - red_count - yellow_count

        parts = [f"体检报告共{total}项指标"]

        if red_count > 0:
            red_items = [name for name, tag in semantic_result['severity_tags'].items() if tag == 'red']
            parts.append(f"🔴 {red_count}项严重异常（{', '.join(red_items[:5])}）")

        if yellow_count > 0:
            yellow_items = [name for name, tag in semantic_result['severity_tags'].items() if tag == 'yellow']
            parts.append(f"🟡 {yellow_count}项需关注（{', '.join(yellow_items[:5])}）")

        if green_count > 0:
            parts.append(f"🟢 {green_count}项正常")

        if semantic_result['risk_labels']:
            parts.append(f"风险标签：{', '.join(semantic_result['risk_labels'])}")

        if semantic_result['health_warnings']:
            parts.append("⚠️ " + "; ".join(semantic_result['health_warnings'][:3]))

        return "。".join(parts) + "。"
