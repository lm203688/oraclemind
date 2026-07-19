import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * 生成可打印的推演报告 HTML 页面
 * 用户通过浏览器打印功能保存为 PDF
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatMarkdown(text: string): string {
  // 简单 markdown 转 HTML
  let html = escapeHtml(text);

  // 表格（简易处理）
  html = html.replace(/^\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)*)/gm, (_, header, rows) => {
    const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean);
    const rowLines = rows.trim().split('\n');
    let table = '<table><thead><tr>';
    headers.forEach((h: string) => { table += `<th>${h}</th>`; });
    table += '</tr></thead><tbody>';
    rowLines.forEach((row: string) => {
      const cells = row.split('|').map((c: string) => c.trim()).filter(Boolean);
      if (cells.length > 0) {
        table += '<tr>';
        cells.forEach((c: string) => { table += `<td>${c}</td>`; });
        table += '</tr>';
      }
    });
    table += '</tbody></table>';
    return table;
  });

  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // 粗体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // 列表
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.+<\/li>\n?)+/g, '<ul>$&</ul>');

  // 代码块
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    return '<pre><code>' + match.replace(/```\w*\n?/g, '').replace(/```/g, '') + '</code></pre>';
  });

  // 行内代码
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // 引用
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // 分隔线
  html = html.replace(/^---$/gm, '<hr/>');

  // 段落（连续非标签行）
  html = html.replace(/^(?!<[a-z/])(.+)$/gm, '<p>$1</p>');

  return html;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  const simulation = await db.simulation.findUnique({
    where: { id },
    include: {
      scenarioOutcomes: true,
      agentTraces: { orderBy: { round: 'asc' } },
      feedbacks: true,
      user: true,
    },
  });

  if (!simulation) {
    return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
  }

  let seedInput: any = {};
  try { seedInput = JSON.parse(simulation.seedInput); } catch {}

  const question = seedInput.question ?? seedInput.eventDescription ?? '未知问题';
  const context = seedInput.personalContext ?? seedInput.eventContext ?? '';
  const isPersonal = simulation.type === 'personal';

  // 解析交叉验证矩阵
  let crossValidation: any = null;
  if (simulation.scenarioOutcomes[0]?.crossValidationResult) {
    try { crossValidation = JSON.parse(simulation.scenarioOutcomes[0].crossValidationResult); } catch {}
  }

  // 按轮次和类别分组 agent traces
  const tracesByRound = new Map<number, any[]>();
  for (const trace of simulation.agentTraces) {
    if (!tracesByRound.has(trace.round)) tracesByRound.set(trace.round, []);
    tracesByRound.get(trace.round)!.push(trace);
  }

  const quadrantLabels: Record<string, string> = {
    high_confidence_proceed: '高置信推进（现代+古典双看好）',
    risk_flagged: '风险标注（现代看好但古典警示）',
    timing_issue: '时机未到（古典看好但现代阻力大）',
    strong_avoid: '强烈避免（现代+古典双看衰）',
    insufficient_info: '信息不足（视角分裂）',
  };

  const scenarioLabels: Record<string, string> = {
    optimistic: '乐观情景',
    neutral: '中性情景',
    conservative: '保守情景',
  };

  const modernAgentNames: Record<string, string> = {
    strategist: '策略师', data_analyst: '数据分析师', risk_auditor: '风险审慎者',
    optimist: '乐观主义者', devil_advocate: '魔鬼代言人',
  };

  const classicalNames: Record<string, string> = {
    yuanhai: '渊海子平', ziping: '子平真诠', sanming: '三命通会',
    ditianzhui: '滴天髓', qiongtong: '穷通宝鉴',
  };

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OracleMind 推演报告 - ${escapeHtml(question.slice(0, 30))}</title>
<style>
  @page { size: A4; margin: 2cm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif;
    color: #1a1a2e; line-height: 1.6; background: #fff; padding: 40px;
    font-size: 14px;
  }
  .header {
    border-bottom: 2px solid #0d7377; padding-bottom: 16px; margin-bottom: 24px;
    display: flex; justify-content: space-between; align-items: center;
  }
  .logo { font-size: 18px; font-weight: bold; color: #0d7377; letter-spacing: 2px; }
  .meta { font-size: 12px; color: #666; }
  .badge {
    display: inline-block; padding: 2px 10px; border-radius: 4px;
    font-size: 11px; font-weight: bold; margin-right: 8px;
  }
  .badge-personal { background: #e6f7f8; color: #0d7377; border: 1px solid #0d7377; }
  .badge-event { background: #fdf5e6; color: #8b4513; border: 1px solid #8b4513; }
  .section { margin-bottom: 28px; page-break-inside: avoid; }
  .section-title {
    font-size: 16px; font-weight: bold; color: #0d7377;
    border-left: 4px solid #0d7377; padding-left: 10px; margin-bottom: 12px;
  }
  .question-box {
    background: #f8f9fa; border-left: 4px solid #0d7377;
    padding: 16px; margin-bottom: 8px; border-radius: 0 4px 4px 0;
  }
  .question-box p { font-size: 15px; font-weight: 500; }
  .context { font-size: 13px; color: #555; margin-top: 8px; }
  .recommendation-box {
    background: linear-gradient(135deg, #e6f7f8 0%, #f0fdfd 100%);
    border: 1px solid #0d7377; padding: 16px; border-radius: 6px; margin-bottom: 12px;
  }
  .quadrant {
    display: inline-block; padding: 4px 12px; border-radius: 4px;
    font-size: 12px; font-weight: bold; margin-bottom: 8px;
  }
  .quadrant.high_confidence_proceed { background: #d4edda; color: #155724; }
  .quadrant.risk_flagged { background: #fff3cd; color: #856404; }
  .quadrant.timing_issue { background: #ffe6cc; color: #8b4513; }
  .quadrant.strong_avoid { background: #f8d7da; color: #721c24; }
  .quadrant.insufficient_info { background: #e2e3e5; color: #383d41; }
  .scenario-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .scenario-card {
    border: 1px solid #ddd; border-radius: 6px; padding: 12px;
  }
  .scenario-card.optimistic { border-color: #28a745; background: #f8fff9; }
  .scenario-card.neutral { border-color: #0d7377; background: #f0fdfd; }
  .scenario-card.conservative { border-color: #dc3545; background: #fff8f8; }
  .scenario-header { font-weight: bold; margin-bottom: 6px; font-size: 14px; }
  .scenario-card.optimistic .scenario-header { color: #28a745; }
  .scenario-card.neutral .scenario-header { color: #0d7377; }
  .scenario-card.conservative .scenario-header { color: #dc3545; }
  .scenario-prob { font-size: 20px; font-weight: bold; }
  .scenario-desc { font-size: 11px; color: #555; margin-top: 6px; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: center; }
  th { background: #0d7377; color: #fff; font-weight: bold; }
  .matrix-cell.positive { background: #d4edda; color: #155724; }
  .matrix-cell.negative { background: #f8d7da; color: #721c24; }
  .matrix-cell.neutral { background: #f8f9fa; color: #383d41; }
  .round-block { margin-bottom: 16px; page-break-inside: avoid; }
  .round-title { font-size: 13px; font-weight: bold; color: #0d7377; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  .agent-block { margin-bottom: 12px; padding: 10px; background: #fafafa; border-radius: 4px; }
  .agent-name { font-weight: bold; font-size: 12px; margin-bottom: 4px; }
  .agent-name.modern { color: #0d7377; }
  .agent-name.classical { color: #8b4513; }
  .agent-content { font-size: 11px; color: #333; line-height: 1.6; white-space: pre-wrap; }
  .agent-content h1, .agent-content h2, .agent-content h3 { margin: 8px 0 4px; }
  .agent-content h1 { font-size: 14px; }
  .agent-content h2 { font-size: 13px; }
  .agent-content h3 { font-size: 12px; }
  .agent-content table { margin: 8px 0; }
  .agent-content ul, .agent-content ol { margin-left: 20px; margin-bottom: 8px; }
  .agent-content blockquote { border-left: 3px solid #0d7377; padding-left: 10px; color: #666; font-style: italic; margin: 8px 0; }
  .agent-content code { background: #f0f0f0; padding: 1px 4px; border-radius: 2px; font-size: 10px; }
  .agent-content pre { background: #f5f5f5; padding: 8px; border-radius: 4px; overflow-x: auto; }
  .footer {
    margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd;
    font-size: 11px; color: #999; text-align: center;
  }
  .classical-summary {
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 12px;
  }
  .classical-card { border: 1px solid #8b4513; background: #fffbf5; padding: 8px; border-radius: 4px; text-align: center; }
  .classical-card-name { font-size: 11px; font-weight: bold; color: #8b4513; margin-bottom: 4px; }
  .classical-card-score { font-size: 16px; font-weight: bold; }
  .classical-card-judgment { font-size: 9px; color: #666; margin-top: 4px; line-height: 1.3; }
  .print-btn {
    position: fixed; top: 20px; right: 20px; padding: 10px 20px;
    background: #0d7377; color: #fff; border: none; border-radius: 6px;
    cursor: pointer; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }
  .print-btn:hover { background: #0a5d61; }
  @media print { .print-btn { display: none; } body { padding: 0; } }
</style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ 打印 / 保存PDF</button>

  <div class="header">
    <div>
      <div class="logo">OracleMind · 推演报告</div>
      <div class="meta" style="margin-top:4px;">
        <span class="badge ${isPersonal ? 'badge-personal' : 'badge-event'}">
          ${isPersonal ? '个人推演' : '事件推演'}
        </span>
        ${simulation.rounds}轮 · ${simulation.agentTraces.length}条Agent轨迹
      </div>
    </div>
    <div class="meta">
      ${new Date(simulation.createdAt).toLocaleString('zh-CN')}
    </div>
  </div>

  <!-- 问题 -->
  <div class="section">
    <div class="section-title">推演问题</div>
    <div class="question-box">
      <p>${escapeHtml(question)}</p>
      ${context ? `<div class="context">背景：${escapeHtml(context)}</div>` : ''}
    </div>
    ${simulation.graphSnapshot ? `<div class="context" style="margin-top:8px;">图谱分析：${escapeHtml(simulation.graphSnapshot)}</div>` : ''}
  </div>

  <!-- 综合建议 -->
  ${simulation.scenarioOutcomes[0]?.recommendation ? `
  <div class="section">
    <div class="section-title">综合建议</div>
    <div class="recommendation-box">
      ${crossValidation ? `<div class="quadrant ${crossValidation.quadrant}">${quadrantLabels[crossValidation.quadrant] || crossValidation.quadrant}</div>` : ''}
      <p style="margin-top:8px;">${escapeHtml(simulation.scenarioOutcomes[0].recommendation)}</p>
    </div>
  </div>
  ` : ''}

  <!-- 交叉验证矩阵 -->
  ${crossValidation ? `
  <div class="section">
    <div class="section-title">5×5 交叉验证矩阵（现代Agent × 古籍）</div>
    <p style="font-size:12px;color:#666;margin-bottom:8px;">
      现代共识分：${crossValidation.modernConsensus.toFixed(2)} · 古典共识分：${crossValidation.classicalConsensus.toFixed(2)}
    </p>
    <table>
      <thead>
        <tr>
          <th>现代＼古典</th>
          <th>渊海子平</th><th>子平真诠</th><th>三命通会</th><th>滴天髓</th><th>穷通宝鉴</th>
        </tr>
      </thead>
      <tbody>
        ${['strategist','data_analyst','risk_auditor','optimist','devil_advocate'].map(role => `
          <tr>
            <td style="font-weight:bold;background:#e6f7f8;">${modernAgentNames[role]}</td>
            ${['yuanhai','ziping','sanming','ditianzhui','qiongtong'].map(book => {
              const score = crossValidation.matrix?.[role]?.[book] ?? 0;
              const cls = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral';
              return `<td class="matrix-cell ${cls}">${score > 0 ? '+' : ''}${score.toFixed(2)}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- 三情景 -->
  ${simulation.scenarioOutcomes.length > 0 ? `
  <div class="section">
    <div class="section-title">三情景路径</div>
    <div class="scenario-grid">
      ${simulation.scenarioOutcomes.map(so => `
        <div class="scenario-card ${so.scenarioPath}">
          <div class="scenario-header">${scenarioLabels[so.scenarioPath] || so.scenarioPath}</div>
          <div class="scenario-prob">${Math.round(so.probability * 100)}%</div>
          <div class="scenario-desc">${escapeHtml(so.description.slice(0, 300))}${so.description.length > 300 ? '...' : ''}</div>
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  <!-- Agent 推演轨迹 -->
  <div class="section">
    <div class="section-title">Agent 推演轨迹（共${simulation.agentTraces.length}条）</div>
    ${Array.from(tracesByRound.entries()).map(([round, traces]) => `
      <div class="round-block">
        <div class="round-title">第 ${round} 轮</div>
        ${traces.map(trace => `
          <div class="agent-block">
            <div class="agent-name ${trace.agentCategory}">
              ${trace.agentCategory === 'classical' ? '📖 ' : '⚙️ '}
              ${trace.agentCategory === 'classical' ? (classicalNames[trace.agentRole] || trace.agentRole) : (modernAgentNames[trace.agentRole] || trace.agentRole)}
            </div>
            <div class="agent-content">${formatMarkdown(trace.content)}</div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>

  <!-- 验证状态 -->
  ${simulation.feedbacks.length > 0 ? `
  <div class="section">
    <div class="section-title">验证反馈</div>
    <p>用户验证结果：
      <strong>${simulation.feedbacks[0].result === 'confirmed' ? '✓ 准确' : simulation.feedbacks[0].result === 'partial' ? '◯ 部分准确' : '✗ 不准'}</strong>
    </p>
    ${simulation.feedbacks[0].comment ? `<p style="margin-top:8px;color:#555;">${escapeHtml(simulation.feedbacks[0].comment)}</p>` : ''}
  </div>
  ` : ''}

  <div class="footer">
    OracleMind · AI 个人生活推演引擎 · 5现代Agent + 5本古籍交叉验证<br/>
    报告生成时间：${new Date().toLocaleString('zh-CN')} · 本报告由AI生成，仅供参考
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
