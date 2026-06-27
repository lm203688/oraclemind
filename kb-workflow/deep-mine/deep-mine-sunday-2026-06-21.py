#!/usr/bin/env python3
"""Deep mine script for Sunday: exo-science, alien-minerals, deep-sea-tech, robot-parts"""

import json
import os
from datetime import datetime

BASE = "/home/z/my-project"

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def add_entities(file_path, new_entities, id_field="id"):
    """Add entities to a JSON array file, avoiding duplicates by ID"""
    existing = load_json(file_path)
    existing_ids = {e[id_field] for e in existing}
    added = 0
    for ent in new_entities:
        if ent[id_field] not in existing_ids:
            existing.append(ent)
            existing_ids.add(ent[id_field])
            added += 1
    save_json(file_path, existing)
    return added, len(existing)

# ============================================================
# 1. EXO-SCIENCE
# ============================================================
print("=" * 60)
print("EXO-SCIENCE")
print("=" * 60)

exo_base = f"{BASE}/exo-science/knowledge-base/entities"

# New exoplanets
new_exoplanets = [
    {
        "id": "EXO-094",
        "name": "TOI-199 b",
        "type": "Temperate gas giant (exo-Saturn) with methane atmosphere",
        "mass": "N/A",
        "radius": "Saturn-sized",
        "orbital_period": "N/A",
        "distance": "~335 light-years",
        "host_star": "TOI-199",
        "discovery_year": "2026",
        "detection_method": "Transit (TESS) + JWST atmospheric characterization",
        "atmosphere": "Methane-rich (CH4 confirmed by JWST)",
        "habitable": False,
        "temperature": "Earth-like temperature range",
        "description": "Saturn-sized exoplanet with Earth-like temperatures and a methane-rich atmosphere, discovered using NASA's James Webb Space Telescope. Led by researcher Renyu Hu at Penn State Eberly College of Science. The system exhibits strong transit timing variations (TTVs) due to an outer non-transiting giant planet. Models for temperate gas-giant exoplanets had predicted methane, and this discovery provides confirmation. Featured as a NASA 'Goldilocks' giant planet.",
        "source": "NASA/JWST 2026, Penn State Research, IOPscience"
    },
    {
        "id": "EXO-095",
        "name": "WISPIT 2 c",
        "type": "Exoplanet (new discovery)",
        "mass": "N/A",
        "radius": "N/A",
        "orbital_period": "N/A",
        "distance": "N/A",
        "host_star": "WISPIT 2",
        "discovery_year": "2026",
        "detection_method": "Transit",
        "atmosphere": "Under investigation",
        "habitable": False,
        "description": "New planet discovered in 2026, featured in NASA Exoplanet Archive weekly highlights as a notable new discovery. Part of the 2026 TESS milestone of 114 new planets added to the archive.",
        "source": "NASA Exoplanet Archive 2026"
    },
    {
        "id": "EXO-096",
        "name": "CWISEP J193518.59-154620.3 b",
        "type": "Exoplanet (new discovery)",
        "mass": "N/A",
        "radius": "N/A",
        "orbital_period": "N/A",
        "distance": "N/A",
        "host_star": "CWISEP J193518.59-154620.3",
        "discovery_year": "2026",
        "detection_method": "Transit",
        "atmosphere": "Under investigation",
        "habitable": False,
        "description": "New planet discovered in 2026, featured in NASA Exoplanet Archive weekly highlights alongside WISPIT 2 c. Part of the 2026 TESS milestone additions.",
        "source": "NASA Exoplanet Archive 2026"
    },
    {
        "id": "EXO-097",
        "name": "TESS 2026 Milestone Planets (3 new hot Jupiters)",
        "type": "Hot Jupiters orbiting M dwarfs",
        "mass": "N/A",
        "radius": "Jupiter-sized",
        "orbital_period": "Short (hot Jupiter class)",
        "distance": "N/A",
        "host_star": "M dwarf stars",
        "discovery_year": "2026",
        "detection_method": "Transit (TESS)",
        "atmosphere": "Under investigation",
        "habitable": False,
        "description": "Three new hot Jupiter planets orbiting M dwarf stars discovered by NASA's TESS mission in 2026, part of a milestone addition of 114 planets to the NASA Exoplanet Archive. These discoveries are notable because hot Jupiters around M dwarfs are relatively rare.",
        "source": "NASA Exoplanet Archive 2026"
    }
]

