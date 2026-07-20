#!/usr/bin/env python3
"""
Apple Health数据解析器
解析Apple Health导出的XML/ZIP文件
"""

import os
import re
import json
import zipfile
from datetime import datetime
from xml.etree import ElementTree as ET


# Apple Health指标映射
HEALTH_TYPE_MAP = {
    'HKQuantityTypeIdentifierStepCount': ('步数', '步', '活动'),
    'HKQuantityTypeIdentifierDistanceWalkingRunning': ('步行+跑步距离', 'km', '活动'),
    'HKQuantityTypeIdentifierFlightsClimbed': ('爬楼层数', '层', '活动'),
    'HKQuantityTypeIdentifierHeartRate': ('心率', '次/分', '心血管'),
    'HKQuantityTypeIdentifierRestingHeartRate': ('静息心率', '次/分', '心血管'),
    'HKQuantityTypeIdentifierWalkingHeartRateAverage': ('步行平均心率', '次/分', '心血管'),
    'HKQuantityTypeIdentifierHeartRateVariabilitySDNN': ('心率变异性', 'ms', '心血管'),
    'HKQuantityTypeIdentifierBloodPressureSystolic': ('收缩压', 'mmHg', '心血管'),
    'HKQuantityTypeIdentifierBloodPressureDiastolic': ('舒张压', 'mmHg', '心血管'),
    'HKQuantityTypeIdentifierBodyMass': ('体重', 'kg', '体征'),
    'HKQuantityTypeIdentifierBodyMassIndex': ('BMI', '', '体征'),
    'HKQuantityTypeIdentifierHeight': ('身高', 'cm', '体征'),
    'HKQuantityTypeIdentifierBodyFatPercentage': ('体脂率', '%', '体征'),
    'HKQuantityTypeIdentifierWaistCircumference': ('腰围', 'cm', '体征'),
    'HKQuantityTypeIdentifierSleepAnalysis': ('睡眠', '小时', '睡眠'),
    'HKQuantityTypeIdentifierBloodGlucose': ('血糖', 'mg/dL', '血糖'),
    'HKQuantityTypeIdentifierOxygenSaturation': ('血氧饱和度', '%', '呼吸'),
    'HKQuantityTypeIdentifierRespiratoryRate': ('呼吸频率', '次/分', '呼吸'),
    'HKQuantityTypeIdentifierBodyTemperature': ('体温', '℃', '体征'),
    'HKQuantityTypeIdentifierActiveEnergyBurned': ('活动消耗', 'kcal', '活动'),
    'HKQuantityTypeIdentifierBasalEnergyBurned': ('基础代谢', 'kcal', '活动'),
    'HKQuantityTypeIdentifierAppleExerciseTime': ('运动时间', '分钟', '活动'),
    'HKQuantityTypeIdentifierAppleStandTime': ('站立时间', '分钟', '活动'),
    'HKQuantityTypeIdentifierVO2Max': ('最大摄氧量', 'mL/kg·min', '心血管'),
    'HKQuantityTypeIdentifierEnvironmentalSoundExposure': ('环境噪音', 'dB', '环境'),
    'HKQuantityTypeIdentifierHeadphoneAudioExposure': ('耳机音量', 'dB', '环境'),
    'HKCategoryTypeIdentifierSleepAnalysis': ('睡眠分析', '', '睡眠'),
    'HKCategoryTypeIdentifierAppleStandHour': ('站立小时', '', '活动'),
}

# 只保留这些关键指标的每日汇总（避免数据量爆炸）
KEY_METRICS = [
    'HKQuantityTypeIdentifierStepCount',
    'HKQuantityTypeIdentifierHeartRate',
    'HKQuantityTypeIdentifierRestingHeartRate',
    'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
    'HKQuantityTypeIdentifierBloodPressureSystolic',
    'HKQuantityTypeIdentifierBloodPressureDiastolic',
    'HKQuantityTypeIdentifierBodyMass',
    'HKQuantityTypeIdentifierBloodGlucose',
    'HKQuantityTypeIdentifierOxygenSaturation',
    'HKQuantityTypeIdentifierSleepAnalysis',
    'HKQuantityTypeIdentifierActiveEnergyBurned',
    'HKQuantityTypeIdentifierVO2Max',
]


