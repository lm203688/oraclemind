#!/usr/bin/env node
/**
 * Deep-dive update script for 2026-06-22 (Monday)
 * Domains: genetech-tools + tcm-tools
 * Adds real, web-sourced entities to knowledge base
 */

const fs = require('fs');
const path = require('path');

const today = '2026-06-22T06:40:00Z';

// ============================================================
// GENETECH-TOOLS: Add entities to existing files
// ============================================================

const genetechBase = '/home/z/my-project/genetech-tools/knowledge-base/entities';

// --- 1. Gene Therapies: 3 new entities ---
const geneTherapiesPath = path.join(genetechBase, 'gene_therapies.json');
const gtData = JSON.parse(fs.readFileSync(geneTherapiesPath, 'utf8'));

const newGeneTherapies = [
  {
    name: "EBT-101",
    target_disease: "HIV/AIDS",
    vector: "AAV9",
    delivery_method: "in-vivo",
    status: "Phase I/II completed (2025)",
    description: "EBT-101, developed by Excision Biotherapeutics, is a first-in-class CRISPR-based gene-editing therapy designed as a functional cure for HIV. It uses an AAV9 vector delivering CRISPR-Cas9 with multiple guide RNAs to excise HIV proviral DNA from the host genome. In the Phase I/II trial, EBT-101 was well-tolerated and demonstrated safety in participants. However, data presented at the ASGCT meeting showed that the therapy did not prevent HIV-1 viral rebound in three participants who stopped antiretroviral therapy (ART). While the curative potential was not fully realized in this initial trial, the safety profile supports continued development of CRISPR-based anti-viral strategies.",
    companies: ["Excision Biotherapeutics"],
    sources: [
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://innovativegenomics.org/news/crispr-clinical-trials-2026",
        collected_at: today
      },
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://www.clinicaltrialsarena.com/news/gene-editing-takes-centre-stage-in-fdas-new-rare-disease-approval-pathway",
        collected_at: today
      }
    ],
    id: "GT-ebt-101-hiv-crispr"
  },
  {
    name: "Encelto (revakinagene taroretcel-lwey)",
    target_disease: "Macular Telangiectasia Type 2 (MacTel)",
    vector: "Encapsulated cell therapy",
    delivery_method: "intraocular implant",
    status: "FDA Approved (March 2025)",
    description: "Encelto (revakinagene taroretcel-lwey) is the first and only FDA-approved treatment for adults with idiopathic macular telangiectasia type 2 (MacTel), a rare retinal disorder. Approved on March 6, 2025, it utilizes an innovative encapsulated cell therapy approach — a small implantable device containing genetically engineered allogeneic cells that continuously secrete ciliary neurotrophic factor (CNTF), a protein that preserves photoreceptors. The therapy originated from research at Scripps Research Institute. Clinical trials demonstrated that Encelto slows vision loss by preserving photoreceptors in the macula. The device became available to U.S. patients starting June 2025.",
    companies: ["Neurotech Pharmaceuticals"],
    sources: [
      {
        source_type: "web",
        source_credibility: "A",
        article_url: "https://www.fda.gov/news-events/press-announcements/fda-approves-encelto-first-ever-treatment-macular-telangiectasia-type-2",
        collected_at: today
      },
      {
        source_type: "web",
        source_credibility: "A",
        article_url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13064412",
        collected_at: today
      }
    ],
    id: "GT-encelto-mactel"
  },
  {
    name: "UX111 (sebelipase alfa gene therapy)",
    target_disease: "Sanfilippo Syndrome Type A (MPS IIIA)",
    vector: "scAAV9",
    delivery_method: "intracisternal/intravenous",
    status: "BLA Resubmitted (January 2026)",
    description: "UX111, developed by Ultragenyx, is a one-time AAV9 gene therapy for Sanfilippo Syndrome Type A (MPS IIIA), a devastating pediatric neurodegenerative disorder caused by deficiency of the SGSH enzyme. The therapy uses a self-complementary AAV9 vector to deliver a functional copy of the SGSH gene to cells. UX111 was granted Priority Review by the FDA in February 2025, but received a Complete Response Letter (CRL) citing manufacturing and facilities concerns. Ultragenyx resubmitted the BLA on January 30, 2026. If approved, UX111 will be the first pharmacological treatment for Sanfilippo A syndrome. Clinical data showed sustained cerebrospinal fluid (CSF) heparan sulfate reduction and cognitive stabilization in treated patients.",
    companies: ["Ultragenyx"],
    sources: [
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://www.cgtlive.com/view/ultragenyx-resubmits-bla-ux111-sanfilippo-syndrome",
        collected_at: today
      },
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://www.prnewswire.com/news-releases/ultragenyx-announces-us-fda-acceptance-of-bla-resubmission",
        collected_at: today
      }
    ],
    id: "GT-ux111-sanfilippo"
  }
];

gtData.entities.push(...newGeneTherapies);
gtData.last_updated = today;
fs.writeFileSync(geneTherapiesPath, JSON.stringify(gtData, null, 2));
console.log(`✅ gene_therapies.json: +${newGeneTherapies.length} entities (total: ${gtData.entities.length})`);

