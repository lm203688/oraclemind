// ==========================================
// RoboLink - 配置文件
// 请替换为你的 Supabase 项目凭据
// 获取方式: supabase.com > 项目设置 > API
// ==========================================

const SUPABASE_CONFIG = {
  // 替换为你的 Supabase Project URL
  url: 'https://pendpzoycfngylrrbwon.supabase.co',
  // 替换为你的 Supabase Anon (public) Key
  anonKey: 'sb_publishable_Cm0je2pGSzSctnoNJh7wig_qsw-YxDo',
};

// 域名配置（部署后替换为你的实际域名）
const SITE_CONFIG = {
  domain: 'roboparts.cc',
  siteName: 'RoboParts',
  siteUrl: 'https://roboparts.cc',
  siteDescription: 'RoboLink是面向机器人创客和爱好者的零件对接平台，提供零件选型、兼容性检查、STL转接件下载、3D打印代打和社区交流。',
};

// 3D打印服务追踪配置
const PRINT_PARTNERS = {
  jlc: {
    name: '嘉立创3D打印',
    url: 'https://www.jlc-3dp.cn/',
    commission: 0.05, // 5% 佣金比例（示例）
  },
  mohou: {
    name: '魔猴网',
    url: 'https://www.mohou.com/',
    commission: 0.05,
  },
};

// 导购追踪配置（淘宝客佣金已启用）
const AFFILIATE_CONFIG = {
  enabled: true,
  // 淘宝客 PID（从 pub.alimama.com 获取）
  taobaoPid: 'mm_61266441_3396200370_116287300407',
  // 各品牌跳转淘宝搜索（带佣金PID）
  // 推广链接格式：s.taobao.com/search?q=关键词&pid=PID
  // 用户点击后淘宝会追踪佣金，下单后可在联盟后台查看
  brandLinks: {
    '慧灵科技': 'https://s.taobao.com/search?q=慧灵&pid=mm_61266441_3396200370_116287300407',
    '大寰机器人': 'https://s.taobao.com/search?q=大寰机器人&pid=mm_61266441_3396200370_116287300407',
    '柔触机器人': 'https://s.taobao.com/search?q=柔触机器人&pid=mm_61266441_3396200370_116287300407',
    '沃姆机器人': 'https://s.taobao.com/search?q=沃姆机器人&pid=mm_61266441_3396200370_116287300407',
    '天机机器人': 'https://s.taobao.com/search?q=天机机器人&pid=mm_61266441_3396200370_116287300407',
    '一元智能': 'https://s.taobao.com/search?q=一元智能+夹爪&pid=mm_61266441_3396200370_116287300407',
    '知行机器人': 'https://s.taobao.com/search?q=知行机器人&pid=mm_61266441_3396200370_116287300407',
    'DOBOT': 'https://s.taobao.com/search?q=越疆+DOBOT&pid=mm_61266441_3396200370_116287300407',
    'Robotiq': 'https://s.taobao.com/search?q=Robotiq&pid=mm_61266441_3396200370_116287300407',
    'OnRobot': 'https://s.taobao.com/search?q=OnRobot&pid=mm_61266441_3396200370_116287300407',
    'Schunk': 'https://s.taobao.com/search?q=Schunk+夹爪&pid=mm_61266441_3396200370_116287300407',
    'Festo': 'https://s.taobao.com/search?q=Festo+夹爪&pid=mm_61266441_3396200370_116287300407',
    'Universal Robots': 'https://s.taobao.com/search?q=优傲机器人&pid=mm_61266441_3396200370_116287300407',
    'Franka Emika': 'https://s.taobao.com/search?q=Franka+机器人&pid=mm_61266441_3396200370_116287300407',
    'HIWIN': 'https://s.taobao.com/search?q=HIWIN+机器人&pid=mm_61266441_3396200370_116287300407',
    'AUBO': 'https://s.taobao.com/search?q=遨博机器人&pid=mm_61266441_3396200370_116287300407',
    'Elephant Robotics': 'https://s.taobao.com/search?q=大象机器人+myCobot&pid=mm_61266441_3396200370_116287300407',
    'uArm': 'https://s.taobao.com/search?q=uArm+机械臂&pid=mm_61266441_3396200370_116287300407',
    'LoFi Robot': 'https://s.taobao.com/search?q=LoFi+机器人&pid=mm_61266441_3396200370_116287300407',
    '矽递科技': 'https://s.taobao.com/search?q=矽递科技+机械臂&pid=mm_61266441_3396200370_116287300407',
    'SO-ARM': 'https://s.taobao.com/search?q=SO-ARM&pid=mm_61266441_3396200370_116287300407',
    'CRobot': 'https://s.taobao.com/search?q=CRobot&pid=mm_61266441_3396200370_116287300407',
    '通用舵机': 'https://s.taobao.com/search?q=&pid=mm_61266441_3396200370_116287300407',
  },
};
