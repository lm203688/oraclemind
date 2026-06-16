const DB = {
  "updated": "2026-05-29T02:27:01.437Z",
  "stats": {
    "fusion": 6,
    "reactors": 10
  },
  "fusion": [
    {
      "id": "FUS-001",
      "name": "Tokamak (Magnetic Confinement)",
      "approach": "Toroidal magnetic confinement - donut-shaped chamber with helical magnetic fields confining plasma",
      "organization": "ITER, CFS/SPARC, EAST, KSTAR, JET, DIII-D",
      "status": "Most mature fusion approach; ITER under construction; CFS targeting Q≥2 by 2027",
      "milestone": "JET 69 MJ (2023); ITER targeting Q≥10 by 2035",
      "timeline": "First commercial tokamak power plant: 2040s (DEMO)",
      "description": "The most studied and funded fusion approach. A tokamak uses strong toroidal and poloidal magnetic fields to confine a donut-shaped plasma at 100-200 million°C. ITER is the flagship project. CFS's compact tokamak using HTS magnets could accelerate the timeline. The main challenges are plasma disruptions, divertor heat loads, and tritium breeding."
    },
    {
      "id": "FUS-002",
      "name": "Stellarator",
      "approach": "Twisted toroidal magnetic confinement - inherently stable 3D magnetic field geometry",
      "organization": "Max Planck IPP (Wendelstein 7-X), University of Wisconsin (HSX)",
      "status": "W7-X demonstrating improved confinement; proof-of-principle for stellarator optimization",
      "milestone": "W7-X achieved 1.3 GJ energy turnover and 8-minute plasmas (2023)",
      "timeline": "Commercial stellarator: 2050s (longer than tokamak but potentially more reliable)",
      "description": "Stellarators use complex 3D magnetic field shapes that are inherently stable (no plasma current needed), eliminating disruption risk. Wendelstein 7-X in Germany is the world's largest stellarator and has demonstrated that optimized designs can achieve tokamak-like confinement. Stellarators are harder to build but potentially more reliable for steady-state power plants."
    },
    {
      "id": "FUS-003",
      "name": "Inertial Confinement Fusion (ICF)",
      "approach": "Compress and heat tiny fuel pellets with lasers or X-rays to achieve fusion conditions",
      "organization": "LLNL/NIF, Omega (LLE), LMJ (France), First Light Fusion",
      "status": "Ignition achieved at NIF (2022); not yet a viable power plant approach",
      "milestone": "NIF: 5.2 MJ fusion yield, Q~1.5 (2024)",
      "timeline": "IFE power plant: 2040s-2050s; significant engineering challenges remain",
      "description": "ICF uses powerful lasers to compress a DT fuel capsule to extreme density and temperature. NIF achieved ignition in 2022, proving the physics works. However, converting this to a power plant requires: 10 Hz repetition rate (NIF fires once/day), efficient laser drivers, target manufacturing at scale, and chamber design. IFE research is expanding with new driver approaches."
    },
    {
      "id": "FUS-004",
      "name": "Field-Reversed Configuration (FRC)",
      "approach": "Compact self-organized plasma structure with closed magnetic field lines; no central penetration needed",
      "organization": "TAE Technologies, Helion Energy",
      "status": "TAE Norman at 30M°C; Helion building Polaris; Microsoft PPA signed for 2028",
      "milestone": "Helion: first commercial fusion PPA; TAE: sustained FRC plasmas",
      "timeline": "Helion targeting 2028; TAE targeting 2030s",
      "description": "FRC creates a self-contained plasma ring with its own magnetic field, requiring minimal external magnets. This enables compact, potentially much cheaper fusion devices. Helion uses pulsed FRC with direct energy conversion (no steam). TAE targets aneutronic p-B11 fusion. Both are high-risk, high-reward approaches with aggressive timelines."
    },
    {
      "id": "FUS-005",
      "name": "Z-Pinch / Magneto-Inertial",
      "approach": "Use electrical current through plasma to create self-confining magnetic field; or compress magnetized plasma with imploding liner",
      "organization": "Zap Energy, Shiva Star (AFRL), MagLIF (Sandia)",
      "status": "Zap Energy at 37M°C; Sandia MagLIF demonstrating significant neutron yields",
      "milestone": "Zap: sheared-flow Z-pinch at fusion-relevant conditions; Sandia: MagLIF scaling favorably",
      "timeline": "Zap Energy targeting 2030s commercialization",
      "description": "Z-pinch is the simplest fusion concept: run a large current through plasma, and the resulting magnetic field confines it. The challenge is instability. Zap Energy solves this with sheared flow (differential plasma velocity). Sandia's MagLIF uses a laser to preheat magnetized fuel before Z-pinch compression. Both approaches avoid expensive magnetic coils."
    },
    {
      "id": "FUS-006",
      "name": "Aneutronic Fusion (p-B11)",
      "approach": "Proton-boron fusion produces charged particles (no neutrons), enabling direct energy conversion",
      "organization": "TAE Technologies, HB11 Energy, LPP Fusion",
      "status": "Research phase; requires 10x higher temperature than D-T fusion (~1 billion°C)",
      "milestone": "TAE: 30M°C achieved; need ~1 billion°C for p-B11",
      "timeline": "Earliest 2035-2040; significant physics challenges remain",
      "description": "Aneutronic fusion using hydrogen and boron-11 produces only charged alpha particles, eliminating neutron damage and activation. This enables direct energy conversion (electricity from charged particles, no steam cycle) with potential >80% efficiency. The catch: it requires temperatures of ~1 billion°C, 10x higher than D-T fusion. TAE and HB11 are pursuing different approaches to reach these conditions."
    }
  ],
  "main": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:40:02.713Z",
    "description": "核能裂变聚变实体库",
    "entities": []
  },
  "reactors": [
    {
      "id": "REACT-001",
      "name": "ITER (International Thermonuclear Experimental Reactor)",
      "type": "Tokamak fusion",
      "status": "Under construction",
      "capacity": "500 MW fusion power (Q≥10)",
      "location": "Cadarache, France",
      "operator": "ITER Organization (35 countries)",
      "technology": "Deuterium-tritium tokamak; superconducting Nb₃Sn magnets; 6.2m major radius",
      "description": "The world's largest fusion experiment, designed to produce 500 MW of fusion power from 50 MW of heating (Q≥10). Construction 78% complete as of 2024. First plasma targeted for 2030, D-T operations by 2035. Total cost ~$22 billion. ITER will be the first fusion device to produce net energy and test integrated fusion technologies."
    },
    {
      "id": "REACT-002",
      "name": "SPARC (Commonwealth Fusion Systems)",
      "type": "Tokamak fusion (compact)",
      "status": "Under construction",
      "capacity": "50-100 MW fusion power (Q≥2)",
      "location": "Devens, Massachusetts, USA",
      "operator": "Commonwealth Fusion Systems (MIT spinoff)",
      "technology": "High-temperature superconducting (REBCO) magnets; compact tokamak design",
      "description": "CFS is building SPARC, a compact tokamak using revolutionary REBCO (rare-earth barium copper oxide) high-temperature superconducting magnets. These magnets are 40x stronger than ITER's, enabling a much smaller device. SPARC aims to demonstrate Q≥2 by 2026-2027. CFS has raised $2+ billion and plans commercial fusion (ARC) by 2030s."
    },
    {
      "id": "REACT-003",
      "name": "NIF (National Ignition Facility)",
      "type": "Inertial confinement fusion (laser)",
      "status": "Operational",
      "capacity": "3.15 MJ fusion yield (Dec 2022 - first ignition)",
      "location": "Lawrence Livermore National Laboratory, USA",
      "operator": "US Department of Energy / LLNL",
      "technology": "192-beam Nd:glass laser; indirect drive (hohlraum); DT fuel capsule",
      "description": "Achieved fusion ignition on Dec 5, 2022 - the first time more energy was produced from fusion than the laser energy delivered to the target (Q~1.5). Repeated ignition in 2023-2024 with yields up to 5.2 MJ. While not a power plant design, NIF proved ignition is possible and advances weapons physics and fusion science."
    },
    {
      "id": "REACT-004",
      "name": "JET (Joint European Torus)",
      "type": "Tokamak fusion",
      "status": "Decommissioned (2023)",
      "capacity": "16 MW fusion power (Q=0.67 in 1997; 69 MJ in 2023)",
      "location": "Culham, UK",
      "operator": "UKAEA / EUROfusion",
      "technology": "Copper magnet tokamak; D-T fuel; ITER-like wall (beryllium/tungsten)",
      "description": "The world's largest operating tokamak until decommissioning. Set the fusion energy record: 69 MJ sustained fusion in 2023 using D-T fuel. JET tested ITER-relevant wall materials and operating scenarios for 40 years. Its data directly informed ITER design. Final D-T campaign in 2023 provided crucial tritium handling experience."
    },
    {
      "id": "REACT-005",
      "name": "KSTAR (Korea Superconducting Tokamak Advanced Research)",
      "type": "Tokamak fusion",
      "status": "Operational",
      "capacity": "Research device (no net power)",
      "location": "Daejeon, South Korea",
      "operator": "Korea Institute of Fusion Energy (KFE)",
      "technology": "Nb₃Sn superconducting tokamak; advanced divertor configurations",
      "description": "KSTAR achieved a world record 48-second high-confinement (H-mode) plasma at 100 million°C in 2023, and extended to 102 seconds in 2024. These long-pulse records are critical for demonstrating steady-state operation needed for future power plants. KSTAR tests ITER-relevant divertor and plasma control technologies."
    },
    {
      "id": "REACT-006",
      "name": "EAST (Experimental Advanced Superconducting Tokamak)",
      "type": "Tokamak fusion",
      "status": "Operational",
      "capacity": "Research device",
      "location": "Hefei, China",
      "operator": "Chinese Academy of Sciences (ASIPP)",
      "technology": "Fully superconducting tokamak; tungsten divertor; D-shaped cross-section",
      "description": "China's flagship fusion device. EAST achieved 403-second H-mode plasma in 2023 and 1056-second long-pulse plasma in 2021. It was the first fully superconducting tokamak and tests steady-state operation scenarios. EAST's tungsten divertor provides data for ITER and China's CFETR project."
    },
    {
      "id": "REACT-007",
      "name": "TAE Technologies Norman",
      "type": "Field-reversed configuration (FRC)",
      "status": "Operational",
      "capacity": "Research device; targeting p-B11 fuel",
      "location": "Foothill Ranch, California, USA",
      "operator": "TAE Technologies",
      "technology": "Field-reversed configuration; hydrogen-boron (p-B11) fuel; neutral beam injection",
      "description": "TAE is pursuing aneutronic fusion using hydrogen-boron fuel, which produces no neutrons and enables direct energy conversion. The 'Norman' device sustained FRC plasmas at 30 million°C. TAE's Copernicus device (next generation) aims for fusion-relevant temperatures. Google is a partner, providing AI optimization for plasma control."
    },
    {
      "id": "REACT-008",
      "name": "Helion Energy Polaris",
      "type": "Field-reversed configuration / magneto-inertial",
      "status": "Under construction",
      "capacity": "Target: 50 MW electricity generation",
      "location": "Everett, Washington, USA",
      "operator": "Helion Energy",
      "technology": "Pulsed FRC; deuterium-helium-3 fuel; direct energy conversion",
      "description": "Helion uses pulsed FRC technology with direct energy conversion (no steam cycle), potentially achieving >50% efficiency. Microsoft signed a PPA with Helion for 2028 delivery - the first commercial fusion power purchase agreement. Polaris is Helion's 7th prototype. D-He3 fuel produces minimal neutrons. Backed by Sam Altman and Peter Thiel."
    },
    {
      "id": "REACT-009",
      "name": "APOLLO (Zap Energy)",
      "type": "Sheared-flow-stabilized Z-pinch",
      "status": "Under construction",
      "capacity": "Research → commercial",
      "location": "Seattle, Washington, USA",
      "operator": "Zap Energy",
      "technology": "Z-pinch with sheared-flow stabilization; no magnetic coils; compact design",
      "description": "Zap Energy's approach eliminates expensive magnetic coils by using the plasma's own current to create the confining magnetic field (Z-pinch). Sheared-flow stabilization prevents plasma instabilities. This enables a dramatically simpler and cheaper device. Zap has achieved 37 million°C plasmas and raised $330M+."
    },
    {
      "id": "REACT-010",
      "name": "Hualong One (HPR1000)",
      "type": "Pressurized water reactor (Generation III+)",
      "status": "Operational",
      "capacity": "1,160 MWe per unit",
      "location": "Fuqing (units 5-6), Fangchenggang (units 3-4), Zhangzhou; also Pakistan (K2, K3)",
      "operator": "CNNC / CGN",
      "technology": "3-loop PWR; passive safety systems; 60-year design life; double containment",
      "description": "China's indigenous Gen III+ reactor design, developed from the ACPR1000 and ACP1000. Features passive safety systems (no operator action needed for 72h after accident). First unit (Fuqing 5) connected to grid in 2020. China plans 30+ Hualong One units domestically and is exporting to Pakistan, Argentina, and potentially other countries."
    }
  ]
};
