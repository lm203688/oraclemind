#!/usr/bin/env python3
"""
数据连接器框架
统一接口管理所有健康数据源的连接与同步
"""

import os
import json
import sqlite3
from datetime import datetime
from abc import ABC, abstractmethod


class BaseConnector(ABC):
    """数据连接器基类"""
    
    def __init__(self, db_path=None):
        self.db_path = db_path or os.path.join(os.path.dirname(__file__), 'data', 'healthlens.db')
        self.source_type = self.__class__.source_type
        self.display_name = self.__class__.display_name
        self.icon = getattr(self.__class__, 'icon', '📡')
    
    @abstractmethod
    def get_auth_url(self, user_id, redirect_uri):
        """获取OAuth授权URL"""
        pass
    
    @abstractmethod
    def handle_callback(self, code, redirect_uri):
        """处理OAuth回调，返回user_id"""
        pass
    
    @abstractmethod
    def sync_data(self, user_id, connection_id):
        """同步数据，返回新记录数"""
        pass
    
    def save_connection(self, user_id, access_token, refresh_token=None, 
                       token_expires=None, metadata=None):
        """保存数据连接"""
        db = sqlite3.connect(self.db_path)
        try:
            # Check if connection already exists
            existing = db.execute(
                "SELECT id FROM data_connections WHERE user_id = ? AND source_type = ?",
                (user_id, self.source_type)
            ).fetchone()
            
            if existing:
                db.execute("""
                    UPDATE data_connections 
                    SET access_token = ?, refresh_token = ?, token_expires = ?,
                        metadata = ?, status = 'active', last_sync = ?
                    WHERE id = ?
                """, (access_token, refresh_token, token_expires,
                      json.dumps(metadata or {}), datetime.now().isoformat(), existing[0]))
                return existing[0]
            else:
                conn_id = os.urandom(8).hex()
                db.execute("""
                    INSERT INTO data_connections 
                    (id, user_id, source_type, access_token, refresh_token, 
                     token_expires, metadata, status, created_at, last_sync)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
                """, (conn_id, user_id, self.source_type, access_token, refresh_token,
                      token_expires, json.dumps(metadata or {}), 
                      datetime.now().isoformat(), datetime.now().isoformat()))
                return conn_id
        finally:
            db.commit()
            db.close()
    
    def get_connection(self, user_id):
        """获取用户的连接信息"""
        db = sqlite3.connect(self.db_path)
        db.row_factory = sqlite3.Row
        try:
            conn = db.execute(
                "SELECT * FROM data_connections WHERE user_id = ? AND source_type = ?",
                (user_id, self.source_type)
            ).fetchone()
            return dict(conn) if conn else None
        finally:
            db.close()
    
    def update_sync_time(self, connection_id):
        """更新最后同步时间"""
        db = sqlite3.connect(self.db_path)
        try:
            db.execute(
                "UPDATE data_connections SET last_sync = ? WHERE id = ?",
                (datetime.now().isoformat(), connection_id)
            )
            db.commit()
        finally:
            db.close()


