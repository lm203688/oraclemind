#!/usr/bin/env python3
"""
FHIR R4 导出模块
将HealthLens健康数据导出为HL7 FHIR R4格式
规范：https://hl7.org/fhir/R4/
"""

import json
import uuid
from datetime import datetime


FHIR_VERSION = "4.0.1"
FHIR_PROFILE_BASE = "http://hl7.org/fhir/StructureDefinition"


def _make_reference(resource_type, resource_id):
    """创建FHIR Reference"""
    return f"{resource_type}/{resource_id}"


def _make_codeable_concept(text, system=None, code=None):
    """创建FHIR CodeableConcept"""
    cc = {"text": text}
    if system and code:
        cc["coding"] = [{"system": system, "code": code, "display": text}]
    return cc


def _make_quantity(value, unit, system=None, code=None):
    """创建FHIR Quantity"""
    q = {"value": float(value) if value else 0}
    if unit:
        q["unit"] = unit
    if system and code:
        q["system"] = system
        q["code"] = code
    return q


def _make_period(start_date, end_date=None):
    """创建FHIR Period"""
    period = {"start": start_date}
    if end_date:
        period["end"] = end_date
    return period


def export_patient(user_record):
    """导出Patient资源"""
    patient = {
        "resourceType": "Patient",
        "id": user_record.get("id", str(uuid.uuid4())[:8]),
        "meta": {
            "profile": [f"{FHIR_PROFILE_BASE}/Patient"],
            "lastUpdated": datetime.now().replace(microsecond=0).isoformat() + "Z"
        },
        "text": {
            "status": "generated",
            "div": f'<div xmlns="http://www.w3.org/1999/xhtml">Patient: {user_record.get("nickname", "")}</div>'
        }
    }
    
    if user_record.get("phone"):
        patient["telecom"] = [{
            "system": "phone",
            "value": user_record["phone"],
            "use": "mobile"
        }]
    
    return patient


def export_observation(record, loinc_mapping=None):
    """
    将健康记录导出为FHIR Observation资源
    
    Args:
        record: health_records行 (dict)
        loinc_mapping: LOINC映射信息 (dict with loinc, unit, category)
    """
    obs_id = record.get("id", str(uuid.uuid4())[:8])
    
    observation = {
        "resourceType": "Observation",
        "id": obs_id,
        "meta": {
            "profile": [f"{FHIR_PROFILE_BASE}/Observation"],
            "lastUpdated": datetime.now().replace(microsecond=0).isoformat() + "Z"
        },
        "status": "final",
        "category": [{
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                "code": "vital-signs",
                "display": "Vital Signs"
            }]
        }],
        "code": _make_codeable_concept(
            record.get("metric_name", "Unknown"),
            system="http://loinc.org",
            code=loinc_mapping["loinc"] if loinc_mapping else None
        ),
        "subject": {
            "reference": _make_reference("Patient", record.get("user_id", ""))
        },
        "effectiveDateTime": _to_fhir_datetime(record.get("recorded_at")),
        "issued": datetime.now().replace(microsecond=0).isoformat() + "Z",
        "source": {
            "display": record.get("source", "HealthLens")
        }
    }
    
    # 添加值
    value = record.get("value")
    unit = record.get("unit", "")
    if value is not None:
        if loinc_mapping:
            observation["valueQuantity"] = _make_quantity(
                value, unit or loinc_mapping.get("unit", ""),
                system="http://unitsofmeasure.org",
                code=loinc_mapping.get("loinc")
            )
        else:
            observation["valueQuantity"] = _make_quantity(value, unit)
    
    # 添加参考范围
    if loinc_mapping and loinc_mapping.get("ref_range"):
        ref_range = _parse_ref_range(loinc_mapping["ref_range"])
        if ref_range:
            observation["referenceRange"] = [ref_range]
    
    # 添加异常标记
    metadata = {}
    if record.get("metadata_json"):
        try:
            metadata = json.loads(record["metadata_json"])
        except (json.JSONDecodeError, TypeError):
            pass
    
    status = metadata.get("status", "")
    if status in ("high", "low", "abnormal"):
        observation["interpretation"] = [{
            "coding": [{
                "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                "code": "H" if status == "high" else "L" if status == "low" else "A",
                "display": "High" if status == "high" else "Low" if status == "low" else "Abnormal"
            }]
        }]
    
    return observation


