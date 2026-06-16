const DB = {
  "updated": "2026-05-29T02:27:01.435Z",
  "stats": {
    "bci_devices": 8,
    "brain_disorders": 8,
    "brain_regions": 10,
    "consciousness_research": 5,
    "neurotech": 7,
    "neurotransmitters": 8
  },
  "bci": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:44:16.567Z",
    "description": "脑机接口库",
    "entities": [
      {
        "id": "BCI-001",
        "name": "Neuralink N1",
        "company": "Neuralink",
        "type": "侵入式",
        "channels": "1024",
        "status": "人体试验",
        "applications": [
          "瘫痪恢复",
          "视觉假体"
        ]
      },
      {
        "id": "BCI-002",
        "name": "BrainGate",
        "company": "BrainGate",
        "type": "侵入式",
        "channels": "128",
        "status": "人体试验",
        "applications": [
          "打字控制",
          "机械臂"
        ]
      },
      {
        "id": "BCI-003",
        "name": "Synchron Stentrode",
        "company": "Synchron",
        "type": "血管内",
        "channels": "16",
        "status": "人体试验",
        "applications": [
          "文字输入",
          "设备控制"
        ]
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
          "冥想"
        ]
      },
      {
        "id": "BCI-005",
        "name": "OpenBCI Cyton",
        "company": "OpenBCI",
        "type": "非侵入式EEG",
        "channels": "16",
        "status": "商用开源",
        "applications": [
          "研究",
          "DIY"
        ]
      }
    ]
  },
  "bci_devices": [
    {
      "id": "BCI-001",
      "name": "Neuralink N1",
      "type": "Invasive (ECoG-style)",
      "invasiveness": "Minimally invasive - 1,024 electrodes on flexible threads inserted by surgical robot",
      "channels": "1,024",
      "developer": "Neuralink (Elon Musk)",
      "status": "First human implant January 2024; second implant July 2024; clinical trials ongoing",
      "clinical_trial": "FDA IDE approved for PRIME study (quadriplegic patients)",
      "description": "Neuralink's N1 implant features 1,024 electrodes on 64 threads thinner than human hair, inserted by a specialized surgical robot. First human patient Noland Arbaugh demonstrated chess playing and cursor control. The device is coin-sized, wireless, and rechargeable. Thread retraction issues in the first patient reduced effective channels but were partially mitigated by software."
    },
    {
      "id": "BCI-002",
      "name": "BrainGate2",
      "type": "Invasive (intracortical Utah array)",
      "invasiveness": "Invasive - silicon microelectrode arrays penetrating cortex 1-1.5mm",
      "channels": "96-128 per array (up to 2 arrays)",
      "developer": "BrainGate consortium (Brown University, MGH, Stanford, Case Western)",
      "status": "Clinical trials ongoing since 2004; longest-running BCI human trial",
      "clinical_trial": "BrainGate2 IDE (NCT00964165)",
      "description": "The longest-running human BCI trial. BrainGate2 has demonstrated that paralyzed patients can control computer cursors, robotic arms, and tablets using thought alone. Recent breakthroughs include high-rate handwriting decoding (90 characters/min) and speech decoding. Utah arrays have durability limitations (gliosis after ~5 years)."
    },
    {
      "id": "BCI-003",
      "name": "Stentrode",
      "type": "Endovascular (minimally invasive)",
      "invasiveness": "Minimally invasive - inserted via jugular vein, deployed in superior sagittal sinus",
      "channels": "16",
      "developer": "Synchron",
      "status": "First human implant 2019 (Australia); FDA IDE approved 2021; US clinical trial ongoing",
      "clinical_trial": "COMMAND trial (FDA IDE); ENDOW trial (Australia)",
      "description": "Synchron's Stentrode is the only endovascular BCI - it's deployed through blood vessels without open brain surgery. The nickel-titanium stent-electrode array is positioned in the superior sagittal sinus adjacent to motor cortex. Patients have achieved text generation, internet browsing, and Apple Vision Pro control. Less signal resolution than cortical implants but dramatically safer."
    },
    {
      "id": "BCI-004",
      "name": "ECoG Speech Decoder (UCSF)",
      "type": "Invasive (ECoG)",
      "invasiveness": "Invasive - subdural electrode grid placed on brain surface (no penetration)",
      "channels": "128-256",
      "developer": "UCSF Chang Lab",
      "status": "Clinical research; demonstrated 62 words/min speech decoding (2023)",
      "clinical_trial": "UCSF BCI speech restoration study",
      "description": "Edward Chang's lab at UCSF achieved a landmark in 2023: decoding attempted speech from a paralyzed patient at 62 words per minute using ECoG arrays. The system decodes phonemes from motor cortex activity and synthesizes speech with a voice matching the patient's pre-injury voice. This approaches natural conversation speed (~150 words/min)."
    },
    {
      "id": "BCI-005",
      "name": "NeuroPace RNS",
      "type": "Invasive (responsive neurostimulator)",
      "invasiveness": "Invasive - implanted in skull with cortical strip and depth leads",
      "channels": "4-6 (2 cortical strips + 1-2 depth leads)",
      "developer": "NeuroPace",
      "status": "FDA approved 2013 for refractory epilepsy; 1,000+ implants",
      "clinical_trial": "FDA PMA approved; post-market studies ongoing",
      "description": "The only FDA-approved closed-loop BCI. The RNS System continuously monitors brain activity and delivers targeted electrical stimulation when it detects seizure patterns. Clinical data shows 50%+ seizure reduction in responsive patients. The device records EEG data that helps physicians optimize treatment."
    },
    {
      "id": "BCI-006",
      "name": "Paradromics Connex Direct",
      "type": "Invasive (intracortical)",
      "invasiveness": "Invasive - high-channel-count penetrating electrode array",
      "channels": "65,536 (planned)",
      "developer": "Paradromics",
      "status": "First human implant planned 2025; FDA Breakthrough Device designation",
      "clinical_trial": "FDA IDE approved for ALS patients",
      "description": "Paradromics is developing the highest-channel-count BCI with 65,536 electrodes. The Connex Direct uses microwire arrays for high-bandwidth neural recording. FDA granted Breakthrough Device designation. The company aims to enable naturalistic communication for ALS patients at conversational speeds."
    },
    {
      "id": "BCI-007",
      "name": "Precision Neuroscience Layer 7",
      "type": "Minimally invasive (subdural microfilm)",
      "invasiveness": "Minimally invasive - flexible micro-electrode film slipped between skull and brain surface",
      "channels": "1,024 per layer (stackable)",
      "developer": "Precision Neuroscience (Ben Rapoport co-founder)",
      "status": "Temporary human testing demonstrated; working toward FDA approval",
      "clinical_trial": "Pre-clinical; temporary intraoperative testing in humans",
      "description": "Precision's Layer 7 cortical interface is a flexible film that conforms to the brain surface without penetrating tissue. It's designed to be reversible - the implant can be removed without damaging brain tissue. The company demonstrated recording during tumor resection surgeries. Ben Rapoport co-founded Neuralink before starting Precision."
    },
    {
      "id": "BCI-008",
      "name": "Meta EEG Typing BCI",
      "type": "Non-invasive (EEG)",
      "invasiveness": "Non-invasive - external EEG headset",
      "channels": "Standard clinical EEG (64-256)",
      "developer": "Meta Reality Labs / UCSF",
      "status": "Research prototype (2023); not commercialized",
      "clinical_trial": "Research only",
      "description": "Meta demonstrated that non-invasive EEG can decode imagined handwriting at unprecedented speeds for non-invasive systems. Using deep learning, they achieved ~12 words/min from EEG signals. While far slower than invasive systems, this shows non-invasive BCI is improving and could benefit patients who cannot undergo surgery."
    }
  ],
  "brain_disorders": [
    {
      "id": "BDIS-001",
      "name": "Alzheimer's Disease",
      "type": "Neurodegenerative",
      "affected_region": "Hippocampus, entorhinal cortex (early); widespread cortical atrophy (late)",
      "prevalence": "~55 million globally; leading cause of dementia",
      "treatment": "AChE inhibitors (donepezil), memantine, lecanemab (anti-amyloid), donanemab (anti-amyloid)",
      "research_status": "Lecanemab (2023) and donanemab (2024) FDA approved - first disease-modifying treatments; tau-targeting therapies in trials",
      "description": "The most common neurodegenerative disease, characterized by amyloid plaques and neurofibrillary tangles. Lecanemab and donanemab represent the first disease-modifying treatments, slowing cognitive decline by ~27-35% by clearing amyloid. However, they carry ARIA (brain swelling) risk and don't restore lost function. Tau-targeting and anti-inflammatory approaches are next frontiers."
    },
    {
      "id": "BDIS-002",
      "name": "Parkinson's Disease",
      "type": "Neurodegenerative",
      "affected_region": "Substantia nigra (dopaminergic neurons), basal ganglia",
      "prevalence": "~10 million globally; 1% over age 60",
      "treatment": "L-DOPA, dopamine agonists, MAO-B inhibitors, DBS, focused ultrasound",
      "research_status": "Stem cell replacement (Neurocrine/Junji Nakano), gene therapy (AADC, GDNF), α-synuclein immunotherapy in trials",
      "description": "Caused by loss of dopamine-producing neurons in substantia nigra. L-DOPA remains the gold standard after 50+ years. Deep brain stimulation improves motor symptoms. 2024: first stem cell-derived dopamine neuron transplant in human patient (Kyoto University). α-synuclein targeting antibodies (prasinezumab) showed promise in phase 2."
    },
    {
      "id": "BDIS-003",
      "name": "Treatment-Resistant Depression",
      "type": "Psychiatric",
      "affected_region": "Prefrontal cortex, anterior cingulate, amygdala, hippocampus",
      "prevalence": "~30% of depression patients (~100 million globally)",
      "treatment": "Esketamine (Spravato), SAINT TMS, psilocybin (investigational), DBS (investigational)",
      "research_status": "Psilocybin phase 2 showing 50-70% remission; SAINT TMS 79% remission in 5 days; COMPASS phase 3 ongoing",
      "description": "Depression that fails to respond to ≥2 antidepressant trials. Breakthrough treatments include esketamine (FDA approved 2019), Stanford SAINT TMS protocol (5-day intensive treatment), and psilocybin therapy (phase 3 trials). These approaches work through glutamate and neuroplasticity rather than monoamine modulation."
    },
    {
      "id": "BDIS-004",
      "name": "Epilepsy (Drug-Resistant)",
      "type": "Neurological",
      "affected_region": "Varies by type - temporal lobe most common; frontal lobe, occipital",
      "prevalence": "~50 million globally; 30% drug-resistant",
      "treatment": "Anti-epileptic drugs, resective surgery, NeuroPace RNS, DBS, laser ablation, ketogenic diet",
      "research_status": "Closed-loop neurostimulation (NeuroPace), laser interstitial thermal therapy, gene therapy for specific epilepsies",
      "description": "Drug-resistant epilepsy affects ~15 million people. Surgical options include resection, laser ablation (Visualase), and responsive neurostimulation (NeuroPace RNS). Gene therapy targeting specific mutations (e.g., SCN1A in Dravet syndrome) is entering clinical trials. AI seizure prediction is improving neurostimulation timing."
    },
    {
      "id": "BDIS-005",
      "name": "Spinal Cord Injury",
      "type": "Neurological/Neurotrauma",
      "affected_region": "Spinal cord (cervical, thoracic, lumbar levels)",
      "prevalence": "~500,000 new cases/year globally",
      "treatment": "Epidural stimulation, BCI-controlled exoskeletons, stem cell therapy, nerve transfer surgery",
      "research_status": "Epidural stimulation enabling standing/walking in paraplegics; BCI typing at 62 wpm; Neuralink enabling cursor control",
      "description": "Once considered permanently irreversible, spinal cord injury treatment is rapidly advancing. Epidural stimulation has enabled multiple paraplegic patients to stand and walk with assistance. BCIs allow paralyzed patients to control computers and robotic arms. Stem cell and gene therapy approaches aim for true neural regeneration."
    },
    {
      "id": "BDIS-006",
      "name": "Schizophrenia",
      "type": "Psychiatric",
      "affected_region": "Prefrontal cortex, hippocampus, thalamus, auditory cortex",
      "prevalence": "~24 million globally; 1% lifetime prevalence",
      "treatment": "Antipsychotics (D2 antagonists/partial agonists), cognitive behavioral therapy",
      "research_status": "TAAR1 agonists (ulotaront) - novel non-D2 mechanism; muscarinic agonists (xanomeline); early intervention research",
      "description": "A severe psychiatric disorder with positive symptoms (hallucinations, delusions), negative symptoms (apathy, social withdrawal), and cognitive impairment. All current antipsychotics target D2 dopamine receptors. Novel mechanisms targeting TAAR1 and muscarinic receptors represent the first new pharmacological approaches in decades."
    },
    {
      "id": "BDIS-007",
      "name": "ALS (Amyotrophic Lateral Sclerosis)",
      "type": "Neurodegenerative",
      "affected_region": "Motor cortex, brainstem, spinal cord motor neurons",
      "prevalence": "~300,000 globally; ~5,000 new US cases/year",
      "treatment": "Riluzole, edaravone, Relyvrio (AMX0035), tofersen (SOD1), Qalsody",
      "research_status": "Gene-specific therapies: tofersen for SOD1 (FDA 2023), antisense oligonucleotides for C9orf72 in trials; BCI communication",
      "description": "Progressive loss of motor neurons leading to paralysis and death within 3-5 years. 2023 breakthrough: tofersen, the first gene-specific ALS therapy, approved for SOD1 mutations. BCIs (Synchron Stentrode, Neuralink) are being developed to restore communication for ALS patients. Antisense oligonucleotides targeting C9orf72 are in phase 3."
    },
    {
      "id": "BDIS-008",
      "name": "Stroke",
      "type": "Cerebrovascular",
      "affected_region": "Depends on affected artery - middle cerebral artery most common",
      "prevalence": "~15 million new cases/year globally; leading cause of disability",
      "treatment": "tPA (thrombolysis), thrombectomy, neurorehabilitation, BCI-assisted recovery",
      "research_status": "Extended thrombectomy window (24h); BCI + robotic rehabilitation; stem cell therapy trials",
      "description": "The leading cause of adult disability. Mechanical thrombectomy window extended to 24 hours (2024). BCI-assisted rehabilitation shows promise for restoring motor function post-stroke. Stem cell transplantation and gene therapy approaches are in clinical trials for neural repair."
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
      "description": "Critical for forming new memories and spatial navigation. Patient H.M. (Henry Molaison), whose hippocampi were surgically removed, revealed its essential role in memory formation while preserving procedural memory. Adult neurogenesis occurs in the dentate gyrus, one of the few brain regions with this capacity."
    },
    {
      "id": "BREG-003",
      "name": "Amygdala",
      "location": "Medial temporal lobe, anterior to hippocampus",
      "function": "Emotional processing (especially fear and threat detection), emotional memory formation, social cognition",
      "associated_disorders": "Anxiety disorders, PTSD, phobias, autism spectrum disorder, aggression",
      "neurotransmitters": "Glutamate, GABA, norepinephrine, serotonin, dopamine",
      "description": "The amygdala is the brain's threat detection center, rapidly processing fearful stimuli before conscious awareness. It enhances memory consolidation for emotionally significant events. Hyperactivity is linked to anxiety and PTSD; hypoactivity to risk-taking and impaired social cognition. It contains ~13 nuclei with distinct functions."
    },
    {
      "id": "BREG-004",
      "name": "Basal Ganglia",
      "location": "Deep forebrain structures (caudate, putamen, globus pallidus, subthalamic nucleus, substantia nigra)",
      "function": "Motor control, habit formation, reward processing, action selection, procedural learning",
      "associated_disorders": "Parkinson's disease, Huntington's disease, OCD, Tourette syndrome, addiction",
      "neurotransmitters": "Dopamine (primary), GABA, glutamate, acetylcholine",
      "description": "A group of interconnected nuclei critical for voluntary movement and habit learning. The substantia nigra's dopamine-producing neurons degenerate in Parkinson's disease. The direct and indirect pathways through basal ganglia facilitate and suppress movement respectively. Deep brain stimulation of the subthalamic nucleus is an effective Parkinson's treatment."
    },
    {
      "id": "BREG-005",
      "name": "Cerebellum",
      "location": "Posterior fossa, behind brainstem",
      "function": "Motor coordination, balance, motor learning, precision timing; increasingly recognized for cognitive and emotional functions",
      "associated_disorders": "Ataxia, tremor, autism, schizophrenia, dyslexia",
      "neurotransmitters": "Glutamate, GABA (cerebellar cortex is purely glutamatergic/GABAergic)",
      "description": "Contains more neurons than the rest of the brain combined (~69 billion). Long considered purely motor, recent research reveals roles in cognition, language, and emotion. The cerebellum's uniform circuit architecture (Purkinje cells) makes it computationally elegant. Damage causes ataxia but not paralysis."
    },
    {
      "id": "BREG-006",
      "name": "Thalamus",
      "location": "Central brain, above brainstem",
      "function": "Sensory relay station, consciousness regulation, sleep-wake cycle, motor signal integration",
      "associated_disorders": "Thalamic pain syndrome, coma, sleep disorders, memory impairment",
      "neurotransmitters": "Glutamate, GABA",
      "description": "The brain's central relay hub - nearly all sensory information passes through the thalamus before reaching the cortex. Different thalamic nuclei process different sensory modalities. The intralaminar nuclei are critical for consciousness. Thalamic strokes can cause devastating central pain syndrome."
    },
    {
      "id": "BREG-007",
      "name": "Hypothalamus",
      "location": "Below thalamus, at base of brain",
      "function": "Homeostasis, hormone regulation, body temperature, hunger, thirst, circadian rhythm, sexual behavior",
      "associated_disorders": "Diabetes insipidus, hypothalamic obesity, sleep disorders, endocrine disorders",
      "neurotransmitters": "GABA, glutamate, dopamine, serotonin, histamine, orexin/hypocretin",
      "description": "The master regulator of the body's internal environment. Controls the pituitary gland and thus the entire endocrine system. The suprachiasmatic nucleus (SCN) is the body's master clock. Orexin neurons in the lateral hypothalamus regulate wakefulness; their loss causes narcolepsy."
    },
    {
      "id": "BREG-008",
      "name": "Insular Cortex",
      "location": "Deep within lateral sulcus, hidden by opercula",
      "function": "Interoception (body awareness), emotion, taste, pain processing, empathy, risk prediction",
      "associated_disorders": "Alexithymia, anxiety, addiction, eating disorders, interoceptive dysfunction",
      "neurotransmitters": "Glutamate, GABA, serotonin, dopamine",
      "description": "The insula integrates bodily sensations with emotional and cognitive processing. The anterior insula is activated during disgust, empathy, and uncertainty. The posterior insula processes physical sensations including pain and temperature. It's a key hub in the 'salience network' that detects important stimuli."
    },
    {
      "id": "BREG-009",
      "name": "Default Mode Network (DMN)",
      "location": "Medial prefrontal cortex, posterior cingulate, angular gyrus, hippocampus",
      "function": "Self-referential thinking, mind-wandering, episodic memory, future planning, social cognition",
      "associated_disorders": "Alzheimer's disease, depression, ADHD, schizophrenia, autism",
      "neurotransmitters": "Multiple (distributed network)",
      "description": "A large-scale brain network active during rest and internally-directed thought. Discovered through fMRI, the DMN is suppressed during goal-directed tasks. Its dysfunction is implicated in numerous psychiatric and neurological conditions. DMN connectivity is increasingly used as a biomarker for brain health."
    },
    {
      "id": "BREG-010",
      "name": "Ventral Tegmental Area (VTA)",
      "location": "Midbrain, near substantia nigra",
      "function": "Reward processing, motivation, addiction, prediction error signaling",
      "associated_disorders": "Addiction, depression, schizophrenia, Parkinson's disease",
      "neurotransmitters": "Dopamine (primary), GABA, glutamate",
      "description": "The VTA contains the brain's primary reward circuit dopamine neurons. These neurons signal prediction error - the difference between expected and received rewards - forming the basis of reinforcement learning. VTA dopamine release is hijacked by addictive drugs, making it central to addiction neuroscience."
    }
  ],
  "consciousness_research": [
    {
      "id": "CONSC-001",
      "name": "Global Workspace Theory (GWT)",
      "theory": "Consciousness arises when information is broadcast widely across the brain via a 'global workspace'",
      "proponent": "Bernard Baars (1988), Stanislas Dehaene (neuronal GWT)",
      "evidence": "fMRI shows 'ignition' - sudden widespread activation when stimuli become conscious; P300 ERP component correlates with conscious access",
      "status": "Leading theory; supported by neuroimaging and electrophysiology",
      "description": "GWT proposes that unconscious processing occurs in parallel across specialized modules, and consciousness emerges when information is 'broadcast' to all modules simultaneously via long-range neural connections. Dehaene's neuronal GWT specifies prefrontal-parietal networks as the workspace. This theory predicts the 'attentional blink' and inattentional blindness."
    },
    {
      "id": "CONSC-002",
      "name": "Integrated Information Theory (IIT)",
      "theory": "Consciousness is identical to integrated information (Φ); any system with Φ>0 has some degree of consciousness",
      "proponent": "Giulio Tononi (2004, 2008, 2012, 2024)",
      "evidence": "Predicts consciousness in cerebellum (low Φ, low consciousness) vs. cortex (high Φ, high consciousness); explains why certain brain lesions affect consciousness",
      "status": "Controversial; mathematically rigorous but computationally intractable for real brains; criticized as panpsychist",
      "description": "IIT is the most mathematically formalized consciousness theory. It defines consciousness as integrated information (Φ) - a measure of how much information a system generates as a whole beyond its parts. IIT 4.0 (2024) refined the mathematical framework. Critics argue it implies panpsychism (everything has some consciousness) and that Φ is uncomputable for complex systems."
    },
    {
      "id": "CONSC-003",
      "name": "Higher-Order Theory (HOT)",
      "theory": "A mental state is conscious when it is the object of a higher-order representation (a thought about a thought)",
      "proponent": "David Rosenthal, Richard Brown, Hakwan Lau",
      "evidence": "Explains why prefrontal cortex activity correlates with consciousness; accounts for dissociations between perception and awareness",
      "status": "Active research; competing with GWT and IIT",
      "description": "HOT proposes that consciousness requires meta-cognition - a higher-order thought that represents a first-order state. You're conscious of seeing red because you have a thought about seeing red. This explains why prefrontal cortex lesions can affect awareness without eliminating perception. Higher-Order theories predict that metacognitive accuracy should correlate with consciousness."
    },
    {
      "id": "CONSC-004",
      "name": "Predictive Processing / Free Energy Principle",
      "theory": "Consciousness arises from the brain's predictive models; we experience our predictions, not raw sensory data",
      "proponent": "Karl Friston (free energy), Andy Clark (predictive mind), Anil Seth (controlled hallucination)",
      "evidence": "Explains perceptual illusions, placebo effects, and hallucinations as prediction errors; supported by visual cortex predictive coding",
      "status": "Influential framework; unifies perception, action, and consciousness",
      "description": "The brain is a prediction machine that constantly generates models of the world and updates them based on prediction errors. Anil Seth argues consciousness is a 'controlled hallucination' - our experience is the brain's best guess, not a direct representation of reality. Friston's free energy principle provides a mathematical framework: the brain minimizes surprise (free energy)."
    },
    {
      "id": "CONSC-005",
      "name": "Recurrent Processing Theory",
      "theory": "Consciousness requires recurrent (feedback) processing between cortical areas, not just feedforward processing",
      "proponent": "Victor Lamme (2006, 2020)",
      "evidence": "Feedforward processing (V1→V2→V4→IT) occurs without consciousness; recurrent loops correlate with conscious perception",
      "status": "Supported by visual neuroscience; complementary to GWT",
      "description": "Lamme argues that feedforward processing through the visual hierarchy is unconscious. Consciousness requires recurrent (feedback) connections that create loops between cortical areas. This explains why TMS disruption of feedback abolishes visual awareness while leaving feedforward processing intact. It's more local than GWT - recurrent processing in a single cortical area may be sufficient for basic consciousness."
    }
  ],
  "main": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:40:02.740Z",
    "description": "脑科学实体库",
    "entities": []
  },
  "neurotech": [
    {
      "id": "NTECH-001",
      "name": "Transcranial Magnetic Stimulation (TMS)",
      "type": "Non-invasive neuromodulation",
      "description": "Using magnetic fields to stimulate or suppress neural activity in specific brain regions",
      "developer": "Multiple (Magstim, Neuronetics, BrainsWay)",
      "status": "FDA approved for depression (2008), OCD (2018), smoking cessation (2020), anxious depression (2021)",
      "breakthrough": "Stanford Accelerated Intelligent Neuromodulation Therapy (SAINT) achieved 79% remission in treatment-resistant depression in 5 days"
    },
    {
      "id": "NTECH-002",
      "name": "Transcranial Ultrasound Stimulation (TUS)",
      "type": "Non-invasive neuromodulation",
      "description": "Focused ultrasound to modulate deep brain structures without surgery, with millimeter precision",
      "developer": "Multiple (InSightec, Brainsonix, Synced)",
      "status": "Clinical trials for depression, essential tremor, pain; research expanding rapidly",
      "breakthrough": "2023 studies showed TUS can modulate thalamus and basal ganglia non-invasively with lasting effects"
    },
    {
      "id": "NTECH-003",
      "name": "Closed-Loop Deep Brain Stimulation (DBS)",
      "type": "Invasive neuromodulation",
      "description": "Adaptive DBS that monitors brain activity in real-time and adjusts stimulation parameters accordingly",
      "developer": "Medtronic (Percept PC), Boston Scientific",
      "status": "Medtronic Percept PC FDA approved 2020; adaptive DBS clinical trials ongoing",
      "breakthrough": "Adaptive DBS reduces Parkinson's symptoms 50% more efficiently than continuous stimulation while using less battery"
    },
    {
      "id": "NTECH-004",
      "name": "Neuroprosthetic Memory Implant",
      "type": "Invasive neuroprosthesis",
      "description": "Hippocampal prosthesis that encodes and decodes memory signals to restore memory formation",
      "developer": "USC / Wake Forest (Dong Song, Sam Deadwyler)",
      "status": "Primate and human research; demonstrated memory improvement in epilepsy patients",
      "breakthrough": "2023: Hippocampal prosthesis improved short-term memory by 15-20% and long-term memory by 25-30% in human patients"
    },
    {
      "id": "NTECH-005",
      "name": "Optogenetics Therapy",
      "type": "Gene therapy + light stimulation",
      "description": "Using light-sensitive proteins delivered by gene therapy to precisely control specific neuron types",
      "developer": "Allergan/AbbVie (optogenetic vision restoration), Bionic Sight",
      "status": "First human optogenetics therapy (retinitis pigmentosa) showed partial vision restoration in 2021",
      "breakthrough": "2021: Blind patient partially recovered vision using optogenetic therapy combined with light-amplifying goggles"
    },
    {
      "id": "NTECH-006",
      "name": "Neural Dust / Neural Lace",
      "type": "Distributed neural interface",
      "description": "Sub-millimeter wireless neural sensors ('motes') distributed throughout brain tissue, powered and read by ultrasound",
      "developer": "UC Berkeley (Michale Maharbiz), Iota Biosciences (now part of Synchron)",
      "status": "Animal demonstrations; human applications years away",
      "breakthrough": "Demonstrated wireless recording from peripheral nerves in rats using sub-mm motes"
    },
    {
      "id": "NTECH-007",
      "name": "Digital Twin Brain Models",
      "type": "Computational neuroscience",
      "description": "High-resolution computational models of individual brains for surgical planning and treatment optimization",
      "developer": "Human Brain Project, Virtual Epileptic Patient (Jena), Allen Institute",
      "status": "Clinical validation for epilepsy surgery planning; expanding to other conditions",
      "breakthrough": "Virtual Epileptic Patient model predicts seizure onset zones with 85%+ accuracy, guiding surgery"
    }
  ],
  "neurotransmitters": [
    {
      "id": "NT-001",
      "name": "Dopamine",
      "type": "Catecholamine",
      "function": "Reward, motivation, motor control, attention, reinforcement learning",
      "associated_regions": "VTA, substantia nigra, nucleus accumbens, prefrontal cortex, striatum",
      "disorders": "Parkinson's (deficiency), schizophrenia (excess), addiction (dysregulation), ADHD (deficiency)",
      "drugs_targeting": "L-DOPA, antipsychotics (D2 antagonists), methylphenidate, amphetamines, bupropion",
      "description": "Dopamine is the brain's primary reward signal. VTA dopamine neurons fire in response to unexpected rewards (prediction error), forming the basis of reinforcement learning. In the nigrostriatal pathway, dopamine enables smooth motor control; its loss causes Parkinson's disease. Dopamine has 5 receptor subtypes (D1-D5) with distinct functions."
    },
    {
      "id": "NT-002",
      "name": "Serotonin (5-HT)",
      "type": "Indolamine",
      "function": "Mood regulation, sleep, appetite, pain, social behavior, impulsivity",
      "associated_regions": "Raphe nuclei (brainstem), widespread projections to cortex, limbic system, spinal cord",
      "disorders": "Depression, anxiety, OCD, PTSD, migraine, irritable bowel syndrome",
      "drugs_targeting": "SSRIs (fluoxetine, sertraline), SNRIs, triptans, LSD/psilocybin, ondansetron",
      "description": "Serotonin modulates virtually every brain function. 95% of the body's serotonin is in the gut. SSRIs are the most prescribed psychiatric drugs. Recent research shows psilocybin (5-HT2A agonist) produces rapid antidepressant effects. 14 serotonin receptor subtypes mediate diverse effects from mood to gut motility."
    },
    {
      "id": "NT-003",
      "name": "Glutamate",
      "type": "Amino acid",
      "function": "Primary excitatory neurotransmitter; learning, memory, synaptic plasticity (LTP/LTD), development",
      "associated_regions": "Ubiquitous - present in >80% of brain synapses",
      "disorders": "Excitotoxicity (stroke, ALS), epilepsy, schizophrenia, anxiety",
      "drugs_targeting": "Ketamine (NMDA antagonist), memantine, riluzole, perampanel (AMPA antagonist)",
      "description": "The brain's most abundant neurotransmitter, present in over 80% of synapses. Glutamate mediates long-term potentiation (LTP), the cellular basis of learning and memory. Excessive glutamate causes excitotoxic cell death in stroke and neurodegenerative diseases. Ketamine's rapid antidepressant effect works through glutamate modulation."
    },
    {
      "id": "NT-004",
      "name": "GABA (Gamma-aminobutyric acid)",
      "type": "Amino acid",
      "function": "Primary inhibitory neurotransmitter; anxiety regulation, muscle relaxation, sleep, neural circuit balance",
      "associated_regions": "Ubiquitous - present in ~25% of brain synapses; cerebellar Purkinje cells, basal ganglia",
      "disorders": "Anxiety, epilepsy, insomnia, Huntington's disease (GABA neuron loss)",
      "drugs_targeting": "Benzodiazepines, barbiturates, gabapentin, vigabatrin, tiagabine, valproate",
      "description": "The brain's primary brake system. GABA counterbalances glutamate excitation to maintain neural circuit stability. GABA-A receptors are the target of benzodiazepines and alcohol. Impaired GABA function leads to seizures and anxiety. GABA neurons (interneurons) are critical for timing and coordination of neural activity."
    },
    {
      "id": "NT-005",
      "name": "Acetylcholine",
      "type": "Amine",
      "function": "Attention, learning, memory, arousal, muscle contraction (at neuromuscular junction)",
      "associated_regions": "Basal forebrain (nucleus basalis), hippocampus, cortex, neuromuscular junctions",
      "disorders": "Alzheimer's disease (cholinergic neuron loss), myasthenia gravis, Lewy body dementia",
      "drugs_targeting": "Donepezil, rivastigmine, galantamine (AChE inhibitors), nicotine, varenicline, atropine",
      "description": "The first neurotransmitter discovered (Loewi, 1921). In the brain, acetylcholine from the basal forebrain is essential for attention and memory; its loss is a hallmark of Alzheimer's disease. At the neuromuscular junction, it triggers muscle contraction. AChE inhibitors are first-line Alzheimer's treatments."
    },
    {
      "id": "NT-006",
      "name": "Norepinephrine (Noradrenaline)",
      "type": "Catecholamine",
      "function": "Arousal, attention, stress response, vigilance, mood, blood pressure regulation",
      "associated_regions": "Locus coeruleus (brainstem), widespread cortical and subcortical projections",
      "disorders": "ADHD, depression, anxiety, PTSD, panic disorder",
      "drugs_targeting": "Atomoxetine, clonidine, SNRIs, propranolol, prazosin",
      "description": "The brain's alertness system. The locus coeruleus contains only ~15,000 neurons but projects throughout the brain, modulating attention and arousal. Norepinephrine is also the primary neurotransmitter of the sympathetic nervous system ('fight or flight'). Its role in PTSD has led to prazosin trials for nightmares."
    },
    {
      "id": "NT-007",
      "name": "Endorphins (Endogenous Opioids)",
      "type": "Neuropeptide",
      "function": "Pain relief, reward, euphoria, stress response, social bonding",
      "associated_regions": "Periaqueductal gray, nucleus accumbens, amygdala, pituitary",
      "disorders": "Chronic pain, addiction, depression",
      "drugs_targeting": "Naloxone, naltrexone, buprenorphine, morphine (exogenous opioids)",
      "description": "Endogenous opioid peptides that are the body's natural painkillers. Three receptor types: mu (pain relief, euphoria), kappa (dysphoria), delta (emotional regulation). Exercise-induced endorphin release creates 'runner's high.' Opioid drugs hijack this system, leading to addiction. Naloxone reverses opioid overdose."
    },
    {
      "id": "NT-008",
      "name": "Oxytocin",
      "type": "Neuropeptide",
      "function": "Social bonding, trust, empathy, childbirth, lactation, pair bonding",
      "associated_regions": "Hypothalamus (paraventricular and supraoptic nuclei), posterior pituitary, amygdala",
      "disorders": "Autism spectrum disorder, social anxiety, PTSD, borderline personality disorder",
      "drugs_targeting": "Intranasal oxytocin (investigational), pitocin (synthetic, for labor)",
      "description": "Called the 'love hormone' but more accurately a social salience modulator. Oxytocin enhances trust and in-group bonding but can increase out-group hostility. Intranasal oxytocin trials for autism have shown mixed results. It's essential for childbirth and lactation. Recent work shows it modulates fear extinction, relevant for PTSD treatment."
    }
  ]
};
