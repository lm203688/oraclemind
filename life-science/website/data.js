const DB = {
  "updated": "2026-05-29T02:27:01.447Z",
  "stats": {
    "bioethics": 3,
    "bioinformatics": 3,
    "biotech_tools": 5,
    "longevity_tech": 8,
    "regenerative_medicine": 4,
    "synthetic_biology": 8
  },
  "bioethics": [
    {
      "id": "BETH-001",
      "name": "Human Germline Editing Moratorium",
      "topic": "Gene editing ethics",
      "description": "International consensus against heritable human genome editing until safety and societal implications are resolved. He Jiankui's 2018 CRISPR babies violated this consensus.",
      "controversy": "Potential to eliminate genetic diseases vs. risk of eugenics, unintended consequences, and inequality",
      "regulation": "73 countries ban or restrict heritable genome editing; WHO global governance framework (2021)"
    },
    {
      "id": "BETH-002",
      "name": "Synthetic Biology Biosecurity",
      "topic": "Dual-use research",
      "description": "The same tools that enable beneficial synthetic biology (DNA synthesis, gene editing) could be used to create harmful pathogens. DNA screening and biosecurity frameworks are evolving.",
      "controversy": "Open science vs. security; democratization of biotech increases both innovation and risk",
      "regulation": "US DNA synthesis screening guidelines (2024); HHS Tier 1 select agent oversight; IBBS international biosecurity"
    },
    {
      "id": "BETH-003",
      "name": "Longevity Inequality",
      "topic": "Social justice",
      "description": "If anti-aging therapies work, they may initially be available only to the wealthy, exacerbating health and lifespan inequality.",
      "controversy": "Life extension as a human right vs. luxury good; who pays for longevity treatments?",
      "regulation": "No specific regulation; Medicare/insurance coverage debates will intensify as therapies emerge"
    }
  ],
  "bioinformatics": [
    {
      "id": "BINF-001",
      "name": "Single-Cell Multi-Omics",
      "type": "Analytical platform",
      "description": "Simultaneously measuring multiple molecular layers (genome, epigenome, transcriptome, proteome) in individual cells. Reveals cellular heterogeneity at unprecedented resolution.",
      "application": "Cancer heterogeneity, immune cell profiling, developmental biology, drug resistance",
      "tool": "10x Genomics Multiome, Parse Biosciences, BD Rhapsody"
    },
    {
      "id": "BINF-002",
      "name": "Long-Read Sequencing (PacBio/Oxford Nanopore)",
      "type": "Sequencing technology",
      "description": "Reading DNA sequences >10,000 bases in a single read, resolving repetitive regions, structural variants, and epigenetic modifications that short-read sequencing misses.",
      "application": "Complete genome assembly, structural variant detection, direct RNA sequencing, methylation detection",
      "tool": "PacBio Revio, Oxford Nanopore PromethION"
    },
    {
      "id": "BINF-003",
      "name": "AI-Driven Drug Discovery",
      "type": "Computational drug design",
      "description": "Using machine learning to predict drug-target interactions, optimize lead compounds, and design novel molecules. Dramatically reduces drug development time and cost.",
      "application": "De novo drug design, virtual screening, ADMET prediction, clinical trial optimization",
      "tool": "Insilico Medicine, Recursion, Exscientia, Absci"
    }
  ],
  "biotech_tools": [
    {
      "id": "BTOOL-001",
      "name": "AlphaFold / AlphaFold3",
      "type": "Protein structure prediction",
      "description": "DeepMind's AI that predicts 3D protein structures from amino acid sequences. AlphaFold2 solved the 50-year protein folding problem; AlphaFold3 predicts protein-ligand, DNA, RNA interactions.",
      "application": "Drug design, enzyme engineering, understanding disease mutations",
      "developer": "Google DeepMind / Isomorphic Labs"
    },
    {
      "id": "BTOOL-002",
      "name": "CRISPR-Cas13 (RNA Editing)",
      "type": "Gene editing tool",
      "description": "Targets RNA instead of DNA, enabling transient gene regulation without permanent genome changes. Safer for therapeutic use as effects are reversible.",
      "application": "Viral infection, RNA splicing disorders, transient gene knockdown",
      "developer": "Astellas (acquired Editas RNA program), Aera Therapeutics"
    },
    {
      "id": "BTOOL-003",
      "name": "Base Editing",
      "type": "Gene editing tool",
      "description": "Precise single-nucleotide changes without double-strand breaks. Converts C→T or A→G with minimal off-target effects. Verve Therapeutics using base editing to permanently lower cholesterol.",
      "application": "Point mutation diseases, cardiovascular risk reduction, sickle cell disease",
      "developer": "Beam Therapeutics, Verve Therapeutics, Prime Medicine"
    },
    {
      "id": "BTOOL-004",
      "name": "Prime Editing",
      "type": "Gene editing tool",
      "description": "Search-and-replace genome editing that can make any small edit (substitutions, insertions, deletions) without double-strand breaks or donor DNA templates.",
      "application": "Precise correction of disease-causing mutations",
      "developer": "Prime Medicine (IPO 2022); David Liu lab (Broad Institute)"
    },
    {
      "id": "BTOOL-005",
      "name": "Spatial Transcriptomics",
      "type": "Analytical tool",
      "description": "Measuring gene expression while preserving spatial location in tissue. Reveals cellular neighborhoods and tissue organization at unprecedented resolution.",
      "application": "Cancer microenvironment, brain cell atlas, developmental biology",
      "developer": "10x Genomics (Visium, Xenium), Vizgen (MERFISH), NanoString (CosMx)"
    }
  ],
  "longevity": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:44:16.574Z",
    "description": "长寿科技库",
    "entities": [
      {
        "id": "LG-001",
        "name": "NAD+补充",
        "type": "代谢调节",
        "mechanism": "提升NAD+水平",
        "clinical_stage": "II期",
        "potential": "中等"
      },
      {
        "id": "LG-002",
        "name": "雷帕霉素",
        "type": "mTOR抑制",
        "mechanism": "抑制mTOR通路",
        "clinical_stage": "I期",
        "potential": "高"
      },
      {
        "id": "LG-003",
        "name": "二甲双胍",
        "type": "代谢调节",
        "mechanism": "AMPK激活",
        "clinical_stage": "III期",
        "potential": "中等"
      },
      {
        "id": "LG-004",
        "name": "表观遗传重编程",
        "type": "细胞重编程",
        "mechanism": "Yamanaka因子",
        "clinical_stage": "临床前",
        "potential": "极高"
      },
      {
        "id": "LG-005",
        "name": "衰老细胞清除",
        "type": "细胞治疗",
        "mechanism": "杀衰老细胞",
        "clinical_stage": "I期",
        "potential": "高"
      }
    ]
  },
  "longevity_tech": [
    {
      "id": "LONG-001",
      "name": "Senolytics",
      "type": "Anti-aging therapy",
      "description": "Drugs that selectively kill senescent ('zombie') cells that accumulate with age and drive inflammation and tissue dysfunction.",
      "mechanism": "Dasatinib + quercetin, fisetin, navitoclax - induce apoptosis in senescent cells",
      "status": "Clinical trials; Unity Biotechnology's UBX1325 in Phase 2 for age-related eye disease",
      "developer": "Unity Biotechnology, Oisín Biotechnologies, Mayo Clinic"
    },
    {
      "id": "LONG-002",
      "name": "NAD+ Repletion",
      "type": "Metabolic enhancement",
      "description": "Boosting NAD+ levels (critical coenzyme that declines with age) through precursors like NMN and NR. Shown to improve mitochondrial function and metabolism in mice.",
      "mechanism": "NMN (nicotinamide mononucleotide) or NR (nicotinamide riboside) supplementation boosts NAD+ levels",
      "status": "NMN/NR supplements widely available; clinical trials ongoing; FDA challenged NMN as supplement in 2023",
      "developer": "ChromaDex (NR), Metro Biotech (NMN), Elysium Health"
    },
    {
      "id": "LONG-003",
      "name": "mTOR Inhibition (Rapamycin)",
      "type": "Drug-based longevity",
      "description": "Rapamycin inhibits mTOR, a master growth regulator. In mice, rapamycin extends lifespan 25%+ even when started late in life. The most robust life-extension drug in mammals.",
      "mechanism": "Inhibits mTORC1, reducing protein synthesis and increasing autophagy; mimics dietary restriction",
      "status": "Off-label use growing; dog longevity trials (RAPID, TRUTH); human trials planned",
      "developer": "ResTORbio (now part of EQRx), AgelessRx, University of Washington"
    },
    {
      "id": "LONG-004",
      "name": "Epigenetic Reprogramming (Yamanaka Factors)",
      "type": "Cellular rejuvenation",
      "description": "Partial reprogramming using OSKM (Oct4, Sox2, Klf4, Myc) factors to reverse epigenetic age without dedifferentiating cells to pluripotency. The most exciting rejuvenation approach.",
      "mechanism": "Cyclic expression of Yamanaka factors resets epigenetic marks, restoring youthful gene expression patterns",
      "status": "Altos Labs ($3B funded); Turn Biotechnologies; in vivo mouse studies show rejuvenation of multiple tissues",
      "developer": "Altos Labs, Turn Bio, AgeX, Ovelle Therapeutics"
    },
    {
      "id": "LONG-005",
      "name": "Metformin (TAME Study)",
      "type": "Drug-based longevity",
      "description": "The diabetes drug metformin is associated with reduced all-cause mortality in diabetics vs non-diabetics. The TAME (Targeting Aging with Metformin) study aims to prove aging can be treated as a condition.",
      "mechanism": "Activates AMPK, inhibits mitochondrial complex I, reduces inflammation and insulin/IGF-1 signaling",
      "status": "TAME study funded ($65M+); enrolling 3,000+ participants aged 65-79; results expected 2026-2028",
      "developer": "AFAR (American Federation for Aging Research), Nir Barzilai (Einstein)"
    },
    {
      "id": "LONG-006",
      "name": "Telomere Extension",
      "type": "Genomic stability",
      "description": "Extending telomeres (protective chromosome caps that shorten with each cell division) to delay cellular senescence. Short telomeres are a hallmark of aging.",
      "mechanism": "Telomerase gene therapy (AAV-TERT) or transient mRNA delivery of TERT",
      "status": "BioViva CEO received telomerase gene therapy (2015, unverified); Libella Gene Therapeutics clinical trial in Colombia; no FDA-approved treatment",
      "developer": "BioViva, Libella Gene Therapeutics, Sierra Sciences"
    },
    {
      "id": "LONG-007",
      "name": "Growth Differentiation Factor 11 (GDF11)",
      "type": "Parabiosis-derived factor",
      "description": "A circulating protein that declines with age. Parabiosis experiments (sharing blood between young and old mice) suggested GDF11 rejuvenates heart, muscle, and brain. Results debated.",
      "mechanism": "Rejuvenates aged stem cells and tissue function; exact mechanism debated",
      "status": "Controversial - some groups couldn't replicate; Alkahest (now Grifols) developing plasma-derived therapies",
      "developer": "Alkahest/Grifols, Wyss-Coray lab (Stanford)"
    },
    {
      "id": "LONG-008",
      "name": "Klotho Protein",
      "type": "Circulating longevity factor",
      "description": "A protein that declines with age. Mice with extra Klotho live 20-30% longer. Klotho enhances cognition and may protect against neurodegeneration.",
      "mechanism": "Regulates mineral metabolism, reduces oxidative stress, enhances synaptic plasticity and cognition",
      "status": "UCSF showing Klotho boosts cognition in old monkeys (2023); human trials being planned",
      "developer": "UCSF (Dena Dubal), Klogene Therapeutics"
    }
  ],
  "main": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:40:02.857Z",
    "description": "生命科学实体库",
    "entities": []
  },
  "regenerative_medicine": [
    {
      "id": "REGEN-001",
      "name": "iPSC-Derived Cell Therapies",
      "type": "Cell therapy",
      "description": "Using induced pluripotent stem cells to generate replacement cells for damaged tissues. Japan leads with the first iPSC-derived therapies approved.",
      "application": "Macular degeneration, Parkinson's, heart failure, spinal cord injury",
      "status": "iPSC-derived corneal cells (2023) and NK cells (2024) approved in Japan; many trials globally"
    },
    {
      "id": "REGEN-002",
      "name": "3D Bioprinting of Organs",
      "type": "Tissue engineering",
      "description": "Layer-by-layer printing of living cells and biomaterials to create functional tissues and eventually whole organs for transplant.",
      "application": "Skin grafts, cartilage, blood vessels, kidney, liver, heart",
      "status": "3D-printed ear (3DBio/Princeton, 2022) and skin (POIETIS) in clinical use; whole organs still years away"
    },
    {
      "id": "REGEN-003",
      "name": "Exosome Therapy",
      "type": "Paracrine signaling",
      "description": "Using extracellular vesicles (exosomes) from stem cells to deliver regenerative signals without the risks of cell transplantation.",
      "application": "Wound healing, cardiac repair, neuroprotection, hair growth",
      "status": "Cosmetic applications commercial; clinical trials for heart failure and wound healing"
    },
    {
      "id": "REGEN-004",
      "name": "Gene Therapy for Regeneration",
      "type": "Gene therapy",
      "description": "Delivering genes that promote tissue regeneration (e.g., VEGF for blood vessels, neurotrophic factors for nerves) using viral or non-viral vectors.",
      "application": "Heart failure, peripheral artery disease, spinal cord injury",
      "status": "Adstiladrin (adenoviral IFNα2b for bladder cancer) approved; regenerative gene therapies in Phase 2-3"
    }
  ],
  "synbio": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:44:16.574Z",
    "description": "合成生物学库",
    "entities": [
      {
        "id": "SB-001",
        "name": "CRISPR-Cas9",
        "type": "基因编辑",
        "applications": [
          "基因治疗",
          "作物改良"
        ],
        "companies": [
          "Editas",
          "CRISPR Therapeutics"
        ],
        "maturity": "临床阶段"
      },
      {
        "id": "SB-002",
        "name": "碱基编辑",
        "type": "基因编辑",
        "applications": [
          "遗传病治疗"
        ],
        "companies": [
          "Beam Therapeutics"
        ],
        "maturity": "临床阶段"
      },
      {
        "id": "SB-003",
        "name": "先导编辑",
        "type": "基因编辑",
        "applications": [
          "复杂突变修复"
        ],
        "companies": [
          "Prime Medicine"
        ],
        "maturity": "临床前"
      },
      {
        "id": "SB-004",
        "name": "mRNA疗法",
        "type": "核酸药物",
        "applications": [
          "疫苗",
          "蛋白替代",
          "癌症"
        ],
        "companies": [
          "Moderna",
          "BioNTech"
        ],
        "maturity": "已上市"
      },
      {
        "id": "SB-005",
        "name": "CAR-T",
        "type": "细胞治疗",
        "applications": [
          "血液肿瘤"
        ],
        "companies": [
          "诺华",
          "吉利德",
          "传奇生物"
        ],
        "maturity": "已上市"
      },
      {
        "id": "SB-006",
        "name": "生物制造",
        "type": "合成生物",
        "applications": [
          "生物塑料",
          "食品蛋白"
        ],
        "companies": [
          "Ginkgo",
          "华熙生物"
        ],
        "maturity": "商用"
      }
    ]
  },
  "synthetic_biology": [
    {
      "id": "SYNBIO-001",
      "name": "CRISPR Gene Drives",
      "type": "Gene editing application",
      "description": "Self-propagating genetic modifications that spread through wild populations. Can potentially eliminate malaria-carrying mosquitoes or invasive species.",
      "organization": "Target Malaria, UC San Diego (Esvelt lab), Imperial College",
      "status": "Lab demonstrated; field trials pending; regulatory and ethical concerns significant",
      "breakthrough": "Target Malaria's gene drive mosquitoes reduced population 90%+ in lab; first confined field study in Burkina Faso"
    },
    {
      "id": "SYNBIO-002",
      "name": "Cell-Free Protein Synthesis",
      "type": "Biomanufacturing",
      "description": "Producing proteins without living cells, using cell extracts containing ribosomes and enzymes. Enables rapid prototyping and production of toxic or difficult proteins.",
      "organization": "Sutro Biopharma, Tierra Biosciences, Cell-Free Tech",
      "status": "Commercial; Sutro's ovarian cancer drug (luvelta) in Phase 3",
      "breakthrough": "CFPS enables 24-hour design-to-protein cycles vs weeks with cell-based systems"
    },
    {
      "id": "SYNBIO-003",
      "name": "Minimal Synthetic Cell (JCVI-syn3.0)",
      "type": "Synthetic organism",
      "description": "A bacterium with the smallest known genome (473 genes) that can self-replicate. Built by systematically removing genes from Mycoplasma mycoides to identify essential functions.",
      "organization": "J. Craig Venter Institute",
      "status": "2016 milestone; syn3A (493 genes) with corrected division published 2021",
      "breakthrough": "Defined the minimal gene set for cellular life; foundation for custom synthetic organisms"
    },
    {
      "id": "SYNBIO-004",
      "name": "Xenobots / Anthrobots",
      "type": "Living machines",
      "description": "Self-assembling biological robots made from frog (Xenobots) or human (Anthrobots) cells. Can move, heal, and carry payloads without genetic modification.",
      "organization": "Tufts University (Michael Levin), University of Vermont",
      "status": "Lab demonstrated; Xenobot 3.0 (2021) can self-replicate; Anthrobots (2023) from human lung cells",
      "breakthrough": "First living, self-replicating robots; Anthrobots can heal damaged neural tissue in vitro"
    },
    {
      "id": "SYNBIO-005",
      "name": "Precision Fermentation",
      "type": "Food/biomanufacturing",
      "description": "Using engineered microbes to produce specific food proteins, fats, and molecules identical to animal-derived versions. Can replace animal agriculture.",
      "organization": "Perfect Day (dairy), Motif FoodWorks, Geltor, EVERY Company",
      "status": "Commercial; Perfect Day's animal-free whey protein in products since 2020",
      "breakthrough": "Animal-identical dairy proteins from engineered yeast at competitive costs"
    },
    {
      "id": "SYNBIO-006",
      "name": "DNA Data Storage",
      "type": "Information technology",
      "description": "Encoding digital data in synthetic DNA molecules. Theoretical density: 215 petabytes per gram. Potential solution for long-term archival storage.",
      "organization": "Microsoft/UW (Molecular Information Systems Lab), Catalog, Iridia",
      "status": "Demonstrated; Microsoft stored 200MB in DNA (2019); read/write speed is bottleneck",
      "breakthrough": "Automated DNA storage system demonstrated (2021); Iridia developing chip-scale DNA writer"
    },
    {
      "id": "SYNBIO-007",
      "name": "Engineered Living Materials",
      "type": "Materials science",
      "description": "Materials made from living cells that can grow, self-repair, and respond to environmental stimuli. Applications in construction, medicine, and sensing.",
      "organization": "MIT (Lu lab), Imperial College, Wyss Institute",
      "status": "Research; self-healing concrete (Basilisk) commercial; living sensors in development",
      "breakthrough": "Bacteria-based self-healing concrete reduces crack formation by 80%"
    },
    {
      "id": "SYNBIO-008",
      "name": "Metabolic Engineering for Chemicals",
      "type": "Industrial biotechnology",
      "description": "Engineering microbes to produce chemicals, fuels, and materials from sugar or CO₂ feedstocks, replacing petroleum-derived processes.",
      "organization": "Ginkgo Bioworks, Zymergen (now Ginkgo), LanzaTech, Genomatica",
      "status": "Commercial; LanzaTech converts industrial waste gas to ethanol; Genomatica produces bio-BDO at scale",
      "breakthrough": "LanzaTech's gas fermentation plants operating in China, producing fuel-grade ethanol from steel mill waste gas"
    }
  ]
};