class WithingsConnector(BaseConnector):
    """Withings (Nokia) 健康设备连接器
    支持：体重/体脂秤、血压计、睡眠监测、活动追踪
    """
    
    source_type = 'withings'
    display_name = 'Withings'
    icon = '⚖️'
    
    AUTH_URL = 'https://account.withings.com/oauth2_user/authorize2'
    TOKEN_URL = 'https://wbsapi.withings.net/v2/oauth2'
    API_BASE = 'https://wbsapi.withings.net'
    
    # Withings指标映射
    MEASURE_MAP = {
        1: ('体重', 'kg', '体成分'),
        4: ('身高', 'm', '体成分'),
        5: ('瘦体重(无脂肪)', 'kg', '体成分'),
        6: ('脂肪率', '%', '体成分'),
        8: ('脂肪质量', 'kg', '体成分'),
        11: ('心率', 'bpm', '心血管'),
        54: ('SP02', '%', '心血管'),
        71: ('体温', '℃', '体征'),
        73: ('皮肤温度', '℃', '体征'),
        76: ('肌肉质量', 'kg', '体成分'),
        77: ('水分质量', 'kg', '体成分'),
        88: ('骨量', 'kg', '体成分'),
        91: ('收缩压', 'mmHg', '心血管'),
        93: ('舒张压', 'mmHg', '心血管'),
    }
    
    def __init__(self, client_id=None, client_secret=None, db_path=None):
        super().__init__(db_path)
        self.client_id = client_id or os.environ.get('WITHINGS_CLIENT_ID', '')
        self.client_secret = client_secret or os.environ.get('WITHINGS_CLIENT_SECRET', '')
    
    def get_auth_url(self, user_id, redirect_uri):
        """生成Withings授权URL"""
        if not self.client_id:
            return None
        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': redirect_uri,
            'scope': 'user.metrics,user.activity,user.sleepevents',
            'state': user_id,
        }
        query = '&'.join(f'{k}={v}' for k, v in params.items())
        return f'{self.AUTH_URL}?{query}'
    
    def handle_callback(self, code, redirect_uri):
        """处理Withings OAuth回调"""
        import requests
        resp = requests.post(self.TOKEN_URL, data={
            'action': 'requesttoken',
            'grant_type': 'authorization_code',
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code': code,
            'redirect_uri': redirect_uri,
        })
        data = resp.json()
        if data.get('status') == 0:
            body = data['body']
            return {
                'access_token': body['access_token'],
                'refresh_token': body['refresh_token'],
                'expires_in': body.get('expires_in', 10800),
                'userid': str(body.get('userid', '')),
            }
        return None
    
    def refresh_access_token(self, refresh_token):
        """刷新access token"""
        import requests
        resp = requests.post(self.TOKEN_URL, data={
            'action': 'requesttoken',
            'grant_type': 'refresh_token',
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'refresh_token': refresh_token,
        })
        data = resp.json()
        if data.get('status') == 0:
            body = data['body']
            return {
                'access_token': body['access_token'],
                'refresh_token': body['refresh_token'],
                'expires_in': body.get('expires_in', 10800),
                'userid': str(body.get('userid', '')),
            }
        return None
    
    def sync_data(self, user_id, connection_id=None):
        """从Withings同步健康数据"""
        import requests
        
        conn = self.get_connection(user_id)
        if not conn:
            return 0
        
        access_token = conn['access_token']
        new_records = 0
        
        # Get last sync time
        last_sync = conn.get('last_sync')
        last_ts = None
        if last_sync:
            try:
                dt = datetime.fromisoformat(last_sync)
                last_ts = int(dt.timestamp())
            except:
                pass
        
        # Sync body measurements
        try:
            params = {
                'action': 'getmeas',
                'access_token': access_token,
                'meastype': ','.join(str(k) for k in self.MEASURE_MAP.keys()),
                'category': 1,  # Real measures
                'lastupdate': last_ts or 0,
            }
            resp = requests.get(f'{self.API_BASE}/v2/measure', params=params)
            data = resp.json()
            
            if data.get('status') == 0 and data.get('body', {}).get('measuregrps'):
                for grp in data['body']['measuregrps']:
                    date = datetime.fromtimestamp(grp['date']).strftime('%Y-%m-%d')
                    for meas in grp['measures']:
                        type_id = meas['type']
                        if type_id in self.MEASURE_MAP:
                            name, unit, category = self.MEASURE_MAP[type_id]
                            value = meas['value'] * (10 ** meas['unit'])
                            
                            self._save_record(user_id, {
                                'metric_type': category,
                                'metric_name': name,
                                'value': round(value, 2),
                                'unit': unit,
                                'recorded_at': date,
                                'source': 'Withings',
                                'metadata': json.dumps({
                                    'withings_type': type_id,
                                    'group_id': grp.get('grpid'),
                                    'raw_value': meas['value'],
                                    'raw_unit': meas['unit'],
                                })
                            })
                            new_records += 1
        except Exception as e:
            print(f"Withings sync error (measurements): {e}")
        
        # Sync activity data
        try:
            start_date = last_ts or int((datetime.now() - timedelta(days=30)).timestamp())
            end_date = int(datetime.now().timestamp())
            params = {
                'action': 'getactivity',
                'access_token': access_token,
                'startdate': start_date,
                'enddate': end_date,
            }
            resp = requests.get(f'{self.API_BASE}/v2/measure', params=params)
            data = resp.json()
            
            if data.get('status') == 0 and data.get('body', {}).get('activities'):
                for act in data['body']['activities']:
                    date = act.get('date', datetime.now().strftime('%Y-%m-%d'))
                    
                    activity_map = [
                        ('steps', '步数', '步', '活动'),
                        ('distance', '距离', 'm', '活动'),
                        ('calories', '消耗热量', 'kcal', '活动'),
                        ('elevation', '爬升', 'm', '活动'),
                    ]
                    
                    for key, name, unit, category in activity_map:
                        if key in act and act[key] > 0:
                            self._save_record(user_id, {
                                'metric_type': category,
                                'metric_name': name,
                                'value': round(float(act[key]), 2),
                                'unit': unit,
                                'recorded_at': date,
                                'source': 'Withings',
                                'metadata': json.dumps({'withings_activity': key}),
                            })
                            new_records += 1
                    
                    # Sleep data
                    if 'sleep' in act and act['sleep'] > 0:
                        hours = round(act['sleep'] / 3600, 1)
                        self._save_record(user_id, {
                            'metric_type': '睡眠',
                            'metric_name': '睡眠时长',
                            'value': hours,
                            'unit': '小时',
                            'recorded_at': date,
                            'source': 'Withings',
                            'metadata': json.dumps({'withings_activity': 'sleep'}),
                        })
                        new_records += 1
        except Exception as e:
            print(f"Withings sync error (activity): {e}")
        
        if new_records > 0:
            self.update_sync_time(connection_id or conn['id'])
        
        return new_records
    
    def _save_record(self, user_id, record):
        """保存健康记录到数据库"""
        db = sqlite3.connect(self.db_path)
        try:
            # Check for duplicate
            existing = db.execute(
                "SELECT id FROM health_records WHERE user_id = ? AND metric_name = ? AND recorded_at = ? AND source = ?",
                (user_id, record['metric_name'], record['recorded_at'], record['source'])
            ).fetchone()
            
            if not existing:
                record_id = os.urandom(8).hex()
                db.execute("""
                    INSERT INTO health_records (id, user_id, metric_type, metric_name, value, unit, recorded_at, source, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (record_id, user_id, record['metric_type'], record['metric_name'],
                      record['value'], record['unit'], record['recorded_at'],
                      record['source'], record.get('metadata', '')))
                db.commit()
        finally:
            db.close()


class WebhookReceiver:
    """通用Webhook接收器
    接收任何健康数据推送，统一格式入库
    """
    
    SUPPORTED_FORMATS = ['healthlens', 'withings', 'fitbit', 'garmin', 'custom']
    
    def __init__(self, db_path=None):
        self.db_path = db_path or os.path.join(os.path.dirname(__file__), 'data', 'healthlens.db')
    
    def receive(self, user_id, data, source='webhook', data_format='healthlens'):
        """接收Webhook数据"""
        if data_format == 'healthlens':
            return self._parse_healthlens_format(user_id, data, source)
        elif data_format == 'withings':
            return self._parse_withings_format(user_id, data)
        elif data_format == 'custom':
            return self._parse_custom_format(user_id, data, source)
        else:
            return self._parse_healthlens_format(user_id, data, source)
    
    def _parse_healthlens_format(self, user_id, data, source):
        """解析HealthLens标准格式
        期望格式: {"records": [{"metric_type": "...", "metric_name": "...", "value": ..., "unit": "...", "recorded_at": "..."}]}
        """
        records = data.get('records', [])
        saved = 0
        
        db = sqlite3.connect(self.db_path)
        try:
            for r in records:
                record_id = os.urandom(8).hex()
                try:
                    db.execute("""
                        INSERT INTO health_records (id, user_id, metric_type, metric_name, value, unit, recorded_at, source, metadata)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (record_id, user_id, 
                          r.get('metric_type', '其他'),
                          r.get('metric_name', '未知'),
                          r.get('value', 0),
                          r.get('unit', ''),
                          r.get('recorded_at', datetime.now().strftime('%Y-%m-%d')),
                          source,
                          json.dumps(r.get('metadata', {}))))
                    saved += 1
                except Exception as e:
                    print(f"Webhook record save error: {e}")
            db.commit()
        finally:
            db.close()
        
        return saved
    
    def _parse_withings_format(self, user_id, data):
        """解析Withings Webhook通知格式"""
        # Withings sends notification when new data is available
        # We then need to call the API to get the actual data
        return 0  # Actual sync handled by WithingsConnector.sync_data
    
    def _parse_custom_format(self, user_id, data, source):
        """解析自定义格式 - 尽量灵活"""
        saved = 0
        db = sqlite3.connect(self.db_path)
        try:
            # Support flat key-value format
            if isinstance(data, dict) and 'records' not in data:
                for key, value in data.items():
                    if isinstance(value, (int, float)):
                        record_id = os.urandom(8).hex()
                        try:
                            db.execute("""
                                INSERT INTO health_records (id, user_id, metric_type, metric_name, value, unit, recorded_at, source, metadata)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (record_id, user_id, '其他', key, value, '', 
                                  datetime.now().strftime('%Y-%m-%d'), source, '{}'))
                            saved += 1
                        except:
                            pass
                db.commit()
            elif isinstance(data, list):
                for r in data:
                    if isinstance(r, dict):
                        record_id = os.urandom(8).hex()
                        try:
                            db.execute("""
                                INSERT INTO health_records (id, user_id, metric_type, metric_name, value, unit, recorded_at, source, metadata)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (record_id, user_id,
                                  r.get('metric_type', '其他'),
                                  r.get('metric_name', r.get('name', '未知')),
                                  r.get('value', 0),
                                  r.get('unit', ''),
                                  r.get('recorded_at', datetime.now().strftime('%Y-%m-%d')),
                                  source,
                                  json.dumps(r.get('metadata', {}))))
                            saved += 1
                        except:
                            pass
                db.commit()
        finally:
            db.close()
        
        return saved


