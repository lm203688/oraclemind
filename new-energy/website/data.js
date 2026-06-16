const DB = {
  "updated": "2026-05-29T02:27:01.446Z",
  "stats": {
    "energy_storage": 8,
    "grid_tech": 4,
    "hydrogen_energy": 4,
    "nuclear_renewable": 2,
    "solar_tech": 8,
    "wind_energy": 3
  },
  "energy_storage": [
    {
      "id": "ESTO-001",
      "name": "Lithium Iron Phosphate (LFP) Battery",
      "type": "Lithium-ion",
      "capacity": "100-300+ Ah cells; 50-500+ kWh packs",
      "efficiency": "95-97% round-trip",
      "description": "The dominant battery chemistry for grid storage and EVs (especially in China). No cobalt or nickel, lower cost, longer cycle life (3,000-10,000 cycles), but lower energy density than NMC.",
      "developer": "CATL, BYD, EVE, Gotion, REPT"
    },
    {
      "id": "ESTO-002",
      "name": "Sodium-Ion Battery",
      "type": "Sodium-ion",
      "capacity": "50-200 Ah cells",
      "efficiency": "90-92% round-trip",
      "description": "Uses abundant sodium instead of lithium. Lower energy density but excellent low-temperature performance and zero lithium dependency. CATL and HiNa are leading commercialization.",
      "developer": "CATL, HiNa Battery, Faradion, Natron Energy"
    },
    {
      "id": "ESTO-003",
      "name": "Solid-State Battery",
      "type": "Solid electrolyte lithium",
      "capacity": "Automotive-scale cells in development",
      "efficiency": "Target >95%",
      "description": "Replaces liquid electrolyte with solid ceramic or polymer, enabling lithium metal anodes for 2x energy density and improved safety. The holy grail of battery technology.",
      "developer": "Toyota, QuantumScape, Solid Power, Samsung SDI, SES AI"
    },
    {
      "id": "ESTO-004",
      "name": "Iron-Air Battery",
      "type": "Metal-air",
      "capacity": "Multi-MWh systems; 100+ hours duration",
      "efficiency": "45-50% round-trip",
      "description": "Uses iron oxidation (rusting) for ultra-cheap, long-duration energy storage. Target cost: <$20/kWh. Ideal for multi-day grid storage. Form Energy's first plant is building 10MW/1GWh system for Xcel Energy.",
      "developer": "Form Energy"
    },
    {
      "id": "ESTO-005",
      "name": "Redox Flow Battery (Vanadium)",
      "type": "Flow battery",
      "capacity": "kW to 100+ MW; 4-12 hours duration",
      "efficiency": "70-80% round-trip",
      "description": "Stores energy in liquid electrolyte tanks. Power and energy scale independently. Vanadium flow batteries offer 20,000+ cycles with no degradation. Ideal for long-duration grid storage.",
      "developer": "Sumitomo, Rongke Power, Invinity, CellCube"
    },
    {
      "id": "ESTO-006",
      "name": "Pumped Hydro Storage",
      "type": "Mechanical",
      "capacity": "GW-scale; 8-24+ hours duration",
      "efficiency": "75-85% round-trip",
      "description": "The most mature and widely deployed grid storage technology (95% of global storage capacity). Pumps water uphill when excess power is available, releases through turbines when needed. China leads with 50+ GW installed.",
      "developer": "Various utilities; China Three Gorges, Voith, Andritz"
    },
    {
      "id": "ESTO-007",
      "name": "Compressed Air Energy Storage (CAES)",
      "type": "Mechanical",
      "capacity": "10-300+ MW; 4-48 hours duration",
      "efficiency": "40-55% (traditional); 70%+ (adiabatic)",
      "description": "Compresses air into underground caverns or tanks. Advanced adiabatic CAES captures heat during compression for higher efficiency. Hydrostor is building 500MW projects in Australia and California.",
      "developer": "Hydrostor, Highview Power, Dresser-Rand"
    },
    {
      "id": "ESTO-008",
      "name": "Gravity Energy Storage",
      "type": "Mechanical",
      "capacity": "1-100 MW; 4-12 hours duration",
      "efficiency": "80-85% (projected)",
      "description": "Raises heavy blocks or masses using excess electricity, then lowers them to generate power. Energy Vault's EVx uses composite blocks in a tower. Simple, long-life, no degradation.",
      "developer": "Energy Vault, Gravitricity, Gravity Power"
    }
  ],
  "grid_tech": [
    {
      "id": "GRID-001",
      "name": "HVDC (High Voltage Direct Current) Transmission",
      "type": "Transmission",
      "description": "Long-distance power transmission with lower losses than AC. Essential for connecting remote renewable resources to demand centers. China leads with 30+ GW HVDC lines.",
      "capability": "1,100 kV, 12 GW per circuit; <3% loss per 1,000 km",
      "status": "Operational globally; massive expansion planned for renewable integration"
    },
    {
      "id": "GRID-002",
      "name": "Grid-Forming Inverters",
      "type": "Power electronics",
      "description": "Inverters that can establish grid voltage and frequency without relying on synchronous generators. Critical for 100% renewable grids.",
      "capability": "Replace synchronous generator functions (inertia, voltage, frequency control)",
      "status": "Deploying; Australia and UK leading grid-forming inverter requirements"
    },
    {
      "id": "GRID-003",
      "name": "Virtual Power Plants (VPP)",
      "type": "Distributed energy management",
      "description": "Aggregating distributed energy resources (rooftop solar, batteries, EVs, demand response) into a single dispatchable resource. Tesla, Sunrun, and utilities are deploying VPPs.",
      "capability": "GW-scale aggregation; real-time dispatch; 1-second response",
      "status": "Rapidly scaling; Tesla VPP in Texas, South Australia; Sunrun + National Grid"
    },
    {
      "id": "GRID-004",
      "name": "Dynamic Line Rating",
      "type": "Grid optimization",
      "description": "Real-time monitoring of power line capacity based on weather conditions (wind cooling, temperature). Can increase transmission capacity 15-30% without new construction.",
      "capability": "15-30% capacity increase on existing lines",
      "status": "Deploying; required by FERC in US; Ampacimon, Lindsey manufacturing leading"
    }
  ],
  "hydrogen_energy": [
    {
      "id": "HYD-001",
      "name": "PEM Electrolysis (Green Hydrogen)",
      "type": "Hydrogen production",
      "description": "Proton exchange membrane electrolysis using renewable electricity to split water into hydrogen and oxygen. Fast response time ideal for coupling with variable renewables.",
      "efficiency": "60-70% (LHV); improving",
      "status": "Commercial; scaling rapidly; ITM, Plug, Siemens leading"
    },
    {
      "id": "HYD-002",
      "name": "Solid Oxide Electrolysis (SOEC)",
      "type": "Hydrogen production",
      "description": "High-temperature electrolysis (700-850°C) using ceramic membranes. Higher efficiency than PEM when waste heat is available (e.g., from nuclear or industrial processes).",
      "efficiency": "80-90% (with heat input); highest electrical efficiency",
      "status": "Commercial (Bloom Energy, Topsoe); scaling for industrial applications"
    },
    {
      "id": "HYD-003",
      "name": "Hydrogen Fuel Cell (PEMFC)",
      "type": "Fuel cell",
      "description": "Converts hydrogen to electricity with water as only emission. Used in vehicles (Toyota Mirai, Hyundai Nexo), buses, trucks, and stationary power.",
      "efficiency": "50-60% electrical; 85-90% CHP",
      "status": "Commercial; Toyota, Hyundai, Plug Power, Ballard leading"
    },
    {
      "id": "HYD-004",
      "name": "Underground Hydrogen Storage",
      "type": "Hydrogen storage",
      "description": "Storing large volumes of hydrogen in salt caverns, depleted gas fields, or aquifers. Essential for seasonal energy storage at grid scale.",
      "efficiency": "95-98% (minimal leakage)",
      "status": "Demonstrated in salt caverns (Clemens Dome, Texas); HyUnder project evaluating European sites"
    }
  ],
  "main": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:40:02.767Z",
    "description": "新能源实体库",
    "entities": []
  },
  "nuclear_renewable": [
    {
      "id": "NUKR-001",
      "name": "Small Modular Reactor (SMR) Integration",
      "type": "Nuclear-renewable hybrid",
      "description": "SMRs providing baseload power that complements variable renewables. SMRs can load-follow and provide process heat for industrial applications.",
      "integration": "SMR + solar/wind + storage; district heating; hydrogen production",
      "status": "GE Hitachi BWRX-300 under construction in Canada; Rolls-Royce SMR in UK"
    },
    {
      "id": "NUKR-002",
      "name": "Nuclear Hydrogen Production",
      "type": "Hydrogen",
      "description": "Using nuclear heat and electricity for high-temperature electrolysis or thermochemical hydrogen production. More efficient than using variable renewables alone.",
      "integration": "HTGR/SMR + SOEC electrolysis; thermochemical cycles (S-I, Cu-Cl)",
      "status": "DOE hydrogen hubs; pilot projects at Idaho National Lab; Japan HTTR"
    }
  ],
  "solar": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:44:16.574Z",
    "description": "光伏技术库",
    "entities": [
      {
        "id": "SE-001",
        "name": "PERC",
        "type": "晶硅",
        "efficiency": "23.5%",
        "cost": "低",
        "maturity": "大规模量产",
        "companies": [
          "隆基",
          "通威",
          "晶科"
        ]
      },
      {
        "id": "SE-002",
        "name": "TOPCon",
        "type": "晶硅",
        "efficiency": "25.5%",
        "cost": "中低",
        "maturity": "快速扩产",
        "companies": [
          "晶科",
          "天合",
          "晶澳"
        ]
      },
      {
        "id": "SE-003",
        "name": "HJT异质结",
        "type": "晶硅",
        "efficiency": "26.5%",
        "cost": "中高",
        "maturity": "小规模量产",
        "companies": [
          "华晟",
          "东方日升"
        ]
      },
      {
        "id": "SE-004",
        "name": "钙钛矿",
        "type": "薄膜",
        "efficiency": "26.1%",
        "cost": "潜在极低",
        "maturity": "实验室/中试",
        "companies": [
          "协鑫",
          "纤纳",
          "Oxford PV"
        ]
      },
      {
        "id": "SE-005",
        "name": "BC背接触",
        "type": "晶硅",
        "efficiency": "25.5%",
        "cost": "中",
        "maturity": "量产初期",
        "companies": [
          "隆基",
          "爱旭"
        ]
      }
    ]
  },
  "solar_tech": [
    {
      "id": "SOL-001",
      "name": "Perovskite-Silicon Tandem Cell",
      "type": "Photovoltaic",
      "efficiency": "33.9% (record, LONGi 2023); 29.1% certified (Oxford PV)",
      "description": "Stacking a perovskite top cell (wide bandgap) on a silicon bottom cell captures more of the solar spectrum. This is the fastest path to exceeding the silicon single-junction limit (29.4%).",
      "developer": "Oxford PV, LONGi, Hanwha Qcells, CubicPV",
      "status": "Oxford PV shipping first commercial tandem modules (2024); mass production 2025-2026"
    },
    {
      "id": "SOL-002",
      "name": "All-Perovskite Tandem Cell",
      "type": "Photovoltaic",
      "efficiency": "29.3% (record, NJU/EPFL 2023)",
      "description": "Two perovskite layers with different bandgaps stacked together. Potentially cheaper than perovskite-silicon tandems since both layers are solution-processable. Key challenge: stable narrow-bandgap perovskite (tin-lead).",
      "developer": "Caelux, NJU, EPFL, UNC",
      "status": "Lab efficiency records climbing rapidly; stability improving; commercialization 5+ years"
    },
    {
      "id": "SOL-003",
      "name": "HJT (Heterojunction Technology)",
      "type": "Photovoltaic",
      "efficiency": "26.81% (LONGi, world record for silicon single junction)",
      "description": "Combines crystalline silicon with amorphous silicon layers for high efficiency and low temperature coefficient. Better performance in hot climates than PERC.",
      "developer": "LONGi, Huasun, Risen, REC",
      "status": "Commercial; growing market share; LONGi's 26.81% broke the silicon efficiency record"
    },
    {
      "id": "SOL-004",
      "name": "TOPCon (Tunnel Oxide Passivated Contact)",
      "type": "Photovoltaic",
      "efficiency": "25.7%+ (mass production)",
      "description": "The current mainstream upgrade from PERC, adding a tunnel oxide layer for better surface passivation. Dominating new capacity additions globally.",
      "developer": "Jinko Solar, Trina, JA Solar, LONGi",
      "status": "Mainstream; >60% of new capacity in 2024; lowest $/W in mass production"
    },
    {
      "id": "SOL-005",
      "name": "CIGS Thin Film",
      "type": "Photovoltaic",
      "efficiency": "23.6% (record, Solar Frontier); 16-18% commercial modules",
      "description": "Copper indium gallium selenide thin-film solar cells. Flexible, lightweight, and good performance in low-light and high-temperature conditions. Used in BIPV and portable applications.",
      "developer": "Solar Frontier, Avancis, Manz AG, Flisom",
      "status": "Niche market; flexible and BIPV applications; indium supply concern"
    },
    {
      "id": "SOL-006",
      "name": "Organic Photovoltaics (OPV)",
      "type": "Photovoltaic",
      "efficiency": "19.2% (record); 10-12% commercial",
      "description": "Carbon-based semiconductors enabling ultra-lightweight, flexible, semi-transparent solar cells. Can be printed on plastic films. Very low cost potential but limited efficiency and stability.",
      "developer": "Heliatek, Epishine, ASCA, Sumitomo Chemical",
      "status": "Niche applications (BIPV, IoT power); efficiency gap too large for mainstream"
    },
    {
      "id": "SOL-007",
      "name": "Concentrated Solar Power (CSP) with Thermal Storage",
      "type": "Solar thermal",
      "efficiency": "15-25% (solar-to-electric); 40%+ with combined cycle",
      "description": "Mirrors concentrate sunlight to heat molten salt, which stores energy for 10+ hours of dispatchable power. Provides baseload solar without batteries.",
      "developer": "SolarReserve, ACWA Power, BrightSource, Abengoa",
      "status": "Operational plants in Morocco, UAE, China, Spain; declining costs but still expensive vs PV+battery"
    },
    {
      "id": "SOL-008",
      "name": "Bifacial Solar Modules",
      "type": "PV architecture",
      "efficiency": "5-25% more energy than monofacial depending on albedo",
      "description": "Modules that capture light from both sides, using ground-reflected light to boost output. Now standard for utility-scale installations.",
      "developer": "All major manufacturers",
      "status": "Mainstream; >70% of utility-scale installations in 2024"
    }
  ],
  "storage": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:44:16.574Z",
    "description": "储能技术库",
    "entities": [
      {
        "id": "ST-001",
        "name": "磷酸铁锂LFP",
        "type": "锂电池",
        "energy_density": "160-180 Wh/kg",
        "cycles": "6000+",
        "cost": "¥0.5/Wh",
        "maturity": "大规模商用"
      },
      {
        "id": "ST-002",
        "name": "钠离子电池",
        "type": "钠电池",
        "energy_density": "120-160 Wh/kg",
        "cycles": "3000+",
        "cost": "¥0.4/Wh",
        "maturity": "量产初期"
      },
      {
        "id": "ST-003",
        "name": "全固态电池",
        "type": "固态",
        "energy_density": "300-500 Wh/kg",
        "cycles": "TBD",
        "cost": "极高",
        "maturity": "实验室/中试"
      },
      {
        "id": "ST-004",
        "name": "钒液流电池",
        "type": "液流",
        "energy_density": "15-25 Wh/kg",
        "cycles": "20000+",
        "cost": "¥2/Wh",
        "maturity": "商用"
      },
      {
        "id": "ST-005",
        "name": "压缩空气储能",
        "type": "物理",
        "energy_density": "~30 Wh/kg",
        "cycles": "30000+",
        "cost": "¥0.3/Wh",
        "maturity": "示范项目"
      }
    ]
  },
  "wind_energy": [
    {
      "id": "WIND-001",
      "name": "Offshore Floating Wind Turbine",
      "type": "Floating offshore wind",
      "capacity": "15 MW+ per turbine; Hywind Tampen: 88 MW farm",
      "description": "Wind turbines mounted on floating platforms (spar, semi-sub, TLP) in deep water (>60m). Unlocks 80% of offshore wind resources that fixed-bottom can't reach.",
      "developer": "Equinor (Hywind), Principle Power (WindFloat), BW Ideol"
    },
    {
      "id": "WIND-002",
      "name": "Airborne Wind Energy (AWE)",
      "type": "High-altitude wind",
      "capacity": "100 kW - 5 MW (development targets)",
      "description": "Kites or drones that harvest wind energy at 200-800m altitude where winds are stronger and more consistent. Potential to reduce material use by 90% vs conventional turbines.",
      "developer": "Makani (Google X, discontinued), Kitepower, SkySails, Ampyx Power, Windlift"
    },
    {
      "id": "WIND-003",
      "name": "Vertical Axis Wind Turbine (VAWT)",
      "type": "Onshore/distributed wind",
      "capacity": "1 kW - 1 MW",
      "description": "Rotates around a vertical axis, accepting wind from any direction. Quieter and better for urban environments than horizontal axis turbines. Lower efficiency at utility scale.",
      "developer": "IceWind, Vertical Wind, NuPower"
    }
  ]
};
