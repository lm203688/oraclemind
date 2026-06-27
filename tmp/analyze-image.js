const SDK = require('z-ai-web-dev-sdk').default;
const fs = require('fs');

async function main() {
  const client = await SDK.create();
  
  const imageBuffer = fs.readFileSync('/home/z/my-project/upload/6a3d2439f1bf8806d26f8318_feishu-ws-cb-img_v3_02130_5e2b7ee9-1726-49de-9e3c-fbc212ff8e5g.jpeg');
  const base64Image = imageBuffer.toString('base64');
  
  const response = await client.chat.completions.create({
    model: 'glm-4v',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: '请详细描述这张图片的内容，包括所有文字、数据、UI元素。这是用户发来的截图，我需要理解他想表达什么。' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      }
    ],
    max_tokens: 2000,
    temperature: 0.3
  });
  
  console.log(response.choices[0].message.content);
}

main().catch(e => { console.error(e); process.exit(1); });