added, total = add_entities(f"{exo_base}/exoplanets.json", new_exoplanets)
print(f"  exoplanets.json: +{added} (total: {total})")

# New astrobiology entities
new_astrobio = [
    {
        "id": "ASTRO-044",
        "name": "Enceladus Amino Acid Surface Survival Study",
        "type": "Astrobiology life-detection feasibility study",
        "target": "Enceladus (Saturn's moon)",
        "year": "2025-2026",
        "organization": "NASA",
        "description": "NASA experiment demonstrating that amino acids within Enceladus's plumes can withstand spacecraft impacts and radiolysis (breakdown by radiation). Subsurface sampling is not required for detection of amino acids on Enceladus - these molecules will survive just beneath the surface. The study strengthens the case for future life-detection missions to ocean moons.",
        "source": "NASA 2025-2026, EarthSky"
    },
    {
        "id": "ASTRO-045",
        "name": "Enceladus Complex Organic Molecules Discovery",
        "type": "Organic molecule detection",
        "target": "Enceladus (Saturn's moon)",
        "year": "2025",
        "organization": "NASA/Cassini mission data analysis",
        "description": "Fresh analysis of Cassini data revealed new complex organic molecules inside ice grains spewing from Enceladus's plumes. NASA also found evidence of a key ingredient for life and a supercharged source of energy to fuel it, strengthening the case for a new mission to orbit and land on Enceladus.",
        "source": "NASA Cassini data analysis 2025"
    },
    {
        "id": "ASTRO-046",
        "name": "Laser Sail Astrobiology Precursor Mission (Enceladus/Europa)",
        "type": "Mission concept",
        "target": "Enceladus and Europa",
        "year": "2025-2026",
        "organization": "Academic research",
        "description": "Feasibility study for deploying laser sail technology in precursor life-detection missions to Enceladus and Europa. The work assesses the potential of light sail propulsion to enable faster, cheaper missions to icy moons for biosignature detection.",
        "source": "Academic research 2025-2026"
    }
]

added, total = add_entities(f"{exo_base}/astrobiology.json", new_astrobio)
print(f"  astrobiology.json: +{added} (total: {total})")

# New space mission entity
new_missions = [
    {
        "id": "SM-076",
        "name": "TESS 2026 114-Planet Milestone",
        "type": "Mission milestone",
        "agency": "NASA",
        "year": "2026",
        "description": "In 2026, NASA's TESS mission achieved a major milestone with 114 new planets added to the Exoplanet Archive, including three new hot Jupiters orbiting M dwarfs, WISPIT 2 c, and CWISEP J193518.59-154620.3 b. By this time, TESS had discovered over 7,000 planetary candidates and confirmed 679+ exoplanets since launch.",
        "source": "NASA Exoplanet Archive 2026"
    }
]

added, total = add_entities(f"{exo_base}/space_missions.json", new_missions)
print(f"  space_missions.json: +{added} (total: {total})")

# New planetary science entity
new_plsc = [
    {
        "id": "PLSC-011",
        "name": "TESS Radius Valley Disappearance (Gillis et al. 2026)",
        "type": "Planetary occurrence rate study",
        "year": "2026",
        "authors": "Gillis, Erik Diego; Cloutier, Ryan; Pass, et al.",
        "description": "TESS planet occurrence rates study revealing the disappearance of the radius valley around mid-to-late M dwarfs. The study found no hot Jupiters in the survey and set an upper limit of 0.012 hot Jupiters per mid-to-late M dwarf within 10 days. This has significant implications for planet formation theories.",
        "source": "Gillis et al. 2026, NASA Exoplanet Archive"
    }
]

added, total = add_entities(f"{exo_base}/planetary_science.json", new_plsc)
print(f"  planetary_science.json: +{added} (total: {total})")

exo_total = sum(len(v) for v in [new_exoplanets, new_astrobio, new_missions, new_plsc])
print(f"  EXO-SCIENCE TOTAL NEW: {exo_total}")

# ============================================================
# 2. ALIEN-MINERALS
# ============================================================
print("\n" + "=" * 60)
print("ALIEN-MINERALS")
print("=" * 60)

alien_base = f"{BASE}/alien-minerals/knowledge-base/entities"

