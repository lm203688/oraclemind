// ==========================================
// RoboParts API 共享数据层（服务端版本）
// 从 js/data.js 复制，确保前后端数据一致
// 路径: /api/_data.js
// ==========================================

// 机械臂数据库
const ROBOT_ARMS = [
  { id: 'dobot-magician', brand: 'DOBOT', model: 'Magician', type: '协作臂', flange: 'ISO 9409-50-4-M6', protocol: 'Modbus RTU', voltage: '24VDC', payload: '0.5kg', repeatability: '0.2mm' },
  { id: 'dobot-m1', brand: 'DOBOT', model: 'M1', type: '协作臂', flange: 'ISO 9409-50-4-M6', protocol: 'Modbus RTU/TCP', voltage: '24VDC', payload: '3kg', repeatability: '0.1mm' },
  { id: 'dobot-cr3', brand: 'DOBOT', model: 'CR3', type: '协作臂', flange: 'ISO 9409-50-4-M6', protocol: 'Modbus RTU/TCP', voltage: '48VDC', payload: '3kg', repeatability: '0.05mm' },
  { id: 'ur3e', brand: 'Universal Robots', model: 'UR3e', type: '协作臂', flange: 'ISO 9409-50-4-M6', protocol: 'URScript/Modbus', voltage: '24VDC', payload: '3kg', repeatability: '0.1mm' },
  { id: 'ur5e', brand: 'Universal Robots', model: 'UR5e', type: '协作臂', flange: 'ISO 9409-50-4-M6', protocol: 'URScript/Modbus', voltage: '24VDC', payload: '5kg', repeatability: '0.1mm' },
  { id: 'franka-panda', brand: 'Franka Emika', model: 'Panda', type: '协作臂', flange: 'ISO 9409-50-4-M6', protocol: 'libfranka/ROS2', voltage: '48VDC', payload: '3kg', repeatability: '0.1mm' },
  { id: 'hiwin-6f', brand: 'HIWIN', model: 'RA610-6F', type: '协作臂', flange: 'ISO 9409-50-4-M6', protocol: 'Modbus RTU', voltage: '24VDC', payload: '6kg', repeatability: '0.1mm' },
  { id: 'auber-06', brand: 'AUBO', model: 'i06', type: '协作臂', flange: 'ISO 9409-50-4-M6', protocol: 'Modbus RTU/TCP', voltage: '24VDC', payload: '6kg', repeatability: '0.05mm' },
  { id: 'uarm-metal', brand: 'uArm', model: 'Swift Pro Metal', type: '桌面臂', flange: '自定义 M4x4', protocol: 'UART/I2C', voltage: '5-12VDC', payload: '0.5kg', repeatability: '0.5mm' },
  { id: 'lofi-robot', brand: 'LoFi Robot', model: 'MK2', type: '开源臂', flange: '自定义卡扣', protocol: 'PWM/Servo', voltage: '6-12VDC', payload: '0.3kg', repeatability: '1mm' },
  { id: 'elephant-06', brand: 'Elephant Robotics', model: 'myCobot 280', type: '桌面臂', flange: '自定义 M4', protocol: 'UART/I2C', voltage: '12VDC', payload: '0.25kg', repeatability: '1mm' },
  { id: 'elephant-320', brand: 'Elephant Robotics', model: 'myCobot 320', type: '桌面臂', flange: 'ISO 9409-40-4-M4', protocol: 'UART/I2C', voltage: '12VDC', payload: '0.5kg', repeatability: '0.5mm' },
  { id: 'elephant-630', brand: 'Elephant Robotics', model: 'myCobot 630', type: '桌面臂', flange: 'ISO 9409-50-4-M6', protocol: 'Modbus RTU/TCP', voltage: '24VDC', payload: '2kg', repeatability: '0.2mm' },
  { id: 'seeed-rebot', brand: '矽递科技', model: 'reBot-DevArm', type: '开源臂', flange: '自定义 M4x4', protocol: 'UART/I2C', voltage: '12VDC', payload: '0.5kg', repeatability: '0.5mm' },
  { id: 'so-arm100', brand: 'SO-ARM', model: 'SO-ARM100', type: '开源臂', flange: '自定义卡扣', protocol: 'UART/ROS2', voltage: '12VDC', payload: '0.3kg', repeatability: '0.8mm' },
  { id: 'cr4-robot', brand: 'CRobot', model: 'CR4', type: '桌面臂', flange: '自定义 M4', protocol: 'UART/PWM', voltage: '12VDC', payload: '0.3kg', repeatability: '1mm' },
  { id: 'dobot-lite', brand: 'DOBOT', model: 'Lite 6', type: '桌面臂', flange: '自定义 M4', protocol: 'UART/Modbus', voltage: '24VDC', payload: '0.5kg', repeatability: '0.2mm' },
];

