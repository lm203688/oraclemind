#!/usr/bin/env python3
"""
PII脱敏模块
自动识别并脱敏体检报告中的个人敏感信息
"""

import re


# PII正则模式
PII_PATTERNS = {
    'phone': {
        'pattern': re.compile(r'(?<!\d)1[3-9]\d{9}(?!\d)'),
        'replacement': '1**********',
        'label': '手机号'
    },
    'id_card': {
        'pattern': re.compile(r'(?<!\d)[1-9]\d{5}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx](?!\d)'),
        'replacement': '******************',
        'label': '身份证号'
    },
    'email': {
        'pattern': re.compile(r'(?<![@\w])[\w.-]+@[\w.-]+\.\w+'),
        'replacement': '***@***.***',
        'label': '邮箱'
    },
    'passport': {
        'pattern': re.compile(r'\b[A-Z]\d{8}\b'),
        'replacement': '*********',
        'label': '护照号'
    },
    'bank_card': {
        'pattern': re.compile(r'\b622\d{12,15}\b'),
        'replacement': '****',
        'label': '银行卡号'
    },
    'address': {
        'pattern': re.compile(r'(?:省|市|区|县|镇|乡|村|路|街|号|室|楼|栋|单元)\d*'),
        'replacement': '[地址]',
        'label': '地址'
    },
}

# 姓名脱敏模式（体检报告常见格式）
NAME_PATTERNS = [
    re.compile(r'(姓\s*名[：:]\s*)([\u4e00-\u9fa5]{2,4})'),
    re.compile(r'(Name[：:]\s*)([\u4e00-\u9fa5]{2,4})'),
    re.compile(r'(患者[：:]\s*)([\u4e00-\u9fa5]{2,4})'),
]


def sanitize_text(text: str, keep_name: bool = False) -> str:
    """
    脱敏文本中的PII信息
    
    Args:
        text: 原始文本
        keep_name: 是否保留姓名（某些场景需要）
    
    Returns:
        脱敏后的文本
    """
    if not text:
        return text
    
    sanitized = text
    
    # 脱敏各种PII
    for pii_type, config in PII_PATTERNS.items():
        sanitized = config['pattern'].sub(config['replacement'], sanitized)
    
    # 姓名脱敏
    if not keep_name:
        for pattern in NAME_PATTERNS:
            def replace_name(match):
                name = match.group(2)
                if len(name) == 2:
                    masked = name[0] + '*'
                elif len(name) >= 3:
                    masked = name[0] + '*' * (len(name) - 2) + name[-1]
                else:
                    masked = '*'
                return match.group(1) + masked
            sanitized = pattern.sub(replace_name, sanitized)
    
    return sanitized


def extract_pii(text: str) -> dict:
    """
    提取文本中的PII信息（不脱敏，仅识别）
    
    Returns:
        {pii_type: [found_values]}
    """
    found = {}
    for pii_type, config in PII_PATTERNS.items():
        matches = config['pattern'].findall(text)
        if matches:
            found[config['label']] = list(set(matches))
    return found


def sanitize_metrics(metrics: list) -> list:
    """
    脱敏指标列表中的metadata
    确保metadata中不包含PII
    """
    for m in metrics:
        # 如果有raw_text字段，脱敏
        if 'raw_text' in m:
            m['raw_text'] = sanitize_text(m['raw_text'])
        # metadata中的文本字段也脱敏
        if 'metadata' in m and isinstance(m['metadata'], dict):
            for key, val in m['metadata'].items():
                if isinstance(val, str) and len(val) > 5:
                    m['metadata'][key] = sanitize_text(val)
    return metrics


def sanitize_report(raw_text: str) -> tuple:
    """
    脱敏体检报告原文
    
    Returns:
        (sanitized_text, pii_found)
    """
    pii_found = extract_pii(raw_text)
    sanitized = sanitize_text(raw_text)
    return sanitized, pii_found