# New asteroids
new_asteroids = [
    {
        "id": "AST-051",
        "name": "Asteroid 2025 (fastest-spinning)",
        "type": "Near-Earth asteroid (fast rotator)",
        "diameter": ">500 meters",
        "rotation_period": "Record-breaking (fastest known for size)",
        "discovery_year": "2025",
        "composition": "N/A (under investigation)",
        "description": "Discovered by the NSF-DOE Vera C. Rubin Observatory, this is the fastest-ever spinning asteroid with a diameter over half a kilometer. A team at the University of Washington discovered 19 quickly rotating asteroids including this record-holder, dubbed 2025. The study provides crucial information about asteroid structural integrity and spin limits.",
        "source": "NSF-DOE Vera C. Rubin Observatory 2025, University of Washington"
    },
    {
        "id": "AST-052",
        "name": "JWST February 2026 Asteroid Batch (2,104 new asteroids)",
        "type": "Asteroid survey discovery",
        "diameter": "Various",
        "rotation_period": "Various",
        "discovery_year": "2026",
        "composition": "Various",
        "description": "In February 2026, the James Webb Space Telescope discovered 2,104 previously unknown asteroids in approximately 10 hours of observations, including seven near-Earth asteroids (none dangerous). This demonstrates JWST's capability as an asteroid discovery tool beyond its primary mission.",
        "source": "JWST 2026 observations"
    },
    {
        "id": "AST-053",
        "name": "16 Psyche (metal-rich asteroid target)",
        "type": "Metal-rich M-type asteroid",
        "diameter": "~226 km (mean)",
        "rotation_period": "~4.196 hours",
        "discovery_year": "N/A (discovered 1852, mission 2023-2029)",
        "composition": "Metal-rich (iron, nickel, possibly gold/platinum group metals)",
        "description": "Target of NASA's Psyche mission. The spacecraft completed its Mars gravity-assist flyby on May 15, 2026, coming within 4,609 km of Mars' surface. The flyby provided a critical speed boost and orbital plane adjustment without using fuel. The mission will enter orbit around 16 Psyche in 2029, marking the first up-close exploration of a metal-rich asteroid.",
        "source": "NASA Psyche Mission 2026"
    }
]

added, total = add_entities(f"{alien_base}/asteroids.json", new_asteroids)
print(f"  asteroids.json: +{added} (total: {total})")

# New mining tech
new_mining_tech = [
    {
        "id": "MTECH-056",
        "name": "AstroForge Vestri Spacecraft",
        "type": "Asteroid mining probe",
        "manufacturer": "AstroForge (California)",
        "year": "2026 (planned launch)",
        "mass": "200 kg (440 lbs)",
        "description": "AstroForge's third and boldest space mission, built in-house. Vestri is designed to dock with a metallic near-Earth asteroid, aiming to mine and return one to two tons of material. If successful, it will be the first private mission to land outside the Earth-moon system. The target asteroid identity remains undisclosed. Launch scheduled for 2026.",
        "source": "AstroForge 2026, Forbes, Popular Mechanics"
    },
    {
        "id": "MTECH-057",
        "name": "NASA MRE (Molten Regolith Electrolysis)",
        "type": "ISRU oxygen extraction technology",
        "manufacturer": "NASA",
        "year": "2025 (project completed)",
        "description": "NASA's MRE technology developed to extract oxygen and metals from minerals in lunar regolith. The MRE project was completed in 2025, advancing capabilities for in-situ resource utilization on the Moon. The system heats regolith to molten temperatures and electrolyzes it to produce oxygen and metal byproducts.",
        "source": "NASA Lunar Surface Technology 2025"
    }
]

added, total = add_entities(f"{alien_base}/mining_tech.json", new_mining_tech)
print(f"  mining_tech.json: +{added} (total: {total})")

# New lunar resources
new_lunar = [
    {
        "id": "LUN-047",
        "name": "Interlune Helium-3 Lunar Demonstrator Mission",
        "type": "Lunar resource assessment mission",
        "target_resource": "Helium-3 (He-3)",
        "year": "2026 (planned demonstrator launch)",
        "organization": "Interlune",
        "description": "Interlune plans to launch a demonstrator mission in 2026 to sample lunar regolith and measure helium-3 concentrations. The company estimates processing 100,000 to 1 million tons of regolith to obtain one kilogram of He-3. He-3 is valued for potential quantum computing and fusion energy applications.",
        "source": "Interlune 2026, BBC"
    },
    {
        "id": "LUN-048",
        "name": "LH3M Lunar Helium-3 Extraction Architecture",
        "type": "Patented He-3 extraction system",
        "target_resource": "Helium-3 (He-3)",
        "year": "2025-2026",
        "organization": "LH3M",
        "description": "LH3M secured its fifth US patent covering an end-to-end architecture for He-3 detection, extraction, and refinement on the Moon. The company's patented system represents a comprehensive approach to lunar Helium-3 mining, from prospecting to production.",
        "source": "LH3M patent filings 2025-2026"
    },
    {
        "id": "LUN-049",
        "name": "Astrotech Helium-3 Regolith Heating Extraction",
        "type": "ISRU extraction method",
        "target_resource": "Helium-3 (He-3)",
        "year": "2025-2026",
        "organization": "Astrotech",
        "description": "Astrotech's approach to extracting helium-3 from lunar regolith by heating it. The company plans to use SpaceX Starship rockets for transport. Led by CEO Tom Pickens, the method involves thermal extraction of He-3 from mined regolith material.",
        "source": "Astrotech 2025-2026"
    }
]

