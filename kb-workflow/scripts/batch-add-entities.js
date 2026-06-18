const fs = require('fs');
const path = require('path');

function addEntitiesToFile(filePath, newEntities) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e.message);
    return 0;
  }
  
  const entities = data.entities || data;
  const before = Array.isArray(entities) ? entities.length : 0;
  
  if (Array.isArray(data)) {
    // Pure array format
    data.push(...newEntities);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return newEntities.length;
  } else if (data.entities) {
    // Object with entities array
    data.entities.push(...newEntities);
    data.last_updated = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return newEntities.length;
  }
  return 0;
}

// === GENE THERAPIES - New entities from AnySearch ===
const newGeneTherapies = [
  {
    id: "GT-kresladi-lad1",
    target_genes: ["ITGB2"],
    target_diseases: ["Leukocyte Adhesion Deficiency Type I", "LAD-I"],
    therapy_type: "gene_replacement",
    therapy_types: ["gene_replacement"],
    development_stage: "approved",
    companies: ["Rocket Pharmaceuticals"],
    vectors: ["lentiviral vector", "ex vivo HSC modification"],
    key_findings: [
      "FDA approved Kresladi (marnetegragene autotemcel) on March 26, 2026 — first gene therapy for severe LAD-I",
      "Uses patient's own hematopoietic stem cells modified to introduce functional ITGB2 gene copies",
      "Restores CD18 and CD11a cell surface expression in white blood cells including neutrophils",
      "Granted Orphan Drug, Rare Pediatric Disease, Regenerative Medicine Advanced Therapy, and Fast Track designations"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://www.fda.gov/news-events/press-announcements/fda-approves-first-gene-therapy-severe-leukocyte-adhesion-deficiency-type-i", collected_at: new Date().toISOString() }],
    confidence: { level: "high", score: 70, source_count: 1, last_validated: new Date().toISOString() },
    first_seen: new Date().toISOString(),
    last_updated: new Date().toISOString()
  },
  {
    id: "GT-cps1-crispr-personalized",
    target_genes: ["CPS1"],
    target_diseases: ["CPS1 deficiency", "urea cycle disorder"],
    therapy_type: "CRISPR_editing",
    therapy_types: ["CRISPR_editing", "base_editing"],
    development_stage: "clinical",
    companies: ["CHOP", "University of Pennsylvania", "IGI"],
    vectors: ["lipid nanoparticles"],
    key_findings: [
      "First personalized in vivo CRISPR therapy for an infant with CPS1 deficiency — developed in just 6 months",
      "LNP-delivered CRISPR base editing therapy administered via IV infusion with no adverse effects across 3 doses",
      "Named Nature's 2025 Breakthrough of the Year for systemic personalized gene-editing therapy",
      "Acuitas LNP formulation (ALC-0307) validated for next-generation gene-editing delivery"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://innovativegenomics.org/news/crispr-clinical-trials-2025/", collected_at: new Date().toISOString() }],
    confidence: { level: "high", score: 65, source_count: 3, last_validated: new Date().toISOString() },
    first_seen: new Date().toISOString(),
    last_updated: new Date().toISOString()
  },
  {
    id: "GT-novaiscB-compact",
    target_genes: [],
    target_diseases: ["genetic disorders"],
    therapy_type: "CRISPR_editing",
    therapy_types: ["CRISPR_editing"],
    development_stage: "preclinical",
    companies: ["MIT McGovern Institute", "Broad Institute"],
    vectors: ["AAV"],
    key_findings: [
      "NovaIscB: compact RNA-guided enzyme re-engineered from bacteria, 1/3 the size of Cas9",
      "Over 100x more active in human cells than original IscB, with good specificity",
      "Small enough to fit in a single AAV vector — solving delivery challenge of bulkier Cas9 tools",
      "OMEGAoff tool created from NovaIscB demonstrated lasting cholesterol reduction in mice via AAV delivery"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://news.mit.edu/2025/rationale-engineering-generates-compact-new-tool-gene-therapy-0528", collected_at: new Date().toISOString() }],
    confidence: { level: "medium", score: 40, source_count: 1, last_validated: new Date().toISOString() },
    first_seen: new Date().toISOString(),
    last_updated: new Date().toISOString()
  },
  {
    id: "GT-intellia-ttr-phase3",
    target_genes: ["TTR"],
    target_diseases: ["hereditary transthyretin amyloidosis", "ATTR"],
    therapy_type: "CRISPR_editing",
    therapy_types: ["CRISPR_editing"],
    development_stage: "clinical",
    companies: ["Intellia Therapeutics", "Regeneron"],
    vectors: ["lipid nanoparticles"],
    key_findings: [
      "NTLA-2001 global Phase III trial initiated January 2025, dosing 40 participants with higher-dose treatment",
      "Intellia hopes to have the treatment commercially available in 2027 pending positive Phase III results",
      "First participant dosed in Phase III in January 2025",
      "Prior Phase I data showed >90% serum TTR reduction with single dose"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://innovativegenomics.org/news/crispr-clinical-trials-2025/", collected_at: new Date().toISOString() }],
    confidence: { level: "high", score: 55, source_count: 3, last_validated: new Date().toISOString() },
    first_seen: new Date().toISOString(),
    last_updated: new Date().toISOString()
  },
  {
    id: "GT-casgevy-expanded",
    target_genes: ["BCL11A"],
    target_diseases: ["sickle cell disease", "beta-thalassemia"],
    therapy_type: "CRISPR_editing",
    therapy_types: ["CRISPR_editing"],
    development_stage: "approved",
    companies: ["CRISPR Therapeutics", "Vertex Pharmaceuticals"],
    vectors: ["ex vivo electroporation"],
    key_findings: [
      "As of spring 2025, CASGEVY approved in US, UK, EU, Switzerland, Canada, Bahrain, Saudi Arabia, UAE",
      "16 of 17 SCD patients free of vaso-occlusive crises; 25 of 27 TDT patients no longer transfusion dependent",
      "50 active treatment sites opened across North America, EU, and Middle East",
      "Medicaid and NHS reimbursement arrangements progressing"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://innovativegenomics.org/news/crispr-clinical-trials-2025/", collected_at: new Date().toISOString() }],
    confidence: { level: "high", score: 70, source_count: 5, last_validated: new Date().toISOString() },
    first_seen: new Date().toISOString(),
    last_updated: new Date().toISOString()
  }
];

// === QUANTUM COMPUTING - New entities ===
const newQuantumProcessors = [
  {
    id: "QP-ibm-nighthawk",
    name: "IBM Quantum Nighthawk",
    type: "superconducting",
    qubits: 120,
    company: "IBM",
    key_features: ["120 qubits with 218 next-gen tunable couplers", "20% more couplers than Heron", "30% more circuit complexity", "Up to 5000 two-qubit gates", "Expected 7500 gates by end 2026"],
    status: "announced",
    year: 2025,
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://newsroom.ibm.com/2025-11-12-ibm-delivers-new-quantum-processors", collected_at: new Date().toISOString() }]
  },
  {
    id: "QP-ibm-loon",
    name: "IBM Quantum Loon",
    type: "superconducting",
    qubits: null,
    company: "IBM",
    key_features: ["Experimental processor demonstrating all key components for fault-tolerant QC", "Multi-layer routing for long-range on-chip connections (c-couplers)", "Real-time classical error decoding <480ns using qLDPC codes", "Achieved 1 year ahead of schedule"],
    status: "experimental",
    year: 2025,
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://newsroom.ibm.com/2025-11-12-ibm-delivers-new-quantum-processors", collected_at: new Date().toISOString() }]
  },
  {
    id: "QP-ms-majorana1",
    name: "Microsoft Majorana 1",
    type: "topological",
    qubits: null,
    company: "Microsoft",
    key_features: ["World's first topological qubit chip", "Uses Majorana zero modes for inherently protected quantum information", "Completely different approach from superconducting/transmon qubits"],
    status: "announced",
    year: 2025,
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://www.networkworld.com/article/4088709/top-quantum-breakthroughs-of-2025.html", collected_at: new Date().toISOString() }]
  },
  {
    id: "QP-amazon-ocelot",
    name: "Amazon Ocelot",
    type: "hybrid_cat_transmon",
    qubits: null,
    company: "Amazon",
    key_features: ["Unique hybrid approach combining cat qubits with transmon qubits", "Built-in error correction at hardware level"],
    status: "announced",
    year: 2025,
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://www.networkworld.com/article/4088709/top-quantum-breakthroughs-of-2025.html", collected_at: new Date().toISOString() }]
  },
  {
    id: "QP-quantware-vio40k",
    name: "QuantWare VIO-40K",
    type: "superconducting",
    qubits: 10000,
    company: "QuantWare",
    key_features: ["10,000 qubit QPU — 100x larger than anything available today", "VIO 3D scaling architecture with chiplet modules", "40,000 input-output lines", "Compatible with NVIDIA NVQLink for hybrid quantum-classical computing", "Kilofab industrial-scale QPU fab opening 2026"],
    status: "announced",
    year: 2025,
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://quantware.com/news/quantware-announces-scaling-breakthrough-with-vio-40k", collected_at: new Date().toISOString() }]
  },
  {
    id: "QP-psiqphotonic",
    name: "PsiQuantum Photonic Processor",
    type: "photonic",
    qubits: null,
    company: "PsiQuantum",
    key_features: ["Photonic quantum processor unveiled February 2025", "Uses photons as qubits for room-temperature operation potential"],
    status: "announced",
    year: 2025,
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://www.networkworld.com/article/4088709/top-quantum-breakthroughs-of-2025.html", collected_at: new Date().toISOString() }]
  }
];

// === NUCLEAR ENERGY - New entities ===
const newNuclearEntities = [
  {
    id: "NE-tva-bwrx300",
    name: "TVA Clinch River BWRX-300",
    type: "SMR",
    company: "TVA / GE Vernova Hitachi",
    power_mwe: 300,
    status: "funded",
    key_findings: [
      "DOE awarded $400M to TVA for BWRX-300 deployment at Clinch River site, East Tennessee",
      "First-of-a-kind SMR project in the US with specific utility, site, and reactor design identified",
      "Initial operations projected for early 2030s"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://world-nuclear-news.org/articles/us-federal-funds-awarded-to-spur-smr-deployment", collected_at: new Date().toISOString() }]
  },
  {
    id: "NE-holtec-smr300",
    name: "Holtec SMR-300 Pioneer",
    type: "SMR",
    company: "Holtec Government Services",
    power_mwe: 300,
    status: "funded",
    key_findings: [
      "DOE awarded $400M for two SMR-300 reactors (Pioneer 1 & 2) at Palisades site, Michigan",
      "Part of DOE's Gen III+ SMR Pathway to Deployment Program"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://world-nuclear-news.org/articles/us-federal-funds-awarded-to-spur-smr-deployment", collected_at: new Date().toISOString() }]
  },
  {
    id: "NE-helion-orion",
    name: "Helion Energy Orion",
    type: "fusion_FRC",
    company: "Helion Energy",
    power_mwe: 50,
    status: "under_construction",
    key_findings: [
      "Building Orion fusion power plant in Malaga, Washington",
      "PPA with Microsoft to supply 50MW electricity by 2029",
      "Polaris prototype reached 150 million degrees C",
      "First privately developed fusion machine to demonstrate D-T fusion",
      "Direct electricity recovery claimed at >95% efficiency (skipping thermal cycle)",
      "Backed by Sam Altman (OpenAI CEO)"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://www.scientificamerican.com/article/helion-energy-is-building-a-fusion-power-plant-can-its-technology-deliver/", collected_at: new Date().toISOString() }]
  },
  {
    id: "NE-cfs-sparc-virginia",
    name: "Commonwealth Fusion Systems Virginia Plant",
    type: "fusion_tokamak",
    company: "Commonwealth Fusion Systems",
    power_mwe: null,
    status: "zoning_approved",
    key_findings: [
      "Secured zoning approval in Virginia for $2.5B commercial fusion plant",
      "First commercial fusion plant to receive such approval",
      "Uses high-temperature superconducting (HTS) magnets for compact tokamak design"
    ],
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://www.dsireinsight.com/blog/2026/1/8/2025-in-review-navigating-the-advanced-nuclear-landscape", collected_at: new Date().toISOString() }]
  }
];

// === BRAIN SCIENCE - New entities ===
const newBrainEntities = [
  {
    id: "BS-china-bci-clinical",
    name: "CAS CEBSIT Invasive BCI",
    type: "BCI",
    company: "Chinese Academy of Sciences / Huashan Hospital Fudan",
    key_findings: [
      "China's first-in-human invasive BCI clinical trial — second country after US",
      "Implant 26mm diameter, <6mm thick — half the size of Neuralink N1",
      "Ultra-flexible electrodes ~1% diameter of human hair, minimizing tissue damage",
      "Patient (quadriamputee from electrical accident) can play chess and racing games using mind",
      "Device stable since March 2025 implantation, no infection or electrode failure",
      "Target market entry 2028 after regulatory approval"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://english.cas.cn/newsroom/cas_media/202506/t20250616_1045625.shtml", collected_at: new Date().toISOString() }]
  },
  {
    id: "BS-65536-electrode-bci",
    name: "65,536-Electrode Wireless Subdural BCI",
    type: "BCI",
    company: "Nature Electronics research team",
    key_findings: [
      "50μm-thick flexible micro-ECoG BCI with 256×256 electrode array",
      "65,536 recording electrodes, 1,024 simultaneous channels",
      "Wirelessly powered, bidirectional communication with external relay",
      "Chronic recordings: 2 weeks in pigs, 2 months in behaving NHPs",
      "Published in Nature Electronics December 2025"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://www.nature.com/articles/s41928-025-01509-9", collected_at: new Date().toISOString() }]
  },
  {
    id: "BS-als-bci-independent",
    name: "Long-term Independent Intracortical BCI for ALS",
    type: "BCI",
    company: "Research team (bioRxiv preprint)",
    key_findings: [
      "ALS patient used multimodal BCI independently at home for 19 months, 3800+ hours",
      "Communicated 183,060 sentences (1.96M words) at 56.1 words/minute average",
      "99.2% word accuracy in prompted task (125,000 word vocabulary)",
      "Transformer-based brain-to-text decoder outperformed prior RNN models",
      "Participant maintained full-time employment despite paralysis"
    ],
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://www.biorxiv.org/content/10.1101/2025.06.26.661591v1", collected_at: new Date().toISOString() }]
  },
  {
    id: "BS-bdbci-walking",
    name: "Bidirectional BCI for Walking Exoskeleton",
    type: "BCI",
    company: "UC Irvine / Rancho Los Amigos",
    key_findings: [
      "First bidirectional BCI restoring both brain-controlled walking AND leg sensory feedback",
      "Uses bilateral interhemispheric ECoG implants over leg M1/S1 cortices",
      "All operations executed on portable embedded system — fully untethered",
      "Demonstrated in epilepsy patient 3 weeks post-implantation"
    ],
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://arxiv.org/html/2505.00219", collected_at: new Date().toISOString() }]
  }
];

// === DEEP SEA TECH - New entities ===
const newDeepSeaEntities = [
  {
    id: "DS-trump-eo-seabed",
    name: "US Executive Order 14285 - Seabed Mineral Exploration",
    type: "policy",
    company: "US Government",
    key_findings: [
      "April 24, 2025: President signed EO 14285 advancing US leadership in seabed mineral exploration",
      "Major policy shift accelerating deep-sea mining in US waters and international seabed",
      "ISA still drafting Mining Code for exploitation regulations"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://oceanservice.noaa.gov/deep-seabed-mineral-resources/deep-seabed-mining/", collected_at: new Date().toISOString() }]
  },
  {
    id: "DS-ccz-nodule-trial",
    name: "CCZ Polymetallic Nodule Collector Trial",
    type: "mining_technology",
    company: "Multiple (ISA oversight)",
    key_findings: [
      "Deep-sea (4500m) trial of pre-prototype nodule collector with independent scientific monitoring",
      "Gravity current formed behind collector, traveled 500m downslope",
      "Suspended particle concentration 4 orders of magnitude above ambient at 50m",
      "Most plume remained close to seafloor, reaching background at 50m altitude",
      "MM-scale photogrammetric reconstruction showed ~3cm redeposited sediment, 5cm erosional depth"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11785793/", collected_at: new Date().toISOString() }]
  }
];

// === SPACE/EXO SCIENCE - New entities ===
const newExoEntities = [
  {
    id: "EX-toi199b-methane",
    name: "TOI-199 b",
    type: "exoplanet",
    key_findings: [
      "Saturn-sized exoplanet with Earth-like temperature (~175°F / ~80°C)",
      "First temperate giant exoplanet with atmosphere analyzed in detail by JWST",
      "Atmosphere rich in methane — first confirmation of theoretical predictions for temperate gas giants",
      "Hints of ammonia and CO2 also detected",
      "330+ light-years from Earth, ~100-day orbital period"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://phys.org/news/2026-05-saturn-sized-exoplanet-earth-temperature.html", collected_at: new Date().toISOString() }]
  },
  {
    id: "EX-gj3378b-revised",
    name: "GJ 3378 b",
    type: "exoplanet",
    key_findings: [
      "Revised: 2.3±0.4 Earth masses (down from 5.26), 21.45-day orbit (down from 24.73)",
      "Still within conservative habitable zone of nearby M4V star (7.7 pc away)",
      "Reduced mass increases likelihood of terrestrial composition",
      "Near the 'cosmic shoreline' where atmospheric stripping may occur"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://astrobiology.com/2026/05/a-revised-mass-and-period-for-the-habitable-zone-super-earth-gj-3378b.html", collected_at: new Date().toISOString() }]
  },
  {
    id: "EX-2025-exoplanets",
    name: "2025 Exoplanet Discoveries Summary",
    type: "discovery_milestone",
    key_findings: [
      "217 new exoplanets discovered in 2025",
      "10 potentially habitable worlds identified",
      "LHS 1140 b highlighted as prime habitability candidate orbiting red dwarf"
    ],
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://www.facebook.com/SETIInstitute/posts/217-exoplanets-10-potentially-habitable-worlds", collected_at: new Date().toISOString() }]
  }
];

// === NEW ENERGY - New entities ===
const newEnergyEntities = [
  {
    id: "NE-solar-battery-hydrogen",
    name: "Solar Battery On-Demand Hydrogen",
    type: "storage_technology",
    company: "Ulm University / Friedrich Schiller University Jena",
    key_findings: [
      "Water-soluble copolymer stores solar energy for days, releases hydrogen on demand",
      "Charging efficiency >80%, hydrogen release efficiency 72%",
      "Works in the dark — does not depend on sunlight at time of release",
      "Reversible via pH switch, multiple charging/storage/catalysis cycles",
      "Published in Nature Communications 2026"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://www.chemgeo.uni-jena.de/en/65307/solar-battery-delivers-hydrogen-from-solar-energy-at-the-push-of-a-button", collected_at: new Date().toISOString() }]
  }
];

// === LIFE SCIENCE - New entities ===
const newLifeScienceEntities = [
  {
    id: "LS-izpisua-aging-reversal",
    name: "Partial Epigenetic Reprogramming (Izpisua)",
    type: "longevity_technology",
    company: "Altos Labs",
    key_findings: [
      "Aging defined as 'loss of identity at cellular level' — epithelial-mesenchymal transition (EMT)",
      "Blood proteins linked to EMT most strongly associated with mortality in UK Biobank analysis",
      "Partial cellular reprogramming (2 days/week) extends lifespan in mice",
      "Reverses liver and metabolic damage, regenerates damaged muscle",
      "7000+ mice treated with no embryonic cell differentiation observed",
      "Ex vivo reprogramming of donated human organs planned with Hospital Clínic de Barcelona"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://english.elpais.com/science-tech/2026-05-25/longevity-researcher-juan-carlos-izpisua-presents-latest-data-on-aging-process.html", collected_at: new Date().toISOString() }]
  },
  {
    id: "LS-universal-aging-clocks",
    name: "Universal Transcriptomic Aging Clocks",
    type: "longevity_technology",
    company: "Harvard Medical School / Brigham and Women's Hospital",
    key_findings: [
      "Analyzed 11,000+ transcriptomes across mice, rats, monkeys, and humans",
      "Biological hallmarks of aging highly conserved across species and tissues",
      "Same genes associated with aging in liver and heart across rats and humans",
      "TACO (Transcriptomic Age Calculator Online) tool developed for age prediction",
      "Published in Nature May 2026"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://www.scientificamerican.com/article/universal-aging-clocks-offer-new-clues-to-longevity/", collected_at: new Date().toISOString() }]
  },
  {
    id: "LS-life-bio-epigenetic-reprogramming",
    name: "Life Biosciences Partial Epigenetic Reprogramming",
    type: "longevity_technology",
    company: "Life Biosciences",
    key_findings: [
      "Preclinical data shows cross-system therapeutic impact of partial epigenetic reprogramming",
      "Human trials planned for 2026 for gene therapy to reverse cellular aging",
      "Boston-based company targeting tissue function restoration"
    ],
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://observer.com/2025/10/this-longevity-startup-is-bringing-anti-aging-gene-therapy-to-human-trials/", collected_at: new Date().toISOString() }]
  }
];

// === ROBOT PARTS - New entities ===
const newRobotEntities = [
  {
    id: "RP-ct21x-gan-encoder",
    name: "CT-Unite CT-21X GaN Magnetic Encoder",
    type: "chip",
    company: "CT-Unite",
    key_findings: [
      "China's first GaN-based magnetic encoder chip for humanoid robot joints",
      "Stable operation at 180°C, peak tolerance 250-400°C",
      "Angular accuracy 30-100 arcseconds, thermal drift 0.01-0.03°/°C",
      "21-bit ultra-high-resolution ADC, angular error ±0.1°",
      "Response latency <2μs, bandwidth 1-5 MHz, up to 300,000 rpm",
      "Improves trajectory control accuracy from ±0.2mm to ±0.05mm",
      "Mass production expected Q3 2026"
    ],
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://www.trendforce.com/news/2026/05/04/news-china-unveils-first-gan-magnetic-encoder-chip-for-humanoid-robot-joints/", collected_at: new Date().toISOString() }]
  },
  {
    id: "RP-intel-core-ultra-s3",
    name: "Intel Core Ultra Series 3",
    type: "chip",
    company: "Intel",
    key_findings: [
      "Edge AI robotics compute platform combining CPU, GPU, and NPU on one SoC",
      "Replaces bulky discrete GPUs in robots — reduced heat and cost",
      "Powers Ella service robot (200 drinks/hour) with 3 concurrent AI agents",
      "Adopted by Trossen Robotics, Circulus (Korea), Oversonic (Italy)",
      "Debuted at Computex 2026"
    ],
    sources: [{ source_type: "web", source_credibility: "A", article_url: "https://newsroom.intel.com/artificial-intelligence/intel-core-ultra-series-3-for-edge-ai-robotics", collected_at: new Date().toISOString() }]
  },
  {
    id: "RP-honpine-hpjm",
    name: "HONPINE HPJM Integrated Joint Module",
    type: "actuator",
    company: "HONPINE",
    key_findings: [
      "Deep integration of 6 core components into single compact unit",
      "50+ different joint module specifications for flexible development",
      "Hollow-shaft routing with 31.5mm bore in 120mm outer diameter",
      "24-bit dual-encoder with multi-turn absolute power-loss memory",
      "Salient-pole magnetic circuit permanent magnet brake design"
    ],
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://www.honpine.com/news/Company-News/-Next-Generation-Humanoid-Robot-Joint-Design-HONPINE-HPJM-with-Harmonic-Drive-Hollow-Shaft-and-Integrated-Encoder-Module.html", collected_at: new Date().toISOString() }]
  }
];

// === TCM - New entities ===
const newTCMEntities = [
  {
    id: "TCM-shizhengpt",
    name: "ShizhenGPT",
    type: "AI_TCM_platform",
    company: "Research team",
    key_findings: [
      "First multimodal LLM tailored for Traditional Chinese Medicine",
      "Largest TCM dataset: 100GB+ text, 200GB+ multimodal data (1.2M images, 200h audio)",
      "Integrates observation, listening, smelling, and pulse-taking diagnostics",
      "Outperforms comparable-scale LLMs on TCM tasks",
      "Leads in TCM visual understanding among multimodal LLMs"
    ],
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://ar5iv.labs.arxiv.org/html/2508.14706", collected_at: new Date().toISOString() }]
  },
  {
    id: "TCM-szbc-ai4tcm",
    name: "SZBC-AI4TCM Platform",
    type: "AI_TCM_platform",
    company: "Tasly / research team",
    key_findings: [
      "Comprehensive web-based computing platform for TCM research",
      "Integrates AI algorithms and bioinformatics tools",
      "Embodying 'ShuZhiBenCao' (Digital Herbal) concept",
      "Publicly accessible at ai.tasly.com",
      "Supports data mining, drug screening, and mechanism analysis"
    ],
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://www.frontiersin.org/journals/pharmacology/articles/10.3389/fphar.2025.1698202/full", collected_at: new Date().toISOString() }]
  }
];

// === SPACE MINING - New entities ===
const newSpaceMiningEntities = [
  {
    id: "SM-astroforge-odin",
    name: "AstroForge Odin Mission",
    type: "space_mining_mission",
    company: "AstroForge",
    key_findings: [
      "Launched Odin module February 2025 — first company to receive asteroid mining license",
      "Target: near-Earth asteroid 2022 OB5 (~100m across, thought to be metallic)",
      "Flyby planned ~300 days after launch to assess metallic composition",
      "If confirmed, 2022 OB5 becomes prime target for future mining missions"
    ],
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://www.aveva.com/en/our-industrial-life/type/article/building-an-economy-in-space-with-asteroid-mining/", collected_at: new Date().toISOString() }]
  },
  {
    id: "SM-karmanplus",
    name: "Karman+ Asteroid Mining",
    type: "space_mining_company",
    company: "Karman+",
    key_findings: [
      "Raised $20M seed funding February 2025 for asteroid mining",
      "Focus on hydrated mineral asteroids for water extraction (vs AstroForge's precious metals)",
      "First mission proposed for 2027 — kilogram-scale material excavation",
      "Asteroid-derived water to serve as spacecraft fuel (hydrogen/oxygen)"
    ],
    sources: [{ source_type: "web", source_credibility: "B", article_url: "https://thespacereview.com/article/4955/1", collected_at: new Date().toISOString() }]
  }
];

// Now write all entities
const writes = [
  { path: '/home/z/my-project/genetech-tools/knowledge-base/entities/gene_therapies.json', entities: newGeneTherapies },
  { path: '/home/z/my-project/quantum-computing/knowledge-base/entities/processors.json', entities: newQuantumProcessors },
  { path: '/home/z/my-project/nuclear-energy/knowledge-base/entities/smr.json', entities: newNuclearEntities },
  { path: '/home/z/my-project/brain-science/knowledge-base/entities/bci.json', entities: newBrainEntities },
  { path: '/home/z/my-project/deep-sea-tech/knowledge-base/entities/deep_sea_resources.json', entities: newDeepSeaEntities },
  { path: '/home/z/my-project/exo-science/knowledge-base/entities/exoplanets.json', entities: newExoEntities },
  { path: '/home/z/my-project/new-energy/knowledge-base/entities/storage.json', entities: newEnergyEntities },
  { path: '/home/z/my-project/life-science/knowledge-base/entities/longevity.json', entities: newLifeScienceEntities },
  { path: '/home/z/my-project/robot-parts/knowledge-base/entities/chips.json', entities: newRobotEntities },
  { path: '/home/z/my-project/tcm-tools/knowledge-base/entities/herbs.json', entities: newTCMEntities },
  { path: '/home/z/my-project/alien-minerals/knowledge-base/entities/mining_tech.json', entities: newSpaceMiningEntities },
];

let totalAdded = 0;
for (const w of writes) {
  try {
    const added = addEntitiesToFile(w.path, w.entities);
    console.log(`✅ ${path.basename(w.path)}: +${added} entities`);
    totalAdded += added;
  } catch (e) {
    console.error(`❌ ${w.path}: ${e.message}`);
  }
}

console.log(`\n📊 Total new entities added: ${totalAdded}`);