class AppleHealthParser:
    def parse(self, filepath, user_id='default'):
        """解析Apple Health导出文件"""
        ext = os.path.splitext(filepath)[1].lower()
        
        if ext == '.zip':
            return self._parse_zip(filepath, user_id)
        elif ext == '.xml':
            return self._parse_xml(filepath, user_id)
        else:
            raise ValueError(f"不支持的格式: {ext}，需要XML或ZIP")
    
    def _parse_zip(self, zip_path, user_id):
        """解析ZIP格式的Apple Health导出"""
        with zipfile.ZipFile(zip_path, 'r') as zf:
            # 查找export.xml
            xml_name = None
            for name in zf.namelist():
                if name.endswith('export.xml') or name.endswith('apple_health_export/export.xml'):
                    xml_name = name
                    break
            
            if not xml_name:
                raise ValueError("ZIP中未找到export.xml")
            
            # 解压到临时目录
            temp_dir = os.path.dirname(zip_path)
            zf.extract(xml_name, temp_dir)
            xml_path = os.path.join(temp_dir, xml_name)
            
            try:
                return self._parse_xml(xml_path, user_id)
            finally:
                if os.path.exists(xml_path):
                    os.remove(xml_path)
    
    def _parse_xml(self, xml_path, user_id):
        """解析Apple Health XML文件"""
        records = []
        daily_agg = {}  # {type_date: {sum, count, min, max}}
        
        # 流式解析（文件可能很大）
        context = ET.iterparse(xml_path, events=('end',))
        
        for event, elem in context:
            if elem.tag != 'Record':
                elem.clear()
                continue
            
            type_id = elem.get('type', '')
            if type_id not in KEY_METRICS:
                elem.clear()
                continue
            
            value_str = elem.get('value', '')
            start_date = elem.get('startDate', '')
            unit = elem.get('unit', '')
            
            # 解析日期
            date_str = self._parse_apple_date(start_date)
            if not date_str:
                elem.clear()
                continue
            
            # 解析数值
            try:
                value = float(value_str)
            except (ValueError, TypeError):
                elem.clear()
                continue
            
            # 每日汇总
            agg_key = f"{type_id}_{date_str}"
            if agg_key not in daily_agg:
                daily_agg[agg_key] = {'sum': 0, 'count': 0, 'min': float('inf'), 'max': float('-inf')}
            
            agg = daily_agg[agg_key]
            agg['sum'] += value
            agg['count'] += 1
            agg['min'] = min(agg['min'], value)
            agg['max'] = max(agg['max'], value)
            
            elem.clear()
        
        # 生成汇总记录
        for agg_key, agg in daily_agg.items():
            type_id, date_str = agg_key.rsplit('_', 1)
            mapping = HEALTH_TYPE_MAP.get(type_id, (type_id.split('Identifier')[-1], '', '其他'))
            metric_name, default_unit, metric_type = mapping
            
            # 根据指标类型决定取值方式
            if type_id in ('HKQuantityTypeIdentifierStepCount', 'HKQuantityTypeIdentifierActiveEnergyBurned'):
                value = agg['sum']  # 累计值
            elif type_id in ('HKQuantityTypeIdentifierHeartRate', 'HKQuantityTypeIdentifierBloodPressureSystolic'):
                value = round(agg['sum'] / agg['count'], 1)  # 平均值
            else:
                value = round(agg['sum'] / agg['count'], 2)
            
            records.append({
                'metric_type': metric_type,
                'metric_name': metric_name,
                'value': value,
                'unit': default_unit or unit,
                'recorded_at': date_str,
                'metadata': {
                    'count': agg['count'],
                    'min': round(agg['min'], 2),
                    'max': round(agg['max'], 2),
                    'source': 'Apple Health',
                    'original_type': type_id
                }
            })
        
        # 按日期排序
        records.sort(key=lambda r: r['recorded_at'])
        return records
    
    def _parse_apple_date(self, date_str):
        """解析Apple Health日期格式: 2026-01-15 08:30:00 +0800"""
        if not date_str:
            return None
        match = re.match(r'(\d{4})-(\d{2})-(\d{2})', date_str)
        if match:
            return f"{match.group(1)}-{match.group(2)}-{match.group(3)}"
        return None
