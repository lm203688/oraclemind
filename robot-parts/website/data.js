const DB = {
  "updated": "2026-05-29T02:27:01.433Z",
  "stats": {
    "platforms": 6,
    "sensors": 5
  },
  "actuators": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:02:14.972Z",
    "description": "执行器/舵机库",
    "entities": [
      {
        "id": "ACT-001",
        "name": "DYNAMIXEL XM540-W270-T",
        "category": "servo",
        "manufacturer": "ROBOTIS",
        "type": "smart_servo",
        "torque": "9.2 Nm @ 12V",
        "speed": "0.222 sec/60° @ 12V",
        "weight": "82g",
        "voltage": "10.0~14.8V",
        "protocol": "DYNAMIXEL Protocol 2.0",
        "interface": "TTL/RS485",
        "position_resolution": "4096",
        "applications": [
          "humanoid",
          "manipulator",
          "quadruped"
        ],
        "price_range": "0-100",
        "compatibility": [
          "U2D2",
          "CM-550",
          "OpenCM9.04"
        ],
        "ros_support": true
      },
      {
        "id": "ACT-002",
        "name": "DYNAMIXEL XM430-W350-T",
        "category": "servo",
        "manufacturer": "ROBOTIS",
        "type": "smart_servo",
        "torque": "4.1 Nm @ 12V",
        "speed": "0.22 sec/60° @ 12V",
        "weight": "82g",
        "voltage": "10.0~14.8V",
        "protocol": "DYNAMIXEL Protocol 2.0",
        "interface": "TTL/RS485",
        "position_resolution": "4096",
        "applications": [
          "humanoid",
          "manipulator",
          "walker"
        ],
        "price_range": "0-80",
        "compatibility": [
          "U2D2",
          "CM-550",
          "OpenCM9.04"
        ],
        "ros_support": true
      },
      {
        "id": "ACT-003",
        "name": "DYNAMIXEL PH54-200-S500-R",
        "category": "servo",
        "manufacturer": "ROBOTIS",
        "type": "smart_servo",
        "torque": "44.7 Nm @ 48V",
        "speed": "0.011 sec/60° @ 48V",
        "weight": "1.45kg",
        "voltage": "24.0~48.0V",
        "protocol": "DYNAMIXEL Protocol 2.0",
        "interface": "RS485",
        "position_resolution": "505900",
        "applications": [
          "humanoid_pro",
          "industrial",
          "exoskeleton"
        ],
        "price_range": "00-700",
        "compatibility": [
          "U2D2",
          "CM-550"
        ],
        "ros_support": true
      },
      {
        "id": "ACT-004",
        "name": "CubeMars AK80-64",
        "category": "actuator",
        "manufacturer": "CubeMars",
        "type": "quasi_direct_drive",
        "torque": "17 Nm peak",
        "speed": "6.3 rad/s",
        "weight": "490g",
        "voltage": "24V",
        "protocol": "CAN bus",
        "interface": "CAN 2.0",
        "position_resolution": "14-bit encoder",
        "applications": [
          "quadruped",
          "humanoid_leg",
          "exoskeleton"
        ],
        "price_range": "00-300",
        "compatibility": [
          "CAN adapter",
          "Pi3Hat"
        ],
        "ros_support": true
      },
      {
        "id": "ACT-005",
        "name": "CubeMars AK10-9",
        "category": "actuator",
        "manufacturer": "CubeMars",
        "type": "quasi_direct_drive",
        "torque": "9 Nm peak",
        "speed": "23.3 rad/s",
        "weight": "270g",
        "voltage": "24V",
        "protocol": "CAN bus",
        "interface": "CAN 2.0",
        "position_resolution": "14-bit encoder",
        "applications": [
          "quadruped",
          "drone_gimbal",
          "robotic_arm"
        ],
        "price_range": "50-200",
        "compatibility": [
          "CAN adapter",
          "Pi3Hat"
        ],
        "ros_support": true
      },
      {
        "id": "ACT-006",
        "name": "T-Motor AK80-9",
        "category": "actuator",
        "manufacturer": "T-Motor",
        "type": "quasi_direct_drive",
        "torque": "17 Nm peak",
        "speed": "6.3 rad/s",
        "weight": "490g",
        "voltage": "24V",
        "protocol": "CAN bus",
        "interface": "CAN 2.0",
        "position_resolution": "14-bit",
        "applications": [
          "quadruped",
          "humanoid"
        ],
        "price_range": "00-300",
        "compatibility": [
          "CAN adapter"
        ],
        "ros_support": true
      },
      {
        "id": "ACT-007",
        "name": "Unitree A1 Motor",
        "category": "actuator",
        "manufacturer": "Unitree",
        "type": "quasi_direct_drive",
        "torque": "23.7 Nm peak",
        "speed": "23.3 rad/s",
        "weight": "500g",
        "voltage": "24V",
        "protocol": "CAN bus",
        "interface": "CAN 2.0",
        "position_resolution": "14-bit",
        "applications": [
          "quadruped",
          "humanoid_leg"
        ],
        "price_range": "00-350",
        "compatibility": [
          "Unitree controller"
        ],
        "ros_support": true
      },
      {
        "id": "ACT-008",
        "name": "DJI M3508/M2006",
        "category": "servo",
        "manufacturer": "DJI",
        "type": "smart_servo",
        "torque": "1.0/0.25 Nm",
        "speed": "~300rpm",
        "weight": "68g/28g",
        "voltage": "24V",
        "protocol": "CAN bus",
        "interface": "CAN 2.0",
        "position_resolution": "8192",
        "applications": [
          "robot_arm",
          "gimbal",
          "mobile_robot"
        ],
        "price_range": "0-60",
        "compatibility": [
          "DJI C board"
        ],
        "ros_support": false
      },
      {
        "id": "ACT-009",
        "name": "Moteus r4.11 + MJ5208",
        "category": "actuator",
        "manufacturer": "mjbots",
        "type": "servo_controller",
        "torque": "3.2 Nm peak",
        "speed": "60 rad/s",
        "weight": "55g(controller)",
        "voltage": "12-48V",
        "protocol": "CAN-FD",
        "interface": "CAN-FD",
        "position_resolution": "14-bit",
        "applications": [
          "quadruped",
          "robotic_arm",
          "hobby"
        ],
        "price_range": "0-80",
        "compatibility": [
          "Pi3Hat",
          "fdcanusb"
        ],
        "ros_support": true
      },
      {
        "id": "ACT-010",
        "name": "Focbox Unity",
        "category": "controller",
        "manufacturer": "Enertion/VESC",
        "type": "motor_controller",
        "torque": "depends on motor",
        "speed": "depends on motor",
        "weight": "180g",
        "voltage": "8-60V",
        "protocol": "VESC/UART",
        "interface": "UART/USB/CAN",
        "position_resolution": "N/A",
        "applications": [
          "mobile_robot",
          "electric_vehicle",
          "robot_arm"
        ],
        "price_range": "00-150",
        "compatibility": [
          "VESC Tool"
        ],
        "ros_support": false
      }
    ]
  },
  "chips": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:02:14.972Z",
    "description": "芯片/计算平台库",
    "entities": [
      {
        "id": "CHIP-001",
        "name": "NVIDIA Jetson Orin NX",
        "category": "compute",
        "manufacturer": "NVIDIA",
        "type": "SoC",
        "cpu": "8-core ARM Cortex-A78AE",
        "gpu": "1024-core Ampere GPU",
        "memory": "8/16GB LPDDR5",
        "tdp": "10-25W",
        "ai_perf": "70 TOPS",
        "interfaces": [
          "PCIe",
          "USB3",
          "GbE",
          "MIPI CSI",
          "I2C",
          "SPI",
          "UART",
          "CAN"
        ],
        "form_factor": "Jetson module",
        "price_range": "00-600",
        "applications": [
          "autonomous_robot",
          "manipulator",
          "AMR",
          "drone"
        ],
        "ros_support": true
      },
      {
        "id": "CHIP-002",
        "name": "NVIDIA Jetson Orin Nano",
        "category": "compute",
        "manufacturer": "NVIDIA",
        "type": "SoC",
        "cpu": "6-core ARM Cortex-A78AE",
        "gpu": "1024-core Ampere GPU",
        "memory": "8GB LPDDR5",
        "tdp": "7-15W",
        "ai_perf": "40 TOPS",
        "interfaces": [
          "PCIe",
          "USB3",
          "GbE",
          "MIPI CSI",
          "I2C",
          "SPI",
          "UART"
        ],
        "form_factor": "Jetson module",
        "price_range": "00-300",
        "applications": [
          "entry_robot",
          "vision_system",
          "edge_ai"
        ],
        "ros_support": true
      },
      {
        "id": "CHIP-003",
        "name": "Raspberry Pi 5",
        "category": "compute",
        "manufacturer": "Raspberry Pi",
        "type": "SBC",
        "cpu": "4-core ARM Cortex-A76",
        "gpu": "VideoCore VII",
        "memory": "4/8GB LPDDR4X",
        "tdp": "5-12W",
        "ai_perf": "N/A",
        "interfaces": [
          "USB3",
          "GbE",
          "PCIe 2.0",
          "GPIO",
          "I2C",
          "SPI",
          "UART"
        ],
        "form_factor": "SBC",
        "price_range": "0-80",
        "applications": [
          "hobby_robot",
          "education",
          "sensor_hub"
        ],
        "ros_support": true
      },
      {
        "id": "CHIP-004",
        "name": "STM32H743",
        "category": "mcu",
        "manufacturer": "STMicroelectronics",
        "type": "MCU",
        "cpu": "ARM Cortex-M7 @ 480MHz",
        "gpu": "N/A",
        "memory": "1MB RAM / 2MB Flash",
        "tdp": "0.5W",
        "ai_perf": "N/A",
        "interfaces": [
          "CAN-FD",
          "USB",
          "SPI",
          "I2C",
          "UART",
          "ADC",
          "PWM"
        ],
        "form_factor": "LQFP/BGA",
        "price_range": "0-20",
        "applications": [
          "motor_control",
          "realtime_control",
          "sensor_interface"
        ],
        "ros_support": false
      },
      {
        "id": "CHIP-005",
        "name": "ESP32-S3",
        "category": "mcu",
        "manufacturer": "Espressif",
        "type": "MCU",
        "cpu": "Xtensa LX7 dual-core @ 240MHz",
        "gpu": "N/A",
        "memory": "512KB SRAM / 8MB PSRAM",
        "tdp": "0.5W",
        "ai_perf": "N/A",
        "interfaces": [
          "WiFi",
          "BLE",
          "SPI",
          "I2C",
          "UART",
          "ADC",
          "PWM"
        ],
        "form_factor": "QFN",
        "price_range": "-5",
        "applications": [
          "IoT_robot",
          "wireless_control",
          "sensor_node"
        ],
        "ros_support": false
      },
      {
        "id": "CHIP-006",
        "name": "Qualcomm RB5",
        "category": "compute",
        "manufacturer": "Qualcomm",
        "type": "SoC",
        "cpu": "8-core Kryo 585",
        "gpu": "Adreno 650",
        "memory": "8GB LPDDR5",
        "tdp": "15W",
        "ai_perf": "15 TOPS",
        "interfaces": [
          "PCIe",
          "USB3",
          "GbE",
          "MIPI CSI",
          "I2C",
          "SPI",
          "CAN"
        ],
        "form_factor": "QRB5165 module",
        "price_range": "00-600",
        "applications": [
          "drone",
          "AMR",
          "industrial_robot"
        ],
        "ros_support": true
      },
      {
        "id": "CHIP-007",
        "name": "Rockchip RK3588",
        "category": "compute",
        "manufacturer": "Rockchip",
        "type": "SoC",
        "cpu": "4xA76 + 4xA55",
        "gpu": "Mali-G610 MP4",
        "memory": "4/8/16GB LPDDR4x",
        "tdp": "5-10W",
        "ai_perf": "6 TOPS",
        "interfaces": [
          "PCIe 3.0",
          "USB3",
          "GbE",
          "MIPI CSI",
          "I2C",
          "SPI",
          "UART"
        ],
        "form_factor": "BGA",
        "price_range": "0-150",
        "applications": [
          "robot_vision",
          "edge_ai",
          "hobby_robot"
        ],
        "ros_support": true
      }
    ]
  },
  "interfaces": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:02:14.972Z",
    "description": "接口标准库",
    "entities": [
      {
        "id": "IF-001",
        "name": "USB 3.0",
        "category": "interface",
        "type": "wired",
        "speed": "5 Gbps",
        "power": "5V/900mA",
        "connector": "Type-A/Type-C/Micro-B",
        "applications": [
          "camera",
          "lidar",
          "compute_module",
          "debug"
        ],
        "pros": [
          "universal",
          "hot_plug",
          "power_delivery"
        ],
        "cons": [
          "not_deterministic",
          "cable_length_limited"
        ],
        "compatibility": [
          "almost_all_devices"
        ]
      },
      {
        "id": "IF-002",
        "name": "MIPI CSI-2",
        "category": "interface",
        "type": "camera_serial",
        "speed": "2.5 Gbps/lane (up to 4 lanes)",
        "power": "low",
        "connector": "FFC/FPC",
        "applications": [
          "camera_module",
          "depth_sensor"
        ],
        "pros": [
          "high_bandwidth",
          "low_power",
          "standard_in_mobile"
        ],
        "cons": [
          "short_cable",
          "fragile_connector"
        ],
        "compatibility": [
          "Jetson",
          "RK3588",
          "Qualcomm"
        ]
      },
      {
        "id": "IF-003",
        "name": "PCIe 3.0/4.0",
        "category": "interface",
        "type": "high_speed_bus",
        "speed": "8/16 GT/s per lane",
        "power": "depends on slot",
        "connector": "M.2/PCIe slot",
        "applications": [
          "GPU",
          "NVMe",
          "FPGA",
          "high_speed_capture"
        ],
        "pros": [
          "very_high_bandwidth",
          "low_latency"
        ],
        "cons": [
          "complex",
          "expensive_connectors"
        ],
        "compatibility": [
          "Jetson",
          "x86_SBC",
          "RK3588"
        ]
      },
      {
        "id": "IF-004",
        "name": "GPIO",
        "category": "interface",
        "type": "digital_I/O",
        "speed": "low",
        "power": "3.3V/5V",
        "connector": "pin_header",
        "applications": [
          "button",
          "LED",
          "relay",
          "simple_sensor"
        ],
        "pros": [
          "simple",
          "universal"
        ],
        "cons": [
          "slow",
          "no_standardization"
        ],
        "compatibility": [
          "Raspberry_Pi",
          "STM32",
          "ESP32"
        ]
      },
      {
        "id": "IF-005",
        "name": "Ethernet (GbE)",
        "category": "interface",
        "type": "network",
        "speed": "1 Gbps",
        "power": "PoE optional",
        "connector": "RJ45",
        "applications": [
          "robot_communication",
          "ROS2",
          "remote_control"
        ],
        "pros": [
          "standard",
          "long_range",
          "PoE"
        ],
        "cons": [
          "bulky_connector",
          "EMI_sensitive"
        ],
        "compatibility": [
          "Jetson",
          "Pi5",
          "RK3588",
          "x86"
        ]
      }
    ]
  },
  "llms": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:02:14.972Z",
    "description": "机器人大模型库",
    "entities": [
      {
        "id": "LLM-001",
        "name": "GPT-4o",
        "category": "LLM",
        "manufacturer": "OpenAI",
        "type": "multimodal_LLM",
        "parameters": "~1.8T (est.)",
        "input": "text+image",
        "output": "text",
        "robotics_use": [
          "task_planning",
          "visual_reasoning",
          "code_generation",
          "natural_language_command"
        ],
        "api_available": true,
        "open_source": false,
        "price": ".5-10/1M tokens",
        "compatibility": [
          "any_compute_platform_via_API"
        ],
        "embodied_ai": false
      },
      {
        "id": "LLM-002",
        "name": "Claude 3.5 Sonnet",
        "category": "LLM",
        "manufacturer": "Anthropic",
        "type": "LLM",
        "parameters": "unknown",
        "input": "text+image",
        "output": "text",
        "robotics_use": [
          "task_planning",
          "code_generation",
          "safety_reasoning"
        ],
        "api_available": true,
        "open_source": false,
        "price": "-15/1M tokens",
        "compatibility": [
          "any_compute_platform_via_API"
        ],
        "embodied_ai": false
      },
      {
        "id": "LLM-003",
        "name": "RT-2",
        "category": "VLA",
        "manufacturer": "Google DeepMind",
        "type": "vision_language_action",
        "parameters": "55B",
        "input": "text+image",
        "output": "robot_actions",
        "robotics_use": [
          "end_to_end_control",
          "visual_manipulation",
          "instruction_following"
        ],
        "api_available": false,
        "open_source": false,
        "price": "N/A (research)",
        "compatibility": [
          "Google robot hardware"
        ],
        "embodied_ai": true
      },
      {
        "id": "LLM-004",
        "name": "Octo",
        "category": "VLA",
        "manufacturer": "Berkeley",
        "type": "vision_language_action",
        "parameters": "93M",
        "input": "text+image+proprioception",
        "output": "robot_actions",
        "robotics_use": [
          "general_robot_manipulation",
          "transfer_learning"
        ],
        "api_available": true,
        "open_source": true,
        "price": "Free",
        "compatibility": [
          "multiple_robot_arms"
        ],
        "embodied_ai": true
      },
      {
        "id": "LLM-005",
        "name": "OpenVLA",
        "category": "VLA",
        "manufacturer": "Stanford",
        "type": "vision_language_action",
        "parameters": "7B",
        "input": "text+image",
        "output": "robot_actions",
        "robotics_use": [
          "fine_tuned_manipulation",
          "instruction_following"
        ],
        "api_available": true,
        "open_source": true,
        "price": "Free",
        "compatibility": [
          "multiple_robots_via_fine_tuning"
        ],
        "embodied_ai": true
      },
      {
        "id": "LLM-006",
        "name": "Qwen2.5-VL",
        "category": "LLM",
        "manufacturer": "Alibaba",
        "type": "multimodal_LLM",
        "parameters": "3B/7B/72B",
        "input": "text+image+video",
        "output": "text",
        "robotics_use": [
          "visual_reasoning",
          "OCR",
          "spatial_understanding"
        ],
        "api_available": true,
        "open_source": true,
        "price": "Free (self-hosted)",
        "compatibility": [
          "Jetson",
          "RK3588",
          "cloud"
        ],
        "embodied_ai": false
      },
      {
        "id": "LLM-007",
        "name": "π0 (Pi-Zero)",
        "category": "VLA",
        "manufacturer": "Physical Intelligence",
        "type": "vision_language_action",
        "parameters": "unknown",
        "input": "text+image+proprioception",
        "output": "robot_actions",
        "robotics_use": [
          "general_purpose_manipulation",
          "laundry_folding",
          "assembly"
        ],
        "api_available": false,
        "open_source": false,
        "price": "N/A (limited_access)",
        "compatibility": [
          "multiple_robots"
        ],
        "embodied_ai": true
      }
    ]
  },
  "main": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T03:59:48.667Z",
    "description": "robot parts chips protocols实体库",
    "entities": []
  },
  "platforms": [
    {
      "id": "RPLAT-001",
      "name": "Boston Dynamics Atlas",
      "type": "Humanoid robot platform",
      "description": "The most advanced humanoid robot, capable of parkour, backflips, and dynamic manipulation. Fully electric 2024 version with whole-body mobility.",
      "manufacturer": "Boston Dynamics (Hyundai)",
      "application": "Research, industrial inspection, logistics"
    },
    {
      "id": "RPLAT-002",
      "name": "Tesla Optimus (Bot)",
      "type": "Humanoid robot platform",
      "description": "Tesla's humanoid robot designed for mass production. Uses Tesla's FSD AI and actuator technology. Gen 2 walks 30% faster and has improved hand dexterity.",
      "manufacturer": "Tesla",
      "application": "Manufacturing, household tasks, logistics"
    },
    {
      "id": "RPLAT-003",
      "name": "Figure 02",
      "type": "Humanoid robot platform",
      "description": "General-purpose humanoid with OpenAI-powered intelligence. Deployed at BMW Spartanburg plant for body shop tasks. Features end-to-end neural network control.",
      "manufacturer": "Figure AI",
      "application": "Manufacturing, logistics, elder care"
    },
    {
      "id": "RPLAT-004",
      "name": "Unitree G1/H1",
      "type": "Humanoid robot platform",
      "description": "Affordable humanoid robots from China. G1 ($116K) targets research; H1 ($90K) targets industrial. G1 demonstrated cooking and martial arts moves.",
      "manufacturer": "Unitree Robotics",
      "application": "Research, industrial, entertainment"
    },
    {
      "id": "RPLAT-005",
      "name": "ANYmal (ANYbotics)",
      "type": "Quadruped robot platform",
      "description": "Industrial quadruped for autonomous inspection in hazardous environments (oil rigs, mines, nuclear plants). Waterproof, self-righting, AI-powered navigation.",
      "manufacturer": "ANYbotics (ETH Zurich spinoff)",
      "application": "Industrial inspection, monitoring, hazardous environments"
    },
    {
      "id": "RPLAT-006",
      "name": "DJI Matrice 350 RTK",
      "type": "Aerial robot platform",
      "description": "Enterprise drone platform for inspection, mapping, and public safety. 55-min flight time, IP55 rating, multi-payload support.",
      "manufacturer": "DJI",
      "application": "Infrastructure inspection, surveying, emergency response"
    }
  ],
  "protocols": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:02:14.972Z",
    "description": "通信协议库",
    "entities": [
      {
        "id": "PROTO-001",
        "name": "EtherCAT",
        "category": "communication",
        "type": "industrial_ethernet",
        "speed": "100 Mbps",
        "latency": "<100 μs",
        "determinism": "deterministic",
        "topology": "line/star/ring",
        "max_nodes": "65535",
        "cable": "CAT5+ Ethernet",
        "standard": "IEC 61158",
        "applications": [
          "industrial_robot",
          "CNC",
          "motion_control"
        ],
        "pros": [
          "ultra_low_latency",
          "deterministic",
          "wide_support"
        ],
        "cons": [
          "requires_master",
          "complex_setup"
        ],
        "compatibility": [
          "Beckhoff",
          "Omron",
          "any EtherCAT slave"
        ]
      },
      {
        "id": "PROTO-002",
        "name": "CANopen",
        "category": "communication",
        "type": "fieldbus",
        "speed": "1 Mbps max",
        "latency": "~1 ms",
        "determinism": "deterministic",
        "topology": "bus",
        "max_nodes": "127",
        "cable": "twisted pair",
        "standard": "CiA 301",
        "applications": [
          "mobile_robot",
          "motor_control",
          "industrial"
        ],
        "pros": [
          "robust",
          "simple",
          "widely_supported"
        ],
        "cons": [
          "limited_bandwidth",
          "slow_for_large_data"
        ],
        "compatibility": [
          "STM32",
          "CAN adapter",
          "PiCAN"
        ]
      },
      {
        "id": "PROTO-003",
        "name": "PROFINET",
        "category": "communication",
        "type": "industrial_ethernet",
        "speed": "100 Mbps",
        "latency": "<1 ms (IRT)",
        "determinism": "deterministic (IRT)",
        "topology": "star/tree/ring",
        "max_nodes": "256",
        "cable": "CAT5+ Ethernet",
        "standard": "IEC 61158",
        "applications": [
          "factory_automation",
          "process_control"
        ],
        "pros": [
          "integrated_IT",
          "real_time"
        ],
        "cons": [
          "complex",
          "expensive"
        ],
        "compatibility": [
          "Siemens",
          "Phoenix Contact"
        ]
      },
      {
        "id": "PROTO-004",
        "name": "DYNAMIXEL Protocol 2.0",
        "category": "communication",
        "type": "proprietary_serial",
        "speed": "3 Mbps",
        "latency": "~1 ms",
        "determinism": "semi-deterministic",
        "topology": "daisy_chain",
        "max_nodes": "252",
        "cable": "TTL/RS485",
        "standard": "ROBOTIS proprietary",
        "applications": [
          "hobby_robot",
          "humanoid",
          "manipulator"
        ],
        "pros": [
          "simple",
          "rich_feedback",
          "position_control"
        ],
        "cons": [
          "proprietary",
          "limited_bandwidth"
        ],
        "compatibility": [
          "DYNAMIXEL servos only"
        ]
      },
      {
        "id": "PROTO-005",
        "name": "ROS2 DDS",
        "category": "communication",
        "type": "middleware",
        "speed": "depends on transport",
        "latency": "~1-10 ms",
        "determinism": "configurable QoS",
        "topology": "P2P mesh",
        "max_nodes": "unlimited",
        "cable": "Ethernet/WiFi",
        "standard": "OMG DDS",
        "applications": [
          "robot_software",
          "multi_robot",
          "research"
        ],
        "pros": [
          "flexible",
          "scalable",
          "open_source"
        ],
        "cons": [
          "overhead",
          "complex_config"
        ],
        "compatibility": [
          "any ROS2 compatible hardware"
        ]
      },
      {
        "id": "PROTO-006",
        "name": "UART/Serial",
        "category": "communication",
        "type": "serial",
        "speed": "up to 5 Mbps",
        "latency": "~1 ms",
        "determinism": "non-deterministic",
        "topology": "point-to-point",
        "max_nodes": "2 (point-to-point)",
        "cable": "TX/RX/GND",
        "standard": "RS-232/RS-485/TTL",
        "applications": [
          "debug",
          "GPS",
          "simple_sensor",
          "motor_controller"
        ],
        "pros": [
          "simple",
          "universal"
        ],
        "cons": [
          "slow",
          "no_multi_drop"
        ],
        "compatibility": [
          "almost_all_MCU"
        ]
      },
      {
        "id": "PROTO-007",
        "name": "I2C",
        "category": "communication",
        "type": "serial_bus",
        "speed": "100/400/3400 KHz",
        "latency": "~1 ms",
        "determinism": "non-deterministic",
        "topology": "bus",
        "max_nodes": "127",
        "cable": "SDA/SCL/GND",
        "standard": "NXP/Philips",
        "applications": [
          "sensor",
          "EEPROM",
          "display",
          "IMU"
        ],
        "pros": [
          "simple",
          "2_wire",
          "multi_device"
        ],
        "cons": [
          "slow",
          "address_conflicts"
        ],
        "compatibility": [
          "almost_all_MCU"
        ]
      },
      {
        "id": "PROTO-008",
        "name": "SPI",
        "category": "communication",
        "type": "serial_bus",
        "speed": "up to 80 MHz",
        "latency": "<100 μs",
        "determinism": "deterministic",
        "topology": "master-slave",
        "max_nodes": "depends on CS lines",
        "cable": "MOSI/MISO/SCK/CS",
        "standard": "Motorola",
        "applications": [
          "display",
          "ADC/DAC",
          "flash",
          "IMU"
        ],
        "pros": [
          "fast",
          "full_duplex",
          "deterministic"
        ],
        "cons": [
          "many_wires",
          "no_standard_connector"
        ],
        "compatibility": [
          "almost_all_MCU"
        ]
      }
    ]
  },
  "sensors": [
    {
      "id": "SENS-001",
      "name": "LiDAR (Light Detection and Ranging)",
      "type": "3D depth sensing",
      "range": "0.1 - 300+ m",
      "description": "Pulsed laser-based 3D mapping sensor. Essential for autonomous navigation and obstacle detection. Solid-state LiDAR is replacing mechanical spinning units.",
      "manufacturer": "Velodyne (Ouster), Luminar, Hesai, Livox, Innoviz"
    },
    {
      "id": "SENS-002",
      "name": "Event Camera (Neuromorphic Vision)",
      "type": "Vision sensor",
      "range": "Dynamic range 120dB+",
      "description": "Pixels fire independently when brightness changes, mimicking the retina. Extremely low latency (μs), high dynamic range, low power. Ideal for high-speed robotics.",
      "manufacturer": "Prophesee (Metavision), iniVation (DAVIS), CelePixel"
    },
    {
      "id": "SENS-003",
      "name": "Tactile Sensor (GelSight)",
      "type": "Touch sensing",
      "range": "Sub-millimeter resolution",
      "description": "Optical tactile sensors that capture high-resolution contact geometry and force distribution. Enable dexterous robotic manipulation.",
      "manufacturer": "GelSight (MIT spinoff), SynTouch, Pressure Profile Systems"
    },
    {
      "id": "SENS-004",
      "name": "IMU (Inertial Measurement Unit)",
      "type": "Motion sensing",
      "range": "±2g to ±200g; ±125°/s to ±4000°/s",
      "description": "Combines accelerometer, gyroscope, and magnetometer for orientation and motion tracking. Essential for robot balance and navigation.",
      "manufacturer": "Bosch, InvenSense (TDK), STMicroelectronics, Analog Devices"
    },
    {
      "id": "SENS-005",
      "name": "Force/Torque Sensor",
      "type": "Force sensing",
      "range": "0.01 N·m to 1000+ N·m",
      "description": "Measures forces and torques in 6 axes (Fx, Fy, Fz, Tx, Ty, Tz). Critical for robotic assembly, polishing, and safe human-robot interaction.",
      "manufacturer": "ATI Industrial Automation, OnRobot, SCHUNK, ME-Meßsysteme"
    }
  ]
};