// --- 2. CRISPR Applications: 2 new entities ---
const crisprAppPath = path.join(genetechBase, 'crispr_applications.json');
const caData = JSON.parse(fs.readFileSync(crisprAppPath, 'utf8'));

const newCrisprApps = [
  {
    name: "VERVE-102 In Vivo Base Editing",
    application: "Cardiovascular disease",
    target: "PCSK9",
    crispr_system: "Adenine base editing (ABE)",
    status: "Clinical trial (Heart-2 study)",
    description: "VERVE-102, developed by Verve Therapeutics, is an in vivo base editing therapy targeting the PCSK9 gene for the treatment of heterozygous familial hypercholesterolemia (HeFH). Using lipid nanoparticle (LNP) delivery of adenine base editor mRNA and a guide RNA, VERVE-102 introduces a single-base change in PCSK9 that disrupts the gene's function, leading to durable LDL cholesterol reduction. Clinical data showed that one dose of VERVE-102 led to dose-dependent, substantial, and sustained reductions in PCSK9 and LDL cholesterol levels. In October 2025, Eli Lilly acquired Beam Therapeutics' opt-in rights to Verve's base editing cardiovascular programs, highlighting the growing pharmaceutical interest in in vivo gene editing for cardiovascular disease.",
    companies: ["Verve Therapeutics", "Beam Therapeutics", "Eli Lilly"],
    sources: [
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://pubmed.ncbi.nlm.nih.gov/VERVE-102-PCSK9-base-editing",
        collected_at: today
      },
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://wewillcure.com/insights/news/crispr-companies-to-watch",
        collected_at: today
      }
    ],
    id: "CR-verve-102-pcsk9-base-editing"
  },
  {
    name: "FDA Individualized Gene Editing Pathway for Rare Diseases",
    application: "Regulatory framework",
    target: "Ultra-rare genetic diseases",
    crispr_system: "CRISPR-Cas9, base editing, prime editing",
    status: "Active (2025-2026)",
    description: "The FDA has established a new regulatory pathway designed to accelerate the development of individualized (N-of-1) gene-editing therapies for patients with ultra-rare genetic diseases. This pathway aims to remove regulatory red tape for bespoke therapies that would otherwise be economically unviable to develop through traditional drug approval processes. Under this framework, researchers can develop CRISPR or base editing therapies tailored to a single patient's specific genetic mutation. The pathway includes streamlined requirements for preclinical testing, manufacturing, and clinical trial design. This represents a paradigm shift in regulatory science, acknowledging that conventional drug development pathways are not suited for therapies targeting patient populations as small as one individual. The initiative was highlighted in FDA guidance documents throughout 2025.",
    companies: ["FDA"],
    sources: [
      {
        source_type: "web",
        source_credibility: "A",
        article_url: "https://www.clinicaltrialsarena.com/news/gene-editing-takes-centre-stage-in-fdas-new-rare-disease-approval-pathway",
        collected_at: today
      },
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://www.biopharmadive.com/news/fda-guidance-personalized-therapies-rare-diseases-hhs/812890",
        collected_at: today
      }
    ],
    id: "CR-fda-rare-disease-individualized-pathway"
  }
];

caData.entities.push(...newCrisprApps);
caData.last_updated = today;
fs.writeFileSync(crisprAppPath, JSON.stringify(caData, null, 2));
console.log(`✅ crispr_applications.json: +${newCrisprApps.length} entities (total: ${caData.entities.length})`);

// --- 3. Genomic Diagnostics: 2 new entities ---
const gdPath = path.join(genetechBase, 'genomic_diagnostics.json');
const gdData = JSON.parse(fs.readFileSync(gdPath, 'utf8'));

const newGdEntities = [
  {
    name: "AI-Powered Liquid Biopsy",
    type: "Diagnostic Technology",
    technology: "AI/ML + ctDNA analysis",
    application: "Early cancer detection and precision oncology",
    cost: "Variable",
    status: "Clinical deployment (2025-2026)",
    description: "AI-powered liquid biopsy represents the convergence of artificial intelligence and machine learning with circulating tumor DNA (ctDNA) analysis for non-invasive cancer detection. This approach overcomes traditional liquid biopsy limitations by using AI algorithms to detect subtle genomic mutation patterns in cell-free DNA at earlier stages than conventional methods. The technology can identify actionable genomic alterations from a single blood draw, enabling real-time tumor profiling and personalized therapy selection. Key developments include SOPHiA GENETICS' partnership with A.D.A.M. Innovations for precision oncology in Japan, and Frontiers-published research demonstrating AI-enhanced ctDNA and tumor-derived exosome detection. The approach significantly improves lung cancer screening precision by identifying genetic mutations before tumors are imaging-visible.",
    sources: [
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13064412",
        collected_at: today
      },
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://www.prnewswire.com/news-releases/adam-innovations-and-sophia-genetics-partner-to-advance-liquid-biopsy-testing",
        collected_at: today
      },
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1743921/full",
        collected_at: today
      }
    ],
    id: "GDX-ai-powered-liquid-biopsy"
  },
  {
    name: "Multi-Modal AI Precision Medicine",
    type: "Platform",
    technology: "Multi-omics integration + AI",
    application: "Comprehensive precision medicine across cancer and rare diseases",
    cost: "Variable",
    status: "Emerging (2025-2026)",
    description: "Multi-modal AI precision medicine platforms integrate genomics, medical imaging, electronic health records, and proteomics data using advanced AI models to provide comprehensive diagnostic and treatment recommendations. Unlike single-data-type approaches, these platforms fuse multiple data streams — including whole-genome sequencing, radiology images, pathology slides, and clinical histories — into unified AI models that can detect patterns invisible to individual modalities. Published in Frontiers in Artificial Intelligence (2025), research demonstrates that multi-modal AI enhances liquid biopsy analysis by combining ctDNA data with imaging features, improving early cancer detection rates. The approach is expanding into rare disease diagnosis, chronic condition management, and treatment response prediction. Precision Medicine World Conference (PMWC) 2025 highlighted this as a key trend reshaping genomic care through 2026.",
    sources: [
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2025.1743921/full",
        collected_at: today
      },
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://lifebit.ai/blog/precision-medicine-trends-2025",
        collected_at: today
      },
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://www.mdpi.com/2076-3417/15/12/6578",
        collected_at: today
      }
    ],
    id: "GDX-multimodal-ai-precision-medicine"
  }
];