// 末端执行器（夹爪）数据库
const END_EFFECTORS = [
  { id: 'robotiq-2f85', brand: 'Robotiq', model: '2F-85', category: 'electric-gripper', type: '电动夹爪', force: '5-85N', stroke: '0-85mm', voltage: '24VDC', protocol: 'Modbus RTU', flange: 'ISO 9409-50-4-M6', weight: '0.95kg', price: 8500, repeatability: '0.02mm' },
  { id: 'robotiq-2f140', brand: 'Robotiq', model: '2F-140', category: 'electric-gripper', type: '电动夹爪', force: '5-140N', stroke: '0-140mm', voltage: '24VDC', protocol: 'Modbus RTU', flange: 'ISO 9409-50-4-M6', weight: '1.1kg', price: 9200, repeatability: '0.02mm' },
  { id: 'robotiq-hande', brand: 'Robotiq', model: 'Hand-E', category: 'electric-gripper', type: '电动夹爪', force: '2.5-25N', stroke: '0-50mm', voltage: '24VDC', protocol: 'Modbus RTU', flange: 'ISO 9409-40-4-M4', weight: '0.62kg', price: 7800, repeatability: '0.02mm' },
  { id: 'onrobot-rg2', brand: 'OnRobot', model: 'RG2', category: 'electric-gripper', type: '电动夹爪', force: '5-100N', stroke: '0-50mm', voltage: '24VDC', protocol: 'Modbus RTU', flange: 'ISO 9409-50-4-M6', weight: '0.85kg', price: 6800, repeatability: '0.02mm' },
  { id: 'onrobot-rg6', brand: 'OnRobot', model: 'RG6', category: 'electric-gripper', type: '电动夹爪', force: '5-150N', stroke: '0-60mm', voltage: '24VDC', protocol: 'Modbus RTU', flange: 'ISO 9409-50-4-M6', weight: '1.0kg', price: 7500, repeatability: '0.02mm' },
  { id: 'onrobot-vgc10', brand: 'OnRobot', model: 'VGC10', category: 'vacuum', type: '真空吸盘', force: '5-20N', stroke: 'N/A', voltage: '24VDC', protocol: 'Modbus RTU', flange: 'ISO 9409-50-4-M6', weight: '0.48kg', price: 5600, repeatability: '0.5mm' },
  { id: 'schunk-egp40', brand: 'Schunk', model: 'EGP-40', category: 'electric-gripper', type: '电动夹爪', force: '1-40N', stroke: '0-40mm', voltage: '24VDC', protocol: 'Modbus RTU/Profibus', flange: 'ISO 9409-50-4-M6', weight: '0.8kg', price: 12000, repeatability: '0.01mm' },
  { id: 'festo-dhg', brand: 'Festo', model: 'DHGP', category: 'electric-gripper', type: '电动夹爪', force: '5-70N', stroke: '0-40mm', voltage: '24VDC', protocol: 'Modbus RTU/IO-Link', flange: 'ISO 9409-50-4-M6', weight: '0.65kg', price: 9500, repeatability: '0.05mm' },
  { id: 'huiling-lfg', brand: '慧灵科技', model: 'LFG-2T', category: 'electric-gripper', type: '电动夹爪', force: '2-40N', stroke: '0-85mm', voltage: '12-24VDC', protocol: 'Modbus RTU/I2C', flange: 'ISO 9409-50-4-M6', weight: '0.38kg', price: 1680, repeatability: '0.05mm' },
  { id: 'huiling-lfg-mini', brand: '慧灵科技', model: 'LFG-Micro', category: 'electric-gripper', type: '电动夹爪', force: '0.5-10N', stroke: '0-25mm', voltage: '12VDC', protocol: 'I2C/UART', flange: '自定义 M4', weight: '0.12kg', price: 680, repeatability: '0.1mm' },
  { id: 'huiling-lfg3t', brand: '慧灵科技', model: 'LFG-3T', category: 'electric-gripper', type: '电动夹爪', force: '2-60N', stroke: '0-90mm', voltage: '24VDC', protocol: 'Modbus RTU/IO-Link', flange: 'ISO 9409-50-4-M6', weight: '0.42kg', price: 2280, repeatability: '0.05mm' },
  { id: 'dahang-gecko', brand: '大寰机器人', model: 'GECKO', category: 'electric-gripper', type: '电动夹爪', force: '1-25N', stroke: '0-65mm', voltage: '24VDC', protocol: 'Modbus RTU', flange: 'ISO 9409-50-4-M6', weight: '0.42kg', price: 2980, repeatability: '0.02mm' },
  { id: 'dahang-pika', brand: '大寰机器人', model: 'PIKA', category: 'electric-gripper', type: '电动夹爪', force: '0.5-8N', stroke: '0-30mm', voltage: '12VDC', protocol: 'I2C/UART', flange: '自定义 M3', weight: '0.09kg', price: 880, repeatability: '0.05mm' },
  { id: 'rouchu-fg', brand: '柔触机器人', model: 'FG-2', category: 'soft-gripper', type: '柔性夹爪', force: '1-15N', stroke: '自适应', voltage: '24VDC', protocol: 'Modbus RTU', flange: 'ISO 9409-50-4-M6', weight: '0.55kg', price: 3680, repeatability: '1mm' },
  { id: 'rouchu-fg-mini', brand: '柔触机器人', model: 'FG-mini', category: 'soft-gripper', type: '柔性夹爪', force: '0.5-8N', stroke: '自适应', voltage: '12VDC', protocol: 'I2C', flange: '自定义 M4', weight: '0.18kg', price: 1580, repeatability: '2mm' },
  { id: 'zhixing-hg', brand: '知行机器人', model: 'HG-210', category: 'electric-gripper', type: '电动夹爪', force: '5-100N', stroke: '0-70mm', voltage: '24VDC', protocol: 'Modbus RTU', flange: 'ISO 9409-50-4-M6', weight: '0.7kg', price: 3980, repeatability: '0.05mm' },
  { id: 'worm-wk01', brand: '沃姆机器人', model: 'WK-01', category: 'electric-gripper', type: '电动夹爪', force: '0.5-15N', stroke: '0-30mm', voltage: '12VDC', protocol: 'UART/I2C', flange: '自定义 M4', weight: '0.15kg', price: 580, repeatability: '0.1mm' },
  { id: 'tianji-tg01', brand: '天机机器人', model: 'TG-01', category: 'electric-gripper', type: '电动夹爪', force: '1-20N', stroke: '0-40mm', voltage: '12VDC', protocol: 'Modbus RTU', flange: '自定义 M4', weight: '0.22kg', price: 780, repeatability: '0.1mm' },
  { id: 'yiyuan-yg100', brand: '一元智能', model: 'YG-100', category: 'electric-gripper', type: '电动夹爪', force: '0.3-10N', stroke: '0-20mm', voltage: '5-12VDC', protocol: 'PWM/UART', flange: '标准舵机', weight: '0.08kg', price: 168, repeatability: '0.5mm' },
  { id: 'servo-mg996r', brand: '通用舵机', model: 'MG996R', category: 'servo-gripper', type: '舵机夹爪', force: '10kg-cm', stroke: '180deg', voltage: '6VDC', protocol: 'PWM', flange: '标准舵机臂', weight: '0.055kg', price: 25, repeatability: '2deg' },
  { id: 'servo-mg995', brand: '通用舵机', model: 'MG995', category: 'servo-gripper', type: '舵机夹瓜', force: '8.5kg-cm', stroke: '180deg', voltage: '6VDC', protocol: 'PWM', flange: '标准舵机臂', weight: '0.048kg', price: 18, repeatability: '2deg' },
  { id: 'servo-sg90', brand: '通用舵机', model: 'SG90', category: 'servo-gripper', type: '舵机夹瓜', force: '1.8kg-cm', stroke: '180deg', voltage: '5VDC', protocol: 'PWM', flange: '标准舵机臂', weight: '0.009kg', price: 5, repeatability: '3deg' },
  { id: 'servo-ds3218', brand: '通用舵机', model: 'DS3218', category: 'servo-gripper', type: '舵机夹瓜', force: '20kg-cm', stroke: '180deg', voltage: '7.4VDC', protocol: 'PWM', flange: '标准舵机臂', weight: '0.060kg', price: 35, repeatability: '1deg' },
  { id: 'vacuum-mini', brand: '慧灵科技', model: 'VG-Micro', category: 'vacuum', type: '微型真空吸盘', force: '2-8N', stroke: 'N/A', voltage: '12VDC', protocol: 'IO开关', flange: '自定义 M4', weight: '0.06kg', price: 320, repeatability: '1mm' },
  { id: 'vacuum-robotiq', brand: 'Robotiq', model: 'EPICK', category: 'vacuum', type: '电动真空吸盘', force: '5-20N', stroke: 'N/A', voltage: '24VDC', protocol: 'Modbus RTU', flange: 'ISO 9409-50-4-M6', weight: '0.7kg', price: 5800, repeatability: '0.5mm' },

  // === 新增国产夹爪（2026-06 补录）===
  { id: 'dahuan-gecko-pro', brand: '大寰机器人', model: 'GECKO-Pro', category: 'electric-gripper', type: '电动夹爪', force: '2-40N', stroke: '0-80mm', voltage: '24VDC', protocol: 'Modbus RTU', flange: 'ISO 9409-50-4-M6', weight: '0.45kg', price: 3280, repeatability: '0.02mm' },
  { id: 'dahuan-pika-mini', brand: '大寰机器人', model: 'PIKA-Mini', category: 'electric-gripper', type: '电动夹爪', force: '0.3-5N', stroke: '0-20mm', voltage: '12VDC', protocol: 'I2C/UART', flange: '自定义 M3', weight: '0.06kg', price: 580, repeatability: '0.05mm' },
  { id: 'huiling-lfg5t', brand: '慧灵科技', model: 'LFG-5T', category: 'electric-gripper', type: '电动夹爪', force: '5-80N', stroke: '0-100mm', voltage: '24VDC', protocol: 'Modbus RTU/IO-Link', flange: 'ISO 9409-50-4-M6', weight: '0.52kg', price: 2680, repeatability: '0.05mm' },
  { id: 'huiling-vg-pro', brand: '慧灵科技', model: 'VG-Pro', category: 'vacuum', type: '真空吸盘', force: '5-25N', stroke: 'N/A', voltage: '24VDC', protocol: 'IO-Link', flange: 'ISO 9409-50-4-M6', weight: '0.18kg', price: 480, repeatability: '0.5mm' },
  { id: 'zhixing-hg120', brand: '知行机器人', model: 'HG-120', category: 'electric-gripper', type: '电动夹爪', force: '3-50N', stroke: '0-60mm', voltage: '24VDC', protocol: 'Modbus RTU', flange: 'ISO 9409-50-4-M6', weight: '0.52kg', price: 2980, repeatability: '0.05mm' },
  { id: 'zhixing-hg220', brand: '知行机器人', model: 'HG-220', category: 'electric-gripper', type: '电动夹爪', force: '10-120N', stroke: '0-80mm', voltage: '24VDC', protocol: 'Modbus RTU', flange: 'ISO 9409-50-4-M6', weight: '0.85kg', price: 4580, repeatability: '0.05mm' },
  { id: 'rouchu-fg3', brand: '柔触机器人', model: 'FG-3', category: 'soft-gripper', type: '柔性夹爪', force: '2-20N', stroke: '自适应', voltage: '24VDC', protocol: 'Modbus RTU', flange: 'ISO 9409-50-4-M6', weight: '0.62kg', price: 3980, repeatability: '1mm' },
  { id: 'worm-wk02', brand: '沃姆机器人', model: 'WK-02', category: 'electric-gripper', type: '电动夹爪', force: '1-18N', stroke: '0-35mm', voltage: '12VDC', protocol: 'UART/I2C', flange: '自定义 M4', weight: '0.18kg', price: 680, repeatability: '0.1mm' },
];