class AutoAnalyzer:
    """自动分析调度器
    新数据入库后自动触发分析，异常时生成告警
    """
    
    # 关键指标阈值
    THRESHOLDS = {
        '收缩压': {'warning': (130, 140), 'danger': (140, 999), 'unit': 'mmHg'},
        '舒张压': {'warning': (85, 90), 'danger': (90, 999), 'unit': 'mmHg'},
        '空腹血糖': {'warning': (6.1, 7.0), 'danger': (7.0, 999), 'unit': 'mmol/L'},
        '餐后血糖': {'warning': (7.8, 11.1), 'danger': (11.1, 999), 'unit': 'mmol/L'},
        '心率': {'warning': [(40, 50), (100, 120)], 'danger': [(0, 40), (120, 999)], 'unit': 'bpm'},
        'BMI': {'warning': (24, 28), 'danger': (28, 999), 'unit': ''},
        '脂肪率': {'warning_male': (25, 30), 'danger_male': (30, 999), 
                   'warning_female': (30, 35), 'danger_female': (35, 999), 'unit': '%'},
        '体温': {'warning': [(37.3, 38.0)], 'danger': [(38.0, 999)], 'unit': '℃'},
    }
    
    def __init__(self, db_path=None, bit_assistant_url=None):
        self.db_path = db_path or os.path.join(os.path.dirname(__file__), 'data', 'healthlens.db')
        self.bit_assistant_url = bit_assistant_url or os.environ.get('BIT_ASSISTANT_URL', 'http://150.158.119.19:8431')
    
    def check_new_data(self, user_id, since_minutes=60):
        """检查是否有新数据入库"""
        db = sqlite3.connect(self.db_path)
        try:
            count = db.execute("""
                SELECT COUNT(*) FROM health_records 
                WHERE user_id = ? AND created_at > datetime('now', ?)
            """, (user_id, f'-{since_minutes} minutes')).fetchone()[0]
            return count
        finally:
            db.close()
    
    def analyze_latest(self, user_id):
        """分析最新数据，返回告警列表"""
        db = sqlite3.connect(self.db_path)
        db.row_factory = sqlite3.Row
        alerts = []
        
        try:
            # Get latest metrics per type
            metrics = db.execute("""
                SELECT metric_name, value, unit, recorded_at, source
                FROM health_records 
                WHERE user_id = ?
                GROUP BY metric_name
                HAVING recorded_at = MAX(recorded_at)
                ORDER BY recorded_at DESC
            """, (user_id,)).fetchall()
            
            for m in metrics:
                name = m['metric_name']
                value = float(m['value']) if m['value'] else 0
                
                if name in self.THRESHOLDS:
                    threshold = self.THRESHOLDS[name]
                    severity = self._check_threshold(name, value, threshold)
                    
                    if severity:
                        alerts.append({
                            'metric': name,
                            'value': f"{value} {m['unit']}",
                            'severity': severity,
                            'message': self._generate_alert_message(name, value, severity, m['unit']),
                            'recorded_at': m['recorded_at'],
                            'source': m['source'],
                        })
            
            # Save alerts as insights
            for alert in alerts:
                self._save_insight(user_id, alert)
            
            # Check for trends (3+ consecutive increases/decreases)
            trends = self._detect_trends(user_id, db)
            for trend in trends:
                alerts.append(trend)
                self._save_insight(user_id, trend)
            
        finally:
            db.close()
        
        return alerts
    
    def _check_threshold(self, name, value, threshold):
        """检查是否超过阈值"""
        # Handle simple range thresholds
        if 'danger' in threshold and isinstance(threshold['danger'], tuple):
            low, high = threshold['danger']
            if low <= value < high:
                return 'danger'
        
        if 'warning' in threshold and isinstance(threshold['warning'], tuple):
            low, high = threshold['warning']
            if low <= value < high:
                return 'warning'
        
        # Handle list of ranges
        if 'danger' in threshold and isinstance(threshold['danger'], list):
            for low, high in threshold['danger']:
                if low <= value < high:
                    return 'danger'
        
        if 'warning' in threshold and isinstance(threshold['warning'], list):
            for low, high in threshold['warning']:
                if low <= value < high:
                    return 'warning'
        
        return None
    
    def _generate_alert_message(self, name, value, severity, unit):
        """生成告警消息"""
        messages = {
            '收缩压': {
                'warning': f'收缩压{value}{unit}，偏高（正常<130），建议低盐饮食、规律运动',
                'danger': f'收缩压{value}{unit}，高血压！请尽快就医',
            },
            '舒张压': {
                'warning': f'舒张压{value}{unit}，偏高（正常<85），注意休息和减压',
                'danger': f'舒张压{value}{unit}，高血压！请尽快就医',
            },
            '空腹血糖': {
                'warning': f'空腹血糖{value}{unit}，属于糖尿病前期（6.1-7.0），建议控制碳水摄入',
                'danger': f'空腹血糖{value}{unit}，已达糖尿病标准，请就医',
            },
            '心率': {
                'warning': f'心率{value}{unit}，偏离正常范围（60-100），建议关注',
                'danger': f'心率{value}{unit}，严重异常，请就医',
            },
            'BMI': {
                'warning': f'BMI {value}，超重（24-28），建议控制体重',
                'danger': f'BMI {value}，肥胖（≥28），建议就医制定减重方案',
            },
        }
        
        return messages.get(name, {}).get(severity, 
            f'{name}{value}{unit}，{severity == "danger" and "异常，请就医" or "偏离正常范围，请关注"}')
    
    def _detect_trends(self, user_id, db):
        """检测趋势变化"""
        alerts = []
        
        # Check key metrics for 3+ consecutive changes
        key_metrics = ['体重', '收缩压', '舒张压', '空腹血糖', '心率']
        
        for metric in key_metrics:
            records = db.execute("""
                SELECT value, recorded_at FROM health_records
                WHERE user_id = ? AND metric_name = ?
                ORDER BY recorded_at DESC LIMIT 5
            """, (user_id, metric)).fetchall()
            
            if len(records) >= 3:
                values = [float(r['value']) for r in records]
                # Check consecutive increase
                if all(values[i] > values[i+1] for i in range(len(values)-1)):
                    alerts.append({
                        'metric': metric,
                        'severity': 'warning',
                        'message': f'{metric}连续{len(values)}次上升：{" → ".join(str(v) for v in reversed(values))}，建议关注趋势',
                        'trend': 'increasing',
                    })
                # Check consecutive decrease
                elif all(values[i] < values[i+1] for i in range(len(values)-1)):
                    alerts.append({
                        'metric': metric,
                        'severity': 'info',
                        'message': f'{metric}连续{len(values)}次下降：{" → ".join(str(v) for v in reversed(values))}',
                        'trend': 'decreasing',
                    })
        
        return alerts
    
    def _save_insight(self, user_id, alert):
        """保存洞察到数据库"""
        db = sqlite3.connect(self.db_path)
        try:
            insight_id = os.urandom(8).hex()
            severity = alert.get('severity', 'info')
            title = f"{'⚠️' if severity == 'warning' else '🔴' if severity == 'danger' else '📊'} {alert.get('metric', '健康趋势')}"
            
            db.execute("""
                INSERT INTO insights (id, user_id, title, content, severity, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (insight_id, user_id, title, alert.get('message', ''), 
                  severity, datetime.now().isoformat()))
            db.commit()
        finally:
            db.close()
    
    def run_scheduled_analysis(self):
        """定时分析所有活跃用户"""
        db = sqlite3.connect(self.db_path)
        db.row_factory = sqlite3.Row
        try:
            # Get all users with recent data
            users = db.execute("""
                SELECT DISTINCT user_id FROM health_records
                WHERE created_at > datetime('now', '-24 hours')
            """).fetchall()
            
            results = {}
            for u in users:
                user_id = u['user_id']
                alerts = self.analyze_latest(user_id)
                if alerts:
                    results[user_id] = alerts
            
            return results
        finally:
            db.close()


# 连接器注册表
CONNECTORS = {
    'withings': WithingsConnector,
}

def get_connector(source_type, **kwargs):
    """获取数据连接器实例"""
    if source_type in CONNECTORS:
        return CONNECTORS[source_type](**kwargs)
    return None

def list_available_connectors():
    """列出所有可用连接器"""
    return [
        {
            'type': 'withings',
            'name': 'Withings',
            'icon': '⚖️',
            'description': '智能体重秤、血压计、睡眠监测',
            'auth_required': True,
        },
        {
            'type': 'apple_health',
            'name': 'Apple Health',
            'icon': '🍎',
            'description': 'iPhone/Apple Watch健康数据',
            'auth_required': False,  # Manual export
            'auth_type': 'file_upload',
        },
        {
            'type': 'xiaomi',
            'name': '小米运动',
            'icon': '📱',
            'description': '小米手环/体重秤数据',
            'auth_required': True,
            'status': 'coming_soon',
        },
        {
            'type': 'huawei',
            'name': '华为运动健康',
            'icon': '⌚',
            'description': '华为手环/手表数据',
            'auth_required': True,
            'status': 'coming_soon',
        },
        {
            'type': 'webhook',
            'name': 'Webhook',
            'icon': '🔗',
            'description': '自定义数据推送接口',
            'auth_required': False,
            'auth_type': 'api_key',
        },
    ]