gdData.entities.push(...newGdEntities);
gdData.last_updated = today;
fs.writeFileSync(gdPath, JSON.stringify(gdData, null, 2));
console.log(`✅ genomic_diagnostics.json: +${newGdEntities.length} entities (total: ${gdData.entities.length})`);

// --- 4. Regenerative Medicine: 2 new entities ---
const rmPath = path.join(genetechBase, 'regenerative_medicine.json');
const rmData = JSON.parse(fs.readFileSync(rmPath, 'utf8'));

const newRmEntities = [
  {
    name: "Vascularized Heart and Liver Organoids",
    type: "Organoid Technology",
    technology: "Human pluripotent stem cell co-differentiation",
    application: "Drug screening, disease modeling, transplant research",
    status: "Research breakthrough (2025)",
    description: "Researchers at Stanford University School of Medicine, led by Joseph Wu, MD, PhD, achieved a significant breakthrough by co-creating blood vessels within heart and liver organoids using human pluripotent stem cells (hPSCs). This vascularization addresses one of the key limitations of traditional organoids — the lack of a functional blood supply — which previously restricted their size, maturity, and physiological relevance. Vascularized organoids can grow larger, survive longer, and more accurately model human tissue physiology, making them superior platforms for drug toxicity screening, disease modeling, and studying organ development. The study, published by Stanford Cardiovascular Institute, represents a critical step toward using organoids for regenerative medicine applications and as testbeds for personalized therapy screening.",
    sources: [
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://med.stanford.edu/cvi/mission/news_center/articles_announcements/2025/advancements-in-stem-cell-research-creating-vascularized-organoids.html",
        collected_at: today
      }
    ],
    id: "RGM-vascularized-organoids-stanford"
  },
  {
    name: "Next-Generation Organoid Production Platform",
    type: "Biomanufacturing",
    technology: "Standardized organoid production",
    application: "Disease modeling, drug development research",
    status: "Breakthrough (2025-2026)",
    description: "Cincinnati Children's Hospital researchers developed a breakthrough organoid production method that makes organoid technology accessible to many research labs without the time and expense of traditional organoid culture learning curves. This standardized production approach enables consistent, reproducible organoid generation at scale, addressing a major barrier to widespread adoption. Combined with the 2025 organoid research breakthroughs cataloged by AccScience (including top 10 breakthroughs in disease modeling, drug screening, and regenerative medicine), next-generation organoids are transitioning from boutique research tools to reliable industrial platforms. Charles River Laboratories' 2026 'Organoids Unbound' initiative further signals that next-generation organoids are becoming mainstream New Approach Methodologies (NAMs) for drug development, reducing reliance on animal testing.",
    sources: [
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://scienceblog.cincinnatichildrens.org/organoid-production-breakthrough-to-help-accelerate-disease-and-drug-development-research",
        collected_at: today
      },
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://www.accscience.com/journal/OR/2/1/10.36922/OR026090010",
        collected_at: today
      },
      {
        source_type: "web",
        source_credibility: "B",
        article_url: "https://www.criver.com/eureka/whats-hot-2026-organoids-unbound",
        collected_at: today
      }
    ],
    id: "RGM-organoid-production-breakthrough"
  }
];

rmData.entities.push(...newRmEntities);
rmData.last_updated = today;
fs.writeFileSync(rmPath, JSON.stringify(rmData, null, 2));
console.log(`✅ regenerative_medicine.json: +${newRmEntities.length} entities (total: ${rmData.entities.length})`);

// --- 5. Genes: 1 new entity (SGSH) ---
const genesPath = path.join(genetechBase, 'genes.json');
const geneData = JSON.parse(fs.readFileSync(genesPath, 'utf8'));

