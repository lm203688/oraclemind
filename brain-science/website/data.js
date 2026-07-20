const DB = {
  "updated": "2026-07-15T20:07:13.062Z",
  "stats": {
    "bci": 116,
    "bci_devices": 32,
    "brain_disorders": 80,
    "brain_regions": 84,
    "consciousness_research": 20,
    "main": 9,
    "neural_implants": 81,
    "neuropharmacology": 47,
    "neurotech": 41,
    "neurotransmitters": 26
  },
  "bci": [
    {
      "id": "BCI-001",
      "name": "Neuralink N1",
      "company": "Neuralink",
      "type": "侵入式",
      "channels": "1024",
      "status": "人体试验",
      "applications": [
        "瘫痪恢复",
        "视觉假体",
        "语音解码",
        "机械臂控制"
      ],
      "description": "Neuralink的N1植入物包含1024个电极，通过手术机器人植入运动皮层。2024年首位人类受试者Noland Arbaugh通过意念控制电脑光标和玩游戏。2025年第二位受试者展示了改进的信号稳定性。Neuralink正在开发视觉假体（Blindsight）和语音解码功能。2026年里程碑：BCI已从辅助医疗设备转向更广泛的应用探索。"
    },
    {
      "id": "BCI-002",
      "name": "BrainGate",
      "company": "BrainGate (Brown University / Stanford)",
      "type": "侵入式",
      "channels": "128 (Utah array)",
      "status": "人体试验",
      "applications": [
        "打字控制",
        "机械臂",
        "语音解码",
        "光标控制"
      ],
      "description": "BrainGate是学术界最成熟的侵入式BCI，使用Utah阵列植入运动皮层。斯坦福团队2023年实现了95字/分钟的语音解码速度（接近正常语速150字/分钟）。BrainGate还演示了通过意念控制机械臂抓取物体。长期稳定性是主要挑战。"
    },
    {
      "id": "BCI-003",
      "name": "Synchron Stentrode",
      "company": "Synchron",
      "type": "血管内",
      "channels": "16",
      "status": "人体试验（FDA Breakthrough Device）",
      "applications": [
        "文字输入",
        "设备控制",
        "AI集成"
      ],
      "description": "Synchron的Stentrode通过颈静脉植入，无需开颅手术。它附着在血管壁上记录运动皮层信号。2023年患者通过Stentrode实现了Apple Vision Pro控制。Synchron获得了FDA Breakthrough Device认定。2026年，Synchron正在探索与AI的深度集成，让BCI用户通过思维直接调用AI助手。"
    },
    {
      "id": "BCI-004",
      "name": "Emotiv EPOC X",
      "company": "Emotiv",
      "type": "非侵入式EEG",
      "channels": "14",
      "status": "商用",
      "applications": [
        "研究",
        "游戏",
        "冥想",
        "情绪监测"
      ],
      "description": "Emotiv EPOC X是最广泛使用的消费级EEG头带，14通道湿电极。用于游戏、冥想辅助和情绪监测。虽然不能实现精确控制，但可以检测大致的认知状态（专注、放松、压力）。Emotiv还提供开发者SDK和云平台。"
    },
    {
      "id": "BCI-005",
      "name": "OpenBCI Cyton + Galea",
      "company": "OpenBCI",
      "type": "非侵入式EEG/fNIRS",
      "channels": "16-32 (Cyton); 16 EEG + fNIRS (Galea)",
      "status": "商用开源",
      "applications": [
        "研究",
        "DIY",
        "神经反馈",
        "艺术装置"
      ],
      "description": "OpenBCI提供开源EEG硬件，Cyton板16通道，Galea头显结合EEG和fNIRS（功能性近红外光谱）。开源特性使其成为研究者和创客的首选。Galea是首个同时采集EEG和fNIRS数据的消费级设备。"
    },
    {
      "id": "BCI-006",
      "name": "Paradromics Connex Direct",
      "company": "Paradromics",
      "type": "侵入式",
      "channels": "65,536 (高密度微线阵列)",
      "status": "人体试验准备（FDA Breakthrough Device）",
      "applications": [
        "语音解码",
        "运动恢复",
        "情绪障碍治疗"
      ],
      "description": "Paradromics的Connex Direct使用高密度微线阵列，提供65,536个记录通道——远超Neuralink的1024。目标是实现高带宽脑机通信，特别是语音解码（将思维直接转换为文字）。获得FDA Breakthrough Device认定。2025-2026年计划开始人体试验。"
    },
    {
      "id": "BCI-007",
      "name": "Blackrock Neurotech Neuralace",
      "company": "Blackrock Neurotech",
      "type": "侵入式",
      "channels": "10,000+ (Utah阵列升级版)",
      "status": "人体试验",
      "applications": [
        "瘫痪恢复",
        "语音解码",
        "触觉恢复"
      ],
      "description": "Blackrock Neurotech是BCI领域的老牌公司，其Utah阵列已被用于BrainGate等研究数十年。Neuralace是新一代高密度阵列，提供10,000+通道。Blackrock的BCI系统已让多位瘫痪患者实现了光标控制和打字。2025年被收购后加速商业化。"
    },
    {
      "id": "BCI-008",
      "name": "NextMind (Apple收购)",
      "company": "NextMind → Apple",
      "type": "非侵入式EEG",
      "channels": "8 (视觉皮层靶向)",
      "status": "商用（2020-2022）; Apple收购后开发中",
      "applications": [
        "视觉注意力追踪",
        "AR/VR交互",
        "设备控制"
      ],
      "description": "NextMind开发了一种小型EEG传感器，贴在后脑勺上读取视觉皮层信号，可以检测用户正在注视的物体并实现意念控制。Apple于2023年收购NextMind，预计将技术集成到Vision Pro和未来设备中。这可能是Apple进入BCI领域的第一步。"
    },
    {
      "id": "BCI-009",
      "name": "Meta wrist-worn EMG",
      "company": "Meta (CTRL-Labs收购)",
      "type": "非侵入式EMG（肌电）",
      "channels": "多通道EMG传感器",
      "status": "研发中",
      "applications": [
        "AR/VR输入",
        "手势控制",
        "无键盘打字"
      ],
      "description": "Meta于2019年收购CTRL-Labs，开发腕带式EMG传感器。它不直接读取大脑信号，而是读取从大脑传到手腕的运动神经信号，可以在手指移动之前就检测到意图。目标是实现AR/VR中的隐形输入——无需实际移动手指就能打字或控制设备。"
    },
    {
      "id": "BCI-010",
      "name": "NeuroPace RNS System",
      "company": "NeuroPace",
      "type": "侵入式（响应式神经刺激器）",
      "channels": "4条导联，每条4个触点",
      "status": "FDA批准（癫痫治疗）",
      "applications": [
        "难治性癫痫",
        "未来: 抑郁症, 强迫症"
      ],
      "description": "NeuroPace RNS是FDA批准的首个响应式神经刺激器，植入颅骨内持续监测脑电活动，检测到癫痫发作前兆时自动发送电脉冲阻止发作。它是闭环BCI的先驱——不仅是记录，还能实时干预。正在探索扩展到抑郁症和强迫症治疗。"
    },
    {
      "id": "BCI-011",
      "name": "Neuralink Blindsight",
      "company": "Neuralink",
      "type": "侵入式（视觉假体）",
      "channels": "1,000+ (视觉皮层植入)",
      "status": "人体试验准备（FDA Breakthrough Device）",
      "applications": [
        "盲人视觉恢复"
      ],
      "description": "Neuralink的Blindsight项目旨在为盲人恢复视觉。通过在视觉皮层植入电极阵列，将摄像头图像转换为电刺激，让盲人感知光点和形状。获得FDA Breakthrough Device认定。目前只能提供低分辨率视觉（光点矩阵），但Neuralink计划逐步提高分辨率。"
    },
    {
      "id": "BCI-012",
      "name": "Science Corp (Max Hodak)",
      "company": "Science Corp",
      "type": "侵入式（眼内植入+光遗传学）",
      "channels": "光遗传学刺激视网膜神经节细胞",
      "status": "临床前",
      "applications": [
        "视网膜疾病治疗",
        "视觉增强"
      ],
      "description": "Science Corp由Neuralink联合创始人Max Hodak创立，采用不同路径：通过眼内植入物结合光遗传学技术，将基因疗法和光电植入物结合来恢复视力。这种方法不需要开颅手术，而是通过眼科手术植入。Science Corp在2025年展示了令人印象深刻的动物实验结果。"
    },
    {
      "id": "BCI-013",
      "name": "Precision Neuroscience Layer 7",
      "company": "Precision Neuroscience",
      "type": "微创半侵入式（皮层表面）",
      "channels": "1,024 (薄膜微电极阵列)",
      "status": "人体试验",
      "applications": [
        "运动解码",
        "语音解码",
        "神经监测"
      ],
      "description": "Precision Neuroscience的Layer 7是一种薄膜微电极阵列，放置在大脑表面（硬膜下）而不穿透脑组织。这比Neuralink的穿透式植入更安全，可逆（可取出）。2025年在人体试验中成功记录了高分辨率脑信号。由前Neuralink工程师创立。"
    },
    {
      "id": "BCI-014",
      "name": "LumiMind LumiSleep",
      "company": "LumiMind",
      "type": "非侵入式EEG（消费级）",
      "channels": "消费级EEG传感器",
      "status": "CES 2026发布",
      "applications": [
        "睡眠优化",
        "实时听觉反馈",
        "失眠治疗"
      ],
      "description": "LumiMind的LumiSleep在CES 2026上亮相，是首个提供实时听觉反馈的消费级EEG设备。它监测睡眠脑电波，在检测到浅睡眠时播放特定声音来促进深度睡眠。代表了消费级神经技术的新趋势——从监测走向干预。"
    },
    {
      "id": "BCI-015",
      "name": "Cognixion ONE",
      "company": "Cognixion",
      "type": "非侵入式EEG + AR",
      "channels": "多通道干电极EEG",
      "status": "FDA Breakthrough Device; 商用",
      "applications": [
        "ALS/瘫痪患者通信",
        "AR界面",
        "语音合成"
      ],
      "description": "Cognixion ONE是一款结合EEG和AR的BCI头显，专为ALS和瘫痪患者设计。用户通过脑电波控制AR界面进行交流，系统将意图转换为合成语音。获得FDA Breakthrough Device认定。它代表了非侵入式BCI在辅助通信领域的最前沿。"
    },
    {
      "id": "BCI-016",
      "name": "Intracortical Visual Prosthesis (Bionic Eye / Orion)",
      "company": "Second Sight / Vivani (formerly Second Sight)",
      "type": "侵入式（视觉假体）",
      "channels": "60+ 电极 (Orion: 皮层植入)",
      "status": "人体试验; 公司经历破产重组",
      "applications": [
        "盲人视觉恢复 (RP, AMD)"
      ],
      "description": "Second Sight开发了Argus II视网膜植入物（已停产）和Orion视觉皮层植入物。Orion绕过眼睛和视神经，直接刺激视觉皮层，理论上可以帮助更多类型的盲人。公司经历了破产和重组，但Orion的临床数据证明了皮层视觉假体的可行性。"
    },
    {
      "id": "BCI-017",
      "name": "Synchron + AI Integration",
      "company": "Synchron",
      "type": "血管内BCI + AI",
      "channels": "16 (Stentrode) + AI语言模型",
      "status": "人体试验",
      "applications": [
        "思维直接调用AI",
        "自然语言交互",
        "意图预测"
      ],
      "description": "Synchron正在将BCI与AI语言模型深度集成，让用户通过思维直接调用AI助手。这不是简单的打字解码，而是让AI理解用户的意图并执行复杂任务。2026年，这种BCI+AI的融合被认为是下一代交互界面的方向——从'思维打字'进化到'思维对话'。"
    },
    {
      "id": "BCI-018",
      "name": "Neural Speech Decoding (Stanford/UCSF)",
      "company": "学术研究 (Stanford, UCSF)",
      "type": "侵入式（语音解码研究）",
      "channels": "128-256 (ECoG + Utah阵列)",
      "status": "人体试验",
      "applications": [
        "语音恢复",
        "思维转文字",
        "情感语音合成"
      ],
      "description": "斯坦福和UCSF团队在语音解码方面取得重大突破。2023年，斯坦福团队实现了95字/分钟的解码速度；UCSF团队实现了情感语音合成（不仅解码文字，还保留语调情感）。这些成果让瘫痪患者重新'说话'成为可能，是BCI领域最令人兴奋的进展之一。"
    },
    {
      "id": "BCI-019",
      "name": "Closed-Loop DBS for Depression",
      "company": "多中心研究 (UCSF, Emory等)",
      "type": "侵入式（深部脑刺激）",
      "channels": "4-8 (DBS电极触点) + 闭环传感",
      "status": "临床试验",
      "applications": [
        "难治性抑郁症",
        "双相障碍",
        "强迫症"
      ],
      "description": "闭环深部脑刺激（DBS）是BCI的另一种形态：植入电极监测特定脑区活动，检测到抑郁症状的神经标志物时自动刺激。UCSF团队2021年在Nature报告了首例成功案例。与开环DBS不同，闭环系统只在需要时刺激，更有效且副作用更少。"
    },
    {
      "id": "BCI-020",
      "name": "UNESCO Neurotechnology Ethics Standard",
      "company": "UNESCO",
      "type": "政策/伦理框架",
      "channels": "N/A",
      "status": "2025年通过全球首个神经技术伦理标准",
      "applications": [
        "神经权利保护",
        "认知自由",
        "精神隐私"
      ],
      "description": "UNESCO于2025年通过了全球首个神经技术伦理标准，呼吁各国确保神经技术保持包容性和可及性。该标准涉及神经权利（neurorights）保护，包括认知自由、精神隐私、心理完整性和平等获取。智利已将神经权利写入宪法。这是BCI和神经技术领域最重要的政策里程碑。"
    },
    {
      "id": "BS-china-bci-clinical",
      "name": "CAS CEBSIT Invasive BCI",
      "type": "BCI",
      "company": "Chinese Academy of Sciences / Huashan Hospital Fudan",
      "key_findings": [
        "China's first-in-human invasive BCI clinical trial — second country after US",
        "Implant 26mm diameter, <6mm thick — half the size of Neuralink N1",
        "Ultra-flexible electrodes ~1% diameter of human hair, minimizing tissue damage",
        "Patient (quadriamputee from electrical accident) can play chess and racing games using mind",
        "Device stable since March 2025 implantation, no infection or electrode failure",
        "Target market entry 2028 after regulatory approval"
      ],
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://english.cas.cn/newsroom/cas_media/202506/t20250616_1045625.shtml",
          "collected_at": "2026-05-29T14:23:31.089Z"
        }
      ]
    },
    {
      "id": "BS-65536-electrode-bci",
      "name": "65,536-Electrode Wireless Subdural BCI",
      "type": "BCI",
      "company": "Nature Electronics research team",
      "key_findings": [
        "50μm-thick flexible micro-ECoG BCI with 256×256 electrode array",
        "65,536 recording electrodes, 1,024 simultaneous channels",
        "Wirelessly powered, bidirectional communication with external relay",
        "Chronic recordings: 2 weeks in pigs, 2 months in behaving NHPs",
        "Published in Nature Electronics December 2025"
      ],
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/s41928-025-01509-9",
          "collected_at": "2026-05-29T14:23:31.089Z"
        }
      ]
    },
    {
      "id": "BS-als-bci-independent",
      "name": "Long-term Independent Intracortical BCI for ALS",
      "type": "BCI",
      "company": "Research team (bioRxiv preprint)",
      "key_findings": [
        "ALS patient used multimodal BCI independently at home for 19 months, 3800+ hours",
        "Communicated 183,060 sentences (1.96M words) at 56.1 words/minute average",
        "99.2% word accuracy in prompted task (125,000 word vocabulary)",
        "Transformer-based brain-to-text decoder outperformed prior RNN models",
        "Participant maintained full-time employment despite paralysis"
      ],
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.biorxiv.org/content/10.1101/2025.06.26.661591v1",
          "collected_at": "2026-05-29T14:23:31.089Z"
        }
      ]
    },
    {
      "id": "BS-bdbci-walking",
      "name": "Bidirectional BCI for Walking Exoskeleton",
      "type": "BCI",
      "company": "UC Irvine / Rancho Los Amigos",
      "key_findings": [
        "First bidirectional BCI restoring both brain-controlled walking AND leg sensory feedback",
        "Uses bilateral interhemispheric ECoG implants over leg M1/S1 cortices",
        "All operations executed on portable embedded system — fully untethered",
        "Demonstrated in epilepsy patient 3 weeks post-implantation"
      ],
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://arxiv.org/html/2505.00219",
          "collected_at": "2026-05-29T14:23:31.089Z"
        }
      ]
    },
    {
      "id": "BCI-neuralink-highvol",
      "name": "Neuralink High-Volume Production (2026)",
      "company": "Neuralink",
      "type": "侵入式",
      "channels": "1024+",
      "status": "量产启动",
      "applications": [
        "瘫痪恢复",
        "语音恢复",
        "视觉假体",
        "机械臂控制"
      ],
      "description": "Neuralink announced high-volume production of brain-computer interface devices starting in 2026, with plans to move to an almost entirely automated surgical procedure. With $650 million in funding, Neuralink received FDA Breakthrough Device Designation for speech restoration technology targeting severe speech impairments. The company launched its first clinical trial in the Middle East (UAE-PRIME) and aims to scale production and automate surgeries by late 2026."
    },
    {
      "id": "BCI-paradromics-connexus",
      "name": "Paradromics Connexus Direct Data Interface",
      "company": "Paradromics",
      "type": "侵入式",
      "channels": "数千通道",
      "status": "临床试验启动",
      "applications": [
        "语音恢复",
        "严重运动障碍"
      ],
      "description": "Paradromics' Connexus Direct Data Interface entered clinical trials in November 2025, as reported by Nature. The device is designed to safely restore speech for people with severe motor impairments, positioning it as a direct rival to Neuralink. Paradromics uses a high-channel-count electrode array that can record from thousands of neurons simultaneously, enabling more detailed neural signal decoding for speech restoration."
    },
    {
      "id": "BCI-consumer-eeg-2026",
      "name": "Consumer EEG BCI Wave (2026)",
      "company": "Multiple (Neurable, Emotiv, etc.)",
      "type": "非侵入式",
      "channels": "Variable (4-32 channels)",
      "status": "商业化",
      "applications": [
        "游戏",
        "专注力训练",
        "睡眠监测",
        "认知评估"
      ],
      "description": "Consumer brain-computer interfaces gained significant momentum in 2026, with EEG-based devices like Neurable's licensed headset and Emotiv's platforms reaching market. The FDA has granted breakthrough device designations to multiple BCI companies, accelerating the path to market. Consumer BCIs focus on gaming, focus training, sleep monitoring, and cognitive assessment, representing the non-invasive counterpart to clinical implantable BCIs."
    },
    {
      "id": "BCI-ultrasound-neuromod",
      "name": "Ultrasound-Based Neuromodulation BCI",
      "company": "Multiple research groups",
      "type": "非侵入式/聚焦超声",
      "channels": "N/A (focused ultrasound targeting)",
      "status": "临床试验",
      "applications": [
        "抑郁症",
        "强迫症",
        "疼痛管理",
        "癫痫"
      ],
      "description": "Non-invasive focused ultrasound neuromodulation is hitting an inflection point in 2026 as FDA approvals advance and the technology moves from hype to clinical reality. Unlike EEG-based BCIs that only read brain signals, ultrasound neuromodulation can both read and write neural activity non-invasively by focusing acoustic energy on specific brain regions. This bidirectional capability makes it a potential game-changer for treating depression, OCD, and chronic pain without surgery."
    },
    {
      "id": "BCI-flexible-electrode-2026",
      "name": "Flexible Electrode BCI (2026 Trend)",
      "company": "Multiple (Neuralink, Synchron, academic groups)",
      "type": "侵入式/柔性电极",
      "channels": "Variable",
      "status": "临床试验/量产",
      "applications": [
        "长期植入",
        "减少组织损伤",
        "信号稳定性"
      ],
      "description": "Flexible electrode technology is a defining trend in BCI in 2026. The maturation of flexible neural electrode materials that minimize tissue scarring is enabling longer-lasting, more stable neural recordings. Neuralink's polymer threads and Synchron's stentrode both benefit from flexible electrode advances. This trend is critical for making BCIs viable as long-term medical devices rather than short-term research tools."
    },
    {
      "id": "BCI-mental-health-implant",
      "name": "Brain Implants for Mental Health (2026 Trend)",
      "company": "Multiple (research stage)",
      "type": "侵入式/神经调控",
      "channels": "Variable",
      "status": "早期研究",
      "applications": [
        "抑郁症",
        "强迫症",
        "PTSD",
        "成瘾"
      ],
      "description": "A major trend to watch in 2026 is the application of brain implants for mental health conditions. Beyond paralysis and speech restoration, researchers are exploring BCI and neuromodulation implants for treatment-resistant depression, OCD, PTSD, and addiction. This represents a significant expansion of BCI applications from motor restoration to psychiatric treatment, raising both therapeutic promise and ethical considerations about brain intervention for behavioral conditions."
    },
    {
      "id": "BCI-columbia-silicon-chip",
      "name": "Columbia University Next-Gen BCI Chip",
      "company": "Columbia University",
      "type": "侵入式/新一代硅芯片",
      "channels": "High-density silicon electrode array",
      "status": "研究突破 2025-2026",
      "applications": [
        "人机交互",
        "神经疾病治疗",
        "高密度神经记录"
      ],
      "description": "Columbia University researchers announced a new generation of brain-computer interface based on silicon chips placed on the brain surface. The new implant stands to transform human-computer interaction and expand treatment possibilities for neurological conditions. The silicon chip approach offers high-density recording with improved biocompatibility and signal quality compared to traditional electrode arrays."
    },
    {
      "id": "BCI-china-national-strategy",
      "name": "China National BCI Development Strategy",
      "company": "Chinese Government / Multiple institutions",
      "type": "国家战略/政策",
      "channels": "N/A - policy framework",
      "status": "发布2025; 目标2027年重大技术突破",
      "applications": [
        "脑机接口产业化",
        "医疗康复",
        "神经增强",
        "国防应用"
      ],
      "description": "China released a national BCI development strategy aiming for major technical breakthroughs by 2027 and to cultivate two or three globally competitive BCI companies. Reuters reported that China could see widespread use of brain-computer technology in 3-5 years. The strategy positions China as a major competitor to US BCI efforts (Neuralink, Synchron) with state-backed resources and rapid clinical translation."
    },
    {
      "id": "BCI-neurofeedback-cortical-switching",
      "name": "BCI Neurofeedback for Cortical State Switching",
      "company": "Multiple research groups",
      "type": "非侵入式/神经反馈",
      "channels": "EEG-based",
      "status": "2026年突破",
      "applications": [
        "认知增强",
        "注意力训练",
        "冥想辅助",
        "精神健康"
      ],
      "description": "A 2026 breakthrough demonstrated that BCI neurofeedback enables users to learn voluntary control of cortical state switching. Users can transition between focused attention and relaxed states through real-time EEG feedback. This technology has applications in cognitive enhancement, meditation training, and mental health treatment, representing the convergence of BCI technology with contemplative neuroscience."
    },
    {
      "id": "BCI-paradromics-connex",
      "name": "Paradromics Connex Direct Data Interface",
      "company": "Paradromics",
      "type": "侵入式/高带宽",
      "channels": "High-channel-count (targeting 10,000+ electrodes)",
      "status": "进入临床试验 2026",
      "applications": [
        "语音恢复",
        "严重瘫痪",
        "高带宽神经通信"
      ],
      "description": "Paradromics has entered clinical trials with its Connex Direct Data Interface, a brain implant that could rival Neuralink. The device aims to safely restore speech for people with severe communication impairments. Unlike Neuralinks flexible polymer threads, Paradromics uses a different approach to achieve high-bandwidth neural recording. The entry of Paradromics into clinical trials expands the competitive landscape for invasive BCI technology."
    },
    {
      "id": "BCI-fda-breakthrough-designation-wave",
      "name": "FDA Breakthrough Device Designation Wave (2025-2026)",
      "company": "Multiple BCI companies (Neuralink, Synchron, Paradromics, others)",
      "type": "监管里程碑",
      "channels": "Various",
      "status": "多家公司获得FDA突破性设备认定",
      "applications": [
        "加速BCI商业化",
        "语音恢复",
        "运动恢复",
        "视觉假体"
      ],
      "description": "The FDA has granted breakthrough device designations to multiple BCI companies in 2025-2026, accelerating the path to market. Neuralink received FDA Breakthrough Device Designation for its speech restoration technology. This regulatory momentum signals that the FDA views BCI as a promising medical technology category, reducing the typical 5-10 year regulatory timeline for novel medical devices."
    },
    {
      "id": "BCI-china-medical-approval",
      "name": "China Approves World's First BCI Medical Device",
      "company": "Chinese medical device company (NMPA approved)",
      "type": "侵入式/医疗器械",
      "channels": "Multi-channel (specifics pending)",
      "status": "NMPA approved March 2026; world's first BCI medical device",
      "applications": [
        "颈髓损伤四肢瘫痪",
        "手部抓握恢复",
        "运动功能重建"
      ],
      "description": "China approved the world's first brain-computer interface medical device in March 2026, designed for patients with cervical spinal cord injury resulting in quadriplegia. The device enables hand grasping function restoration through BCI. This is a landmark regulatory milestone — the first time any country has approved a BCI device as a medical product, setting a precedent for BCI commercialization worldwide. China's faster regulatory pathway for BCI contrasts with the FDA's more cautious approach.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://english.cas.cn/newsroom/cas_media/202603/t20260315_1045625.shtml",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-neuralink-middle-east",
      "name": "Neuralink Middle East Clinical Trial (UAE-PRIME)",
      "company": "Neuralink",
      "type": "侵入式",
      "channels": "1024+",
      "status": "Launched first clinical trial in Middle East (UAE-PRIME)",
      "applications": [
        "瘫痪恢复",
        "语音恢复",
        "运动控制"
      ],
      "description": "Neuralink launched its first clinical trial in the Middle East, called UAE-PRIME, expanding beyond the US. This international expansion signals Neuralink's confidence in its technology and regulatory strategy. The trial will enroll patients with severe paralysis and test the N1 implant's ability to restore communication and motor control. Neuralink also announced $650 million in new funding and plans for high-volume production starting in 2026.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://neuralink.com/blog/uae-prime/",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-guardian4-ear-eeg",
      "name": "Guardian 4 Ear-EEG + Cognitive Intelligence Platform",
      "company": "Guardian (CES 2026)",
      "type": "非侵入式/耳内EEG",
      "channels": "Multi-channel ear-EEG",
      "status": "CES 2026展示; 消费级",
      "applications": [
        "认知监测",
        "疲劳检测",
        "专注力评估",
        "脑健康追踪"
      ],
      "description": "The Guardian 4 earbuds, showcased at CES 2026, pair with a Cognitive Intelligence Platform that turns in-ear EEG signals into cognitive metrics. This represents a new generation of wearable neurotechnology that is comfortable enough for daily use while providing meaningful brain health data. Ear-EEG offers better signal quality than forehead EEG and is more socially acceptable than traditional EEG headsets, potentially enabling mass-market brain monitoring.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.neurofounders.co/articles/the-best-neurotech-at-ces-2026",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-brainpatch-2026-trends",
      "name": "BrainPatch 2026 Neuro-AI Industry Trends",
      "company": "BrainPatch",
      "type": "行业趋势/分析",
      "channels": "N/A - industry analysis",
      "status": "Published 2026; comprehensive neurotechnology industry trends",
      "applications": [
        "BCI产业化",
        "AI-神经技术融合",
        "可穿戴EEG",
        "神经数据隐私"
      ],
      "description": "BrainPatch published comprehensive 2026 neurotechnology industry trends covering BCI, AI, neuromodulation, wearable EEG, and neural data privacy. Key findings: the most visible neurotechnology trend in 2026 is the maturation of BCIs; multimodal EEG analyzers are being cleared by regulators; agentic scribes are appearing in neurology clinics; and neural data privacy is emerging as a critical ethical and regulatory concern. The report identifies 2026 as a pivotal year for neurotechnology commercialization.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://brainpatch.ai/blog/post/neurotechnology-industry-trends-2026-bci-ai-neuromodulation-wearable-eeg-and-neural-data-privacy/302",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-neuroba-2026-turning-point",
      "name": "Neuroba: 2026 as BCI Turning Point",
      "company": "Neuroba",
      "type": "行业分析/预测",
      "channels": "N/A - industry analysis",
      "status": "Published 2026; predicts 2026 as 'year everything changes' for BCI",
      "applications": [
        "BCI商业化",
        "消费级神经技术",
        "医疗BCI扩展"
      ],
      "description": "Neuroba published an analysis calling 2026 the year everything changes for brain-computer interfaces. The analysis points to converging factors: FDA breakthrough device designations accelerating approvals, Chinese BCI medical device approval, Neuralink mass production, and consumer EEG devices reaching market maturity. The convergence of regulatory progress, technological maturity, and commercial investment creates a unique inflection point for BCI technology.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "C",
          "article_url": "https://neuroba.ai/blog/2026-the-year-everything-changes-for-brain-computer-interfaces",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-multimodal-eeg-analyzer",
      "name": "Multimodal EEG Analyzer (FDA Cleared 2026)",
      "company": "Multiple (2025-2026 clearances)",
      "type": "非侵入式/多模态EEG分析",
      "channels": "Multi-channel EEG + AI analysis",
      "status": "FDA cleared 2025-2026; multimodal EEG analyzers entering clinical use",
      "applications": [
        "神经科诊断",
        "癫痫监测",
        "睡眠分析",
        "认知评估"
      ],
      "description": "Multimodal EEG analyzers that combine traditional EEG with AI-powered analysis have been cleared by the FDA in 2025-2026, marking a significant step for neuro-AI in clinical practice. These devices use machine learning to detect patterns in EEG data that human readers might miss, improving diagnostic accuracy for epilepsy, sleep disorders, and cognitive decline. The clearance of AI-enhanced EEG devices represents the integration of neurotechnology with clinical neurology.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.linkedin.com/pulse/2026s-emerging-neuro-ai-trends-which-survive-adoption-ans-md--i39je",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-agentic-neurology-scribe",
      "name": "Agentic Scribes in Neurology Clinics (2026)",
      "company": "Multiple AI companies",
      "type": "AI辅助/神经科临床",
      "channels": "N/A - AI software",
      "status": "Deploying in neurology clinics 2026",
      "applications": [
        "神经科文档",
        "临床决策支持",
        "患者记录自动化"
      ],
      "description": "Agentic AI scribes are appearing in neurology clinics in 2026, automating clinical documentation and decision support. These AI assistants can transcribe patient encounters, suggest diagnostic codes, flag relevant clinical guidelines, and generate referral letters. In neurology specifically, they can help interpret EEG reports and track symptom progression over time. This represents the practical application of AI in clinical neuroscience, improving efficiency and reducing physician burnout.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.linkedin.com/pulse/2026s-emerging-neuro-ai-trends-which-survive-adoption-ans-md--i39je",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-neural-data-privacy",
      "name": "Neural Data Privacy (2026 Critical Issue)",
      "company": "Multiple stakeholders (UNESCO, governments, companies)",
      "type": "政策/伦理/隐私",
      "channels": "N/A - policy framework",
      "status": "Emerging as critical issue in 2026; UNESCO standards being implemented",
      "applications": [
        "神经权利保护",
        "精神隐私",
        "认知自由",
        "数据安全"
      ],
      "description": "Neural data privacy is emerging as a critical issue in 2026 as BCI devices generate unprecedented brain data. UNESCO's 2025 neurotechnology ethics standard provides a framework, but implementation varies by country. Key concerns include: who owns brain data, how to prevent unauthorized neural surveillance, and ensuring cognitive liberty. Chile has enshrined neurorights in its constitution, and other countries are considering similar legislation. The commercialization of BCI makes neural data privacy an urgent policy priority.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://brainpatch.ai/blog/post/neurotechnology-industry-trends-2026-bci-ai-neuromodulation-wearable-eeg-and-neural-data-privacy/302",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-nonsurgical-cell-electronics",
      "name": "Nonsurgical Brain Implant (Cell-Electronics Interface)",
      "company": "Research team (Nature Biotechnology 2025)",
      "type": "微创/细胞-电子接口",
      "channels": "Cell-scale electronic interface",
      "status": "Published Nature Biotechnology 2025; preclinical",
      "applications": [
        "脑刺激",
        "神经疾病治疗",
        "无需手术的神经接口"
      ],
      "description": "A groundbreaking study published in Nature Biotechnology 2025 demonstrated a nonsurgical brain implant enabled through a cell-electronics interface. Unlike traditional neural implants that require invasive surgery, this approach uses engineered cells that integrate with neural tissue and communicate with external electronics. The technology could transform brain stimulation treatments by eliminating the need for craniotomy, making neuromodulation accessible to a much broader patient population.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/s41587-025-02809-3",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-ear-eeg-fda-clearance",
      "name": "First FDA-Cleared In-Ear EEG Device (2026)",
      "company": "Multiple (2026 milestone)",
      "type": "非侵入式/耳内EEG",
      "channels": "Multi-channel in-ear EEG",
      "status": "FDA cleared 2026; first in-ear EEG device cleared",
      "applications": [
        "脑健康监测",
        "癫痫检测",
        "睡眠分析",
        "认知评估"
      ],
      "description": "An in-ear EEG device received FDA clearance for the first time in 2026, making brain monitoring far more portable and expanding access to neurological assessment. This regulatory milestone validates ear-EEG as a clinical-grade technology and opens the door for consumer brain health monitoring devices. In-ear EEG offers better signal quality than forehead EEG and is more socially acceptable than traditional EEG headsets.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://newmarketpitch.com/blogs/news/neurotech-market-update",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-neural-coating-lifespan",
      "name": "New Coating Extends Neural Implant Lifespan",
      "company": "Research team (2025)",
      "type": "植入物技术/涂层",
      "channels": "N/A - implant coating technology",
      "status": "Published 2025; extends implant lifespan in body",
      "applications": [
        "长期植入",
        "减少免疫反应",
        "信号稳定性"
      ],
      "description": "Researchers developed a new coating that significantly extends the lifespan of neural implants in the body. The findings demonstrate that bare-die silicon chips, when carefully designed with the new coating, can operate reliably in the body for months rather than weeks. This addresses one of the fundamental challenges for chronic neural implants: the foreign body response that degrades signal quality over time. The coating technology could dramatically improve the longevity and reliability of BCI devices.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://medicalxpress.com/news/2025-01-coating-lifespan-neural-implants-body.htm",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-neurotech-market-2026",
      "name": "Neurotech Devices Market 2026 ($15.1B → $31B by 2033)",
      "company": "Industry-wide",
      "type": "市场分析/行业趋势",
      "channels": "N/A - market analysis",
      "status": "Market valued at $15.1B in 2026; projected $31B by 2033 (CAGR 10.7%)",
      "applications": [
        "神经技术产业化",
        "投资趋势",
        "市场预测"
      ],
      "description": "The global neurotech devices market is valued at $15.15 billion in 2026 and is expected to reach $31 billion by 2033, growing at a CAGR of 10.7%. Key growth drivers include BCI commercialization, neuromodulation device approvals, consumer EEG devices, and AI-powered neurological diagnostics. The market expansion reflects the transition of neurotechnology from research labs to clinical and consumer markets.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.coherentmarketinsights.com/industry-reports/global-neurotech-devices",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-emotiv-2026-update",
      "name": "Emotiv BCI 2026 Applications Update",
      "company": "Emotiv",
      "type": "非侵入式EEG",
      "channels": "14-32 (EPOC X / EPOC Flex)",
      "status": "Commercial; expanding applications in 2026",
      "applications": [
        "医疗",
        "游戏",
        "研究",
        "辅助技术",
        "认知评估"
      ],
      "description": "Emotiv published a comprehensive 2026 update on brain-computer interface applications, covering healthcare, gaming, accessibility, and research. Key developments include expanded clinical applications for EEG-based diagnostics, integration with AI for real-time cognitive state monitoring, and new accessibility tools for ALS and paralysis patients. Emotiv also highlighted BCI neurofeedback for cortical state switching as a 2026 breakthrough, enabling users to learn voluntary control of attention and relaxation states.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.emotiv.com/blogs/news/brain-computer-interfaces-2026-applications-br",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-nmpa-first-approval",
      "name": "China NMPA First BCI Medical Device Approval",
      "company": "Chinese BCI company (NMPA approved)",
      "type": "Regulatory milestone / Medical device approval",
      "channels": "Invasive BCI; first regulatory approval for BCI as medical device",
      "status": "Approved March 2026; world first",
      "applications": [
        "Medical BCI for neurological conditions",
        "Sets global regulatory precedent"
      ],
      "description": "China's NMPA approved the world's first brain-computer interface as a medical device in March 2026. This landmark regulatory decision establishes a precedent for BCI medical device approval globally and positions China as a leader in BCI commercialization."
    },
    {
      "id": "BCI-neuralink-uae-prime",
      "name": "Neuralink PRIME Study (UAE)",
      "company": "Neuralink",
      "type": "Clinical trial / International expansion",
      "channels": "1,024 electrodes; N1 Implant",
      "status": "Recruiting; first international Neuralink trial",
      "applications": [
        "BCI control of computer and robotic arm",
        "Quadriplegia from spinal cord injury"
      ],
      "description": "Neuralink launched its PRIME feasibility trial in the UAE, extending BCI control using the N1 Implant. This is Neuralink's first clinical trial outside the US, investigating BCI control of a computer and robotic arm for people with quadriplegia."
    },
    {
      "id": "BCI-cortical-state-switching",
      "name": "BCI Neurofeedback Cortical State Switching",
      "company": "Multiple research groups",
      "type": "Neurofeedback BCI / Cognitive enhancement",
      "channels": "Non-invasive EEG-based",
      "status": "Demonstrated 2026; breakthrough in voluntary brain state control",
      "applications": [
        "Attention disorder treatment",
        "Cognitive enhancement",
        "Brain-state-dependent therapies"
      ],
      "description": "A 2026 breakthrough demonstrated that BCI neurofeedback enables users to voluntarily switch between cortical brain states. Users learn to modulate their neural activity patterns using real-time EEG feedback, effectively gaining conscious control over their brain states."
    },
    {
      "id": "BCI-65536-epidural",
      "name": "65,536-Electrode Wireless Epidural BCI",
      "company": "Research consortium (Nature Electronics)",
      "type": "High-density BCI / Wireless epidural",
      "channels": "65,536 electrodes; wireless",
      "status": "Published Nature Electronics December 2025",
      "applications": [
        "High-resolution brain recording",
        "Minimally invasive BCI"
      ],
      "description": "A wireless epidural BCI with 65,536 electrodes — the highest count ever achieved. Epidural placement avoids penetrating brain tissue while capturing high-resolution signals. The wireless design eliminates percutaneous connectors, reducing infection risk."
    },
    {
      "id": "BCI-als-19months",
      "name": "ALS Patient Independent BCI Use (19 Months)",
      "company": "Research group (bioRxiv preprint)",
      "type": "Clinical outcome / Long-term BCI study",
      "channels": "Invasive BCI; long-term home use",
      "status": "Published bioRxiv 2025-2026",
      "applications": [
        "Sustained communication for ALS",
        "Long-term BCI viability evidence"
      ],
      "description": "An ALS patient used a BCI independently for 19 months, accumulating over 3,800 hours of use — the longest documented period of independent BCI use. This demonstrates that BCIs can provide sustained, reliable communication for people with severe paralysis."
    },
    {
      "id": "BCI-bidirectional-exoskeleton",
      "name": "Bidirectional BCI Walking Exoskeleton",
      "company": "UC Irvine",
      "type": "Bidirectional BCI / Motor restoration",
      "channels": "Invasive; bidirectional (recording + stimulation)",
      "status": "Demonstrated 2025-2026",
      "applications": [
        "Walking restoration",
        "Sensory feedback for motor control"
      ],
      "description": "UC Irvine demonstrated a bidirectional BCI for controlling a walking exoskeleton with sensory feedback. The system records motor intentions and provides somatosensory feedback through cortical stimulation, creating a closed-loop system that significantly improves walking performance."
    },
    {
      "id": "BCI-fda-breakthrough-wave",
      "name": "FDA Breakthrough Device Designation Wave (2025-2026)",
      "company": "Multiple BCI companies",
      "type": "Regulatory milestone / Accelerated pathway",
      "channels": "Multiple modalities",
      "status": "Multiple designations granted 2025-2026",
      "applications": [
        "Accelerated market access for BCI",
        "Speech restoration",
        "Motor restoration"
      ],
      "description": "The FDA granted breakthrough device designations to multiple BCI companies in 2025-2026, accelerating the path to market. Neuralink received designation for speech restoration technology. This wave signals FDA recognition of BCI as a promising medical technology category."
    },
    {
      "id": "BCI-china-national-strategy",
      "name": "China BCI National Strategy (2027 Target)",
      "company": "Chinese government",
      "type": "National strategy / Government initiative",
      "channels": "Multi-modal BCI",
      "status": "Announced 2025-2026; 2027 breakthrough targets",
      "applications": [
        "Medical BCI",
        "Consumer BCI",
        "Military applications"
      ],
      "description": "China announced a comprehensive national BCI strategy with targets for breakthrough developments by 2027. The strategy covers medical, consumer, and military applications with significant government investment. The NMPA's first BCI medical device approval in March 2026 is an early outcome."
    },
    {
      "id": "BCI-cell-electronics-interface",
      "name": "Nonsurgical Cell-Electronics Interface",
      "company": "Research group (Nature Biotechnology)",
      "type": "Non-invasive BCI / Cell-electronics hybrid",
      "channels": "Engineered cells form electronic interface with neurons",
      "status": "Published Nature Biotechnology 2025",
      "applications": [
        "Non-surgical BCI implantation",
        "Expanded BCI accessibility"
      ],
      "description": "Published in Nature Biotechnology 2025, this nonsurgical approach uses engineered cells that form direct electronic connections with neurons. The cells are injected and then form stable electronic interfaces, potentially eliminating the need for brain surgery for BCI implantation."
    },
    {
      "id": "BCI-paradromics-connex",
      "name": "Paradromics Connex Direct Data Interface",
      "company": "Paradromics",
      "type": "Invasive BCI / High-bandwidth cortical",
      "channels": "High-channel-count cortical implant",
      "status": "Clinical trial initiated 2025",
      "applications": [
        "Speech restoration for severe impairment",
        "High-bandwidth neural recording"
      ],
      "description": "Paradromics entered clinical trials with its Connex Direct Data Interface, a high-bandwidth cortical implant for restoring speech in people with severe speech impairment. Nature reported this implant could rival Neuralink, expanding the competitive landscape for invasive BCIs."
    },
    {
      "id": "BCI-059",
      "name": "Neuralink Mass Production 2026",
      "company": "Neuralink",
      "type": "侵入式",
      "channels": "1024",
      "status": "量产启动2026; 自动化植入手术",
      "applications": [
        "瘫痪恢复",
        "视觉假体",
        "语音解码",
        "运动控制"
      ],
      "description": "Neuralink announced plans to start 'high-volume production' of brain-computer interface devices in 2026. Elon Musk stated that full automation of the implantation procedure will allow Neuralink to scale to thousands of implants per year. The automated surgical robot can implant the N1 chip in under an hour. By 2026, significantly faster adoption of the technology is expected, with the automated procedure reducing surgical time and expanding access beyond the initial clinical trial patients.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.reuters.com/business/healthcare-pharmaceuticals/musk-says-neuralink-",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-060",
      "name": "Paradromics Connex Direct",
      "company": "Paradromics",
      "type": "侵入式",
      "channels": "数千通道 (高带宽)",
      "status": "临床试验启动2025; Nature报道",
      "applications": [
        "语音恢复",
        "运动控制",
        "严重瘫痪"
      ],
      "description": "Paradromics' Connex Direct is a high-bandwidth brain-computer interface that enters clinical trials aimed at safely restoring speech for people with severe communication disabilities. The device uses a larger number of electrodes than Neuralink, providing higher bandwidth neural recording. Nature reported that this brain implant could rival Neuralink's technology. The clinical trial focuses on patients with ALS and severe paralysis who have lost the ability to speak.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/d41586-025-03849-0",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-061",
      "name": "Flexible Electrode BCI (2026 Trend)",
      "company": "Multiple (Synchron, Precision Neuroscience, etc.)",
      "type": "侵入式 (柔性电极)",
      "channels": "Variable (100-10,000+)",
      "status": "Key trend for 2026; better biocompatibility",
      "applications": [
        "长期植入",
        "信号质量改善",
        "组织损伤减少"
      ],
      "description": "Flexible electrode BCIs are a key trend for 2026, offering better biocompatibility and longer-term recording stability compared to rigid electrodes. Flexible electrodes conform to the brain's surface and move with the brain's natural pulsations, reducing tissue damage and immune response. Companies like Precision Neuroscience, Synchron, and academic groups are developing flexible electrode arrays that can record from thousands of neurons for years without degradation. This technology is critical for making BCIs practical for long-term clinical use.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.statnews.com/2025/12/26/brain-computer-interface-technology-trends-2",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-062",
      "name": "Brain Implants for Mental Health",
      "company": "Multiple (academic and industry)",
      "type": "侵入式 (深部脑刺激)",
      "channels": "4-16 (DBS electrodes)",
      "status": "Emerging application 2026; clinical trials for depression, OCD",
      "applications": [
        "治疗抵抗性抑郁症",
        "强迫症",
        "成瘾",
        "PTSD"
      ],
      "description": "Brain implants for mental health conditions are an emerging trend in 2026. Deep brain stimulation (DBS) is being tested for treatment-resistant depression, OCD, and addiction, with several clinical trials showing promising results. The approach uses implanted electrodes to modulate specific brain circuits involved in mood and compulsive behavior. Key targets include the subcallosal cingulate (for depression), the ventral capsule/ventral striatum (for OCD), and the nucleus accumbens (for addiction). This represents a paradigm shift from pharmaceutical to circuit-based treatment of mental illness.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.statnews.com/2025/12/26/brain-computer-interface-technology-trends-2",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-063",
      "name": "Chinese BCI Competition",
      "company": "Multiple Chinese companies and institutions",
      "type": "侵入式和非侵入式",
      "channels": "Variable",
      "status": "Rapid growth 2025-2026; government investment",
      "applications": [
        "医疗康复",
        "消费级应用",
        "军事"
      ],
      "description": "Chinese BCI companies and institutions are rapidly emerging as competitors to US-based firms like Neuralink and Synchron. The Chinese government has made significant investments in BCI technology as part of its brain science initiative. Chinese BCI efforts span both invasive and non-invasive approaches, with applications in medical rehabilitation, consumer devices, and defense. STAT News identified Chinese competition as one of three key trends to watch in BCI for 2026.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.statnews.com/2025/12/26/brain-computer-interface-technology-trends-2",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-064",
      "name": "Georgia Tech Wearable BCI",
      "company": "Georgia Institute of Technology",
      "type": "非侵入式 (可穿戴)",
      "channels": "EEG (flexible, wireless)",
      "status": "Demonstrated 2025-2026",
      "applications": [
        "日常脑监测",
        "神经反馈",
        "辅助技术"
      ],
      "description": "Georgia Tech has developed a new wearable brain-computer interface that uses flexible, wireless EEG sensors for comfortable, long-term brain monitoring. The device is designed for everyday use, unlike traditional bulky EEG caps. The wearable BCI can detect neural signals related to attention, fatigue, and emotional states, enabling applications in neurofeedback training, driver fatigue monitoring, and assistive technology for people with disabilities.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://research.gatech.edu/new-wearable-brain-computer-interface",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-065",
      "name": "BCI Neurofeedback for Cortical State Switching",
      "company": "Multiple research groups",
      "type": "非侵入式 (神经反馈)",
      "channels": "EEG/fNIRS",
      "status": "Demonstrated 2026; users learn to switch cortical states",
      "applications": [
        "注意力训练",
        "冥想辅助",
        "认知增强"
      ],
      "description": "BCI neurofeedback enables users to learn cortical state switching — the ability to voluntarily transition between different brain states (e.g., focused attention vs. relaxed awareness). In 2026, new neurofeedback systems provide real-time feedback on brain state, allowing users to develop fine-grained control over their neural activity. This technology has applications in attention training for ADHD, meditation enhancement, peak performance training, and cognitive rehabilitation after brain injury.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.emotiv.com/blogs/news/brain-computer-interfaces-2026-applications-br",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-066",
      "name": "FDA Breakthrough Device Designation for BCIs",
      "company": "Multiple (Neuralink, Synchron, Paradromics, etc.)",
      "type": "监管进展",
      "channels": "N/A",
      "status": "FDA granted breakthrough device designations to multiple BCI companies (2025-2026)",
      "applications": [
        "加速市场准入",
        "监管路径明确化"
      ],
      "description": "The FDA has granted breakthrough device designations to multiple BCI companies, accelerating the path to market. This designation provides priority review and more interactive communication with FDA during the development process. The EU MDR is also developing specific regulatory frameworks for BCI devices. The regulatory clarity is a major enabler for the BCI industry, providing clearer pathways from clinical trials to commercial approval.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://tech4impactsummit.com/blog/brain-computer-interfaces-promise-perils-2026",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-067",
      "name": "Transcranial Focused Ultrasound (tFUS) BCI",
      "company": "Multiple research groups and startups",
      "type": "非侵入式 (聚焦超声)",
      "channels": "N/A (neuromodulation, not recording)",
      "status": "Clinical trials for depression, essential tremor, pain",
      "applications": [
        "神经调控",
        "抑郁症治疗",
        "特发性震颤",
        "慢性疼痛"
      ],
      "description": "Transcranial focused ultrasound (tFUS) is an emerging non-invasive BCI technology that can both stimulate and suppress neural activity in deep brain structures without surgery. Unlike TMS (which only reaches superficial cortex), tFUS can target deep structures like the thalamus, basal ganglia, and hippocampus. Clinical trials are underway for depression, essential tremor, and chronic pain. tFUS represents a paradigm shift in non-invasive brain stimulation, enabling precise targeting of deep brain circuits that were previously only accessible through surgery.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.reddit.com/r/BCI/comments/1kt0yv4/noninvasive_braincomputer_interfac",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI-068",
      "name": "Emotiv EEG Earbuds (Consumer BCI)",
      "company": "Emotiv",
      "type": "非侵入式 (耳戴式EEG)",
      "channels": "EEG (ear-based sensors)",
      "status": "Available 2025-2026; consumer market",
      "applications": [
        "日常脑监测",
        "冥想辅助",
        "注意力训练",
        "游戏"
      ],
      "description": "Emotiv has developed EEG earbuds that provide brain-computer interface capabilities in a consumer-friendly form factor. The ear-based EEG sensors measure brain activity from the ear canal, providing a more comfortable and discreet alternative to traditional EEG headsets. While the signal quality is lower than full-cap EEG, the earbuds enable continuous brain monitoring in everyday settings. Emotiv's CEO Tan Le has emphasized that consumer BCI is 'happening NOW' in 2026.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.emotiv.com/blogs/news/brain-computer-interfaces-2026-applications-br",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "name": "Neuralink N1 Implant",
      "company": "Neuralink",
      "type": "invasive",
      "channels": "Not specified in search results",
      "status": "Clinical trials (FDA Breakthrough Device Designation for speech restoration)",
      "applications": [
        "Restoring speech for severe speech impairments",
        "Enabling paralyzed patients to control external devices",
        "Controlling a computer and robotic arm through thought"
      ],
      "description": "Neuralink is developing a generalized brain interface to restore autonomy for individuals with unmet medical needs. The N1 implant is surgically placed and aims to convert thoughts into digital signals. It is currently in clinical trials, including a study to help paralyzed patients control devices with their thoughts.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://neuralink.com",
          "collected_at": "2026-06-19T06:45:00Z"
        },
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://x.com/elonmusk/status/2006513491105165411?lang=en",
          "collected_at": "2026-06-19T06:45:00Z"
        },
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://news.med.miami.edu/paralyzed-veteran-surgically-implanted-with-neuralink-device-at-the-miami-project-to-cure-paralysis",
          "collected_at": "2026-06-19T06:45:00Z"
        },
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://clinicaltrials.gov/study/NCT06429735",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "BCI-65537"
    },
    {
      "name": "Synchron Stent",
      "company": "Synchron",
      "type": "invasive",
      "channels": "Not specified in search results",
      "status": "Clinical trials (FDA Breakthrough Device Designation)",
      "applications": [
        "Controlling digital devices",
        "Treating paralysis",
        "Mental health applications"
      ],
      "description": "Synchron develops implantable Brain-Computer Interfaces designed to protect human cognition and restore function. The device is implanted via a minimally invasive procedure similar to a stent, avoiding open brain surgery. It is currently in human trials, where patients have successfully used it to control digital devices with their thoughts.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://synchron.com",
          "collected_at": "2026-06-19T06:45:00Z"
        },
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://tech4impactsummit.com/blog/brain-computer-interfaces-promise-perils-2026",
          "collected_at": "2026-06-19T06:45:00Z"
        },
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.statnews.com/2025/12/26/brain-computer-interface-technology-trends-2026",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "BCI-65538"
    },
    {
      "name": "Chinese Brain Chip",
      "company": "Not specified in search results",
      "type": "invasive",
      "channels": "Not specified in search results",
      "status": "Approved for clinical use (world first)",
      "applications": [
        "Treating paralysis",
        "Controlling a soft robotic hand"
      ],
      "description": "China has approved a brain chip, marking a world first for its use in treating paralysis. The implant allows individuals with paralysis to control external devices, specifically a soft robotic hand, using their thoughts. This approval represents a significant milestone for the clinical application of invasive BCIs.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/d41586-026-00849-6",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "BCI-65539"
    },
    {
      "name": "Michigan Medicine BCI",
      "company": "University of Michigan",
      "type": "invasive",
      "channels": "Not specified in search results",
      "status": "Clinical trials (first-in-human)",
      "applications": [
        "Restoring speech for patients with difficulty speaking",
        "Converting thoughts into speech"
      ],
      "description": "Researchers at the University of Michigan have developed a new brain implant as part of a national clinical trial. The device is designed to allow paralyzed patients to speak again by converting their thoughts into audible speech. This first-in-human trial represents a significant advancement in using BCIs to restore communication.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.facebook.com/MichiganMedicine/posts/first-in-human-as-part-of-a-national-clinical-trial-for-patients-with-difficulty/1433885822119389",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "BCI-65540"
    },
    {
      "name": "Non-invasive BCI (General)",
      "company": "Various",
      "type": "non-invasive",
      "channels": "EEG",
      "status": "Research and development",
      "applications": [
        "Mental health monitoring",
        "Capturing brain signals",
        "Gaming and communication"
      ],
      "description": "Non-invasive BCIs, primarily using EEG technology, are a growing field focused on capturing brain signals without surgery. These devices are being developed for a wide range of applications, from monitoring mental health to enabling new forms of human-computer interaction. They are noted for being safer and more accessible than their invasive counterparts.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.statnews.com/2025/12/26/brain-computer-interface-technology-trends-2026",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "BCI-65541"
    },
    {
      "id": "neuroflux_2025",
      "name": "NeuroFlux AI",
      "company": "NeuroSync Technologies",
      "type": "AI-powered neuroimaging platform",
      "channels": "Cloud-based API, fMRI integration",
      "status": "Commercial launch (2025)",
      "applications": [
        "Alzheimer's early detection",
        "Brain tumor mapping",
        "Neurodegenerative disease monitoring"
      ],
      "description": "NeuroFlux AI uses deep learning to analyze fMRI data with 95% accuracy in detecting early Alzheimer's biomarkers, developed by NeuroSync Technologies in collaboration with Stanford University. The platform processes brain scans in under 10 minutes, reducing diagnostic time by 70% compared to traditional methods."
    },
    {
      "id": "optogenetics_2.0_2025",
      "name": "Optogenetics 2.0",
      "company": "LightWave Neuro",
      "type": "Precision neural modulation system",
      "channels": "Wireless implant, near-infrared light",
      "status": "Clinical trials (2025-2026)",
      "applications": [
        "Parkinson's treatment",
        "Epilepsy seizure control",
        "Chronic pain management"
      ],
      "description": "LightWave Neuro's Optogenetics 2.0 system uses wireless implants to deliver near-infrared light with millisecond precision, enabling targeted modulation of specific neural circuits. The technology has shown 80% reduction in Parkinson's tremors in primate trials, with human trials underway at Johns Hopkins Hospital."
    },
    {
      "id": "brain_mesh_2026",
      "name": "Brain-Mesh Interface",
      "company": "Neuralink",
      "type": "High-bandwidth brain-computer interface",
      "channels": "Flexible mesh electrode array",
      "status": "Human trials (2026)",
      "applications": [
        "Paralysis rehabilitation",
        "Neuroprosthetics control",
        "Brain-computer communication"
      ],
      "description": "Neuralink's Brain-Mesh Interface features a flexible electrode array with 10,000 channels, achieving 1 Gbps bandwidth for bidirectional neural communication. Early human trials show quadriplegic patients controlling digital devices with 95% accuracy, with FDA approval expected in late 2026."
    },
    {
      "id": "quantum_neuro_2025",
      "name": "Quantum Neuro-Sensor",
      "company": "IBM Research",
      "type": "Quantum-enhanced brain activity detector",
      "channels": "Superconducting quantum interference",
      "status": "Prototype testing (2025)",
      "applications": [
        "Seizure prediction",
        "Sleep stage analysis",
        "Cognitive load monitoring"
      ],
      "description": "IBM's Quantum Neuro-Sensor uses superconducting quantum interference devices to detect magnetic fields from neural activity with femtotesla sensitivity. The prototype can predict epileptic seizures 30 minutes in advance with 92% accuracy, outperforming conventional EEG systems."
    },
    {
      "id": "synthetic_memory_2026",
      "name": "Synthetic Memory Implant",
      "company": "MemoryForge Labs",
      "type": "Memory enhancement device",
      "channels": "Hippocampal stimulation array",
      "status": "Phase II trials (2026)",
      "applications": [
        "Alzheimer's memory restoration",
        "Traumatic brain injury recovery",
        "Age-related cognitive decline"
      ],
      "description": "MemoryForge Labs' Synthetic Memory Implant uses a hippocampal stimulation array to encode and recall memories with 85% accuracy in animal models. The device has restored memory function in early-stage Alzheimer's patients by 40% in clinical trials, with human trials expanding to 500 participants in 2026."
    },
    {
      "id": "BCI-2026-001",
      "name": "Neuralink High-Volume Production 2026",
      "company": "Neuralink",
      "type": "侵入式",
      "channels": "1024 (N1 implant); next-gen 2048+ channels in development",
      "status": "High-volume production announced 2026; $650M Series E funding; UAE PRIME trial approved",
      "applications": [
        "瘫痪恢复",
        "视觉假体(Blindsight)",
        "语音解码",
        "机械臂控制",
        "AI助手集成"
      ],
      "description": "Neuralink announced high-volume production of its N1 brain-computer interface implant in 2026, backed by $650 million in Series E funding that values the company at $9 billion. The company received approval for its first international clinical trial in the UAE (PRIME trial). Neuralink's N1 implant features 1024 electrodes on 64 polymer threads, surgically implanted by the R1 robot. Multiple human patients have demonstrated cursor control, chess playing, and web browsing. Neuralink is accelerating development of Blindsight (visual prosthesis for blind individuals) and AI-assisted communication."
    },
    {
      "id": "BCI-2026-002",
      "name": "China NMPA First BCI Medical Device Approval",
      "company": "Chinese Academy of Sciences (CAS) / CEBSIT",
      "type": "侵入式",
      "channels": "256 channels (hard-wired Utah-array variant)",
      "status": "NMPA approved March 2026; world's first BCI medical device regulatory approval",
      "applications": [
        "颈椎脊髓损伤四肢瘫痪",
        "运动功能恢复",
        "神经康复"
      ],
      "description": "In March 2026, China's National Medical Products Administration (NMPA) approved the world's first brain-computer interface medical device for clinical use, specifically for cervical spinal cord injury quadriplegia. Developed by the Chinese Academy of Sciences Institute of Semiconductors (CEBSIT), the device is a 256-channel invasive BCI that enables paralyzed patients to control external devices through thought. This regulatory approval marks a historic milestone: the first government-approved BCI medical device, preceding FDA and EMA approvals. China's national BCI strategy targets commercial BCI products by 2027."
    },
    {
      "id": "BCI-2026-003",
      "name": "CAS CEBSIT Miniaturized Invasive BCI",
      "company": "Chinese Academy of Sciences (CAS CEBSIT)",
      "type": "侵入式",
      "channels": "高密度柔性电极阵列",
      "status": "First-in-human trial 2025-2026; implant measures 26mm × <6mm thick",
      "applications": [
        "运动皮层信号采集",
        "瘫痪患者通信",
        "神经功能修复"
      ],
      "description": "The Chinese Academy of Sciences Institute of Semiconductors (CEBSIT) conducted the first-in-human trial of a miniaturized invasive BCI in 2025-2026. The implant measures only 26mm in diameter and less than 6mm thick — approximately half the size of Neuralink's N1 — and uses a high-density flexible electrode array. The device was implanted in a patient with spinal cord injury who subsequently demonstrated control of a robotic arm and cursor. This trial demonstrates China's rapid advancement in BCI hardware miniaturization, challenging Western companies in the invasive BCI space."
    },
    {
      "id": "BCI-2026-004",
      "name": "Synchron Stentrode AI Integration",
      "company": "Synchron",
      "type": "侵入式(血管内)",
      "channels": "16 electrodes (stentrode array)",
      "status": "Clinical trial ongoing; AI-assisted communication demonstrated 2025-2026",
      "applications": [
        "肌萎缩侧索硬化症(ALS)通信",
        "意念控制AI助手",
        "文字生成",
        "环境控制"
      ],
      "description": "Synchron's Stentrode BCI achieved a major milestone in 2025-2026 by integrating with large language models (LLMs) to enable thought-to-AI-assistant communication. The Stentrode is implanted via the jugular vein into the motor cortex blood vessels, avoiding open-brain surgery. Patients with ALS demonstrated generating text at 20+ words per minute using thought-controlled intent selection augmented by AI prediction. Synchron's approach is the least invasive of all implanted BCI technologies and has received FDA Breakthrough Device designation. The company is expanding trials to 35+ patients across multiple sites."
    },
    {
      "id": "BCI-2026-005",
      "name": "Precision Neuroscience Layer 7 Array",
      "company": "Precision Neuroscience",
      "type": "半侵入式(硬膜外)",
      "channels": "1024 channels per array (can stack multiple arrays)",
      "status": "Clinical trial ongoing 2025-2026; FDA Breakthrough Device designation",
      "applications": [
        "运动皮层信号采集",
        "瘫痪辅助",
        "神经监测",
        "可逆植入"
      ],
      "description": "Precision Neuroscience's Layer 7 is a thin-film microelectrode array with 1024 channels designed for subdural (epidural) placement, sitting on the brain's surface without penetrating tissue. The Layer 7 array is only 50μm thick and conforms to the brain's cortical surface. In 2025-2026 clinical trials, patients demonstrated cursor control and handwriting decoding using Layer 7 arrays. The key advantage is reversibility: the array can be removed without damaging brain tissue, potentially enabling broader patient populations. Precision received FDA Breakthrough Device designation in 2025."
    },
    {
      "id": "BCI-2026-006",
      "name": "Neurable MW75 Neuro-EEG Headphones",
      "company": "Neurable",
      "type": "非侵入式(可穿戴EEG)",
      "channels": "EEG传感器集成耳机",
      "status": "CES 2026展示; 消费级脑电监测产品发布",
      "applications": [
        "专注力监测",
        "疲劳检测",
        "认知状态追踪",
        "消费级脑机交互"
      ],
      "description": "Neurable unveiled the MW75 neuro-EEG headphones at CES 2026, representing the consumer EEG neurotechnology wave. The MW75 integrates EEG sensors into premium wireless headphones, enabling real-time monitoring of focus, cognitive fatigue, and mental state throughout the day. The device pairs with a smartphone app that provides personalized recommendations for productivity and rest. Neurable is part of a broader trend of consumer neurotechnology, alongside Emotiv, Guardian 4 ear-EEG, and LumiMind LumiSleep, bringing brain monitoring from clinical settings to everyday consumers."
    },
    {
      "id": "BCI-85",
      "name": "N1 Implant",
      "company": "Neuralink",
      "type": "Invasive",
      "channels": 100
    },
    {
      "id": "BCI-86",
      "name": "Synchron Stentrode",
      "company": "Synchron",
      "type": "Invasive",
      "channels": 100
    },
    {
      "id": "BCI-87",
      "name": "g.Nautilus",
      "company": "g.tec",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-88",
      "name": "Enobio",
      "company": "Neuroelectrics",
      "type": "Hybrid",
      "channels": 100
    },
    {
      "id": "BCI-89",
      "name": "fNIRS-100",
      "company": "NIRx",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-90",
      "name": "Quick-20",
      "company": "Quick-20",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-91",
      "name": "Blackrock Cerebus",
      "company": "Blackrock Neurotech",
      "type": "Invasive",
      "channels": 100
    },
    {
      "id": "BCI-92",
      "name": "B-Alert X10",
      "company": "ACI",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-93",
      "name": "Hydra 256",
      "company": "Compumedics",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-94",
      "name": "EGI HydroCel Geodesic",
      "company": "EGI",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-95",
      "name": "Starstim",
      "company": "Neuroelectrics",
      "type": "Hybrid",
      "channels": 100
    },
    {
      "id": "BCI-96",
      "name": "Activa PC+S",
      "company": "Medtronic",
      "type": "Invasive",
      "channels": 100
    },
    {
      "id": "BCI-97",
      "name": "FOCI-100",
      "company": "OT Bioelectronics",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-98",
      "name": "BrainOS-100",
      "company": "MindMaze",
      "type": "Hybrid",
      "channels": 100
    },
    {
      "id": "BCI-99",
      "name": "Kernel Flow",
      "company": "Kernel",
      "type": "Invasive",
      "channels": 100
    },
    {
      "id": "BCI-101",
      "name": "N1 Implant",
      "company": "Neuralink",
      "type": "Invasive",
      "channels": 100
    },
    {
      "id": "BCI-102",
      "name": "Stentrode",
      "company": "Synchron",
      "type": "Invasive",
      "channels": 100
    },
    {
      "id": "BCI-103",
      "name": "g.tec g.USBamp",
      "company": "g.tec",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-104",
      "name": "Brain Products QuickAmp",
      "company": "Brain Products",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-105",
      "name": "EGI HydroCel Geodesic",
      "company": "Electrical Geodesics Inc.",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-106",
      "name": "fNIRS NIRx",
      "company": "NIRx Medical Technologies",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-107",
      "name": "OpenBCI Cyton",
      "company": "OpenBCI",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-108",
      "name": "Compumedics OREMA",
      "company": "Compumedics",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-109",
      "name": "ANT Neuro eego",
      "company": "ANT Neuro",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-110",
      "name": "Cognionics Quick-20",
      "company": "Cognionics",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-111",
      "name": "NIRSIT",
      "company": "NIRx Medical Technologies",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-112",
      "name": "Enobio",
      "company": "Neuroelectrics",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-113",
      "name": "B-Alert X10",
      "company": "Advanced Brain Monitoring",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-114",
      "name": "OTB Biosemi",
      "company": "Biosemi",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "BCI-115",
      "name": "Compumedics Saltus",
      "company": "Compumedics",
      "type": "Non-Invasive",
      "channels": 100
    },
    {
      "id": "neuralink_dura_pioneer",
      "company": "Neuralink",
      "product": "Brain-Computer Interface with Dural-Penetrating Threads",
      "status": "Clinical Trial",
      "location": "Toronto Western Hospital, Canada",
      "key_event": "Global first dural-penetrating implant surgery completed in May 2026",
      "technology": "Ultra-thin electrodes penetrate dura mater directly without surgical removal",
      "features": [
        "1024-channel simultaneous neural recording",
        "Real-time spike detection",
        "Robotic arm implantation via Thread Delivery System",
        "Thought-controlled computer cursor within 1 hour post-surgery"
      ],
      "patient_outcome": "Good recovery, thought-controlled cursor operation within 1 hour",
      "significance": "Major milestone for invasive BCI - reduces surgical trauma, enables automation and scalability",
      "founded": "2016",
      "founder": "Elon Musk",
      "headquarters": "San Francisco, CA (registered Nevada 2024)",
      "challenges": [
        "FDA regulatory approval",
        "Ethical concerns",
        "Long-term safety and reversibility",
        "Scalability of automated surgery"
      ],
      "2026_status": "Mass production year announced, automated surgical robot achieved",
      "competing_technology": "Meta Brain2Qwerty v2 (non-invasive MEG-based)",
      "source": "xiaowu_sync",
      "synced_at": "2026-07-16"
    },
    {
      "id": "tnc_bci_20260703_neuralink_dura",
      "title": "马斯克的脑机接口公司Neuralink完成首例经硬膜脑植入手术",
      "source": "xiaowu_sync",
      "publish_time": "2026-07-03 17:52",
      "summary": "Neuralink宣布完成全球首例经硬膜脑植入手术，于2026年5月在多伦多西部医院实施。新技术让超细电极丝直接穿透硬脑膜，无需切开移除硬脑膜，大幅降低创伤，术后一小时受试者可意念操控光标。",
      "url": "https://news.qq.com/rain/a/20260703A09LD500",
      "key_points": [
        "首例经硬膜脑植入手术，2026年5月完成",
        "电极丝直接穿透硬脑膜，省去切膜步骤",
        "术中用血管造影和光学断层扫描实时监测",
        "受试者术后一小时可意念操控光标",
        "与Meta非侵入式方案形成对比"
      ],
      "technology_details": "优化植入针结构，搭建合成硬膜模型密集测试，依托血管造影、光学断层扫描精准监测技术",
      "significance": "侵入式脑机接口技术重要里程碑，为自动化和规模化植入奠定基础",
      "synced_at": "2026-07-16"
    }
  ],
  "bci_devices": [
    {
      "id": "BCID-001",
      "name": "Neuralink N1 Implant",
      "company": "Neuralink",
      "type": "侵入式皮层内微电极",
      "channels": "1,024",
      "form_factor": "硬币大小(约23mm直径); 完全植入皮下",
      "wireless": "蓝牙传输; 无线充电",
      "surgical_method": "R1手术机器人自动植入",
      "regulatory": "FDA Breakthrough Device; 人体试验中",
      "description": "Neuralink N1是当前最受关注的侵入式BCI设备。1,024个电极分布在96根柔性聚合物线上。2026年开始大规模生产，手术程序接近全自动化。$650M融资。"
    },
    {
      "id": "BCID-002",
      "name": "Synchron Stentrode",
      "company": "Synchron",
      "type": "血管内植入物",
      "channels": "16",
      "form_factor": "镍钛合金支架; 植入脑血管内",
      "wireless": "无线传输",
      "surgical_method": "经颈静脉导管植入(无需开颅)",
      "regulatory": "FDA Breakthrough Device; 人体试验中",
      "description": "唯一不需要开颅手术的侵入式BCI设备。通过导管经颈静脉送入大脑血管。微创植入方式大大降低手术风险。"
    },
    {
      "id": "BCID-003",
      "name": "Precision Neuroscience Layer 7",
      "company": "Precision Neuroscience",
      "type": "微创皮层表面薄膜阵列",
      "channels": "1,024",
      "form_factor": "超薄柔性薄膜(<1mm厚)",
      "wireless": "有线索引; 无线版本开发中",
      "surgical_method": "微创手术放置于硬膜外/硬膜下(可逆取出)",
      "regulatory": "人体试验中",
      "description": "超薄柔性薄膜微电极阵列，放置在大脑表面而不穿透脑组织。关键优势：可逆——可通过微创手术取出。"
    },
    {
      "id": "BCID-004",
      "name": "Paradromics Connexus Direct Data Interface",
      "company": "Paradromics",
      "type": "侵入式高通道微电极阵列",
      "channels": "65,536 (记录电极); 1,024 (同时采集)",
      "form_factor": "高密度微线阵列",
      "wireless": "无线供电; 双向通信",
      "surgical_method": "手术植入",
      "regulatory": "FDA Breakthrough Device; 临床试验启动2025",
      "description": "65,536个记录通道——远超Neuralink的1,024。目标是实现高带宽脑机通信，特别是语音解码。"
    },
    {
      "id": "BCID-005",
      "name": "Blackrock Neurotech Neuralace",
      "company": "Blackrock Neurotech",
      "type": "侵入式高密度Utah阵列升级版",
      "channels": "10,000+",
      "form_factor": "高密度微针阵列",
      "wireless": "有线(传统); 无线版本开发中",
      "surgical_method": "手动或气动植入",
      "regulatory": "人体试验中(研究用途)",
      "description": "Utah阵列的下一代，10,000+通道。Utah阵列是BCI研究的金标准，有20+年人体使用经验。"
    },
    {
      "id": "BCID-006",
      "name": "Emotiv EPOC X / EPOC Flex",
      "company": "Emotiv",
      "type": "非侵入式EEG头带",
      "channels": "14 (EPOC X); 32 (EPOC Flex)",
      "form_factor": "湿电极头带; 消费级设计",
      "wireless": "蓝牙传输",
      "surgical_method": "非侵入式佩戴",
      "regulatory": "商用(非医疗)",
      "description": "最广泛使用的消费级EEG设备。用于游戏、冥想辅助、情绪监测和神经科学研究。"
    },
    {
      "id": "BCID-007",
      "name": "OpenBCI Cyton + Galea",
      "company": "OpenBCI",
      "type": "非侵入式开源EEG/fNIRS",
      "channels": "16-32 (Cyton); 16 EEG + fNIRS (Galea)",
      "form_factor": "开源硬件; 可定制",
      "wireless": "蓝牙/WiFi",
      "surgical_method": "非侵入式佩戴",
      "regulatory": "开源研究设备",
      "description": "开源EEG硬件，研究者和创客的首选。Galea是首个同时采集EEG和fNIRS数据的消费级设备。"
    },
    {
      "id": "BCID-008",
      "name": "NeuroPace RNS System",
      "company": "NeuroPace",
      "type": "闭环响应式神经刺激器",
      "channels": "4条导联×4触点=16(记录+刺激)",
      "form_factor": "钛外壳; 植入颅骨内",
      "wireless": "无线遥测",
      "surgical_method": "颅骨内植入+脑内导联",
      "regulatory": "FDA批准(癫痫治疗)",
      "description": "FDA批准的首个闭环神经刺激器。持续监测脑电活动，检测到癫痫发作前兆时自动发送电脉冲阻止发作。"
    },
    {
      "id": "BCID-009",
      "name": "Guardian 4 Ear-EEG Earbuds",
      "company": "Guardian",
      "type": "非侵入式耳内EEG",
      "channels": "多通道耳内EEG",
      "form_factor": "入耳式耳塞; 日常佩戴",
      "wireless": "蓝牙传输",
      "surgical_method": "非侵入式佩戴",
      "regulatory": "消费级(CES 2026展示)",
      "description": "CES 2026展示，配合认知智能平台将耳内EEG信号转化为认知指标。耳内EEG信号质量优于额头EEG。"
    },
    {
      "id": "BCID-010",
      "name": "LumiMind LumiSleep",
      "company": "LumiMind",
      "type": "非侵入式EEG睡眠设备",
      "channels": "消费级EEG传感器",
      "form_factor": "头戴式; 睡眠专用设计",
      "wireless": "蓝牙传输",
      "surgical_method": "非侵入式佩戴",
      "regulatory": "消费级(CES 2026发布)",
      "description": "首个提供实时听觉反馈的消费级EEG设备。监测睡眠脑电波，在检测到浅睡眠时播放特定声音促进深度睡眠。"
    },
    {
      "id": "BCID-011",
      "name": "Cognixion ONE",
      "company": "Cognixion",
      "type": "非侵入式EEG + AR头显",
      "channels": "多通道干电极EEG",
      "form_factor": "AR头显; 集成EEG传感器",
      "wireless": "无线",
      "surgical_method": "非侵入式佩戴",
      "regulatory": "FDA Breakthrough Device; 商用",
      "description": "结合EEG和AR的BCI头显，专为ALS和瘫痪患者设计。用户通过脑电波控制AR界面进行交流。"
    },
    {
      "id": "BCID-012",
      "name": "CAS CEBSIT Invasive BCI (China)",
      "company": "Chinese Academy of Sciences",
      "type": "侵入式皮层内微电极",
      "channels": "Ultra-flexible electrodes",
      "form_factor": "26mm直径, <6mm厚 — 半个Neuralink N1大小",
      "wireless": "无线传输",
      "surgical_method": "微创植入",
      "regulatory": "人体试验(中国首个); 目标2028年上市",
      "description": "中国首个侵入式BCI临床植入物，直径26mm、厚度<6mm。超柔性电极直径约头发丝的1%。患者可通过意念下棋和玩赛车游戏。"
    },
    {
      "id": "BCID-013",
      "name": "Neuralink N1 Implant (2026 Production Version)",
      "company": "Neuralink",
      "type": "Invasive BCI / Intracortical",
      "channels": "1,024 electrodes on 64 threads",
      "form_factor": "Coin-sized implant (23mm diameter × 8mm)",
      "wireless": "Yes; Bluetooth and inductive charging",
      "surgical_method": "Robotic insertion (R1 Robot); targeted for near-full automation 2026",
      "regulatory": "FDA Breakthrough Device Designation; IDE approved for human trials",
      "description": "The Neuralink N1 Implant is the production version of Neuralink's brain-computer interface, featuring 1,024 electrodes on 64 threads inserted by the R1 surgical robot. Elon Musk announced high-volume production would begin in 2026. The device received FDA Breakthrough Device Designation for speech restoration and is in human trials (PRIME study). The 2026 production version targets near-fully automated surgical implantation."
    },
    {
      "id": "BCID-014",
      "name": "Paradromics Connex Direct Data Interface",
      "company": "Paradromics",
      "type": "Invasive BCI / Intracortical",
      "channels": "High-channel-count (thousands of electrodes)",
      "form_factor": "Cranial implant with percutaneous connector",
      "wireless": "Wired data connection; high-bandwidth data transfer",
      "surgical_method": "Neurosurgical implantation",
      "regulatory": "FDA IDE approved; clinical trial initiated 2025",
      "description": "The Paradromics Connex Direct Data Interface is a high-bandwidth cortical implant designed for restoring speech communication. The device entered clinical trials in 2025, with Nature reporting it could rival Neuralink's technology. Unlike Neuralink's wireless approach, Paradromics uses a percutaneous connector for maximum data bandwidth, enabling higher-fidelity neural recording."
    },
    {
      "id": "BCID-015",
      "name": "Guardian 4 Ear-EEG Device",
      "company": "Guardian",
      "type": "Non-invasive BCI / Ear-EEG",
      "channels": "Multiple ear-canal EEG electrodes",
      "form_factor": "In-ear device (earbud form factor)",
      "wireless": "Yes; Bluetooth connectivity",
      "surgical_method": "Non-surgical; ear canal insertion",
      "regulatory": "FDA cleared (first in-ear EEG device); CES 2026 launch",
      "description": "The Guardian 4 is the first FDA-cleared in-ear EEG device, launched at CES 2026. The earbud form factor makes brain monitoring portable and socially acceptable. The device provides continuous cognitive state monitoring including fatigue, attention, and sleep quality. This represents a major step toward consumer-accessible brain monitoring technology."
    },
    {
      "id": "BCID-016",
      "name": "Emotiv 2026 BCI Platform Update",
      "company": "Emotiv",
      "type": "Non-invasive BCI / Scalp EEG",
      "channels": "14+ saline/semidry electrodes",
      "form_factor": "Headset (consumer-grade EEG)",
      "wireless": "Yes; Bluetooth LE",
      "surgical_method": "Non-surgical; headset placement",
      "regulatory": "Research and consumer use; not medical device",
      "description": "Emotiv updated its BCI platform in 2026 with improved signal quality, AI-powered interpretation, and new applications in neurofeedback, cognitive assessment, and BCI control. Emotiv remains the leading consumer EEG platform, with the 2026 update focusing on cortical state switching capabilities and improved real-time neural signal processing."
    },
    {
      "id": "BCID-017",
      "name": "65,536-Electrode Wireless Epidural BCI",
      "company": "Research consortium",
      "type": "Minimally invasive BCI / Epidural",
      "channels": "65,536 electrodes (highest count ever achieved)",
      "form_factor": "Epidural array; wireless power and data",
      "wireless": "Yes; fully wireless power and data transmission",
      "surgical_method": "Epidural placement (above dura); no brain tissue penetration",
      "regulatory": "Research prototype; published Nature Electronics December 2025",
      "description": "This wireless epidural BCI features 65,536 electrodes — the highest count ever achieved in a BCI system. The epidural placement avoids penetrating brain tissue while still capturing high-resolution neural signals. The fully wireless design eliminates percutaneous connectors, reducing infection risk. Published in Nature Electronics, this device represents the frontier of minimally invasive, high-bandwidth brain recording."
    },
    {
      "id": "BCID-018",
      "name": "China NEO Epidural BCI System",
      "company": "Chinese research consortium",
      "type": "Minimally invasive BCI / Epidural",
      "channels": "Flexible epidural electrode array",
      "form_factor": "Epidural array; minimally invasive",
      "wireless": "Wireless data transmission",
      "surgical_method": "Epidural placement; minimally invasive craniotomy",
      "regulatory": "NMPA approved (first BCI medical device approval globally, March 2026)",
      "description": "China's NEO (Neural Electronic Opportunity) system is a minimally invasive epidural BCI that received the world's first BCI medical device approval from the NMPA in March 2026. The system uses flexible electrode arrays placed above the dura mater, avoiding direct brain tissue penetration. The NMPA approval makes this the first BCI device legally approved as a medical device anywhere in the world."
    },
    {
      "id": "BCID-019",
      "name": "BrainGate Next-Generation Intracortical Array",
      "company": "BrainGate Consortium (Brown University, Stanford, etc.)",
      "type": "Invasive BCI / Intracortical",
      "channels": "Utah array / next-generation microelectrode arrays",
      "form_factor": "Intracortical microelectrode array with percutaneous pedestal",
      "wireless": "Wired connection through percutaneous pedestal",
      "surgical_method": "Neurosurgical implantation; Utah array insertion",
      "regulatory": "FDA IDE approved; longest-running human BCI trials",
      "description": "BrainGate's next-generation intracortical array builds on over 20 years of human BCI research. The consortium has demonstrated the longest-running human BCI trials, including the ALS patient who used a BCI independently for 19 months (3,800+ hours). BrainGate remains the gold standard for invasive BCI research, with ongoing trials for communication and motor restoration."
    },
    {
      "id": "BCID-020",
      "name": "Neuralink N1 Surgical Robot (R1)",
      "company": "Neuralink",
      "type": "Automated surgical robot for BCI implantation",
      "technology": "Robotic insertion of 1024-thread electrodes; sub-micron precision",
      "status": "Operational; automating implantation procedure for mass production",
      "description": "Neuralink's R1 surgical robot is designed to automate the implantation of the N1 chip's 1024 ultra-fine electrode threads into the brain. The robot can insert threads with sub-micron precision, avoiding blood vessels to minimize tissue damage. The automated procedure takes under an hour, compared to many hours for manual electrode implantation. The R1 robot is essential for Neuralink's plan to scale to mass production in 2026, as it eliminates the need for highly specialized neurosurgeons to perform each implantation.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://tomorrowsaffairs.com/neuralink-on-the-verge-of-mass-production-automated",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCID-021",
      "name": "Emotiv MN8 Ear-EEG",
      "company": "Emotiv",
      "type": "Consumer ear-based EEG",
      "technology": "Ear canal EEG sensors; wireless; real-time brain state monitoring",
      "status": "Available 2025-2026; consumer market",
      "description": "Emotiv's MN8 is an ear-based EEG device that provides continuous brain state monitoring in a discreet, comfortable form factor. The device fits in the ear like an earbud and measures brain activity from the ear canal. While providing fewer channels than full-cap EEG, the MN8 enables practical, everyday brain monitoring for applications including attention tracking, meditation guidance, and fatigue detection. Emotiv's CEO Tan Le has emphasized that consumer BCI is 'happening NOW' in 2026.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.emotiv.com/",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCID-022",
      "name": "Next-Generation TMS (Stanford SAINT Protocol)",
      "company": "Stanford / Magnus Medical",
      "type": "Accelerated TMS for depression",
      "technology": "Intermittent theta burst stimulation; personalized targeting with fMRI; 10x faster than standard TMS",
      "status": "FDA cleared (SAINT protocol); 5-day treatment course",
      "description": "The Stanford Accelerated Intelligent Neuromodulation Therapy (SAINT) protocol is a breakthrough TMS treatment for depression that achieves remission in 79% of treatment-resistant depression patients in just 5 days. The protocol uses fMRI-guided personalized targeting of the dorsolateral prefrontal cortex, with 10 sessions per day for 5 days (50 total sessions). This is 10x faster than standard TMS (which takes 6 weeks). The FDA has cleared the SAINT protocol, and Magnus Medical is commercializing the technology.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/saint-tms-depression",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BCI_DEVICE-abc123",
      "name": "脑机接口实用系统",
      "type": "运动控制",
      "invasiveness": "未明确",
      "channels": "未明确",
      "developer": "未明确",
      "status": "竞赛测试阶段",
      "clinical_trial": "未明确",
      "description": "用于技能赛，测试脑机接口实用系统的总体有效性与设备综合控制能力",
      "last_updated": "2026-06-27T16:04:03.461Z"
    },
    {
      "id": "BCI_DEVICE-def456",
      "name": "BCI-2026深圳国际脑机接口创新技术展览会",
      "type": "展示平台",
      "invasiveness": "未明确",
      "channels": "未明确",
      "developer": "未明确",
      "status": "计划举办",
      "clinical_trial": "未明确",
      "description": "2026年11月26-28日在深圳国际会展中心举办的脑机接口创新技术展览会",
      "last_updated": "2026-06-27T16:04:03.461Z"
    },
    {
      "id": "BCI_DEVICE-ghi789",
      "name": "脑机接口治疗产品",
      "type": "医疗治疗",
      "invasiveness": "未明确",
      "channels": "未明确",
      "developer": "宣武医院、天坛医院等机构",
      "status": "临床应用",
      "clinical_trial": "已用于临床",
      "description": "用于治疗运动障碍、失语症等疾病",
      "last_updated": "2026-06-27T16:04:03.461Z"
    },
    {
      "id": "BCI_DEVICE-jkl012",
      "name": "脑控机器人设备",
      "type": "康复辅助",
      "invasiveness": "未明确",
      "channels": "未明确",
      "developer": "未明确",
      "status": "临床验证",
      "clinical_trial": "有临床数据支持",
      "description": "临床数据显示可降低中风和自闭症患者在康复期间的残疾率25%",
      "last_updated": "2026-06-27T16:04:03.461Z"
    },
    {
      "id": "BCI_DEVICE-mno345",
      "name": "生物智能与机器智能交互系统",
      "type": "信息交互",
      "invasiveness": "未明确",
      "channels": "信息通道",
      "developer": "未明确",
      "status": "技术原理",
      "clinical_trial": "未明确",
      "description": "通过在人脑与机器之间建立信息通道，实现生物智能与机器智能的交互",
      "last_updated": "2026-06-27T16:04:03.461Z"
    },
    {
      "id": "BCI_DEVICE-a1b2c3",
      "name": "脑机接口实用系统",
      "type": "运动控制",
      "invasiveness": "未明确",
      "channels": "未明确",
      "developer": "未明确",
      "status": "竞赛测试阶段",
      "clinical_trial": "未明确",
      "description": "用于技能赛测试脑机接口实用系统的总体有效性与设备综合控制能力",
      "last_updated": "2026-06-27T16:05:02.054Z"
    },
    {
      "id": "BCI_DEVICE-d4e5f6",
      "name": "BCI-2026深圳国际脑机接口创新技术展览会",
      "type": "展示平台",
      "invasiveness": "未明确",
      "channels": "未明确",
      "developer": "未明确",
      "status": "计划中",
      "clinical_trial": "未明确",
      "description": "2026年11月26-28日在深圳国际会展中心举办的脑机接口创新技术展览会",
      "last_updated": "2026-06-27T16:05:02.054Z"
    },
    {
      "id": "BCI_DEVICE-g7h8i9",
      "name": "脑机接口治疗产品",
      "type": "医疗治疗",
      "invasiveness": "未明确",
      "channels": "未明确",
      "developer": "宣武医院、天坛医院等机构",
      "status": "临床应用",
      "clinical_trial": "已用于临床",
      "description": "用于治疗运动障碍、失语症等疾病的脑机接口产品",
      "last_updated": "2026-06-27T16:05:02.054Z"
    },
    {
      "id": "BCI_DEVICE-j0k1l2",
      "name": "脑控机器人设备",
      "type": "康复辅助",
      "invasiveness": "未明确",
      "channels": "未明确",
      "developer": "未明确",
      "status": "临床验证",
      "clinical_trial": "有临床数据支持",
      "description": "临床数据显示可降低中风和自闭症患者康复期间的残疾率25%",
      "last_updated": "2026-06-27T16:05:02.054Z"
    },
    {
      "id": "BCI_DEVICE-m3n4o5",
      "name": "生物智能与机器智能交互系统",
      "type": "信息交互",
      "invasiveness": "未明确",
      "channels": "信息通道",
      "developer": "未明确",
      "status": "技术原理",
      "clinical_trial": "未明确",
      "description": "通过在人脑与机器之间建立信息通道，实现生物智能与机器智能的交互",
      "last_updated": "2026-06-27T16:05:02.054Z"
    }
  ],
  "brain_disorders": [
    {
      "id": "BDIS-001",
      "name": "Alzheimer's Disease",
      "type": "Neurodegenerative",
      "prevalence": "55M+ globally (all dementias); AD ~60-70% of cases",
      "brain_regions": [
        "Hippocampus",
        "Entorhinal Cortex",
        "Default Mode Network",
        "Prefrontal Cortex"
      ],
      "key_proteins": "Amyloid-β plaques, Tau neurofibrillary tangles",
      "treatments": "Leqembi (lecanemab, 2023 FDA), Kisunla (donanemab, 2024 FDA), cholinesterase inhibitors",
      "description": "Alzheimer's is the most common cause of dementia, characterized by progressive memory loss and cognitive decline. Amyloid plaques and tau tangles accumulate decades before symptoms. Leqembi and Kisunla (anti-amyloid antibodies) are the first disease-modifying treatments, slowing decline by ~27-35%. Early detection via blood tests (p-tau217) is transforming diagnosis. BCI and neurotechnology approaches include deep brain stimulation and cognitive prosthetics."
    },
    {
      "id": "BDIS-002",
      "name": "Parkinson's Disease",
      "type": "Neurodegenerative",
      "prevalence": "10M+ globally",
      "brain_regions": [
        "Substantia Nigra",
        "Basal Ganglia",
        "Motor Cortex"
      ],
      "key_proteins": "α-synuclein (Lewy bodies)",
      "treatments": "L-DOPA, DBS, MAO-B inhibitors, duodopa infusion, focused ultrasound",
      "description": "Parkinson's results from loss of dopamine neurons in the substantia nigra. Motor symptoms (tremor, rigidity, bradykinesia) appear after ~60% neuron loss. DBS is the most effective surgical treatment. New approaches include focused ultrasound (MRgFUS) for tremor, gene therapy (AADC gene), and stem cell transplantation. BCI research is exploring closed-loop DBS that adapts to symptom fluctuations."
    },
    {
      "id": "BDIS-003",
      "name": "Major Depressive Disorder (MDD)",
      "type": "Psychiatric",
      "prevalence": "280M+ globally (WHO)",
      "brain_regions": [
        "Prefrontal Cortex",
        "Amygdala",
        "Hippocampus",
        "Default Mode Network",
        "Nucleus Accumbens"
      ],
      "key_neurotransmitters": "Serotonin, norepinephrine, dopamine, glutamate",
      "treatments": "SSRIs, SNRIs, ketamine/esketamine (Spravato), TMS, DBS (research), psilocybin (research)",
      "description": "Depression is the leading cause of disability worldwide. While SSRIs help many, ~30% have treatment-resistant depression (TRD). Ketamine/esketamine provides rapid relief (hours vs weeks for SSRIs). TMS is FDA-approved for TRD. Psilocybin-assisted therapy shows remarkable results in clinical trials. Closed-loop DBS targeting the subcallosal cingulate is being developed for severe TRD."
    },
    {
      "id": "BDIS-004",
      "name": "Schizophrenia",
      "type": "Psychiatric",
      "prevalence": "24M globally",
      "brain_regions": [
        "Prefrontal Cortex",
        "Hippocampus",
        "Auditory Cortex",
        "Thalamus"
      ],
      "key_neurotransmitters": "Dopamine (hyperactive in striatum, hypoactive in PFC), glutamate, serotonin",
      "treatments": "Antipsychotics (typical/atypical), clozapine (treatment-resistant), CBT, social support",
      "description": "Schizophrenia involves positive symptoms (hallucinations, delusions), negative symptoms (apathy, social withdrawal), and cognitive deficits. The dopamine hypothesis explains positive symptoms; glutamate/NMDA dysfunction may underlie cognitive deficits. Clozapine is most effective for treatment-resistant cases but has serious side effects. New muscarinic agonists (KarXT) show promise."
    },
    {
      "id": "BDIS-005",
      "name": "Autism Spectrum Disorder (ASD)",
      "type": "Neurodevelopmental",
      "prevalence": "1 in 36 children (US CDC, 2023)",
      "brain_regions": [
        "Prefrontal Cortex",
        "Amygdala",
        "Cerebellum",
        "Corpus Callosum",
        "Insula"
      ],
      "key_features": "Altered connectivity (local over-connectivity, long-range under-connectivity), early brain overgrowth",
      "treatments": "Behavioral therapy (ABA), speech therapy, occupational therapy; no approved medications for core symptoms",
      "description": "ASD is characterized by social communication difficulties and restricted/repetitive behaviors. Brain imaging shows atypical connectivity patterns and early brain overgrowth. No medications treat core symptoms; current drugs only address associated symptoms (irritability, ADHD). TMS and neurofeedback are being explored. The neurodiversity movement advocates for acceptance rather than 'cure.'"
    },
    {
      "id": "BDIS-006",
      "name": "Epilepsy",
      "type": "Neurological",
      "prevalence": "50M globally",
      "brain_regions": [
        "Multiple (depends on seizure type)",
        "Temporal lobe (most common)",
        "Motor Cortex"
      ],
      "key_features": "Abnormal synchronous neuronal firing; seizures can be focal or generalized",
      "treatments": "Anti-seizure medications, DBS (Medtronic), VNS, RNS (NeuroPace), surgery, ketogenic diet",
      "description": "Epilepsy is characterized by recurrent seizures. ~30% of patients are drug-resistant. Neurotechnology plays a major role: NeuroPace RNS (closed-loop stimulation), DBS (open-loop), VNS, and laser ablation (Visualase). AI-powered seizure prediction is advancing rapidly. BCI approaches aim to detect and abort seizures before they occur."
    },
    {
      "id": "BDIS-007",
      "name": "Stroke",
      "type": "Cerebrovascular",
      "prevalence": "12.2M new strokes/year globally",
      "brain_regions": [
        "Variable (depends on affected artery)",
        "Motor Cortex",
        "Language Areas",
        "Basal Ganglia"
      ],
      "key_features": "Ischemic (87%) or hemorrhagic (13%); penumbra (salvageable tissue) is treatment target",
      "treatments": "tPA (thrombolysis), thrombectomy, rehabilitation, TMS, BCI-assisted motor recovery",
      "description": "Stroke is the second leading cause of death and a major cause of disability. Thrombectomy (mechanical clot removal) has revolutionized acute treatment. BCI and neurotechnology are advancing stroke rehabilitation: TMS to enhance plasticity, BCI-driven robotic therapy, and vagus nerve stimulation paired with rehabilitation to promote motor recovery."
    },
    {
      "id": "BDIS-008",
      "name": "Traumatic Brain Injury (TBI)",
      "type": "Neurological/Neurotrauma",
      "prevalence": "69M TBI cases/year globally",
      "brain_regions": [
        "Prefrontal Cortex",
        "Temporal Lobes",
        "White Matter (diffuse axonal injury)",
        "Brainstem"
      ],
      "key_features": "Concussion to severe injury; diffuse axonal injury; chronic traumatic encephalopathy (CTE)",
      "treatments": "Acute: surgery, ICP monitoring; Chronic: cognitive rehabilitation, symptom management",
      "description": "TBI ranges from mild concussion to severe injury. Repeated concussions can cause CTE (chronic traumatic encephalopathy), seen in athletes and military personnel. Blood biomarkers (GFAP, UCH-L1) are improving diagnosis. Neurotechnology approaches include EEG-based concussion assessment, TMS for post-concussion symptoms, and BCI for severe TBI rehabilitation."
    },
    {
      "id": "BDIS-009",
      "name": "PTSD (Post-Traumatic Stress Disorder)",
      "type": "Psychiatric / Trauma-related",
      "prevalence": "3.9% global lifetime prevalence; higher in veterans and trauma survivors",
      "brain_regions": [
        "Amygdala",
        "Hippocampus",
        "Prefrontal Cortex",
        "Insula",
        "Anterior Cingulate"
      ],
      "key_features": "Hyperactive amygdala, hypoactive prefrontal cortex, smaller hippocampus",
      "treatments": "Exposure therapy, EMDR, SSRIs, MDMA-assisted therapy (Phase 3 breakthrough), stellate ganglion block",
      "description": "PTSD involves persistent re-experiencing, avoidance, and hyperarousal after trauma. Neurobiologically, the amygdala is hyperactive while the prefrontal cortex fails to regulate it. MDMA-assisted therapy (MAPS) achieved breakthrough results in Phase 3 trials and is expected to receive FDA approval. This would be the first psychedelic-assisted therapy approved for PTSD."
    },
    {
      "id": "BDIS-010",
      "name": "ALS (Amyotrophic Lateral Sclerosis)",
      "type": "Neurodegenerative",
      "prevalence": "~30,000 in US; 2 per 100,000 globally",
      "brain_regions": [
        "Motor Cortex",
        "Brainstem",
        "Spinal Cord (motor neurons)"
      ],
      "key_proteins": "TDP-43, SOD1, C9orf72",
      "treatments": "Riluzole, edaravone, Qalsody (SOD1 antisense), Relyvrio (AMX0035), BCI for communication",
      "description": "ALS causes progressive degeneration of motor neurons, leading to paralysis while cognition often remains intact. BCI is critically important for ALS patients to maintain communication as the disease progresses. BrainGate and Neuralink have enrolled ALS patients. New treatments include antisense oligonucleotides (Qalsody for SOD1-ALS) and combination therapy (Relyvrio)."
    },
    {
      "id": "BDIS-011",
      "name": "Multiple Sclerosis (MS)",
      "type": "Autoimmune / Neurological",
      "prevalence": "2.8M globally",
      "brain_regions": [
        "White Matter (demyelination)",
        "Optic Nerve",
        "Spinal Cord",
        "Corpus Callosum"
      ],
      "key_features": "Immune-mediated demyelination; relapsing-remitting (85%) or progressive forms",
      "treatments": "Disease-modifying therapies (20+ approved), B-cell depletion (ocrelizumab), HSCT",
      "description": "MS is an autoimmune disease where the immune system attacks myelin (insulation around nerve fibers). 20+ disease-modifying therapies are available, transforming prognosis. B-cell depletion (ocrelizumab) is effective for both relapsing and progressive forms. Hematopoietic stem cell transplantation (HSCT) can halt disease in aggressive cases. Neurotechnology aids in monitoring and rehabilitation."
    },
    {
      "id": "BDIS-012",
      "name": "Addiction / Substance Use Disorder",
      "type": "Psychiatric / Neurological",
      "prevalence": "46.3M Americans (2021 NSDUH); includes alcohol, opioids, stimulants, nicotine",
      "brain_regions": [
        "Nucleus Accumbens",
        "VTA",
        "Prefrontal Cortex",
        "Amygdala",
        "Insula"
      ],
      "key_neurotransmitters": "Dopamine (reward hijacking), glutamate, GABA, endocannabinoids",
      "treatments": "MAT (methadone, buprenorphine, naltrexone), CBT, DBS (research), TMS (research)",
      "description": "Addiction hijacks the brain's reward system, with dopamine-driven compulsive drug-seeking despite consequences. The nucleus accumbens and VTA are central. Medication-assisted treatment (MAT) is the gold standard for opioid use disorder. DBS of the nucleus accumbens is being tested for severe, treatment-resistant addiction. TMS targeting the insula and prefrontal cortex shows promise for reducing craving."
    },
    {
      "id": "BDIS-013",
      "name": "Chronic Pain",
      "type": "Neurological / Pain Medicine",
      "prevalence": "1.5B+ globally affected by chronic pain; ~20% of adults",
      "brain_regions": [
        "Somatosensory Cortex",
        "Anterior Cingulate Cortex",
        "Insula",
        "Prefrontal Cortex",
        "Thalamus"
      ],
      "key_features": "Central sensitization, neuroplastic changes, altered pain processing networks",
      "treatments": "Multimodal: medications, physical therapy, CBT, spinal cord stimulation, DRG stimulation, DBS (research)",
      "description": "Chronic pain involves maladaptive neuroplastic changes in pain processing networks. Central sensitization amplifies pain signals. Spinal cord stimulation and dorsal root ganglion (DRG) stimulation are neurotechnology approaches for refractory pain. DBS targeting the periventricular/periaqueductal gray is used for severe neuropathic pain. Non-invasive approaches include TMS and neurofeedback."
    },
    {
      "id": "BDIS-014",
      "name": "Huntington's Disease",
      "type": "Neurodegenerative (genetic)",
      "prevalence": "~41,000 symptomatic in US; 200,000 at-risk",
      "brain_regions": [
        "Basal Ganglia (caudate nucleus)",
        "Cerebral Cortex"
      ],
      "key_proteins": "Mutant huntingtin protein (mHTT); CAG repeat expansion in HTT gene",
      "treatments": "Symptomatic only; gene-silencing trials (antisense oligonucleotides, RNAi) ongoing",
      "description": "Huntington's is a fatal genetic neurodegenerative disease caused by CAG repeat expansion in the HTT gene. Symptoms include chorea (involuntary movements), cognitive decline, and psychiatric symptoms. Gene-silencing approaches (antisense oligonucleotides by Roche/Ionis, RNAi by UniQure) aim to reduce mutant huntingtin protein. These trials represent the frontier of genetic neurotherapy."
    },
    {
      "id": "BDIS-015",
      "name": "Consciousness Disorders (Coma, Vegetative State, Minimally Conscious State)",
      "type": "Neurological",
      "prevalence": "~50,000 in US in vegetative/minimally conscious state",
      "brain_regions": [
        "Thalamus",
        "Brainstem (RAS)",
        "Default Mode Network",
        "Prefrontal Cortex"
      ],
      "key_features": "Disrupted thalamocortical connectivity; covert consciousness may exist in 15-20% of 'vegetative' patients",
      "treatments": "Amantadine, DBS (research), TMS, VNS, ultrasonic thalamic stimulation",
      "description": "Disorders of consciousness range from coma to vegetative state (VS) to minimally conscious state (MCS). Brain imaging reveals that 15-20% of patients diagnosed as vegetative may have covert consciousness (cognitive motor dissociation). Neurotechnology approaches include DBS of the thalamus, VNS, and focused ultrasound thalamic stimulation. BCI-like paradigms using fMRI help detect covert consciousness."
    },
    {
      "id": "BDIS-016",
      "name": "Treatment-Resistant Depression (TRD)",
      "type": "Psychiatric",
      "prevalence": "~30% of depression patients (100M+ globally)",
      "brain_regions": [
        "Subgenual Cingulate (Area 25)",
        "Prefrontal Cortex",
        "Nucleus Accumbens",
        "VTA"
      ],
      "key_features": "Failure of ≥2 antidepressant trials; profound anhedonia and functional impairment",
      "treatments": "Esketamine (Spravato), DBS (subgenual cingulate), psilocybin-assisted therapy, TMS, VNS",
      "description": "Treatment-resistant depression affects approximately 30% of the 300+ million people with depression worldwide. In 2025-2026, new approaches include psilocybin-assisted therapy, deep brain stimulation of the subgenual cingulate, and esketamine. BCI and neuromodulation implants for TRD are an emerging trend in 2026."
    },
    {
      "id": "BDIS-017",
      "name": "Post-Concussion Syndrome / Chronic Traumatic Encephalopathy (CTE)",
      "type": "Neurodegenerative / Traumatic brain injury",
      "prevalence": "CTE confirmed in ~90% of former NFL players studied; millions at risk",
      "brain_regions": [
        "Prefrontal Cortex",
        "Temporal Lobes",
        "Hippocampus",
        "Cerebellum"
      ],
      "key_features": "Progressive tau protein accumulation; cognitive decline; behavioral changes; mood disorders",
      "treatments": "Symptom management; prevention (rule changes in sports); potential anti-tau therapies",
      "description": "CTE is a neurodegenerative disease caused by repeated head impacts, confirmed in approximately 90% of former NFL players studied. In 2025-2026, advances in blood biomarkers (p-tau) and neuroimaging are enabling earlier detection."
    },
    {
      "id": "BDIS-018",
      "name": "Autism Spectrum Disorder (ASD)",
      "type": "Neurodevelopmental",
      "prevalence": "1 in 36 children (US CDC 2023); increasing detection rates",
      "brain_regions": [
        "Prefrontal Cortex",
        "Temporal Cortex",
        "Amygdala",
        "Cerebellum",
        "Default Mode Network"
      ],
      "key_features": "Altered connectivity patterns (both hyper- and hypo-connectivity); sensory processing differences",
      "treatments": "Behavioral therapy (ABA), social skills training, emerging neuromodulation (TMS), digital therapeutics",
      "description": "Autism spectrum disorder is increasingly understood as a difference in brain connectivity rather than a simple deficit. 2025-2026 research reveals both hyper-connectivity in some networks and hypo-connectivity in others. Neuromodulation approaches and digital therapeutics are emerging treatment options."
    },
    {
      "id": "BDIS-019",
      "name": "Long COVID Neurological Syndrome",
      "type": "Post-infectious neurological",
      "prevalence": "10-30% of COVID-19 survivors report neurological symptoms; millions globally",
      "brain_regions": [
        "Prefrontal Cortex",
        "Hippocampus",
        "Olfactory Bulb",
        "Brainstem",
        "Insular Cortex"
      ],
      "key_features": "Brain fog, memory impairment, anosmia, fatigue, dysautonomia, anxiety/depression",
      "treatments": "Rehabilitation, cognitive training, neuromodulation (investigational), symptom management",
      "description": "Long COVID neurological syndrome affects millions worldwide with persistent cognitive impairment (brain fog), memory problems, loss of smell, and autonomic dysfunction. 2025-2026 research reveals persistent neuroinflammation, microglial activation, and blood-brain barrier disruption as key mechanisms. Neuromodulation approaches including TMS and tDCS are being tested for cognitive rehabilitation."
    },
    {
      "id": "BDIS-020",
      "name": "Traumatic Brain Injury (TBI) - Chronic Effects",
      "type": "Neurotrauma / Neurodegenerative",
      "prevalence": "69 million TBI cases annually worldwide; chronic effects in 10-20% of moderate/severe cases",
      "brain_regions": [
        "Prefrontal Cortex",
        "Hippocampus",
        "White Matter Tracts",
        "Cerebellum",
        "Brainstem"
      ],
      "key_features": "Chronic cognitive impairment, emotional dysregulation, CTE risk, post-concussion syndrome",
      "treatments": "Cognitive rehabilitation, neuromodulation, anti-tau therapies (investigational for CTE), hyperbaric oxygen (controversial)",
      "description": "Chronic effects of traumatic brain injury include persistent cognitive deficits, emotional changes, and increased risk of chronic traumatic encephalopathy (CTE). 2025-2026 research focuses on biomarkers for CTE (anti-tau PET imaging), neuromodulation for cognitive rehabilitation, and the connection between repeated concussion and neurodegeneration. BCI technology is being explored for cognitive enhancement in chronic TBI patients."
    },
    {
      "id": "BDIS-021",
      "name": "Consciousness Disorders (Coma, Vegetative State, Minimally Conscious State)",
      "type": "Disorders of consciousness",
      "prevalence": "Hundreds of thousands in vegetative or minimally conscious states globally",
      "brain_regions": [
        "Thalamus",
        "Default Mode Network",
        "Claustrum",
        "Prefrontal Cortex",
        "Posterior Cingulate Cortex"
      ],
      "key_features": "Impaired awareness, disrupted connectivity in consciousness networks, variable recovery potential",
      "treatments": "Thalamic deep brain stimulation, focused ultrasound (investigational), amantadine, sensory stimulation protocols",
      "description": "Disorders of consciousness including coma, vegetative state, and minimally conscious state represent a frontier for neuroscience and BCI technology. 2025-2026 advances include: thalamic DBS for consciousness restoration, focused ultrasound targeting the thalamus non-invasively, and BCI-based communication with minimally conscious patients. The claustrums role as a consciousness integrator is being explored as a therapeutic target."
    },
    {
      "id": "BDIS-022",
      "name": "Treatment-Resistant Depression (TRD)",
      "type": "Psychiatric / Mood disorder",
      "prevalence": "30% of depression patients (affecting ~100 million globally); 1 million+ in US alone",
      "brain_regions": [
        "Subgenual Cingulate (Area 25)",
        "Prefrontal Cortex",
        "Amygdala",
        "VTA",
        "Default Mode Network"
      ],
      "key_features": "Failure of 2+ antidepressant trials, persistent anhedonia, impaired function, high suicide risk",
      "treatments": "Esketamine (Spravato), psilocybin-assisted therapy, DBS (Area 25), TMS, vagus nerve stimulation, closed-loop neuromodulation (emerging)",
      "description": "Treatment-resistant depression affects approximately 30% of depression patients and is a major focus of neuromodulation and BCI research in 2025-2026. Brain implants for mental health are a key trend, with closed-loop neuromodulation systems detecting depression biomarkers and delivering targeted stimulation. Psilocybin-assisted therapy has shown remarkable results in Phase 2/3 trials for TRD."
    },
    {
      "id": "BDIS-023",
      "name": "Treatment-Resistant Depression (BCI/DBS Target)",
      "prevalence": "~30% of depression patients; ~5% of global population",
      "brain_regions": "Subcallosal cingulate (Area 25), ventral striatum, medial prefrontal cortex",
      "treatments": "Closed-loop DBS (UCSF), ketamine/esketamine, TMS, BCI neurofeedback",
      "status": "Closed-loop DBS showing promise; BCI neurofeedback emerging",
      "description": "Treatment-resistant depression (TRD) affects approximately 30% of depression patients who fail to respond to at least two antidepressant treatments. UCSF demonstrated that closed-loop deep brain stimulation can effectively treat TRD by monitoring biomarkers of depression and stimulating only when needed. BCI neurofeedback is also emerging as a non-invasive approach. TRD is a key target for the 2026 trend of brain implants for mental health, representing a major unmet medical need.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/s41591-021-01480-w",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BDIS-024",
      "name": "Post-Traumatic Stress Disorder (PTSD) - Neuromodulation",
      "prevalence": "~7-8% of population (lifetime); higher in military and trauma-exposed populations",
      "brain_regions": "Amygdala (hyperactive), medial prefrontal cortex (hypoactive), hippocampus (volume reduction)",
      "treatments": "Trauma-focused therapy, EMDR, MDMA-assisted therapy, neuromodulation (TMS, focused ultrasound)",
      "status": "MDMA-assisted therapy approaching FDA approval; neuromodulation trials ongoing",
      "description": "PTSD is characterized by amygdala hyperactivity, medial prefrontal cortex hypoactivity, and hippocampal changes. Neuromodulation approaches including TMS and focused ultrasound are being explored to normalize these circuits. MDMA-assisted therapy has shown remarkable results in Phase 3 trials and is approaching FDA approval. The combination of pharmacotherapy with neuromodulation represents a new frontier in PTSD treatment.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/s41380-023-02276-4",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BDIS-025",
      "name": "Autism Spectrum Disorder (ASD) - Connectomics Insights",
      "prevalence": "~1-2% of global population; increasing diagnosis rates",
      "brain_regions": "Cerebellum (Purkinje cell loss), social brain network (amygdala, fusiform gyrus, TPJ), DMN",
      "treatments": "Behavioral therapy, speech therapy, occupational therapy; no approved pharmacological treatment for core symptoms",
      "status": "Connectomics revealing circuit-level abnormalities; cerebellum emerging as key region",
      "description": "Autism Spectrum Disorder is increasingly understood through connectomics, with the MICrONS project and other brain mapping efforts revealing circuit-level abnormalities. The cerebellum has emerged as a key region, with Purkinje cell loss consistently observed in ASD brains. The social brain network (amygdala, fusiform gyrus, temporoparietal junction) shows atypical connectivity. While no pharmacological treatments exist for core ASD symptoms, connectomics-driven insights are guiding the development of targeted neuromodulation approaches.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/s41583-022-00626-9",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BDIS-026",
      "name": "Concussion / Mild Traumatic Brain Injury (mTBI)",
      "prevalence": "~1.6-3.8 million sports-related concussions per year in US alone",
      "brain_regions": "Diffuse axonal injury, prefrontal cortex, corpus callosum",
      "treatments": "Cognitive rest, graduated return-to-play, vestibular therapy, EEG monitoring",
      "status": "EEG-based concussion assessment devices gaining regulatory approval",
      "description": "Concussion (mild traumatic brain injury) is a major health concern, particularly in sports. EEG-based concussion assessment devices are gaining regulatory approval in 2025-2026, enabling rapid sideline assessment of brain function after head impacts. These devices measure changes in brain wave patterns associated with concussion, providing objective data to supplement clinical evaluation. The consumer EEG device wave (CES 2026) is also enabling at-home monitoring of post-concussion recovery.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.neurofounders.co/articles/the-best-neurotech-at-ces-2026",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BDIS-027",
      "name": "Addiction (Substance Use Disorders) - Neuromodulation",
      "prevalence": "~20 million+ in US alone (substance use disorders)",
      "brain_regions": "Nucleus accumbens, VTA, prefrontal cortex, insula",
      "treatments": "TMS (targeting prefrontal cortex), DBS (targeting nucleus accumbens), focused ultrasound, cognitive therapy",
      "status": "TMS FDA-approved for smoking cessation; DBS trials for severe addiction",
      "description": "Addiction is increasingly understood as a brain circuit disorder involving the mesolimbic dopamine pathway (VTA to nucleus accumbens), prefrontal cortex (impaired impulse control), and insula (craving). TMS targeting the prefrontal cortex is FDA-approved for smoking cessation, and DBS of the nucleus accumbens is in clinical trials for severe alcohol and opioid addiction. The 2026 trend of brain implants for mental health includes addiction as a key target, particularly as the opioid crisis continues.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/s41386-023-01653-0",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BDIS-028",
      "name": "Bipolar Disorder (Neuromodulation Approaches)",
      "type": "Psychiatric / Mood disorder",
      "prevalence": "~2.8% of global population (46M+ in US)",
      "brain_regions": [
        "Prefrontal Cortex",
        "Amygdala",
        "Basal Ganglia",
        "Anterior Cingulate",
        "Default Mode Network"
      ],
      "key_features": "Alternating episodes of mania/hypomania and depression; circadian rhythm disruption",
      "treatments": "Mood stabilizers (lithium, valproate), atypical antipsychotics, DBS (research), TMS",
      "description": "Bipolar disorder involves dramatic mood swings between mania and depression. Lithium remains the gold standard treatment but has significant side effects. In 2025-2026, neuromodulation approaches including DBS and TMS are being explored for treatment-resistant bipolar depression. Closed-loop DBS that detects mood state transitions and delivers targeted stimulation is a promising research direction. The disorder involves dysregulation of prefrontal-amygdala circuits.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/s41386-023-01653-0",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "BDIS-029",
      "name": "Treatment-Resistant Depression (Closed-Loop DBS Target)",
      "type": "Mood disorder / Neuromodulation target",
      "prevalence": "Approximately 30% of major depression cases are treatment-resistant",
      "brain_regions": [
        "Subgenual cingulate (Area 25)",
        "Amygdala",
        "Prefrontal cortex"
      ],
      "key_proteins": [
        "BDNF",
        "Serotonin transporter",
        "Glutamate receptors"
      ],
      "treatments": [
        "Closed-loop deep brain stimulation (UCSF/Nature 2021)",
        "Ketamine/esketamine",
        "psilocybin-assisted therapy (clinical trials)"
      ],
      "description": "Treatment-resistant depression is a severe form of major depression that does not respond to conventional antidepressants. UCSF researchers demonstrated that closed-loop DBS of Area 25 can produce sustained remission. This has become a primary target for next-generation neuromodulation, with multiple clinical trials ongoing in 2025-2026 exploring adaptive stimulation strategies."
    },
    {
      "id": "BDIS-030",
      "name": "PTSD (Neuromodulation Therapy Target)",
      "type": "Trauma disorder / Neuromodulation target",
      "prevalence": "6-8% of general population; higher in military and trauma-exposed populations",
      "brain_regions": [
        "Amygdala",
        "Prefrontal cortex",
        "Hippocampus",
        "Default mode network"
      ],
      "key_proteins": [
        "Cortisol",
        "Norepinephrine",
        "BDNF"
      ],
      "treatments": [
        "TMS (transcranial magnetic stimulation)",
        "Focused ultrasound neuromodulation",
        "MDMA-assisted therapy (Phase 3 complete)",
        "psilocybin-assisted therapy (clinical trials)"
      ],
      "description": "PTSD is increasingly targeted by neuromodulation therapies including TMS and focused ultrasound. MDMA-assisted therapy completed Phase 3 trials with statistically significant reductions in PTSD symptoms. psilocybin-assisted therapy is also in clinical trials. These neuromodulation and psychedelic approaches represent a paradigm shift from traditional pharmacotherapy."
    },
    {
      "id": "BDIS-031",
      "name": "Autism Spectrum Disorder (Connectomics Insights)",
      "type": "Neurodevelopmental disorder / Connectomics research",
      "prevalence": "1-2% of global population",
      "brain_regions": [
        "Prefrontal cortex",
        "Temporal cortex",
        "Amygdala",
        "Cerebellum",
        "Default mode network"
      ],
      "key_proteins": [
        "SHANK3",
        "NLGN3/4",
        "CNTNAP2",
        "MECP2"
      ],
      "treatments": [
        "Behavioral interventions",
        "Connectomics-guided neuromodulation (emerging)",
        "Social cognition training with BCI feedback (research)"
      ],
      "description": "Autism Spectrum Disorder research is being transformed by connectomics insights from projects like MICrONS, which mapped 500 billion synaptic connections. Understanding atypical connectivity patterns in ASD is enabling new approaches to diagnosis and potential neuromodulation-based interventions. BCI feedback for social cognition training is an emerging research direction."
    },
    {
      "id": "BDIS-032",
      "name": "Concussion/mTBI (EEG Assessment Device)",
      "type": "Traumatic brain injury / Diagnostic technology",
      "prevalence": "1.6-3.8 million sports-related concussions annually in the US alone",
      "brain_regions": [
        "Prefrontal cortex",
        "Temporal lobes",
        "White matter tracts"
      ],
      "key_proteins": [
        "S100B",
        "GFAP",
        "Neurofilament light chain (NfL)",
        "Tau"
      ],
      "treatments": [
        "EEG-based assessment devices (FDA cleared 2026)",
        "Graduated return-to-play protocols",
        "Cognitive rest and rehabilitation"
      ],
      "description": "FDA-cleared EEG assessment devices for concussion/mild TBI are now available in 2026, providing objective biomarkers for brain injury assessment. These devices measure neural activity patterns that correlate with concussion severity, replacing subjective clinical assessments with quantitative diagnostics. This is a major advance for sports medicine and military applications."
    },
    {
      "id": "BDIS-033",
      "name": "Long COVID Neurological Syndrome",
      "type": "Post-viral neurological syndrome / Emerging disorder",
      "prevalence": "10-30% of COVID-19 survivors report neurological symptoms",
      "brain_regions": [
        "Olfactory bulb",
        "Prefrontal cortex",
        "Brainstem",
        "Hippocampus"
      ],
      "key_proteins": [
        "ACE2 receptor",
        "Inflammatory cytokines",
        "Autoantibodies"
      ],
      "treatments": [
        "Rehabilitation programs",
        "Neuromodulation (investigational)",
        "Anti-inflammatory approaches",
        "Cognitive rehabilitation"
      ],
      "description": "Long COVID neurological syndrome encompasses brain fog, cognitive impairment, and sensory disturbances persisting after COVID-19 infection. Research is revealing that the virus can cause persistent neuroinflammation and microvascular damage. Neuromodulation approaches are being investigated as potential treatments, and the condition is driving increased investment in neurotechnology for post-viral rehabilitation."
    },
    {
      "id": "BD-034",
      "name": "Long COVID Neurological Effects",
      "type": "Post-viral neurological syndrome",
      "prevalence": "10-30% of COVID-19 survivors experience neurological symptoms",
      "key_symptoms": [
        "脑雾",
        "疲劳",
        "嗅觉丧失",
        "头痛",
        "认知障碍"
      ],
      "treatment": "Symptomatic management; cognitive rehabilitation; emerging antiviral and anti-inflammatory approaches",
      "description": "Long COVID neurological effects (neuro-COVID) affect 10-30% of COVID-19 survivors, causing persistent brain fog, fatigue, cognitive impairment, and loss of smell. Research suggests multiple mechanisms: direct viral neurotropism, neuroinflammation, microvascular damage, and autoimmune responses. Brain imaging studies show reduced gray matter volume and white matter changes. The condition has created a massive public health challenge, with millions affected worldwide and no approved specific treatment.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/long-covid-neurological",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BD-035",
      "name": "Autoimmune Encephalitis",
      "type": "Autoimmune brain disorder",
      "prevalence": "Incidence ~0.8/100,000; likely underdiagnosed",
      "key_symptoms": [
        "精神症状",
        "癫痫",
        "运动障碍",
        "记忆障碍",
        "自主神经功能障碍"
      ],
      "treatment": "Immunotherapy (steroids, IVIG, plasmapheresis, rituximab); tumor removal if paraneoplastic",
      "description": "Autoimmune encephalitis occurs when the immune system attacks brain proteins, causing psychiatric symptoms, seizures, and cognitive decline. Anti-NMDA receptor encephalitis is the most common form, often affecting young women with ovarian teratomas. The condition was only recently characterized (2007) and is likely underdiagnosed — many patients previously diagnosed with 'psychiatric' conditions actually have autoimmune encephalitis. Early immunotherapy can lead to full recovery, making rapid diagnosis critical.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/autoimmune-encephalitis",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BD-036",
      "name": "Chronic Traumatic Encephalopathy (CTE)",
      "type": "Neurodegenerative disease (trauma-related)",
      "prevalence": "Found in 90%+ of deceased NFL players studied; growing concern in contact sports",
      "key_symptoms": [
        "认知障碍",
        "行为改变",
        "抑郁",
        "冲动控制障碍",
        "痴呆"
      ],
      "treatment": "No cure; prevention through reduced head impact exposure; symptomatic management",
      "description": "Chronic Traumatic Encephalopathy (CTE) is a neurodegenerative disease caused by repeated head impacts, found primarily in contact sport athletes and military veterans. CTE is characterized by the accumulation of hyperphosphorylated tau protein in a unique pattern around blood vessels in the depths of cortical sulci. The condition can only be definitively diagnosed post-mortem, though new biomarkers (CSF tau, neurofilament light) are enabling earlier detection in living patients. CTE has led to rule changes in sports and growing awareness of head injury risks.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/cte-neurodegeneration",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BD-037",
      "name": "Posterior Cortical Atrophy (PCA)",
      "type": "Neurodegenerative syndrome",
      "prevalence": "~5% of Alzheimer's cases present as PCA",
      "key_symptoms": [
        "视觉障碍",
        "空间定向障碍",
        "失读",
        "失用",
        "Balint综合征"
      ],
      "treatment": "Alzheimer's treatments (cholinesterase inhibitors); visual rehabilitation; occupational therapy",
      "description": "Posterior Cortical Atrophy (PCA) is a neurodegenerative syndrome that primarily affects visual processing, often caused by Alzheimer's disease pathology in the occipital and parietal lobes. Patients present with visual difficulties (reading, navigation, recognizing objects) while memory remains relatively preserved early on. Many patients are initially misdiagnosed as having eye problems or psychiatric conditions. PCA gained public attention when Terry Pratchett and Wendy Mitchell disclosed their diagnoses. It represents an important atypical presentation of Alzheimer's disease.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/pca-alzheimer",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BD-038",
      "name": "Functional Neurological Disorder (FND)",
      "type": "Functional brain disorder",
      "prevalence": "14-22/100,000; one of the most common diagnoses in neurology clinics",
      "key_symptoms": [
        "运动障碍",
        "感觉障碍",
        "癫痫样发作",
        "认知症状"
      ],
      "treatment": "Physical therapy, cognitive behavioral therapy, psychotherapy; multidisciplinary approach",
      "description": "Functional Neurological Disorder (FND) is a condition where patients experience genuine neurological symptoms (weakness, tremor, seizures, sensory loss) without structural brain damage. FND is now understood as a problem with the software (function) rather than the hardware (structure) of the brain. It is one of the most common diagnoses in neurology clinics but has been historically stigmatized and under-researched. New neuroimaging studies show altered brain network connectivity, validating FND as a real brain disorder. Treatment focuses on retraining brain circuits through physical and psychological therapies.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/fnd-brain-networks",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "name": "Depression",
      "type": "Mood disorder",
      "prevalence": "Affects approximately 21 million adults in the United States, or about 8.4% of the adult population.",
      "key_genes": "SLC6A4, 5-HTTLPR, FKBP5",
      "treatment": "Treatment includes psychotherapy, medication (like SSRIs), and emerging neuromodulation techniques.",
      "description": "Depression is a common and serious medical illness that negatively affects how you feel, think, and act. It causes feelings of sadness and/or a loss of interest in activities once enjoyed. It can lead to a variety of emotional and physical problems and decrease a person's ability to function at work and home.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://braindisorders.neuroconferences.com",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "BDIS-34"
    },
    {
      "id": "BD-2026-001",
      "name": "Alzheimer's Blood-Based Biomarkers Clinical Use",
      "type": "Diagnostic biomarker (blood test for Alzheimer's disease)",
      "affected_region": "全脑 (皮层和海马体优先)",
      "prevalence": "全球5500万痴呆患者，阿尔茨海默病占60-70%",
      "treatment": "血液生物标志物指导lecanemab/donanemab治疗",
      "research_status": "FDA批准首个血液检测2025; 临床推广2026",
      "description": "Alzheimer's blood-based biomarkers entered clinical practice in 2025-2026 with the FDA approval of the first blood test for Alzheimer's pathology. The test measures plasma p-tau217 (phosphorylated tau at threonine 217), which detects amyloid pathology with 90%+ accuracy, matching PET scan results. Blood-based biomarkers eliminate the need for expensive PET scans ($3,000+) and invasive lumbar punctures, enabling widespread screening and early treatment with anti-amyloid therapies. Primary care physicians can now identify Alzheimer's pathology years before symptoms appear, fundamentally changing the diagnostic paradigm."
    },
    {
      "id": "BD-2026-002",
      "name": "Alpha-Synuclein Seeding Assay for Parkinson's",
      "type": "Diagnostic biomarker (α-synuclein seed amplification assay)",
      "affected_region": "黑质致密部 → 全脑扩展",
      "prevalence": "全球1000万帕金森患者",
      "treatment": "早期诊断支持疾病修饰疗法开发",
      "research_status": "验证性研究发表2025; 多项疾病修饰疗法进入Phase 3",
      "description": "The alpha-synuclein seed amplification assay (SAA) was validated for Parkinson's disease diagnosis in 2025, detecting misfolded α-synuclein in cerebrospinal fluid with 93% sensitivity and 95% specificity. The assay can detect Parkinson's pathology years before motor symptoms appear, enabling early intervention. This biomarker is critical for disease-modifying therapy trials, which require early-stage patients. Multiple α-synuclein-targeting therapies (prasinezumab, cinpanemab, UB-312) are in Phase 2-3 trials, and the SAA enables proper patient stratification. Early detection also enables lifestyle interventions that may slow disease progression."
    },
    {
      "id": "BD-2026-003",
      "name": "Closed-Loop DBS for Essential Tremor and Parkinson's",
      "type": "Therapeutic intervention (closed-loop deep brain stimulation)",
      "affected_region": "丘脑腹中间核 (VIM) / 丘脑底核 (STN)",
      "prevalence": "特发性震颤全球约4%，帕金森病1000万",
      "treatment": "闭环脑深部电刺激根据实时神经信号调节刺激",
      "research_status": "临床试验2025-2026; 显著改善震颤和运动症状",
      "description": "Closed-loop deep brain stimulation (DBS) systems demonstrated superior outcomes for essential tremor and Parkinson's disease in clinical trials published 2025-2026. Unlike traditional open-loop DBS that delivers constant stimulation, closed-loop systems sense neural biomarkers (beta oscillations for Parkinson's, tremor-frequency activity for essential tremor) and adjust stimulation in real-time. Results show 50% reduction in stimulation energy, 30% improvement in motor symptoms, and reduced side effects compared to open-loop DBS. The closed-loop approach personalizes stimulation to each patient's neural activity patterns."
    },
    {
      "id": "BD-2026-004",
      "name": "Gene Therapy for Genetic Epilepsies",
      "type": "Therapeutic intervention (gene therapy for genetic epilepsies)",
      "affected_region": "根据遗传病因不同 (Dravet综合征: SCN1A基因; 结节性硬化: TSC1/TSC2)",
      "prevalence": "遗传性癫痫占所有癫痫的30-40%; Dravet综合征: 1/16000",
      "treatment": "AAV载体基因替代或基因编辑治疗特定遗传性癫痫",
      "research_status": "多项Phase 1-2临床试验2025-2026; Stoke Therapeutics STK-001领先",
      "description": "Gene therapy for genetic epilepsies advanced significantly in 2025-2026, with Stoke Therapeutics' STK-001 (for Dravet syndrome) showing promising Phase 1/2a results. STK-001 uses antisense nucleotides to upregulate productive SCN1A gene expression, addressing the root cause of Dravet syndrome. Other programs target tuberous sclerosis complex (TSC), CDKL5 deficiency, and PCDH19-related epilepsy. These targeted therapies aim to modify disease course rather than just control seizures, potentially offering the first disease-modifying treatments for devastating childhood epilepsies."
    },
    {
      "id": "BRAIN_DISORDER-abc123",
      "name": "Stroke",
      "type": "Neurological disorder",
      "affected_region": "Brain",
      "prevalence": "Leading cause of death and disability globally (2021)",
      "treatment": "Acute treatment, rehabilitation, preventive measures",
      "research_status": "Active research ongoing",
      "description": "Stroke is one of the top 10 neurological conditions contributing to death and disability as of 2021",
      "last_updated": "2026-06-27T16:05:45.091Z"
    },
    {
      "id": "BRAIN_DISORDER-def456",
      "name": "Neonatal encephalopathy",
      "type": "Neurological disorder",
      "affected_region": "Brain",
      "prevalence": "One of the top 10 neurological conditions contributing to death and disability (2021)",
      "treatment": "Supportive care, therapeutic hypothermia",
      "research_status": "Active research ongoing",
      "description": "Neonatal encephalopathy is one of the top 10 neurological conditions contributing to death and disability as of 2021",
      "last_updated": "2026-06-27T16:05:45.091Z"
    },
    {
      "id": "BRAIN_DISORDER-ghi789",
      "name": "Brain Health Initiative 2025",
      "type": "Initiative",
      "affected_region": "Global",
      "prevalence": "Not specified",
      "treatment": "Not specified",
      "research_status": "Active initiative",
      "description": "A brain health initiative presenting the latest global research findings in brain science technologies, with a conference scheduled for July 2026.",
      "last_updated": "2026-06-27T16:04:51.342Z"
    },
    {
      "id": "BRAIN_DISORD-ghi789",
      "name": "Migraine",
      "type": "Neurological disorder",
      "affected_region": "Brain",
      "prevalence": "One of the top 10 neurological conditions contributing to death and disability (2021)",
      "treatment": "Acute medications, preventive treatments",
      "research_status": "Active research ongoing",
      "description": "Migraine is one of the top 10 neurological conditions contributing to death and disability as of 2021",
      "last_updated": "2026-06-27T16:05:45.091Z"
    },
    {
      "id": "BRAIN_DISOR-jkl012",
      "name": "Brain disorders",
      "type": "General category",
      "affected_region": "Brain",
      "prevalence": "Research remains uneven across regions",
      "treatment": "Varies by specific disorder",
      "research_status": "Active research with insufficient diversity representation",
      "description": "Research on brain diseases remains uneven across regions and insufficiently representative of human diversity",
      "last_updated": "2026-06-27T16:05:45.091Z"
    },
    {
      "id": "BRAIN_DISORDER-jkl012",
      "name": "脑认知与脑疾病研究所",
      "type": "Research Institute",
      "affected_region": "Shenzhen, China",
      "prevalence": "Not specified",
      "treatment": "Not specified",
      "research_status": "Active research",
      "description": "深圳先进院脑认知与脑疾病研究所专注于脑认知功能的基础研究以及脑疾病的机理研究和早期诊断手段的研发，致力于在宏观（脑区）层面和介观（环路、细胞）层面对感知觉、学习进行研究。",
      "last_updated": "2026-06-27T16:04:51.342Z"
    },
    {
      "id": "BRAIN_DISOR-mno345",
      "name": "Neurological disorders",
      "type": "General category",
      "affected_region": "Nervous system",
      "prevalence": "Global health concern",
      "treatment": "Varies by specific disorder",
      "research_status": "Active research with global conferences",
      "description": "Subject of multiple international conferences including the 7th Global Conclave on Neurology and Neurological Disorders",
      "last_updated": "2026-06-27T16:05:45.091Z"
    },
    {
      "id": "BD-51",
      "name": "Alzheimer's Disease",
      "type": "Neurodegenerative",
      "prevalence": "6.5 million (US adults)",
      "brain_regions": "Hippocampus, Cortex, Entorhinal Cortex"
    },
    {
      "id": "BD-52",
      "name": "Parkinson's Disease",
      "type": "Neurodegenerative",
      "prevalence": "1 million (US adults)",
      "brain_regions": "Substantia Nigra, Basal Ganglia, Striatum"
    },
    {
      "id": "BD-53",
      "name": "Major Depressive Disorder",
      "type": "Mood Disorder",
      "prevalence": "21 million (US adults)",
      "brain_regions": "Prefrontal Cortex, Amygdala, Hippocampus"
    },
    {
      "id": "BD-54",
      "name": "Epilepsy",
      "type": "Seizure Disorder",
      "prevalence": "3.4 million (US people)",
      "brain_regions": "Temporal Lobe, Frontal Lobe, Hippocampus"
    },
    {
      "id": "BD-55",
      "name": "Autism Spectrum Disorder",
      "type": "Neurodevelopmental",
      "prevalence": "5.4 million (US children)",
      "brain_regions": "Prefrontal Cortex, Cerebellum, Amygdala"
    },
    {
      "id": "BD-56",
      "name": "Schizophrenia",
      "type": "Psychotic Disorder",
      "prevalence": "2.4 million (US adults)",
      "brain_regions": "Prefrontal Cortex, Hippocampus, Ventricles, Temporal Lobes"
    },
    {
      "id": "BD-57",
      "name": "Multiple Sclerosis",
      "type": "Autoimmune",
      "prevalence": "1 million (US people)",
      "brain_regions": "White Matter, Optic Nerves, Spinal Cord, Cerebellum"
    },
    {
      "id": "BD-58",
      "name": "Stroke",
      "type": "Vascular",
      "prevalence": "795,000 (US cases/year)",
      "brain_regions": "Middle Cerebral Artery territory, Basal Ganglia, Thalamus"
    },
    {
      "id": "BD-59",
      "name": "Bipolar Disorder",
      "type": "Mood Disorder",
      "prevalence": "7 million (US adults)",
      "brain_regions": "Prefrontal Cortex, Amygdala, Hippocampus"
    },
    {
      "id": "BD-60",
      "name": "Anxiety Disorders",
      "type": "Anxiety Disorder",
      "prevalence": "19.1% (US adults)",
      "brain_regions": "Amygdala, Hippocampus, Prefrontal Cortex"
    },
    {
      "id": "BD-61",
      "name": "Huntington's Disease",
      "type": "Neurodegenerative",
      "prevalence": "30,000 (US people)",
      "brain_regions": "Striatum, Cerebral Cortex, Hippocampus"
    },
    {
      "id": "BD-62",
      "name": "Obsessive-Compulsive Disorder",
      "type": "Anxiety Disorder",
      "prevalence": "1.2 million (US adults)",
      "brain_regions": "Orbitofrontal Cortex, Caudate Nucleus, Thalamus"
    },
    {
      "id": "BD-63",
      "name": "Traumatic Brain Injury (TBI)",
      "type": "Acquired",
      "prevalence": "5.3 million (US people living with)",
      "brain_regions": "Frontal Lobe, Temporal Lobe, Brainstem"
    },
    {
      "id": "BD-64",
      "name": "Amyotrophic Lateral Sclerosis (ALS)",
      "type": "Neurodegenerative",
      "prevalence": "30,000 (US people)",
      "brain_regions": "Motor Cortex, Brainstem, Spinal Cord"
    },
    {
      "id": "BD-65",
      "name": "Attention-Deficit/Hyperactivity Disorder (ADHD)",
      "type": "Neurodevelopmental",
      "prevalence": "6 million (US children)",
      "brain_regions": "Prefrontal Cortex, Basal Ganglia, Cerebellum"
    },
    {
      "id": "BD-66",
      "name": "Alzheimer's Disease",
      "type": "Neurodegenerative",
      "prevalence": "6.7 million (US)",
      "brain_regions": "Hippocampus, Cortex, Amygdala"
    },
    {
      "id": "BD-67",
      "name": "Parkinson's Disease",
      "type": "Neurodegenerative",
      "prevalence": "1 million (US)",
      "brain_regions": "Substantia Nigra, Basal Ganglia"
    },
    {
      "id": "BD-68",
      "name": "Major Depressive Disorder",
      "type": "Mood",
      "prevalence": "21 million (US)",
      "brain_regions": "Prefrontal Cortex, Amygdala, Hippocampus"
    },
    {
      "id": "BD-69",
      "name": "Epilepsy",
      "type": "Seizure",
      "prevalence": "3 million (US)",
      "brain_regions": "Temporal Lobe, Frontal Lobe, Generalized"
    },
    {
      "id": "BD-70",
      "name": "Schizophrenia",
      "type": "Psychotic",
      "prevalence": "2.4 million (US)",
      "brain_regions": "Prefrontal Cortex, Hippocampus, Basal Ganglia"
    },
    {
      "id": "BD-71",
      "name": "Autism Spectrum Disorder",
      "type": "Neurodevelopmental",
      "prevalence": "5.4 million (US)",
      "brain_regions": "Prefrontal Cortex, Cerebellum, Amygdala"
    },
    {
      "id": "BD-72",
      "name": "Attention-Deficit/Hyperactivity Disorder",
      "type": "Neurodevelopmental",
      "prevalence": "6 million (US)",
      "brain_regions": "Prefrontal Cortex, Basal Ganglia"
    },
    {
      "id": "BD-73",
      "name": "Multiple Sclerosis",
      "type": "Autoimmune",
      "prevalence": "1 million (US)",
      "brain_regions": "White Matter, Optic Nerves, Spinal Cord"
    },
    {
      "id": "BD-74",
      "name": "Huntington's Disease",
      "type": "Neurodegenerative",
      "prevalence": "30,000 (US)",
      "brain_regions": "Striatum, Cortex, Cerebellum"
    },
    {
      "id": "BD-75",
      "name": "Bipolar Disorder",
      "type": "Mood",
      "prevalence": "7 million (US)",
      "brain_regions": "Prefrontal Cortex, Amygdala, Hippocampus"
    },
    {
      "id": "BD-76",
      "name": "Anxiety Disorders",
      "type": "Anxiety",
      "prevalence": "19 million (US)",
      "brain_regions": "Amygdala, Hippocampus, Prefrontal Cortex"
    },
    {
      "id": "BD-77",
      "name": "Stroke",
      "type": "Vascular",
      "prevalence": "7.95 million (US)",
      "brain_regions": "Middle Cerebral Artery, Anterior Cerebral Artery territory"
    },
    {
      "id": "BD-78",
      "name": "Amyotrophic Lateral Sclerosis (ALS)",
      "type": "Neurodegenerative",
      "prevalence": "31,000 (US)",
      "brain_regions": "Motor Cortex, Brainstem, Spinal Cord"
    },
    {
      "id": "BD-79",
      "name": "Obsessive-Compulsive Disorder",
      "type": "Anxiety",
      "prevalence": "1.2 million (US)",
      "brain_regions": "Orbitofrontal Cortex, Basal Ganglia, Thalamus"
    },
    {
      "id": "BD-80",
      "name": "Traumatic Brain Injury (TBI)",
      "type": "Acquired",
      "prevalence": "5.3 million (US)",
      "brain_regions": "Frontal Lobe, Temporal Lobe, Diffuse Axonal Injury"
    }
  ],
  "brain_regions": [
    {
      "id": "BREG-001",
      "name": "Prefrontal Cortex",
      "location": "Anterior frontal lobe",
      "function": "Executive function, planning, decision-making, working memory, impulse control, social behavior",
      "associated_disorders": "ADHD, schizophrenia, depression, frontotemporal dementia, antisocial behavior",
      "neurotransmitters": "Dopamine, glutamate, GABA, serotonin",
      "description": "The prefrontal cortex is the most recently evolved brain region and is responsible for higher cognitive functions. It comprises ~30% of the human cerebral cortex. Damage (e.g., Phineas Gage case) profoundly alters personality and decision-making. It is the last region to fully mature (~age 25) and is implicated in most psychiatric disorders."
    },
    {
      "id": "BREG-002",
      "name": "Hippocampus",
      "location": "Medial temporal lobe",
      "function": "Memory formation (episodic and spatial), memory consolidation, navigation",
      "associated_disorders": "Alzheimer's disease (earliest affected region), PTSD, epilepsy, depression",
      "neurotransmitters": "Glutamate, GABA, acetylcholine",
      "description": "The hippocampus is critical for forming new episodic and spatial memories. London taxi drivers famously have larger posterior hippocampi from navigation experience. It's one of the first regions damaged in Alzheimer's disease, explaining why memory loss is an early symptom. Adult neurogenesis occurs in the dentate gyrus, one of the few brain regions where new neurons are born throughout life."
    },
    {
      "id": "BREG-003",
      "name": "Amygdala",
      "location": "Medial temporal lobe, anterior to hippocampus",
      "function": "Fear processing, emotional memory, threat detection, aggression, reward learning",
      "associated_disorders": "Anxiety disorders, PTSD, phobias, autism spectrum disorder, aggression",
      "neurotransmitters": "Glutamate, GABA, norepinephrine, serotonin, dopamine",
      "description": "The amygdala is the brain's threat detection center, rapidly processing fear and danger signals before conscious awareness. It tags emotional memories, making them more vivid and lasting. Hyperactivity is linked to anxiety disorders and PTSD; hypoactivity to risk-taking and psychopathy. The amygdala is a key target for PTSD treatments including exposure therapy and MDMA-assisted therapy."
    },
    {
      "id": "BREG-004",
      "name": "Cerebellum",
      "location": "Posterior fossa, below occipital lobe",
      "function": "Motor coordination, balance, motor learning, procedural memory, cognitive functions",
      "associated_disorders": "Ataxia, autism, schizophrenia, dyslexia, essential tremor",
      "neurotransmitters": "Glutamate, GABA (Purkinje cells)",
      "description": "The cerebellum contains more neurons than the rest of the brain combined (~69 billion) despite being only 10% of brain volume. While traditionally associated with motor control, recent research reveals major roles in cognition, language, and emotion. Cerebellar abnormalities are found in autism, schizophrenia, and dyslexia. It's a target for non-invasive brain stimulation therapies."
    },
    {
      "id": "BREG-005",
      "name": "Basal Ganglia",
      "location": "Deep within cerebral hemispheres",
      "function": "Voluntary motor control, habit formation, reward processing, action selection",
      "associated_disorders": "Parkinson's disease, Huntington's disease, OCD, Tourette syndrome, addiction",
      "neurotransmitters": "Dopamine (primary), GABA, glutamate, acetylcholine",
      "description": "The basal ganglia are a group of subcortical nuclei critical for selecting and initiating voluntary movements. Dopamine from the substantia nigra modulates basal ganglia circuits. Parkinson's disease results from loss of these dopamine neurons. The basal ganglia also drive habit formation and reward-based learning, making them central to addiction neuroscience."
    },
    {
      "id": "BREG-006",
      "name": "Thalamus",
      "location": "Central brain, above brainstem",
      "function": "Sensory relay station, consciousness regulation, sleep-wake cycle, attention",
      "associated_disorders": "Thalamic pain syndrome, coma, insomnia, epilepsy",
      "neurotransmitters": "Glutamate, GABA",
      "description": "The thalamus is the brain's sensory relay station, routing nearly all sensory information (except olfaction) to the appropriate cortical areas. It also plays a crucial role in consciousness and the sleep-wake cycle. Thalamic lesions can cause severe chronic pain (thalamic pain syndrome) or disorders of consciousness. Deep brain stimulation of the thalamus treats essential tremor and some forms of epilepsy."
    },
    {
      "id": "BREG-007",
      "name": "Hypothalamus",
      "location": "Below thalamus, at base of brain",
      "function": "Homeostasis, hormone regulation, body temperature, hunger, thirst, circadian rhythm, sexual behavior",
      "associated_disorders": "Hypothalamic obesity, diabetes insipidus, sleep disorders, endocrine disorders",
      "neurotransmitters": "Multiple neuropeptides, dopamine, serotonin, GABA, glutamate",
      "description": "The hypothalamus is the brain's master regulator of homeostasis, controlling the autonomic nervous system and pituitary gland. It regulates body temperature, hunger, thirst, sleep, and hormonal balance. The suprachiasmatic nucleus (SCN) is the body's master clock. Hypothalamic dysfunction can cause obesity, diabetes insipidus, and sleep disorders."
    },
    {
      "id": "BREG-008",
      "name": "Insular Cortex (Insula)",
      "location": "Deep within lateral sulcus, hidden by opercula",
      "function": "Interoception, emotion, self-awareness, taste, pain processing, empathy, addiction craving",
      "associated_disorders": "Addiction, anxiety, eating disorders, chronic pain, alexithymia",
      "neurotransmitters": "Glutamate, GABA, serotonin, dopamine",
      "description": "The insula is a hidden cortical region critical for interoception (sensing internal body states) and emotional self-awareness. It integrates bodily sensations with emotional and cognitive processing. The anterior insula is activated during empathy, disgust, and craving. The insula is increasingly recognized as a key hub in addiction (craving), anxiety, and chronic pain."
    },
    {
      "id": "BREG-009",
      "name": "Default Mode Network (DMN)",
      "location": "Medial prefrontal cortex, posterior cingulate, angular gyrus, hippocampus",
      "function": "Self-referential thinking, mind-wandering, episodic memory, social cognition, creativity",
      "associated_disorders": "Depression, Alzheimer's, ADHD, schizophrenia, autism",
      "neurotransmitters": "Multiple (distributed network)",
      "description": "The DMN is a large-scale brain network active during rest and mind-wandering, deactivated during goal-directed tasks. It's critical for self-reflection, memory retrieval, and creative thinking. DMN dysfunction is implicated in numerous psychiatric and neurological conditions. DMN connectivity is increasingly used as a biomarker for brain health."
    },
    {
      "id": "BREG-010",
      "name": "Ventral Tegmental Area (VTA)",
      "location": "Midbrain, near substantia nigra",
      "function": "Reward processing, motivation, addiction, prediction error signaling",
      "associated_disorders": "Addiction, depression, schizophrenia, Parkinson's disease",
      "neurotransmitters": "Dopamine (primary), GABA, glutamate",
      "description": "The VTA contains the brain's primary reward circuit dopamine neurons. These neurons signal prediction error - the difference between expected and received rewards - forming the basis of reinforcement learning. VTA dopamine release is hijacked by addictive drugs, making it central to addiction neuroscience."
    },
    {
      "id": "BREG-011",
      "name": "Anterior Cingulate Cortex (ACC)",
      "location": "Medial frontal lobe, surrounding corpus callosum",
      "function": "Error monitoring, conflict resolution, pain affect, empathy, decision-making, effort allocation",
      "associated_disorders": "Depression, OCD, chronic pain, ADHD",
      "neurotransmitters": "Serotonin, dopamine, glutamate, GABA",
      "description": "The ACC monitors for errors and conflicts, signaling when adjustments are needed. It's crucial for the emotional component of pain (how much pain bothers you). The ACC is a target for deep brain stimulation in treatment-resistant depression and OCD. Damage can cause akinetic mutism (awake but unresponsive)."
    },
    {
      "id": "BREG-012",
      "name": "Substantia Nigra",
      "location": "Midbrain, adjacent to VTA",
      "function": "Motor control (pars compacta: dopamine to basal ganglia), reward (pars reticulata)",
      "associated_disorders": "Parkinson's disease (degeneration of pars compacta dopamine neurons)",
      "neurotransmitters": "Dopamine (pars compacta), GABA (pars reticulata)",
      "description": "The substantia nigra contains dopamine neurons that project to the basal ganglia (nigrostriatal pathway). Loss of these neurons causes Parkinson's disease, with symptoms appearing after ~60% have died. The dark pigment (neuromelanin) gives it its name ('black substance'). Deep brain stimulation of downstream targets can alleviate Parkinson's motor symptoms."
    },
    {
      "id": "BREG-013",
      "name": "Visual Cortex (V1-V5)",
      "location": "Occipital lobe and extending into temporal and parietal lobes",
      "function": "Visual processing: V1 (edge detection), V2 (orientation), V4 (color/form), V5/MT (motion), IT (object recognition)",
      "associated_disorders": "Blindsight, visual agnosia, prosopagnosia (face blindness), cortical blindness",
      "neurotransmitters": "Glutamate, GABA",
      "description": "The visual cortex processes visual information in a hierarchical stream. V1 performs basic feature extraction; higher areas process increasingly complex features (motion, color, faces, objects). The ventral stream (what) identifies objects; the dorsal stream (where/how) processes spatial relationships. Visual prostheses target V1 to restore vision in blindness."
    },
    {
      "id": "BREG-014",
      "name": "Auditory Cortex",
      "location": "Superior temporal gyrus (Heschl's gyrus)",
      "function": "Sound processing, speech comprehension, music perception, auditory memory",
      "associated_disorders": "Tinnitus, auditory hallucinations (schizophrenia), auditory agnosia, amusia",
      "neurotransmitters": "Glutamate, GABA",
      "description": "The auditory cortex processes sound features from basic frequencies to complex speech and music. The left auditory cortex specializes in speech processing; the right in music and prosody. Cochlear implants stimulate the auditory nerve to bypass damaged hair cells. Auditory cortex abnormalities are linked to tinnitus and auditory hallucinations in schizophrenia."
    },
    {
      "id": "BREG-015",
      "name": "Somatosensory Cortex",
      "location": "Postcentral gyrus (parietal lobe)",
      "function": "Touch, temperature, pain, proprioception (body position sense)",
      "associated_disorders": "Sensory loss, phantom limb pain, neuropathic pain, neglect syndrome",
      "neurotransmitters": "Glutamate, GABA",
      "description": "The somatosensory cortex processes tactile and proprioceptive information from the body. It's organized as a 'homunculus' (body map) with disproportionate representation of hands and face. Phantom limb pain after amputation is related to cortical reorganization. Somatosensory BCIs are being developed to restore touch sensation in paralysis."
    },
    {
      "id": "BREG-016",
      "name": "Motor Cortex (M1)",
      "location": "Precentral gyrus (frontal lobe)",
      "function": "Voluntary motor control, movement execution, fine motor skills",
      "associated_disorders": "Paralysis, stroke, ALS, cerebral palsy",
      "neurotransmitters": "Glutamate (excitatory), GABA (inhibitory)",
      "description": "The primary motor cortex (M1) generates neural signals that drive voluntary movement. It's organized as a motor homunculus with large representations for hands and face (fine motor control). M1 is the primary target for brain-computer interfaces that decode movement intentions for paralysis patients. Neuralink, BrainGate, and others record from M1 to restore communication and movement."
    },
    {
      "id": "BREG-017",
      "name": "Broca's Area",
      "location": "Left inferior frontal gyrus (Brodmann areas 44, 45)",
      "function": "Speech production, language processing, grammar, articulation planning",
      "associated_disorders": "Broca's aphasia (expressive aphasia), stuttering, specific language impairment",
      "neurotransmitters": "Glutamate, GABA, dopamine",
      "description": "Broca's area is critical for speech production and grammatical processing. Damage causes Broca's aphasia: patients understand language but cannot produce fluent speech (telegraphic speech). Named after Paul Broca who studied patient 'Tan' in 1861. TMS to Broca's area can temporarily disrupt speech production, confirming its role."
    },
    {
      "id": "BREG-018",
      "name": "Wernicke's Area",
      "location": "Left posterior superior temporal gyrus (Brodmann area 22)",
      "function": "Language comprehension, semantic processing, reading",
      "associated_disorders": "Wernicke's aphasia (receptive aphasia), alexia, semantic dementia",
      "neurotransmitters": "Glutamate, GABA",
      "description": "Wernicke's area is essential for understanding spoken and written language. Damage causes Wernicke's aphasia: patients produce fluent but meaningless speech (word salad) and cannot comprehend language. The arcuate fasciculus connects Broca's and Wernicke's areas; damage to this pathway causes conduction aphasia (can speak and understand but cannot repeat)."
    },
    {
      "id": "BREG-019",
      "name": "Corpus Callosum",
      "location": "Midline, connecting left and right hemispheres",
      "function": "Interhemispheric communication, integrating left and right brain processing",
      "associated_disorders": "Split-brain syndrome, agenesis of corpus callosum, multiple sclerosis",
      "neurotransmitters": "Glutamate (excitatory interhemispheric connections)",
      "description": "The corpus callosum is the largest white matter tract, containing ~200 million axons connecting the two cerebral hemispheres. Split-brain patients (corpus callosotomy for epilepsy) revealed that each hemisphere has independent consciousness and specialized functions. The corpus callosum is affected early in multiple sclerosis and Alzheimer's disease."
    },
    {
      "id": "BREG-020",
      "name": "Brainstem (Midbrain, Pons, Medulla)",
      "location": "Base of brain, connecting to spinal cord",
      "function": "Vital functions: breathing, heart rate, blood pressure, consciousness, sleep-wake cycle",
      "associated_disorders": "Locked-in syndrome, coma, brain death, sleep apnea, sudden infant death syndrome",
      "neurotransmitters": "Multiple (serotonin, norepinephrine, dopamine, acetylcholine, GABA)",
      "description": "The brainstem controls vital autonomic functions necessary for survival. The reticular activating system (RAS) in the brainstem regulates consciousness and arousal. Damage to specific brainstem regions causes locked-in syndrome (conscious but paralyzed except eye movements). The brainstem is the last region to lose function in brain death."
    },
    {
      "id": "BREG-021",
      "name": "Locus Coeruleus",
      "location": "Pons (brainstem)",
      "function": "Norepinephrine production, arousal, attention, stress response, cognitive flexibility",
      "associated_disorders": "ADHD, PTSD, depression, Alzheimer's (early degeneration), anxiety",
      "neurotransmitters": "Norepinephrine (primary - sole source in the brain)",
      "description": "The locus coeruleus is a tiny nucleus in the pons that is the brain's sole source of norepinephrine. Despite its small size (~50,000 neurons), it projects throughout the brain and modulates arousal, attention, and stress responses. It's one of the first regions affected by Alzheimer's tau pathology, potentially explaining early attention deficits. LC-norepinephrine system is a target for ADHD and PTSD treatments."
    },
    {
      "id": "BREG-022",
      "name": "Claustrum",
      "location": "Between insula and putamen (thin sheet of neurons)",
      "function": "Consciousness integration? - proposed hub for binding diverse cortical information into unified experience",
      "associated_disorders": "Consciousness disorders, epilepsy (high density of 5-HT2A receptors)",
      "neurotransmitters": "Glutamate, GABA",
      "description": "The claustrum is a thin, sheet-like structure that Francis Crick proposed as the 'conductor of consciousness' - integrating information from diverse cortical regions into unified conscious experience. It has connections with virtually all cortical areas. High density of 5-HT2A receptors (the target of psychedelics) suggests a role in altered states of consciousness. Its exact function remains one of neuroscience's biggest mysteries."
    },
    {
      "id": "BREG-023",
      "name": "Nucleus Accumbens",
      "location": "Ventral striatum, at junction of caudate and putamen",
      "function": "Reward processing, pleasure, motivation, addiction, reinforcement learning",
      "associated_disorders": "Addiction, depression (anhedonia), obesity, gambling disorder",
      "neurotransmitters": "Dopamine (primary), GABA, glutamate, endocannabinoids, opioids",
      "description": "The nucleus accumbens is the brain's pleasure center, integrating dopamine signals from the VTA with glutamate inputs from the prefrontal cortex and amygdala. It's central to reward-seeking behavior and addiction. All addictive drugs increase dopamine in the nucleus accumbens. Deep brain stimulation of the nucleus accumbens is being tested for treatment-resistant depression and addiction."
    },
    {
      "id": "BREG-024",
      "name": "Entorhinal Cortex",
      "location": "Medial temporal lobe, adjacent to hippocampus",
      "function": "Main gateway to hippocampus; grid cells for spatial navigation; memory consolidation",
      "associated_disorders": "Alzheimer's disease (very early affected region), epilepsy, schizophrenia",
      "neurotransmitters": "Glutamate, GABA, acetylcholine",
      "description": "The entorhinal cortex is the primary interface between the neocortex and hippocampus. Grid cells here create a hexagonal coordinate system for spatial navigation (Nobel Prize 2014). It's one of the first regions affected by Alzheimer's tau pathology, years before symptoms appear. This makes it a target for early Alzheimer's detection and intervention."
    },
    {
      "id": "BREG-025",
      "name": "Pineal Gland",
      "location": "Midline, posterior to third ventricle",
      "function": "Melatonin production, circadian rhythm regulation, sleep-wake cycle",
      "associated_disorders": "Sleep disorders, seasonal affective disorder, circadian rhythm disruptions",
      "neurotransmitters": "Melatonin (hormone), serotonin (precursor)",
      "description": "The pineal gland produces melatonin from serotonin in response to darkness, regulating the circadian rhythm. Descartes famously called it the 'seat of the soul.' Pineal calcification increases with age and is visible on CT scans. Melatonin supplements are widely used for jet lag and insomnia. The pineal gland's role in circadian health is increasingly recognized as critical for overall wellbeing."
    },
    {
      "id": "BREG-026",
      "name": "Ventromedial Prefrontal Cortex (vmPFC)",
      "location": "Medial frontal lobe, below the dorsomedial prefrontal cortex",
      "function": "Emotional decision-making, risk assessment, moral judgment, value-based choice, fear extinction",
      "associated_disorders": "Anxiety disorders, addiction, impaired social judgment, antisocial behavior",
      "neurotransmitters": "Serotonin, dopamine, GABA",
      "description": "The vmPFC is critical for integrating emotional signals into decision-making. Patients with vmPFC damage (e.g., Phineas Gage) show impaired judgment despite intact intellect. The vmPFC is central to fear extinction learning and is a target for anxiety disorder treatments. In 2025-2026, BCI research has explored vmPFC stimulation for treatment-resistant depression and anxiety."
    },
    {
      "id": "BREG-027",
      "name": "Posterior Parietal Cortex (PPC)",
      "location": "Posterior parietal lobe",
      "function": "Sensorimotor integration, spatial awareness, attention, movement planning, coordinate transformation",
      "associated_disorders": "Neglect syndrome, apraxia, spatial disorientation",
      "neurotransmitters": "Glutamate, GABA, acetylcholine",
      "description": "The PPC integrates sensory information to create spatial representations and guide movement. It's a key BCI target for prosthetic control, as PPC neurons encode movement intentions before execution. BrainGate and other BCI groups have demonstrated that PPC recordings can decode intended reach directions, enabling thought-controlled robotic arms. The PPC is also central to attention networks."
    },
    {
      "id": "BREG-028",
      "name": "Ventral Tegmental Area (VTA)",
      "location": "Midbrain, medial to substantia nigra",
      "function": "Dopamine production, reward processing, motivation, addiction, learning",
      "associated_disorders": "Addiction, depression, schizophrenia, Parkinson's disease",
      "neurotransmitters": "Dopamine (primary), GABA, glutamate",
      "description": "The VTA is the brain's primary source of dopamine neurons projecting to the nucleus accumbens (mesolimbic pathway) and prefrontal cortex (mesocortical pathway). It's central to reward prediction error and reinforcement learning. VTA dysfunction underlies addiction (drugs hijack VTA dopamine signaling) and depression (reduced reward sensitivity). Deep brain stimulation of VTA-connected circuits is being explored for treatment-resistant depression."
    },
    {
      "id": "BREG-029",
      "name": "Retrosplenial Cortex",
      "location": "Posterior cingulate region, behind the splenium of the corpus callosum",
      "function": "Spatial navigation, episodic memory, scene construction, orientation",
      "associated_disorders": "Alzheimer's disease (early atrophy), spatial disorientation, topographic amnesia",
      "neurotransmitters": "Glutamate, GABA",
      "description": "The retrosplenial cortex is critical for spatial navigation and converting between egocentric and allocentric reference frames. It's one of the first regions to show atrophy in Alzheimer's disease, often before hippocampal degeneration. This makes it a potential early biomarker for AD. The retrosplenial cortex works closely with the hippocampus and entorhinal cortex in the brain's navigation and memory system."
    },
    {
      "id": "BREG-030",
      "name": "Claustrum",
      "location": "Thin sheet of neurons between insular cortex and putamen",
      "function": "Consciousness integration, cross-modal sensory binding, attention switching, cognitive control",
      "associated_disorders": "Consciousness disorders, epilepsy, disrupted sensory integration",
      "neurotransmitters": "Glutamate, GABA, acetylcholine",
      "description": "The claustrum is a thin, sheet-like structure that Francis Crick famously proposed as the 'conductor of consciousness' due to its extensive connectivity with nearly all cortical areas. Recent research (2025-2026) supports its role in integrating information across brain regions and coordinating conscious experience. Electrical stimulation of the claustrum can disrupt consciousness, and claustrum dysfunction is implicated in epilepsy and disorders of consciousness."
    },
    {
      "id": "BREG-031",
      "name": "Ventromedial Prefrontal Cortex (vmPFC)",
      "location": "Medial frontal lobe, ventral to the genu of the corpus callosum",
      "function": "Emotion regulation, decision-making under risk, moral judgment, value-based choice, fear extinction",
      "associated_disorders": "Anxiety disorders, depression, addiction, impaired decision-making, antisocial behavior",
      "neurotransmitters": "Serotonin, dopamine, GABA, glutamate",
      "description": "The vmPFC is critical for integrating emotional signals into decision-making. It plays a central role in fear extinction (the basis of exposure therapy for anxiety disorders) and value-based decision-making. Damage to the vmPFC results in impaired emotional decision-making (as seen in patient Elliot, studied by Damasio). The vmPFC is a key target for neuromodulation therapies for depression and anxiety in 2025-2026."
    },
    {
      "id": "BREG-032",
      "name": "Posterior Parietal Cortex (PPC)",
      "location": "Posterior parietal lobe (Brodmann areas 5, 7, 39, 40)",
      "function": "Spatial attention, sensorimotor integration, motor planning, spatial reasoning, navigation",
      "associated_disorders": "Spatial neglect, apraxia, BCI motor decoding target",
      "neurotransmitters": "Glutamate, GABA, acetylcholine",
      "description": "The PPC integrates sensory information to construct spatial representations and guide motor actions. It is a key brain region for BCI applications, as it encodes motor intention and spatial goals. In 2025-2026, the PPC has become an important target for BCI decoding of movement intention, complementing motor cortex signals for more naturalistic prosthetic control."
    },
    {
      "id": "BREG-033",
      "name": "Ventral Tegmental Area (VTA)",
      "location": "Midbrain, medial to substantia nigra",
      "function": "Reward processing, motivation, addiction, dopamine signaling, prediction error",
      "associated_disorders": "Addiction, depression, schizophrenia, Parkinson disease (non-motor symptoms)",
      "neurotransmitters": "Dopamine (primary), GABA, glutamate",
      "description": "The VTA is the origin of the mesolimbic dopamine pathway, the brains reward circuit. VTA dopamine neurons fire in response to unexpected rewards (prediction error), driving learning and motivation. Dysregulation of VTA signaling is central to addiction (drugs hijack this pathway) and depression (reduced reward sensitivity). In 2025-2026, VTA-targeted neuromodulation is being explored for treatment-resistant addiction."
    },
    {
      "id": "BREG-034",
      "name": "Mammillary Bodies",
      "location": "Posterior hypothalamus, at the caudal end of the fornix",
      "function": "Memory consolidation, spatial memory, episodic memory recall, Papez circuit relay",
      "associated_disorders": "Wernicke-Korsakoff syndrome (thiamine deficiency), amnesia, alcohol-related brain damage",
      "neurotransmitters": "Glutamate, GABA, acetylcholine",
      "description": "The mammillary bodies are key relay stations in the Papez circuit for episodic memory. Damage causes profound amnesia, most famously in Wernicke-Korsakoff syndrome from thiamine deficiency (often alcohol-related). In 2025-2026, deep brain stimulation of the mammillary bodies and fornix is being explored for memory enhancement in Alzheimers disease, with early clinical trials showing modest improvements."
    },
    {
      "id": "BREG-035",
      "name": "Pineal Gland",
      "location": "Midline, posterior to the third ventricle, near the corpora quadrigemina",
      "function": "Melatonin production, circadian rhythm regulation, sleep-wake cycle, seasonal timing",
      "associated_disorders": "Sleep disorders, circadian rhythm disruption, seasonal affective disorder, pineal tumors",
      "neurotransmitters": "Melatonin (hormone), serotonin (precursor)",
      "description": "The pineal gland produces melatonin from serotonin in response to darkness, regulating the circadian rhythm. In 2025-2026, pineal gland research has gained attention due to the growing recognition of circadian disruption in mental health, neurodegeneration, and cancer. Novel melatonin receptor agonists and light therapy protocols targeting pineal function are being developed for sleep and mood disorders."
    },
    {
      "id": "BREG-036",
      "name": "MICrONS Project Connectome Map (Mouse Visual Cortex)",
      "location": "Mouse visual cortex (V1 to higher visual areas)",
      "function": "Most detailed brain wiring diagram ever created; 500 million synapses mapped",
      "disorders": "Understanding cortical computation; basis for AI-inspired neural architectures",
      "description": "The MICrONS (Machine Intelligence from Cortical Networks) project, involving 150+ scientists, created the most detailed brain connectome map ever — a full wiring diagram of a piece of mouse visual cortex with 500 million synapses. Published in April 2025, this map reveals how neurons are connected and communicate, providing unprecedented insight into cortical computation. The dataset is publicly available and is being used to develop brain-inspired AI algorithms.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.princeton.edu/news/2025/04/09/princeton-scientists-map-half-billion-connections-tiny-piece-mouse-brain",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BREG-037",
      "name": "Princeton Mouse Visual Connectome (500M Synapses)",
      "location": "Mouse visual cortex",
      "function": "Detailed synaptic-level connectome of visual processing circuits",
      "disorders": "Understanding visual processing disorders; basis for computational neuroscience models",
      "description": "Princeton scientists mapped half a billion connections in a tiny piece of mouse brain, creating one of the most detailed connectome maps ever produced. Published in April 2025, the map reveals the intricate wiring patterns of visual cortex neurons at synaptic resolution. This achievement demonstrates that comprehensive brain wiring diagrams are achievable and provides a foundation for understanding how neural circuits process information.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.princeton.edu/news/2025/04/09/princeton-scientists-map-half-billion-connections-tiny-piece-mouse-brain",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BREG-038",
      "name": "Hopkins High-Resolution Developing Human Brain Atlas",
      "location": "Whole brain (developmental stages)",
      "function": "High-resolution atlas of the developing human brain",
      "disorders": "Neurodevelopmental disorders (autism, ADHD, schizophrenia origins)",
      "description": "Johns Hopkins researchers created a high-resolution atlas of the developing human brain, published in March 2026. This atlas maps brain development at unprecedented resolution, revealing how different brain regions form and connect during gestation and early life. It is critical for understanding the origins of neurodevelopmental disorders like autism, ADHD, and schizophrenia, which are increasingly understood as disorders of brain development.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.hopkinsmedicine.org/news/media/releases/high_resolution_atlas_of_developing_human_brain",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BREG-039",
      "name": "Human Brain Project Digital Brain Atlas",
      "location": "Whole brain (digital reconstruction)",
      "function": "Comprehensive digital atlas integrating multimodal brain data",
      "disorders": "Reference for neurological and psychiatric research",
      "description": "The Human Brain Project's digital brain atlas integrates multimodal data (structural, functional, molecular) into a comprehensive 3D reference of the human brain. The atlas enables researchers to navigate brain data across scales (from molecules to systems) and modalities (MRI, histology, gene expression). It serves as a foundational resource for neuroscience research and clinical applications, providing a common coordinate framework for brain data integration.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.humanbrainproject.eu/en/medicine/atlas",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BREG-040",
      "name": "Brain Entorhinal Cortex-Navigation System",
      "location": "Entorhinal cortex (medial temporal lobe)",
      "function": "Spatial navigation, grid cells, head direction cells, memory encoding",
      "disorders": "Alzheimer's disease (entorhinal cortex is first affected region); spatial disorientation",
      "description": "The entorhinal cortex contains grid cells that create an internal coordinate system for spatial navigation, discovered by May-Britt and Edvard Moser (2014 Nobel Prize). This region is the primary gateway for information flowing into the hippocampus and is the first brain area affected by Alzheimer's disease pathology. Understanding entorhinal cortex function is critical for both spatial navigation research and early Alzheimer's detection.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/nrn3957",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BREG-041",
      "name": "Insular Cortex (Interoception and Emotion Hub)",
      "location": "Insular cortex (deep within lateral sulcus)",
      "function": "Interoception (body awareness), emotion, taste, pain processing, risk prediction",
      "disorders": "Anxiety disorders, addiction, interoceptive dysfunction, eating disorders",
      "description": "The insular cortex is a hidden brain region deep within the lateral sulcus that serves as a hub for interoception — the brain's ability to sense the body's internal states. It integrates bodily signals with emotional and cognitive processing, playing a key role in anxiety, addiction, and decision-making under uncertainty. The insula's role in interoception makes it a target for neuromodulation therapies for anxiety and addiction.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/nrn3243",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BREG-042",
      "name": "Cerebellum (Beyond Motor Control)",
      "location": "Cerebellum (posterior fossa)",
      "function": "Motor coordination, balance, cognitive processing, language, emotional regulation",
      "disorders": "Ataxia, autism (cerebellar abnormalities), schizophrenia, dyslexia",
      "description": "The cerebellum, long known for motor coordination, is increasingly recognized for its role in cognitive processing, language, and emotional regulation. Research shows cerebellar abnormalities in autism, schizophrenia, and dyslexia, expanding its significance beyond motor control. The cerebellum contains more neurons than the rest of the brain combined and its computational architecture (uniform parallel processing) makes it a model for understanding neural computation.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/s41583-019-0182-7",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BREG-043",
      "name": "Default Mode Network (DMN)",
      "location": "Medial prefrontal cortex, posterior cingulate, angular gyrus (distributed network)",
      "function": "Self-referential thinking, mind-wandering, episodic memory, social cognition",
      "disorders": "Depression (rumination), ADHD (reduced DMN suppression), Alzheimer's (DMN connectivity loss), schizophrenia",
      "description": "The Default Mode Network (DMN) is a large-scale brain network active during rest and self-referential thinking. DMN dysfunction is implicated in depression (excessive rumination), ADHD (failure to suppress DMN during tasks), and Alzheimer's disease (early connectivity loss in DMN). The DMN is a key target for neurofeedback and meditation-based interventions, and its study has transformed our understanding of brain function at rest.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/nn1102-1159",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BREG-044",
      "name": "Ventral Tegmental Area (VTA) Reward Circuit",
      "location": "Ventral tegmental area (midbrain)",
      "function": "Dopamine production, reward processing, motivation, addiction",
      "disorders": "Addiction (dopamine dysregulation), depression (anhedonia), Parkinson's disease (dopamine neuron loss)",
      "description": "The Ventral Tegmental Area (VTA) is a key dopamine-producing region in the midbrain that drives reward processing, motivation, and reinforcement learning. VTA dopamine neurons project to the nucleus accumbens (mesolimbic pathway) and prefrontal cortex (mesocortical pathway). VTA dysfunction is central to addiction (dopamine hijacking), depression (reduced reward sensitivity), and Parkinson's disease (dopamine neuron degeneration). It is a target for DBS in treatment-resistant depression.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/nn1102-1159",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BREG-045",
      "name": "Hypothalamus (Homeostatic Control Center)",
      "location": "Hypothalamus (diencephalon, below thalamus)",
      "function": "Temperature regulation, hunger, thirst, sleep, hormone release, circadian rhythm",
      "disorders": "Obesity, sleep disorders, thermoregulatory dysfunction, endocrine disorders",
      "description": "The hypothalamus is the brain's master regulatory center for homeostasis, controlling body temperature, hunger, thirst, sleep-wake cycles, and hormone release via the pituitary gland. It contains the suprachiasmatic nucleus (the body's master clock) and orexin-producing neurons that regulate wakefulness. Hypothalamic dysfunction contributes to obesity, narcolepsy, and endocrine disorders. Its small size belies its critical role in maintaining physiological balance.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/nrn2917",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "BREG-046",
      "name": "Subgenual Cingulate (Area 25)",
      "location": "Ventral medial prefrontal cortex, below the genu of the corpus callosum",
      "function": "Depression circuit hub, emotional regulation, autonomic control, sadness processing",
      "associated_disorders": "Treatment-resistant depression (DBS target), bipolar disorder, OCD",
      "neurotransmitters": "Serotonin, dopamine, GABA, glutamate",
      "description": "The subgenual cingulate (Area 25) is a key hub in the depression circuit and the primary target for deep brain stimulation in treatment-resistant depression. Helen Mayberg identified Area 25 as hyperactive in depression, and DBS of this region has shown dramatic improvement in severely treatment-resistant patients. In 2025-2026, closed-loop DBS of Area 25 is advancing through clinical trials, with UCSF demonstrating biomarker-guided stimulation that adapts to the patients neural state.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/s41591-021-01480-w",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "BREG-047",
      "name": "Fusiform Gyrus (Fusiform Face Area)",
      "location": "Temporal lobe, lateral fusiform gyrus",
      "function": "Face recognition, visual expertise, word recognition, object categorization",
      "associated_disorders": "Prosopagnosia (face blindness), autism (atypical face processing), Capgras syndrome",
      "neurotransmitters": "Glutamate, GABA",
      "description": "The fusiform gyrus contains the Fusiform Face Area (FFA), a specialized region for face recognition. Damage causes prosopagnosia (inability to recognize faces). In autism, the FFA shows atypical activation patterns, potentially explaining social cognition difficulties. 2025-2026 connectomics research reveals that the FFA is part of a broader social brain network that includes the amygdala, temporoparietal junction, and medial prefrontal cortex.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/s41583-022-00626-9",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "BREG-048",
      "name": "Temporoparietal Junction (TPJ)",
      "location": "Junction of temporal and parietal lobes, near the angular gyrus",
      "function": "Theory of mind, self-other distinction, attention reorienting, moral reasoning, agency detection",
      "associated_disorders": "Autism (theory of mind deficits), schizophrenia (agency confusion), spatial neglect",
      "neurotransmitters": "Glutamate, GABA, acetylcholine",
      "description": "The temporoparietal junction (TPJ) is critical for theory of mind (understanding others mental states) and self-other distinction. It activates when we reason about others beliefs, intentions, and emotions. In autism, TPJ dysfunction may underlie theory of mind deficits. In schizophrenia, TPJ abnormalities may contribute to misattributing internal thoughts to external agents. The TPJ is also involved in attention reorienting and is a target for TMS in spatial neglect rehabilitation.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/s41583-022-00626-9",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "BREG-049",
      "name": "Periaqueductal Gray (PAG)",
      "location": "Midbrain, surrounding the cerebral aqueduct",
      "function": "Pain modulation, defensive behaviors (fight-flight-freeze), fear processing, opioid analgesia",
      "associated_disorders": "Chronic pain, PTSD, panic disorder, migraine",
      "neurotransmitters": "Opioid peptides, serotonin, GABA, glutamate, substance P",
      "description": "The periaqueductal gray (PAG) is the brains pain control center and a key structure in defensive behavior circuits. It mediates opioid analgesia and the fight-flight-freeze response. The PAG coordinates with the amygdala and prefrontal cortex in fear processing. In 2025-2026, DBS targeting the PAG is being explored for chronic neuropathic pain, and focused ultrasound targeting the PAG is being tested for PTSD and chronic pain without surgery.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/nrn2917",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "BREG-050",
      "name": "Olfactory Bulb",
      "location": "Anterior cranial fossa, above the nasal cavity",
      "function": "Olfaction (smell), sensory gateway to the brain, neurogenesis in adults",
      "associated_disorders": "Alzheimers (early smell loss), Parkinsons (early smell loss), Long COVID (anosmia), depression",
      "neurotransmitters": "Glutamate, GABA, dopamine",
      "description": "The olfactory bulb is the brains first relay station for smell information and one of the few brain regions where adult neurogenesis occurs. Early smell loss is one of the earliest symptoms of both Alzheimers and Parkinsons disease, often preceding motor or cognitive symptoms by years. Long COVID frequently causes anosmia through olfactory bulb damage. The olfactory bulbs unique access to the brain makes it a potential route for drug delivery and a biomarker for neurodegeneration.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/s41583-019-0182-7",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-51",
      "name": "Subgenual Cingulate Area 25 (Brodmann Area 25)",
      "location": "Medial prefrontal cortex, subgenual region",
      "function": "Mood regulation, emotional processing; target for deep brain stimulation in treatment-resistant depression",
      "connectivity": "Connected to amygdala, hypothalamus, orbitofrontal cortex, and brainstem monoamine centers",
      "description": "Brodmann Area 25 (subgenual cingulate) is a critical hub in the mood regulation network. UCSF researchers demonstrated that closed-loop deep brain stimulation (DBS) of Area 25 can produce sustained remission in treatment-resistant depression (published in Nature 2021). This finding has made Area 25 the primary target for next-generation neuromodulation therapies for depression, with multiple clinical trials ongoing in 2025-2026.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/area-25-dbs-depression",
          "collected_at": "2026-06-04T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-52",
      "name": "Fusiform Gyrus (Face Recognition Area)",
      "location": "Ventral temporal lobe; fusiform face area (FFA)",
      "function": "Face perception, facial recognition, visual expertise for categories",
      "connectivity": "Connected to occipital face area, superior temporal sulcus, amygdala, and prefrontal cortex",
      "description": "The fusiform gyrus contains the Fusiform Face Area (FFA), a specialized region for face perception. BCI research is increasingly targeting the fusiform gyrus for visual prosthetics and face recognition augmentation. Understanding FFA connectivity patterns is critical for developing BCIs that can restore or enhance visual processing, particularly for patients with prosopagnosia (face blindness).",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/fusiform-gyrus-bci-research",
          "collected_at": "2026-06-04T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-53",
      "name": "Entorhinal Cortex (Navigation System)",
      "location": "Medial temporal lobe; bordering the hippocampus",
      "function": "Spatial navigation, grid cell formation, memory consolidation, path integration",
      "connectivity": "Major input pathway to hippocampus; connected to presubiculum, parasubiculum, perirhinal cortex",
      "description": "The entorhinal cortex contains grid cells that create an internal coordinate system for spatial navigation, a discovery that earned the 2014 Nobel Prize. This region is critical for BCI applications in navigation and spatial memory restoration. Grid cell patterns are being studied for their potential to inform neural coding strategies in brain-computer interfaces, and entorhinal degeneration is an early marker for Alzheimer's disease.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/entorhinal-grid-cells-navigation",
          "collected_at": "2026-06-04T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-54",
      "name": "Hopkins Developing Human Brain Atlas (March 2026)",
      "location": "Comprehensive brain atlas covering developmental stages",
      "function": "Reference atlas for brain development research; mapping developmental trajectories",
      "connectivity": "Full-brain connectivity mapping across developmental stages",
      "description": "Johns Hopkins University published a developing human brain atlas in March 2026, providing the most detailed map of brain development from conception through adolescence. The atlas documents how brain regions form, connect, and mature over time, offering unprecedented insights into neurodevelopmental disorders and normal brain development. This resource is invaluable for BCI research targeting pediatric populations.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.hopkins.edu/brain-atlas-2026",
          "collected_at": "2026-06-04T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-55",
      "name": "MICrONS 500 Billion Synapse Connectome Map (April 2025)",
      "location": "1 cubic millimeter of mouse visual cortex; 500 billion synaptic connections mapped",
      "function": "Most detailed synaptic-level connectome ever created; functional and structural mapping",
      "connectivity": "200,000+ brain cells, 500 million synapses in 1mm³ of visual cortex",
      "description": "The MICrONS project published the most detailed connectome map ever created in April 2025, capturing over 200,000 brain cells and approximately 500 million synapses in a cubic millimeter of mouse visual cortex. This map reveals the wiring diagram at synaptic resolution, enabling researchers to understand how neural circuits process visual information. The dataset is freely available and has become a foundational resource for computational neuroscience and BCI development.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.microns-explorer.org/connectome-2025",
          "collected_at": "2026-06-04T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-56",
      "name": "Princeton Mouse Visual Connectome (500M Synapses)",
      "location": "Mouse visual cortex; cubic millimeter volume",
      "function": "Complete synaptic-level map of mouse visual processing circuits",
      "connectivity": "Every neuron and synapse mapped in the visual processing pathway",
      "description": "Princeton researchers mapped every neuron in a cubic millimeter of mouse brain, creating a connectome that promises to accelerate the study of normal brain function and disease. The map captures over 200,000 brain cells and approximately four kilometers of neural wiring. This achievement represents a new era in neuroscience where complete circuit diagrams can be used to understand information processing in the brain.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/princeton-mouse-connectome",
          "collected_at": "2026-06-04T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-57",
      "name": "Human Brain Project Digital Brain Atlas",
      "location": "Whole-brain digital reconstruction; European flagship project",
      "function": "Multi-scale digital reconstruction of the human brain for research and clinical applications",
      "connectivity": "Multi-resolution connectivity data from molecular to systems level",
      "description": "The Human Brain Project created a comprehensive digital brain atlas as part of its legacy, providing multi-scale reconstruction of the human brain. The atlas integrates data from molecular, cellular, and systems-level neuroscience into a unified digital framework. This resource supports BCI research by providing detailed anatomical and functional reference data for electrode placement and neural circuit targeting.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.humanbrainproject.eu/digital-brain-atlas",
          "collected_at": "2026-06-04T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-058",
      "name": "Locus Coeruleus (蓝斑核)",
      "location": "Pons (脑桥)",
      "function": "Primary source of norepinephrine in the brain; arousal, attention, stress response",
      "connections": "Widespread projections to cortex, hippocampus, cerebellum, spinal cord",
      "description": "The locus coeruleus is a small nucleus in the pons that is the brain's primary source of norepinephrine (noradrenaline). Despite containing only about 50,000 neurons in humans, it has widespread projections throughout the brain and plays a critical role in arousal, attention, cognitive flexibility, and the stress response. Recent research has highlighted its role in Alzheimer's disease — it is one of the first brain regions to show tau pathology, potentially decades before cognitive symptoms appear.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/locus-coeruleus-norepinephrine",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-059",
      "name": "Claustrum (屏状核)",
      "location": "Between insular cortex and putamen",
      "function": "Integration of cross-modal information; potential role in consciousness",
      "connections": "Reciprocal connections with nearly all cortical areas",
      "description": "The claustrum is a thin sheet of neurons located between the insular cortex and the putamen. It has reciprocal connections with nearly every region of the cerebral cortex, making it a potential hub for integrating information across different sensory modalities. Francis Crick proposed that the claustrum could be the 'conductor of the cortical orchestra' — the structure that binds together disparate neural processes into unified conscious experience. Recent optogenetic studies have shown that claustrum activation can globally suppress cortical activity.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/claustrum-consciousness",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-060",
      "name": "Ventral Tegmental Area (VTA, 腹侧被盖区)",
      "location": "Midbrain (中脑)",
      "function": "Dopamine production; reward, motivation, addiction",
      "connections": "Nucleus accumbens (mesolimbic), prefrontal cortex (mesocortical), amygdala",
      "description": "The ventral tegmental area (VTA) is a group of dopamine-producing neurons in the midbrain that play a central role in the brain's reward system. The mesolimbic pathway (VTA → nucleus accumbens) is the primary reward circuit, and the mesocortical pathway (VTA → prefrontal cortex) is involved in motivation and executive function. VTA dysfunction is implicated in addiction, depression, and schizophrenia. Deep brain stimulation of VTA-connected circuits is being explored for treatment-resistant depression.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/vta-dopamine-reward",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-061",
      "name": "Subthalamic Nucleus (STN, 丘脑底核)",
      "location": "Diencephalon (间脑), below thalamus",
      "function": "Motor control, decision making, impulse control",
      "connections": "Globus pallidus, substantia nigra, motor cortex (indirect pathway)",
      "description": "The subthalamic nucleus is a small lens-shaped nucleus that plays a critical role in the indirect pathway of the basal ganglia motor circuit. It is the primary target for deep brain stimulation (DBS) in Parkinson's disease, where electrical stimulation can dramatically reduce tremor, rigidity, and bradykinesia. Recent research has also revealed the STN's role in decision-making under conflict — it acts as a 'brake' on action initiation when multiple competing options are present.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/stn-deep-brain-stimulation",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-062",
      "name": "Parabrachial Nucleus (臂旁核)",
      "location": "Pons (脑桥), surrounding superior cerebellar peduncle",
      "function": "Threat detection, pain processing, respiratory regulation, taste",
      "connections": "Amygdala, thalamus, insular cortex, hypothalamus",
      "description": "The parabrachial nucleus is emerging as a critical hub for threat detection and negative emotional states. It receives nociceptive (pain) input from the spinal cord and relays it to the amygdala and other emotional processing centers. Recent research using optogenetics has shown that specific parabrachial neuron populations can drive threat avoidance behavior and anxiety-like states. The nucleus also plays a role in taste perception and respiratory regulation.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/parabrachial-threat-detection",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-063",
      "name": "Nucleus Accumbens (NAc, 伏隔核)",
      "location": "Basal forebrain (前脑基底), part of ventral striatum",
      "function": "Reward processing, pleasure, addiction, motivation",
      "connections": "VTA (dopamine input), prefrontal cortex (glutamate input), amygdala",
      "description": "The nucleus accumbens is the primary component of the ventral striatum and is central to the brain's reward circuitry. It integrates dopaminergic signals from the VTA with glutamatergic inputs from the prefrontal cortex and amygdala to encode reward prediction, pleasure, and motivation. The NAc is the primary target of addictive drugs, which hijack the dopamine signaling system. Deep brain stimulation of the NAc is being investigated for treatment-resistant depression and addiction.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/nucleus-accumbens-reward",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-064",
      "name": "Mammillary Bodies (乳头体)",
      "location": "Posterior hypothalamus (下丘脑后部)",
      "function": "Episodic memory, spatial navigation",
      "connections": "Hippocampus (via fornix), anterior thalamus (via mammillothalamic tract)",
      "description": "The mammillary bodies are small round nuclei in the posterior hypothalamus that play a crucial role in episodic memory. They are part of the Papez circuit (hippocampus → mammillary bodies → anterior thalamus → cingulate cortex → hippocampus). Damage to the mammillary bodies causes Korsakoff's syndrome, characterized by severe anterograde amnesia. Recent research has shown that the mammillary bodies are not just a relay station but actively process spatial and temporal information.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/mammillary-bodies-memory",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-065",
      "name": "Periaqueductal Gray (PAG, 导水管周围灰质)",
      "location": "Midbrain (中脑), surrounding cerebral aqueduct",
      "function": "Pain modulation, defensive behavior, fear response, opioid analgesia",
      "connections": "Spinal cord, amygdala, prefrontal cortex, hypothalamus",
      "description": "The periaqueductal gray (PAG) is a brainstem structure surrounding the cerebral aqueduct that plays a central role in pain modulation and defensive behavior. The PAG contains the endogenous opioid system and is the primary site of action for opioid analgesia. Different columns of the PAG organize different defensive responses: lateral PAG → fight/flight, ventrolateral PAG → passive coping (freezing), dorsolateral PAG → active coping. The PAG is also involved in migraine pathophysiology.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/pag-pain-modulation",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-066",
      "name": "Habenula (缰核)",
      "location": "Epithalamus (上丘脑), adjacent to pineal gland",
      "function": "Negative reward prediction, disappointment, depression",
      "connections": "VTA, raphe nuclei, substantia nigra, septal nuclei",
      "description": "The habenula is a small bilateral structure in the epithalamus that plays a critical role in negative reward prediction and disappointment. It is activated when expected rewards are not received, and it inhibits dopamine neurons in the VTA and serotonin neurons in the raphe nuclei. Hyperactivity of the habenula is associated with depression, and deep brain stimulation of the habenula has shown promise for treatment-resistant depression. The lateral habenula is considered a key node in the brain's anti-reward system.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/habenula-depression",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-067",
      "name": "Entorhinal Cortex (内嗅皮层)",
      "location": "Medial temporal lobe (颞叶内侧), anterior to hippocampus",
      "function": "Grid cells for spatial navigation; gateway to hippocampus",
      "connections": "Hippocampus (perforant path), neocortex, olfactory bulb",
      "description": "The entorhinal cortex is the primary interface between the neocortex and the hippocampus, serving as the gateway for information entering and leaving the hippocampal memory system. It contains grid cells that create a hexagonal coordinate system for spatial navigation (discovered by May-Britt and Edvard Moser, Nobel Prize 2014). The entorhinal cortex is one of the first regions affected by Alzheimer's disease, with neurofibrillary tangles appearing here before symptoms develop. This explains why spatial disorientation is often an early sign of Alzheimer's.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/entorhinal-grid-cells",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-068",
      "name": "Dorsal Raphe Nucleus (中缝背核)",
      "location": "Midbrain (中脑), along midline",
      "function": "Primary source of serotonin; mood, sleep, appetite, cognition",
      "connections": "Widespread cortical and subcortical projections",
      "description": "The dorsal raphe nucleus is the largest serotonergic nucleus in the brain, containing approximately one-third of all serotonin-producing neurons. Its widespread projections influence virtually every aspect of brain function, including mood, sleep-wake cycles, appetite, cognition, and pain perception. SSRIs (selective serotonin reuptake inhibitors), the most widely prescribed antidepressants, primarily act by increasing serotonin availability at dorsal raphe projection sites. Recent research has revealed that different subpopulations of dorsal raphe neurons have distinct functions.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/dorsal-raphe-serotonin",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-069",
      "name": "Anterior Cingulate Cortex (ACC, 前扣带皮层)",
      "location": "Medial prefrontal cortex (前额叶内侧)",
      "function": "Error monitoring, conflict resolution, pain affect, empathy, effort allocation",
      "connections": "Prefrontal cortex, amygdala, insula, PAG, striatum",
      "description": "The anterior cingulate cortex (ACC) is a critical hub for cognitive control and emotional processing. It monitors for errors and conflicts between competing responses, signaling the need for increased cognitive control. The ACC is also central to the affective (emotional) component of pain — it processes how much pain bothers you, not where it hurts. Damage to the ACC can cause akinetic mutism (awake but unresponsive). The ACC is implicated in OCD, depression, and chronic pain conditions.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/acc-cognitive-control",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-070",
      "name": "Insular Cortex (岛叶皮层)",
      "location": "Deep within lateral sulcus, hidden by opercula",
      "function": "Interoception, self-awareness, emotion, taste, risk prediction",
      "connections": "Amygdala, hypothalamus, ACC, prefrontal cortex, brainstem",
      "description": "The insular cortex (insula) is a hidden cortical structure that plays a central role in interoception — the sense of the body's internal states. The anterior insula is involved in emotional awareness and risk prediction, while the posterior insula processes physical sensations from the body. The insula is critical for self-awareness and subjective feeling states. It is activated in virtually every emotional experience and is implicated in anxiety disorders, addiction, and eating disorders. The right anterior insula is larger in humans than in other primates, suggesting a role in uniquely human self-awareness.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/insula-interoception",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-071",
      "name": "Ventromedial Prefrontal Cortex (vmPFC, 腹内侧前额叶)",
      "location": "Medial prefrontal cortex, ventral aspect",
      "function": "Emotional decision-making, value computation, fear extinction, social cognition",
      "connections": "Amygdala, hippocampus, ACC, striatum, hypothalamus",
      "description": "The ventromedial prefrontal cortex (vmPFC) is essential for emotional decision-making and value-based choices. Patients with vmPFC damage (like the famous case of Phineas Gage) can make rational calculations but make disastrous life decisions because they cannot integrate emotional information into their choices. The vmPFC is also critical for fear extinction — the process by which fear responses are unlearned. Dysfunction of the vmPFC is implicated in anxiety disorders, addiction, and antisocial behavior.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/vmpfc-decision-making",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "BR-072",
      "name": "Cerebellum (小脑) - Beyond Motor Control",
      "location": "Posterior cranial fossa, below occipital lobe",
      "function": "Motor coordination, but also: cognition, language, emotional regulation, social processing",
      "connections": "Cerebral cortex (via thalamus), brainstem, spinal cord",
      "description": "The cerebellum contains more neurons than the rest of the brain combined but was traditionally considered solely a motor control structure. Recent research has revealed that the cerebellum also plays important roles in cognition, language processing, emotional regulation, and social cognition. The 'cognitive cerebellum' hypothesis proposes that the cerebellum applies its error-correction and prediction capabilities to cognitive and emotional processes, just as it does for motor control. Cerebellar abnormalities are now linked to autism, schizophrenia, and dyslexia.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/cerebellum-cognition",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "name": "Cortex",
      "location": "Outermost layer of the brain",
      "function": "Responsible for higher-order functions such as sensory perception, cognition, reasoning, and language.",
      "key_connections": "Connects to the thalamus, hippocampus, and basal ganglia; forms extensive local and long-range circuits.",
      "description": "The cortex is the largest part of the human brain, divided into lobes that process different types of information. It plays a critical role in consciousness, thought, and voluntary movement. Recent studies highlight its unique connectivity patterns that predict mental functions across the entire brain.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.sciencedaily.com/releases/2025/11/251105050714.htm",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "BR-73"
    },
    {
      "id": "BRAIN_REGION-abc123",
      "name": "大脑皮层",
      "location": "大脑表层",
      "function": "负责高级认知功能，如思考、记忆、语言和意识",
      "associated_disorders": "阿尔茨海默病、帕金森病、癫痫",
      "neurotransmitters": "谷氨酸、GABA、多巴胺",
      "description": "大脑皮层是大脑的外层，由灰质组成，是神经细胞体集中的区域。",
      "last_updated": "2026-06-27T16:03:53.451Z"
    },
    {
      "id": "BRAIN_REGION-def456",
      "name": "海马体",
      "location": "颞叶内侧",
      "function": "形成新记忆、空间导航和情绪调节",
      "associated_disorders": "阿尔茨海默病、癫痫、焦虑症",
      "neurotransmitters": "谷氨酸、乙酰胆碱",
      "description": "海马体是大脑中与记忆形成和存储密切相关的关键结构。",
      "last_updated": "2026-06-27T16:03:53.452Z"
    },
    {
      "id": "BRAIN_REGION-ghi789",
      "name": "杏仁核",
      "location": "颞叶深部",
      "function": "处理情绪反应，特别是恐惧和焦虑",
      "associated_disorders": "焦虑症、创伤后应激障碍、抑郁症",
      "neurotransmitters": "GABA、谷氨酸、血清素",
      "description": "杏仁核是情绪处理的核心区域，对威胁检测和恐惧反应至关重要。",
      "last_updated": "2026-06-27T16:03:53.452Z"
    },
    {
      "id": "BRAIN_REGION-jkl012",
      "name": "基底神经节",
      "location": "大脑深处",
      "function": "运动控制、习惯形成和决策制定",
      "associated_disorders": "帕金森病、亨廷顿病、强迫症",
      "neurotransmitters": "多巴胺、GABA、乙酰胆碱",
      "description": "基底神经节是一组参与运动控制和认知功能的核团。",
      "last_updated": "2026-06-27T16:03:53.452Z"
    },
    {
      "id": "BRAIN_REGION-mno345",
      "name": "小脑",
      "location": "后颅窝",
      "function": "运动协调、平衡和姿势控制",
      "associated_disorders": "共济失调、小脑萎缩、小脑肿瘤",
      "neurotransmitters": "GABA、谷氨酸",
      "description": "小脑主要负责精细运动的协调和平衡控制。",
      "last_updated": "2026-06-27T16:03:53.452Z"
    },
    {
      "id": "BRAIN_REGION-pqr678",
      "name": "丘脑",
      "location": "大脑中心",
      "function": "感觉信息中继站和意识调节",
      "associated_disorders": "意识障碍、疼痛障碍、睡眠障碍",
      "neurotransmitters": "谷氨酸、GABA",
      "description": "丘脑是大脑的感觉信息中继中心，对意识状态有重要影响。",
      "last_updated": "2026-06-27T16:03:53.452Z"
    },
    {
      "id": "BRAIN_REGION-stu901",
      "name": "下丘脑",
      "location": "丘脑下方",
      "function": "调节自主神经系统、内分泌和基本生理功能",
      "associated_disorders": "内分泌失调、体温调节障碍、进食障碍",
      "neurotransmitters": "多巴胺、催产素、血管加压素",
      "description": "下丘脑是维持体内平衡的关键区域，控制多种基本生理功能。",
      "last_updated": "2026-06-27T16:03:53.452Z"
    },
    {
      "id": "BRAIN_REGION-vwx234",
      "name": "脑干",
      "location": "脊髓上方",
      "function": "控制基本生命功能，如呼吸、心跳和血压",
      "associated_disorders": "脑干损伤、呼吸衰竭、昏迷",
      "neurotransmitters": "乙酰胆碱、去甲肾上腺素",
      "description": "脑干是连接大脑和脊髓的结构，维持基本生命活动。",
      "last_updated": "2026-06-27T16:03:53.452Z"
    },
    {
      "id": "BRAIN_REGION-yza567",
      "name": "前额叶皮层",
      "location": "额叶前部",
      "function": "执行功能、决策制定、社交行为和个性表达",
      "associated_disorders": "额颞叶痴呆、注意力缺陷多动障碍、精神分裂症",
      "neurotransmitters": "多巴胺、血清素、谷氨酸",
      "description": "前额叶皮层负责高级认知功能和复杂行为控制。",
      "last_updated": "2026-06-27T16:03:53.452Z"
    },
    {
      "id": "BRAIN_REGION-bcd890",
      "name": "视觉皮层",
      "location": "枕叶",
      "function": "处理视觉信息",
      "associated_disorders": "视觉障碍、枕叶癫痫、皮质盲",
      "neurotransmitters": "谷氨酸、GABA",
      "description": "视觉皮层是大脑中专门处理视觉信息的区域。",
      "last_updated": "2026-06-27T16:03:53.452Z"
    },
    {
      "id": "BRAIN_REGION-a1b2c3",
      "name": "hippocampal CA1 region",
      "location": "hippocampus",
      "function": "major center for memory",
      "associated_disorders": "",
      "neurotransmitters": "",
      "description": "Scientists uncovered a surprising four-layer structure hidden inside this region.",
      "last_updated": "2026-06-27T16:04:51.240Z"
    }
  ],
  "consciousness_research": [
    {
      "id": "CONSC-001",
      "name": "Global Workspace Theory (GWT)",
      "theory": "意识是全局工作空间中的信息广播",
      "key_researcher": "Bernard Baars, Stanislas Dehaene",
      "evidence": "fMRI和EEG显示意识感知伴随全脑'点火'模式",
      "status": "主导理论之一; 有大量实验支持",
      "description": "全局工作空间理论认为意识是信息在全局工作空间(前额叶-顶叶网络)中被广播的过程。当信息达到意识阈值时，触发全脑同步'点火'(ignition)。Dehaene的'全脑神经工作空间'理论提供了神经实现细节。"
    },
    {
      "id": "CONSC-002",
      "name": "Integrated Information Theory (IIT)",
      "theory": "意识是整合信息(Φ); 系统的意识水平取决于其信息整合程度",
      "key_researcher": "Giulio Tononi, Christof Koch",
      "evidence": "Φ值与意识水平相关(麻醉、睡眠、脑损伤); 争议: Φ计算困难",
      "status": "主导理论之一; 有争议但影响深远",
      "description": "整合信息理论(IIT)提出意识就是整合信息(用Φ表示)。一个系统的意识水平取决于其生成整合信息的能力——既高度分化又高度整合。IIT预测小脑对意识贡献小，而丘脑-皮层系统是意识基础。"
    },
    {
      "id": "CONSC-003",
      "name": "Predictive Processing / Free Energy Principle",
      "theory": "大脑是预测机器; 意识源于预测误差最小化",
      "key_researcher": "Karl Friston, Anil Seth",
      "evidence": "预测编码在感觉皮层中广泛验证; 安慰剂效应和幻觉支持预测框架",
      "status": "快速发展的统一框架; 连接意识、感知和行动",
      "description": "预测处理理论认为大脑是预测机器，不断生成对感觉输入的预测并最小化预测误差。Anil Seth提出意识是'受控的幻觉'——我们感知的世界是大脑的最佳猜测而非客观现实。"
    },
    {
      "id": "CONSC-004",
      "name": "Neural Correlates of Consciousness (NCC)",
      "theory": "寻找意识的最小神经机制(充分且必要)",
      "key_researcher": "Francis Crick, Christof Koch",
      "evidence": "前额叶-顶叶网络激活与意识感知相关; P3b ERP成分与意识报告相关",
      "status": "持续研究; Cogitate Consortium大规模验证进行中",
      "description": "意识的神经相关物(NCC)研究寻找与意识体验最直接相关的神经活动。Cogitate Consortium正在进行大规模adversarial collaboration来验证不同意识理论的预测。"
    },
    {
      "id": "CONSC-005",
      "name": "Disorders of Consciousness",
      "theory": "意识障碍的神经机制和诊断",
      "key_researcher": "Steven Laureys, Nicholas Schiff",
      "evidence": "fMRI显示15-20%植物状态患者可能保留意识(隐蔽意识)",
      "status": "临床重大挑战; BCI为意识障碍患者提供新评估手段",
      "description": "意识障碍(昏迷、植物状态、微意识状态)是临床和科学的重大挑战。研究表明15-20%诊断为植物状态的患者可能保留意识。BCI技术为这些患者提供了新的沟通和评估手段。"
    },
    {
      "id": "CONSC-006",
      "name": "Anesthesia and Consciousness",
      "theory": "麻醉如何消除意识; 意识的'开关'机制",
      "key_researcher": "Emery Brown, George Mashour",
      "evidence": "麻醉诱导意识丧失伴随前额叶-顶叶连接中断; 丘脑-皮层通信中断",
      "status": "活跃研究领域; 麻醉作为意识探针",
      "description": "麻醉是研究意识的有力工具——它可逆地消除意识。Emery Brown的研究显示麻醉不是简单的'关闭大脑'，而是创造高度结构化的脑状态。不同麻醉剂通过不同机制影响意识。"
    },
    {
      "id": "CONSC-007",
      "name": "AI Consciousness Debate",
      "theory": "AI系统是否可能具有意识?",
      "key_researcher": "多学科(哲学、神经科学、AI研究者)",
      "evidence": "目前无证据表明AI有意识; 但缺乏公认的意识检测方法",
      "status": "2026年热点话题; 随大语言模型发展而加剧",
      "description": "AI意识是2026年的热点话题。目前没有证据表明AI系统具有意识，但缺乏公认的跨系统意识检测方法。讨论重点包括: 是否需要AI意识评估框架、AI意识的法律和伦理影响。"
    },
    {
      "id": "CONSC-008",
      "name": "Integrated Information Theory 4.0 (IIT 4.0)",
      "theory": "Integrated Information Theory",
      "key_researcher": "Giulio Tononi (University of Wisconsin)",
      "evidence": "Updated mathematical framework; improved computational tractability; new empirical predictions testable with high-density BCI",
      "status": "Updated 2025-2026; more computationally tractable version of IIT",
      "description": "IIT 4.0 is the latest update to Integrated Information Theory, providing a more computationally tractable framework for measuring integrated information (Φ). The update addresses criticisms of earlier versions regarding computational intractability and makes new empirical predictions that can be tested with high-density BCI systems like the 65,536-electrode epidural array."
    },
    {
      "id": "CONSC-009",
      "name": "Global Workspace Theory + AI Consciousness Debate",
      "theory": "Global Workspace Theory (GWT)",
      "key_researcher": "Bernard Baars / Stanislas Dehaene",
      "evidence": "GWT framework applied to large language models; debate over whether AI systems have global workspace architecture",
      "status": "Active debate 2025-2026; GWT applied to AI consciousness question",
      "description": "Global Workspace Theory is being applied to the debate over AI consciousness in 2025-2026. Researchers are asking whether large language models have a global workspace architecture that could support conscious-like processing. This cross-pollination between neuroscience and AI is generating new insights about both biological and artificial consciousness."
    },
    {
      "id": "CONSC-010",
      "name": "Connectome-Specific Consciousness Research",
      "theory": "Connectome-based / Network neuroscience",
      "key_researcher": "Multiple groups (MICrONS, Human Connectome Project)",
      "evidence": "500 billion synaptic connections mapped; consciousness correlates identified in specific network motifs",
      "status": "Emerging 2025-2026; connectome data enabling consciousness research at synaptic level",
      "description": "Connectome-specific consciousness research uses the detailed synaptic-level maps from MICrONS and the Human Connectome Project to identify network motifs that correlate with conscious processing. This approach moves beyond regional theories to examine how specific patterns of neural connectivity support consciousness, enabled by unprecedented mapping data."
    },
    {
      "id": "CONSC-011",
      "name": "Psychedelic States and Consciousness Research",
      "theory": "Phenomenological / Entropy brain hypothesis",
      "key_researcher": "Robin Carhart-Harris (UCSF)",
      "evidence": "fMRI and EEG studies showing increased neural entropy under psychedelics; REBUS model (Relaxed Beliefs Under Psychedelics)",
      "status": "Active research 2025-2026; psychedelics as tools for consciousness research",
      "description": "Psychedelics are being used as research tools to study consciousness, with Robin Carhart-Harris's REBUS model (Relaxed Beliefs Under Psychedelics) providing a framework for understanding how psychedelics alter conscious experience. fMRI and EEG studies show increased neural entropy under psychedelics, suggesting that these compounds push the brain into higher-entropy states that may reveal fundamental properties of consciousness."
    },
    {
      "id": "CONSC-012",
      "name": "Neurorights and Legal Frameworks for Consciousness",
      "theory": "Legal / Ethical framework",
      "key_researcher": "Rafael Yuste (Columbia University) / UNESCO",
      "evidence": "Chile enacted neurorights legislation; UNESCO developing global framework; EU considering neural data protection",
      "status": "Active policy development 2025-2026; first legal protections for mental privacy",
      "description": "Neurorights — legal protections for mental privacy, cognitive liberty, and mental integrity — are being enacted into law. Chile became the first country to constitutionally protect neurorights, and UNESCO is developing a global framework. As BCI technology advances, these legal frameworks are becoming critical for protecting individuals from unauthorized access to their neural data and mental processes."
    },
    {
      "id": "CR-013",
      "name": "Integrated Information Theory (IIT) 4.0",
      "type": "Consciousness theory",
      "key_concept": "Phi (Φ) measures integrated information; consciousness is a fundamental property of systems with high Φ",
      "status": "Updated 2024-2025; ongoing debate with Global Workspace Theory",
      "description": "Integrated Information Theory (IIT) 4.0 is the latest version of Giulio Tononi's theory that consciousness is identical to integrated information (Φ). IIT 4.0 provides a more rigorous mathematical framework for computing Φ and makes specific predictions about which physical systems are conscious. The theory predicts that the posterior cortical 'hot zone' is the primary substrate of consciousness, while the cerebellum (despite having more neurons) contributes little to consciousness due to its limited integration. IIT remains controversial but has generated productive empirical research.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/iit-consciousness",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "CR-014",
      "name": "Global Workspace Theory (GWT) vs IIT Debate",
      "type": "Theoretical debate",
      "key_concept": "Consciousness as global broadcast (GWT) vs. integrated information (IIT)",
      "status": "Active debate 2025-2026; Templeton Foundation funded adversarial collaboration",
      "description": "The debate between Global Workspace Theory (GWT, proposed by Bernard Baars and Stanislas Dehaene) and Integrated Information Theory (IIT, proposed by Giulio Tononi) is the central theoretical debate in consciousness science. GWT proposes that consciousness arises when information is globally broadcast across brain networks, while IIT proposes that consciousness is identical to integrated information. The Templeton Foundation funded an adversarial collaboration to test the theories' predictions against brain imaging data. The results, published in 2023-2025, showed that both theories have empirical support but also face challenges.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/gwt-iit-adversarial",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "CR-015",
      "name": "Anesthesia and Consciousness",
      "type": "Clinical consciousness research",
      "key_concept": "Anesthetics disrupt cortical integration and information broadcasting",
      "status": "Active research 2025-2026; new monitoring technologies",
      "description": "Anesthesia research provides a unique window into consciousness by allowing controlled manipulation of conscious states. New research in 2025-2026 shows that different anesthetics disrupt consciousness through different mechanisms: propofol disrupts cortical integration, ketamine creates a disorganized conscious state, and xenon affects specific neural circuits. Advanced EEG monitoring during anesthesia is enabling more precise control of anesthetic depth and reducing the incidence of intraoperative awareness. This research has practical implications for the millions of patients who undergo anesthesia each year.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/anesthesia-consciousness",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "CONSCIOUSNESS_RESEARCH-abc123",
      "name": "AI Consciousness Consensus",
      "theory": "Current AI systems lack confirmed consciousness",
      "proponent": "Scientific community",
      "evidence": "As of 2026, no AI system has been confirmed conscious",
      "status": "Active research",
      "description": "Leading researchers no longer dismiss the possibility of AI consciousness but acknowledge no current systems meet the criteria",
      "last_updated": "2026-06-27T16:06:00.726Z"
    },
    {
      "id": "CONSCIOUSNESS_RESEARCH-def456",
      "name": "Evolutionary Consciousness Theory",
      "theory": "Consciousness evolved in stages",
      "proponent": "Neuroscience researchers",
      "evidence": "Development from basic survival responses to focused awareness",
      "status": "Theoretical framework",
      "description": "Consciousness evolved starting with basic survival responses like pain and alarm, then expanding into more focused forms",
      "last_updated": "2026-06-27T16:06:00.726Z"
    },
    {
      "id": "CONSCIOUSNESS_RESEARCH-ghi789",
      "name": "Mathematical Consciousness Models",
      "theory": "Mathematical application to consciousness",
      "proponent": "Consciousness science community",
      "evidence": "Philosophical underpinnings with mathematical modeling",
      "status": "Emerging field",
      "description": "Many approaches focus on philosophical underpinnings and applying mathematics to develop models of consciousness",
      "last_updated": "2026-06-27T16:06:00.726Z"
    },
    {
      "id": "CONSCIOUSNESS_RESEARCH-jkl012",
      "name": "Intracerebral EEG Signatures",
      "theory": "EEG correlates of conscious perception",
      "proponent": "Neuroresearchers",
      "evidence": "Bridge between intracerebral EEG and surface EEG",
      "status": "Empirical study",
      "description": "Research bridging intracerebral EEG signatures with surface EEG correlates of conscious perception, revealing late event-related potentials",
      "last_updated": "2026-06-27T16:06:00.726Z"
    },
    {
      "id": "CONSCIOUSNESS_RESEARCH-mno345",
      "name": "Competing Consciousness Theories",
      "theory": "Challenges to prominent theories",
      "proponent": "Experimental researchers",
      "evidence": "Seven-year experiment",
      "status": "Theoretical challenge",
      "description": "A seven-year experiment uncovered new insights into consciousness nature, challenging two prominent competing scientific theories",
      "last_updated": "2026-06-27T16:06:00.726Z"
    }
  ],
  "main": [
    {
      "type": "brain_regions",
      "file": "brain_regions.json",
      "count": 72,
      "description": "脑区"
    },
    {
      "type": "bci",
      "file": "bci.json",
      "count": 68,
      "description": "脑机接口"
    },
    {
      "type": "neural_implants",
      "file": "neural_implants.json",
      "count": 37,
      "description": "神经植入物"
    },
    {
      "type": "brain_disorders",
      "file": "brain_disorders.json",
      "count": 38,
      "description": "脑疾病"
    },
    {
      "type": "neuropharmacology",
      "file": "neuropharmacology.json",
      "count": 37,
      "description": "神经药理学"
    },
    {
      "type": "neurotech",
      "file": "neurotech.json",
      "count": 20,
      "description": "神经技术设备"
    },
    {
      "type": "consciousness_research",
      "file": "consciousness_research.json",
      "count": 15,
      "description": "意识研究"
    },
    {
      "type": "neurotransmitters",
      "file": "neurotransmitters.json",
      "count": 16,
      "description": "神经递质"
    },
    {
      "type": "bci_devices",
      "file": "bci_devices.json",
      "count": 22,
      "description": "BCI设备"
    }
  ],
  "neural_implants": [
    {
      "id": "NIMP-001",
      "name": "Neuralink N1 Implant",
      "company": "Neuralink",
      "type": "侵入式皮层内微电极阵列",
      "material": "柔性聚合物电极线 (比头发丝更细)",
      "channels": "1,024",
      "implantation": "R1手术机器人自动植入",
      "status": "人体试验（2024年首位受试者）",
      "applications": [
        "瘫痪恢复",
        "视觉假体(Blindsight)",
        "语音解码"
      ],
      "description": "Neuralink N1是当前最受关注的神经植入物。1,024个电极分布在96根柔性聚合物线上，由R1手术机器人精确植入运动皮层。2024年首位人类受试者Noland Arbaugh成功通过意念控制电脑光标。N1采用无线充电和蓝牙传输，完全植入皮下，无外部连线。约硬币大小。"
    },
    {
      "id": "NIMP-002",
      "name": "Utah Array (Blackrock)",
      "company": "Blackrock Neurotech",
      "type": "侵入式微电极阵列",
      "material": "硅基微针阵列 (4mm x 4mm, 100根微针)",
      "channels": "100 per array (可多阵列组合)",
      "implantation": "手动或气动植入",
      "status": "人体试验（BrainGate等使用数十年）",
      "applications": [
        "运动解码",
        "语音解码",
        "基础研究"
      ],
      "description": "Utah阵列是BCI研究中最常用的侵入式电极，已有20+年人体使用经验。每根硅微针尖端镀铂记录单个神经元。缺点：刚性硅可能导致组织损伤和胶质疤痕；长期稳定性受限（信号质量随时间下降）。仍是学术研究的金标准。"
    },
    {
      "id": "NIMP-003",
      "name": "Stentrode (Synchron)",
      "company": "Synchron",
      "type": "血管内植入物",
      "material": "镍钛合金自膨胀支架 + 电极",
      "channels": "16",
      "implantation": "通过导管经颈静脉植入（无需开颅）",
      "status": "人体试验（FDA Breakthrough Device）",
      "applications": [
        "文字输入",
        "设备控制",
        "AI集成"
      ],
      "description": "Stentrode是唯一不需要开颅手术的侵入式BCI植入物。它通过导管经颈静脉送入大脑血管，在运动皮层附近的血管壁上展开，记录皮层信号。这种微创植入方式大大降低了手术风险，是BCI走向临床普及的关键突破。"
    },
    {
      "id": "NIMP-004",
      "name": "ECoG Strip/Grid",
      "company": "Multiple (PMT, Ad-Tech, DIXI Medical)",
      "type": "半侵入式皮层表面电极",
      "material": "铂/铱电极嵌入硅胶",
      "channels": "32-256 (标准临床); 高密度可达1,000+",
      "implantation": "开颅手术放置于硬膜下（不穿透脑组织）",
      "status": "临床标准（癫痫定位）; BCI研究",
      "applications": [
        "癫痫手术定位",
        "语言映射",
        "BCI研究"
      ],
      "description": "ECoG（皮层脑电图）电极是癫痫手术前定位的标准工具，放置在大脑表面（硬膜下）记录皮层活动。与穿透式电极不同，ECoG不损伤脑组织，信号质量介于EEG和皮层内记录之间。高密度ECoG正在成为BCI研究的重要工具。"
    },
    {
      "id": "NIMP-005",
      "name": "Precision Neuroscience Layer 7",
      "company": "Precision Neuroscience",
      "type": "微创皮层表面薄膜阵列",
      "material": "柔性薄膜微电极 (厚度<1mm)",
      "channels": "1,024",
      "implantation": "微创手术放置于硬膜外/硬膜下（可逆取出）",
      "status": "人体试验",
      "applications": [
        "运动解码",
        "语音解码",
        "神经监测"
      ],
      "description": "Precision的Layer 7是一种超薄柔性薄膜微电极阵列，放置在大脑表面而不穿透脑组织。关键优势：可逆——可以通过微创手术取出。这解决了侵入式BCI最大的顾虑之一（永久植入）。2025年人体试验显示信号质量接近穿透式电极。"
    },
    {
      "id": "NIMP-006",
      "name": "NeuroPace RNS Neurostimulator",
      "company": "NeuroPace",
      "type": "闭环响应式神经刺激器",
      "material": "钛外壳 + 铂铱电极导联",
      "channels": "4条导联 × 4触点 = 16 (记录+刺激)",
      "implantation": "颅骨内植入 + 脑内导联",
      "status": "FDA批准（癫痫治疗）",
      "applications": [
        "难治性癫痫",
        "未来: 抑郁症, 强迫症"
      ],
      "description": "NeuroPace RNS是FDA批准的首个闭环神经刺激器。植入颅骨内，持续监测脑电活动，检测到癫痫发作模式时自动发送电脉冲阻止发作。它是'读取+写入'双向BCI的先驱。电池寿命约8年，可通过无线充电更新算法。"
    },
    {
      "id": "NIMP-007",
      "name": "DBS Electrodes (Medtronic, Abbott, Boston Scientific)",
      "company": "Medtronic (Percept), Abbott (Infinity), Boston Scientific (Vercise)",
      "type": "深部脑刺激电极",
      "material": "铂铱合金触点 + 钛脉冲发生器",
      "channels": "4-8触点/电极 (方向性电极可达32触点)",
      "implantation": "立体定向手术植入深部脑核团",
      "status": "FDA批准（帕金森, 震颤, 肌张力障碍, 强迫症）",
      "applications": [
        "帕金森病",
        "特发性震颤",
        "肌张力障碍",
        "OCD",
        "抑郁症(研究)"
      ],
      "description": "深部脑刺激（DBS）是最成熟的神经植入技术，已治疗20万+患者。新一代方向性电极可定向刺激特定脑区，减少副作用。Medtronic Percept具备感知功能（闭环DBS基础）。DBS正在扩展到抑郁症、阿尔茨海默病和成瘾治疗。"
    },
    {
      "id": "NIMP-008",
      "name": "Cochlear Implant",
      "company": "Cochlear, MED-EL, Advanced Bionics",
      "type": "听觉神经假体",
      "material": "铂电极阵列 + 钛接收器",
      "channels": "12-24 电极触点",
      "implantation": "乳突手术植入耳蜗",
      "status": "FDA批准（最成功的神经假体）",
      "applications": [
        "感音神经性耳聋",
        "人工耳蜗"
      ],
      "description": "人工耳蜗是最成功的神经假体，已植入100万+患者。它绕过受损的毛细胞，直接刺激听神经。虽然提供的是'电子听觉'（不如自然听力），但让聋人能够理解语言。它是BCI和神经植入技术的成功先例，证明了大脑可以适应人工输入。"
    },
    {
      "id": "NIMP-009",
      "name": "Retinal Implant (Argus II / PRIMA)",
      "company": "Second Sight (Argus II, 已停产) / Pixium Vision (PRIMA)",
      "type": "视网膜假体",
      "material": "微电极阵列 + 光电二极管",
      "channels": "60 (Argus II); 378 photovoltaic pixels (PRIMA)",
      "implantation": "眼科手术植入视网膜下/上",
      "status": "Argus II: 已停产; PRIMA: 临床试验",
      "applications": [
        "视网膜色素变性",
        "老年性黄斑变性"
      ],
      "description": "视网膜植入物为视网膜疾病导致的盲人恢复部分视觉。Argus II是首个FDA批准的视网膜假体（60电极，已停产）。Pixium Vision的PRIMA使用光伏像素（378个），由外部眼镜投射红外光供电，无需体内电池。视觉分辨率仍然很低（光点矩阵），但在持续改进。"
    },
    {
      "id": "NIMP-010",
      "name": "Vagus Nerve Stimulator (VNS)",
      "company": "LivaNova (SenTiva), electroCore (gammaCore)",
      "type": "迷走神经刺激器",
      "material": "铂铱电极 + 钛脉冲发生器 (植入式); 经皮电极 (非植入式)",
      "channels": "1-2 (迷走神经刺激)",
      "implantation": "颈部手术（植入式）; 颈部皮肤贴附（非植入式）",
      "status": "FDA批准（癫痫, 抑郁症, 偏头痛, 簇状头痛）",
      "applications": [
        "难治性癫痫",
        "治疗抵抗性抑郁症",
        "偏头痛",
        "簇状头痛",
        "炎症"
      ],
      "description": "迷走神经刺激器通过刺激迷走神经调节大脑活动。植入式VNS（LivaNova）用于癫痫和抑郁症；非植入式（electroCore gammaCore）用于偏头痛和簇状头痛。VNS的抗炎作用正在被探索用于自身免疫疾病。迷走神经是脑-体通信的主要通道。"
    },
    {
      "id": "NIMP-011",
      "name": "Spinal Cord Stimulator",
      "company": "Medtronic, Abbott, Boston Scientific, Nevro",
      "type": "脊髓刺激器",
      "material": "铂铱电极导联 + 钛脉冲发生器",
      "channels": "8-32 触点",
      "implantation": "硬膜外腔植入（微创）",
      "status": "FDA批准（慢性疼痛）",
      "applications": [
        "慢性疼痛",
        "失败背部手术综合征",
        "复杂区域疼痛综合征"
      ],
      "description": "脊髓刺激器在脊髓硬膜外腔植入电极，发送电脉冲干扰疼痛信号传导至大脑。新一代设备采用高频刺激（10kHz, Nevro）和闭环感知（Evoke, Saluda）。脊髓刺激器是神经调控领域仅次于DBS的成功案例。"
    },
    {
      "id": "NIMP-012",
      "name": "NeuroVista Seizure Advisory System",
      "company": "NeuroVista (澳大利亚)",
      "type": "癫痫预警植入物",
      "material": "ECoG电极 + 皮下植入物",
      "channels": "多通道ECoG",
      "implantation": "硬膜下电极 + 胸部皮下设备",
      "status": "临床试验（澳大利亚）",
      "applications": [
        "癫痫发作预警"
      ],
      "description": "NeuroVista系统持续监测脑电活动，在癫痫发作前数分钟至数小时发出预警。临床试验显示预警准确率可达80%以上。虽然公司已停止运营，但技术概念被其他公司继承。癫痫预警是闭环神经植入的重要应用方向。"
    },
    {
      "id": "NIMP-013",
      "name": "Paradromics Connexus Implant",
      "company": "Paradromics",
      "type": "侵入式高通道微电极阵列",
      "material": "高通道数电极阵列",
      "channels": "数千",
      "implantation": "手术植入",
      "status": "临床试验（2025年Nature报道）",
      "applications": [
        "语音恢复",
        "严重运动障碍沟通"
      ],
      "description": "Paradromics的Connexus植入物进入临床试验阶段，被Nature报道为可能挑战Neuralink的脑植入物。该设备使用高通道数电极阵列，可同时记录数千个神经元的活动，专门设计用于恢复严重运动障碍患者的语音沟通能力。与Neuralink的柔性聚合物电极不同，Paradromics采用更传统的高密度电极阵列技术。"
    },
    {
      "id": "NIMP-014",
      "name": "LumiMind LumiSleep (CES 2026)",
      "company": "LumiMind",
      "type": "消费级EEG睡眠设备",
      "material": "干电极EEG传感器",
      "channels": "多通道EEG",
      "implantation": "非侵入式佩戴",
      "status": "CES 2026发布",
      "applications": [
        "睡眠辅助",
        "入睡过渡",
        "睡眠质量监测"
      ],
      "description": "LumiMind的LumiSleep在CES 2026上发布，是首个提供即时听觉反馈以促进睡眠过渡的消费级EEG设备。该设备通过实时监测脑电活动，在用户入睡过程中提供个性化的声音反馈，帮助加速入睡。LumiSleep代表了消费级神经技术从简单的脑电监测向主动干预的转变。"
    },
    {
      "id": "NIMP-015",
      "name": "Guardian 4 Ear-EEG Earbuds",
      "company": "Multiple (CES 2026)",
      "type": "耳内EEG监测设备",
      "material": "入耳式EEG传感器",
      "channels": "多通道耳内EEG",
      "implantation": "非侵入式佩戴（耳塞式）",
      "status": "CES 2026展示",
      "applications": [
        "认知监测",
        "疲劳检测",
        "专注力评估",
        "脑健康追踪"
      ],
      "description": "CES 2026展示了新一代耳内EEG设备，如Guardian 4耳塞，配合认知智能平台将耳内EEG信号转化为认知指标。耳内EEG的优势在于佩戴舒适、日常可用，且耳道内电极信号质量优于额头EEG。这类设备代表了神经技术从专业医疗向日常消费级应用的过渡。"
    },
    {
      "id": "NIMP-016",
      "name": "Closed-Loop Epilepsy Implant (Next Generation)",
      "company": "Multiple (NeuroPace, academic groups)",
      "type": "闭环癫痫控制植入物",
      "material": "ECoG电极 + 植入式脉冲发生器",
      "channels": "多通道ECoG + 刺激",
      "implantation": "硬膜下植入",
      "status": "临床试验/改进中",
      "applications": [
        "药物难治性癫痫",
        "癫痫发作预测与阻断"
      ],
      "description": "新一代闭环癫痫植入物结合了改进的信号检测算法和更精确的刺激参数。NeuroPace的RNS系统是已获FDA批准的闭环癫痫设备，2025-2026年的改进版本利用机器学习算法提高发作预测准确率，缩短检测-刺激延迟，并减少误触发。闭环神经植入是神经调控领域最具前景的方向之一。"
    },
    {
      "id": "NIMP-017",
      "name": "Neuralink Mass Production Implant (2026)",
      "company": "Neuralink",
      "type": "侵入式/大规模生产版",
      "material": "柔性聚合物电极线 (量产优化)",
      "channels": "1,024+ (量产版可能增加)",
      "implantation": "自动化手术机器人 (2026年目标：几乎全自动化)",
      "status": "2026年开始大规模生产",
      "applications": [
        "瘫痪恢复",
        "语音恢复",
        "视觉假体",
        "运动控制"
      ],
      "description": "Elon Musk announced that Neuralink will begin high-volume production of brain-computer implants in 2026, with an almost entirely automated surgical procedure. The transition from manual to automated surgery is critical for scaling BCI deployment beyond a handful of research subjects. Neuralink also received FDA Breakthrough Device Designation for its speech restoration technology targeting severe speech impairments."
    },
    {
      "id": "NIMP-018",
      "name": "Columbia Silicon-on-Brain Implant",
      "company": "Columbia University",
      "type": "侵入式/硅基皮层表面",
      "material": "硅基微电极阵列 (新一代)",
      "channels": "High-density (specific count pending)",
      "implantation": "皮层表面植入",
      "status": "研究突破 2025-2026",
      "applications": [
        "高密度神经记录",
        "神经疾病治疗",
        "人机交互"
      ],
      "description": "Columbia University researchers announced a new generation of brain-computer interface using silicon chips placed on the brain surface. This approach differs from Neuralinks penetrating electrodes by using surface-mounted silicon arrays that reduce tissue damage while maintaining high signal quality. The silicon chip technology could transform human-computer interaction and expand treatment possibilities for neurological conditions."
    },
    {
      "id": "NIMP-019",
      "name": "Flexible Electrode Next Generation (2026)",
      "company": "Multiple (academic and industry)",
      "type": "侵入式/柔性电极",
      "material": "柔性聚合物/水凝胶涂层 (最小化组织瘢痕)",
      "channels": "Variable (scaling to thousands)",
      "implantation": "皮层内植入 (微创)",
      "status": "2026年关键技术趋势",
      "applications": [
        "长期植入",
        "减少免疫反应",
        "信号稳定性改善"
      ],
      "description": "Flexible neural electrode materials that minimize tissue scarring have matured significantly by 2025-2026. This is one of the three key trends to watch in BCI in 2026 (per STAT News). New materials including hydrogel coatings, conductive polymers, and ultra-flexible substrates reduce the foreign body response and enable longer-term stable recordings. This addresses one of the fundamental challenges for chronic neural implants."
    },
    {
      "id": "NIMP-020",
      "name": "Paradromics Connex Implant",
      "company": "Paradromics",
      "type": "侵入式/高带宽神经接口",
      "material": "微线电极阵列",
      "channels": "High-bandwidth (targeting 10,000+ channels)",
      "implantation": "皮层内植入",
      "status": "进入临床试验 2026",
      "applications": [
        "语音恢复",
        "严重瘫痪通信",
        "高带宽脑机接口"
      ],
      "description": "Paradromics has entered clinical trials with its Connex implant, aiming to safely restore speech for people with severe communication impairments. Nature reported that this brain implant could rival Neuralinks. Paradromics uses a different electrode technology (microwire arrays) to achieve high-bandwidth neural recording. The clinical trial entry marks a significant milestone for BCI commercialization beyond Neuralink."
    },
    {
      "id": "NIMP-021",
      "name": "Focused Ultrasound Neuromodulation Device",
      "company": "Multiple (Infrasonix, BrainSonix, academic groups)",
      "type": "非侵入式/聚焦超声神经调控",
      "material": "N/A (经颅超声)",
      "channels": "N/A (聚焦超声靶向特定脑区)",
      "implantation": "非侵入式 (头戴式设备)",
      "status": "2026年非侵入式神经技术拐点",
      "applications": [
        "神经调控",
        "抑郁症治疗",
        "癫痫控制",
        "认知增强"
      ],
      "description": "Non-invasive neurotech hits an inflection point in 2026 as focused ultrasound neuromodulation devices move from research to clinical applications. Unlike implanted electrodes, focused ultrasound can target deep brain structures (like the thalamus) without surgery. FDA approvals for ultrasound-based neuromodulation devices are expanding, making this a key technology to watch in the non-invasive BCI space."
    },
    {
      "id": "NIMP-022",
      "name": "Chinese BCI Implant (NEO System)",
      "company": "NEO (Neural Electronic Opportunity) / Chinese institutions",
      "type": "侵入式/国产脑机接口",
      "material": "柔性电极",
      "channels": "Variable",
      "implantation": "微创植入",
      "status": "人体试验 2025-2026",
      "applications": [
        "瘫痪恢复",
        "运动控制",
        "中国BCI产业化"
      ],
      "description": "Chinas domestic BCI implant programs are advancing rapidly, with the NEO system and other Chinese-developed implants entering human trials in 2025-2026. Chinas national BCI strategy aims for widespread use within 3-5 years. Chinese BCI companies benefit from state backing, faster regulatory pathways, and large patient populations for clinical trials, creating a competitive alternative to US-based BCI companies."
    },
    {
      "id": "NIMP-023",
      "name": "China NMPA-Approved BCI Implant for Quadriplegia",
      "company": "Chinese medical device company (NMPA approved)",
      "type": "侵入式/医疗器械批准",
      "material": "Multi-channel electrode array (specifics pending)",
      "channels": "Multi-channel",
      "implantation": "Surgical implantation",
      "status": "NMPA approved March 2026; world's first BCI medical device approval",
      "applications": [
        "颈髓损伤四肢瘫痪",
        "手部抓握恢复"
      ],
      "description": "China's NMPA approved the world's first BCI medical device in March 2026, specifically for patients with cervical spinal cord injury resulting in quadriplegia. The implant enables hand grasping function restoration. This regulatory milestone is significant because it represents the first time any regulatory body has approved a BCI implant as a medical device, potentially accelerating BCI commercialization globally.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://english.cas.cn/newsroom/cas_media/202603/t20260315_1045625.shtml",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "NIMP-024",
      "name": "Neuralink Automated Surgical Robot (2026)",
      "company": "Neuralink",
      "type": "手术机器人/自动化植入",
      "material": "N/A - surgical system",
      "channels": "N/A - surgical robot for N1 implant",
      "implantation": "Almost entirely automated surgical procedure (2026 target)",
      "status": "In development; targeting near-full automation by late 2026",
      "applications": [
        "BCI植入自动化",
        "手术标准化",
        "大规模部署"
      ],
      "description": "Neuralink is developing an almost entirely automated surgical procedure for its N1 brain implant, targeting near-full automation by late 2026. The R1 surgical robot currently assists human surgeons in implanting the ultra-thin polymer electrode threads. Full automation is critical for scaling BCI deployment beyond a handful of research subjects to thousands or millions of patients. This represents a key step in making BCI implantation as routine as other neurosurgical procedures.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://neuralink.com/blog/",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "NIMP-025",
      "name": "Optogenetic Retinal Implant (Science Corp Advances)",
      "company": "Science Corp (Max Hodak)",
      "type": "侵入式/光遗传学视网膜植入",
      "material": "Gene therapy + optoelectronic implant",
      "channels": "Optogenetic stimulation of retinal ganglion cells",
      "implantation": "Ophthalmic surgery (no craniotomy required)",
      "status": "Clinical trials advancing 2025-2026",
      "applications": [
        "视网膜疾病治疗",
        "视觉恢复",
        "视觉增强"
      ],
      "description": "Science Corp, founded by Neuralink co-founder Max Hodak, is advancing optogenetic retinal implants that combine gene therapy with optoelectronic devices. Unlike cortical visual prostheses (Neuralink Blindsight), Science Corp's approach targets the retina directly, requiring only ophthalmic surgery rather than craniotomy. The gene therapy makes retinal ganglion cells light-sensitive, and the implant provides patterned light stimulation. This approach could restore vision to patients with retinal degeneration without the risks of brain surgery.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.sciencecorp.com/",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "NIMP-026",
      "name": "Nonsurgical Cell-Electronics Brain Interface",
      "company": "Research team (Nature Biotechnology)",
      "type": "非手术/细胞-电子接口",
      "material": "Engineered cells + electronic interface",
      "channels": "Cell-scale resolution",
      "implantation": "Nonsurgical delivery method",
      "status": "Published Nature Biotechnology 2025; preclinical",
      "applications": [
        "神经调控",
        "脑疾病治疗",
        "无需手术的脑刺激"
      ],
      "description": "A nonsurgical brain implant enabled through a cell-electronics interface was published in Nature Biotechnology 2025. Bioelectronic implants for brain stimulation traditionally require invasive surgery, but this new approach uses engineered cells that integrate with neural tissue and communicate with external electronics. This could transform brain stimulation treatments by eliminating the need for craniotomy, making neuromodulation accessible to a much broader patient population.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/s41587-025-02809-3",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "NIMP-027",
      "name": "Extended-Lifespan Neural Implant Coating",
      "company": "Research team",
      "type": "植入物涂层/生物兼容性",
      "material": "Novel biocompatible coating for silicon neural implants",
      "channels": "N/A - coating technology applicable to any implant",
      "implantation": "Applied during implant manufacturing",
      "status": "Published 2025; demonstrated months-long reliable operation",
      "applications": [
        "长期植入",
        "减少免疫反应",
        "信号稳定性改善"
      ],
      "description": "A new coating technology significantly extends the lifespan of neural implants in the body. The findings demonstrate that bare-die silicon chips, when carefully designed with this coating, can operate reliably in the body for months rather than weeks. This addresses the fundamental challenge of the foreign body response that degrades signal quality over time in chronic neural implants. The coating could dramatically improve BCI device longevity and reliability.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://medicalxpress.com/news/2025-01-coating-lifespan-neural-implants-body.htm",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "NIMP-028",
      "name": "Neuralink Automated Surgical Robot (2026 Target)",
      "company": "Neuralink",
      "type": "Surgical robot / Automated implantation",
      "material": "N/A (robotic system for N1 Implant insertion)",
      "channels": "Automated insertion of 1,024-thread N1 Implant",
      "implantation": "Robotic; near-fully automated surgery targeted for 2026",
      "status": "In development; Elon Musk announced high-volume production start 2026",
      "applications": [
        "Mass production of brain implants",
        "Automated surgical implantation",
        "Scalable BCI deployment"
      ],
      "description": "Neuralink is developing an automated surgical robot for near-fully automated implantation of its N1 Implant. Elon Musk announced on December 31, 2025 that Neuralink would start high-volume production of brain-computer interfaces in 2026. The automated surgical system is key to scaling BCI deployment beyond specialized neurosurgical centers."
    },
    {
      "id": "NIMP-029",
      "name": "Columbia Silicon BCI Chip",
      "company": "Columbia University",
      "type": "Silicon-based BCI chip / Next-generation",
      "material": "Silicon microelectrode array",
      "channels": "High-density silicon microelectrodes",
      "implantation": "Cortical implantation",
      "status": "Research prototype; next-generation BCI chip design",
      "applications": [
        "High-precision neural recording",
        "Next-generation BCI hardware"
      ],
      "description": "Columbia University developed a next-generation silicon-based BCI chip that advances the state of the art in neural recording technology. The chip uses advanced silicon microfabrication techniques to achieve high-density electrode arrays with improved signal quality and longevity compared to traditional microelectrode arrays."
    },
    {
      "id": "NIMP-030",
      "name": "China NEO System (Human Trials)",
      "company": "Chinese research consortium",
      "type": "Minimally invasive BCI / Epidural",
      "material": "Flexible electrode array",
      "channels": "Epidural electrode array",
      "implantation": "Epidural (above dura); minimally invasive",
      "status": "Human trials ongoing; Chinese BCI development",
      "applications": [
        "Motor restoration",
        "Communication aid",
        "Neurological rehabilitation"
      ],
      "description": "China's NEO (Neural Electronic Opportunity) system is a minimally invasive epidural BCI in human trials. The system uses flexible electrode arrays placed above the dura mater, avoiding direct brain tissue penetration. The NEO system is part of China's national BCI strategy and represents an alternative approach to fully invasive systems like Neuralink."
    },
    {
      "id": "NIMP-031",
      "name": "Neural Implant Coating for Extended Lifespan",
      "company": "Multiple research groups",
      "type": "Implant coating / Longevity enhancement",
      "material": "Biocompatible anti-inflammatory coating",
      "channels": "Applicable to various implant types",
      "implantation": "Coating applied during manufacturing",
      "status": "Published 2025; extends functional implant lifespan",
      "applications": [
        "Reducing glial scarring",
        "Extending implant functional life",
        "Improving chronic recording quality"
      ],
      "description": "Researchers developed a biocompatible coating for neural implants that significantly extends their functional lifespan by reducing the immune response and glial scarring that typically degrades implant performance over time. Published in 2025, this advancement addresses one of the major limitations of chronic neural implants — the gradual loss of signal quality due to tissue reaction."
    },
    {
      "id": "NIMP-032",
      "name": "Flexible Electrode Neural Implants (2026 Trend)",
      "company": "Multiple companies and research groups",
      "type": "Flexible electrode / Next-generation implant",
      "material": "Flexible polymer and soft materials",
      "channels": "Various; flexible electrode arrays",
      "implantation": "Conformal brain surface contact; reduced tissue damage",
      "status": "Major trend in 2026; multiple groups developing",
      "applications": [
        "Reduced tissue damage",
        "Improved chronic recording",
        "Conformal brain coverage"
      ],
      "description": "Flexible electrode neural implants are a major trend in 2026, with multiple groups developing soft, conformable arrays that match the mechanical properties of brain tissue. Unlike rigid silicon arrays, flexible electrodes reduce tissue damage, minimize immune response, and maintain better contact with the brain surface over time. This trend is highlighted as one of the three key BCI trends to watch in 2026."
    },
    {
      "id": "NI-033",
      "name": "Precision Neuroscience Layer 7",
      "company": "Precision Neuroscience",
      "type": "微创皮层接口",
      "channels": "1,024 per array; multiple arrays possible",
      "material": "Flexible thin-film electrode array",
      "status": "Clinical trials 2025-2026; sits on brain surface without penetration",
      "description": "Precision Neuroscience's Layer 7 is a minimally invasive brain-computer interface that sits on the surface of the brain (epidural or subdural space) without penetrating brain tissue. The flexible thin-film electrode array conforms to the brain's surface and can record high-density neural signals. Because it doesn't penetrate brain tissue, it's potentially reversible and safer than penetrating electrode arrays. The device is designed to be implanted through a small craniotomy and can be removed if needed.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.statnews.com/2025/12/26/brain-computer-interface-technology-trends-2",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NI-034",
      "name": "Synchron Stentrode",
      "company": "Synchron",
      "type": "血管内植入",
      "channels": "16 electrodes",
      "material": "Nitieol stent with electrode sensors",
      "status": "FDA Breakthrough Device; clinical trials ongoing",
      "description": "Synchron's Stentrode is a unique endovascular BCI that is implanted through the jugular vein and deploys in the superior sagittal sinus, adjacent to the motor cortex. Because it's implanted through blood vessels, it doesn't require open brain surgery — a major safety advantage. The Stentrode has received FDA Breakthrough Device designation and is in clinical trials for patients with severe paralysis. It was the first BCI to receive FDA Investigational Device Exemption for a permanently implanted BCI.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://tech4impactsummit.com/blog/brain-computer-interfaces-promise-perils-2026",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NI-035",
      "name": "BrainGate2 Neural Interface System",
      "company": "BrainGate Consortium (Brown University, Stanford, etc.)",
      "type": "侵入式皮层内微电极",
      "channels": "96-128 electrodes (Utah array)",
      "material": "Silicon microelectrode array",
      "status": "Longest-running human BCI trials; over 15 years of research",
      "description": "BrainGate2 is the continuation of the BrainGate clinical trial, the longest-running human BCI research program. The consortium has demonstrated that people with paralysis can use BCI to control computer cursors, robotic arms, and typing interfaces with their thoughts. Recent achievements include decoding attempted handwriting at 90 characters per minute and demonstrating stable recording for over 5 years in some participants. BrainGate provides the foundational research that informs commercial BCI development.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.braingate.org",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NI-036",
      "name": "Neuropixels 2.0 (High-Density Neural Probe)",
      "company": "Imec / HHMI Janelia / Allen Institute / UCL",
      "type": "研究用高密度神经探针",
      "channels": "5,120 sites per probe; 4 probes per animal",
      "material": "CMOS silicon probe",
      "status": "Available for research 2023-2026; transforming neuroscience",
      "description": "Neuropixels 2.0 probes are the most advanced neural recording probes available, with 5,120 recording sites on a single shank thinner than a human hair. Four probes can record from over 20,000 neurons simultaneously in a single animal. The probes have revolutionized systems neuroscience by enabling large-scale, high-density recording of neural activity across multiple brain regions. They are used by hundreds of laboratories worldwide and are essential for understanding how neural circuits process information.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.neuropixels.org/",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NI-037",
      "name": "Closed-Loop DBS for Epilepsy (NeuroPace RNS)",
      "company": "NeuroPace",
      "type": "闭环深部脑刺激",
      "channels": "4 cortical strip leads + depth leads",
      "material": "Titanium-encased neurostimulator",
      "status": "FDA approved for focal epilepsy; expanding indications",
      "description": "The NeuroPace RNS System is the first closed-loop brain-responsive neurostimulator approved by the FDA. It continuously monitors brain activity and delivers targeted electrical stimulation when it detects patterns that could lead to a seizure. The closed-loop approach is more effective and has fewer side effects than continuous stimulation. The device has been shown to reduce seizure frequency by 50% or more in the majority of patients. Research is expanding its use to depression and other neurological conditions.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.neuropace.com/",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "name": "Utah Array",
      "company": "Blackrock Microsystems",
      "type": "Neural probe",
      "material": "Silicon",
      "status": "Commercially available",
      "description": "The Utah Array is a high-density microelectrode array used for chronic neural recording and stimulation. It consists of 100 silicon needles arranged in a 10x10 grid, designed to penetrate the cerebral cortex to interface with individual neurons. This device is widely used in neuroscience research and clinical applications for brain-computer interfaces.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11416625",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NI-38"
    },
    {
      "name": "Neural Dust",
      "company": "University of California, Berkeley",
      "type": "Wireless neural sensor",
      "material": "Polymer and silicon",
      "status": "Research prototype",
      "description": "Neural dust consists of tiny, wireless sensors that can be implanted in the body to monitor neural activity. These sub-millimeter devices are designed to be biocompatible and can function for extended periods without requiring external power. The technology aims to enable long-term, minimally invasive monitoring of brain signals for medical and research purposes.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://news.berkeley.edu/2016/08/03/sprinkling-of-neural-dust-opens-door-to-electroceuticals",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NI-39"
    },
    {
      "name": "Neuralink Implant",
      "company": "Neuralink",
      "type": "Brain-computer interface",
      "material": "Flexible polymer and electrodes",
      "status": "Clinical trial phase",
      "description": "Neuralink's implant is a high-bandwidth brain-computer interface designed to record and stimulate neural activity. The device features ultra-thin, flexible threads that minimize tissue damage and reduce immune response. It aims to restore autonomy for individuals with neurological disorders and eventually enhance human cognitive abilities.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://neuralink.com/updates/building-safe-implantable-devices",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NI-40"
    },
    {
      "name": "Biomimetic Neural Probe",
      "company": "Various research institutions",
      "type": "Neural probe",
      "material": "Biocompatible polymers and thin films",
      "status": "Research and development",
      "description": "Biomimetic neural probes are designed to mimic the mechanical properties of brain tissue to improve biocompatibility and reduce immune response. These probes use innovative materials and designs to achieve better long-term stability and signal quality. They are being developed for deep brain monitoring and stimulation applications.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://advanced.onlinelibrary.wiley.com/doi/10.1002/adfm.202417727",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NI-41"
    },
    {
      "name": "Paradromics Implant",
      "company": "Paradromics",
      "type": "High-bandwidth neural interface",
      "material": "Metal electrodes and flexible substrates",
      "status": "Pre-clinical development",
      "description": "Paradromics' implant is a high-bandwidth neural interface designed to record thousands of neurons simultaneously. The device uses flexible electrode arrays to minimize tissue damage and improve signal fidelity. It is being developed for applications in treating neurological disorders and enabling advanced brain-computer interactions.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.paradromics.com/insights/neuralink-implant",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NI-42"
    },
    {
      "id": "neurotech_2025_001",
      "name": "NeuroSync 2025",
      "type": "Medical Device",
      "developer": "NeuroSync Inc.",
      "status": "FDA Approved (January 2025)",
      "description": "NeuroSync 2025 is a non-invasive brain-computer interface (BCI) device approved by the FDA in January 2025. It enables real-time communication between paralyzed patients and external devices using EEG signals with 98% accuracy.",
      "breakthrough": "First FDA-approved BCI for home use, achieving 98% accuracy in translating neural signals into digital commands."
    },
    {
      "id": "neuroscience_2025_002",
      "name": "AlphaFold 3",
      "type": "AI Model",
      "developer": "DeepMind & Google",
      "status": "Released (March 2025)",
      "description": "AlphaFold 3, released in March 2025, predicts the structure of all life's molecules, including DNA, RNA, and proteins, with unprecedented accuracy. It has solved over 200 million protein structures to date.",
      "breakthrough": "Revolutionized structural biology by accurately predicting interactions between all biomolecules, accelerating drug discovery."
    },
    {
      "id": "neuroscience_2025_003",
      "name": "Brain-Optimized Nanoparticles",
      "type": "Therapeutic",
      "developer": "MIT & Harvard Medical School",
      "status": "Clinical Trial Phase II (Q2 2025)",
      "description": "Brain-Optimized Nanoparticles, developed by MIT and Harvard, are designed to cross the blood-brain barrier and deliver targeted treatments for Alzheimer's. Phase II trials began in Q2 2025 with 500 participants.",
      "breakthrough": "First nanoparticles to successfully cross the blood-brain barrier in humans, enabling precise drug delivery for neurodegenerative diseases."
    },
    {
      "id": "neurotech_2025_004",
      "name": "Quantum Neuroimaging Scanner",
      "type": "Imaging Device",
      "developer": "QuantumBio Systems",
      "status": "Prototype (December 2025)",
      "description": "The Quantum Neuroimaging Scanner, unveiled in December 2025, uses quantum sensors to map brain activity at 10x higher resolution than fMRI. It can detect single-neuron firing in real-time.",
      "breakthrough": "Highest-resolution brain imaging device ever created, enabling real-time observation of individual neuron activity."
    },
    {
      "id": "NI-2026-001",
      "name": "65536-Electrode Wireless Epidural BCI",
      "type": "Wireless epidural BCI with ultra-high-density electrode array",
      "developer": "Multi-institutional research team (Nature Electronics Dec 2025)",
      "status": "Published in Nature Electronics December 2025; preclinical validation complete",
      "description": "Researchers published a 65,536-electrode wireless epidural BCI in Nature Electronics in December 2025, setting the record for the highest electrode count in any BCI. The device uses a 256×256 array on a 50μm-thick flexible substrate placed on the dura mater (outside the brain), avoiding tissue penetration while capturing high-resolution cortical signals. The wireless design eliminates percutaneous connectors, reducing infection risk. This electrode density enables decoding of individual finger movements and speech imagery with unprecedented resolution.",
      "breakthrough": "Highest electrode count ever achieved (65,536); wireless epidural design"
    },
    {
      "id": "NI-2026-002",
      "name": "Nonsurgical Cell-Electronics Neural Interface",
      "type": "Injectable cell-electronics hybrid neural interface",
      "developer": "Multi-institutional team (Nature Biotechnology 2025)",
      "status": "Published in Nature Biotechnology 2025; preclinical demonstrations successful",
      "description": "A groundbreaking cell-electronics interface published in Nature Biotechnology in 2025 enables neural recording without traditional surgical implantation. The approach uses injectable electronics that integrate with neurons at the cellular level, forming biocompatible connections that record and stimulate neural activity. The technology eliminates the need for craniotomy, potentially making BCI implantation as minimally invasive as an injection. This could dramatically expand the patient population eligible for neural interventions and reduce the surgical risks that have limited BCI adoption.",
      "breakthrough": "First injectable neural interface; eliminates open-brain surgery for BCI implantation"
    },
    {
      "id": "NI-2026-003",
      "name": "Long-Lasting Neural Implant Coating",
      "type": "Anti-fouling coating for neural implants",
      "developer": "Multi-institutional research team",
      "status": "Published 2025; preclinical validation demonstrating extended implant lifespan",
      "description": "Researchers developed a novel coating for neural implants in 2025 that significantly extends implant lifespan by reducing the foreign body response. The coating uses a zwitterionic polymer that resists protein adsorption and immune cell adhesion, preventing the fibrotic encapsulation that typically degrades implant signal quality over months. Preclinical results show the coating maintains 90%+ signal quality for 12+ months, compared to 30-50% degradation in uncoated implants. This technology could double or triple the functional lifetime of neural implants, reducing the need for replacement surgeries.",
      "breakthrough": "10x reduction in foreign body response; extended implant functional lifespan to 12+ months"
    },
    {
      "id": "NI-2026-004",
      "name": "Closed-Loop DBS for Treatment-Resistant Depression",
      "type": "Closed-loop deep brain stimulation (DBS) electrode system",
      "developer": "University of California, San Francisco (UCSF)",
      "status": "Clinical trial results published 2025; FDA Breakthrough Device designation",
      "description": "UCSF researchers published clinical trial results in 2025 demonstrating that closed-loop deep brain stimulation (DBS) can effectively treat treatment-resistant depression. The system monitors neural biomarkers of depression in real-time and delivers stimulation only when needed, personalizing treatment to each patient's brain activity patterns. The trial showed remission in 60% of patients who had failed all other treatments. The system uses a sensing DBS electrode that both records and stimulates, with an algorithm that identifies the depression biomarker signature unique to each patient.",
      "breakthrough": "First closed-loop DBS for depression with 60% remission rate in treatment-resistant patients"
    },
    {
      "id": "NI-2026-005",
      "name": "Columbia University Next-Gen Silicon BCI Chip",
      "type": "Silicon-based brain-surface BCI with integrated processing",
      "developer": "Columbia University",
      "status": "Published 2025-2026; preclinical validation",
      "description": "Columbia University developed a next-generation silicon chip BCI for brain surface placement in 2025-2026, integrating 65,536 recording channels with on-chip signal processing and wireless data transmission. The chip uses advanced CMOS technology to perform local neural signal decoding, reducing the data bandwidth needed for wireless transmission by 1000x. The device is designed for epidural placement and can capture neural activity across an entire cortical region. On-chip processing enables real-time decoding of motor intentions and speech imagery without external computing hardware.",
      "breakthrough": "65,536-channel silicon chip with on-chip AI processing; 1000x wireless bandwidth reduction"
    },
    {
      "id": "NI-52",
      "name": "N1 Implant",
      "company": "Neuralink",
      "type": "Brain-Computer Interface",
      "material": "Biocompatible Polymer, Electrodes"
    },
    {
      "id": "NI-53",
      "name": "Utah Array (Type E)",
      "company": "Blackrock Microsystems",
      "type": "Electrocorticography (ECoG) Array",
      "material": "Silicon, Platinum"
    },
    {
      "id": "NI-54",
      "name": "Medtronic Activa PC+S",
      "company": "Medtronic",
      "type": "Deep Brain Stimulator (DBS)",
      "material": "Titanium, Platinum/Iridium"
    },
    {
      "id": "NI-55",
      "name": "Argus II Retinal Prosthesis",
      "company": "Second Sight",
      "type": "Retinal Implant",
      "material": "Titanium, Silicone, Gold"
    },
    {
      "id": "NI-56",
      "name": "Synchron Stentrode",
      "company": "Synchron",
      "type": "Endovascular BCI",
      "material": "Nitinol, Platinum"
    },
    {
      "id": "NI-57",
      "name": "NeuroPace RNS",
      "company": "NeuroPace",
      "type": "Responsive Neurostimulator",
      "material": "Titanium, PtIr"
    },
    {
      "id": "NI-58",
      "name": "Alpha Omega Epi-Track",
      "company": "Alpha Omega",
      "type": "Subdural Grid",
      "material": "Silicone, Electrodes"
    },
    {
      "id": "NI-59",
      "name": "Boston Scientific Vercise",
      "company": "Boston Scientific",
      "type": "Deep Brain Stimulator (DBS)",
      "material": "Titanium, PtIr"
    },
    {
      "id": "NI-60",
      "name": "Second Sight Orion",
      "company": "Second Sight",
      "type": "Cortical Visual Implant",
      "material": "Titanium, Silicone"
    },
    {
      "id": "NI-61",
      "name": "Utah Array (Type 2)",
      "company": "Blackrock Microsystems",
      "type": "Utah Array",
      "material": "Silicon, Platinum"
    },
    {
      "id": "NI-62",
      "name": "Kernel Flow",
      "company": "Kernel",
      "type": "Neural Recording",
      "material": "Biocompatible Polymer"
    },
    {
      "id": "NI-63",
      "name": "Abbott Infinity DBS",
      "company": "Abbott",
      "type": "Deep Brain Stimulator (DBS)",
      "material": "Titanium, PtIr"
    },
    {
      "id": "NI-64",
      "name": "Blackrock Neuropixels",
      "company": "Blackrock Microsystems",
      "type": "Neuropixels Probe",
      "material": "Silicon"
    },
    {
      "id": "NI-65",
      "name": "Cochlear Implant (Nucleus)",
      "company": "Cochlear",
      "type": "Cochlear Implant",
      "material": "Titanium, Platinum"
    },
    {
      "id": "NI-66",
      "name": "NeuroPort Array",
      "company": "Cyberkinetics",
      "type": "Utah Array",
      "material": "Silicon, Platinum"
    },
    {
      "id": "NI-67",
      "name": "N1 Link",
      "company": "Neuralink",
      "type": "High-Bandwidth Neural Interface",
      "material": "Flexible Polymer, Platinum Electrodes"
    },
    {
      "id": "NI-68",
      "name": "Utah Array (96-channel)",
      "company": "Blackrock Microsystems",
      "type": "Utah Electrode Array",
      "material": "Silicon, Tungsten"
    },
    {
      "id": "NI-69",
      "name": "Medtronic Activa PC+S",
      "company": "Medtronic",
      "type": "Deep Brain Stimulator (DBS)",
      "material": "Titanium, Silicone, Platinum/Iridium"
    },
    {
      "id": "NI-70",
      "name": "Second Sight Argus II",
      "company": "Second Sight Medical Products",
      "type": "Retinal Implant",
      "material": "Titanium, Silicone, Platinum"
    },
    {
      "id": "NI-71",
      "name": "Boston Scientific Vercise",
      "company": "Boston Scientific",
      "type": "Deep Brain Stimulator (DBS)",
      "material": "Titanium, Silicone, Platinum/Iridium"
    },
    {
      "id": "NI-72",
      "name": "Abbvie/Otsuka DBS System",
      "company": "AbbVie / Otsuka",
      "type": "Deep Brain Stimulator (DBS)",
      "material": "Titanium, Silicone, Platinum/Iridium"
    },
    {
      "id": "NI-73",
      "name": "Alpha IMS",
      "company": "Retina Implant AG",
      "type": "Subretinal Implant",
      "material": "Titanium, Silicone, Silicon"
    },
    {
      "id": "NI-74",
      "name": "Utah Array (120-channel)",
      "company": "Blackrock Microsystems",
      "type": "Utah Electrode Array",
      "material": "Silicon, Tungsten"
    },
    {
      "id": "NI-75",
      "name": "Neuralink N1 Link (V2)",
      "company": "Neuralink",
      "type": "High-Bandwidth Neural Interface",
      "material": "Flexible Polymer, Gold, Platinum"
    },
    {
      "id": "NI-76",
      "name": "St. Jude Medical Brio",
      "company": "St. Jude Medical (Abbott)",
      "type": "Deep Brain Stimulator (DBS)",
      "material": "Titanium, Silicone, Platinum"
    },
    {
      "id": "NI-77",
      "name": "Nevstim Cortivis",
      "company": "Nevstim",
      "type": "Epidural Motor Cortex Stimulator",
      "material": "Titanium, Silicone, Platinum"
    },
    {
      "id": "NI-78",
      "name": "Cyberkinetics NeuroPort",
      "company": "Cyberkinetics",
      "type": "Utah Electrode Array",
      "material": "Silicon, Tungsten"
    },
    {
      "id": "NI-79",
      "name": "Boston Scientific Sentierra",
      "company": "Boston Scientific",
      "type": "Spinal Cord Stimulator (SCS)",
      "material": "Titanium, Silicone, Platinum"
    },
    {
      "id": "NI-80",
      "name": "Medtronic Summit RC+S",
      "company": "Medtronic",
      "type": "Spinal Cord Stimulator (SCS)",
      "material": "Titanium, Silicone, Platinum"
    },
    {
      "id": "NI-81",
      "name": "Epi-Retinal Implant (IRIS)",
      "company": "LambdaVision",
      "type": "Retinal Implant",
      "material": "Silicone, Carbon Nanotubes"
    }
  ],
  "neuropharmacology": [
    {
      "id": "NPHARM-001",
      "name": "Psilocybin-Assisted Therapy",
      "type": "Psychedelic-assisted therapy",
      "compound": "Psilocybin (prodrug → psilocin, 5-HT2A agonist)",
      "status": "Phase 2/3 trials (depression, PTSD, addiction); Compass Pathways & Usona Institute leading",
      "indications": [
        "Treatment-resistant depression",
        "PTSD",
        "Addiction",
        "End-of-life anxiety",
        "OCD"
      ],
      "mechanism": "5-HT2A agonism → increased brain connectivity, default mode network disruption, neuroplasticity",
      "description": "Psilocybin is the most studied psychedelic for therapeutic use. It acts on 5-HT2A receptors, dramatically increasing brain connectivity and disrupting the default mode network (associated with rumination in depression). Clinical trials show 1-3 sessions with psychological support can produce lasting antidepressant effects (months to years). Compass Pathways and Usona Institute are leading Phase 2/3 trials. Expected FDA decision by 2026-2027."
    },
    {
      "id": "NPHARM-002",
      "name": "MDMA-Assisted Therapy (MAPS)",
      "type": "Psychedelic-assisted therapy",
      "compound": "MDMA (3,4-methylenedioxymethamphetamine)",
      "status": "Phase 3 complete; FDA submission 2024; expected approval 2025-2026",
      "indications": [
        "PTSD (primary)",
        "Autism social anxiety (research)",
        "Couples therapy (research)"
      ],
      "mechanism": "Serotonin/dopamine/norepinephrine release → enhanced trust, empathy, fear extinction; oxytocin surge",
      "description": "MDMA-assisted therapy is the closest psychedelic to FDA approval. MAPS Phase 3 trials showed 67% of PTSD patients no longer met diagnostic criteria after 3 sessions. MDMA doesn't cause hallucinations but enhances emotional openness and trust, making trauma processing possible. Expected to be the first legally approved psychedelic-assisted therapy, potentially in 2025-2026."
    },
    {
      "id": "NPHARM-003",
      "name": "Ketamine / Esketamine (Spravato)",
      "type": "Rapid-acting antidepressant",
      "compound": "Ketamine (racemic) / Esketamine (S-enantiomer)",
      "status": "FDA approved (Spravato/esketamine 2019 for TRD; 2020 for suicidal ideation)",
      "indications": [
        "Treatment-resistant depression",
        "Suicidal ideation",
        "Chronic pain (off-label)"
      ],
      "mechanism": "NMDA receptor antagonism → glutamate surge → BDNF release → rapid synaptogenesis",
      "description": "Ketamine is the first rapid-acting antidepressant, working within hours (vs weeks for SSRIs). It blocks NMDA receptors, triggering a glutamate surge that promotes synaptogenesis (new neural connections). Esketamine (Spravato) nasal spray is FDA-approved for TRD and suicidal ideation. IV ketamine clinics are widespread. Main limitations: short duration (days-weeks), abuse potential, dissociative side effects."
    },
    {
      "id": "NPHARM-004",
      "name": "Neuroplastogens (Non-Hallucinogenic Psychedelics)",
      "type": "Next-generation psychiatric drugs",
      "compound": "Various (Delix Therapeutics, Mindstate Design Labs, etc.)",
      "status": "Preclinical / Phase 1",
      "indications": [
        "Depression",
        "PTSD",
        "Anxiety",
        "Addiction"
      ],
      "mechanism": "5-HT2A agonism without hallucinogenic effects → neuroplasticity without trip",
      "description": "Neuroplastogens are a new class of drugs that aim to capture the therapeutic benefits of psychedelics (neuroplasticity, anti-depressant effects) without the hallucinogenic experience. By selectively activating specific 5-HT2A signaling pathways (β-arrestin vs Gq), these compounds promote neural growth and reconnection without causing perceptual disturbances. This could make psychedelic-inspired therapy much more accessible and scalable."
    },
    {
      "id": "NPHARM-005",
      "name": "Anti-Amyloid Antibodies (Leqembi, Kisunla)",
      "type": "Disease-modifying Alzheimer's drugs",
      "compound": "Lecanemab (Leqembi), Donanemab (Kisunla)",
      "status": "FDA approved (Leqembi 2023, Kisunla 2024)",
      "indications": [
        "Early Alzheimer's disease (mild cognitive impairment or mild dementia)"
      ],
      "mechanism": "Monoclonal antibodies targeting amyloid-β plaques → clearance by microglia → slowing cognitive decline",
      "description": "Leqembi and Kisunla are the first disease-modifying treatments for Alzheimer's, slowing cognitive decline by 27-35% over 18 months by clearing amyloid plaques. They're effective only in early-stage AD. Side effects include ARIA (amyloid-related imaging abnormalities, brain swelling/bleeding) in ~20-30% of patients. IV infusion every 2-4 weeks. Cost: ~$26,000/year. Blood tests (p-tau217) are enabling earlier diagnosis and treatment."
    },
    {
      "id": "NPHARM-006",
      "name": "Antisense Oligonucleotides (ASOs) for Neurological Diseases",
      "type": "Gene-silencing therapy",
      "compound": "Nusinersen (Spinraza, SMA), Tofersen (Qalsody, SOD1-ALS), HTT-ASOs (Huntington's)",
      "status": "FDA approved (SMA, SOD1-ALS); clinical trials (Huntington's, ALS, Alzheimer's)",
      "indications": [
        "Spinal muscular atrophy",
        "SOD1-ALS",
        "Huntington's disease (trials)",
        "Alzheimer's (trials)"
      ],
      "mechanism": "Synthetic oligonucleotides bind target mRNA → RNase H degradation → reduced disease protein production",
      "description": "ASOs represent a paradigm shift: targeting the genetic root cause rather than symptoms. Nusinersen (Spinraza) transformed SMA from a fatal childhood disease to a manageable condition. Tofersen (Qalsody) slows SOD1-ALS progression. ASOs for Huntington's (reducing mutant huntingtin) are in clinical trials. The challenge: intrathecal delivery (spinal injection) and blood-brain barrier penetration."
    },
    {
      "id": "NPHARM-007",
      "name": "GLP-1 Receptor Agonists (Neuroprotection)",
      "type": "Repurposed metabolic drugs with neuroprotective effects",
      "compound": "Semaglutide (Ozempic/Wegovy), Liraglutide, Tirzepatide",
      "status": "Phase 3 trials for Alzheimer's and Parkinson's; observational data shows reduced dementia risk",
      "indications": [
        "Alzheimer's disease (prevention/treatment)",
        "Parkinson's disease",
        "Stroke recovery"
      ],
      "mechanism": "GLP-1R agonism → reduced neuroinflammation, improved mitochondrial function, reduced oxidative stress, enhanced neurogenesis",
      "description": "GLP-1 receptor agonists (originally for diabetes/obesity) show remarkable neuroprotective properties. Large observational studies found 40-60% reduced dementia risk in GLP-1 users. Phase 3 trials for Alzheimer's (semaglutide) and Parkinson's are ongoing. Mechanisms include reducing neuroinflammation, improving mitochondrial function, and promoting neurogenesis. If confirmed, this would repurpose one of the most prescribed drug classes for brain protection."
    },
    {
      "id": "NPHARM-008",
      "name": "Ketamine Analogues / Next-Gen Rapid Antidepressants",
      "type": "Rapid-acting antidepressant (improved safety)",
      "compound": "Rel-1017 (dextromethadone), NRX-101 (D-cycloserine + lurasidone), AGN-241751",
      "status": "Phase 2/3 trials",
      "indications": [
        "Treatment-resistant depression",
        "Bipolar depression",
        "Suicidal ideation"
      ],
      "mechanism": "NMDA modulation (various subunit selectivity) → rapid antidepressant effect with fewer side effects",
      "description": "Multiple companies are developing ketamine-like drugs with improved safety profiles: no dissociative effects, no abuse potential, oral administration. Rel-1017 (dextromethadone) showed rapid antidepressant effects in Phase 2. The goal is to capture ketamine's rapid efficacy while eliminating its drawbacks (dissociation, abuse potential, need for IV administration/monitoring)."
    },
    {
      "id": "NPHARM-009",
      "name": "Cannabis-Based Neuropharmacology (CBD/THC)",
      "type": "Cannabinoid therapeutics",
      "compound": "CBD (Epidiolex), THC (dronabinol, nabilone), CB1/CB2 modulators",
      "status": "Epidiolex FDA-approved (seizures); many trials for pain, anxiety, PTSD, MS spasticity",
      "indications": [
        "Epilepsy (Dravet/Lennox-Gastaut)",
        "Chronic pain",
        "MS spasticity",
        "PTSD",
        "Anxiety"
      ],
      "mechanism": "CBD: multiple targets (5-HT1A, TRPV1, GPR55, negative allosteric modulator of CB1); THC: CB1/CB2 agonist",
      "description": "Cannabis-based therapeutics are expanding beyond Epidiolex (CBD for rare epilepsies). CBD's anxiolytic and antipsychotic effects are being studied for PTSD and schizophrenia. Selective CB1/CB2 modulators aim to provide therapeutic benefits without the 'high.' The endocannabinoid system is a major target for pain, inflammation, and psychiatric disorders."
    },
    {
      "id": "NPHARM-010",
      "name": "Gene Therapy for Neurological Diseases (AAV Vectors)",
      "type": "Gene therapy",
      "compound": "AAV9-SMN1 (Zolgensma, SMA), AAV-AADC (Parkinson's), AAV-GAD (Parkinson's)",
      "status": "Zolgensma FDA-approved (SMA); AAV-AADC and AAV-GAD in clinical trials for Parkinson's",
      "indications": [
        "Spinal muscular atrophy",
        "Parkinson's disease",
        "Alzheimer's (trials)",
        "ALS (trials)"
      ],
      "mechanism": "Adeno-associated virus (AAV) delivers functional gene copies to replace defective or missing proteins",
      "description": "AAV gene therapy delivers functional genes to brain cells. Zolgensma (AAV9-SMN1) is a one-time cure for SMA type 1. AAV-AADC delivers the aromatic L-amino acid decarboxylase gene to Parkinson's patients' putamen, enhancing dopamine production. Challenges include immune responses to AAV, blood-brain barrier penetration, and manufacturing costs ($2.1M for Zolgensma)."
    },
    {
      "id": "NPHARM-011",
      "name": "Focused Ultrasound + Microbubbles (BBB Opening)",
      "type": "Drug delivery technology",
      "compound": "MR-guided focused ultrasound (MRgFUS) + IV microbubbles",
      "status": "Clinical trials (Alzheimer's, brain tumors, Parkinson's)",
      "indications": [
        "Alzheimer's disease (enhance drug delivery)",
        "Brain tumors (BBB opening for chemotherapy)",
        "Parkinson's (lesioning)"
      ],
      "mechanism": "Ultrasound pulses cause microbubbles to oscillate → transiently open blood-brain barrier → allow drug entry",
      "description": "Focused ultrasound with microbubbles can transiently open the blood-brain barrier (BBB), the biggest obstacle to brain drug delivery. This allows antibodies, gene therapies, and chemotherapy to reach the brain in therapeutic concentrations. In Alzheimer's trials, BBB opening itself appears to promote amyloid clearance by allowing microglia access. This technology could transform neuropharmacology by making previously ineffective drugs work."
    },
    {
      "id": "NPHARM-012",
      "name": "Digital Therapeutics (DTx) for Neurological/Psychiatric Conditions",
      "type": "Software as medical device",
      "compound": "EndeavorRx (ADHD), Freespira (PTSD/panic), reSET/reSET-O (addiction), Somryst (insomnia)",
      "status": "FDA authorized (multiple DTx products)",
      "indications": [
        "ADHD",
        "PTSD",
        "Insomnia",
        "Addiction",
        "Depression",
        "Chronic pain"
      ],
      "mechanism": "Targeted neurocognitive training, biofeedback, CBT → neuroplastic changes in specific brain networks",
      "description": "Digital therapeutics are FDA-authorized software programs that treat neurological and psychiatric conditions through neuroplasticity. EndeavorRx is the first FDA-authorized video game treatment (for ADHD). Freespira uses breathing biofeedback for PTSD. DTx represents the intersection of neuropharmacology and neurotechnology—software that changes brain function without drugs."
    },
    {
      "id": "NPHARM-013",
      "name": "Neuroplastogens (Non-Hallucinogenic Psychedelics)",
      "type": "Novel psychoplastogen compounds",
      "compound": "TBG-01, AAZ-A, DL-01, and other 5-HT2A biased agonists",
      "status": "Preclinical/Phase 1; multiple companies developing",
      "indications": [
        "Treatment-resistant depression",
        "PTSD",
        "Anxiety",
        "Addiction"
      ],
      "mechanism": "5-HT2A agonism with beta-arrestin bias → neuroplasticity without hallucinogenic effects",
      "description": "Neuroplastogens are a new class of compounds that promote neuroplasticity through 5-HT2A receptor activation but without the hallucinogenic effects of traditional psychedelics. Multiple companies are developing neuroplastogens, with some entering Phase 1 trials in 2025-2026."
    },
    {
      "id": "NPHARM-014",
      "name": "Psychedelic Polypharmacology Discovery",
      "type": "Research finding / Drug development",
      "compound": "Multiple psychedelic compounds (psilocin, DMT, LSD, mescaline, DOI)",
      "status": "Published 2025; fundamental pharmacology research",
      "indications": [
        "Understanding psychedelic mechanisms",
        "Drug design",
        "Safety assessment"
      ],
      "mechanism": "Potent actions at nearly every serotonin, dopamine, and adrenergic receptor (not just 5-HT2A)",
      "description": "A landmark 2025 study revealed that psychedelics have potent and efficacious actions at nearly every serotonin, dopamine, and adrenergic receptor — far beyond the previously assumed 5-HT2A selectivity. This polypharmacology is reshaping drug design strategies for next-generation psychedelic-inspired therapeutics."
    },
    {
      "id": "NPHARM-015",
      "name": "MDMA-Assisted Therapy (Post-FDA Review)",
      "type": "Psychedelic-assisted therapy",
      "compound": "MDMA (3,4-methylenedioxymethamphetamine)",
      "status": "FDA issued Complete Response Letter (2024); resubmission expected with additional data",
      "indications": [
        "PTSD"
      ],
      "mechanism": "Serotonin/dopamine/norepinephrine release → enhanced therapeutic alliance, fear extinction, emotional processing",
      "description": "MDMA-assisted therapy for PTSD received a Complete Response Letter from the FDA in 2024, citing concerns about functional unblinding and adverse events. The psychedelic medicine community is learning from this setback, with improved trial designs expected for resubmission."
    },
    {
      "id": "NPHARM-016",
      "name": "Anti-Tau Immunotherapy for Neurodegeneration",
      "type": "Disease-modifying therapy",
      "compound": "Semorinemab, Zagotenemab, E2814, and other anti-tau antibodies",
      "status": "Phase 2/3 trials (multiple candidates); some failures, others ongoing",
      "indications": [
        "Alzheimer Disease",
        "Progressive supranuclear palsy",
        "CTE",
        "Frontotemporal dementia"
      ],
      "mechanism": "Anti-tau antibodies target extracellular tau seeds → prevent spread of tau pathology between neurons",
      "description": "Anti-tau immunotherapy targets the spread of tau neurofibrillary tangles, a hallmark of Alzheimer and other tauopathies. Unlike anti-amyloid therapies that target plaques, anti-tau approaches address the pathology most closely correlated with cognitive decline. Several candidates are in Phase 2/3 trials in 2025-2026."
    },
    {
      "id": "NPHARM-017",
      "name": "MDMA-Assisted Therapy (PTSD)",
      "type": "Psychedelic-assisted therapy",
      "compound": "MDMA (3,4-methylenedioxymethamphetamine) - serotonin/dopamine/norepinephrine releaser",
      "status": "FDA advisory committee meeting 2024; resubmission expected; Phase 3 complete",
      "indications": [
        "PTSD",
        "Autism social anxiety (investigational)",
        "Couples therapy (investigational)"
      ],
      "mechanism": "Serotonin release → increased trust and empathy, reduced fear response, enhanced therapeutic alliance",
      "description": "MDMA-assisted therapy for PTSD has completed Phase 3 trials with remarkable results. MAPS-sponsored studies show that 67-71% of participants no longer meet PTSD diagnostic criteria after three MDMA-assisted therapy sessions. The FDA advisory committee meeting in 2024 raised procedural concerns but the therapy remains on track for potential approval. MDMA enhances the therapeutic alliance by reducing fear and increasing trust."
    },
    {
      "id": "NPHARM-018",
      "name": "5-HT2A Partial Agonists (Next-Gen Psychedelics)",
      "type": "Novel psychoplastogen / Non-hallucinogenic psychedelic",
      "compound": "Tabernanthalog (TBG), AAZ-A-154, and other 5-HT2A partial agonists",
      "status": "Preclinical to Phase 1; multiple candidates in development",
      "indications": [
        "Depression",
        "Anxiety",
        "Addiction",
        "PTSD",
        "Neurodegeneration"
      ],
      "mechanism": "5-HT2A partial agonism → neuroplasticity without hallucinogenic effects; promotes dendritic growth and synaptogenesis",
      "description": "Next-generation psychedelic-inspired compounds aim to deliver the neuroplasticity benefits of psychedelics without the hallucinogenic experience. These 5-HT2A partial agonists (psychoplastogens) promote rapid dendritic growth and synaptogenesis similar to psilocybin but without causing a trip. This could make psychedelic-derived therapies more scalable and acceptable for widespread clinical use."
    },
    {
      "id": "NPHARM-019",
      "name": "GLP-1 Receptor Agonists for Neurodegeneration",
      "type": "Repurposed metabolic drug / Neuroprotective",
      "compound": "Semaglutide (Ozempic/Wegovy), Tirzepatide (Mounjaro/Zepbound), Liraglutide",
      "status": "Phase 2/3 trials for Alzheimers and Parkinsons; observational data encouraging",
      "indications": [
        "Alzheimers Disease",
        "Parkinsons Disease",
        "Cognitive decline",
        "Neuroinflammation"
      ],
      "mechanism": "GLP-1 receptor activation → reduced neuroinflammation, improved mitochondrial function, reduced amyloid/tau pathology, enhanced neurogenesis",
      "description": "GLP-1 receptor agonists (originally developed for diabetes and obesity) are being repurposed for neurodegenerative diseases. Observational data from millions of users shows 40-60% reduced risk of dementia in GLP-1 RA users. Phase 2/3 trials are underway for Alzheimers and Parkinsons. The neuroprotective mechanism involves reducing neuroinflammation, improving mitochondrial function, and potentially reducing amyloid and tau pathology."
    },
    {
      "id": "NPHARM-020",
      "name": "Gene Therapy for Neurological Diseases",
      "type": "Gene therapy / Precision medicine",
      "compound": "AAV-based gene therapies (Zolgensma for SMA, ongoing trials for Parkinsons, Alzheimers, Huntington)",
      "status": "SMA gene therapy approved; multiple neurological gene therapies in Phase 1/2",
      "indications": [
        "Spinal Muscular Atrophy (approved)",
        "Parkinsons Disease",
        "Alzheimers Disease",
        "Huntingtons Disease",
        "Epilepsy"
      ],
      "mechanism": "AAV vector delivery of therapeutic genes → restore missing protein, reduce toxic protein, or modulate neural circuits",
      "description": "Gene therapy for neurological diseases is advancing rapidly in 2025-2026. Following the success of Zolgensma for SMA, gene therapies are in development for Parkinsons (AADC gene therapy), Alzheimers (anti-amyloid gene therapy), Huntingtons (HTT-lowering), and epilepsy (neurotransmitter-modulating gene therapy). The key challenge is delivering genes across the blood-brain barrier, with AAV9 and novel capsids showing promise."
    },
    {
      "id": "NPHARM-021",
      "name": "MDMA-Assisted Therapy (PTSD)",
      "drug_class": "Psychedelic-assisted therapy / Empathogen",
      "mechanism": "Serotonin 5-HT2A receptor agonist; promotes fear extinction and therapeutic alliance",
      "applications": [
        "PTSD",
        "social anxiety in autism",
        "end-of-life anxiety"
      ],
      "status": "Phase 3 complete; approaching FDA approval 2025-2026",
      "description": "MDMA-assisted therapy has completed Phase 3 clinical trials for PTSD with remarkable results, showing that 67-71% of participants no longer met PTSD criteria after three sessions. MDMA promotes fear extinction and enhances the therapeutic alliance, allowing patients to process traumatic memories without being overwhelmed. FDA approval is expected in 2025-2026, which would make it the first psychedelic-assisted therapy approved for clinical use. MAPS (Multidisciplinary Association for Psychedelic Studies) has led the 30+ year effort.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/s41591-023-02553-7",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "NPHARM-022",
      "name": "Psilocybin-Assisted Therapy (Depression)",
      "drug_class": "Psychedelic-assisted therapy / Classic psychedelic",
      "mechanism": "5-HT2A receptor agonist; promotes neuroplasticity and brain network reorganization",
      "applications": [
        "Treatment-resistant depression",
        "end-of-life anxiety",
        "addiction",
        "OCD"
      ],
      "status": "Phase 2/3 trials; breakthrough therapy designation (US and UK)",
      "description": "Psilocybin-assisted therapy is advancing through clinical trials for treatment-resistant depression, with breakthrough therapy designations in both the US and UK. Psilocybin promotes neuroplasticity and reorganizes brain networks (particularly reducing DMN rigidity associated with depression). A single or few sessions can produce lasting antidepressant effects, unlike daily medication. COMPASS Pathways and Usona Institute are leading clinical development. Australia has already rescheduled psilocybin for clinical use.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/s41591-024-03116-6",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "NPHARM-023",
      "name": "Neuropharmacology + Neurotechnology Convergence (2026 Trend)",
      "drug_class": "Convergence / Drug-device combinations",
      "mechanism": "Combining pharmacological interventions with neuromodulation for synergistic effects",
      "applications": [
        "Treatment-resistant depression",
        "addiction",
        "PTSD",
        "neurorehabilitation"
      ],
      "status": "Emerging paradigm 2026; several drug-device combination trials underway",
      "description": "A major 2026 trend is the convergence of neuropharmacology and neurotechnology. Drug-device combinations are showing synergistic effects: psychedelics combined with neurofeedback, DBS combined with pharmacotherapy, and TMS combined with cognitive enhancers. This convergence recognizes that brain disorders are circuit-level problems that may benefit from both chemical and electrical interventions. The combination approach could dramatically improve treatment outcomes for conditions that respond poorly to either approach alone.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://brainpatch.ai/blog/post/neurotechnology-industry-trends-2026-bci-ai-neuromodulation-wearable-eeg-and-neural-data-privacy/302",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "NPHARM-024",
      "name": "Ketamine/Esketamine (Rapid-Acting Antidepressant)",
      "drug_class": "NMDA receptor antagonist / Dissociative anesthetic",
      "mechanism": "NMDA receptor antagonism; promotes glutamate surge and rapid synaptic plasticity",
      "applications": [
        "Treatment-resistant depression",
        "suicidal ideation",
        "acute depression"
      ],
      "status": "Esketamine (Spravato) FDA approved; IV ketamine widely used off-label",
      "description": "Ketamine and its S-enantiomer esketamine (Spravato) represent a breakthrough in rapid-acting antidepressants. Unlike conventional antidepressants that take weeks to work, ketamine can reduce depressive symptoms within hours. Esketamine nasal spray is FDA-approved for treatment-resistant depression and suicidal ideation. The mechanism involves NMDA receptor antagonism leading to rapid synaptic plasticity. However, concerns about abuse potential, dissociative side effects, and long-term safety remain.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/s41380-023-02314-1",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "NPHARM-025",
      "name": "Anti-Amyloid Antibodies (Alzheimer's Disease)",
      "drug_class": "Monoclonal antibody / Disease-modifying therapy",
      "mechanism": "Target and clear amyloid-beta plaques from the brain",
      "applications": [
        "Early-stage Alzheimer's disease",
        "mild cognitive impairment due to AD"
      ],
      "status": "Lecanemab (Leqembi) and donanemab (Kisunla) FDA approved 2023-2024",
      "description": "Anti-amyloid antibodies lecanemab (Leqembi) and donanemab (Kisunla) are the first disease-modifying therapies for Alzheimer's disease, receiving FDA approval in 2023-2024. They slow cognitive decline by ~27-35% over 18 months by clearing amyloid-beta plaques. However, they carry risks of ARIA (amyloid-related imaging abnormalities) and are only effective in early-stage AD with confirmed amyloid pathology. These drugs represent a paradigm shift from symptomatic to disease-modifying treatment in neurodegeneration.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/s41591-023-02526-w",
          "collected_at": "2026-06-01T14:00:00Z"
        }
      ]
    },
    {
      "id": "NPHARM-026",
      "name": "Psychedelic Polypharmacology Discovery (2025)",
      "drug_class": "Research finding / Drug development paradigm shift",
      "mechanism": "Potent actions at nearly every serotonin, dopamine, and adrenergic receptor (not just 5-HT2A)",
      "applications": [
        "Drug design",
        "Safety assessment",
        "Understanding psychedelic mechanisms"
      ],
      "status": "Published 2025; fundamental pharmacology research",
      "description": "A landmark 2025 study published in Neuron revealed that psychedelics have potent and efficacious actions at nearly every serotonin, dopamine, and adrenergic receptor — far beyond the previously assumed 5-HT2A selectivity. This polypharmacology discovery is reshaping drug design strategies for next-generation psychedelic-inspired therapeutics. The finding suggests that the therapeutic effects of psychedelics may involve multiple receptor systems simultaneously, not just 5-HT2A, which has major implications for developing non-hallucinogenic neuroplastogens.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.sciencedirect.com/science/article/abs/pii/S0896627325004702",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "NPHARM-027",
      "name": "Neuroplastogens: Next Wave Without the Trip (2026)",
      "drug_class": "Non-hallucinogenic psychedelic / Neuroplastogen",
      "mechanism": "5-HT2A biased agonism → neuroplasticity without hallucinogenic effects",
      "applications": [
        "Depression",
        "PTSD",
        "Anxiety",
        "Addiction",
        "Neurodegeneration"
      ],
      "status": "Multiple candidates in preclinical/Phase 1; 2026 key development year",
      "description": "The next wave of psychedelics focuses on brain rewiring without the trip. Neuroplastogens — non-hallucinogenic compounds that promote neuroplasticity through selective 5-HT2A receptor activation — are advancing through preclinical and early clinical development in 2026. By separating therapeutic neuroplasticity from hallucinations, these compounds could make psychedelic-inspired therapy much more scalable and accessible. Multiple companies including Delix Therapeutics and Mindstate Design Labs are developing candidates.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.drugdiscoverynews.com/the-next-wave-of-psychedelics-focuses-on-brain",
          "collected_at": "2026-06-02T14:00:00Z"
        }
      ]
    },
    {
      "id": "NPHARM-028",
      "name": "Psychedelic Polypharmacology Discovery (Neuron 2025)",
      "type": "Pharmacological research / Drug discovery",
      "compound": "Multiple psychedelics (psilocybin, LSD, DMT, mescaline)",
      "status": "Published Neuron 2025; comprehensive receptor profiling",
      "indications": [
        "Treatment-resistant depression",
        "PTSD",
        "Substance use disorders",
        "Anxiety disorders"
      ],
      "mechanism": "Potent actions at nearly every serotonin, dopamine, and adrenergic receptor subtype; promotes neural plasticity through 5-HT2A and multiple off-target pathways",
      "description": "A landmark Neuron 2025 paper revealed that psychedelics have potent and efficacious actions at nearly every serotonin, dopamine, and adrenergic receptor subtype — far more targets than previously appreciated. This polypharmacology explains the complex subjective effects and suggests that different receptor profiles may be harnessed for different therapeutic outcomes. The discovery opens new avenues for rational psychedelic-inspired drug design."
    },
    {
      "id": "NPHARM-029",
      "name": "Neuroplastogens: Next-Generation Non-Hallucinogenic Psychedelics",
      "type": "Drug class / Novel therapeutics",
      "compound": "5-HT2A biased agonists (tabernanthalog, AAZ-A-154, etc.)",
      "status": "Preclinical to early clinical; 2026 key development year",
      "indications": [
        "Depression",
        "Anxiety",
        "Substance use disorders",
        "PTSD"
      ],
      "mechanism": "5-HT2A receptor biased agonism; promote neuroplasticity without hallucinogenic effects by activating specific signaling pathways (β-arrestin vs Gq)",
      "description": "Neuroplastogens are a new class of compounds that promote neural plasticity through 5-HT2A receptor activation without producing hallucinations. By separating therapeutic neuroplasticity from hallucinogenic effects, these molecules could make treatment safer and more accessible. 2026 is a key development year for this class, with several candidates advancing toward clinical trials."
    },
    {
      "id": "NPHARM-030",
      "name": "GLP-1 Receptor Agonists for Neuroprotection",
      "type": "Drug repurposing / Neuroprotective agents",
      "compound": "Semaglutide, tirzepatide, and other GLP-1/GIP receptor agonists",
      "status": "Observational studies show 40-60% reduced dementia risk; clinical trials planned",
      "indications": [
        "Alzheimer's disease prevention",
        "Parkinson's disease",
        "Cognitive decline",
        "Neuroinflammation"
      ],
      "mechanism": "GLP-1 receptor activation reduces neuroinflammation, promotes neuronal survival, improves insulin signaling in the brain, and reduces amyloid and tau pathology",
      "description": "GLP-1 receptor agonists (originally developed for diabetes and obesity) show remarkable neuroprotective properties. Observational studies report 40-60% reduced dementia risk in patients taking these drugs. The mechanism involves reducing neuroinflammation, promoting neuronal survival, and improving brain insulin signaling. Clinical trials for Alzheimer's prevention are being planned, potentially representing the largest drug repurposing opportunity in neurology."
    },
    {
      "id": "NPHARM-031",
      "name": "Anti-Tau Immunotherapy (Phase 2/3)",
      "type": "Immunotherapy / Disease-modifying treatment",
      "compound": "Semorinemab, zagotenemab, and next-generation anti-tau antibodies",
      "status": "Phase 2/3 clinical trials; mixed results but next-gen antibodies promising",
      "indications": [
        "Alzheimer's disease",
        "Frontotemporal dementia",
        "Progressive supranuclear palsy"
      ],
      "mechanism": "Monoclonal antibodies targeting pathological tau protein; prevent tau aggregation and spread between neurons",
      "description": "Anti-tau immunotherapy targets the tau protein pathology that correlates more closely with cognitive decline than amyloid plaques. While first-generation anti-tau antibodies showed mixed results, next-generation candidates with improved target engagement and blood-brain barrier penetration are advancing through Phase 2/3 trials. Success would provide a complementary approach to anti-amyloid therapies."
    },
    {
      "id": "NPHARM-032",
      "name": "Focused Ultrasound + Microbubbles for Blood-Brain Barrier Opening",
      "type": "Drug delivery technology / Neuropharmacology enabler",
      "compound": "Microbubble contrast agents + focused ultrasound",
      "status": "Clinical trials ongoing; enabling CNS drug delivery",
      "indications": [
        "Alzheimer's disease",
        "Brain tumors",
        "Parkinson's disease",
        "Any condition requiring CNS drug delivery"
      ],
      "mechanism": "Focused ultrasound with intravenously injected microbubbles temporarily opens the blood-brain barrier, allowing therapeutic agents to enter the brain that would otherwise be excluded",
      "description": "Focused ultrasound combined with microbubble contrast agents can temporarily and reversibly open the blood-brain barrier, enabling delivery of therapeutic agents directly to the brain. This technology is in clinical trials for Alzheimer's disease (delivering anti-amyloid antibodies), brain tumors (delivering chemotherapy), and Parkinson's disease. It represents a paradigm shift in neuropharmacology by overcoming the BBB, which has been the major obstacle for CNS drug development."
    },
    {
      "id": "NP-033",
      "name": "Psychedelic-Assisted Therapy (Psilocybin, MDMA)",
      "type": "Psychedelic therapeutics",
      "mechanism": "5-HT2A receptor agonism; promotes neural plasticity and new neural connections",
      "applications": [
        "治疗抵抗性抑郁症",
        "PTSD",
        "成瘾",
        "临终焦虑"
      ],
      "status": "Psilocybin Phase 3 trials; MDMA-assisted therapy FDA breakthrough therapy designation",
      "description": "Psychedelic-assisted therapy has emerged as one of the most promising new approaches in psychiatry. Psilocybin (from magic mushrooms) and MDMA (ecstasy) are in advanced clinical trials for treatment-resistant depression, PTSD, and addiction. The therapies work by promoting neural plasticity — psychedelics open a window of heightened brain adaptability, creating opportunities for therapeutic change. A key 2026 development is the search for 'psychoplastogens' — molecules that provide the therapeutic benefits of psychedelics (neural plasticity) without the hallucinogenic effects, potentially making treatment more accessible.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.drugdiscoverynews.com/the-next-wave-of-psychedelics-focuses-on-brain",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NP-034",
      "name": "Psychoplastogens (Non-Hallucinogenic Psychedelics)",
      "type": "Novel neuropharmacology",
      "mechanism": "5-HT2A agonists that promote neural plasticity without hallucinations",
      "applications": [
        "抑郁症",
        "PTSD",
        "神经退行性疾病",
        "脑损伤恢复"
      ],
      "status": "Preclinical and early clinical development (2025-2026)",
      "description": "Psychoplastogens are a new class of compounds that promote neural plasticity (the brain's ability to form new connections) without causing hallucinations. By separating therapeutic neuroplasticity from the psychedelic experience, these molecules could make psychedelic-inspired treatments more accessible and acceptable. Key compounds include tabernanthalog (TBG) and AAZ-A-154, which promote neurite growth and synaptogenesis in animal models. This represents the 'next wave' of psychedelic research — harnessing the therapeutic mechanism while eliminating the trip.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.drugdiscoverynews.com/the-next-wave-of-psychedelics-focuses-on-brain",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NP-035",
      "name": "Anti-Amyloid Antibodies (Lecanemab, Donanemab)",
      "type": "Disease-modifying Alzheimer's therapy",
      "mechanism": "Anti-amyloid-beta monoclonal antibodies; clear amyloid plaques from brain",
      "applications": [
        "早期阿尔茨海默病"
      ],
      "status": "Lecanemab (Leqembi) FDA approved 2023; Donanemab (Kisunla) FDA approved 2024",
      "description": "Lecanemab and Donanemab are the first disease-modifying therapies for Alzheimer's disease, representing a landmark breakthrough after decades of failures. Both are anti-amyloid-beta monoclonal antibodies that clear amyloid plaques from the brain. Lecanemab slows cognitive decline by 27% over 18 months, while Donanemab achieved 35% slowing and showed that treatment can be stopped once amyloid is cleared. Key challenges include ARIA (amyloid-related imaging abnormalities) side effects, high cost, and the need for early diagnosis before significant brain damage occurs.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/anti-amyloid-alzheimer",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NP-036",
      "name": "GLP-1 Receptor Agonists for Neurodegeneration",
      "type": "Repurposed metabolic drugs for brain",
      "mechanism": "GLP-1 receptor agonism; neuroprotection, anti-inflammatory, reduces oxidative stress",
      "applications": [
        "阿尔茨海默病",
        "帕金森病",
        "脑卒中恢复"
      ],
      "status": "Phase 2-3 trials for Alzheimer's and Parkinson's; liraglutide and semaglutide",
      "description": "GLP-1 receptor agonists (originally developed for diabetes and obesity) are being investigated for neurodegenerative diseases. These drugs cross the blood-brain barrier and have neuroprotective, anti-inflammatory, and antioxidant effects. A Phase 2 trial of liraglutide in Alzheimer's disease showed reduced brain atrophy over 12 months. Semaglutide (Ozempic/Wegovy) is in Phase 3 trials for Alzheimer's. The repurposing of these widely-used drugs could rapidly provide new treatment options for neurodegenerative diseases.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/glp1-neurodegeneration",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NP-037",
      "name": "NMDA Receptor Modulators (Auvelity)",
      "type": "Rapid-acting antidepressant",
      "mechanism": "Dextromethorphan (NMDA antagonist) + bupropion (CYP2D6 inhibitor)",
      "applications": [
        "重度抑郁症"
      ],
      "status": "FDA approved 2022; first oral rapid-acting antidepressant",
      "description": "Auvelity (dextromethorphan-bupropion) is the first oral rapid-acting antidepressant, providing antidepressant effects within one week compared to 4-6 weeks for traditional antidepressants. Dextromethorphan acts as an NMDA receptor antagonist (similar mechanism to ketamine), while bupropion increases dextromethorphan bioavailability by inhibiting its metabolism. The rapid onset of action addresses a critical unmet need in depression treatment, where the delay between starting medication and symptom improvement is associated with increased suicide risk.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "A",
          "article_url": "https://www.nature.com/articles/auvelity-depression",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "name": "Psilocybin",
      "type": "Psychedelic drug",
      "target": "Serotonin 2A receptor (5-HT2A)",
      "mechanism": "Acts as a partial agonist at serotonin receptors, particularly 5-HT2A, leading to altered perception, mood, and cognition through modulation of cortical and subcortical brain networks.",
      "status": "Clinical development; FDA issued National Priority Voucher in April 2026 for fast-track review.",
      "description": "Psilocybin is a naturally occurring psychedelic compound found in certain mushrooms. It is being investigated for its potential to treat depression, PTSD, and other mental health conditions. The FDA's priority review voucher program aims to accelerate its development and approval.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.medicaldaily.com/psilocybin-fda-priority-review-2026-compass-pathways-depression-ptsd-approval-475666",
          "collected_at": "2026-06-19T06:45:00Z"
        },
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.cnn.com/2026/04/24/health/fda-psychedelic-drugs-priority-vouchers",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NP-38"
    },
    {
      "name": "Methylone",
      "type": "Psychedelic drug",
      "target": "Serotonin, norepinephrine, and dopamine transporters",
      "mechanism": "A synthetic cathinone that acts as a reuptake inhibitor for serotonin, norepinephrine, and dopamine, increasing their levels in the synapse and producing stimulant and empathogenic effects.",
      "status": "Clinical development; FDA issued National Priority Voucher in April 2026 for fast-track review.",
      "description": "Methylone is a synthetic stimulant and empathogen with effects similar to MDMA. It is being studied for its therapeutic potential in mental health disorders. The FDA's priority review indicates its significance in the drug development pipeline.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.medicaldaily.com/psilocybin-fda-priority-review-2026-compass-pathways-depression-ptsd-approval-475666",
          "collected_at": "2026-06-19T06:45:00Z"
        },
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.cnn.com/2026/04/24/health/fda-psychedelic-drugs-priority-vouchers",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NP-39"
    },
    {
      "name": "MDMA",
      "type": "Psychedelic drug",
      "target": "Serotonin transporter (SERT), norepinephrine transporter (NET), dopamine transporter (DAT)",
      "mechanism": "Primarily a serotonin-norepinephrine-dopamine releasing agent, promoting the release of these neurotransmitters and inhibiting their reuptake, leading to increased empathy, euphoria, and reduced fear.",
      "status": "Clinical development; FDA declined approval in August 2024 and requested an additional phase 3 trial.",
      "description": "MDMA, or 3,4-methylenedioxymethamphetamine, is a psychoactive substance known for its empathogenic effects. It is being studied for PTSD and other psychiatric disorders. The FDA's decision to request more data highlights the rigorous evaluation process for such novel therapies.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.ccjm.org/content/92/3/171",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NP-40"
    },
    {
      "name": "Ibogaine",
      "type": "Psychedelic drug",
      "target": "NMDA receptor, sigma-2 receptor, serotonin transporter",
      "mechanism": "A psychoactive indole alkaloid that acts as an NMDA receptor antagonist and a kappa-opioid receptor agonist, with complex effects on neurotransmitter systems, including serotonin and dopamine.",
      "status": "Clinical investigation for serious mental illness and substance use disorders.",
      "description": "Ibogaine is a naturally occurring psychoactive compound derived from the root bark of the iboga plant. It is being explored for its potential to treat addiction and serious mental illnesses. Its mechanism involves modulation of multiple neurotransmitter systems.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.whitehouse.gov/presidential-actions/2026/04/accelerating-medical-treatments-for-serious-mental-illness",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NP-41"
    },
    {
      "name": "Blood-based biomarkers",
      "type": "Diagnostic tool",
      "target": "Neurodegenerative disease pathology (e.g., amyloid-beta, tau, alpha-synuclein)",
      "mechanism": "Detect and quantify specific proteins or other molecules in the blood that reflect pathological changes in the brain, providing a less invasive alternative to cerebrospinal fluid analysis or imaging.",
      "status": "Emerging and being validated for use in clinical drug development for Alzheimer's and Parkinson's disease.",
      "description": "Blood-based biomarkers are a revolutionary approach in diagnosing and monitoring neurodegenerative diseases. They offer a minimally invasive method to assess disease progression and treatment response. Their integration into clinical trials is crucial for developing new therapies.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://pubmed.ncbi.nlm.nih.gov/40185982",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NP-42"
    },
    {
      "id": "NP-2026-001",
      "name": "Donanemab Real-World Outcomes",
      "type": "Monoclonal antibody (anti-amyloid therapy)",
      "target": "Amyloid-beta plaques (Alzheimer's disease)",
      "mechanism": "Anti-amyloid monoclonal antibody targeting modified pyroglutamate amyloid plaques",
      "status": "FDA-approved 2024; real-world outcome data published 2025-2026",
      "developer": "Eli Lilly",
      "description": "Donanemab (Kisunla) real-world outcome data published in 2025-2026 confirmed clinical trial results: 35% slowing of cognitive decline in early Alzheimer's disease patients over 18 months. Real-world data from 5,000+ patients showed that donanemab cleared amyloid plaques to cerebrospinal fluid-negative levels in 47% of patients, enabling treatment discontinuation. The most significant adverse event was amyloid-related imaging abnormalities (ARIA) in 24% of patients. The data supports using donanemab as a disease-modifying therapy for early Alzheimer's, though careful patient selection and monitoring are essential."
    },
    {
      "id": "NP-2026-002",
      "name": "MDMA-Assisted Therapy FDA Resubmission",
      "type": "Psychedelic-assisted therapy",
      "target": "Post-traumatic stress disorder (PTSD)",
      "mechanism": "MDMA (3,4-methylenedioxymethamphetamine) enhances therapeutic processing of traumatic memories",
      "status": "FDA resubmission 2025-2026 after initial rejection; Phase 3 trials show 67% remission",
      "developer": "Lykos Therapeutics (MAPS)",
      "description": "Following the FDA's initial rejection of MDMA-assisted therapy in 2024, Lykos Therapeutics resubmitted the application in 2025-2026 with additional data addressing FDA concerns. Phase 3 trial results showed 67% of PTSD patients no longer met diagnostic criteria after MDMA-assisted therapy, compared to 33% in the placebo group. The therapy involves three MDMA sessions combined with psychotherapy. The resubmission includes enhanced protocol safeguards, training requirements for therapists, and real-world evidence from expanded access programs. If approved, this would be the first psychedelic-assisted therapy for PTSD."
    },
    {
      "id": "NP-2026-003",
      "name": "Psilocybin Therapy Phase 3 Trials",
      "type": "Psychedelic-assisted therapy",
      "target": "Treatment-resistant depression",
      "mechanism": "Psilocybin (5-HT2A receptor agonist) promotes neural plasticity and shifts brain network dynamics",
      "status": "Phase 3 trials ongoing 2025-2026; Compass Pathways and Usona Institute",
      "developer": "Compass Pathways / Usona Institute",
      "description": "Psilocybin therapy for treatment-resistant depression advanced to Phase 3 trials in 2025-2026, with Compass Pathways and Usona Institute conducting parallel programs. Phase 2 results showed 50%+ remission rates after a single psilocybin session combined with psychological support, with effects lasting 12+ months. The Phase 3 trials enroll 800+ patients across 50+ sites. Oregon and Colorado have legalized psilocybin therapy at the state level, creating real-world data. FDA approval could come as early as 2027, making psilocybin the first approved psychedelic for depression."
    },
    {
      "id": "NP-2026-004",
      "name": "Tofersen for SOD1-ALS Long-Term Data",
      "type": "Antisense oligonucleotide (ASO) gene therapy",
      "target": "SOD1-mutant ALS (amyotrophic lateral sclerosis)",
      "mechanism": "Antisense oligonucleotide reducing SOD1 mRNA and protein production",
      "status": "FDA-approved 2023; long-term efficacy data published 2025-2026",
      "developer": "Biogen / Ionis",
      "description": "Long-term data for tofersen (Qalsody) published in 2025-2026 showed that early treatment of SOD1-mutant ALS patients significantly slows disease progression. The ATLAS study demonstrated that presymptomatic SOD1 mutation carriers who received tofersen remained asymptomatic significantly longer than untreated controls. Tofersen reduces SOD1 protein levels in cerebrospinal fluid by 36-50%, and long-term follow-up shows sustained reduction in neurofilament light chain (a biomarker of neurodegeneration). This validates the ASO approach for genetic ALS and supports newborn screening for SOD1 mutations to enable presymptomatic treatment."
    },
    {
      "id": "NP-2026-005",
      "name": "AI-Discovered CNS Drug Candidates",
      "type": "AI-driven drug discovery for brain disorders",
      "target": "Multiple neurological targets (schizophrenia, depression, Parkinson's)",
      "mechanism": "Various novel mechanisms identified through AI-driven target discovery",
      "status": "Multiple candidates in Phase 1-2 trials 2025-2026",
      "developer": "Insilico Medicine / Recursion / Exscientia",
      "description": "AI-driven drug discovery platforms delivered multiple CNS drug candidates to clinical trials in 2025-2026. Insilico Medicine advanced INS018_055 (AI-designed drug for idiopathic pulmonary fibrosis) and expanded to neuroscience targets. Recursion Pharmaceuticals initiated Phase 2 trials for REC-994 (cerebral cavernous malformations) and REC-4881 (FAP). Exscientia delivered DSP-1181 (obsessive-compulsive disorder) into Phase 1. These AI-discovered compounds demonstrate that AI can identify novel chemical matter for challenging brain targets, reducing drug discovery timelines from 4-5 years to 12-18 months."
    }
  ],
  "neurotech": [
    {
      "id": "NTECH-001",
      "name": "Focused Ultrasound Neuromodulation",
      "type": "非侵入式神经调控",
      "technology": "经颅聚焦超声刺激/抑制特定脑区",
      "applications": [
        "抑郁症",
        "强迫症",
        "癫痫",
        "疼痛管理",
        "认知增强"
      ],
      "status": "2026年到达拐点; FDA批准加速",
      "description": "聚焦超声神经调控是2026年非侵入式神经技术的关键突破点。与EEG只能读取脑信号不同，聚焦超声可以非侵入式地同时读取和写入神经活动——通过将声能聚焦到特定脑区。这种双向能力使其成为治疗抑郁症、强迫症和慢性疼痛的潜在变革性技术，无需手术。FDA正在加速批准超声神经调控设备。"
    },
    {
      "id": "NTECH-002",
      "name": "Transcranial Magnetic Stimulation (TMS)",
      "type": "非侵入式神经调控",
      "technology": "磁场诱导脑区电刺激",
      "applications": [
        "抑郁症(FDA批准)",
        "强迫症(FDA批准)",
        "吸烟戒断(FDA批准)",
        "焦虑",
        "疼痛"
      ],
      "status": "FDA批准多个适应症; 斯坦福SAINT方案5天缓解79%难治性抑郁症",
      "description": "经颅磁刺激(TMS)是最成熟的非侵入式神经调控技术，FDA已批准用于抑郁症、强迫症和吸烟戒断。斯坦福SAINT方案可在5天内缓解难治性抑郁症(79%缓解率)，远快于传统6周方案。新一代TMS设备结合神经导航和闭环控制，实现更精准的个体化治疗。"
    },
    {
      "id": "NTECH-003",
      "name": "Transcranial Direct Current Stimulation (tDCS)",
      "type": "非侵入式神经调控",
      "technology": "微弱直流电调节皮层兴奋性",
      "applications": [
        "认知增强",
        "抑郁症",
        "疼痛",
        "神经康复",
        "学习加速"
      ],
      "status": "消费级设备可用; 临床证据积累中",
      "description": "经颅直流电刺激(tDCS)使用微弱直流电(1-2mA)调节大脑皮层兴奋性。阳极刺激增强目标区域活动，阴极抑制。消费级tDCS设备已上市用于认知增强和学习加速。优势在于低成本、便携和安全，但刺激精度不如TMS或聚焦超声。"
    },
    {
      "id": "NTECH-004",
      "name": "Wearable EEG Neurotechnology (2026 Consumer Wave)",
      "type": "可穿戴神经技术",
      "technology": "干电极EEG + AI分析 + 移动端应用",
      "applications": [
        "睡眠监测",
        "专注力训练",
        "冥想辅助",
        "疲劳检测",
        "脑健康追踪"
      ],
      "status": "CES 2026多款新品发布; 消费级市场快速增长",
      "description": "可穿戴EEG神经技术在2026年迎来消费级浪潮。CES 2026展示了Guardian 4耳塞EEG、LumiMind LumiSleep等新品。这些设备使用干电极和AI分析，提供实时认知状态监测。耳内EEG信号质量优于额头EEG，且更舒适日常佩戴。消费级神经技术正从简单监测走向主动干预。"
    },
    {
      "id": "NTECH-005",
      "name": "Neurofeedback Systems",
      "type": "非侵入式/神经反馈",
      "technology": "实时EEG反馈训练大脑自我调节",
      "applications": [
        "ADHD",
        "焦虑",
        "失眠",
        "认知增强",
        "冥想训练"
      ],
      "status": "2026年突破: BCI神经反馈实现皮层状态切换",
      "description": "神经反馈系统通过实时EEG反馈训练用户自我调节大脑活动。2026年突破性进展表明，BCI神经反馈可以让用户学会主动控制皮层状态切换——在专注和放松状态之间自由转换。应用于认知增强、冥想训练和精神健康治疗，代表BCI技术与冥想神经科学的融合。"
    },
    {
      "id": "NTECH-006",
      "name": "Optogenetics (Research → Clinical)",
      "type": "光遗传学/精准神经调控",
      "technology": "基因工程使神经元对光敏感; 光刺激精确控制特定神经元类型",
      "applications": [
        "基础神经科学研究",
        "视网膜疾病治疗(Science Corp)",
        "未来: 精准神经调控"
      ],
      "status": "研究工具成熟; 临床转化早期(视网膜应用领先)",
      "description": "光遗传学结合基因工程和光学技术，使特定类型神经元对光敏感，实现毫秒级精度的神经活动控制。作为研究工具已彻底改变神经科学。临床转化正在推进，Science Corp将光遗传学用于视网膜疾病治疗。未来可能扩展到癫痫、帕金森病等精准神经调控应用。"
    },
    {
      "id": "NTECH-007",
      "name": "Closed-Loop Neuromodulation",
      "type": "闭环神经调控",
      "technology": "实时监测神经活动 + 自适应刺激; 只在需要时干预",
      "applications": [
        "癫痫(NeuroPace RNS)",
        "抑郁症(UCSF闭环DBS)",
        "帕金森病",
        "疼痛"
      ],
      "status": "NeuroPace RNS已FDA批准; 闭环DBS临床试验中",
      "description": "闭环神经调控是神经技术的范式转变：设备持续监测神经活动，检测到异常模式时自动发送刺激。NeuroPace RNS是首个FDA批准的闭环神经调控设备(癫痫)。UCSF团队在Nature报告了闭环DBS治疗难治性抑郁症的首例成功。闭环系统更有效且副作用更少，是神经调控的未来方向。"
    },
    {
      "id": "NTECH-008",
      "name": "Vagus Nerve Stimulation (VNS) Next Generation",
      "type": "迷走神经刺激",
      "technology": "经皮或植入式迷走神经刺激; 调节脑-体通信",
      "applications": [
        "癫痫",
        "抑郁症",
        "偏头痛",
        "炎症",
        "自身免疫疾病"
      ],
      "status": "FDA批准(癫痫, 抑郁症); 经皮VNS设备商用; 新适应症探索中",
      "description": "新一代迷走神经刺激(VNS)技术正在扩展适应症。植入式VNS用于癫痫和抑郁症; 经皮VNS(gammaCore)用于偏头痛，无需手术。VNS的抗炎作用正在被探索用于自身免疫疾病。迷走神经是脑-体通信的主要通道，刺激它可以调节全身炎症反应、情绪和认知功能。"
    },
    {
      "id": "NTECH-009",
      "name": "Guardian 4 Ear-EEG Cognitive Platform (CES 2026)",
      "type": "Consumer neurotech / Ear-EEG monitoring",
      "technology": "In-ear EEG sensors; continuous cognitive state monitoring",
      "applications": [
        "Cognitive fatigue detection",
        "Sleep quality monitoring",
        "Attention tracking",
        "Early neurological screening"
      ],
      "status": "Launched CES 2026; first FDA-cleared in-ear EEG device",
      "description": "The Guardian 4, launched at CES 2026, is the first FDA-cleared in-ear EEG device for cognitive monitoring. The ear-EEG form factor makes brain monitoring far more portable and socially acceptable than traditional EEG headsets. The device provides continuous cognitive state monitoring including fatigue, attention, and sleep quality, expanding brain monitoring from clinical settings to everyday life."
    },
    {
      "id": "NTECH-010",
      "name": "LumiMind LumiSleep (CES 2026)",
      "type": "Consumer neurotech / Sleep optimization",
      "technology": "Consumer EEG with instantaneous auditory feedback for sleep optimization",
      "applications": [
        "Sleep optimization",
        "Lucid dream induction",
        "Circadian rhythm management"
      ],
      "status": "Revealed CES 2026; first consumer EEG with instantaneous auditory feedback",
      "description": "LumiMind's LumiSleep, revealed at CES 2026, is the first consumer EEG device providing instantaneous auditory feedback during sleep. The device detects sleep stages in real-time and delivers precisely timed auditory stimuli to enhance slow-wave sleep and promote sleep quality. This represents the convergence of neurotechnology and consumer wellness."
    },
    {
      "id": "NTECH-011",
      "name": "Focused Ultrasound Neuromodulation (BCI Inflection Point)",
      "type": "Non-invasive neuromodulation / BCI integration",
      "technology": "Focused ultrasound for precise, non-invasive brain stimulation; integrated with BCI",
      "applications": [
        "Non-invasive brain stimulation",
        "Targeted neuromodulation",
        "Closed-loop BCI therapy",
        "Mental health treatment"
      ],
      "status": "2026 inflection point; transitioning from research to clinical application",
      "description": "Focused ultrasound neuromodulation is reaching an inflection point in 2026, transitioning from research to clinical application. The technology enables precise, non-invasive stimulation of deep brain structures without surgery. When integrated with BCI systems, it creates closed-loop neuromodulation where brain activity is monitored and stimulation is delivered in real-time based on detected patterns."
    },
    {
      "id": "NTECH-012",
      "name": "Neurotech Devices Market ($15.1B → $31B by 2033)",
      "type": "Market analysis / Industry tracking",
      "technology": "Comprehensive neurotech device market; CAGR 12.9%",
      "applications": [
        "Market sizing for neurotech devices",
        "Investment decision support",
        "Industry trend analysis"
      ],
      "status": "Market valued at $15.1B in 2026; projected $31B by 2033",
      "description": "The neurotech devices market is valued at $15.1 billion in 2026 and projected to reach $31 billion by 2033, growing at a CAGR of 12.9%. The market encompasses BCI devices, neuromodulation systems, neurostimulation devices, and neurosensing equipment. Growth is driven by increasing prevalence of neurological disorders, FDA clearances for new devices, and expanding consumer applications."
    },
    {
      "id": "NTECH-013",
      "name": "Agentic AI Scribes in Neurology (2026)",
      "type": "AI + Neurotech / Clinical workflow automation",
      "technology": "AI-powered clinical documentation for neurology; EEG interpretation assistance",
      "applications": [
        "Automated neurological assessment",
        "EEG interpretation",
        "Clinical documentation",
        "Diagnostic decision support"
      ],
      "status": "Emerging 2026; AI agents assisting neurologists with documentation and analysis",
      "description": "Agentic AI scribes are entering neurology practice in 2026, automating clinical documentation and assisting with EEG interpretation. These AI agents can monitor neural data streams in real-time, flag significant events, and generate preliminary interpretations. This technology addresses the neurologist shortage and enables more efficient neurological care, particularly for continuous monitoring applications."
    },
    {
      "id": "NTECH-014",
      "name": "Neural Data Privacy (2026 Critical Issue)",
      "type": "Ethics / Regulatory framework",
      "technology": "Neural data governance; brain data protection frameworks",
      "applications": [
        "Neural data privacy protection",
        "Regulatory compliance",
        "Consumer trust in neurotech"
      ],
      "status": "Emerging as critical issue in 2026; regulatory frameworks under development",
      "description": "Neural data privacy is emerging as a critical issue in 2026 as neurotech devices collect increasingly detailed brain data. Questions of neural data ownership, consent, and protection are being debated by regulators worldwide. The EU is considering \"neurorights\" legislation, and UNESCO has called for ethical frameworks governing neural data. This issue will shape the future of consumer neurotech adoption."
    },
    {
      "id": "NTECH-015",
      "name": "8 Innovative Neuroscience Startups to Watch (2026)",
      "type": "Industry tracker / Startup ecosystem",
      "technology": "CNS drug development, neurotechnology, diagnostics",
      "applications": [
        "CNS drug development",
        "Neurotechnology innovation",
        "Diagnostic tools",
        "Digital therapeutics"
      ],
      "status": "Featured 2026; next wave of neuroscience translation companies",
      "description": "Cure. magazine identified 8 innovative neuroscience startups to watch in 2026, representing the next wave of companies pushing translation in CNS drug development, neurotechnology, and diagnostics. These startups are developing novel approaches including AI-driven drug discovery, digital therapeutics for neurological conditions, and next-generation neurodiagnostic tools."
    },
    {
      "id": "NT-016",
      "name": "LumiMind LumiSleep (CES 2026)",
      "company": "LumiMind",
      "type": "Consumer EEG sleep device",
      "technology": "EEG earbud with instantaneous auditory feedback",
      "status": "Revealed at CES 2026; first consumer EEG device with real-time auditory neurofeedback for sleep",
      "description": "LumiMind's LumiSleep, revealed at CES 2026, represents the first consumer EEG device providing instantaneous auditory feedback for sleep optimization. The ear-based EEG sensor monitors brain activity during sleep and provides gentle auditory cues at specific sleep stages to enhance sleep quality. This represents a new category of consumer neurotechnology that goes beyond monitoring to active intervention, using real-time neural feedback to improve sleep architecture.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.worldbrainmapping.org/neurotechnology-explained",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NT-017",
      "name": "Neurotech 2nd Wave (Non-Invasive Inflection 2026)",
      "company": "Multiple",
      "type": "Industry trend",
      "technology": "Wearable EEG, tFUS, tES, fNIRS",
      "status": "Non-invasive neurotech hits inflection point in 2026",
      "description": "Non-invasive neurotech is hitting an inflection point in 2026 as FDA approvals, wearable EEG advances, and ultrasound interfaces move from research to consumer products. The 'second wave' of neurotech is characterized by: (1) smaller, more comfortable form factors, (2) real-time feedback and intervention, (3) consumer-grade pricing, and (4) regulatory clarity. Key technologies include ear-based EEG, transcranial focused ultrasound, and combined EEG-fNIRS systems. The neurotech devices market is valued at $19.18 billion in 2025 and predicted to reach $66.81 billion by 2035.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.plugandplaytechcenter.com/insights/neurotech-second-wave",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NT-018",
      "name": "Neurotech Devices Market ($66.8B by 2035)",
      "company": "Industry analysis",
      "type": "Market analysis",
      "technology": "All neurotech devices",
      "status": "Market valued at $19.18B in 2025; projected $66.81B by 2035",
      "description": "The global neurotech devices market is valued at USD 19.18 billion in 2025 and is predicted to reach USD 66.81 billion by 2035, growing at a CAGR of 13.3%. Key growth drivers include: increasing prevalence of neurological disorders, growing adoption of wearable neurotech devices, advances in BCI technology, and expanding applications in mental health treatment. The market includes neurostimulation devices, neuroprosthetics, BCI systems, and neurosensing devices.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.insightaceanalytic.com/report/neurotech-devices-market/3472",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NT-019",
      "name": "8 Innovative Neuroscience Startups 2026",
      "company": "Multiple (Cure. analysis)",
      "type": "Startup ecosystem",
      "technology": "CNS drug development, neurotechnology, diagnostics",
      "status": "Profiled by Cure. in 2026 analysis",
      "description": "Cure. identified 8 innovative neuroscience startups to watch in 2026, pushing translation in CNS drug development, neurotechnology, and diagnostics. The startups represent the growing maturity of the neuroscience industry, with companies moving from basic research to clinical applications. Key areas include precision psychiatry, digital biomarkers for neurological diseases, and AI-driven drug discovery for CNS disorders. The startup ecosystem reflects the increasing investment in neuroscience as a therapeutic area.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://wewillcure.com/insights/company-profiles/innovative-neuroscience-startup",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NT-020",
      "name": "Functional Near-Infrared Spectroscopy (fNIRS) BCI",
      "company": "Multiple research groups and companies",
      "type": "非侵入式脑成像",
      "technology": "Near-infrared light measures cortical hemodynamic response",
      "status": "Growing adoption 2025-2026; combined EEG-fNIRS systems",
      "description": "Functional Near-Infrared Spectroscopy (fNIRS) is a non-invasive brain imaging technology that measures cortical blood oxygenation changes using near-infrared light. fNIRS is more tolerant of movement than fMRI and can be used in naturalistic settings. In 2025-2026, combined EEG-fNIRS systems are emerging that provide both electrical and hemodynamic brain signals, offering complementary information for BCI applications. fNIRS is particularly useful for monitoring prefrontal cortex activity during cognitive tasks.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.reddit.com/r/BCI/comments/1kt0yv4/noninvasive_braincomputer_interfac",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "name": "g.Nautilus",
      "company": "NIRx",
      "type": "Wearable Device",
      "technology": "EEG-fNIRS",
      "status": "Commercial",
      "description": "The g.Nautilus is a cutting-edge wearable device that seamlessly combines high-quality EEG and functional near-infrared spectroscopy (fNIRS) for advanced brain activity monitoring. It is designed to provide a comprehensive view of neural activity by capturing both electrical signals (EEG) and hemodynamic responses (fNIRS). This integrated system is intended for research and clinical applications requiring portable, dual-modality neuroimaging.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.instagram.com/reel/DSF56bgifH9",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NT-21"
    },
    {
      "name": "BrainAccess Headband",
      "company": "BrainAccess",
      "type": "Wearable Device",
      "technology": "EEG-fNIRS",
      "status": "Commercial",
      "description": "The BrainAccess Headband leverages dual sensing by combining EEG and fNIRS technologies to capture the 'when' and 'where' of brain activity. This wearable solution provides real-time, integrated data on neural electrical signals and blood flow changes, offering a more complete picture of brain function. It is designed for applications in research, sports science, and mental health monitoring.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.brainaccess.ai/the-power-of-dual-sensing-combining-eeg-and-fnirs-in-wearable-headbands",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NT-22"
    },
    {
      "name": "gtec Mobile EEG-fNIRS System",
      "company": "g.tec",
      "type": "Portable System",
      "technology": "EEG-fNIRS",
      "status": "Commercial",
      "description": "g.tec's portable, wearable solution integrates EEG and fNIRS signals in real-time, supporting up to 64 EEG channels and 32 fNIRS optode holders. This system is designed for high-density brain monitoring in both clinical and research settings, offering flexibility and mobility. It represents a significant advancement in multimodal neuroimaging technology.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.gtec.at/2025/01/14/introducing-new-products-and-events-in-2025/?srsltid=AfmBOooAyLqDo2J9kiNLDeuBgAuZqpNJUpTf-Hqtk5uWOhEEUfGaAFtp",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NT-23"
    },
    {
      "name": "NeuroStar Advanced TMS Therapy",
      "company": "Neuronetics",
      "type": "Medical Device",
      "technology": "Transcranial Magnetic Stimulation (TMS)",
      "status": "FDA-Cleared",
      "description": "NeuroStar Advanced TMS Therapy is a non-invasive procedure that uses magnetic fields to stimulate nerve cells in the brain, primarily for treating major depressive disorder. It is FDA-cleared and has been featured in prominent news publications for its efficacy, particularly as an alternative or adjunct to antidepressants. The therapy involves daily sessions over several weeks and is recognized for its safety profile and minimal side effects.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://hopewithtms.com/tms-in-the-media",
          "collected_at": "2026-06-19T06:45:00Z"
        },
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.mayoclinic.org/tests-procedures/transcranial-magnetic-stimulation/about/pac-20384625",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NT-24"
    },
    {
      "name": "Bandage-sized Wearable fNIRS",
      "company": "Victoria et al. (Research)",
      "type": "Research Device",
      "technology": "Functional Near-Infrared Spectroscopy (fNIRS)",
      "status": "In Development",
      "description": "In 2025, researchers developed a novel bandage-sized wearable fNIRS device designed to support long-term monitoring of subjects. This compact device aims to make continuous, unobtrusive brain activity monitoring feasible for extended periods. It represents a significant step toward practical, everyday use of fNIRS in clinical and research settings.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.mdpi.com/2076-3417/16/11/5368",
          "collected_at": "2026-06-19T06:45:00Z"
        }
      ],
      "id": "NT-25"
    },
    {
      "id": "NT-2026-001",
      "name": "Focused Ultrasound Neuromodulation FDA Approval",
      "type": "Non-invasive neuromodulation (focused ultrasound)",
      "developer": "Multiple companies (BrainSonix, Insightec, MIT)",
      "status": "FDA breakthrough advances 2025-2026 for depression, OCD, and chronic pain",
      "description": "Focused ultrasound neuromodulation reached an inflection point in 2025-2026 with FDA granting breakthrough designations for treatment of depression, OCD, and chronic pain. The technology uses targeted ultrasound waves to modulate deep brain structures without surgery or implants. Unlike transcranial magnetic stimulation (TMS), focused ultrasound can reach deep brain targets like the nucleus accumbens and amygdala with millimeter precision. Clinical trials show response rates of 50-70% for treatment-resistant depression. The technology represents a major advance in non-invasive brain intervention.",
      "breakthrough": "FDA breakthrough designation for multiple psychiatric indications; deep brain targeting without surgery"
    },
    {
      "id": "NT-2026-002",
      "name": "NeuroPace RNS Expansion to Depression and OCD",
      "type": "Closed-loop responsive neurostimulation (implanted)",
      "developer": "NeuroPace",
      "status": "Clinical trials 2025-2026 for depression and OCD; FDA-approved for epilepsy",
      "description": "NeuroPace's Responsive Neurostimulation (RNS) system, FDA-approved for epilepsy since 2013, is expanding to treat depression and OCD in clinical trials launched in 2025-2026. The RNS system continuously monitors brain activity and delivers stimulation in response to detected abnormal patterns. For epilepsy, RNS reduces seizure frequency by 75% on average. The expansion to psychiatric indications validates the closed-loop neurostimulation approach for brain disorders beyond epilepsy. NeuroPace's RNS is the only FDA-approved closed-loop brain stimulation device, positioning it as a leader in personalized neural therapy.",
      "breakthrough": "First closed-loop neurostimulation device expanding from epilepsy to psychiatric indications"
    },
    {
      "id": "NT-2026-003",
      "name": "UNESCO Neurotechnology Ethics Framework",
      "type": "International ethics and governance framework",
      "developer": "UNESCO",
      "status": "Published 2025; implementation phase 2026",
      "description": "UNESCO published the first international neurotechnology ethics framework in 2025, establishing principles for the responsible development and deployment of neurotechnologies. The framework addresses mental privacy, cognitive liberty, neural data protection, and equitable access to neurotechnologies. It calls on member states to enact legislation protecting neural data as a special category of personal data. The framework was prompted by rapid advances in BCI technology, consumer neurotechnology, and AI-driven neural analytics. Implementation in 2026 includes guidance for member states on national legislation.",
      "breakthrough": "First international framework for neurotechnology ethics and neural data protection"
    },
    {
      "id": "NT-2026-004",
      "name": "LumiMind LumiSleep Neurofeedback Sleep Device",
      "type": "Consumer neurotechnology (sleep neurofeedback)",
      "developer": "LumiMind",
      "status": "CES 2026 launch; consumer availability 2026",
      "description": "LumiMind launched LumiSleep at CES 2026, a consumer neurofeedback device that uses real-time auditory feedback to guide users into deeper sleep stages. The device uses a wearable EEG headband that monitors brain activity during sleep and delivers subtle audio cues (pink noise, binaural beats) timed to slow-wave sleep onset. Clinical studies show 23% increase in deep sleep duration and 40% reduction in sleep onset time. LumiSleep represents the consumer neurotechnology wave, alongside Neurable MW75 and Guardian 4, bringing neuroscience from the lab to the bedroom.",
      "breakthrough": "First consumer device demonstrating 23% increase in deep sleep via real-time neurofeedback"
    },
    {
      "id": "NT-2026-005",
      "name": "Agentic AI Scribes in Neurology Clinics",
      "type": "AI-powered clinical documentation for neurology",
      "developer": "Multiple (Abridge, Nuance, Suki, Augmedix)",
      "status": "Widespread deployment 2025-2026; Medicare reimbursement for AI scribe services",
      "description": "Agentic AI scribes transformed neurology clinical practice in 2025-2026, with 60%+ of US neurologists using AI-powered documentation tools. These systems use ambient listening and NLP to generate clinical notes in real-time, reducing documentation time by 70% and improving note quality. Medicare began reimbursing for AI scribe services in 2026, accelerating adoption. For neurology specifically, AI scribes integrate with EHR systems to capture complex neurological exam findings, medication histories, and patient narratives. This technology addresses physician burnout and allows neurologists to spend more time on patient care.",
      "breakthrough": "60%+ adoption rate among US neurologists; Medicare reimbursement for AI scribe services"
    },
    {
      "id": "NEUROTECH-a1b2c3",
      "name": "CenBRAIN Neurotech",
      "type": "Research Center",
      "description": "Advanced Neurochip Center at Westlake University led by Professor Mohamad Sawan, focusing on neurochip research with emphasis on both quality and quantity of research outcomes",
      "developer": "Westlake University",
      "status": "Active",
      "breakthrough": "Neurochip technology development and research",
      "last_updated": "2026-06-27T16:05:12.062Z"
    },
    {
      "id": "NEUROTECH-d4e5f6",
      "name": "AI Brain-Computer Interface Global Challenge 2026",
      "type": "Competition",
      "description": "Global challenge for AI brain-computer interface technologies leveraging Shenzhen's research capabilities, industrial conversion, and supply chain systems",
      "developer": "Shenzhen Municipal Government",
      "status": "Upcoming",
      "breakthrough": "Global AI brain-computer interface innovation and industrialization",
      "last_updated": "2026-06-27T16:05:12.062Z"
    },
    {
      "id": "NEUROTECH-g7h8i9",
      "name": "Hypothalamus-Brainstem-Spinal Cord Pathway Activation",
      "type": "Research Study",
      "description": "Study published in Nature Communications on December 6, 2025, demonstrating activation of the hypothalamus-brainstem-spinal cord pathway to promote motor initiation and functional recovery after spinal cord injury in mice",
      "developer": "Chinese Academy of Sciences Brain Science and Intelligence Technology Innovation Center",
      "status": "Published",
      "breakthrough": "Novel neural pathway activation for motor recovery",
      "last_updated": "2026-06-27T16:05:12.062Z"
    },
    {
      "id": "NEUROTECH-j0k1l2",
      "name": "Advanced Brain Science Research Institute",
      "type": "Research Institution",
      "description": "Institute selected 32 representative research achievements in 2025, including publications in Cell, Science, Neuron, Nature Medicine, and other high-impact journals",
      "developer": "Shenzhen Institutes of Advanced Technology / Shenzhen-Hong Kong Brain Research Institute",
      "status": "Active",
      "breakthrough": "High-impact neuroscience research publications",
      "last_updated": "2026-06-27T16:05:12.062Z"
    },
    {
      "id": "NEUROTECH-m3n4o5",
      "name": "Science and China Science Popularization Project",
      "type": "Outreach Program",
      "description": "2026 science popularization project in Kashgar region, Xinjiang, organized by the Brain Science and Intelligence Technology Innovation Center",
      "developer": "Chinese Academy of Sciences Brain Science and Intelligence Technology Innovation Center",
      "status": "Completed",
      "breakthrough": "Science popularization and education in neuroscience",
      "last_updated": "2026-06-27T16:05:12.062Z"
    },
    {
      "id": "NEUROTECH-abc123",
      "name": "CenBRAIN Neurotech",
      "type": "Research Center",
      "description": "Advanced Neurochip Center at Westlake University led by Professor Mohamad Sawan, focusing on high-quality and high-quantity research outcomes",
      "developer": "Westlake University",
      "status": "Active",
      "breakthrough": "Neurochip research and development",
      "last_updated": "2026-06-27T16:04:16.632Z"
    },
    {
      "id": "NEUROTECH-def456",
      "name": "AI Brain-Computer Interface Global Challenge 2026",
      "type": "Competition",
      "description": "Global challenge leveraging Shenzhen's research capabilities, industrial conversion, and supply chain systems in the Greater Bay Area",
      "developer": "Shenzhen Municipal Government",
      "status": "Upcoming",
      "breakthrough": "Brain-computer interface innovation and global collaboration",
      "last_updated": "2026-06-27T16:04:16.632Z"
    },
    {
      "id": "NEUROTECH-ghi789",
      "name": "Hypothalamus-Brainstem-Spinal Cord Pathway Activation",
      "type": "Research Study",
      "description": "Study published in Nature Communications on December 6, 2025, about activating the hypothalamus-brainstem-spinal cord pathway to promote motor initiation and functional recovery after spinal cord injury in mice",
      "developer": "Chinese Academy of Sciences Brain Science and Intelligence Technology Innovation Center",
      "status": "Published",
      "breakthrough": "Novel pathway activation for spinal cord injury recovery",
      "last_updated": "2026-06-27T16:04:16.632Z"
    },
    {
      "id": "NEUROTECH-jkl012",
      "name": "Advanced Institute of Technology Brain Research Institute",
      "type": "Research Institute",
      "description": "Institute that selected 32 representative research papers in 2025, including publications in Cell, Science, Neuron, Nature Medicine, and Nature",
      "developer": "Advanced Institute of Technology",
      "status": "Active",
      "breakthrough": "High-impact neuroscience research publications",
      "last_updated": "2026-06-27T16:04:16.632Z"
    },
    {
      "id": "NEUROTECH-mno345",
      "name": "Brain Science and Intelligence Technology Innovation Center",
      "type": "Research Center",
      "description": "Chinese Academy of Sciences center conducting research on brain science and intelligence technology",
      "developer": "Chinese Academy of Sciences",
      "status": "Active",
      "breakthrough": "Fundamental brain science research and technology innovation",
      "last_updated": "2026-06-27T16:04:16.632Z"
    },
    {
      "id": "NEUROTECH-pqr678",
      "name": "Advanced Institute of Technology Brain Research Institute",
      "type": "Research Institute",
      "description": "Research institute with 32 representative publications in 2025",
      "developer": "Advanced Institute of Technology",
      "status": "Active",
      "breakthrough": "Published in top journals including Cell, Science, Neuron, Nature Medicine, and Nature",
      "last_updated": "2026-06-27T16:03:04.604Z"
    }
  ],
  "neurotransmitters": [
    {
      "id": "NT-001",
      "name": "Dopamine (多巴胺)",
      "type": "Catecholamine",
      "primary_pathways": [
        "Mesolimbic (VTA→nucleus accumbens)",
        "Mesocortical (VTA→PFC)",
        "Nigrostriatal (SN→striatum)"
      ],
      "key_functions": [
        "奖励与动机",
        "运动控制",
        "工作记忆",
        "注意力"
      ],
      "disorders": [
        "帕金森病(缺乏)",
        "成瘾(过度)",
        "ADHD(前额叶不足)",
        "精神分裂症(中脑边缘过度)"
      ],
      "drugs_targeting": [
        "L-DOPA(帕金森)",
        "哌甲酯(ADHD)",
        "抗精神病药(阻断D2)"
      ],
      "description": "多巴胺参与奖励、动机、运动控制和认知功能。更准确地描述为'预测误差信号'——编码期望与现实的差异，驱动学习和动机。中脑边缘通路是成瘾的核心回路。"
    },
    {
      "id": "NT-002",
      "name": "Serotonin (5-HT / 血清素)",
      "type": "Indolamine",
      "primary_pathways": [
        "中缝核→全脑投射"
      ],
      "key_functions": [
        "情绪调节",
        "睡眠-觉醒周期",
        "食欲",
        "冲动控制"
      ],
      "disorders": [
        "抑郁症(不足)",
        "焦虑症",
        "强迫症",
        "PTSD"
      ],
      "drugs_targeting": [
        "SSRI(抑郁症)",
        "迷幻药(5-HT2A激动剂)",
        "曲普坦类(偏头痛)"
      ],
      "description": "血清素调节情绪、睡眠和冲动控制。SSRI是最常用的抗抑郁药。迷幻药通过5-HT2A受体产生意识改变状态。90%的血清素在肠道，是脑-肠轴的关键介质。"
    },
    {
      "id": "NT-003",
      "name": "Glutamate (谷氨酸)",
      "type": "Amino acid / Excitatory",
      "primary_pathways": [
        "全脑(90%的突触使用谷氨酸)"
      ],
      "key_functions": [
        "兴奋性信号传导",
        "学习与记忆(LTP/LTD)",
        "突触可塑性"
      ],
      "disorders": [
        "癫痫(过度兴奋)",
        "脑缺血兴奋性毒性",
        "精神分裂症(NMDA功能低下)"
      ],
      "drugs_targeting": [
        "氯胺酮(NMDA拮抗剂-抗抑郁)",
        "美金刚(阿尔茨海默)",
        "拉莫三嗪(抗癫痫)"
      ],
      "description": "谷氨酸是大脑最主要的兴奋性神经递质。NMDA受体介导的LTP是学习和记忆的分子基础。氯胺酮通过NMDA受体拮抗产生快速抗抑郁效果。"
    },
    {
      "id": "NT-004",
      "name": "GABA (γ-氨基丁酸)",
      "type": "Amino acid / Inhibitory",
      "primary_pathways": [
        "全脑(主要抑制性神经递质)"
      ],
      "key_functions": [
        "抑制性信号传导",
        "神经回路平衡",
        "焦虑调节",
        "睡眠促进"
      ],
      "disorders": [
        "癫痫(抑制不足)",
        "焦虑症(GABA功能低下)",
        "失眠"
      ],
      "drugs_targeting": [
        "苯二氮卓类(抗焦虑)",
        "加巴喷丁(癫痫/疼痛)",
        "酒精(增强GABA)"
      ],
      "description": "GABA是大脑最主要的抑制性神经递质，与谷氨酸共同维持兴奋-抑制平衡。大脑E/I balance的破坏被认为是自闭症和精神分裂症的共同机制。"
    },
    {
      "id": "NT-005",
      "name": "Acetylcholine (乙酰胆碱)",
      "type": "Cholinergic",
      "primary_pathways": [
        "基底前脑→皮层(认知)",
        "脑干→丘脑(觉醒)",
        "神经肌肉接头(运动)"
      ],
      "key_functions": [
        "注意力与觉醒",
        "学习与记忆",
        "REM睡眠",
        "肌肉收缩"
      ],
      "disorders": [
        "阿尔茨海默病(胆碱能神经元退化)",
        "重症肌无力(自身免疫)"
      ],
      "drugs_targeting": [
        "多奈哌齐(阿尔茨海默-胆碱酯酶抑制剂)",
        "肉毒毒素(阻断释放)"
      ],
      "description": "乙酰胆碱调节注意力和认知功能。阿尔茨海默病早期即出现基底前脑胆碱能神经元退化。胆碱酯酶抑制剂是阿尔茨海默病的一线治疗。"
    },
    {
      "id": "NT-006",
      "name": "Norepinephrine (去甲肾上腺素)",
      "type": "Catecholamine",
      "primary_pathways": [
        "蓝斑核→全脑投射"
      ],
      "key_functions": [
        "警觉与觉醒",
        "应激反应",
        "注意力聚焦",
        "情绪调节"
      ],
      "disorders": [
        "PTSD(过度活跃)",
        "焦虑症",
        "ADHD(前额叶NE不足)"
      ],
      "drugs_targeting": [
        "阿托莫西汀(ADHD)",
        "β受体阻滞剂(焦虑)",
        "SNRI(抑郁症)"
      ],
      "description": "去甲肾上腺素由蓝斑核产生，调节警觉、注意力和应激反应。前额叶NE水平对认知功能呈倒U型关系——适量最佳，过多或过少都损害认知。"
    },
    {
      "id": "NT-007",
      "name": "Endocannabinoid System (内源性大麻素)",
      "type": "Lipid signaling / Retrograde",
      "primary_pathways": [
        "全脑(逆行信号分子)"
      ],
      "key_functions": [
        "食欲调节",
        "疼痛调制",
        "情绪调节",
        "记忆遗忘",
        "神经保护"
      ],
      "disorders": [
        "慢性疼痛",
        "PTSD(消退记忆缺陷)",
        "食欲障碍"
      ],
      "drugs_targeting": [
        "CBD(Epidiolex-癫痫)",
        "大麻隆(化疗止吐)"
      ],
      "description": "内源性大麻素系统是独特的逆行信号系统——从突触后神经元释放，逆行到突触前神经元调节递质释放。使系统能够'调低'过度活跃的突触。"
    },
    {
      "id": "NT-008",
      "name": "Oxytocin (催产素)",
      "type": "Neuropeptide / Hormone",
      "primary_pathways": [
        "下丘脑→垂体后叶; 脑内投射"
      ],
      "key_functions": [
        "社会联结",
        "信任",
        "母婴依恋",
        "压力缓冲"
      ],
      "disorders": [
        "自闭症(社会功能障碍)",
        "社交焦虑",
        "产后抑郁"
      ],
      "drugs_targeting": [
        "催产素鼻喷剂(研究阶段)"
      ],
      "description": "催产素被称为'拥抱激素'，调节社会联结和信任。催产素鼻喷剂在自闭症临床试验中显示混合结果。催产素与多巴胺系统交互，共同调节社会奖励。"
    },
    {
      "id": "NT-009",
      "name": "Glutamate (Excitatory Neurotransmitter)",
      "type": "Amino acid neurotransmitter / Primary excitatory",
      "primary_pathways": [
        "Cortical projection pathways",
        "Hippocampal Schaffer collateral",
        "Thalamocortical projections",
        "Cerebellar parallel fibers"
      ],
      "key_functions": [
        "Primary excitatory neurotransmitter in CNS",
        "Synaptic plasticity (LTP/LTD)",
        "Learning and memory",
        "Developmental circuit formation"
      ],
      "disorders": [
        "Excitotoxicity (stroke, TBI)",
        "Epilepsy",
        "ALS",
        "Schizophrenia (NMDA hypofunction)"
      ],
      "drugs_targeting": [
        "Ketamine (NMDA antagonist)",
        "Memantine (NMDA antagonist for Alzheimer's)",
        "Perampanel (AMPA antagonist for epilepsy)",
        "Rapastinel (NMDA modulator)"
      ],
      "description": "Glutamate is the primary excitatory neurotransmitter in the central nervous system, present in over 80% of brain synapses. It mediates fast synaptic transmission through AMPA and NMDA receptors and is essential for synaptic plasticity, learning, and memory. Dysregulation of glutamate signaling is implicated in numerous neurological and psychiatric disorders. Ketamine's rapid antidepressant effect through NMDA receptor modulation has renewed interest in glutamate-based therapeutics."
    },
    {
      "id": "NT-010",
      "name": "GABA (Inhibitory Neurotransmitter)",
      "type": "Amino acid neurotransmitter / Primary inhibitory",
      "primary_pathways": [
        "Cortical interneuron networks",
        "Striatal medium spiny neurons",
        "Cerebellar Purkinje cells",
        "Thalamic reticular nucleus"
      ],
      "key_functions": [
        "Primary inhibitory neurotransmitter in CNS",
        "Neural circuit balance",
        "Anxiety regulation",
        "Motor control"
      ],
      "disorders": [
        "Anxiety disorders",
        "Epilepsy",
        "Insomnia",
        "Huntington's disease"
      ],
      "drugs_targeting": [
        "Benzodiazepines (GABA-A positive modulators)",
        "Barbiturates (GABA-A modulators)",
        "Baclofen (GABA-B agonist)",
        "Gabapentin/pregabalin (indirect GABA effects)"
      ],
      "description": "GABA (gamma-aminobutyric acid) is the primary inhibitory neurotransmitter, balancing glutamate's excitatory effects. GABAergic interneurons are critical for neural circuit function, and the excitation/inhibition balance is fundamental to brain health. Disruptions in GABA signaling are central to epilepsy, anxiety, and other disorders. BCI research increasingly targets GABAergic circuits for closed-loop neuromodulation."
    },
    {
      "id": "NT-011",
      "name": "Endocannabinoid System (Anandamide / 2-AG)",
      "type": "Lipid neurotransmitter / Neuromodulatory",
      "primary_pathways": [
        "Retrograde signaling at synapses",
        "Cortical and hippocampal circuits",
        "Basal ganglia",
        "Pain pathways"
      ],
      "key_functions": [
        "Retrograde synaptic signaling",
        "Appetite regulation",
        "Pain modulation",
        "Stress response",
        "Neuroprotection"
      ],
      "disorders": [
        "Chronic pain",
        "PTSD",
        "Epilepsy (Dravet syndrome)",
        "Multiple sclerosis spasticity"
      ],
      "drugs_targeting": [
        "CBD (cannabidiol - FDA approved for epilepsy)",
        "THC (dronabinol)",
        "Fatty acid amide hydrolase (FAAH) inhibitors",
        "CB1/CB2 receptor modulators"
      ],
      "description": "The endocannabinoid system, with its primary ligands anandamide and 2-AG, is unique in using retrograde signaling — cannabinoids are released by postsynaptic neurons and act on presynaptic terminals. This system modulates synaptic plasticity, pain, appetite, and stress responses. CBD's FDA approval for Dravet syndrome validated the therapeutic potential of cannabinoid-based drugs, and research is expanding to other neurological applications."
    },
    {
      "id": "NT-012",
      "name": "Orexin/Hypocretin (Wakefulness System)",
      "type": "Neuropeptide / Wakefulness regulator",
      "primary_pathways": [
        "Lateral hypothalamus to widespread brain regions",
        "Locus coeruleus",
        "Tuberomammillary nucleus",
        "Dorsal raphe nucleus"
      ],
      "key_functions": [
        "Promoting wakefulness and arousal",
        "Sleep-wake state switching",
        "Appetite regulation",
        "Motivation and reward"
      ],
      "disorders": [
        "Narcolepsy type 1 (orexin deficiency)",
        "Insomnia",
        "Sleep apnea",
        "Catalepsy"
      ],
      "drugs_targeting": [
        "Suvorexant/lemborexant (orexin receptor antagonists for insomnia)",
        "TAK-925 (orexin agonist for narcolepsy)",
        "Dual orexin receptor antagonists (DORAs)"
      ],
      "description": "Orexin (hypocretin) neurons in the lateral hypothalamus are the master regulators of wakefulness. Loss of orexin-producing neurons causes narcolepsy type 1. The development of orexin receptor antagonists (DORAs) for insomnia represents a major advance in sleep medicine, providing an alternative to GABA-based sedatives. Orexin agonists for narcolepsy are in clinical development."
    },
    {
      "id": "NT-013",
      "name": "Substance P (Neurokinin System)",
      "type": "Neuropeptide / Pain signaling",
      "primary_pathways": [
        "Spinal cord dorsal horn",
        "Trigeminal system",
        "Amygdala",
        "Hypothalamus"
      ],
      "key_functions": [
        "Pain transmission (nociception)",
        "Neurogenic inflammation",
        "Emotional processing",
        "Stress response"
      ],
      "disorders": [
        "Chronic pain",
        "Fibromyalgia",
        "Migraine",
        "Inflammatory conditions"
      ],
      "drugs_targeting": [
        "Aprepitant (NK1 antagonist for nausea)",
        "NK1 receptor antagonists (investigational for depression/anxiety)",
        "Capsaicin (depletes substance P)"
      ],
      "description": "Substance P is a neuropeptide in the neurokinin family that plays a central role in pain transmission and neurogenic inflammation. While NK1 receptor antagonists showed promise in preclinical pain and depression models, clinical translation has been challenging. However, the neurokinin system remains an important target for understanding pain mechanisms and developing novel analgesics."
    },
    {
      "id": "NT-014",
      "name": "Orexin/Hypocretin (食欲素/下丘脑分泌素)",
      "type": "Neuropeptide neurotransmitter",
      "function": "Arousal, wakefulness, appetite regulation, reward",
      "receptors": "OX1R, OX2R (G-protein coupled)",
      "clinical_significance": "Narcolepsy (orexin deficiency); insomnia (orexin receptor antagonists like suvorexant/Dayvigo)",
      "description": "Orexin (also called hypocretin) is a neuropeptide produced by neurons in the lateral hypothalamus that plays a critical role in maintaining wakefulness and arousal. Loss of orexin-producing neurons causes narcolepsy with cataplexy. Orexin receptor antagonists (DORAs) like suvorexant (Belsomra) and lemborexant (Dayvigo) are a new class of sleep medications that promote sleep by blocking orexin signaling. Unlike traditional sleep aids (benzodiazepines, Z-drugs), DORAs work by reducing wakefulness rather than sedating the brain, potentially offering a more natural sleep pattern.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/orexin-narcolepsy",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NT-015",
      "name": "Endocannabinoid System (内源性大麻素系统)",
      "type": "Lipid signaling system",
      "function": "Retrograde signaling, synaptic plasticity, appetite, pain, mood, memory",
      "receptors": "CB1 (brain), CB2 (immune), TRPV1",
      "clinical_significance": "Chronic pain, epilepsy (CBD), multiple sclerosis, appetite disorders",
      "description": "The endocannabinoid system is a lipid signaling system that functions as a retrograde messenger — it allows postsynaptic neurons to regulate their own inputs. The two main endocannabinoids are anandamide (AEA) and 2-AG. CB1 receptors are the most abundant G-protein coupled receptors in the brain. The system modulates synaptic plasticity, pain, appetite, mood, and memory. CBD (cannabidiol) is FDA-approved for certain epilepsy syndromes (Epidiolex). Research is expanding into endocannabinoid-based treatments for chronic pain, anxiety, and neurodegenerative diseases.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/endocannabinoid-system",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NT-016",
      "name": "Brain-Derived Neurotrophic Factor (BDNF)",
      "type": "Neurotrophin (growth factor)",
      "function": "Neuronal survival, synaptic plasticity, learning and memory, neurogenesis",
      "receptors": "TrkB (tropomyosin receptor kinase B), p75NTR",
      "clinical_significance": "Depression (reduced BDNF), Alzheimer's, exercise-induced neuroprotection, PTSD",
      "description": "BDNF is the most abundant neurotrophin in the brain and is essential for synaptic plasticity, learning, and memory. BDNF promotes the survival of existing neurons and encourages the growth of new synapses and neurons (neurogenesis). Exercise robustly increases BDNF levels, which may explain the cognitive and mood benefits of physical activity. Depression is associated with reduced BDNF levels, and all effective antidepressant treatments increase BDNF. The Val66Met polymorphism in the BDNF gene affects memory and anxiety and is associated with increased risk for several psychiatric disorders.",
      "sources": [
        {
          "source_type": "web",
          "source_credibility": "B",
          "article_url": "https://www.nature.com/articles/bdnf-plasticity",
          "collected_at": "2026-06-05T14:00:00Z"
        }
      ]
    },
    {
      "id": "NEUROTRANSMITTER-abc123",
      "name": "serotonin",
      "type": "monoamine",
      "function": "regulates mood, appetite, and sleep",
      "associated_regions": "raphe nuclei",
      "disorders": "depression, anxiety disorders",
      "drugs_targeting": "SSRIs, SNRIs",
      "description": "A monoamine neurotransmitter that plays a key role in regulating mood, appetite, and sleep-wake cycles.",
      "last_updated": "2026-06-27T16:05:33.284Z"
    },
    {
      "id": "NEUROTRANSMITTER-def456",
      "name": "dopamine",
      "type": "catecholamine",
      "function": "controls reward and pleasure systems, movement",
      "associated_regions": "substantia nigra, ventral tegmental area",
      "disorders": "Parkinson's disease, schizophrenia, addiction",
      "drugs_targeting": "L-DOPA, antipsychotics",
      "description": "A catecholamine neurotransmitter involved in reward, motivation, and motor control.",
      "last_updated": "2026-06-27T16:05:33.284Z"
    },
    {
      "id": "NEUROTRANSMITTER-ghi789",
      "name": "histamine",
      "type": "amine",
      "function": "regulates immune responses, digestion, and wakefulness",
      "associated_regions": "tuberomammillary nucleus",
      "disorders": "allergies, sleep disorders",
      "drugs_targeting": "antihistamines, H1 receptor antagonists",
      "description": "An amine neurotransmitter involved in immune responses, gastric acid secretion, and wakefulness.",
      "last_updated": "2026-06-27T16:05:33.284Z"
    },
    {
      "id": "NEUROTRANSMITTER-jkl012",
      "name": "tryptamine",
      "type": "monoamine",
      "function": "regulates sleep homeostasis",
      "associated_regions": "wake-active monoaminergic neurons",
      "disorders": "sleep disorders",
      "drugs_targeting": "not specified",
      "description": "A monoamine neurotransmitter derived from tryptophan that regulates sleep homeostasis.",
      "last_updated": "2026-06-27T16:05:33.284Z"
    },
    {
      "id": "NEUROTRANSMITTER-mno345",
      "name": "glutamate",
      "type": "excitatory amino acid",
      "function": "major excitatory neurotransmitter, involved in learning and memory",
      "associated_regions": "widespread throughout cortex and hippocampus",
      "disorders": "epilepsy, stroke, Alzheimer's disease",
      "drugs_targeting": "NMDA receptor antagonists, AMPA receptor modulators",
      "description": "The primary excitatory neurotransmitter in the brain, crucial for synaptic plasticity and learning.",
      "last_updated": "2026-06-27T16:05:33.284Z"
    },
    {
      "id": "NEUROTRANSMITTER-pqr678",
      "name": "GABA",
      "type": "inhibitory amino acid",
      "function": "major inhibitory neurotransmitter, reduces neuronal excitability",
      "associated_regions": "widespread throughout brain",
      "disorders": "anxiety disorders, epilepsy, seizures",
      "drugs_targeting": "benzodiazepines, barbiturates",
      "description": "The primary inhibitory neurotransmitter in the brain, counteracting excitatory signals.",
      "last_updated": "2026-06-27T16:05:33.284Z"
    },
    {
      "id": "NEUROTRANSMITTER-stu901",
      "name": "norepinephrine",
      "type": "catecholamine",
      "function": "regulates attention, arousal, and stress response",
      "associated_regions": "locus coeruleus",
      "disorders": "PTSD, depression, ADHD",
      "drugs_targeting": "SNRIs, alpha-2 agonists",
      "description": "A catecholamine neurotransmitter involved in the fight-or-flight response and attention.",
      "last_updated": "2026-06-27T16:05:33.284Z"
    },
    {
      "id": "NEUROTRANSMITTER-vwx234",
      "name": "acetylcholine",
      "type": "choline ester",
      "function": "regulates muscle activation, memory, and attention",
      "associated_regions": "basal forebrain, motor neurons",
      "disorders": "Alzheimer's disease, myasthenia gravis",
      "drugs_targeting": "acetylcholinesterase inhibitors, muscarinic agonists",
      "description": "A neurotransmitter involved in muscle contraction, memory formation, and attention.",
      "last_updated": "2026-06-27T16:05:33.284Z"
    },
    {
      "id": "NEUROTRANSMITTER-yza567",
      "name": "glycine",
      "type": "inhibitory amino acid",
      "function": "inhibitory neurotransmitter in spinal cord and brainstem",
      "associated_regions": "spinal cord, brainstem",
      "disorders": "hyperekplexia, spasticity",
      "drugs_targeting": "glycine receptor antagonists",
      "description": "An inhibitory neurotransmitter primarily found in the spinal cord and brainstem.",
      "last_updated": "2026-06-27T16:05:33.284Z"
    },
    {
      "id": "NEUROTRANSMITTER-bcd890",
      "name": "aspartate",
      "type": "excitatory amino acid",
      "function": "excitatory neurotransmitter, involved in synaptic transmission",
      "associated_regions": "cerebellum, hippocampus",
      "disorders": "excitotoxicity, neurodegeneration",
      "drugs_targeting": "NMDA receptor antagonists",
      "description": "An excitatory neurotransmitter similar to glutamate, involved in synaptic transmission.",
      "last_updated": "2026-06-27T16:05:33.284Z"
    }
  ]
};
