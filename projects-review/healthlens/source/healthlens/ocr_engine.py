#!/usr/bin/env python3
"""
体检报告OCR解析引擎
支持PDF/图片 → OCR提取 → AI结构化
"""

import os
import re
import json
import base64
from urllib.request import Request, urlopen
from urllib.error import URLError


class MedicalReportParser:
    def __init__(self, bit_assistant_url="http://150.158.119.19:8431"):
        self.bit_assistant_url = bit_assistant_url
    
    def parse(self, filepath):
        """解析体检报告文件"""
        ext = os.path.splitext(filepath)[1].lower()
        
        # Step 1: 提取文本
        if ext == '.pdf':
            raw_text = self._extract_pdf(filepath)
        elif ext in ('.jpg', '.jpeg', '.png', '.bmp'):
            raw_text = self._extract_image(filepath)
        else:
            raise ValueError(f"不支持的文件格式: {ext}")
        
        # Step 2: AI结构化
        metrics = self._ai_structure(raw_text)
        
        # Step 3: AI总结
        ai_summary = self._ai_summarize(metrics)
        
        # Step 4: 提取报告日期
        report_date = self._extract_date(raw_text)
        
        return {
            'raw_text': raw_text,
            'metrics': metrics,
            'ai_summary': ai_summary,
            'report_date': report_date
        }
    
    def _extract_pdf(self, filepath):
        """从PDF提取文本"""
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(filepath)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            if text.strip():
                return text
        except ImportError:
            pass
        
        # Fallback: 用pdfminer
        try:
            from pdfminer.high_level import extract_text
            text = extract_text(filepath)
            if text.strip():
                return text
        except ImportError:
            pass
        
        # Final fallback: 用AI直接读图片
        return self._pdf_to_images_then_ocr(filepath)
    
    def _pdf_to_images_then_ocr(self, filepath):
        """PDF转图片后OCR"""
        try:
            import fitz
            doc = fitz.open(filepath)
            texts = []
            for page_num in range(len(doc)):
                page = doc[page_num]
                pix = page.get_pixmap(dpi=200)
                img_path = filepath.replace('.pdf', f'_page{page_num}.png')
                pix.save(img_path)
                texts.append(self._extract_image(img_path))
                os.remove(img_path)
            doc.close()
            return '\n'.join(texts)
        except Exception as e:
            raise RuntimeError(f"PDF解析失败，请安装PyMuPDF: pip install PyMuPDF. 错误: {e}")
    
    def _extract_image(self, filepath):
        """从图片提取文本 - 优先用AI视觉模型"""
        # 尝试PaddleOCR
        try:
            return self._paddle_ocr(filepath)
        except:
            pass
        
        # 尝试Tesseract
        try:
            return self._tesseract_ocr(filepath)
        except:
            pass
        
        # Fallback: 用比特助手AI解读
        return self._ai_vision_ocr(filepath)
    
    def _paddle_ocr(self, filepath):
        """PaddleOCR提取"""
        from paddleocr import PaddleOCR
        ocr = PaddleOCR(use_angle_cls=True, lang='ch')
        result = ocr.ocr(filepath, cls=True)
        texts = []
        for line in result[0]:
            texts.append(line[1][0])
        return '\n'.join(texts)
    
    def _tesseract_ocr(self, filepath):
        """Tesseract OCR提取"""
        import pytesseract
        from PIL import Image
        img = Image.open(filepath)
        text = pytesseract.image_to_string(img, lang='chi_sim+eng')
        return text
    
    def _ai_vision_ocr(self, filepath):
        """用AI视觉模型做OCR（fallback）"""
        with open(filepath, 'rb') as f:
            img_b64 = base64.b64encode(f.read()).decode()
        
        prompt = """请识别这张体检报告图片中的所有文字内容，按原始格式输出。特别注意：
1. 每个检查项目的名称、结果、单位、参考范围
2. 异常标记（↑↓或H/L）
3. 报告日期和体检机构名称
只输出识别到的文字，不要添加任何解释。"""
        
        # 通过比特助手的OpenAI兼容接口调用
        data = json.dumps({
            "model": "bit-assistant",
            "messages": [
                {"role": "user", "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}}
                ]}
            ]
        }).encode()
        
        req = Request(
            f"{self.bit_assistant_url}/v1/chat/completions",
            data=data,
            headers={"Content-Type": "application/json"}
        )
        with urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
            return result['choices'][0]['message']['content']
    
    def _ai_structure(self, raw_text):
        """用AI将原始文本结构化为指标列表"""
        prompt = f"""请将以下体检报告文本解析为结构化JSON数组。每个指标包含：
- name: 指标名称
- value: 原始值（字符串）
- value_num: 数值（浮点数，无法解析则为null）
- unit: 单位
- reference: 参考范围
- status: 状态（normal/high/low/abnormal）
- category: 分类（血常规/肝功能/肾功能/血脂/血糖/甲状腺/肿瘤标志物/尿常规/心电图/其他）

报告文本：
{raw_text[:8000]}

只输出JSON数组，不要其他内容。示例：
[{{"name":"空腹血糖","value":"6.2","value_num":6.2,"unit":"mmol/L","reference":"3.9-6.1","status":"high","category":"血糖"}}]"""

        data = json.dumps({
            "message": prompt,
            "session_id": "ocr_structure"
        }).encode()
        
        req = Request(
            f"{self.bit_assistant_url}/chat",
            data=data,
            headers={"Content-Type": "application/json"}
        )
        
        try:
            with urlopen(req, timeout=60) as resp:
                result = json.loads(resp.read())
                content = result.get('content', '[]')
                # 提取JSON
                json_match = re.search(r'\[.*\]', content, re.DOTALL)
                if json_match:
                    return json.loads(json_match.group())
        except Exception as e:
            print(f"AI结构化失败: {e}")
        
        # Fallback: 简单正则提取
        return self._regex_extract(raw_text)
    
    def _regex_extract(self, text):
        """正则提取指标（fallback）"""
        metrics = []
        # 匹配：指标名  数值  单位  参考范围
        pattern = r'([\u4e00-\u9fa5\w]+)\s+([\d.]+)\s*([^\d\s↑↓]*)\s*([\d.\-~]+)\s*[\d.\-~]*'
        for match in re.finditer(pattern, text):
            name, value, unit, ref = match.groups()
            try:
                value_num = float(value)
            except:
                value_num = None
            metrics.append({
                'name': name.strip(),
                'value': value,
                'value_num': value_num,
                'unit': unit.strip(),
                'reference': ref.strip(),
                'status': 'normal',
                'category': '其他'
            })
        return metrics
    
    def _ai_summarize(self, metrics):
        """AI生成报告摘要"""
        if not metrics:
            return "未检测到有效指标"
        
        abnormal = [m for m in metrics if m.get('status') != 'normal']
        if not abnormal:
            return f"体检报告共{len(metrics)}项指标，均在正常范围内。"
        
        abnormal_names = ', '.join(m['name'] for m in abnormal)
        prompt = f"""以下是体检报告中的异常指标：
{json.dumps(abnormal, ensure_ascii=False, indent=2)}

请用简洁的中文总结这些异常指标的可能含义和注意事项，200字以内。不要做诊断，只做健康提示。"""
        
        data = json.dumps({"message": prompt, "session_id": "ocr_summary"}).encode()
        req = Request(
            f"{self.bit_assistant_url}/chat",
            data=data,
            headers={"Content-Type": "application/json"}
        )
        
        try:
            with urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read())
                return result.get('content', f"发现{len(abnormal)}项异常指标：{abnormal_names}")
        except:
            return f"发现{len(abnormal)}项异常指标：{abnormal_names}"
    
    def _extract_date(self, text):
        """提取报告日期"""
        patterns = [
            r'(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日',
            r'(\d{4})-(\d{1,2})-(\d{1,2})',
            r'(\d{4})/(\d{1,2})/(\d{1,2})',
        ]
        for p in patterns:
            match = re.search(p, text)
            if match:
                return f"{match.group(1)}-{match.group(2).zfill(2)}-{match.group(3).zfill(2)}"
        return datetime.now().strftime('%Y-%m-%d')
