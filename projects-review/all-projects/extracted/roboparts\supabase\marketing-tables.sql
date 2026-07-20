-- ==========================================
-- 营销自动化数据库表
-- 执行方式: Supabase SQL Editor 粘贴执行
-- 创建日期: 2026-06-22
-- ==========================================

-- 1. 邮件订阅者表
CREATE TABLE IF NOT EXISTS email_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'unknown',          -- stl_download | exit_intent | subscription_form | community_signup
  context TEXT DEFAULT '',                -- 上下文信息（如 "STL名称"）
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_source ON email_subscribers(source);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_active ON email_subscribers(is_active);

-- 2. STL下载追踪表
CREATE TABLE IF NOT EXISTS stl_downloads (
  id BIGSERIAL PRIMARY KEY,
  stl_name TEXT NOT NULL,
  email TEXT DEFAULT 'anonymous',
  user_agent TEXT,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stl_downloads_name ON stl_downloads(stl_name);
CREATE INDEX IF NOT EXISTS idx_stl_downloads_date ON stl_downloads(downloaded_at);

-- 3. 社交分享追踪表
CREATE TABLE IF NOT EXISTS social_shares (
  id BIGSERIAL PRIMARY KEY,
  platform TEXT NOT NULL,          -- wechat | weibo | reddit | copy
  page TEXT,
  shared_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON social_shares(platform);

-- 4. 联盟点击详细追踪表
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id BIGSERIAL PRIMARY KEY,
  brand TEXT NOT NULL,
  product_type TEXT,
  source TEXT DEFAULT 'direct',    -- direct | recommendation | seo_page
  page TEXT,
  email TEXT DEFAULT 'anonymous',
  referrer TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_brand ON affiliate_clicks(brand);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_date ON affiliate_clicks(clicked_at);

-- 5. 程序化SEO页面访问追踪
CREATE TABLE IF NOT EXISTS seo_page_views (
  id BIGSERIAL PRIMARY KEY,
  page_path TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_page_views_path ON seo_page_views(page_path);

-- 6. 营销仪表板视图（汇总查询用）
CREATE OR REPLACE VIEW marketing_dashboard AS
SELECT
  (SELECT COUNT(*) FROM email_subscribers WHERE is_active = TRUE) AS total_subscribers,
  (SELECT COUNT(*) FROM email_subscribers WHERE subscribed_at > NOW() - INTERVAL '7 days') AS new_subscribers_7d,
  (SELECT COUNT(*) FROM stl_downloads WHERE downloaded_at > NOW() - INTERVAL '7 days') AS stl_downloads_7d,
  (SELECT COUNT(*) FROM affiliate_clicks WHERE clicked_at > NOW() - INTERVAL '7 days') AS affiliate_clicks_7d,
  (SELECT COUNT(*) FROM social_shares WHERE shared_at > NOW() - INTERVAL '7 days') AS social_shares_7d,
  (SELECT COUNT(*) FROM seo_page_views WHERE viewed_at > NOW() - INTERVAL '7 days') AS seo_views_7d,
  NOW() AS generated_at;

-- 7. RLS 策略（允许匿名插入）
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stl_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_page_views ENABLE ROW LEVEL SECURITY;

-- 允许匿名插入
CREATE POLICY "anon_insert_email_subscribers" ON email_subscribers FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "anon_insert_stl_downloads" ON stl_downloads FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "anon_insert_social_shares" ON social_shares FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "anon_insert_affiliate_clicks" ON affiliate_clicks FOR INSERT TO anon WITH CHECK (TRUE);
CREATE POLICY "anon_insert_seo_page_views" ON seo_page_views FOR INSERT TO anon WITH CHECK (TRUE);

-- 允许已认证用户读取自己的数据
CREATE POLICY "auth_select_own_email" ON email_subscribers FOR SELECT TO authenticated USING (email = auth.email());