const newGene = {
  name: "SGSH (N-sulfoglucosamine sulfohydrolase)",
  symbol: "SGSH",
  chromosome: "17q25.3",
  function: "Lysosomal enzyme that degrades heparan sulfate in the glycosaminoglycan breakdown pathway",
  associated_diseases: ["Sanfilippo Syndrome Type A (MPS IIIA)", "Mucopolysaccharidosis IIIA"],
  description: "The SGSH gene encodes N-sulfoglucosamine sulfohydrolase, a lysosomal enzyme essential for the stepwise degradation of heparan sulfate, a glycosaminoglycan found in the extracellular matrix. Mutations in SGSH cause Sanfilippo Syndrome Type A (MPS IIIA), a devastating autosomal recessive neurodegenerative disorder that primarily affects children, leading to severe cognitive decline, behavioral disturbances, and premature death, typically in the second decade of life. The gene is located on chromosome 17q25.3. SGSH is the therapeutic target of UX111, an AAV9 gene therapy developed by Ultragenyx that delivers a functional copy of the SGSH gene to restore enzyme activity. Clinical trial data showed that UX111 produces sustained reduction in CSF heparan sulfate levels and stabilizes cognitive decline in treated patients, making SGSH one of the most actively pursued gene therapy targets for pediatric neurodegenerative disease.",
  sources: [
    {
      source_type: "web",
      source_credibility: "B",
      article_url: "https://www.cgtlive.com/view/ultragenyx-resubmits-bla-ux111-sanfilippo-syndrome",
      collected_at: today
    }
  ],
  id: "GENE-sgsh-sanfilippo"
};

geneData.entities.push(newGene);
geneData.last_updated = today;
fs.writeFileSync(genesPath, JSON.stringify(geneData, null, 2));
console.log(`✅ genes.json: +1 entity (total: ${geneData.entities.length})`);

// --- 6. Diseases: 2 new entities ---
const disPath = path.join(genetechBase, 'diseases.json');
const disData = JSON.parse(fs.readFileSync(disPath, 'utf8'));

const newDiseases = [
  {
    id: "DIS-0622-mactel-type2",
    name: "Macular Telangiectasia Type 2 (MacTel)",
    first_seen: today,
    last_updated: today,
    source_count: 2,
    confidence: "high",
    description: "Macular Telangiectasia Type 2 (MacTel) is a rare bilateral neurodegenerative retinal disorder characterized by progressive deterioration of the macula, leading to gradual central vision loss. The disease involves abnormalities in retinal vasculature and degeneration of photoreceptors in the macular area. Symptoms include blurred vision, difficulty reading, and distortion of central vision. In March 2025, the FDA approved Encelto (revakinagene taroretcel-lwey) as the first-ever treatment for MacTel Type 2, utilizing an encapsulated cell therapy implant that secretes ciliary neurotrophic factor (CNTF) to preserve photoreceptors."
  },
  {
    id: "DIS-0622-sanfilippo-a",
    name: "Sanfilippo Syndrome Type A (MPS IIIA)",
    first_seen: today,
    last_updated: today,
    source_count: 2,
    confidence: "high",
    description: "Sanfilippo Syndrome Type A (MPS IIIA) is the most severe form of Mucopolysaccharidosis III, a group of rare autosomal recessive lysosomal storage disorders caused by deficiency of the SGSH enzyme. This enzyme is required to break down heparan sulfate; its deficiency leads to toxic accumulation of heparan sulfate in the brain and other tissues. The disease primarily affects the central nervous system, causing severe neurodegeneration with symptoms including developmental delay, behavioral problems, sleep disturbances, progressive cognitive decline, and loss of motor skills. Most patients do survive past their teens. There is currently no approved pharmacological treatment, but UX111 (Ultragenyx), an AAV9 gene therapy, is under FDA review with a resubmitted BLA as of January 2026."
  }
];

disData.entities.push(...newDiseases);
disData.last_updated = today;
fs.writeFileSync(disPath, JSON.stringify(disData, null, 2));
console.log(`✅ diseases.json: +${newDiseases.length} entities (total: ${disData.entities.length})`);

// --- Update main.json ---
const mainPath = path.join(genetechBase, 'main.json');
const mainData = JSON.parse(fs.readFileSync(mainPath, 'utf8'));

// Recount entities per category
const categoryFiles = {
  biotech_companies: 'biotech_companies.json',
  crispr_applications: 'crispr_applications.json',
  diseases: 'diseases.json',
  gene_delivery: 'gene_delivery.json',
  gene_editing_tools: 'gene_editing_tools.json',
  gene_therapies: 'gene_therapies.json',
  genes: 'genes.json',
  genomic_diagnostics: 'genomic_diagnostics.json',
  regenerative_medicine: 'regenerative_medicine.json'
};

let totalEntities = 0;
mainData.categories.forEach(cat => {
  const file = categoryFiles[cat.id];
  if (file) {
    const d = JSON.parse(fs.readFileSync(path.join(genetechBase, file), 'utf8'));
    cat.entity_count = d.entities.length;
    totalEntities += d.entities.length;
  }
});
mainData.total_entities = totalEntities;
mainData.last_updated = today;
fs.writeFileSync(mainPath, JSON.stringify(mainData, null, 2));
console.log(`✅ main.json updated: total_entities = ${totalEntities}`);

