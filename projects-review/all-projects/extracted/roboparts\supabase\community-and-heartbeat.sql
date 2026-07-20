-- 社区帖子表
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tab text not null default 'combo',
  content text,
  author text,
  avatar_initial text,
  image_url text,
  stl_id text,
  user_id uuid references auth.users(id) on delete set null,
  likes integer default 0,
  comments integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 帖子点赞表（防止重复点赞）
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(post_id, user_id)
);

-- RLS 策略
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;

-- 帖子：所有人可读取，登录用户可插入
create policy "posts_select_all" on public.posts
  for select using (true);
create policy "posts_insert_auth" on public.posts
  for insert with check (auth.uid() = user_id);

-- 点赞：所有人可读取，登录用户可插入
create policy "post_likes_select_all" on public.post_likes
  for select using (true);
create policy "post_likes_insert_auth" on public.post_likes
  for insert with check (auth.uid() = user_id);

-- 保活心跳表（防止 Supabase 免费层休眠）
create table if not exists public.heartbeat (
  id serial primary key,
  ping_at timestamp with time zone default now()
);

-- 用户积分表（社区激励体系）
create table if not exists public.user_scores (
  user_id uuid references auth.users(id) on delete cascade primary key,
  points integer default 0,
  level integer default 1,
  title text default '新手创客',
  posts_count integer default 0,
  likes_received integer default 0,
  shares_count integer default 0,
  last_check_in date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 积分变动日志表
create table if not exists public.points_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,  -- 'post', 'like_received', 'share', 'check_in', 'download_stl'
  points_change integer not null,
  balance integer not null,
  created_at timestamp with time zone default now()
);

-- RLS 策略
alter table public.user_scores enable row level security;
alter table public.points_log enable row level security;

-- 用户可读取所有积分，但只能更新自己的
create policy "user_scores_select_all" on public.user_scores
  for select using (true);
create policy "user_scores_update_own" on public.user_scores
  for update using (auth.uid() = user_id);
create policy "user_scores_insert_own" on public.user_scores
  for insert with check (auth.uid() = user_id);

-- 积分日志：用户可读取自己的
create policy "points_log_select_own" on public.points_log
  for select using (auth.uid() = user_id);
create policy "points_log_insert_own" on public.points_log
  for insert with check (auth.uid() = user_id);

-- 初始化积分函数（新用户注册时调用）
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_scores (user_id, points, level, title)
  values (new.id, 0, 1, '新手创客');
  return new;
end;
$$ language plpgsql security definer;

-- 触发器：新用户注册时自动创建积分记录
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 计算等级的函数
create or replace function public.calc_level(p integer) returns integer as $$
begin
  if p >= 5000 then return 6;  -- 传奇创客
  elsif p >= 2000 then return 5;  -- 资深创客
  elsif p >= 1000 then return 4;  -- 活跃创客
  elsif p >= 500 then return 3;   -- 进阶创客
  elsif p >= 100 then return 2;   -- 入门创客
  else return 1;                -- 新手创客
  end if;
end;
$$ language plpgsql immutable;

-- 计算称号的函数
create or replace function public.calc_title(l integer) returns text as $$
begin
  case l
    when 6 then return '传奇创客';
    when 5 then return '资深创客';
    when 4 then return '活跃创客';
    when 3 then return '进阶创客';
    when 2 then return '入门创客';
    else return '新手创客';
  end case;
end;
$$ language plpgsql immutable;