added, total = add_entities(f"{alien_base}/lunar_resources.json", new_lunar)
print(f"  lunar_resources.json: +{added} (total: {total})")

# New space resources
new_space_res = [
    {
        "id": "SR-012",
        "name": "Ryugu Asteroid Prebiotic Organic Matter",
        "type": "Asteroid sample analysis",
        "year": "2025",
        "organization": "JAXA/International research teams",
        "description": "Ryugu asteroid research revealed mineral history predating any on Earth, with details of the asteroid's composition helping scientists understand how water and prebiotic organic matter arrived on Earth. Published August 2025, the findings provide new insights into the earliest solar system materials.",
        "source": "JAXA Hayabusa2 2025"
    }
]

added, total = add_entities(f"{alien_base}/space_resources.json", new_space_res)
print(f"  space_resources.json: +{added} (total: {total})")

alien_total = sum(len(v) for v in [new_asteroids, new_mining_tech, new_lunar, new_space_res])
print(f"  ALIEN-MINERALS TOTAL NEW: {alien_total}")

# ============================================================
# 3. DEEP-SEA-TECH
# ============================================================
print("\n" + "=" * 60)
print("DEEP-SEA-TECH")
print("=" * 60)

sea_base = f"{BASE}/deep-sea-tech/knowledge-base/entities"

# New submersibles
new_subs = [
    {
        "id": "SUB-083",
        "name": "Triton 36000/2 Hadal Exploration System (Limiting Factor)",
        "type": "Full Ocean Depth manned submersible",
        "depth_rating": "11,000 meters (full ocean depth)",
        "operator": "Triton Submarines / Caladan Oceanic",
        "country": "USA",
        "year": "2025-2026",
        "capabilities": "The world's only submersible certified to repeatedly dive to the deepest part of the ocean (Mariana Trench Challenger Deep). DNV-GL certified. Has dived multiple times to Challenger Deep and completed dives in the Puerto Rico Trench (8,376m). Tested to 14km depth.",
        "description": "Triton 36000/2是唯一获得全海深认证的载人潜水器，可反复下潜至马里亚纳海沟最深处。已完成多次挑战者深渊下潜和波多黎各海沟（8,376米）下潜。由Triton Submarines制造，DNV-GL认证。",
        "source": "Triton Submarines 2025-2026"
    },
    {
        "id": "SUB-084",
        "name": "WHOI Deep Venture AUV",
        "type": "Autonomous Underwater Vehicle (new class)",
        "depth_rating": "Ultra-deep water",
        "operator": "Woods Hole Oceanographic Institution (WHOI)",
        "country": "USA",
        "year": "2025-2026",
        "capabilities": "DEEP VENTURE is the latest evolution of a new class of AUVs designed to significantly expand deep sea exploration. Deployed from R/V Atlantis. Features advanced autonomy for unexplored seafloor mapping.",
        "description": "伍兹霍尔海洋研究所(WHOI)开发的最新一代自主水下航行器(AUV)，属于全新级别的深海探索平台。从R/V Atlantis科考船上部署，具备先进自主能力，可大幅扩展深海探索范围。",
        "source": "WHOI 2025-2026"
    },
    {
        "id": "SUB-085",
        "name": "Orpheus Ocean Commercial Hadal AUV",
        "type": "Commercial autonomous underwater vehicle",
        "depth_rating": "Full ocean depth (hadal zone)",
        "operator": "Orpheus Ocean (WHOI spinoff)",
        "country": "USA",
        "year": "2025-2026",
        "capabilities": "Based on WHOI's Orpheus AUV technology. Small enough to fit on an airplane. Designed to land on the ocean floor at the deepest parts. Pre-seed funding secured for first commercial demonstrations, bringing revolutionary speed and capabilities to hadal zone exploration.",
        "description": "Orpheus Ocean是WHOI的衍生初创公司，获得种子轮融资用于Orpheus AUV的商业化演示。该AUV体积小到可以装上飞机，设计用于在海洋最深处着陆作业，为超深渊带探索带来革命性的速度提升。",
        "source": "Orpheus Ocean 2025-2026, WCAI"
    },
    {
        "id": "SUB-086",
        "name": "Triton 36000/3 Full Ocean Depth Three-Person Submersible",
        "type": "Full Ocean Depth manned submersible (3-person)",
        "depth_rating": "11,000+ meters",
        "operator": "Triton Submarines",
        "country": "USA/Spain",
        "year": "2025-2026",
        "capabilities": "The world's deepest-diving three-person acrylic submersible, unveiled in Spain in September 2025. Based on the chassis design of Triton models that can dive up to 3,300m, extended to full ocean depth. DNV-GL certified.",
        "description": "2025年9月在西班牙发布的全球最深潜三人丙烯酸载人潜水器。基于Triton 3300系列底盘设计扩展至全海深能力，获得DNV-GL认证。",
        "source": "Triton Submarines September 2025"
    }
]