// 法兰兼容组
const FLANGE_GROUPS = {
  'iso50-m6': {
    name: 'ISO 9409-50-4-M6',
    arms: ['ur3e','ur5e','franka-panda','hiwin-6f','auber-06','dobot-magician','dobot-m1','dobot-cr3','elephant-630'],
    grippers: ['robotiq-2f85','robotiq-2f140','onrobot-rg2','onrobot-rg6','onrobot-vgc10','schunk-egp40','festo-dhg','huiling-lfg','huiling-lfg3t','huiling-lfg5t','dahang-gecko','dahang-gecko-pro','zhixing-hg','zhixing-hg120','zhixing-hg220','rouchu-fg','rouchu-fg3','vacuum-robotiq','huiling-vg-pro']
  },
  'iso40-m4': {
    name: 'ISO 9409-40-4-M4',
    arms: ['elephant-320'],
    grippers: ['robotiq-hande']
  },
  'custom-m4': {
    name: '自定义 M4',
    arms: ['uarm-metal','elephant-06','seeed-rebot','dobot-lite','cr4-robot'],
    grippers: ['huiling-lfg-mini','rouchu-fg-mini','worm-wk01','worm-wk02','tianji-tg01','vacuum-mini']
  },
  'servo': {
    name: '标准舵机',
    arms: ['lofi-robot','so-arm100'],
    grippers: ['servo-mg996r','servo-mg995','servo-sg90','servo-ds3218','yiyuan-yg100']
  }
};

