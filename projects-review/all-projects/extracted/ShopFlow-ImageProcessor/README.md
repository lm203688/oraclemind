# 🛍️ ShopFlow — 电商产品图像批处理自动化

> 品牌：ShopFlow | 处理规模：20+ 产品图 | 输出规范：800×800 / 200×200 / WebP / 水印

---

## 一、处理规范

| 规格 | 参数 | 用途 |
|------|------|------|
| 主图 | 800×800 px, WebP, 质量90 | 商品详情页 |
| 缩略图 | 200×200 px, WebP, 质量85 | 列表页/搜索结果 |
| 水印 | 右下角, 品牌Logo, 透明度30% | 品牌保护 |

## 二、4-Agent 编排架构

```
Input: 原始产品图(任意尺寸/格式)
        │
┌───────▼────────┐
│  Planning Agent│  分析图片属性、规划处理参数
│  (gemma4:26b)  │  判断是否需要裁剪/调色
└───────┬────────┘
        │
┌───────▼────────┐
│ Processing     │  裁剪 → 缩放 → 格式转换 → 水印
│ Agent          │  PIL/Pillow 自动化
│ (原生函数)     │
└───────┬────────┘
        │
┌───────▼────────┐
│ Quality        │  尺寸检查 / WebP大小 / 水印位置
│ Inspection     │  锐度评估 / 色差检测
│ Agent          │
└───────┬────────┘
        │
┌───────▼────────┐
│ Summary Agent  │  生成HTML前后对比报告
│                │  处理统计 / 通过率 / 异常列表
└────────────────┘
```

## 三、输出目录结构

```
output/
├── report.html              # 前后对比可视化报告
├── images/
│   ├── product-001_main.webp    # 800×800
│   ├── product-001_thumb.webp   # 200×200
│   ├── product-002_main.webp
│   └── ...
└── manifest.json            # 处理清单（文件名、尺寸、MD5）
```

## 四、关键实现

```python
from PIL import Image, ImageDraw, ImageFont

def process_image(input_path: str, output_dir: str, product_id: str):
    """单张图片处理流水线"""
    img = Image.open(input_path)

    # 1. 正方形裁剪（中心裁剪）
    size = min(img.size)
    img = crop_center(img, size, size)

    # 2. 主图：800×800 + WebP
    main = img.resize((800, 800), Image.LANCZOS)
    main = add_watermark(main)
    main.save(f"{output_dir}/{product_id}_main.webp", "WEBP", quality=90)

    # 3. 缩略图：200×200 + WebP
    thumb = img.resize((200, 200), Image.LANCZOS)
    thumb.save(f"{output_dir}/{product_id}_thumb.webp", "WEBP", quality=85)

def add_watermark(img: Image, watermark_path="brand-logo.png"):
    """右下角添加品牌水印，30%透明度"""
    # 实现略
    pass
```

## 五、状态

| 指标 | 状态 |
|------|------|
| 工作流设计 | ✅ 完成 |
| 原图目录 | 待用户提供（20+张） |
| 实际批量处理 | 🔲 待执行 |
| HTML报告 | 🔲 待生成 |
