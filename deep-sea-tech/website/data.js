const DB = {
  "updated": "2026-05-29T02:27:01.444Z",
  "stats": {
    "deep_sea_ecology": 6,
    "deep_sea_resources": 6,
    "marine_biology": 8,
    "ocean_exploration": 6,
    "submersibles": 12,
    "underwater_tech": 7
  },
  "deep_sea_ecology": [
    {
      "id": "DSEC-001",
      "name": "Hydrothermal Vent Ecosystems",
      "ecosystem_type": "Chemosynthetic",
      "depth": "2,000-4,000 m",
      "location": "Mid-ocean ridges globally (East Pacific Rise, Mid-Atlantic Ridge, Indian Ocean)",
      "key_species": "Riftia pachyptila, Alvinella pompejana, Bathymodiolus thermophilus, Kiwa hirsuta",
      "description": "Ecosystems powered by chemical energy from Earth's interior rather than sunlight. Hydrothermal vents support 300+ endemic species through chemosynthetic primary production. Discovered in 1977 at the Galápagos Rift, they revolutionized biology and have implications for the origin of life and astrobiology."
    },
    {
      "id": "DSEC-002",
      "name": "Cold Seep Communities",
      "ecosystem_type": "Chemosynthetic",
      "depth": "200-3,500 m",
      "location": "Gulf of Mexico, Mediterranean, Japan Trench, Cascadia Margin",
      "key_species": "Lamellibrachia luymesi, Bathymodiolus childressi, Calyptogena spp.",
      "description": "Communities fueled by methane and hydrogen sulfide seeping from the seafloor. Unlike vents, cold seeps are stable over centuries. Gulf of Mexico seeps support tube worm colonies living 250+ years. These ecosystems are threatened by oil industry activities and potential deep-sea mining."
    },
    {
      "id": "DSEC-003",
      "name": "Whale Fall Ecosystems",
      "ecosystem_type": "Detrital/Chemosynthetic",
      "depth": "100-4,000 m",
      "location": "Global ocean; documented in Pacific, Atlantic, Southern Ocean",
      "key_species": "Osedax spp., sleeper sharks, hagfish, amphipods, bone-eating worms",
      "description": "When a whale carcass sinks to the deep seafloor, it creates a localized ecosystem lasting 50-100 years. Three successional stages: (1) mobile scavenger stage (months-years), (2) enrichment-opportunist stage (years), (3) sulfophilic stage (decades). Whale falls may serve as evolutionary stepping stones between vent and seep communities."
    },
    {
      "id": "DSEC-004",
      "name": "Abyssal Plain Ecosystems",
      "ecosystem_type": "Detrital",
      "depth": "4,000-6,000 m",
      "location": "Global ocean basins; CCZ (Pacific), Madeira Abyssal Plain (Atlantic)",
      "key_species": "Abyssal sea cucumbers (Holothuroidea), brittle stars, polychaete worms, foraminifera",
      "description": "The largest ecosystem on Earth by area, abyssal plains cover >50% of the planet. Life depends on 'marine snow' (organic detritus from surface waters). Biodiversity is surprisingly high but poorly documented. These ecosystems are most threatened by polymetallic nodule mining in the CCZ."
    },
    {
      "id": "DSEC-005",
      "name": "Hadal Zone Trench Ecosystems",
      "ecosystem_type": "Detrital/Scavenger",
      "depth": "6,000-11,000 m",
      "location": "Ocean trenches - Mariana, Tonga, Philippine, Kermadec, Japan, Puerto Rico",
      "key_species": "Hadal amphipods (Hirondellea gigas), snailfish (Pseudoliparis), xenophyophores",
      "description": "The deepest ocean ecosystems, found only in subduction trenches. Despite extreme pressure, hadal zones support active scavenger communities. Food arrives as carrion falls and is channeled by trench topography. Each trench may harbor endemic species due to geographic isolation."
    },
    {
      "id": "DSEC-006",
      "name": "Deep-Sea Coral Gardens",
      "ecosystem_type": "Filter-feeding",
      "depth": "200-6,000 m",
      "location": "North Atlantic, Mediterranean, New Zealand seamounts, Emperor Seamount Chain",
      "key_species": "Lophelia pertusa, Madrepora oculata, Paragorgia arborea (bubblegum coral)",
      "description": "Deep-sea corals form structural habitats rivaling tropical reefs in biodiversity. Unlike shallow corals, they don't rely on symbiotic algae. Some colonies are 4,000+ years old. Threatened by bottom trawling, ocean acidification, and oil exploration. Protected in some regions (e.g., NE Atlantic MPAs)."
    }
  ],
  "deep_sea_resources": [
    {
      "id": "DSR-001",
      "name": "Polymetallic Nodules (Manganese Nodules)",
      "resource_type": "Metals (Mn, Fe, Ni, Cu, Co, REE)",
      "location": "Clarion-Clipperton Zone (CCZ), Pacific; Indian Ocean; Peru Basin",
      "depth": "4,000-6,000 m",
      "estimated_quantity": "CCZ alone: ~21 billion dry tonnes; 6 billion tonnes of manganese",
      "extraction_status": "Exploration contracts (ISA); pilot mining tests by Nauru Ocean Resources, TMC, China Minmetals",
      "description": "Potato-sized concretions on the abyssal seafloor containing manganese, nickel, copper, cobalt, and rare earth elements. The CCZ in the Pacific is the most studied area. The Metals Company (TMC) conducted pilot nodule collection in 2022. ISA mining regulations pending."
    },
    {
      "id": "DSR-002",
      "name": "Seafloor Massive Sulfides (SMS)",
      "resource_type": "Metals (Cu, Zn, Au, Ag, Pb)",
      "location": "Hydrothermal vent fields - Mid-Atlantic Ridge, Southwest Pacific, Indian Ocean",
      "depth": "1,500-4,000 m",
      "estimated_quantity": "Individual deposits 1-100 million tonnes; global total poorly constrained",
      "extraction_status": "Exploration phase; Nautilus Minerals attempted Solwara 1 project (failed 2019)",
      "description": "Mineral deposits formed by hydrothermal venting at mid-ocean ridges and back-arc basins. Rich in copper, zinc, gold, and silver. Nautilus Minerals' Solwara 1 in Papua New Guinea was the first deep-sea mining project but went bankrupt in 2019. Environmental concerns are significant due to unique vent ecosystems."
    },
    {
      "id": "DSR-003",
      "name": "Cobalt-Rich Ferromanganese Crusts",
      "resource_type": "Metals (Co, Mn, Ni, Pt, REE, Ti)",
      "location": "Seamounts in Pacific (Prime Crust Zone), Atlantic, Indian Ocean",
      "depth": "400-7,000 m (optimal 800-2,500 m)",
      "estimated_quantity": "Pacific PCZ: ~1 billion tonnes of cobalt",
      "extraction_status": "Exploration contracts (ISA); no commercial mining yet",
      "description": "Layered crusts on seamount slopes, enriched in cobalt (up to 1.7%), platinum, and rare earth elements. The Prime Crust Zone in the western Pacific has the highest cobalt concentrations. Mining would require cutting crusts from hard substrate, a significant engineering challenge."
    },
    {
      "id": "DSR-004",
      "name": "Methane Hydrates (Clathrates)",
      "resource_type": "Energy (natural gas)",
      "location": "Continental margins worldwide - Nankai Trough (Japan), Gulf of Mexico, South China Sea, Arctic",
      "depth": "300-3,000 m below seafloor",
      "estimated_quantity": "Global: ~3,000x current annual natural gas consumption",
      "extraction_status": "Japan and China have conducted production tests; no commercial production",
      "description": "Ice-like compounds where methane is trapped in water crystal structures. Japan's MH21 program achieved the world's first offshore methane hydrate production test in 2013. China's 2017 and 2020 tests in the South China Sea set production records. Commercial viability remains unproven due to extraction costs and stability concerns."
    },
    {
      "id": "DSR-005",
      "name": "Rare Earth Elements in Deep-Sea Mud",
      "resource_type": "Rare Earth Elements",
      "location": "Eastern South Pacific, Central Indian Ocean, eastern Philippine Sea",
      "depth": "3,000-6,000 m",
      "estimated_quantity": "Minami-Tori Shima area alone: ~780 years of global Y, ~620 years of Eu, ~420 years of Tb supply",
      "extraction_status": "Research phase; Japan discovered high-REY mud near Minami-Tori Shima",
      "description": "Kato et al. (2011) discovered deep-sea mud with extremely high rare earth and yttrium (REY) concentrations. Japanese research near Minami-Tori Shima island found mud with 5,000-7,000 ppm total REY, potentially the world's largest REE resource. Extraction would involve pumping mud to surface for processing."
    },
    {
      "id": "DSR-006",
      "name": "Deep-Sea Lithium Resources",
      "resource_type": "Lithium",
      "location": "Hydrothermal fluids, brine pools, Red Sea, Gulf of Mexico",
      "depth": "1,000-3,500 m",
      "estimated_quantity": "Poorly quantified; hydrothermal fluids contain 5-15 mM Li",
      "extraction_status": "Research phase; no extraction technology developed",
      "description": "Hydrothermal vent fluids and deep-sea brines contain elevated lithium concentrations. As terrestrial lithium demand surges for batteries, deep-sea lithium could become a future resource. However, extraction technology and economic viability remain unproven."
    }
  ],
  "main": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:40:02.799Z",
    "description": "深海科技实体库",
    "entities": []
  },
  "marine_biology": [
    {
      "id": "MBIO-001",
      "name": "Giant Tube Worm (Riftia pachyptila)",
      "species": "Riftia pachyptila",
      "depth_range": "2,000-3,000 m",
      "habitat": "Hydrothermal vent chimneys, East Pacific Rise",
      "discovery_year": "1977",
      "unique_features": "No digestive system; relies entirely on endosymbiotic chemosynthetic bacteria for nutrition; hemoglobin binds both O₂ and H₂S",
      "description": "The iconic organism of deep-sea hydrothermal vents. Riftia grows up to 2.4m long and forms dense clusters around black smokers. Its symbiotic bacteria convert hydrogen sulfide into organic compounds, enabling life independent of sunlight. This chemosynthetic ecosystem revolutionized our understanding of life's energy sources."
    },
    {
      "id": "MBIO-002",
      "name": "Yeti Crab (Kiwa hirsuta)",
      "species": "Kiwa hirsuta",
      "depth_range": "2,200 m",
      "habitat": "Hydrothermal vents, Pacific-Antarctic Ridge",
      "discovery_year": "2005",
      "unique_features": "Claws covered in hair-like setae hosting chemosynthetic bacteria; blind; may 'farm' bacteria for food",
      "description": "Discovered in 2005 at a Pacific hydrothermal vent, the yeti crab's hairy claws cultivate chemosynthetic bacteria. A related species, Kiwa puravida, was observed waving its claws over vent fluids to feed its bacterial 'crop' - a remarkable example of deep-sea farming behavior."
    },
    {
      "id": "MBIO-003",
      "name": "Hadal Snailfish (Pseudoliparis swirei)",
      "species": "Pseudoliparis swirei",
      "depth_range": "6,000-8,200 m",
      "habitat": "Mariana Trench hadal zone",
      "discovery_year": "2014",
      "unique_features": "Deepest-living fish; transparent body; no swim bladder; specialized cartilage; TMAO adaptation",
      "description": "The deepest-living fish ever recorded, found at 8,178m in the Mariana Trench. Its body is adapted to extreme pressure through TMAO (trimethylamine N-oxide) accumulation that stabilizes proteins. In 2023, a related species (P. belyaevi) was filmed at 8,336m by the Fendouzhe submersible."
    },
    {
      "id": "MBIO-004",
      "name": "Giant Isopod (Bathynomus giganteus)",
      "species": "Bathynomus giganteus",
      "depth_range": "300-2,500 m",
      "habitat": "Gulf of Mexico, Caribbean, Atlantic abyssal plains",
      "discovery_year": "1879",
      "unique_features": "Up to 50cm long; scavenger; can survive 5+ years without food; copper-based blood",
      "description": "One of the largest crustaceans, reaching 50cm. Giant isopods are deep-sea scavengers that feed on whale falls and other carrion. Their extreme fasting ability and slow metabolism are adaptations to the food-scarce deep ocean. New species continue to be discovered, including B. yucatanensis (2022)."
    },
    {
      "id": "MBIO-005",
      "name": "Vampire Squid (Vampyroteuthis infernalis)",
      "species": "Vampyroteuthis infernalis",
      "depth_range": "600-1,200 m (oxygen minimum zone)",
      "habitat": "Global tropical and temperate oceans, oxygen minimum zones",
      "discovery_year": "1903",
      "unique_features": "Not a true squid or octopus; lives in oxygen minimum zones (3% saturation); bioluminescent; detritivore",
      "description": "A unique cephalopod that thrives in oxygen minimum zones where few animals survive. It uses bioluminescent displays for defense and feeds on 'marine snow' (detritus) rather than hunting. Its low metabolic rate and specialized hemocyanin allow survival in near-anoxic conditions."
    },
    {
      "id": "MBIO-006",
      "name": "Dumbo Octopus (Grimpoteuthis spp.)",
      "species": "Grimpoteuthis spp.",
      "depth_range": "1,000-7,000 m",
      "habitat": "Global deep ocean, seamounts, hydrothermal vents",
      "discovery_year": "1884 (genus)",
      "unique_features": "Ear-like fins; deepest-living octopus; swallows prey whole; no ink sac",
      "description": "Named for their ear-like fins, dumbo octopuses are among the deepest-living cephalopods. They lack ink sacs (unnecessary in the dark deep sea) and hover above the seafloor using their fins. New species continue to be discovered as deep-sea exploration expands."
    },
    {
      "id": "MBIO-007",
      "name": "Barrel Sponge (Xestospongia muta)",
      "species": "Xestospongia muta",
      "depth_range": "10-120 m (deep specimens at 300+ m)",
      "habitat": "Caribbean, Florida, Bahamas deep reefs",
      "discovery_year": "Known historically",
      "unique_features": "Can live 2,300+ years; filters 50,000x its volume in water daily; hosts diverse microbial communities",
      "description": "The 'redwood of the reef,' barrel sponges can live for millennia. Deep specimens host unique microbial communities that produce bioactive compounds with pharmaceutical potential. Their longevity makes them valuable for studying deep-sea environmental change."
    },
    {
      "id": "MBIO-008",
      "name": "Zombie Worm (Osedax spp.)",
      "species": "Osedax spp.",
      "depth_range": "30-4,000 m",
      "habitat": "Whale falls worldwide",
      "discovery_year": "2002",
      "unique_features": "No mouth or digestive system; uses symbiotic bacteria to dissolve and absorb bone; root-like structures penetrate bone",
      "description": "Osedax worms colonize whale bones on the deep seafloor. Females have root-like structures that penetrate bone and host symbiotic bacteria that break down collagen and lipids. Males are microscopic and live inside females. Over 30 species discovered since 2002."
    }
  ],
  "ocean_exploration": [
    {
      "id": "OEXP-001",
      "name": "Five Deeps Expedition",
      "mission_type": "Exploration",
      "organization": "Caladan Oceanic / Triton Submarines",
      "year": "2018-2019",
      "location": "All five ocean deepest points",
      "discoveries": "Mapped all five deepest trenches; discovered new species; corrected depth measurements for several trenches",
      "description": "Victor Vescovo piloted DSV Limiting Factor to the deepest point in all five oceans, completing the first crewed descent of the Puerto Rico Trench, South Sandwich Trench, Java Trench, and Molloy Deep. The expedition mapped 300,000+ km² of seafloor and discovered 40+ new species."
    },
    {
      "id": "OEXP-002",
      "name": "Ring of Fire Expedition",
      "mission_type": "Scientific",
      "organization": "NOAA Ocean Exploration",
      "year": "2021-2023",
      "location": "Pacific Ring of Fire submarine volcanoes",
      "discoveries": "New hydrothermal vents, unknown species, active underwater volcanism",
      "description": "NOAA's multi-year expedition to explore submarine volcanoes along the Pacific Ring of Fire. Using ROV Deep Discoverer, the team documented previously unknown hydrothermal systems and their biological communities. Live-streamed dives engaged millions of viewers worldwide."
    },
    {
      "id": "OEXP-003",
      "name": "Seabed 2030",
      "mission_type": "Mapping",
      "organization": "GEBCO / Nippon Foundation",
      "year": "2017-2030 (ongoing)",
      "location": "Global ocean",
      "discoveries": "Mapped 24.9% of ocean floor by 2023 (up from 6% in 2017); discovered thousands of seamounts",
      "description": "A collaborative project to map 100% of the ocean floor to modern standards by 2030. Progress accelerated from 6% (2017) to 24.9% (2023) through contributions from governments, industry, and citizen scientists. New satellite altimetry data revealed 19,000+ previously unknown seamounts."
    },
    {
      "id": "OEXP-004",
      "name": "Hadal Zone Exploration (Fendouzhe)",
      "mission_type": "Scientific",
      "organization": "Institute of Deep-sea Science and Engineering, CAS",
      "year": "2020-present",
      "location": "Mariana Trench, Kermadec Trench, Philippine Basin",
      "discoveries": "Deepest fish filming (8,336m); new hadal species; microbial communities at extreme depths",
      "description": "China's ongoing hadal zone research program using the Fendouzhe submersible. In 2023, filmed a snailfish at 8,336m - the deepest fish observation ever. The program has collected thousands of biological and geological samples from the deepest ocean trenches."
    },
    {
      "id": "OEXP-005",
      "name": "CCZ Biodiversity Assessment",
      "mission_type": "Environmental Assessment",
      "organization": "ISA, multiple research institutions",
      "year": "2001-present",
      "location": "Clarion-Clipperton Zone, Pacific",
      "discoveries": "Over 5,000 species estimated; >90% new to science; complex connectivity patterns",
      "description": "The largest deep-sea environmental assessment in history, spanning two decades. Research reveals the CCZ harbors extraordinary biodiversity, with an estimated 5,000+ species, over 90% undescribed. This data is critical for ISA mining regulations and marine protected area design."
    },
    {
      "id": "OEXP-006",
      "name": "Mojito Deep-Sea Mining Test",
      "mission_type": "Mining Technology Test",
      "organization": "The Metals Company (TMC) / Allseas",
      "year": "2022",
      "location": "CCZ, Pacific (4,300m depth)",
      "discoveries": "Demonstrated nodule collection from seafloor; measured sediment plume behavior",
      "description": "The first integrated pilot test of polymetallic nodule collection in the CCZ. Allseas' Hidden Gem vessel collected 3,000+ tonnes of nodules from 4,300m depth. Environmental monitoring measured sediment plume extent and resettlement. Results inform ISA regulatory decisions."
    }
  ],
  "resources": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:44:16.574Z",
    "description": "深海资源库",
    "entities": [
      {
        "id": "DR-001",
        "name": "多金属结核",
        "location": "深海4-6km",
        "composition": "Mn/Co/Ni/Cu",
        "abundance": "~210亿吨",
        "mining_status": "勘探阶段"
      },
      {
        "id": "DR-002",
        "name": "富钴结壳",
        "location": "海山",
        "composition": "Co/Mn/Ni",
        "abundance": "丰富",
        "mining_status": "勘探阶段"
      },
      {
        "id": "DR-003",
        "name": "海底硫化物",
        "location": "热液喷口",
        "composition": "Cu/Zn/Au/Ag",
        "abundance": "分散",
        "mining_status": "勘探阶段"
      },
      {
        "id": "DR-004",
        "name": "天然气水合物",
        "location": "大陆坡",
        "composition": "CH4·nH2O",
        "abundance": "~2万万亿m³",
        "mining_status": "试采成功"
      }
    ]
  },
  "submersibles": [
    {
      "id": "SUB-001",
      "name": "Fendouzhe (奋斗者号)",
      "type": "Human-occupied vehicle (HOV)",
      "max_depth": "10,909 m",
      "operator": "Institute of Deep-sea Science and Engineering, CAS",
      "country": "China",
      "year": "2020",
      "capabilities": "3 crew; 2 robotic arms; 4K video; 10+ hours bottom time; acoustic communication",
      "description": "China's deepest-diving manned submersible, reaching the bottom of the Mariana Trench (10,909m) in November 2020. Built with titanium alloy personnel sphere. Has completed 200+ dives including scientific expeditions to hadal zones."
    },
    {
      "id": "SUB-002",
      "name": "DSV Limiting Factor (Triton 36000/2)",
      "type": "Human-occupied vehicle (HOV)",
      "max_depth": "11,000 m",
      "operator": "Caladan Oceanic / Triton Submarines",
      "country": "USA",
      "year": "2019",
      "capabilities": "2 crew; acrylic sphere viewport; 4+ hours bottom time; repeatable deep diving",
      "description": "The first commercially developed full-ocean-depth submersible. Completed the Five Deeps Expedition (2018-2019), visiting the deepest point in all five oceans. Pilot: Victor Vescovo. Now operated for scientific and filming missions."
    },
    {
      "id": "SUB-003",
      "name": "Jiaolong (蛟龙号)",
      "type": "Human-occupied vehicle (HOV)",
      "max_depth": "7,062 m",
      "operator": "China Ocean Mineral Resources R&D Association",
      "country": "China",
      "year": "2010",
      "capabilities": "3 crew; 2 manipulator arms; near-bottom autonomous hovering; video and sampling systems",
      "description": "China's first deep-sea manned submersible, reaching 7,062m in the Mariana Trench in 2012. Has completed 300+ dives for scientific research, polymetallic nodule surveys, and hydrothermal vent studies. Paved the way for Fendouzhe."
    },
    {
      "id": "SUB-004",
      "name": "Alvin (DSV-2)",
      "type": "Human-occupied vehicle (HOV)",
      "max_depth": "6,500 m",
      "operator": "Woods Hole Oceanographic Institution (WHOI)",
      "country": "USA",
      "year": "1964 (upgraded 2021)",
      "capabilities": "3 crew; upgraded titanium sphere; 2 manipulator arms; HD imaging; 10+ hours bottom time",
      "description": "The most scientifically productive submersible in history with 5,000+ dives. 2021 upgrade increased depth from 4,500m to 6,500m, new titanium sphere, improved lighting and imaging. Discovered hydrothermal vents in 1977."
    },
    {
      "id": "SUB-005",
      "name": "HROV Nereid Under Ice (NUI)",
      "type": "Hybrid remotely operated vehicle",
      "max_depth": "2,000 m (under ice)",
      "operator": "Woods Hole Oceanographic Institution",
      "country": "USA",
      "year": "2014",
      "capabilities": "Autonomous and tethered modes; 20km fiber-optic tether; under-ice navigation; sampling",
      "description": "Designed specifically for under-ice operations in the Arctic and Antarctic. Can operate as both an AUV and ROV, switching modes to explore under ice shelves where conventional tethered vehicles cannot reach."
    },
    {
      "id": "SUB-006",
      "name": "Orpheus",
      "type": "Autonomous underwater vehicle (AUV)",
      "max_depth": "11,000 m",
      "operator": "Woods Hole Oceanographic Institution / NASA JPL",
      "country": "USA",
      "year": "2021",
      "capabilities": "Full ocean depth; visual navigation; autonomous sampling; hadal zone mapping",
      "description": "Developed in collaboration with NASA JPL using technology from Mars rovers. Orpheus is designed to autonomously explore the deepest ocean trenches, using visual-inertial navigation similar to Perseverance rover on Mars. Represents convergence of space and ocean exploration technology."
    },
    {
      "id": "SUB-007",
      "name": "Shenhai Yongshi (深海勇士号)",
      "type": "Human-occupied vehicle (HOV)",
      "max_depth": "4,500 m",
      "operator": "Institute of Deep-sea Science and Engineering, CAS",
      "country": "China",
      "year": "2017",
      "capabilities": "3 crew; lithium battery powered; 2 manipulator arms; low-cost operation",
      "description": "China's 4,500m-class submersible designed for cost-effective operation. Uses domestically produced lithium batteries and titanium alloy hull. Has completed 500+ dives, focusing on South China Sea and Pacific seamount research."
    },
    {
      "id": "SUB-008",
      "name": "ROV Jason",
      "type": "Remotely operated vehicle (ROV)",
      "max_depth": "6,500 m",
      "operator": "Woods Hole Oceanographic Institution",
      "country": "USA",
      "year": "2002 (upgraded continuously)",
      "capabilities": "Tethered; HD imaging; precision sampling; multi-beam sonar; 20+ hour dives",
      "description": "WHOI's primary work-class ROV for deep-sea science. Has explored hydrothermal vents, cold seeps, and under-ice environments worldwide. Equipped with advanced sampling tools, multi-beam sonar for 3D mapping, and real-time video transmission."
    },
    {
      "id": "SUB-009",
      "name": "Kaiko",
      "type": "Remotely operated vehicle (ROV)",
      "max_depth": "11,000 m",
      "operator": "JAMSTEC (Japan Agency for Marine-Earth Science and Technology)",
      "country": "Japan",
      "year": "1995 (original), 2004 (Kaiko 7000 II)",
      "capabilities": "Full ocean depth (original); 7,000m (current); tethered; sampling and imaging",
      "description": "The original Kaiko was the first ROV to reach the bottom of the Challenger Deep (10,911m) in 1995. Lost at sea in 2003, it was replaced by Kaiko 7000 II. JAMSTEC continues to operate deep-diving ROVs for hadal zone research."
    },
    {
      "id": "SUB-010",
      "name": "Boaty McBoatface (Autosub Long Range)",
      "type": "Autonomous underwater vehicle (AUV)",
      "max_depth": "6,000 m",
      "operator": "National Oceanography Centre, UK",
      "country": "UK",
      "year": "2017",
      "capabilities": "Long-range (6,000+ km); weeks-long missions; under-ice capable; multi-sensor",
      "description": "The UK's flagship long-range AUV, famous for its crowd-sourced name. Has completed missions under Antarctic ice shelves, measuring ocean temperature and chemistry. Provides data critical for understanding ocean circulation and climate change."
    },
    {
      "id": "SUB-011",
      "name": "Rainbow Runner",
      "type": "Autonomous underwater vehicle (AUV)",
      "max_depth": "6,000 m",
      "operator": "IFREMER (France)",
      "country": "France",
      "year": "2022",
      "capabilities": "Mid-water and near-bottom survey; modular sensor payload; 24-hour missions",
      "description": "IFREMER's deep-rated AUV for mapping and surveying the abyssal seafloor. Used for polymetallic nodule surveys and hydrothermal vent exploration in the Pacific and Atlantic."
    },
    {
      "id": "SUB-012",
      "name": "Shinkai 6500",
      "type": "Human-occupied vehicle (HOV)",
      "max_depth": "6,500 m",
      "operator": "JAMSTEC",
      "country": "Japan",
      "year": "1991",
      "capabilities": "3 crew; 2 manipulator arms; 8+ hours bottom time; extensive scientific instrumentation",
      "description": "Japan's deepest manned submersible, operational for over 30 years. Has contributed to discoveries of deep-sea life, hydrothermal vent ecosystems, and submarine geology throughout the Pacific. Being replaced by the next-generation DSV12000."
    }
  ],
  "underwater_tech": [
    {
      "id": "UTEC-001",
      "name": "Autonomous Underwater Glider Network",
      "type": "Monitoring",
      "depth_rating": "1,000-6,000 m",
      "description": "Long-endurance buoyancy-driven gliders that profile the water column for months, collecting oceanographic data",
      "organization": "Multiple (Teledyne Webb, Slocum, Seaglider, Spray)",
      "status": "Operational globally; Argo program deploys 4,000+ floats",
      "breakthrough": "Biogeochemical Argo floats now measure pH, oxygen, nitrate, chlorophyll, and irradiance alongside temperature and salinity"
    },
    {
      "id": "UTEC-002",
      "name": "Seafloor Observatory Networks",
      "type": "Monitoring",
      "depth_rating": "Up to 6,000 m",
      "description": "Cabled seafloor observatories providing real-time power and data to ocean bottom instruments",
      "organization": "Ocean Networks Canada (NEPTUNE/VENUS), OOI (USA), DONET (Japan), EMSO (Europe)",
      "status": "Operational; expanding globally",
      "breakthrough": "ONC's NEPTUNE observatory has provided 15+ years of continuous deep-sea monitoring data"
    },
    {
      "id": "UTEC-003",
      "name": "Swarm AUV Systems",
      "type": "Exploration",
      "depth_rating": "3,000-6,000 m",
      "description": "Coordinated fleets of autonomous underwater vehicles that survey large areas collaboratively",
      "organization": "Ocean Infinity, Fugro, Kongsberg",
      "status": "Operational for commercial surveys; expanding to scientific use",
      "breakthrough": "Ocean Infinity's fleet of HUGIN AUVs can survey 1,200+ km² per day autonomously"
    },
    {
      "id": "UTEC-004",
      "name": "Deep-Sea DNA Sequencing (eDNA)",
      "type": "Biological Survey",
      "depth_rating": "Any depth (water sampling)",
      "description": "Environmental DNA sampling and sequencing to detect and identify deep-sea organisms from water samples",
      "organization": "NOAA, MBARI, University of Copenhagen",
      "status": "Rapidly advancing; used in CCZ biodiversity surveys",
      "breakthrough": "eDNA detected 90% more species than visual surveys in CCZ nodule exploration areas"
    },
    {
      "id": "UTEC-005",
      "name": "Pressure-Compensated Electronics",
      "type": "Engineering",
      "depth_rating": "11,000 m",
      "description": "Electronics and batteries that operate at full ocean depth without pressure housings, using oil-filled compensation",
      "organization": "Triton Submarines, WHOI, Deepsea Power & Light",
      "status": "Mature technology; used in most deep-rated vehicles",
      "breakthrough": "Modern pressure-compensated lithium batteries enable full-ocean-depth operation without heavy pressure housings"
    },
    {
      "id": "UTEC-006",
      "name": "Acoustic Communication Networks",
      "type": "Communication",
      "depth_rating": "11,000 m",
      "description": "Underwater acoustic modems and networks for data transmission from deep-sea instruments to surface",
      "organization": "Teledyne Benthos, Evologics, WHOI Micro-Modem",
      "status": "Operational; bandwidth limited to ~10-50 kbps at range",
      "breakthrough": "WHOI micro-modem enables reliable data transmission from 11,000m depth at 5-10 kbps"
    },
    {
      "id": "UTEC-007",
      "name": "Autonomous Surface Vehicles (ASV) for Ocean Mapping",
      "type": "Mapping",
      "depth_rating": "Surface (mapping to 11,000m seafloor)",
      "description": "Uncrewed surface vessels equipped with multibeam sonar for autonomous seafloor mapping",
      "organization": "Saildrone, Ocean Infinity, Fugro",
      "status": "Operational; Saildrone Surveyor mapped 45,000+ km² of Pacific seafloor",
      "breakthrough": "Saildrone Surveyor completed first uncrewed mapping of Aleutian Islands in 2023"
    }
  ]
};