// 转接件对
const ADAPTER_PAIRS = {
  'iso50-m6_to_custom-m4': { name: 'ISO50法兰转M4转接板', stlAvailable: true, stlId: 'adapter-iso50-m4' },
  'iso40-m4_to_custom-m4': { name: 'ISO40法兰转M4转接板', stlAvailable: true, stlId: 'adapter-iso40-m4' },
  'iso50-m6_to_servo': { name: 'ISO50法兰转舵机支架', stlAvailable: true, stlId: 'adapter-iso50-servo' },
  'custom-m4_to_servo': { name: 'M4转舵机支架', stlAvailable: true, stlId: 'adapter-m4-servo' },
};

// STL 转接件设计（仅暴露元信息，不含大文件）
const STL_DESIGNS = [
  { id: 'adapter-iso50-m4', name: 'ISO50法兰转M4转接板', printPrice: 15, compat: 'DOBOT/uArm/UR系列 + 慧灵Mini/大寰PIKA' },
  { id: 'adapter-iso40-m4', name: 'ISO40法兰转M4转接板', printPrice: 15, compat: 'Robotiq Hand-E + uArm/Elephant' },
  { id: 'adapter-iso50-servo', name: 'ISO50法兰转舵机支架', printPrice: 18, compat: 'UR/DOBOT + MG996R/MG995' },
  { id: 'adapter-m4-servo', name: 'M4接口转舵机支架', printPrice: 18, compat: 'uArm/LoFi/Elephant + MG996R' },
  { id: 'adapter-iso50-iso40', name: 'ISO50转ISO40法兰转接环', printPrice: 20, compat: 'UR/DOBOT/AUBO + Robotiq Hand-E' },
  { id: 'adapter-dual-gripper', name: '双夹爪安装板', printPrice: 22, compat: 'ISO50法兰通用' },
];