added, total = add_entities(f"{sea_base}/submersibles.json", new_subs)
print(f"  submersibles.json: +{added} (total: {total})")

# New ocean exploration
new_oexp = [
    {
        "id": "OEXP-014",
        "name": "Global Hadal Exploration Programme (GHEP)",
        "type": "International deep-sea exploration program",
        "operator": "Institute of Deep-sea Science and Engineering, CAS",
        "country": "China (UN-approved international initiative)",
        "year": "2025-2035 (10-year mission)",
        "description": "A 10-year multidisciplinary initiative led by the Institute of Deep-sea Science and Engineering of the Chinese Academy of Sciences, officially approved by the United Nations as part of the Ocean Decade. Aims to investigate biodiversity, ecosystems, pollution, and geological processes unique to the hadal zone (6,000m to ~11,000m depth). A pioneering international effort for hadal zone exploration.",
        "source": "UN Ocean Decade, IDSSE-CAS 2025"
    },
    {
        "id": "OEXP-015",
        "name": "China South China Sea Underwater Research Station",
        "type": "Manned underwater research facility",
        "operator": "Chinese Academy of Sciences",
        "country": "China",
        "year": "2025-2026 (approved/construction)",
        "description": "China approved a one-of-a-kind research facility to be anchored 2,000 metres under the South China Sea, where scientists will live and work. This represents a major infrastructure investment for long-term deep-sea research.",
        "source": "Chinese Academy of Sciences 2025-2026"
    },
    {
        "id": "OEXP-016",
        "name": "Schmidt Ocean Institute 2026 South Atlantic Expedition",
        "type": "Deep-sea expedition",
        "operator": "Schmidt Ocean Institute",
        "country": "International",
        "year": "2026",
        "description": "In 2026, Schmidt Ocean Institute continues exploring the Southern Atlantic, one of the least explored marine regions on Earth. From deep waters off Brazil to seamounts, the expedition discovered 31 new species in just two weeks of exploration. Updated 10-Year Expedition Map announced.",
        "source": "Schmidt Ocean Institute 2026"
    },
    {
        "id": "OEXP-017",
        "name": "NOAA Ocean Exploration 2025 Field Season",
        "type": "Government deep-sea exploration",
        "operator": "NOAA Ocean Exploration",
        "country": "USA",
        "year": "2025",
        "description": "NOAA Ocean Exploration led a remotely operated vehicle (ROV) and mapping expedition on NOAA Ship Okeanos Explorer to explore deep waters. Part of ongoing US government efforts to map and characterize the deep ocean.",
        "source": "NOAA Ocean Exploration 2025"
    },
    {
        "id": "OEXP-018",
        "name": "E/V Nautilus 2025 Pacific Field Season",
        "type": "Deep-sea expedition",
        "operator": "Ocean Exploration Trust",
        "country": "USA",
        "year": "2025",
        "description": "E/V Nautilus successfully completed a six-month field season consisting of seven multi-disciplinary expeditions exploring the Pacific Ocean in 2025. The expeditions covered diverse deep-sea habitats and geological features.",
        "source": "Ocean Exploration Trust 2025"
    }
]

