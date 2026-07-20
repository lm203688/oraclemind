// ==========================================
// RoboParts - 自动化营销引擎 v1.0
// 功能: 邮件捕获 | 联盟佣金优化 | 社交分发 | 退出弹窗 | 程序化SEO
// ==========================================

const RoboMarketing = (() => {
  // ========== 配置 ==========
  const CONFIG = {
    // 邮件捕获 - 替换为你的 Supabase Edge Function URL
    emailCaptureEndpoint: '/api/v1/marketing/email-capture',
    // STL下载邮件门控: true=下载前要求输入邮箱
    emailGateEnabled: true,
    // 退出意图弹窗
    exitIntentEnabled: true,
    exitIntentDelay: 30000, // 30秒后触发
    // 联盟点击追踪
    affiliateTrackEnabled: true,
    // 社交分享奖励
    shareReward: 5, // 每次分享奖励积分
    // Cookie 过期天数
    cookieDays: 30,
  };

  // ========== 状态 ==========
  let capturedEmail = localStorage.getItem('rbp_email') || '';
  let exitIntentShown = false;
  let pageEnterTime = Date.now();

  // ========== 邮件捕获 ==========

  /**
   * STL下载邮件门控 - 在下载前弹出
   */
  function showEmailGate(stlName, onSuccess) {
    if (capturedEmail && CONFIG.emailGateEnabled) {
      // 已捕获邮箱，直接放行
      trackStlDownload(stlName, capturedEmail);
      if (onSuccess) onSuccess();
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'email-gate-overlay';
    overlay.innerHTML = `
      <div class="email-gate-modal">
        <button class="email-gate-close" onclick="this.closest('.email-gate-overlay').remove()">×</button>
        <div class="email-gate-icon">📥</div>
        <h3>免费下载 ${stlName}</h3>
        <p>输入邮箱即可下载，我们会不定期发送机器人DIY技巧和优惠信息</p>
        <form id="emailGateForm" onsubmit="return false;">
          <input type="email" id="emailGateInput" placeholder="your@email.com" required 
                 value="${capturedEmail}">
          <button type="submit" class="email-gate-btn">免费下载 STL 文件</button>
        </form>
        <p class="email-gate-skip" onclick="this.closest('.email-gate-overlay').remove(); if(arguments[0]) arguments[0]();">暂不需要，直接下载</p>
        <p class="email-gate-privacy">🔒 我们不会发送垃圾邮件，随时可退订</p>
      </div>
    `;
    document.body.appendChild(overlay);

    const form = overlay.querySelector('#emailGateForm');
    const input = overlay.querySelector('#emailGateInput');

    form.addEventListener('submit', async () => {
      const email = input.value.trim();
      if (!validateEmail(email)) {
        showToast('请输入有效的邮箱地址', 'error');
        return;
      }
      capturedEmail = email;
      localStorage.setItem('rbp_email', email);
      await captureEmail(email, 'stl_download', stlName);
      trackStlDownload(stlName, email);
      overlay.remove();
      showToast('✅ 邮箱验证成功，开始下载！', 'success');
      if (onSuccess) onSuccess();
    });

    // 跳过按钮
    const skipBtn = overlay.querySelector('.email-gate-skip');
    skipBtn.onclick = () => {
      trackStlDownload(stlName, 'anonymous');
      overlay.remove();
      if (onSuccess) onSuccess();
    };
  }

  /**
   * 向Supabase提交邮件
   */
  async function captureEmail(email, source, context = '') {
    try {
      // 优先使用 Supabase 直连
      if (typeof supabase !== 'undefined' && supabase) {
        const { error } = await supabase.from('email_subscribers').upsert({
          email: email,
          source: source,
          context: context,
          subscribed_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
        }, { onConflict: 'email' });

        if (!error) {
          console.log('[Marketing] Email captured via Supabase:', email);
          return true;
        }
      }

      // 降级: 存储到 localStorage
      const subs = JSON.parse(localStorage.getItem('rbp_subscribers') || '[]');
      if (!subs.find(s => s.email === email)) {
        subs.push({ email, source, context, date: new Date().toISOString() });
        localStorage.setItem('rbp_subscribers', JSON.stringify(subs));
      }
      console.log('[Marketing] Email captured via localStorage:', email);
      return true;
    } catch (e) {
      console.error('[Marketing] Email capture failed:', e);
      return false;
    }
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ========== 退出意图弹窗 ==========

  function initExitIntent() {
    if (!CONFIG.exitIntentEnabled || exitIntentShown) return;

    let mouseOutCount = 0;

    document.addEventListener('mouseout', (e) => {
      // 只在鼠标向上离开页面时触发（退出意图）
      if (e.clientY > 0) return;
      if (e.relatedTarget !== null) return;

      mouseOutCount++;
      const timeOnPage = Date.now() - pageEnterTime;

      // 条件: 在页面停留>10秒 且 鼠标离开页面顶部
      if (mouseOutCount >= 2 && timeOnPage > CONFIG.exitIntentDelay && !exitIntentShown) {
        showExitPopup();
      }
    });

    // 移动端: 滚动到底部时触发
    let scrollTriggered = false;
    window.addEventListener('scroll', () => {
      if (scrollTriggered || exitIntentShown) return;
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercent > 0.75) {
        scrollTriggered = true;
        setTimeout(() => {
          if (!exitIntentShown) showExitPopup();
        }, 2000);
      }
    });
  }

  function showExitPopup() {
    exitIntentShown = true;
    const popup = document.createElement('div');
    popup.className = 'exit-popup-overlay';
    popup.innerHTML = `
      <div class="exit-popup-modal">
        <button class="exit-popup-close" onclick="this.closest('.exit-popup-overlay').remove()">×</button>
        <div class="exit-popup-icon">🤖</div>
        <h3>等一下！免费获取机器人零件选型指南</h3>
        <p>订阅即可获得：</p>
        <ul style="text-align:left; margin:12px 0;">
          <li>📋 17款机械臂 × 24款夹爪兼容性速查表</li>
          <li>🔧 每周精选 STL 转接件更新通知</li>
          <li>💰 机器人零件限时优惠信息</li>
        </ul>
        <form id="exitPopupForm" onsubmit="return false;">
          <input type="email" id="exitPopupEmail" placeholder="输入邮箱获取指南" required>
          <button type="submit" class="exit-popup-btn">免费获取</button>
        </form>
        <p class="exit-popup-no">不用了，我先逛逛</p>
        <p class="exit-popup-privacy">🔒 随时退订，不打扰</p>
      </div>
    `;
    document.body.appendChild(popup);

    const form = popup.querySelector('#exitPopupForm');
    const closeBtn = popup.querySelector('.exit-popup-close');
    const noBtn = popup.querySelector('.exit-popup-no');

    form.addEventListener('submit', async () => {
      const email = popup.querySelector('#exitPopupEmail').value.trim();
      if (!validateEmail(email)) return;
      capturedEmail = email;
      localStorage.setItem('rbp_email', email);
      await captureEmail(email, 'exit_intent', '退出弹窗');
      popup.remove();
      showToast('🎉 指南已发送到你的邮箱！', 'success');
    });

    closeBtn.onclick = () => popup.remove();
    noBtn.onclick = () => popup.remove();
  }

  // ========== 联盟点击优化 ==========

  /**
   * 增强版联盟点击追踪 - 带转化漏斗
   */
  function trackAffiliateClick(brand, productType, source = 'direct') {
    if (!CONFIG.affiliateTrackEnabled) return;

    const clickData = {
      brand: brand,
      productType: productType,
      source: source,
      page: window.location.pathname,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      email: capturedEmail || 'anonymous',
    };

    // 异步追踪到 Supabase
    trackToSupabase('product_clicks', clickData);

    // 本地记录用于分析
    const clicks = JSON.parse(localStorage.getItem('rbp_affiliate_clicks') || '[]');
    clicks.push(clickData);
    if (clicks.length > 500) clicks.splice(0, 100); // 只保留最近400条
    localStorage.setItem('rbp_affiliate_clicks', JSON.stringify(clicks));

    console.log('[Marketing] Affiliate click tracked:', brand, source);
  }

  async function trackToSupabase(table, data) {
    try {
      if (typeof supabase !== 'undefined' && supabase) {
        await supabase.from(table).insert([data]);
      }
    } catch (e) {
      // 静默失败，不影响用户体验
    }
  }

  function trackStlDownload(stlName, email) {
    trackToSupabase('stl_downloads', {
      stl_name: stlName,
      email: email,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * 获取优化后的联盟链接（带追踪参数）
   */
  function getAffiliateUrl(brand) {
    const baseUrl = (AFFILIATE_CONFIG && AFFILIATE_CONFIG.brandLinks && AFFILIATE_CONFIG.brandLinks[brand])
      || `https://s.taobao.com/search?q=${encodeURIComponent(brand)}`;

    // 追加追踪参数
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}ref=rbp_${encodeURIComponent(brand.replace(/\s/g, '_'))}`;
  }

  // ========== 社交分发增强 ==========

  function initSocialSharing() {
    // 为所有STL卡片添加社交分享按钮
    document.querySelectorAll('.stl-card').forEach(card => {
      if (card.querySelector('.stl-share-btns')) return; // 已添加

      const shareBtns = document.createElement('div');
      shareBtns.className = 'stl-share-btns';
      shareBtns.innerHTML = `
        <button class="share-btn share-wechat" title="分享到微信" onclick="RoboMarketing.shareToWechat('${card.dataset.stlName || ''}')">💬</button>
        <button class="share-btn share-weibo" title="分享到微博" onclick="RoboMarketing.shareToWeibo('${card.dataset.stlName || ''}')">📢</button>
        <button class="share-btn share-reddit" title="分享到Reddit" onclick="RoboMarketing.shareToReddit('${card.dataset.stlName || ''}')">🌐</button>
        <button class="share-btn share-copy" title="复制链接" onclick="RoboMarketing.copyShareLink('${card.dataset.stlId || ''}')">📋</button>
      `;
      card.appendChild(shareBtns);
    });
  }

  function shareToWechat(title) {
    const url = `https://roboparts.cc/?ref=share_wechat`;
    const text = `推荐一个机器人零件对接平台 - ${title} | RoboParts`;
    // 生成二维码展示（简化版: 复制到剪贴板）
    copyToClipboard(`${text}\n${url}`);
    showToast('📋 已复制分享内容，粘贴到微信即可', 'success');
    rewardShare('wechat');
  }

  function shareToWeibo(title) {
    const url = encodeURIComponent('https://roboparts.cc/?ref=share_weibo');
    const text = encodeURIComponent(`发现一个超实用的机器人零件对接平台 - ${title} 🚀 #机器人DIY #3D打印`);
    window.open(`https://service.weibo.com/share/share.php?url=${url}&title=${text}`, '_blank');
    rewardShare('weibo');
  }

  function shareToReddit(title) {
    const url = encodeURIComponent('https://roboparts.cc/?ref=share_reddit');
    const text = encodeURIComponent(`Robot parts compatibility platform - ${title}`);
    window.open(`https://www.reddit.com/r/robotics/submit?url=${url}&title=${text}`, '_blank');
    rewardShare('reddit');
  }

  function copyShareLink(stlId) {
    const url = stlId
      ? `https://roboparts.cc/?stl=${stlId}&ref=share_copy`
      : 'https://roboparts.cc/?ref=share_copy';
    copyToClipboard(url);
    showToast('📋 链接已复制！', 'success');
    rewardShare('copy');
  }

  function rewardShare(platform) {
    // 积分奖励
    const points = parseInt(localStorage.getItem('rbp_share_points') || '0') + CONFIG.shareReward;
    localStorage.setItem('rbp_share_points', points.toString());
    // 追踪分享
    trackToSupabase('social_shares', {
      platform: platform,
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    });
  }

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  // ========== 内容推荐引擎 ==========

  /**
   * 基于用户浏览行为推荐相关内容
   */
  function getRecommendedContent(currentBrand, currentCategory) {
    const recommendations = [];

    // 基于品牌的推荐
    if (currentBrand) {
      const stlDesigns = typeof STL_DESIGNS !== 'undefined' ? STL_DESIGNS : [];
      const related = stlDesigns.filter(s =>
        s.compat && s.compat.includes(currentBrand)
      ).slice(0, 3);
      recommendations.push(...related.map(r => ({ type: 'stl', data: r, reason: `适配${currentBrand}` })));
    }

    // 基于品类的推荐
    const affiliateBrands = AFFILIATE_CONFIG && AFFILIATE_CONFIG.brandLinks
      ? Object.keys(AFFILIATE_CONFIG.brandLinks).slice(0, 5)
      : [];
    recommendations.push({
      type: 'affiliate',
      data: { brands: affiliateBrands },
      reason: '热门零件品牌',
    });

    return recommendations;
  }

  function showRecommendations(recs) {
    const existing = document.querySelector('.marketing-recs');
    if (existing) existing.remove();
    if (!recs || recs.length === 0) return;

    const container = document.createElement('div');
    container.className = 'marketing-recs';
    container.innerHTML = `
      <h4>🔗 相关推荐</h4>
      <div class="marketing-recs-grid">
        ${recs.map(r => renderRecommendation(r)).join('')}
      </div>
    `;

    const target = document.querySelector('.stl-grid') || document.querySelector('.parts-grid') || document.querySelector('main');
    if (target) target.after(container);
  }

  function renderRecommendation(rec) {
    if (rec.type === 'stl') {
      return `
        <a href="?stl=${rec.data.id}" class="rec-card rec-stl">
          <span class="rec-badge">📦 STL</span>
          <strong>${rec.data.name}</strong>
          <small>${rec.reason} · 下载${rec.data.downloads || 0}次</small>
        </a>`;
    }
    if (rec.type === 'affiliate') {
      const brands = rec.data.brands;
      return brands.map(b => `
        <a href="${getAffiliateUrl(b)}" target="_blank" rel="nofollow sponsored" 
           class="rec-card rec-affiliate"
           onclick="RoboMarketing.trackAffiliateClick('${b}', 'recommendation', 'content_rec')">
          <span class="rec-badge">🛒</span>
          <strong>${b}零件</strong>
          <small>淘宝查看价格 →</small>
        </a>
      `).join('');
    }
    return '';
  }

  // ========== 营销分析面板 (控制台) ==========

  function showMarketingDashboard() {
    const emailCount = capturedEmail ? 1 : 0;
    const clicks = JSON.parse(localStorage.getItem('rbp_affiliate_clicks') || '[]');
    const sharePoints = parseInt(localStorage.getItem('rbp_share_points') || '0');

    console.group('📊 RoboParts 营销数据面板');
    console.log('📧 已捕获邮箱:', emailCount, capturedEmail || '(无)');
    console.log('🛒 联盟点击(本地):', clicks.length, '次');
    console.log('🔗 分享积分:', sharePoints);
    console.log('📅 页面停留:', Math.round((Date.now() - pageEnterTime) / 1000), '秒');
    console.log('🌐 来源:', document.referrer || '直接访问');
    console.groupEnd();

    return {
      emailCount,
      clickCount: clicks.length,
      sharePoints,
      timeOnPage: Math.round((Date.now() - pageEnterTime) / 1000),
    };
  }

  // ========== 邮件序列自动化 ==========

  /**
   * 获取本地订阅列表（用于导出/同步到邮件服务）
   */
  function getSubscriberList() {
    const subs = JSON.parse(localStorage.getItem('rbp_subscribers') || '[]');
    return subs;
  }

  /**
   * 导出订阅者CSV
   */
  function exportSubscribersCSV() {
    const subs = getSubscriberList();
    if (subs.length === 0) {
      showToast('暂无订阅者数据', 'warning');
      return;
    }
    const header = 'email,source,context,date\n';
    const rows = subs.map(s => `${s.email},${s.source},${s.context || ''},${s.date}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roboparts_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✅ 已导出 ${subs.length} 条订阅记录`, 'success');
  }

  // ========== Toast 通知 ==========

  function showToast(msg, type = 'info') {
    const existing = document.querySelector('.marketing-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `marketing-toast toast-${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ========== 初始化 ==========

  function init() {
    console.log('[Marketing] RoboMarketing v1.0 初始化...');

    // 退出意图弹窗
    setTimeout(() => initExitIntent(), 1000);

    // 社交分享按钮
    setTimeout(() => initSocialSharing(), 2000);

    // STL下载邮件门控 - Hook到现有的下载按钮
    hookStlDownloads();

    // 营销面板 (开发模式)
    if (window.location.search.includes('marketing_dashboard')) {
      setTimeout(() => showMarketingDashboard(), 1000);
    }

    console.log('[Marketing] 初始化完成 ✅');
    console.log('[Marketing] 功能状态: 邮件门控=', CONFIG.emailGateEnabled,
      '退出弹窗=', CONFIG.exitIntentEnabled,
      '联盟追踪=', CONFIG.affiliateTrackEnabled);
  }

  /**
   * Hook STL下载按钮，在下载前弹出邮件门控
   */
  function hookStlDownloads() {
    document.addEventListener('click', (e) => {
      const downloadBtn = e.target.closest('[data-stl-download], .stl-download-btn, .btn-download');
      if (!downloadBtn) return;

      const stlName = downloadBtn.dataset.stlName
        || downloadBtn.closest('.stl-card')?.querySelector('.stl-name')?.textContent
        || 'STL文件';

      if (CONFIG.emailGateEnabled && !capturedEmail) {
        e.preventDefault();
        e.stopPropagation();
        showEmailGate(stlName, () => {
          // 邮箱捕获后触发原始下载
          downloadBtn.click();
        });
      }
    }, true);
  }

  // ========== 公开 API ==========

  return {
    init,
    showEmailGate,
    captureEmail,
    trackAffiliateClick,
    getAffiliateUrl,
    showRecommendations,
    getRecommendedContent,
    showMarketingDashboard,
    getSubscriberList,
    exportSubscribersCSV,
    // 社交分享
    shareToWechat: (title) => shareToWechat(title),
    shareToWeibo: (title) => shareToWeibo(title),
    shareToReddit: (title) => shareToReddit(title),
    copyShareLink: (id) => copyShareLink(id),
    // 工具
    showToast,
    validateEmail,
  };
})();

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => RoboMarketing.init());
} else {
  RoboMarketing.init();
}
