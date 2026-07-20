#!/usr/bin/env python3
"""上传Blueprint - 体检报告/Apple Health上传"""

import os
import uuid
import json
from datetime import datetime
from flask import Blueprint, request, jsonify, session
from security import rate_limit, log_audit
from pii_sanitizer import sanitize_report
from loinc_mapper import add_loinc_to_metrics, check_abnormal
from logging_config import logger

bp = Blueprint('upload', __name__)


def _get_db():
    from app import get_db
    return get_db()


@bp.route('/api/upload/report', methods=['POST'])
@rate_limit('upload')
def upload_report():
    """上传体检报告"""
    from app import ocr_parser, analyzer, app

    if 'file' not in request.files:
        return jsonify({"success": False, "error": "没有文件"}), 400

    file = request.files['file']
    user_id = request.form.get('user_id', session.get('user_id', 'default'))

    if not file.filename:
        return jsonify({"success": False, "error": "文件名为空"}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ('.pdf', '.jpg', '.jpeg', '.png', '.bmp'):
        return jsonify({"success": False, "error": f"不支持的格式: {ext}"}), 400

    report_id = str(uuid.uuid4())[:8]
    filename = f"{report_id}{ext}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    # OCR解析
    try:
        result = ocr_parser.parse(filepath)
        raw_text = result.get('raw_text', '')
        metrics = result.get('metrics', [])
        ai_summary = result.get('ai_summary', '')
        report_date = result.get('report_date', datetime.now().strftime('%Y-%m-%d'))
    except Exception as e:
        logger.error(f"OCR解析失败: {e}")
        return jsonify({"success": False, "error": f"解析失败: {str(e)}"}), 500

    # PII脱敏 - 存入DB的是脱敏后的文本
    raw_text, pii_found = sanitize_report(raw_text)
    if pii_found:
        logger.info(f"报告 {report_id} 脱敏: {list(pii_found.keys())}")

    # LOINC标准化
    for m in metrics:
        from loinc_mapper import get_loinc
        name = m.get('name', '')
        mapping = get_loinc(name)
        if mapping:
            m['loinc_code'] = mapping['loinc']
            m['standard_category'] = mapping['category']
            m['standard_ref_range'] = mapping['ref_range']
            # 自动判断异常状态（如果OCR没提供）
            if not m.get('status') or m.get('status') == 'normal':
                m['status'] = check_abnormal(name, m.get('value_num'))
        else:
            m['loinc_code'] = None

    # v0.6.0: OCR语义增强
    semantic_data = {}
    try:
        from ocr_semantic import OCRSemanticEnhancer
        enhancer = OCRSemanticEnhancer()
        semantic_data = enhancer.enhance(raw_text, metrics)
        logger.info(f"报告 {report_id} 语义增强: {len(semantic_data.get('risk_labels', []))}个风险标签")
    except Exception as e:
        logger.warning(f"OCR语义增强失败（非阻塞）: {e}")

    # 存入数据库
    db = _get_db()
    try:
        db.execute(
            "INSERT INTO reports (id, user_id, filename, report_date, raw_text, metrics_json, ai_summary) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (report_id, user_id, filename, report_date, raw_text, json.dumps(metrics, ensure_ascii=False), ai_summary)
        )
        for m in metrics:
            record_id = str(uuid.uuid4())[:8]
            is_abnormal = 1 if m.get('status') in ('high', 'low', 'abnormal') else 0
            db.execute(
                """INSERT INTO health_records 
                   (id, user_id, source, metric_type, metric_name, value, unit, recorded_at, 
                    metadata_json, is_abnormal, loinc_code, standard_category, standard_ref_range) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (record_id, user_id, '体检报告', m.get('category', '其他'), m.get('name', ''),
                 m.get('value_num'), m.get('unit', ''), report_date,
                 json.dumps({'reference': m.get('reference', ''), 'status': m.get('status', ''), 'report_id': report_id}, ensure_ascii=False),
                 is_abnormal, m.get('loinc_code'), m.get('standard_category'), m.get('standard_ref_range'))
            )

        # v0.6.0: 保存语义增强数据
        if semantic_data:
            semantic_id = str(uuid.uuid4())[:8]
            db.execute(
                """INSERT INTO ocr_semantic_data
                   (id, report_id, user_id, severity_tags, diagnostic_conclusions,
                    medication_suggestions, risk_labels, health_warnings, enhanced_summary)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (semantic_id, report_id, user_id,
                 json.dumps(semantic_data.get('severity_tags', {}), ensure_ascii=False),
                 json.dumps(semantic_data.get('diagnostic_conclusions', []), ensure_ascii=False),
                 json.dumps(semantic_data.get('medication_suggestions', []), ensure_ascii=False),
                 json.dumps(semantic_data.get('risk_labels', []), ensure_ascii=False),
                 json.dumps(semantic_data.get('health_warnings', []), ensure_ascii=False),
                 semantic_data.get('enhanced_summary', ''))
            )

        db.commit()
    finally:
        db.close()

    # 触发关联分析
    try:
        analyzer.trigger_analysis(user_id)
    except Exception as e:
        logger.warning(f"关联分析失败（非阻塞）: {e}")

    # v0.6.0: 触发跨源关联分析
    try:
        from cross_source_analyzer import CrossSourceAnalyzer
        cs_analyzer = CrossSourceAnalyzer()
        cs_analyzer.analyze(user_id)
    except Exception as e:
        logger.warning(f"跨源分析失败（非阻塞）: {e}")

    log_audit(user_id, 'upload_report', {'report_id': report_id, 'metrics': len(metrics)})
    logger.info(f"报告上传成功: {report_id}, 指标数: {len(metrics)}")

    return jsonify({
        "success": True,
        "report_id": report_id,
        "metrics_count": len(metrics),
        "ai_summary": ai_summary,
        "metrics": metrics[:20],
        "pii_sanitized": bool(pii_found),
        "semantic_enhancement": semantic_data if semantic_data else None,
    })


@bp.route('/api/upload/apple-health', methods=['POST'])
@rate_limit('upload')
def upload_apple_health():
    """上传Apple Health导出数据"""
    from app import apple_parser, analyzer, app

    if 'file' not in request.files:
        return jsonify({"success": False, "error": "没有文件"}), 400

    file = request.files['file']
    user_id = request.form.get('user_id', session.get('user_id', 'default'))

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ('.xml', '.zip'):
        return jsonify({"success": False, "error": "Apple Health数据需要XML或ZIP格式"}), 400

    file_id = str(uuid.uuid4())[:8]
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"apple_health_{file_id}{ext}")
    file.save(filepath)

    try:
        records = apple_parser.parse(filepath, user_id)
    except Exception as e:
        logger.error(f"Apple Health解析失败: {e}")
        return jsonify({"success": False, "error": f"解析失败: {str(e)}"}), 500

    # LOINC标准化
    from loinc_mapper import get_loinc
    db = _get_db()
    try:
        for r in records:
            metric_name = r['metric_name']
            mapping = get_loinc(metric_name)
            loinc_code = mapping['loinc'] if mapping else None
            std_category = mapping['category'] if mapping else r.get('metric_type', '其他')
            std_ref = mapping['ref_range'] if mapping else None

            db.execute(
                """INSERT INTO health_records 
                   (id, user_id, source, metric_type, metric_name, value, unit, recorded_at, 
                    metadata_json, loinc_code, standard_category, standard_ref_range) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (str(uuid.uuid4())[:8], user_id, 'Apple Health', r['metric_type'], r['metric_name'],
                 r['value'], r['unit'], r['recorded_at'], json.dumps(r.get('metadata', {}), ensure_ascii=False),
                 loinc_code, std_category, std_ref)
            )
        db.commit()
    finally:
        db.close()

    try:
        analyzer.trigger_analysis(user_id)
    except:
        pass

    log_audit(user_id, 'upload_apple_health', {'records': len(records)})
    logger.info(f"Apple Health上传: {len(records)} 条记录")

    return jsonify({
        "success": True,
        "records_count": len(records),
        "metric_types": list(set(r['metric_type'] for r in records))
    })
