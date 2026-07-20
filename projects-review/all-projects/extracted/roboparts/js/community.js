// =========================================
// RoboLink - 社区功能（含积分激励体系）
// 依赖: auth.js (RoboLinkAuth), config.js (SUPABASE)
// =========================================

// 社区帖子本地缓存（Supabase 不可用时的降级）
let communityPosts = [];
let currentTab = 'latest';
let currentUserScores = null;  // 当前用户积分信息

// ========== 初始化 ==========
async function initCommunity() {
  renderCommunityTabs();
  await loadUserScores();  // 加载用户积分
  await loadPosts();
  renderPointsBadge();  // 显示积分徽章
}

// ========== 加载用户积分 ==========
async function loadUserScores() {
  const user = RoboLinkAuth.getUser();
  if (!user) {
    currentUserScores = null;
    return;
  }

  const client = RoboLinkAuth.getClient();
  if (!client) return;

  try {
    const { data, error } = await client
      .from('user_scores')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      currentUserScores = data;
    } else {
      // 新用户，创建积分记录
      const { data: newData, error: insertError } = await client
        .from('user_scores')
        .insert({ user_id: user.id, points: 0, level: 1, title: '新手创客' })
        .select()
        .single();
      if (!insertError && newData) {
        currentUserScores = newData;
      }
    }
  } catch (e) {
    console.error('[loadUserScores]', e);
  }
}

// ========== 渲染积分徽章 ==========
function renderPointsBadge() {
  const badgeEl = document.getElementById('pointsBadge');
  if (!badgeEl) return;

  if (!currentUserScores) {
    badgeEl.style.display = 'none';
    return;
  }

  badgeEl.style.display = 'inline-flex';
  badgeEl.innerHTML = `
    <span class="points-value">${currentUserScores.points || 0}</span>
    <span class="points-label">积分</span>
    <span class="level-badge">Lv.${currentUserScores.level || 1}</span>
  `;
}

// ========== 添加积分 ==========
async function addPoints(action, pointsChange) {
  const user = RoboLinkAuth.getUser();
  if (!user) return;

  const client = RoboLinkAuth.getClient();
  if (!client) return;

  try {
    // 获取当前积分
    const { data: current, error: selectError } = await client
      .from('user_scores')
      .select('points, level, title')
      .eq('user_id', user.id)
      .single();

    if (selectError) return;

    const newPoints = (current.points || 0) + pointsChange;
    const newLevel = calcLevel(newPoints);
    const newTitle = calcTitle(newLevel);

    // 更新积分
    const { error: updateError } = await client
      .from('user_scores')
      .update({
        points: newPoints,
        level: newLevel,
        title: newTitle,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (!updateError) {
      // 记录积分日志
      await client.from('points_log').insert({
        user_id: user.id,
        action: action,
        points_change: pointsChange,
        balance: newPoints
      });

      currentUserScores = {
        ...currentUserScores,
        points: newPoints,
        level: newLevel,
        title: newTitle
      };
      renderPointsBadge();
    }
  } catch (e) {
    console.error('[addPoints]', e);
  }
}

// ========== 等级计算（前端副本）==========
function calcLevel(p) {
  if (p >= 5000) return 6;
  if (p >= 2000) return 5;
  if (p >= 1000) return 4;
  if (p >= 500) return 3;
  if (p >= 100) return 2;
  return 1;
}

function calcTitle(l) {
  const titles = ['新手创客', '入门创客', '进阶创客', '活跃创客', '资深创客', '传奇创客'];
  return titles[l - 1] || '新手创客';
}

// ========== 签到 ==========
async function checkIn() {
  const user = RoboLinkAuth.getUser();
  if (!user) {
    showAuthModal('login');
    return;
  }

  const client = RoboLinkAuth.getClient();
  if (!client) return;

  try {
    const { data: scores, error } = await client
      .from('user_scores')
      .select('last_check_in')
      .eq('user_id', user.id)
      .single();

    if (!error && scores?.last_check_in) {
      const lastCheckIn = new Date(scores.last_check_in);
      const today = new Date();
      if (lastCheckIn.toDateString() === today.toDateString()) {
        showToast('今天已经签到过了！');
        return;
      }
    }

    // 签到成功
    await addPoints('check_in', 5);
    await client
      .from('user_scores')
      .update({ last_check_in: new Date().toISOString().split('T')[0] })
      .eq('user_id', user.id);

    showToast('签到成功！+5 积分');
  } catch (e) {
    console.error('[checkIn]', e);
  }
}

function renderCommunityTabs() {
  const tabs = document.querySelectorAll('.community-tabs .tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      renderPosts();
    });
  });
}