added, total = add_entities(f"{sea_base}/ocean_exploration.json", new_oexp)
print(f"  ocean_exploration.json: +{added} (total: {total})")

# New deep sea ecology
new_eco = [
    {
        "id": "DSEC-056",
        "name": "Deepest Chemosynthetic Community Discovery",
        "type": "Chemosynthesis-based ecosystem",
        "depth": "Hadal zone (deepest known)",
        "year": "2025-2026",
        "description": "Discovery of the deepest and most extensive chemosynthesis-based communities known to exist on Earth, found during a scientific expedition into the hadal zone of the Pacific Ocean. These communities thrive on chemical energy rather than sunlight, representing an other-worldly ecosystem.",
        "source": "Scientific expedition 2025-2026"
    },
    {
        "id": "DSEC-057",
        "name": "Schmidt Ocean Brazil 31 New Species Discovery",
        "type": "Deep-sea species discovery",
        "depth": "Deep waters off Brazil, South Atlantic",
        "year": "2026",
        "description": "An international team of experts discovered over two dozen (31) new marine species on a recent expedition off the coast of Brazil in the South Atlantic Ocean. The discoveries were made in just two weeks of deep-sea exploration, highlighting how much remains unknown in the deep ocean.",
        "source": "Schmidt Ocean Institute June 2026"
    }
]

added, total = add_entities(f"{sea_base}/deep_sea_ecology.json", new_eco)
print(f"  deep_sea_ecology.json: +{added} (total: {total})")

sea_total = sum(len(v) for v in [new_subs, new_oexp, new_eco])
print(f"  DEEP-SEA-TECH TOTAL NEW: {sea_total}")

# ============================================================
# 4. ROBOT-PARTS
# ============================================================
print("\n" + "=" * 60)
print("ROBOT-PARTS")
print("=" * 60)

robot_base = f"{BASE}/robot-parts/knowledge-base/entities"

# New actuators
new_actuators = [
    {
        "id": "ACT-005",
        "name": "Tesla Optimus Gen 3 Actuator System (50 Actuators)",
        "type": "Electromagnetic joint actuators (full body)",
        "manufacturer": "Tesla",
        "year": "2026",
        "torque": "N/A (Tesla-designed)",
        "description": "Tesla Optimus Gen 3 features 50 actuators total (28 structural + 50 per hand for dexterity). 22 degrees of freedom per hand. Tesla-designed actuators and sensors. The robot weighs 57 kg, stands 1.73m tall, and is 30% faster than previous generation with 10 kg weight reduction. 2.3 kWh battery.",
        "source": "Tesla 2026 patent filings, Awesome Robots"
    },
    {
        "id": "ACT-006",
        "name": "EngineAI T800 High-Torque Actuator System",
        "type": "High-torque joint actuators",
        "manufacturer": "EngineAI (China)",
        "year": "2025-2026",
        "torque": "Up to 450 N·m peak torque per joint",
        "description": "EngineAI T800 humanoid robot actuator system with 29 articulated body joints (full-body DOF, excluding dexterous hands). Capable of 360° motion range. High-torque actuators powered by solid-state battery. Aluminum-alloy frame. Full-stack in-house development.",
        "source": "EngineAI 2025-2026"
    },
    {
        "id": "ACT-007",
        "name": "Unitree H1 Joint Motor System",
        "type": "High-torque joint motors for humanoid",
        "manufacturer": "Unitree Robotics (China)",
        "year": "2025-2026",
        "torque": "360 N·m maximum (arm joint), 120 N·m",
        "description": "Unitree H1 humanoid robot joint motor system. Height ~180cm, weight ~70kg. Features 360° depth sensing and 3D LiDAR. Maximum torque of arm joint 360 N·m. Designed for agile locomotion and manipulation tasks.",
        "source": "Unitree Robotics 2025-2026"
    }
]

added, total = add_entities(f"{robot_base}/actuators.json", new_actuators)
print(f"  actuators.json: +{added} (total: {total})")

