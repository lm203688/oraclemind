import json
TOOLS = [
    {'name':'z-ai-web-dev-sdk','url':'https://github.com/zai-org/z-ai-web-dev-sdk','category':'AI能力','description':'智谱AI SDK','value_tag':'推荐','security_score':85},
    {'name':'Scrapling','url':'https://github.com/D4Vinci/Scrapling','category':'数据采集','description':'自适应爬虫','value_tag':'推荐','security_score':80},
    {'name':'cloudflared','url':'https://github.com/cloudflare/cloudflared','category':'网络','description':'CF Tunnel','value_tag':'推荐','security_score':90},
    {'name':'wrangler','url':'https://github.com/cloudflare/workers-sdk','category':'DevOps','description':'CF Pages部署','value_tag':'推荐','security_score':95},
    {'name':'reportlab','url':'https://github.com/Distrotech/reportlab','category':'文档','description':'PDF生成','value_tag':'可用','security_score':85},
    {'name':'tesseract','url':'https://github.com/tesseract-ocr/tesseract','category':'AI能力','description':'OCR识别','value_tag':'可用','security_score':80},
    {'name':'ffmpeg','url':'https://github.com/FFmpeg/FFmpeg','category':'媒体','description':'音视频处理','value_tag':'推荐','security_score':90},
    {'name':'bark','url':'https://github.com/Finb/Bark','category':'通知','description':'iOS推送','value_tag':'推荐','security_score':85},
    {'name':'RDKit','url':'https://github.com/rdkit/rdkit','category':'科学计算','description':'化学信息学','value_tag':'推荐','security_score':90},
    {'name':'IndexNow','url':'https://github.com/indexnow/indexnow','category':'SEO','description':'搜索引擎索引','value_tag':'可用','security_score':85},
    {'name':'Creem','url':'https://creem.io','category':'支付','description':'海外支付','value_tag':'可用','security_score':75},
    {'name':'social-auto-upload','url':'https://github.com/dreammis/social-auto-upload','category':'社交媒体','description':'国内社交自动发布','value_tag':'可用','security_score':70},
]
f='/home/z/my-project/aishield/aishield/data/tools.json'
data=json.load(open(f))
added=0
for t in TOOLS:
    if t['url'] not in data:
        data[t['url']]=t
        added+=1
json.dump(data,open(f,'w'),ensure_ascii=False,indent=2)
print(f'新增{added}个,总计{len(data)}个')