// ========== 加载帖子 ==========
async function loadPosts() {
  const client = RoboLinkAuth.getClient();
  const feedEl = document.getElementById('communityFeed');

  // 尝试从 Supabase 加载
  if (client) {
    try {
      const { data, error } = await client
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data && data.length > 0) {
        communityPosts = data;
        renderPosts();
        return;
      }
    } catch (e) { /* 忽略，走降级 */ }
  }

  // 降级：从 localStorage 读取
  try {
    const cached = localStorage.getItem('roboparts_community_posts');
    if (cached) {
      communityPosts = JSON.parse(cached);
      renderPosts();
      return;
    }
  } catch (e) { /* 忽略 */ }

  // 最终降级：渲染示例数据
  communityPosts = getSamplePosts();
  renderPosts();
}

function getSamplePosts() {
  return [
    {
      id: 'sample-1',
      title: 'myCobot 280 + 慧灵 LFG-Micro 转接成功！',
      tab: 'combo',
      content: '分享一下我的方案：myCobot 280 的 M4 法兰用我们平台下载的转接件（iso50-to-servo v3），完美适配慧灵 LFG-Micro。打印用的 PETG，层高 0.2mm，不需要支撑。',
      author: '创客小明',
      avatar_initial: '明',
      likes: 12,
      comments: 3,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      image_url: null,
      stl_id: 'iso50-to-servo',
    },
    {
      id: 'sample-2',
      title: '求助：uArm Swift Pro 能接 Robotiq 2F-85 吗？',
      tab: 'qa',
      content: '学校实验室有一台 uArm Swift Pro，想用它做抓取实验，手头有个 Robotiq 2F-85 夹爪。法兰尺寸差太多了，有没有可行的转接方案？预算有限，学生党。',
      author: '机器人学渣',
      avatar_initial: '渣',
      likes: 5,
      comments: 7,
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      image_url: null,
      stl_id: null,
    },
    {
      id: 'sample-3',
      title: '舵机夹爪 vs 电动夹爪：教育场景怎么选？',
      tab: 'tutorial',
      content: '给老师们做个对比：舵机夹爪（MG996R 等）成本 25 元以内，适合演示用；电动夹爪（慧灵 LFG-Micro）680 元，有力度反馈，适合真实抓取任务。如果预算够，建议直接上电动。',
      author: '王老师',
      avatar_initial: '王',
      likes: 28,
      comments: 5,
      created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      image_url: null,
      stl_id: null,
    },
  ];
}

// ========== 渲染帖子 ==========
function renderPosts() {
  const feedEl = document.getElementById('communityFeed');
  if (!feedEl) return;

  let posts = communityPosts;
  if (currentTab && currentTab !== 'latest') {
    posts = posts.filter(p => p.tab === currentTab);
  }

  if (posts.length === 0) {
    feedEl.innerHTML = `
      <div style="text-align:center;padding:40px 20px;color:var(--gray-400);">
        <p style="font-size:24px;margin-bottom:8px;">📭</p>
        <p>暂无${getTabName(currentTab)}内容</p>
        <p style="font-size:13px;margin-top:8px;">来发第一帖吧！</p>
      </div>`;
    return;
  }

  feedEl.innerHTML = posts.map(p => renderPostCard(p)).join('');
}

function renderPostCard(p) {
  const timeStr = formatTimeAgo(p.created_at);
  const tabLabel = getTabName(p.tab);
  const imageHtml = p.image_url
    ? `<div class="post-image"><img src="${p.image_url}" alt="晒图" style="max-width:100%;border-radius:8px;margin:8px 0;"></div>`
    : '';

  return `
    <div class="post-card" data-post-id="${p.id}">
      <div class="post-header">
        <div class="post-avatar">${p.avatar_initial || p.author?.charAt(0) || '?'}</div>
        <div class="post-meta">
          <span class="post-author">${p.author || '匿名用户'}</span>
          <span class="post-time">${timeStr}</span>
        </div>
        <span class="post-tab-badge">${tabLabel}</span>
      </div>
      <div class="post-body">
        <h4 class="post-title">${escapeHtml(p.title)}</h4>
        <p class="post-content">${escapeHtml(p.content)}</p>
        ${imageHtml}
      </div>
      <div class="post-footer">
        <button class="post-action" onclick="likePost('${p.id}')">
          👍 <span class="like-count">${p.likes || 0}</span>
        </button>
        <button class="post-action" onclick="commentPost('${p.id}')">
          💬 ${p.comments || 0}
        </button>
        <button class="post-action" onclick="sharePost('${p.id}')">
          🔗 分享
        </button>
      </div>
    </div>`;
}

function getTabName(tab) {
  const map = { latest: '最新', popular: '热门', combo: '搭配方案', tutorial: '教程', qa: '问答', review: '评测' };
  return map[tab] || tab;
}