# New sensors
new_sensors = [
    {
        "id": "SENS-010",
        "name": "Tesla Optimus Gen 3 Sensor Suite",
        "type": "Multi-modal robot sensor system",
        "manufacturer": "Tesla",
        "year": "2026",
        "description": "Tesla-designed sensors integrated into Optimus Gen 3. Includes 360° vision system, force/torque sensing, and Tesla Autopilot AI for autonomous navigation. Features highly dexterous hands with tactile feedback. OLED facial display.",
        "source": "Tesla 2026"
    },
    {
        "id": "SENS-011",
        "name": "Unitree G1 Perception System (3D LiDAR + Depth Camera)",
        "type": "Robot perception sensor suite",
        "manufacturer": "Unitree Robotics (China)",
        "year": "2025-2026",
        "description": "Unitree G1 humanoid robot sensor suite: 3D LiDAR, depth camera, 4-microphone array, and 5W speaker. Enables 360° depth perception for autonomous navigation. G1 is a compact humanoid at ~127cm tall, 35kg, with speeds up to 3.3 m/s.",
        "source": "Unitree Robotics 2025-2026"
    },
    {
        "id": "SENS-012",
        "name": "Unitree H1 360° Depth Perception System",
        "type": "Multi-modal depth sensing system",
        "manufacturer": "Unitree Robotics (China)",
        "year": "2025-2026",
        "description": "Unitree H1's advanced perception system featuring 3D LiDAR and depth camera with 360° depth perception. Designed for robust environmental awareness in humanoid robot applications. Paired with high-torque actuators for dynamic locomotion.",
        "source": "Unitree Robotics 2025-2026"
    }
]

added, total = add_entities(f"{robot_base}/sensors.json", new_sensors)
print(f"  sensors.json: +{added} (total: {total})")

# New chips
new_chips = [
    {
        "id": "CHIP-005",
        "name": "NVIDIA Jetson Thor Robotics Computing Platform",
        "type": "AI computing platform for humanoid robots",
        "manufacturer": "NVIDIA",
        "year": "2025 (launching H1 2025)",
        "description": "NVIDIA's purpose-built computing platform for humanoid robots, launching in the first half of 2025. Combines high-performance GPU cores with specialized AI acceleration. Designed to run Isaac GR00T foundation models for humanoid robot perception, planning, and control.",
        "source": "NVIDIA GTC 2025, RoboZaps"
    },
    {
        "id": "CHIP-006",
        "name": "NVIDIA GB10 Grace + Blackwell (DIGITS Desktop AI)",
        "type": "Desktop AI computing chip",
        "manufacturer": "NVIDIA",
        "year": "2025",
        "description": "Announced at CES January 2025, NVIDIA's desktop AI machine (originally called Digits) uses the GB10 chip combining the Grace processor and Blackwell GPU architecture. Designed for AI development and robotics workloads at the desktop level.",
        "source": "NVIDIA CES 2025, eeNews Europe"
    }
]

added, total = add_entities(f"{robot_base}/chips.json", new_chips)
print(f"  chips.json: +{added} (total: {total})")