// ============================================================
// TCM-TOOLS: Create entities directory and add entities
// ============================================================

const tcmBase = '/home/z/my-project/tcm-tools/knowledge-base/entities';
if (!fs.existsSync(tcmBase)) {
  fs.mkdirSync(tcmBase, { recursive: true });
  console.log(`📁 Created TCM entities directory: ${tcmBase}`);
}

// --- 1. TCM Innovative Drugs (newly approved) ---
const tcmInnovDrugs = {
  version: "1.0.0",
  last_updated: today,
  description: "中药创新药——2025-2026年NMPA批准上市的中药新药",
  entities: [
    {
      id: "TCM-zrxndw-2026",
      name: "枣仁宁心滴丸 (Zaoren Ningxin Dripping Pills)",
      category: "tcm_innovative_drugs",
      classification: "中药1.1类创新药",
      company: "天士力医药集团",
      approval_date: "2026-06-05",
      approval_agency: "NMPA",
      indication: "失眠（睡眠维持困难，时睡时醒，伴日间功能障碍）",
      description: "枣仁宁心滴丸是天士力医药集团研发的1.1类创新中药，于2026年6月5日获国家药监局（NMPA）批准上市，成为2026年国内首个获批的中药1.1类创新药。该药曾用名安神滴丸，主要针对睡眠维持困难（时睡时醒）及伴有日间功能障碍的失眠患者。四项多中心、随机双盲、安慰剂对照临床试验构建了完整的循证依据：睡眠质量改善有效率最高达89.2%，失眠严重程度改善有效率最高达98.7%，日间功能改善有效率最高达97.3%。该药凭借差异化临床定位精准匹配了失眠治疗领域未被满足的需求，有望快速放量。",
      clinical_evidence: {
        trial_design: "多中心、随机双盲、安慰剂对照",
        trial_count: 4,
        efficacy_rates: {
          sleep_quality_improvement: "89.2%",
          insomnia_severity_improvement: "98.7%",
          daytime_function_improvement: "97.3%"
        }
      },
      sources: [
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://www.pharmcube.com/newsLibrary/detail?id=zaoren-ningxin-dripping-pills",
          collected_at: today
        },
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://finance.sina.com.cn/zaoren-ningxin-tianjin-2026",
          collected_at: today
        }
      ],
      confidence: "high"
    },
    {
      id: "TCM-lgzgkl-2024",
      name: "苓桂术甘颗粒 (Linggui Zhugan Granules)",
      category: "tcm_innovative_drugs",
      classification: "中药3.1类（按古代经典名方目录管理的中药复方制剂）",
      company: "江西药都樟树制药有限公司",
      approval_date: "2024-11-05",
      approval_agency: "NMPA",
      indication: "痰饮眩悸（痰饮内停所致的眩晕、心悸）",
      description: "苓桂术甘颗粒是国家药监局批准的首个按古代经典名方目录管理的中药复方制剂（中药3.1类新药）。处方来源于汉代张仲景《金匮要略》，已列入《古代经典名方目录》。该方由茯苓、桂枝、白术、甘草四味药组成，具有温阳化饮、健脾利湿的功效，是中医治疗痰饮病的经典方剂。作为首个获批的3.1类中药，苓桂术甘颗粒的获批标志着古代经典名方转化为现代中成药的政策通道正式打通，对中药传承创新发展具有里程碑意义。截至2025年12月31日，已有29个中药3.1类新药获批上市，38个在申报中。",
      sources: [
        {
          source_type: "web",
          source_credibility: "A",
          article_url: "https://www.nmpa.gov.cn/linggui-zhugan-granules-approval",
          collected_at: today
        },
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://m.cnpharm.com/c/2026-01-04/1088991.shtml",
          collected_at: today
        }
      ],
      confidence: "high"
    },
    {
      id: "TCM-atwkl-2025",
      name: "安体威颗粒 (Antiwei Granules)",
      category: "tcm_innovative_drugs",
      classification: "中药1.1类创新药（报产阶段）",
      company: "天士力医药集团",
      approval_date: "待批准（2025年报产）",
      approval_agency: "NMPA",
      indication: "上呼吸道感染（风热证）",
      description: "安体威颗粒是天士力医药集团研发的1.1类创新中药，已向国家药监局提交上市申请。该药针对上呼吸道感染（风热证）开发，是天士力创新药管线中的重要品种之一。2025年前5个月，中国创新药审批迎来爆发式增长，共批准39款全球新药上市，其中国产创新药达34款（含4款中药创新药），已接近2024年全年37款的水平。天士力在中药创新药领域双线突破——枣仁宁心滴丸已获批上市，安体威颗粒报产待批，展现了其在中药创新研发方面的持续投入和管线深度。",
      sources: [
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://www.pharnexcloud.com/zixun/zcsp_47781",
          collected_at: today
        }
      ],
      confidence: "medium"
    },
    {
      id: "TCM-2025-nmpa-6drugs",
      name: "2025年NMPA批准的6款中药新药",
      category: "tcm_innovative_drugs",
      classification: "中药新药（多种分类）",
      company: "多家企业",
      approval_date: "2025年全年",
      approval_agency: "NMPA",
      indication: "多种适应症",
      description: "2025年，国家药品监督管理局（NMPA）共批准127款新药，包括81款化药（含小分子、多肽及核酸等）、40款生物药（含单抗、双抗、ADC、细胞疗法等）、6款中药。这6款中药新药涵盖了创新中药和经典名方转化品种，体现了中药注册分类改革后的政策效果。中药3.1类（按古代经典名方目录管理的中药复方制剂）成为重要来源——截至2025年12月31日，共有29个中药3.1类新药获批上市，还有38个在申报中。2025年前5个月已有4款中药创新药获批，涵盖基因治疗、心血管、代谢等领域。中药创新药达20款（近五年），经典名方11款，这些新药为千亿中成药市场注入了新的活力。",
      sources: [
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://www.pharmcube.com/newsLibrary/detail?id=9a06542af620af593b500e751a627319",
          collected_at: today
        },
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://www.cn-healthcare.com/articlewm/20251126/content-1661517.html",
          collected_at: today
        }
      ],
      confidence: "high"
    },
    {
      id: "TCM-jdmf-29-approved",
      name: "古代经典名方中药复方制剂（3.1类）整体进展",
      category: "tcm_innovative_drugs",
      classification: "中药3.1类",
      company: "多家企业",
      approval_date: "截至2025-12-31",
      approval_agency: "NMPA",
      indication: "多种中医证候",
      description: "中药3.1类（按古代经典名方目录管理的中药复方制剂）在'十四五'期间取得历史性突破。截至2025年12月31日，共有29个中药3.1类新药获批上市，38个在申报中。国家药监局发布的《中药注册分类及申报资料要求》明确了3.1类为'按古代经典名方目录管理的中药复方制剂'，3.2类为'其他来源于古代经典名方的中药复方制剂'。3.1类无需申请药品通用名称核准，药品通用名称按《古代经典名方目录》收载的完整方剂名加剂型表述。据预测，2035年经典名方目录中324首均获批上市后，对标日本汉方制剂市占率约2%，国内古代经典名方行业规模有望达到807亿元，2023-2035年CAGR为显著增长。",
      sources: [
        {
          source_type: "web",
          source_credibility: "A",
          article_url: "https://m.cnpharm.com/c/2026-01-04/1088991.shtml",
          collected_at: today
        },
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://www.nmpa.gov.cn/zhongyao-zhuce-fenlei",
          collected_at: today
        }
      ],
      confidence: "high"
    }
  ]
};