function formatTimeAgo(isoStr) {
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`;
  return new Date(isoStr).toLocaleDateString('zh-CN');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ========== 发帖 ==========
function togglePostForm() {
  const form = document.getElementById('newPostForm');
  const notice = document.getElementById('postFormNotice');
  if (!form) return;

  const user = RoboLinkAuth.getUser();
  if (!user) {
    // 未登录，显示提示
    if (notice) notice.style.display = 'block';
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    if (form.style.display === 'block') {
      showAuthModal('login');
    }
    return;
  }

  // 已登录，切换表单
  notice.style.display = 'none';
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function submitPost() {
  const user = RoboLinkAuth.getUser();
  if (!user) {
    showAuthModal('login');
    return;
  }

  const titleEl = document.getElementById('newPostTitle');
  const tabEl = document.getElementById('newPostTab');
  const contentEl = document.getElementById('newPostContent');

  const title = titleEl?.value?.trim();
  const content = contentEl?.value?.trim();
  const tab = tabEl?.value || 'combo';

  if (!title || title.length < 2) {
    showToast('请输入标题（至少2个字）');
    return;
  }
  if (!content || content.length < 5) {
    showToast('请输入内容（至少5个字）');
    return;
  }

  const newPost = {
    id: 'post-' + Date.now(),
    title,
    tab,
    content,
    author: user.email || '匿名用户',
    avatar_initial: (user.email || '?').charAt(0).toUpperCase(),
    likes: 0,
    comments: 0,
    created_at: new Date().toISOString(),
    user_id: user.id,
    image_url: null,
    stl_id: null,
  };

  // 尝试写入 Supabase
  const client = RoboLinkAuth.getClient();
  let saved = false;
  if (client) {
    try {
      const { error } = await client.from('posts').insert({
        title: newPost.title,
        tab: newPost.tab,
        content: newPost.content,
        user_id: newPost.user_id,
        author: newPost.author,
        avatar_initial: newPost.avatar_initial,
      });
      if (!error) saved = true;
    } catch (e) { /* 忽略 */ }
  }

  // 本地保存（无论 Supabase 是否成功）
  communityPosts.unshift(newPost);
  try {
    localStorage.setItem('roboparts_community_posts', JSON.stringify(communityPosts.slice(0, 50)));
  } catch (e) { /* 忽略 */ }

  // 清空表单
  if (titleEl) titleEl.value = '';
  if (contentEl) contentEl.value = '';
  const form = document.getElementById('newPostForm');
  if (form) form.style.display = 'none';

  // 发帖积分
  await addPoints('post', 10);

  showToast(saved ? '发布成功！+10 积分' : '发布成功（本地保存）+10 积分');
  renderPosts();
}

// ========== 互动 ==========
async function likePost(postId) {
  const post = communityPosts.find(p => p.id === postId);
  if (!post) return;

  post.likes = (post.likes || 0) + 1;

  // 尝试写入 Supabase
  const client = RoboLinkAuth.getClient();
  if (client) {
    try {
      const currentUser = RoboLinkAuth.getUser();
      await client.from('post_likes').insert({
        post_id: postId,
        user_id: currentUser?.id || null,
      });

      // 给帖子作者添加积分（如果被点赞的帖子有作者）
      if (post.user_id && post.user_id !== currentUser?.id) {
        // 直接更新 user_scores 表（绕过 addPoints 的前端限制）
        const { error: scoreError } = await client
          .from('user_scores')
          .update({
            points: client.literal('points + 2'),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', post.user_id);

        if (!scoreError) {
          console.log('[likePost] 给帖子作者添加 2 积分', post.user_id);
        }
      }
    } catch (e) { /* 忽略 */ }
  }

  renderPosts();
}

function commentPost(postId) {
  showToast('评论功能即将上线，敬请期待！');
}

function sharePost(postId) {
  const post = communityPosts.find(p => p.id === postId);
  if (!post) return;
  const url = `${location.origin}${location.pathname}#community`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('链接已复制！+1 积分');
      // 分享积分
      addPoints('share', 1);
    });
  } else {
    showToast('分享链接：' + url + '（+1 积分）');
    addPoints('share', 1);
  }
}

// ========== Supabase 保活心跳 ==========
// 供周度审计任务调用，也供页面加载时调用
async function supabaseKeepalive() {
  const client = RoboLinkAuth.getClient();
  if (!client) return { success: false, reason: 'no_client' };

  try {
    // 最简单的保活：执行一次 SELECT 1 等效查询
    const { error } = await client.from('posts').select('id', { count: 'exact', head: true });
    if (!error) return { success: true };
    // 如果 posts 表不存在，尝试 product_clicks
    const { error: e2 } = await client.from('product_clicks').select('id', { count: 'exact', head: true });
    if (!e2) return { success: true };
    return { success: false, reason: error?.message || e2?.message };
  } catch (e) {
    return { success: false, reason: e.message };
  }
}

// 页面加载时自动保活（防止 Supabase 免费层休眠）
document.addEventListener('DOMContentLoaded', () => {
  // 延迟 5 秒后执行保活，不阻塞页面加载
  setTimeout(() => {
    supabaseKeepalive().then(result => {
      console.log('[Supabase Keepalive]', result);
    });
  }, 5000);
});