# New platforms
new_platforms = [
    {
        "id": "RPLAT-010",
        "name": "Tesla Optimus Gen 3",
        "type": "General-purpose humanoid robot",
        "manufacturer": "Tesla",
        "year": "2026 (commercial deployment)",
        "description": "Tesla Optimus第三代人形机器人。重量57kg，身高1.73m，比前代轻10kg、快30%。配备50个执行器（每只手50个），每只手22个自由度。2.3kWh电池，模块化设计便于量产。搭载Tesla Autopilot AI和FSD大脑，OLED面部显示屏。Fremont工厂正在改造以生产该机器人。",
        "key_features": [
            "50 actuators (28 structural + hand actuators)",
            "22 DoF per hand",
            "57 kg weight, 1.73m height",
            "2.3 kWh battery",
            "Tesla Autopilot AI integration",
            "OLED facial display",
            "Modular design for mass production",
            "30% faster than Gen 2"
        ],
        "price_range": "Targeting affordable (mass production)"
    },
    {
        "id": "RPLAT-011",
        "name": "EngineAI T800 Humanoid Robot",
        "type": "Full-size general-purpose humanoid robot",
        "manufacturer": "EngineAI (China)",
        "year": "2025-2026",
        "description": "EngineAI T800全尺寸人形机器人，身高约1.85米。采用铝合金框架、高扭矩执行器和固态电池设计。全身29个自由度（不含灵巧手），峰值扭矩可达450 N·m，支持360°运动范围。具备武术表演能力。全栈自主研发。2025年底发布。",
        "key_features": [
            "1.85m height, full-size humanoid",
            "29 DOF (excluding dexterous hands)",
            "Up to 450 N·m peak torque per joint",
            "360° motion range",
            "Aluminum-alloy frame",
            "Solid-state battery",
            "Martial arts capability",
            "Full-stack in-house development"
        ],
        "price_range": "N/A"
    },
    {
        "id": "RPLAT-012",
        "name": "Unitree G1 Humanoid Robot",
        "type": "Compact humanoid robot (AI avatar)",
        "manufacturer": "Unitree Robotics (China)",
        "year": "2025-2026",
        "description": "Unitree G1是最经济实惠的人形机器人，起价$13,500。身高约127cm，重约35kg。配备23-43个关节电机，3D LiDAR和深度相机。最高速度3.3 m/s。2025-2026年全球出货数千台，通过模仿学习和强化学习引领人形机器人革命。G1 EDU版本增加有效载荷至3kg并扩展自由度。",
        "key_features": [
            "Starting at $13,500",
            "127cm tall, 35kg",
            "23-43 joint motors",
            "3D LiDAR + depth camera",
            "Up to 3.3 m/s walking speed",
            "4-microphone array + 5W speaker",
            "Imitation learning + RL",
            "Thousands shipped worldwide"
        ],
        "price_range": "From $13,500"
    },
    {
        "id": "RPLAT-013",
        "name": "Unitree H1 Humanoid Robot",
        "type": "Full-size humanoid robot",
        "manufacturer": "Unitree Robotics (China)",
        "year": "2025-2026",
        "description": "Unitree H1全尺寸人形机器人，身高约180cm，重约70kg。最大臂关节扭矩360 N·m。配备3D LiDAR和360°深度感知系统。与NVIDIA合作，作为Isaac GR00T参考人形机器人平台的基础。",
        "key_features": [
            "180cm tall, 70kg",
            "360 N·m max arm joint torque",
            "3D LiDAR + 360° depth perception",
            "NVIDIA Isaac GR00T integration",
            "Bipedal locomotion"
        ],
        "price_range": "N/A"
    },
    {
        "id": "RPLAT-014",
        "name": "NVIDIA Isaac GR00T Reference Humanoid Robot",
        "type": "Open humanoid robot reference design",
        "manufacturer": "NVIDIA (with Unitree)",
        "year": "2025-2026",
        "description": "NVIDIA发布的人形机器人参考设计，基于Isaac GR00T平台构建，结合Unitree H2 Plus人形机器人。为人形机器人开发提供开放平台，包括基础模型、数据流水线和仿真环境（Isaac Lab）。NVIDIA首个人形机器人系统使用中国初创公司Unitree的人形机器人。",
        "key_features": [
            "Open reference design",
            "Built on Isaac GR00T platform",
            "Unitree H2 Plus humanoid base",
            "Foundation models included",
            "Isaac Lab simulation environment",
            "GR00T N1.5 and GR00T-Dreams synthetic data",
            "First publicly available humanoid robotics system from NVIDIA"
        ],
        "price_range": "N/A (reference design)"
    }
]

added, total = add_entities(f"{robot_base}/platforms.json", new_platforms)
print(f"  platforms.json: +{added} (total: {total})")

# New interfaces
new_interfaces = [
    {
        "id": "INT-005",
        "name": "NVIDIA Isaac GR00T Platform (GR00T N1.5 + GR00T-Dreams)",
        "type": "Humanoid robot development platform",
        "manufacturer": "NVIDIA",
        "year": "2025-2026",
        "description": "NVIDIA Isaac GR00T是人形机器人的基础模型和数据流水线研究与开发平台。包含GR00T N1.5基础模型和GR00T-Dreams合成数据生成工具。提供仿真环境(Isaac Lab)、人在回路的数据采集管道，以及NVIDIA端到端机器人平台用于大规模AI机器人训练和部署。",
        "source": "NVIDIA GTC 2025, Computex 2025"
    }
]

added, total = add_entities(f"{robot_base}/interfaces.json", new_interfaces)
print(f"  interfaces.json: +{added} (total: {total})")

robot_total = sum(len(v) for v in [new_actuators, new_sensors, new_chips, new_platforms, new_interfaces])
print(f"  ROBOT-PARTS TOTAL NEW: {robot_total}")

# ============================================================
# SUMMARY
# ============================================================
grand_total = exo_total + alien_total + sea_total + robot_total
print("\n" + "=" * 60)
print(f"GRAND TOTAL NEW ENTITIES: {grand_total}")
print(f"  exo-science: {exo_total}")
print(f"  alien-minerals: {alien_total}")
print(f"  deep-sea-tech: {sea_total}")
print(f"  robot-parts: {robot_total}")
print("=" * 60)