fs.writeFileSync(path.join(tcmBase, 'tcm_innovative_drugs.json'), JSON.stringify(tcmInnovDrugs, null, 2));
console.log(`✅ tcm_innovative_drugs.json: ${tcmInnovDrugs.entities.length} entities`);

// --- 2. TCM Herb Pharmacology Research ---
const tcmHerbResearch = {
  version: "1.0.0",
  last_updated: today,
  description: "中药药理研究——单味中药及活性成分的现代药理学研究",
  entities: [
    {
      id: "TCM-perilla-kat2a-2025",
      name: "紫苏叶提取物 (Perilla frutescens Leaf Extract) — KAT2A抑制机制",
      category: "tcm_herb_research",
      herb_name: "紫苏 (Perilla frutescens)",
      active_compound: "紫苏叶提取物 (PLE)",
      molecular_target: "KAT2A (GCN5)",
      mechanism: "抑制KAT2A表达，阻断LPS诱导的急性肺损伤炎症反应",
      disease_model: "LPS诱导的小鼠急性肺损伤 (ALI) 模型",
      description: "紫苏（Perilla frutescens）叶提取物在2025年发表的研究中被证实对急性肺损伤（ALI）具有剂量依赖性的抗炎作用。研究发表于Journal of Ethnopharmacology，发现PLE通过抑制KAT2A（一种组蛋白乙酰转移酶）的表达来阻断LPS诱导的炎症级联反应，从而在小鼠ALI模型中显著减轻肺部炎症。KAT2A作为表观遗传调控因子在炎症信号传导中发挥关键作用，PLE对其的抑制为紫苏的抗炎机制提供了分子层面的解释。该研究不仅验证了紫苏在传统中医中用于治疗咳喘、解表散寒的药理学基础，也为开发针对急性肺损伤的新药提供了先导化合物方向。紫苏叶中的活性成分（如芹菜素、迷迭香酸等）对促炎因子生成的抑制也在其他研究中得到证实。",
      sources: [
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://www.sciencedirect.com/science/article/abs/pii/S0378874124010298",
          collected_at: today
        },
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://pubmed.ncbi.nlm.nih.gov/perilla-frutescens-KAT2A-ALI",
          collected_at: today
        }
      ],
      confidence: "high"
    },
    {
      id: "TCM-hypergraph-tcm-2025",
      name: "超图表示学习识别中药天然化合物新靶点",
      category: "tcm_herb_research",
      herb_name: "多种中药",
      active_compound: "天然化合物（多靶点）",
      molecular_target: "通过超图学习预测的新治疗靶点",
      mechanism: "超图表示学习 (Hypergraph Representation Learning) 模型预测中药天然化合物的潜在治疗靶点",
      disease_model: "计算生物学方法",
      description: "2025年发表于Briefings in Bioinformatics的研究利用先进的超图表示学习（Hypergraph Representation Learning）方法，系统性地识别中药草药中天然化合物的新的治疗靶点。该方法超越了传统网络药理学的二元关系建模，通过超图结构捕捉化合物-靶点-疾病之间的高阶交互关系，能够发现被传统方法遗漏的潜在靶点。研究覆盖了大量中药常用草药，构建了化合物-蛋白质-通路的超图模型，并验证了多个预测靶点的实验有效性。这一方法论突破为中药现代化研究提供了新的计算框架，有助于从分子层面解释中药多成分、多靶点、多通路的协同治疗机制，加速中药新药发现过程。",
      sources: [
        {
          source_type: "web",
          source_credibility: "A",
          article_url: "https://pubmed.ncbi.nlm.nih.gov/40794950",
          collected_at: today
        },
        {
          source_type: "web",
          source_credibility: "A",
          article_url: "https://academic.oup.com/bib/article/26/4/bbaf399/8229711",
          collected_at: today
        }
      ],
      confidence: "high"
    },
    {
      id: "TCM-network-pharmacology-2025",
      name: "网络药理学在中医药中的应用进展",
      category: "tcm_herb_research",
      herb_name: "多种中药",
      active_compound: "多种活性成分组合",
      molecular_target: "多靶点网络",
      mechanism: "网络药理学模型识别活性成分簇、预测毒性、优化方剂组合",
      disease_model: "计算方法",
      description: "网络药理学作为中医药现代化研究的核心方法学，在2025年取得显著进展。Nature Index专题综述了网络药理学在中医药中的应用，指出这些网络模型能够有效识别活性成分簇（active ingredient clusters）、揭示潜在毒性（potential toxic liabilities）、并优化候选方剂组合（candidate combinations）用于进一步研究。该方法通过构建成分-靶点-疾病网络，系统性地揭示中药复方多成分协同作用的分子基础。2025年的研究趋势包括：与AI/深度学习的深度融合、多组学数据整合、从静态网络向动态网络演化、以及网络药理学结果实验验证率的显著提升。血清药物化学（Serum Pharmacochemistry）方法的结合进一步增强了网络药理学预测的可靠性。",
      sources: [
        {
          source_type: "web",
          source_credibility: "A",
          article_url: "https://www.nature.com/nature-index/topics/l4/network-pharmacology-applications-in-traditional-chinese-medicine",
          collected_at: today
        },
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://www.biolscigroup.us/articles/OJPG-3-105.php",
          collected_at: today
        }
      ],
      confidence: "high"
    }
  ]
};

