#!/usr/bin/env python3
"""
LOINC标准编码映射
将中文体检指标名映射到国际标准LOINC编码
数据来源：LOINC官方数据库 (loinc.org)
"""

LOINC_MAP = {
    # ============ 心血管类 ============
    "收缩压": {"loinc": "8480-6", "unit": "mmHg", "category": "心血管", "ref_range": "90-120"},
    "舒张压": {"loinc": "8462-4", "unit": "mmHg", "category": "心血管", "ref_range": "60-80"},
    "心率": {"loinc": "8867-4", "unit": "次/min", "category": "心血管", "ref_range": "60-100"},
    "静息心率": {"loinc": "8889-8", "unit": "次/min", "category": "心血管", "ref_range": "60-100"},
    "心率变异性": {"loinc": "80404-9", "unit": "ms", "category": "心血管", "ref_range": ">50"},
    "心率变异性SDNN": {"loinc": "80404-9", "unit": "ms", "category": "心血管", "ref_range": ">50"},
    "总胆固醇": {"loinc": "2093-3", "unit": "mmol/L", "category": "心血管", "ref_range": "<5.2"},
    "甘油三酯": {"loinc": "2571-8", "unit": "mmol/L", "category": "心血管", "ref_range": "<1.7"},
    "高密度脂蛋白": {"loinc": "2085-9", "unit": "mmol/L", "category": "心血管", "ref_range": ">1.0"},
    "低密度脂蛋白": {"loinc": "18262-6", "unit": "mmol/L", "category": "心血管", "ref_range": "<3.4"},
    "载脂蛋白A": {"loinc": "9205-3", "unit": "g/L", "category": "心血管", "ref_range": "1.2-1.6"},
    "载脂蛋白B": {"loinc": "9206-1", "unit": "g/L", "category": "心血管", "ref_range": "0.6-1.1"},
    "脂蛋白a": {"loinc": "14450-8", "unit": "nmol/L", "category": "心血管", "ref_range": "<300"},
    "同型半胱氨酸": {"loinc": "33219-9", "unit": "μmol/L", "category": "心血管", "ref_range": "<15"},
    "超敏C反应蛋白": {"loinc": "30522-7", "unit": "mg/L", "category": "心血管", "ref_range": "<1.0"},
    "肌酸激酶": {"loinc": "2157-6", "unit": "U/L", "category": "心血管", "ref_range": "24-195"},
    "肌钙蛋白I": {"loinc": "33204-1", "unit": "ng/mL", "category": "心血管", "ref_range": "<0.04"},
    "BNP": {"loinc": "30934-4", "unit": "pg/mL", "category": "心血管", "ref_range": "<100"},
    "NT-proBNP": {"loinc": "33762-6", "unit": "pg/mL", "category": "心血管", "ref_range": "<125"},

    # ============ 代谢类 ============
    "空腹血糖": {"loinc": "1558-6", "unit": "mmol/L", "category": "代谢", "ref_range": "3.9-6.1"},
    "餐后血糖": {"loinc": "14743-9", "unit": "mmol/L", "category": "代谢", "ref_range": "<7.8"},
    "糖化血红蛋白": {"loinc": "59261-8", "unit": "%", "category": "代谢", "ref_range": "4.0-6.0"},
    "胰岛素": {"loinc": "20448-7", "unit": "μIU/mL", "category": "代谢", "ref_range": "2.6-24.9"},
    "C肽": {"loinc": "13985-9", "unit": "ng/mL", "category": "代谢", "ref_range": "1.1-4.4"},
    "尿酸": {"loinc": "3084-1", "unit": "μmol/L", "category": "代谢", "ref_range": "208-428"},
    "尿素": {"loinc": "3094-0", "unit": "mmol/L", "category": "代谢", "ref_range": "2.6-7.1"},
    "肌酐": {"loinc": "38483-4", "unit": "μmol/L", "category": "代谢", "ref_range": "57-97"},
    "eGFR": {"loinc": "33914-3", "unit": "mL/min/1.73m2", "category": "代谢", "ref_range": ">90"},
    "总胆红素": {"loinc": "1975-2", "unit": "μmol/L", "category": "代谢", "ref_range": "3.4-17.1"},
    "直接胆红素": {"loinc": "1968-7", "unit": "μmol/L", "category": "代谢", "ref_range": "0-6.8"},
    "间接胆红素": {"loinc": "29917-6", "unit": "μmol/L", "category": "代谢", "ref_range": "1.7-10.2"},
    "ALT": {"loinc": "1742-6", "unit": "U/L", "category": "代谢", "ref_range": "7-40"},
    "AST": {"loinc": "1920-8", "unit": "U/L", "category": "代谢", "ref_range": "13-35"},
    "GGT": {"loinc": "2324-2", "unit": "U/L", "category": "代谢", "ref_range": "7-45"},
    "ALP": {"loinc": "6768-6", "unit": "U/L", "category": "代谢", "ref_range": "45-125"},
    "总蛋白": {"loinc": "2885-2", "unit": "g/L", "category": "代谢", "ref_range": "65-85"},
    "白蛋白": {"loinc": "1751-7", "unit": "g/L", "category": "代谢", "ref_range": "40-55"},
    "球蛋白": {"loinc": "2327-5", "unit": "g/L", "category": "代谢", "ref_range": "20-40"},

    # ============ 血常规 ============
    "白细胞": {"loinc": "6690-2", "unit": "10^9/L", "category": "血常规", "ref_range": "4.0-10.0"},
    "红细胞": {"loinc": "789-8", "unit": "10^12/L", "category": "血常规", "ref_range": "4.0-5.5"},
    "血红蛋白": {"loinc": "718-7", "unit": "g/L", "category": "血常规", "ref_range": "120-160"},
    "血小板": {"loinc": "777-3", "unit": "10^9/L", "category": "血常规", "ref_range": "125-350"},
    "中性粒细胞": {"loinc": "751-8", "unit": "10^9/L", "category": "血常规", "ref_range": "2.0-7.0"},
    "淋巴细胞": {"loinc": "731-0", "unit": "10^9/L", "category": "血常规", "ref_range": "1.0-3.0"},
    "单核细胞": {"loinc": "742-7", "unit": "10^9/L", "category": "血常规", "ref_range": "0.1-0.6"},
    "嗜酸性粒细胞": {"loinc": "711-2", "unit": "10^9/L", "category": "血常规", "ref_range": "0.02-0.5"},
    "嗜碱性粒细胞": {"loinc": "706-2", "unit": "10^9/L", "category": "血常规", "ref_range": "0-0.1"},
    "红细胞压积": {"loinc": "4544-3", "unit": "%", "category": "血常规", "ref_range": "37-50"},
    "平均红细胞体积": {"loinc": "787-2", "unit": "fL", "category": "血常规", "ref_range": "80-100"},
    "MCH": {"loinc": "785-6", "unit": "pg", "category": "血常规", "ref_range": "27-34"},
    "MCHC": {"loinc": "786-4", "unit": "g/L", "category": "血常规", "ref_range": "316-354"},
    "RDW": {"loinc": "788-0", "unit": "%", "category": "血常规", "ref_range": "11.5-14.5"},

    # ============ 体成分 ============
    "体重": {"loinc": "29463-7", "unit": "kg", "category": "体成分", "ref_range": ""},
    "身高": {"loinc": "8302-2", "unit": "cm", "category": "体成分", "ref_range": ""},
    "BMI": {"loinc": "39156-5", "unit": "kg/m2", "category": "体成分", "ref_range": "18.5-23.9"},
    "体脂率": {"loinc": "41982-0", "unit": "%", "category": "体成分", "ref_range": "10-25"},
    "脂肪率": {"loinc": "41982-0", "unit": "%", "category": "体成分", "ref_range": "10-25"},
    "瘦体重": {"loinc": "29463-7", "unit": "kg", "category": "体成分", "ref_range": ""},
    "瘦体重(无脂肪)": {"loinc": "73707-2", "unit": "kg", "category": "体成分", "ref_range": ""},
    "骨量": {"loinc": "41974-7", "unit": "kg", "category": "体成分", "ref_range": "2-4"},
    "水分质量": {"loinc": "73708-0", "unit": "kg", "category": "体成分", "ref_range": ""},
    "肌肉质量": {"loinc": "73707-2", "unit": "kg", "category": "体成分", "ref_range": ""},
    "基础代谢率": {"loinc": "8336-0", "unit": "kcal", "category": "体成分", "ref_range": ""},
    "脂肪质量": {"loinc": "73709-8", "unit": "kg", "category": "体成分", "ref_range": ""},

    # ============ 甲状腺 ============
    "TSH": {"loinc": "3016-3", "unit": "mIU/L", "category": "甲状腺", "ref_range": "0.4-4.0"},
    "FT3": {"loinc": "3053-6", "unit": "pmol/L", "category": "甲状腺", "ref_range": "3.1-6.8"},
    "FT4": {"loinc": "3024-6", "unit": "pmol/L", "category": "甲状腺", "ref_range": "12-22"},
    "TT3": {"loinc": "3051-0", "unit": "nmol/L", "category": "甲状腺", "ref_range": "1.3-3.1"},
    "TT4": {"loinc": "3022-0", "unit": "nmol/L", "category": "甲状腺", "ref_range": "66-181"},
    "抗甲状腺过氧化物酶抗体": {"loinc": "10655-7", "unit": "IU/mL", "category": "甲状腺", "ref_range": "<34"},
    "抗甲状腺球蛋白抗体": {"loinc": "2842-3", "unit": "IU/mL", "category": "甲状腺", "ref_range": "<115"},

    # ============ 肝功能（补充）============
    "前白蛋白": {"loinc": "1751-7", "unit": "mg/L", "category": "代谢", "ref_range": "200-400"},
    "胆碱酯酶": {"loinc": "20611-6", "unit": "U/L", "category": "代谢", "ref_range": "5000-12000"},
    "总胆汁酸": {"loinc": "3244-0", "unit": "μmol/L", "category": "代谢", "ref_range": "0-10"},

    # ============ 肾功能（补充）============
    "胱抑素C": {"loinc": "33206-6", "unit": "mg/L", "category": "代谢", "ref_range": "0.5-1.0"},
    "β2微球蛋白": {"loinc": "1838-6", "unit": "mg/L", "category": "代谢", "ref_range": "0.7-1.8"},
    "尿微量白蛋白": {"loinc": "14957-8", "unit": "mg/L", "category": "代谢", "ref_range": "<20"},
    "尿肌酐": {"loinc": "2161-8", "unit": "mmol/L", "category": "代谢", "ref_range": "2.5-7.5"},
    "尿微量白蛋白/肌酐比值": {"loinc": "14959-4", "unit": "mg/g", "category": "代谢", "ref_range": "<30"},

    # ============ 肿瘤标志物 ============
    "AFP": {"loinc": "1834-5", "unit": "ng/mL", "category": "肿瘤标志物", "ref_range": "<7"},
    "CEA": {"loinc": "2039-6", "unit": "ng/mL", "category": "肿瘤标志物", "ref_range": "<5"},
    "CA125": {"loinc": "33254-7", "unit": "U/mL", "category": "肿瘤标志物", "ref_range": "<35"},
    "CA199": {"loinc": "24108-3", "unit": "U/mL", "category": "肿瘤标志物", "ref_range": "<37"},
    "CA153": {"loinc": "17718-1", "unit": "U/mL", "category": "肿瘤标志物", "ref_range": "<25"},
    "PSA": {"loinc": "2857-1", "unit": "ng/mL", "category": "肿瘤标志物", "ref_range": "<4"},
    "fPSA": {"loinc": "32608-0", "unit": "ng/mL", "category": "肿瘤标志物", "ref_range": "<0.8"},
    "CA724": {"loinc": "72251-2", "unit": "U/mL", "category": "肿瘤标志物", "ref_range": "<6.9"},
    "NSE": {"loinc": "16712-2", "unit": "ng/mL", "category": "肿瘤标志物", "ref_range": "<16.3"},
    "CYFRA21-1": {"loinc": "6074-5", "unit": "ng/mL", "category": "肿瘤标志物", "ref_range": "<3.3"},

    # ============ 维生素/微量元素 ============
    "维生素D": {"loinc": "2284-8", "unit": "nmol/L", "category": "微量元素", "ref_range": "75-250"},
    "维生素B12": {"loinc": "2131-0", "unit": "pg/mL", "category": "微量元素", "ref_range": "200-900"},
    "叶酸": {"loinc": "2282-2", "unit": "nmol/L", "category": "微量元素", "ref_range": ">10"},
    "铁蛋白": {"loinc": "2276-4", "unit": "ng/mL", "category": "微量元素", "ref_range": "30-400"},
    "血清铁": {"loinc": "2502-3", "unit": "μmol/L", "category": "微量元素", "ref_range": "10.6-28.3"},
    "钙": {"loinc": "17861-6", "unit": "mmol/L", "category": "微量元素", "ref_range": "2.1-2.6"},
    "磷": {"loinc": "2777-1", "unit": "mmol/L", "category": "微量元素", "ref_range": "0.8-1.5"},
    "镁": {"loinc": "2601-3", "unit": "mmol/L", "category": "微量元素", "ref_range": "0.7-1.0"},
    "钾": {"loinc": "2823-3", "unit": "mmol/L", "category": "微量元素", "ref_range": "3.5-5.3"},
    "钠": {"loinc": "2951-2", "unit": "mmol/L", "category": "微量元素", "ref_range": "136-146"},
    "氯": {"loinc": "2075-0", "unit": "mmol/L", "category": "微量元素", "ref_range": "96-106"},

    # ============ 凝血功能 ============
    "凝血酶原时间": {"loinc": "5894-1", "unit": "s", "category": "凝血", "ref_range": "9.4-12.5"},
    "INR": {"loinc": "34714-6", "unit": "", "category": "凝血", "ref_range": "0.8-1.2"},
    "APTT": {"loinc": "14979-2", "unit": "s", "category": "凝血", "ref_range": "25-37"},
    "纤维蛋白原": {"loinc": "3255-6", "unit": "g/L", "category": "凝血", "ref_range": "2-4"},
    "D-二聚体": {"loinc": "48066-4", "unit": "mg/L", "category": "凝血", "ref_range": "<0.5"},

    # ============ 尿常规 ============
    "尿蛋白": {"loinc": "5804-0", "unit": "", "category": "尿常规", "ref_range": "阴性"},
    "尿糖": {"loinc": "2350-7", "unit": "", "category": "尿常规", "ref_range": "阴性"},
    "尿潜血": {"loinc": "5802-4", "unit": "", "category": "尿常规", "ref_range": "阴性"},
    "尿酮体": {"loinc": "33903-6", "unit": "", "category": "尿常规", "ref_range": "阴性"},
    "尿白细胞": {"loinc": "5821-4", "unit": "", "category": "尿常规", "ref_range": "阴性"},
    "尿pH": {"loinc": "5803-2", "unit": "", "category": "尿常规", "ref_range": "4.6-8.0"},
    "尿比重": {"loinc": "5811-5", "unit": "", "category": "尿常规", "ref_range": "1.003-1.030"},

    # ============ 可穿戴/Apple Health ============
    "步数": {"loinc": "41950-8", "unit": "步", "category": "活动", "ref_range": ""},
    "步行+跑步距离": {"loinc": "41952-4", "unit": "km", "category": "活动", "ref_range": ""},
    "爬楼层数": {"loinc": "41961-5", "unit": "层", "category": "活动", "ref_range": ""},
    "血氧饱和度": {"loinc": "59408-5", "unit": "%", "category": "心血管", "ref_range": "95-100"},
    "SP02": {"loinc": "59408-5", "unit": "%", "category": "心血管", "ref_range": "95-100"},
    "SpO2": {"loinc": "59408-5", "unit": "%", "category": "心血管", "ref_range": "95-100"},
    "睡眠时长": {"loinc": "93832-4", "unit": "小时", "category": "睡眠", "ref_range": "7-9"},
    "深睡时长": {"loinc": "93831-6", "unit": "小时", "category": "睡眠", "ref_range": "1.5-2.5"},
    "浅睡时长": {"loinc": "93830-8", "unit": "小时", "category": "睡眠", "ref_range": "4-6"},
    "REM睡眠": {"loinc": "93829-0", "unit": "小时", "category": "睡眠", "ref_range": "1-2"},
    "体温": {"loinc": "8310-5", "unit": "℃", "category": "体征", "ref_range": "36.1-37.2"},
    "皮肤温度": {"loinc": "60955-8", "unit": "℃", "category": "体征", "ref_range": "32-35"},
    "消耗热量": {"loinc": "41981-9", "unit": "kcal", "category": "活动", "ref_range": ""},
    "距离": {"loinc": "41952-4", "unit": "m", "category": "活动", "ref_range": ""},
    "爬升": {"loinc": "41961-5", "unit": "m", "category": "活动", "ref_range": ""},
}