def export_bundle(user_record, records, insights=None, loinc_map=None):
    """
    导出完整的FHIR Bundle
    
    Args:
        user_record: 用户信息 (dict)
        records: 健康记录列表
        insights: 洞察列表 (可选)
        loinc_map: LOINC映射字典 (name -> mapping)
    
    Returns:
        FHIR Bundle (dict)
    """
    from loinc_mapper import get_loinc
    
    bundle = {
        "resourceType": "Bundle",
        "id": str(uuid.uuid4()),
        "meta": {
            "lastUpdated": datetime.now().replace(microsecond=0).isoformat() + "Z"
        },
        "type": "collection",
        "total": 0,
        "entry": []
    }
    
    # 1. Patient资源
    patient = export_patient(user_record)
    bundle["entry"].append({"resource": patient})
    bundle["total"] += 1
    
    # 2. Observation资源
    for record in records:
        record_dict = dict(record) if not isinstance(record, dict) else record
        metric_name = record_dict.get("metric_name", "")
        loinc_mapping = loinc_map.get(metric_name) if loinc_map else get_loinc(metric_name)
        
        obs = export_observation(record_dict, loinc_mapping)
        bundle["entry"].append({"resource": obs})
        bundle["total"] += 1
    
    # 3. 将洞察导出为ClinicalImpression资源
    if insights:
        for insight in insights:
            impression = export_clinical_impression(insight, user_record.get("id"))
            bundle["entry"].append({"resource": impression})
            bundle["total"] += 1
    
    return bundle


def export_clinical_impression(insight, patient_id):
    """将洞察导出为FHIR ClinicalImpression"""
    imp_id = insight.get("id", str(uuid.uuid4())[:8])
    
    return {
        "resourceType": "ClinicalImpression",
        "id": imp_id,
        "meta": {
            "profile": [f"{FHIR_PROFILE_BASE}/clinicalimpression"]
        },
        "status": "completed",
        "subject": {
            "reference": _make_reference("Patient", patient_id)
        },
        "summary": insight.get("title", ""),
        "note": [{
            "text": insight.get("content", "")
        }],
        "extension": [{
            "url": "http://healthlens.ai/fhir/StructureDefinition/severity",
            "valueString": insight.get("severity", "info")
        }]
    }


def _to_fhir_datetime(date_str):
    """将日期字符串转为FHIR格式"""
    if not date_str:
        return datetime.now().replace(microsecond=0).isoformat() + "Z"
    # 如果已经是ISO格式
    if 'T' in date_str:
        return date_str if date_str.endswith('Z') else date_str + "Z"
    # YYYY-MM-DD 格式
    return f"{date_str}T00:00:00Z"


def _parse_ref_range(ref_str):
    """解析参考范围字符串为FHIR ReferenceRange"""
    if not ref_str:
        return None
    
    ref_range = {}
    
    # "低-高" 格式
    if '-' in ref_str and '<' not in ref_str and '>' not in ref_str:
        parts = ref_str.split('-')
        if len(parts) == 2:
            try:
                low = float(parts[0].strip())
                high = float(parts[1].strip())
                ref_range["low"] = {"value": low}
                ref_range["high"] = {"value": high}
            except ValueError:
                ref_range["text"] = ref_str
        else:
            ref_range["text"] = ref_str
    elif '<' in ref_str:
        try:
            val = float(ref_str.replace('<', '').strip())
            ref_range["high"] = {"value": val}
        except ValueError:
            ref_range["text"] = ref_str
    elif '>' in ref_str:
        try:
            val = float(ref_str.replace('>', '').strip())
            ref_range["low"] = {"value": val}
        except ValueError:
            ref_range["text"] = ref_str
    else:
        ref_range["text"] = ref_str
    
    return ref_range if ref_range else None