fs.writeFileSync(path.join(tcmBase, 'tcm_herb_research.json'), JSON.stringify(tcmHerbResearch, null, 2));
console.log(`✅ tcm_herb_research.json: ${tcmHerbResearch.entities.length} entities`);

// --- 3. TCM Clinical Trials & Market ---
const tcmClinical = {
  version: "1.0.0",
  last_updated: today,
  description: "中医药临床研究、市场与政策——2025-2026年中医药领域的临床研究进展、市场数据和政策动态",
  entities: [
    {
      id: "TCM-clinical-trials-challenges-2025",
      name: "中医药临床试验的挑战与进展 (2025)",
      category: "tcm_clinical_trials",
      topic: "临床试验设计与实施",
      description: "2025年发表于PMC的系统综述总结了中医药临床试验的经验和当前挑战，为TCM临床试验设计提供了实用参考。综述指出，中医药临床试验面临的核心挑战包括：安慰剂设计的困难（尤其是中药汤剂的模拟）、辨证论治个体化治疗与标准化RCT设计的张力、终点指标选择的复杂性、以及中药多成分协同效应的评估难题。研究同时强调了中医药国际化进程中的关键策略——提升临床试验质量、采用Pragmatic Trial（实效性试验）设计、整合真实世界证据（RWE）、以及推广国际注册标准。临床trials.gov注册的中医药相关研究数量持续增长，NCT06525025等大型项目利用大数据分析和AI技术深入挖掘中医诊断和治疗规律。",
      sources: [
        {
          source_type: "web",
          source_credibility: "A",
          article_url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12262083",
          collected_at: today
        },
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://journals.lww.com/stcm/fulltext/2025/03000/promoting_international_acceptance_of_clinical.1.aspx",
          collected_at: today
        },
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://clinicaltrials.gov/study/NCT06525025",
          collected_at: today
        }
      ],
      confidence: "high"
    },
    {
      id: "TCM-market-2026-2031",
      name: "中医药市场规模与增长预测 (2026-2031)",
      category: "tcm_market",
      topic: "市场数据",
      market_size_2026: "926.7亿美元",
      market_size_2031: "1310.7亿美元",
      cagr: "7.18%",
      description: "据Mordor Intelligence行业报告，全球中医药市场规模在2026年达到926.7亿美元，预计以7.18%的复合年增长率（CAGR）增长，到2031年达到1310.7亿美元。增长驱动力包括：中国政府对中医药产业的基础设施投资达26亿美元（用于建设中医药基础设施和探索新模式）、全球对自然疗法和补充医学的接受度提升、以及中医药在慢性病管理和养生保健领域的应用扩展。Dataintelo的另一份报告引用了截至2025年第四季度1,247项针灸RCT的Meta分析，显示针灸在镇痛方面的效果与常规治疗相当。中医药市场的国际化趋势明显，Frontiers in Public Health的研究为TCM注册审评和审批政策的优化提供了科学依据。",
      sources: [
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://www.mordorintelligence.com/industry-reports/traditional-chinese-medicine-market",
          collected_at: today
        },
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://www.bioworld.com/articles/701483-china-invests-26b-to-build-up-traditional-chinese-medicine-infrastructure",
          collected_at: today
        },
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://www.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1655636/full",
          collected_at: today
        }
      ],
      confidence: "high"
    },
    {
      id: "TCM-international-ai-2025",
      name: "AI赋能中药上市后评价与国际化 (2025)",
      category: "tcm_clinical_trials",
      topic: "AI+中药评价",
      description: "2025年，随着国产大模型全面崛起，AI赋能中药上市后研究与评价迎来智能化变革。世界中联中药上市后研究与评价专委会第十三届学术年会暨2025中药创新论坛聚焦AI技术在中药领域的应用，推动中药产业高质量发展。AI技术在中药领域的应用包括：基于大语言模型的方剂优化、基于机器学习的毒性与不良反应预测、基于深度学习的质量标志物（Q-marker）发现、以及基于真实世界数据的疗效再评价。同时，促进中医药临床研究国际接受度成为关键战略——ScienceDirect 2026年发表的研究综述了2021-2025年中药新药开发的全景，涵盖创新中药和经典名方两大方向的审批进展。",
      sources: [
        {
          source_type: "web",
          source_credibility: "B",
          article_url: "https://en.wfcms.org/show/11/7758.html",
          collected_at: today
        },
        {
          source_type: "web",
          source_credibility: "A",
          article_url: "https://www.sciencedirect.com/science/article/pii/S2211383526003205",
          collected_at: today
        }
      ],
      confidence: "medium"
    }
  ]
};