def get_loinc(metric_name):
    """获取指标的LOINC映射"""
    return LOINC_MAP.get(metric_name, None)


def get_loinc_code(metric_name):
    """只获取LOINC编码"""
    mapping = LOINC_MAP.get(metric_name)
    return mapping["loinc"] if mapping else None


def get_reference_range(metric_name):
    """获取参考范围"""
    mapping = LOINC_MAP.get(metric_name)
    return mapping["ref_range"] if mapping else ""


def check_abnormal(metric_name, value, ref_range=None):
    """
    检查指标是否异常
    返回: 'high', 'low', 'abnormal', 'normal', 'unknown'
    """
    if value is None:
        return 'unknown'

    mapping = LOINC_MAP.get(metric_name)
    if not mapping:
        return 'unknown'

    ref = ref_range or mapping.get("ref_range", "")
    if not ref:
        return 'unknown'

    # 解析参考范围
    try:
        val = float(value)
    except (ValueError, TypeError):
        return 'unknown'

    # 格式1: "低-高" 如 "90-120"
    if '-' in ref and '<' not in ref and '>' not in ref:
        parts = ref.split('-')
        if len(parts) == 2:
            try:
                low = float(parts[0].strip())
                high = float(parts[1].strip())
                if val < low:
                    return 'low'
                elif val > high:
                    return 'high'
                return 'normal'
            except ValueError:
                pass

    # 格式2: "<值" 如 "<5.2"
    if ref.startswith('<'):
        try:
            threshold = float(ref[1:].strip())
            if val >= threshold:
                return 'high'
            return 'normal'
        except ValueError:
            pass

    # 格式3: ">值" 如 ">50"
    if ref.startswith('>'):
        try:
            threshold = float(ref[1:].strip())
            if val < threshold:
                return 'low'
            return 'normal'
        except ValueError:
            pass

    # 格式4: 文本类如 "阴性"
    if ref in ('阴性', '阴性'):
        if isinstance(value, str):
            if '阳性' in str(value) or '+' in str(value):
                return 'abnormal'
        return 'normal'

    return 'unknown'


def add_loinc_to_metrics(metrics):
    """批量为指标列表添加LOINC编码"""
    for m in metrics:
        name = m.get('metric_name') or m.get('name', '')
        mapping = get_loinc(name)
        if mapping:
            m['loinc_code'] = mapping['loinc']
            m['loinc_category'] = mapping['category']
            m['standard_ref_range'] = mapping['ref_range']
            # 如果没有status，自动判断
            if not m.get('status'):
                m['status'] = check_abnormal(name, m.get('value_num') or m.get('value'))
        else:
            m['loinc_code'] = None
            m['loinc_category'] = m.get('category', '其他')
    return metrics