// 查找零件所在法兰组
function findFlangeGroup(partId) {
  for (const [key, group] of Object.entries(FLANGE_GROUPS)) {
    if (group.arms.includes(partId) || group.grippers.includes(partId)) {
      return key;
    }
  }
  return null;
}

// 协议匹配检查
function checkProtocol(armProtocol, gripperProtocol) {
  const armList = armProtocol.split('/').map(s => s.trim().toLowerCase());
  const gripperList = gripperProtocol.split('/').map(s => s.trim().toLowerCase());
  for (const a of armList) {
    for (const g of gripperList) {
      if (a.includes(g) || g.includes(a)) return true;
    }
  }
  return false;
}

// 核心兼容性检查逻辑
function checkCompatibility(armId, gripperId) {
  const arm = ROBOT_ARMS.find(a => a.id === armId);
  const gripper = END_EFFECTORS.find(g => g.id === gripperId);

  if (!arm || !gripper) {
    return { error: '未找到对应的机械臂或夹爪', arm, gripper };
  }

  const armGroup = findFlangeGroup(armId);
  const gripperGroup = findFlangeGroup(gripperId);
  const protocolMatch = checkProtocol(arm.protocol, gripper.protocol);

  let result = {
    robot_arm: `${arm.brand} ${arm.model}`,
    end_effector: `${gripper.brand} ${gripper.model}`,
    arm_id: armId,
    gripper_id: gripperId,
    arm_flange: arm.flange,
    gripper_flange: gripper.flange,
    arm_protocol: arm.protocol,
    gripper_protocol: gripper.protocol,
    arm_voltage: arm.voltage,
    gripper_voltage: gripper.voltage,
    protocol_match: protocolMatch,
    compatible: false,
    direct_mount: false,
    adapter_required: false,
    notes: '',
  };

  if (armGroup === gripperGroup) {
    result.compatible = true;
    result.direct_mount = true;
    result.notes = `可直接安装，无需转接件。${protocolMatch ? '通讯协议兼容。' : '注意：通讯协议不完全匹配（' + arm.protocol + ' / ' + gripper.protocol + '），可能需要协议转换器。'}`;
  } else {
    const adapterKey = `${armGroup}_to_${gripperGroup}`;
    const reverseKey = `${gripperGroup}_to_${armGroup}`;
    const adapter = ADAPTER_PAIRS[adapterKey] || ADAPTER_PAIRS[reverseKey];

    if (adapter) {
      result.compatible = true;
      result.adapter_required = true;
      result.adapter = {
        name: adapter.name,
        stl_id: adapter.stlId,
        stl_url: `https://roboparts.cc/stl/${adapter.stlId}.stl`,
        print_price: STL_DESIGNS.find(s => s.id === adapter.stlId)?.printPrice || 20,
        order_url: `https://roboparts.cc/#stl?id=${adapter.stlId}`,
      };
      result.notes = `需使用转接件「${adapter.name}」。STL 文件可免费下载，平台提供代打印服务（约 ¥${result.adapter.print_price}）。${protocolMatch ? '通讯协议兼容。' : '通讯协议不完全匹配，可能需要适配。'}`;
    } else {
      result.notes = `目前没有已知的转接方案。建议联系平台寻求定制设计支持。`;
    }
  }

  return result;
}

