/**
 * 变现优化分析器
 * - 检查各知识库变现状态
 * - 优化广告位/Affiliate/Pro定价
 * - 生成变现建议
 * 
 * 用法: node monetize-optimize.js
 */
const fs = require('fs');
const path = require('path');

const BASE = '/home/z/my-project';

const MONETIZATION_STATUS = {
  'genetech-tools': {
    domain: 'genetech.tools',
    channels: {
      affiliate: { status: 'active', provider: 'Thermo Fisher / Sigma-Aldrich', revenue: 'pending' },
      pro_subscription: { status: 'active', price: '$29/mo', revenue: 'pending' },
      custom_report: { status: 'active', price: '$199/report', revenue: 'pending' },
      adsense: { status: 'pending', note: '需注册Google AdSense或百度联盟' },
      baidu_union: { status: 'pending', note: '需用户注册百度联盟' }
    },
    nextSteps: [
      '注册百度联盟获取广告代码',
      '注册Google AdSense',
      '接入Stripe/支付宝Pro订阅支付',
      '联系生物试剂公司谈Affiliate佣金比例'
    ]
  },
  'tcm-tools': {
    domain: 'tcm.genetech.tools',
    channels: {
      affiliate: { status: 'planned', provider: '中药材电商/药房', revenue: 'pending' },
      pro_subscription: { status: 'active', price: '$29/mo', revenue: 'pending' },
      custom_report: { status: 'active', price: '$199/report', revenue: 'pending' },
      adsense: { status: 'pending', note: '同genetech主站' },
      tcm_consultation: { status: 'planned', note: '中医咨询线索转介' }
    },
    nextSteps: [
      '对接中药材B2B平台Affiliate',
      '联系中医馆做咨询线索合作',
      '开发方剂配伍推荐Pro功能'
    ]
  }
};

function analyze() {
  console.log('💰 变现优化分析');
  console.log('='.repeat(50));
  
  let totalActive = 0;
  let totalPending = 0;
  let totalPlanned = 0;
  
  for (const [project, status] of Object.entries(MONETIZATION_STATUS)) {
    console.log(`\n📊 ${status.domain}:`);
    for (const [channel, info] of Object.entries(status.channels)) {
      const icon = info.status === 'active' ? '✅' : info.status === 'pending' ? '⏳' : '📋';
      console.log(`  ${icon} ${channel}: ${info.status} ${info.price || ''} ${info.note || ''}`);
      if (info.status === 'active') totalActive++;
      else if (info.status === 'pending') totalPending++;
      else totalPlanned++;
    }
    console.log('  📌 Next steps:');
    status.nextSteps.forEach(s => console.log(`     - ${s}`));
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Summary: ${totalActive} active, ${totalPending} pending, ${totalPlanned} planned`);
  console.log('\n🎯 优先行动项:');
  console.log('  1. 注册百度联盟（最快变现路径）');
  console.log('  2. 接入支付系统（Stripe/支付宝）激活Pro订阅');
  console.log('  3. 联系Affiliate合作伙伴谈佣金');
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    type: 'monetization',
    summary: { active: totalActive, pending: totalPending, planned: totalPlanned },
    projects: MONETIZATION_STATUS
  };
  fs.writeFileSync(
    path.join(BASE, 'kb-workflow/reports', `monetize_${new Date().toISOString().split('T')[0]}.json`),
    JSON.stringify(report, null, 2)
  );
}

analyze();