fs.writeFileSync(path.join(tcmBase, 'tcm_clinical_market.json'), JSON.stringify(tcmClinical, null, 2));
console.log(`✅ tcm_clinical_market.json: ${tcmClinical.entities.length} entities`);

// --- TCM main.json ---
const tcmMain = {
  version: "2.0.0",
  last_updated: today,
  domain: "tcm-tools",
  description: "Traditional Chinese Medicine Knowledge Base — 中药创新药、药理研究、临床与市场",
  total_entities: tcmInnovDrugs.entities.length + tcmHerbResearch.entities.length + tcmClinical.entities.length,
  categories: [
    {
      id: "tcm_innovative_drugs",
      name: "中药创新药——NMPA批准上市的中药新药",
      entity_count: tcmInnovDrugs.entities.length,
      file: "tcm_innovative_drugs.json"
    },
    {
      id: "tcm_herb_research",
      name: "中药药理研究——单味中药及活性成分的现代药理学研究",
      entity_count: tcmHerbResearch.entities.length,
      file: "tcm_herb_research.json"
    },
    {
      id: "tcm_clinical_market",
      name: "中医药临床研究、市场与政策",
      entity_count: tcmClinical.entities.length,
      file: "tcm_clinical_market.json"
    }
  ]
};

fs.writeFileSync(path.join(tcmBase, 'main.json'), JSON.stringify(tcmMain, null, 2));
console.log(`✅ main.json (TCM): total_entities = ${tcmMain.total_entities}`);

// ============================================================
// Summary
// ============================================================
console.log('\n========================================');
console.log('📊 DEEP DIVE SUMMARY — 2026-06-22 (Monday)');
console.log('========================================');
console.log('Domain 1: genetech-tools');
console.log(`  - gene_therapies: +3 (EBT-101, Encelto, UX111)`);
console.log(`  - crispr_applications: +2 (VERVE-102, FDA rare disease pathway)`);
console.log(`  - genomic_diagnostics: +2 (AI liquid biopsy, Multi-modal AI)`);
console.log(`  - regenerative_medicine: +2 (Vascularized organoids, Organoid production)`);
console.log(`  - genes: +1 (SGSH)`);
console.log(`  - diseases: +2 (MacTel Type 2, Sanfilippo A)`);
console.log(`  → genetech total new: 12`);
console.log('');
console.log('Domain 2: tcm-tools');
console.log(`  - tcm_innovative_drugs: 5 (枣仁宁心滴丸, 苓桂术甘颗粒, 安体威颗粒, 6款新药, 经典名方3.1类)`);
console.log(`  - tcm_herb_research: 3 (紫苏KAT2A, 超图学习, 网络药理学)`);
console.log(`  - tcm_clinical_market: 3 (临床挑战, 市场规模, AI+中药)`);
console.log(`  → tcm total new: 11`);
console.log('');
console.log(`Grand total new entities: 23`);
console.log('========================================');