// 推荐评分函数
function scoreRecommendation(gripper, arm, task, budget, preferBrand) {
  let score = 0;
  const reasons = [];

  // 1. 协议兼容性 (40分)
  if (checkProtocol(arm.protocol, gripper.protocol)) {
    score += 40;
    reasons.push('协议兼容');
  } else {
    score += 10;
    reasons.push('协议需适配');
  }

  // 2. 法兰兼容性 (30分)
  const armGroup = findFlangeGroup(arm.id);
  const gripperGroup = findFlangeGroup(gripper.id);
  if (armGroup === gripperGroup) {
    score += 30;
    reasons.push('法兰直接兼容');
  } else if (ADAPTER_PAIRS[`${armGroup}_to_${gripperGroup}`] || ADAPTER_PAIRS[`${gripperGroup}_to_${armGroup}`]) {
    score += 20;
    reasons.push('有现成转接件');
  } else {
    score += 0;
    reasons.push('无现成转接件');
  }

  // 3. 预算 (20分)
  if (gripper.price <= budget) {
    score += 20;
    reasons.push('价格符合预算');
  } else if (gripper.price <= budget * 1.2) {
    score += 10;
    reasons.push('价格略超预算');
  } else {
    score -= 20;
    reasons.push('价格远超预算');
  }

  // 4. 品牌偏好 (10分)
  if (preferBrand && gripper.brand.toLowerCase().includes(preferBrand.toLowerCase())) {
    score += 10;
    reasons.push(`匹配首选品牌 ${preferBrand}`);
  }

  // 5. 任务匹配
  const taskLower = (task || '').toLowerCase();
  if (taskLower.includes('易碎') || taskLower.includes('轻') || taskLower.includes('脆弱')) {
    if (gripper.force.includes('0.5-') || gripper.force.includes('1-') || gripper.category === 'soft-gripper') {
      score += 15;
      reasons.push('低力柔性夹爪，适合易碎品');
    }
  }
  if (taskLower.includes('重') || taskLower.includes('大力') || taskLower.includes('金属')) {
    if (gripper.force.includes('100N') || gripper.force.includes('140N') || gripper.force.includes('150N')) {
      score += 15;
      reasons.push('高力夹爪，适合重物');
    }
  }
  if (taskLower.includes('视觉') || taskLower.includes('相机')) {
    if (gripper.category === 'electric-gripper') {
      score += 5;
      reasons.push('电控夹爪，兼容视觉控制');
    }
  }
  if (taskLower.includes('教育') || taskLower.includes('学习') || taskLower.includes('创客')) {
    if (gripper.price < 1000) {
      score += 10;
      reasons.push('价格亲民，适合教育/创客');
    }
  }

  return { score, reasons };
}

module.exports = {
  ROBOT_ARMS,
  END_EFFECTORS,
  FLANGE_GROUPS,
  ADAPTER_PAIRS,
  STL_DESIGNS,
  findFlangeGroup,
  checkProtocol,
  checkCompatibility,
  scoreRecommendation,
};
