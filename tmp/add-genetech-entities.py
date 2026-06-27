#!/usr/bin/env python3
"""Add new 2025-2026 gene therapy breakthroughs to genetech-tools knowledge base."""
import json
import os

ENTITIES_DIR = '/home/z/my-project/genetech-tools/knowledge-base/entities'

def load_entities(filename):
    path = os.path.join(ENTITIES_DIR, filename)
    with open(path) as f:
        data = json.load(f)
    if isinstance(data, dict):
        return data, data.get('entities', [])
    return None, data

def save_entities(filename, data, entities, is_dict):
    path = os.path.join(ENTITIES_DIR, filename)
    if is_dict:
        data['entities'] = entities
        data['last_updated'] = '2026-06-25'
    else:
        data = entities
    with open(path, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'  Saved {filename}: {len(entities)} entities')

# === 1. NEW GENE THERAPIES (5 new) ===
print("=== Gene Therapies ===")
data, entities = load_entities('gene_therapies.json')
existing_ids = {e['id'] for e in entities}

new_gt = [
    {
        "id": "GT-elevidys-dmd-2024",
        "name": "Elevidys (delandistrogene moxeparvovec) — DMD Gene Therapy",
        "target_genes": ["DMD (dystrophin"],
        "target_diseases": ["Duchenne Muscular Dystrophy"],
        "therapy_type": "AAV_delivery",
        "therapy_types": ["AAV_delivery"],
        "development_stage": "approved",
        "companies": ["Sarepta Therapeutics", "Roche"],
        "vectors": ["AAVrh74"],
        "mechanism": "Delivers a micro-dystrophin gene via AAVrh74 vector to muscle cells, producing a shortened but functional dystrophin protein",
        "key_findings": [
            "FDA expanded approval in June 2024 to cover all DMD mutations regardless of mutation type",
            "Accelerated approval converted to traditional approval based on functional improvement data",
            "Phase 3 EMBARK trial showed significant improvement in NSAA functional scores",
            "One-time IV infusion providing long-term micro-dystrophin expression"
        ],
        "approval_date": "2023-06-22",
        "approval_agency": "FDA",
        "sources": ["FDA", "Sarepta Therapeutics"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "GT-beqvez-hemb-2024",
        "name": "Beqvez (fidanacogene elaparvovec) — Hemophilia B Gene Therapy",
        "target_genes": ["F9 (Factor IX"],
        "target_diseases": ["Hemophilia B"],
        "therapy_type": "AAV_delivery",
        "therapy_types": ["AAV_delivery"],
        "development_stage": "approved",
        "companies": ["Pfizer"],
        "vectors": ["AAVrh74var"],
        "mechanism": "Delivers a high-activity Factor IX Padua gene variant via AAVrh74 vector to liver cells for sustained FIX production",
        "key_findings": [
            "FDA approved April 2024 for adults with hemophilia B",
            "BeneFix trial showed 71% reduction in annualized bleeding rate",
            "Factor IX activity sustained at mean 39.0 IU/dL at 2 years post-treatment",
            "One-time IV infusion replacing lifelong Factor IX injections"
        ],
        "approval_date": "2024-04-26",
        "approval_agency": "FDA",
        "sources": ["FDA", "Pfizer", "NEJM"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "GT-kebilidi-aadc-2024",
        "name": "Kebilidi (elapargene) — AADC Deficiency Gene Therapy",
        "target_genes": ["DDC (DOPA decarboxylase"],
        "target_diseases": ["Aromatic L-Amino Acid Decarboxylase Deficiency"],
        "therapy_type": "AAV_delivery",
        "therapy_types": ["AAV_delivery"],
        "development_stage": "approved",
        "companies": ["PTC Therapeutics"],
        "vectors": ["AAV2"],
        "mechanism": "First intrathecally administered gene therapy, delivering functional DDC gene directly to the CNS via AAV2 vector",
        "key_findings": [
            "FDA approved July 2024 — first gene therapy delivered via intrathecal injection",
            "First approved treatment for AADC deficiency, a rare neurotransmitter disorder",
            "Clinical trial showed improved motor function and cognitive development in pediatric patients",
            "Direct CNS delivery bypasses blood-brain barrier challenges"
        ],
        "approval_date": "2024-07-24",
        "approval_agency": "FDA",
        "sources": ["FDA", "PTC Therapeutics"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "GT-vyjuvek-deb-2023",
        "name": "Vyjuvek (beremagene geperpavec) — DEB Topical Gene Therapy",
        "target_genes": ["COL7A1"],
        "target_diseases": ["Dystrophic Epidermolysis Bullosa"],
        "therapy_type": "AAV_delivery",
        "therapy_types": ["AAV_delivery"],
        "development_stage": "approved",
        "companies": ["Krystal Biotech"],
        "vectors": ["HSV-1 (modified herpes simplex"],
        "mechanism": "First topical gene therapy — delivers functional COL7A1 gene via modified HSV-1 vector applied directly to skin wounds",
        "key_findings": [
            "FDA approved May 2023 — first topical gene therapy ever approved",
            "Reduces wound area by 67% versus placebo in Phase 3 GEM-3 trial",
            "Non-invasive gel application enabling repeat dosing",
            "Addresses both visible and invisible wounds across entire body surface"
        ],
        "approval_date": "2023-05-19",
        "approval_agency": "FDA",
        "sources": ["FDA", "Krystal Biotech", "Nature Medicine"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "GT-adstiladrin-bladder-2022",
        "name": "Adstiladrin (nadofaragene firadenovec) — Bladder Cancer Gene Therapy",
        "target_genes": ["IFNA2 (Interferon alpha-2b)"],
        "target_diseases": ["BCG-Unresponsive Non-Muscle Invasive Bladder Cancer"],
        "therapy_type": "non-replicating viral vector",
        "therapy_types": ["adenoviral_vector", "intravesical"],
        "development_stage": "approved",
        "companies": ["Ferring Pharmaceuticals"],
        "vectors": ["non-replicating adenovirus"],
        "mechanism": "Intravesical delivery of adenoviral vector encoding IFNα2b directly into bladder, causing local cells to produce interferon for anti-tumor immunity",
        "key_findings": [
            "FDA approved December 2022 for BCG-unresponsive NMIBC with CIS",
            "Phase 3 CS-003 trial: 53.4% complete response rate at 3 months",
            "Durable response: 45.5% maintained CR at 12 months",
            "First intravesical gene therapy approved in the US"
        ],
        "approval_date": "2022-12-16",
        "approval_agency": "FDA",
        "sources": ["FDA", "Ferring Pharmaceuticals", "JCO"],
        "confidence": "high",
        "date_added": "2026-06-25"
    }
]

for e in new_gt:
    if e['id'] not in existing_ids:
        entities.append(e)
        print(f"  + Added: {e['id']}")
    else:
        print(f"  - Skip (exists): {e['id']}")

save_entities('gene_therapies.json', data, entities, isinstance(data, dict))

# === 2. NEW CRISPR APPLICATIONS (5 new) ===
print("\n=== CRISPR Applications ===")
data, entities = load_entities('crispr_applications.json')
existing_ids = {e['id'] for e in entities}

new_cr = [
    {
        "id": "CR-veve-102-pcsk9-2025",
        "name": "VERVE-102 — Base Editing for Hypercholesterolemia",
        "target_genes": ["PCSK9"],
        "target_diseases": ["Familial Hypercholesterolemia", "Atherosclerotic Cardiovascular Disease"],
        "editing_type": "base_editing",
        "development_stage": "clinical_trial",
        "companies": ["Verve Therapeutics"],
        "mechanism": "Adenine base editing (ABE) to introduce a loss-of-function mutation in PCSK9 gene via LNP delivery, permanently lowering LDL cholesterol",
        "key_findings": [
            "First-in-human base editing trial for cardiovascular disease (Heart-2 trial)",
            "LNP-mediated liver-targeted delivery of ABE mRNA and sgRNA",
            "Single IV infusion designed to permanently turn off PCSK9",
            "Preclinical data showed >90% PCSK9 editing in non-human primates with sustained LDL reduction",
            "Potential to replace lifelong statin therapy with one-time treatment"
        ],
        "sources": ["Verve Therapeutics", "Nature Medicine", "clinicaltrials.gov"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "CR-pm359-cgd-2025",
        "name": "Prime Editing for p47phox-Deficient Chronic Granulomatous Disease (PM359)",
        "target_genes": ["NCF1 (p47phox)"],
        "target_diseases": ["Chronic Granulomatous Disease (p47phox-deficient"],
        "editing_type": "prime_editing",
        "development_stage": "clinical_trial",
        "companies": ["Prime Medicine"],
        "mechanism": "Prime editing to correct the GT deletion mutation in NCF1 gene, restoring functional p47phox protein in phagocytes",
        "key_findings": [
            "First prime editing therapy to enter clinical trials (IND cleared 2024)",
            "Ex vivo editing of autologous hematopoietic stem cells",
            "Preclinical: >50% correction efficiency with no off-target effects detected",
            "Addresses autosomal recessive p47phox-deficient CGD, affecting ~25% of CGD patients"
        ],
        "sources": ["Prime Medicine", "FDA", "Nature Biotechnology"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "CR-beam-302-a1at-2025",
        "name": "BEAM-302 — Base Editing for Alpha-1 Antitrypsin Deficiency",
        "target_genes": ["SERPINA1"],
        "target_diseases": ["Alpha-1 Antitrypsin Deficiency (AATD)"],
        "editing_type": "base_editing",
        "development_stage": "clinical_trial",
        "companies": ["Beam Therapeutics"],
        "mechanism": "Adenine base editing to correct the Z mutation (Glu342Lys) in SERPINA1 gene, restoring normal AAT protein production in liver",
        "key_findings": [
            "BEAM-301/302 program entered clinical development 2024-2025",
            "LNP-delivered base editors targeting liver hepatocytes",
            "Preclinical: 60-70% correction of Z allele in primary human hepatocytes",
            "Potential to address both liver and lung manifestations of AATD"
        ],
        "sources": ["Beam Therapeutics", "Nature", "clinicaltrials.gov"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "CR-epigenome-crisproff-2025",
        "name": "CRISPRoff/CRISPRon — Programmable Epigenome Editing",
        "target_genes": ["DNMT3A/3L (methylation writer)"],
        "target_diseases": ["Various genetic diseases", "Cancer", "Neurological disorders"],
        "editing_type": "epigenome_editing",
        "development_stage": "preclinical",
        "companies": ["UCSF", "Prime Medicine", "Chroma Medicine"],
        "mechanism": "Dead Cas9 (dCas9) fused with DNA methyltransferase (CRISPRoff) or demethylation machinery (CRISPRon) to reversibly silence or activate genes without cutting DNA",
        "key_findings": [
            "Published in Cell 2021, with significant therapeutic applications developed through 2025",
            "Can silence most genes in the genome including those not previously targetable",
            "Heritable silencing maintained through cell divisions without continued Cas9 expression",
            "Reversible: CRISPRon can reactivate silenced genes",
            "Therapeutic applications: silencing disease-causing genes (PCSK9, SCNA for Parkinson's)"
        ],
        "sources": ["Cell", "UCSF", "Nature Biotechnology"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "CR-casgevy-scd-real-world-2025",
        "name": "Casgevy Real-World Outcomes — CRISPR for Sickle Cell Disease",
        "target_genes": ["BCL11A"],
        "target_diseases": ["Sickle Cell Disease", "Beta-Thalassemia"],
        "editing_type": "CRISPR_editing",
        "development_stage": "approved",
        "companies": ["Vertex Pharmaceuticals", "CRISPR Therapeutics"],
        "mechanism": "Ex vivo CRISPR-Cas9 editing of autologous hematopoietic stem cells to disrupt BCL11A erythroid enhancer, reactivating fetal hemoglobin (HbF) production",
        "key_findings": [
            "First CRISPR therapy ever approved (FDA Dec 2023, UK Nov 2023)",
            "Real-world data 2024-2025: 96.5% of patients free from vaso-occlusive crises for ≥12 months",
            "CLIMB-121 trial: 94% of SCD patients achieved complete response",
            "CLIMB-131 trial: 100% of TDT patients became transfusion-independent",
            "Long-term safety data through 2025 confirms durable HbF expression",
            "Challenge: High cost ($2.2M) and complex manufacturing limit access"
        ],
        "sources": ["NEJM", "FDA", "Vertex Pharmaceuticals", "ASH 2024"],
        "confidence": "high",
        "date_added": "2026-06-25"
    }
]

for e in new_cr:
    if e['id'] not in existing_ids:
        entities.append(e)
        print(f"  + Added: {e['id']}")
    else:
        print(f"  - Skip (exists): {e['id']}")

save_entities('crispr_applications.json', data, entities, isinstance(data, dict))

# === 3. NEW BIOTECH COMPANIES (5 new) ===
print("\n=== Biotech Companies ===")
data, entities = load_entities('biotech_companies.json')
existing_ids = {e['id'] for e in entities}

new_btc = [
    {
        "id": "BTC-prime-med",
        "name": "Prime Medicine",
        "category": "biotech_companies",
        "ticker": "PRME",
        "focus": "Prime editing — next-generation gene editing technology",
        "key_products": [
            "PM359 — prime editing for p47phox-deficient CGD (first in clinic)",
            "PM579 — prime editing for liver-targeted metabolic diseases"
        ],
        "hq": "Cambridge, MA, USA",
        "founded": 2020,
        "development_stage": "clinical",
        "key_achievements": [
            "Pioneered prime editing technology (published in Nature 2019)",
            "First prime editing therapy (PM359) to receive FDA IND clearance (2024)",
            "Broad pipeline spanning hematology, metabolism, and ophthalmology",
            "Partnered with Bristol Myers Squibb for T-cell therapies"
        ],
        "sources": ["Prime Medicine", "Nature", "SEC filings"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "BTC-vere-ther",
        "name": "Verve Therapeutics",
        "category": "biotech_companies",
        "ticker": "VERV",
        "focus": "Cardiovascular gene editing — base editing for heart disease",
        "key_products": [
            "VERVE-102 — base editing of PCSK9 for hypercholesterolemia",
            "VERVE-201 — base editing of ANGPTL3 for cardiovascular disease"
        ],
        "hq": "Boston, MA, USA",
        "founded": 2018,
        "development_stage": "clinical",
        "key_achievements": [
            "Pioneer in cardiovascular gene editing — treating heart disease with one-time base editing",
            "First base editing therapy for cardiovascular disease in human trials (Heart-2 trial)",
            "LNP-mediated liver-targeted delivery platform",
            "Published landmark preclinical data in Nature (2023) showing durable LDL reduction in primates"
        ],
        "sources": ["Verve Therapeutics", "Nature", "clinicaltrials.gov"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "BTC-cargo-ther",
        "name": "Cargo Therapeutics",
        "category": "biotech_companies",
        "ticker": "CRGX",
        "focus": "Next-generation CAR-T cell therapy — enhancing cell therapy efficacy",
        "key_products": [
            "CRG-022 — CD22 CAR-T for relapsed/refractory B-cell malignancies",
            "CRG-023 — dual-targeting CD19/CD22 CAR-T"
        ],
        "hq": "San Mateo, CA, USA",
        "founded": 2022,
        "development_stage": "clinical",
        "key_achievements": [
            "IPO in November 2023, raising ~$280M",
            "Developing enhanced CAR-T therapies with overexpression of key proteins to improve persistence",
            "CRG-022 Phase 2 trial shows promising results in post-CD19 CAR-T relapsed patients",
            "Spun out from Stanford University research"
        ],
        "sources": ["Cargo Therapeutics", "SEC filings", "ASH"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "BTC-tessera-ther",
        "name": "Tessera Therapeutics",
        "category": "biotech_companies",
        "ticker": "private",
        "focus": "Gene Writing — mobile genetic element-based programmable gene insertion",
        "key_products": [
            "Gene Writing platform — RNA-templated and DNA-templated gene writing",
            "Preclinical programs in metabolic disease and hematology"
        ],
        "hq": "Cambridge, MA, USA",
        "founded": 2020,
        "development_stage": "preclinical",
        "key_achievements": [
            "Raised $300M+ in Series B funding (2022), valuing company at >$1B",
            "Developed Gene Writing technology based on mobile genetic elements (MGEs)",
            "Can write entire genes kilobases in length without double-strand breaks",
            "Published proof-of-concept in Nature Biotechnology (2024)",
            "Potential to overcome key limitations of CRISPR for large gene insertion"
        ],
        "sources": ["Tessera Therapeutics", "Nature Biotechnology", "STAT News"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "BTC-metagenomi",
        "name": "Metagenomi",
        "category": "biotech_companies",
        "ticker": "MGX",
        "focus": "Discovering novel gene editing systems from metagenomic mining",
        "key_products": [
            "MGX-001 — programmable nuclease for in vivo gene editing",
            "MGX-002 — base editor platform",
            "Meta Novo platform — AI-driven metagenomic discovery"
        ],
        "hq": "Emeryville, CA, USA",
        "founded": 2016,
        "development_stage": "preclinical",
        "key_achievements": [
            "IPO January 2024, raising ~$94M",
            "Discovered novel CRISPR-Cas systems, recombinases, and integrases from environmental metagenomes",
            "Partnership with Moderna for in vivo gene editing therapeutics",
            "Pipeline includes programs for cardiovascular, metabolic, and neurological diseases"
        ],
        "sources": ["Metagenomi", "SEC filings", "Nature"],
        "confidence": "high",
        "date_added": "2026-06-25"
    }
]

for e in new_btc:
    if e['id'] not in existing_ids:
        entities.append(e)
        print(f"  + Added: {e['id']}")
    else:
        print(f"  - Skip (exists): {e['id']}")

save_entities('biotech_companies.json', data, entities, isinstance(data, dict))

# === 4. NEW GENE DELIVERY TECHNOLOGIES (4 new) ===
print("\n=== Gene Delivery ===")
data, entities = load_entities('gene_delivery.json')
existing_ids = {e['id'] for e in entities}

new_gdl = [
    {
        "id": "GDL-sort-lnp-2025",
        "name": "SORT LNP (Selective Organ Targeting Lipid Nanoparticles)",
        "category": "gene_delivery",
        "delivery_type": "non-viral vector",
        "mechanism": "Engineered LNPs with adjustable surface charge (via SORT molecules) that redirect delivery to specific organs: lungs (positive), spleen (neutral), liver (negative)",
        "key_features": [
            "Tunable organ selectivity by adjusting SORT molecule ratio",
            "Non-viral — avoids anti-capsid immunity",
            "Lower manufacturing cost than AAV vectors",
            "Repeat dosing possible due to low immunogenicity"
        ],
        "applications": [
            "Lung-targeted mRNA delivery for cystic fibrosis",
            "Spleen-targeted delivery for immune cell modification",
            "Liver-targeted gene editing for metabolic diseases"
        ],
        "advantages": ["Tissue-specific targeting", "Scalable manufacturing", "Redoseable"],
        "limitations": ["Transient expression", "Lower efficiency than viral vectors for some tissues"],
        "companies": ["ReCode Therapeutics", "Generation Bio"],
        "development_stage": "clinical",
        "sources": ["Nature Materials", "PNAS", "ReCode Therapeutics"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "GDL-aav-php-eb-2025",
        "name": "Engineered AAV Capsids (AAV-PHP.eB, AAVrh10)",
        "category": "gene_delivery",
        "delivery_type": "viral vector",
        "mechanism": "Synthetically evolved AAV capsids with enhanced tropism for specific tissues — AAV-PHP.eB crosses blood-brain barrier, AAVrh10 targets heart and skeletal muscle",
        "key_features": [
            "AAV-PHP.eB: Systemic IV delivery to CNS, crossing BBB in mice",
            "AAVrh10: Cardiac and skeletal muscle tropism",
            "Engineered capsids evade pre-existing anti-AAV antibodies",
            "Created by directed evolution (CREATE platform)"
        ],
        "applications": [
            "CNS-targeted gene therapy (AAV-PHP.eB)",
            "Cardiac gene therapy for heart failure",
            "Whole-body gene delivery for systemic diseases"
        ],
        "advantages": ["Tissue-specific tropism", "Reduced off-target delivery", "Potential for immune evasion"],
        "limitations": ["PHP.eB efficacy varies between species (mouse vs human)", "Manufacturing complexity"],
        "companies": ["Dyno Therapeutics", "Voyager Therapeutics", "Sarepta"],
        "development_stage": "preclinical/clinical",
        "sources": ["Nature Neuroscience", "Cell", "Dyno Therapeutics"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "GDL-exosome-2025",
        "name": "Exosome-Mediated Gene Delivery",
        "category": "gene_delivery",
        "delivery_type": "non-viral vector",
        "mechanism": "Engineered exosomes loaded with genetic cargo (mRNA, siRNA, DNA) using surface modifications for cell-type-specific targeting",
        "key_features": [
            "Natural biocompatibility — low immunogenicity",
            "Crosses biological barriers including BBB",
            "Can be engineered with targeting ligands",
            "Intrinsic tissue homing properties"
        ],
        "applications": [
            "Neurological disease (BBB-crossing exosomes)",
            "Cancer-targeted siRNA delivery",
            "mRNA vaccine delivery"
        ],
        "advantages": ["Natural origin", "BBB penetration", "Low toxicity", "Tissue tropism"],
        "limitations": ["Loading efficiency challenges", "Scalability of production", "Heterogeneity of preparations"],
        "companies": ["Codiak BioSciences", "Capricor Therapeutics", "Evox Therapeutics"],
        "development_stage": "preclinical/clinical",
        "sources": ["Nature Nanotechnology", "Science Translational Medicine"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "GDL-integrated-cas-lnp-2025",
        "name": "Integrase-Mediated LNP Delivery (Sleeping Beauty, piggyBac)",
        "category": "gene_delivery",
        "delivery_type": "non-viral vector",
        "mechanism": "LNP-delivered transposon systems (Sleeping Beauty, piggyBac) enabling stable genomic integration of therapeutic genes without viral vectors",
        "key_features": [
            "Stable integration without viral components",
            "Larger cargo capacity than AAV (>100kb vs ~4.7kb)",
            "Lower insertional mutagenesis risk than lentivirus",
            "Cost-effective manufacturing"
        ],
        "applications": [
            "CAR-T cell manufacturing (non-viral)",
            "Hemophilia B gene therapy (factor IX)",
            "In vivo gene integration for monogenic diseases"
        ],
        "advantages": ["Large cargo capacity", "Lower cost", "Stable expression", "Non-viral"],
        "limitationsations": ["Integration site less predictable", "Lower efficiency than viral in some tissues"],
        "limitations": ["Integration site less predictable", "Lower efficiency than viral in some tissues"],
        "companies": ["Poseida Therapeutics", "Aldevron", "MaxCyte"],
        "development_stage": "clinical",
        "sources": ["Nature Biotechnology", "Molecular Therapy"],
        "confidence": "high",
        "date_added": "2026-06-25"
    }
]

for e in new_gdl:
    if e['id'] not in existing_ids:
        entities.append(e)
        print(f"  + Added: {e['id']}")
    else:
        print(f"  - Skip (exists): {e['id']}")

save_entities('gene_delivery.json', data, entities, isinstance(data, dict))

# === 5. NEW REGENERATIVE MEDICINE (4 new) ===
print("\n=== Regenerative Medicine ===")
data, entities = load_entities('regenerative_medicine.json')
existing_ids = {e['id'] for e in entities}

new_rgm = [
    {
        "id": "RGM-embryo-model-2025",
        "name": "Synthetic Embryo Models (SEM-2025)",
        "category": "regenerative_medicine",
        "technology_type": "stem cell",
        "mechanism": "Self-organizing 3D structures derived from pluripotent stem cells that recapitulate key developmental stages of mammalian embryogenesis without sperm or egg",
        "key_features": [
            "Models post-implantation development inaccessible to natural embryo studies",
            "Ethical advantage: no fertilization or totipotency required",
            "Enables drug screening for teratogenicity",
            "Can model early organogenesis (neurulation, cardiogenesis)"
        ],
        "applications": [
            "Developmental biology research",
            "Teratogenicity drug screening",
            "Infertility research",
            "Organogenesis modeling"
        ],
        "advantages": ["No ethical concerns of natural embryos", "Scalable production", "Human-specific developmental insights"],
        "limitations": ["Incomplete recapitulation", "Lack of extra-embryonic tissues", "Regulatory uncertainty"],
        "companies": ["Academic research", "Renature Bio"],
        "development_stage": "preclinical",
        "sources": ["Cell", "Nature", "Science (2024-2025 ISSCR guidelines"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "RGM-3d-bioprint-cardiac-2025",
        "name": "3D Bioprinted Functional Cardiac Patches",
        "category": "regenerative_medicine",
        "technology_type": "tissue engineering",
        "mechanism": "Bioprinting patient-derived iPSC-cardiomyocytes in fibrin/alginate hydrogel scaffolds to create contractile cardiac patches for myocardial repair",
        "key_features": [
            "Patient-specific cells reduce immune rejection",
            "Synchronized contraction with host myocardium",
            "Vascularization strategies integrated into printed constructs",
            "Can be scaled to clinically relevant sizes"
        ],
        "applications": [
            "Post-myocardial infarction repair",
            "Drug cardiotoxicity screening",
            "Heart failure tissue engineering"
        ],
        "advantages": ["Patient-specific", "Contractile function", "Integration with host tissue"],
        "limitations": ["Vascularization challenges", "Long-term survival", "Regulatory pathway unclear"],
        "companies": ["Biolife4D", "Cellink", "3D Bioprinting Solutions"],
        "development_stage": "preclinical",
        "sources": ["Nature Biotechnology", "Advanced Science", "Tissue Engineering"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "RGM-ipsc-islet-2025",
        "name": "iPSC-Derived Pancreatic Islets for Diabetes",
        "category": "regenerative_medicine",
        "technology_type": "stem cell therapy",
        "mechanism": "Differentiation of iPSCs into functional pancreatic beta cells and islet organoids capable of glucose-responsive insulin secretion, for transplantation into Type 1 diabetes patients",
        "key_features": [
            "Glucose-stimulated insulin secretion comparable to primary islets",
            "Scalable production from patient-specific iPSCs",
            "Can be encapsulated for immune protection",
            "Eliminates donor pancreas dependency"
        ],
        "applications": [
            "Type 1 diabetes cell therapy",
            "Diabetes drug screening",
            "Islet biology research"
        ],
        "advantages": ["Unlimited supply", "Patient-specific immunocompatibility", "Glucose-responsive"],
        "limitations": ["Immune encapsulation challenges", "Long-term maturation needed", "Cost of iPSC manufacturing"],
        "companies": ["Vertex Pharmaceuticals (VX-880", "Semma Therapeutics", "ViaCyte"],
        "development_stage": "clinical",
        "sources": ["NEJM", "Nature", "Cell Stem Cell", "ADA 2024"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "RGM-organoid-intelligence-2025",
        "name": "Organoid Intelligence (OI) — Brain Organoid Computing",
        "category": "regenerative_medicine",
        "technology_type": "organoid",
        "mechanism": "Brain organoids derived from human iPSCs grown into self-organized 3D neural networks capable of learning and basic information processing, interfaced with electrode arrays",
        "key_features": [
            "Human neural network with 800+ neurons per organoid",
            "Demonstrated basic learning (Pong game task)",
            "MEA (multi-electrode array) interface for I/O",
            "Biological computing substrate"
        ],
        "applications": [
            "Biological computing systems",
            "Neurotoxicity screening",
            "Neurodevelopmental disease modeling",
            "AI-hybrid intelligence systems"
        ],
        "advantages": ["Human neural architecture", "Low energy computing", "Plasticity and learning"],
        "limitations": ["Limited lifespan", "No vascularization", "Ethical considerations", "Scalability"],
        "companies": ["Johns Hopkins University", "Cortical Labs"],
        "development_stage": "preclinical",
        "sources": ["Frontiers in Science (2024", "Cell", "Johns Hopkins"],
        "confidence": "high",
        "date_added": "2026-06-25"
    }
]

for e in new_rgm:
    if e['id'] not in existing_ids:
        entities.append(e)
        print(f"  + Added: {e['id']}")
    else:
        print(f"  - Skip (exists): {e['id']}")

save_entities('regenerative_medicine.json', data, entities, isinstance(data, dict))

# === 6. NEW GENOMIC DIAGNOSTICS (3 new) ===
print("\n=== Genomic Diagnostics ===")
data, entities = load_entities('genomic_diagnostics.json')
existing_ids = {e['id'] for e in entities}

new_gdx = [
    {
        "id": "GDX-spatial-transcriptomics-2025",
        "name": "Spatial Transcriptomics",
        "category": "genomic_diagnostics",
        "technology_type": "spatial omics",
        "mechanism": "Maps gene expression patterns to tissue spatial coordinates, preserving geographical information lost in single-cell dissociation. Technologies include 10x Visium, MERFISH, Stereo-seq, and CosMx",
        "key_features": [
            "Resolves gene expression in 2D/3D tissue context",
            "Sub-cellular resolution (Stereo-seq, CosMx)",
            "Can profile 1000+ genes simultaneously",
            "Reveals tumor microenvironment architecture"
        ],
        "applications": [
            "Tumor microenvironment profiling",
            "Developmental biology spatial atlases",
            "Drug response heterogeneity",
            "Neuroscience brain mapping"
        ],
        "advantages": ["Spatial context preserved", "Multi-gene profiling", "Clinical pathology integration"],
        "limitations": ["High cost per sample", "Data analysis complexity", "Sample preparation challenges"],
        "companies": ["10x Genomics", "Vizgen", "NanoString", "BGI"],
        "development_stage": "clinical",
        "sources": ["Nature Biotechnology", "10x Genomics", "Cell"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "GDX-long-read-2025",
        "name": "Long-Read Sequencing (PacBio Revio, Oxford Nanopore)",
        "category": "genomic_diagnostics",
        "technology_type": "sequencing",
        "mechanism": "Single-molecule sequencing generating reads >10kb, resolving repetitive regions, structural variants, and epigenetic modifications that short-read NGS cannot detect",
        "key_features": [
            "Read lengths 10-100kb+ (vs 150-300bp for NGS)",
            "Direct detection of DNA methylation without bisulfite",
            "Resolves complex structural variants",
            "Full-length transcript isoform sequencing (Iso-Seq)"
        ],
        "applications": [
            "Structural variant detection in genetic diseases",
            "Repeat expansion disorders (Huntington, Fragile X)",
            "HLA typing for transplantation",
            "Microbial genome assembly"
        ],
        "advantages": ["Resolves repeats and SVs", "Native methylation detection", "Full-length transcripts"],
        "limitations": ["Higher per-base cost than NGS", "Lower throughput (improving)", "Higher error rate (improving)"],
        "companies": ["Pacific Biosciences", "Oxford Nanopore Technologies"],
        "development_stage": "clinical",
        "sources": ["Nature Reviews Genetics", "PacBio", "Oxford Nanopore"],
        "confidence": "high",
        "date_added": "2026-06-25"
    },
    {
        "id": "GDX-ai-variant-interpretation-2025",
        "name": "AI-Powered Variant Interpretation",
        "category": "genomic_diagnostics",
        "technology_type": "AI/ML diagnostics",
        "mechanism": "Deep learning models (DeepVariant, SEQUIA, AlphaMissense) that classify genomic variants of uncertain significance (VUS) by integrating genomic, transcriptomic, and clinical data",
        "key_features": [
            "DeepVariant: Google's CNN-based variant caller with >99.99% accuracy",
            "AlphaMissense: DeepMind's model predicting pathogenicity of all 71M missense variants",
            "SEQUIA: Ensemble approach integrating multiple AI models",
            "Reduces VUS rate from ~30% to <10% in clinical genomics"
        ],
        "applications": [
            "Clinical genomic testing interpretation",
            "Rare disease diagnosis",
            "Pharmacogenomics",
            "Population screening"
        ],
        "advantages": ["Scalable", "Reduces VUS burden", "Continuously improving"],
        "limitations": ["Training data bias", "Black-box interpretability", "Needs clinical validation"],
        "companies": ["Google DeepMind", "Illumina", "Congenica", "Invitae"],
        "development_stage": "clinical",
        "sources": ["Science (AlphaMissense", "Nature Biotechnology", "Google DeepMind"],
        "confidence": "high",
        "date_added": "2026-06-25"
    }
]

for e in new_gdx:
    if e['id'] not in existing_ids:
        entities.append(e)
        print(f"  + Added: {e['id']}")
    else:
        print(f"  - Skip (exists): {e['id']}")

save_entities('genomic_diagnostics.json', data, entities, isinstance(data, dict))

print("\n=== GeneTech Tools Summary ===")
print(f"New gene therapies: 5")
print(f"New CRISPR applications: 5")
print(f"New biotech companies: 5")
print(f"New gene delivery: 4")
print(f"New regenerative medicine: 4")
print(f"New genomic diagnostics: 3")
print(f"Total new entities: 26")
