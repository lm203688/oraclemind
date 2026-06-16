const DB = {
  "updated": "2026-05-29T02:27:01.442Z",
  "stats": {
    "asteroids": 10,
    "minerals": 15,
    "mining_tech": 10,
    "processing_methods": 6,
    "resource_assessment": 5,
    "space_resources": 8
  },
  "asteroids": [
    {
      "id": "AST-001",
      "name": "16 Psyche",
      "designation": "16 Psyche",
      "type": "M-type (metallic)",
      "diameter_km": "226",
      "composition": "Iron-nickel core (kamacite, taenite); possible gold, platinum, cobalt",
      "orbit": "2.9 AU (main belt), period 4.99 years",
      "mining_potential": "Highest - estimated $10 quintillion metal value; NASA Psyche mission en route (arrival 2029)",
      "mission": "NASA Psyche (launched Oct 2023, arrival Aug 2029)",
      "description": "16 Psyche is the largest metallic asteroid and the primary target for asteroid mining concepts. It may be the exposed core of a protoplanet that lost its mantle through collisions. Spectroscopic data suggests a surface of nearly pure iron-nickel metal. The NASA Psyche mission will map its composition in detail starting 2029."
    },
    {
      "id": "AST-002",
      "name": "Bennu",
      "designation": "101955 Bennu",
      "type": "B-type (carbonaceous)",
      "diameter_km": "0.49",
      "composition": "Carbonaceous chondrite; phyllosilicates, magnetite, sulfides, organics; 5% water by mass",
      "orbit": "0.9 AU (near-Earth), period 1.2 years",
      "mining_potential": "High - water and organic extraction; OSIRIS-REx returned 121.6g sample in 2023",
      "mission": "OSIRIS-REx (sample returned Sep 2023)",
      "description": "Bennu is a carbonaceous near-Earth asteroid sampled by NASA's OSIRIS-REx mission. The returned sample revealed abundant phyllosilicates, magnetite, and organic molecules including amino acid precursors. Its water content and organic richness make it a prime target for understanding ISRU potential on C-type asteroids."
    },
    {
      "id": "AST-003",
      "name": "Ryugu",
      "designation": "162173 Ryugu",
      "type": "Cb-type (carbonaceous)",
      "diameter_km": "0.896",
      "composition": "CI chondrite-like; phyllosilicates, carbonates, sulfides; amino acids, nucleobases found",
      "orbit": "1.19 AU (near-Earth), period 1.52 years",
      "mining_potential": "High - water-bearing minerals, organics; JAXA returned 5.4g sample in 2020",
      "mission": "Hayabusa2 (sample returned Dec 2020)",
      "description": "Ryugu was sampled by JAXA's Hayabusa2 mission. Analysis revealed it is rich in hydrated minerals and contains amino acids and nucleobases - building blocks of life. Its CI chondrite composition represents some of the most primitive material in the solar system, making it scientifically and economically valuable."
    },
    {
      "id": "AST-004",
      "name": "4 Vesta",
      "designation": "4 Vesta",
      "type": "V-type (basaltic)",
      "diameter_km": "525",
      "composition": "Basaltic crust (pyroxene, plagioclase); possible olivine mantle; iron core",
      "orbit": "2.36 AU (main belt), period 3.63 years",
      "mining_potential": "Medium - differentiated body with potential for multiple resource types; basaltic construction material",
      "mission": "Dawn (orbited 2011-2012)",
      "description": "Vesta is the second-largest asteroid and the only one visible to the naked eye. Dawn mission data confirmed it is a differentiated body with an iron core, basaltic crust, and possible olivine-rich mantle. Its basaltic surface could provide construction materials, while its differentiated structure suggests concentrated metal deposits."
    },
    {
      "id": "AST-005",
      "name": "Eros",
      "designation": "433 Eros",
      "type": "S-type (stony)",
      "diameter_km": "16.84",
      "composition": "Silicate-rich; olivine, pyroxene; metallic iron inclusions; regolith with 1.5% fine metal",
      "orbit": "1.46 AU (near-Earth Amor), period 1.76 years",
      "mining_potential": "Medium - silicate and metal resources; well-characterized from NEAR Shoemaker mission",
      "mission": "NEAR Shoemaker (orbited 2000-2001, landed Feb 2001)",
      "description": "Eros was the first asteroid orbited and landed upon by a spacecraft (NEAR Shoemaker). Its S-type composition includes olivine, pyroxene, and metallic iron. While less metal-rich than M-type asteroids, its near-Earth orbit and well-characterized surface make it a candidate for early mining operations."
    },
    {
      "id": "AST-006",
      "name": "Itokawa",
      "designation": "25143 Itokawa",
      "type": "S-type (stony)",
      "diameter_km": "0.33",
      "composition": "Olivine, pyroxene; rubble pile structure; metallic iron grains",
      "orbit": "1.32 AU (near-Earth Apollo), period 1.52 years",
      "mining_potential": "Medium - small but accessible; rubble pile structure may facilitate mining",
      "mission": "Hayabusa (sample returned June 2010)",
      "description": "Itokawa was the first asteroid from which samples were returned (JAXA Hayabusa). It is a rubble pile - a loose aggregation of boulders and gravel held together by gravity. This structure could actually facilitate mining operations, as material is already fragmented and requires less energy to excavate."
    },
    {
      "id": "AST-007",
      "name": "Ceres",
      "designation": "1 Ceres",
      "type": "C-type (carbonaceous, dwarf planet)",
      "diameter_km": "939",
      "composition": "Water ice crust, hydrated minerals; organic compounds; possible subsurface brine ocean",
      "orbit": "2.77 AU (main belt), period 4.6 years",
      "mining_potential": "Very High - vast water ice deposits; organics; largest object in asteroid belt",
      "mission": "Dawn (orbited 2015-2018)",
      "description": "Ceres is the largest object in the asteroid belt and the only dwarf planet in the inner solar system. Dawn mission data revealed bright spots (carbonate deposits) in Occator Crater, indicating recent brine activity. Ceres may contain more fresh water than all of Earth's fresh water, making it the most significant water resource in the asteroid belt."
    },
    {
      "id": "AST-008",
      "name": "Didymos/Dimorphos",
      "designation": "65803 Didymos I Dimorphos",
      "type": "S-type (stony, binary system)",
      "diameter_km": "0.78 (Didymos) / 0.17 (Dimorphos)",
      "composition": "Silicate-rich; olivine, pyroxene; rubble pile structure",
      "orbit": "1.64 AU (near-Earth Apollo), period 2.11 years",
      "mining_potential": "Medium - well-characterized binary system; DART impact data provides subsurface information",
      "mission": "DART (impact Sep 2022), Hera (launch 2024, arrival 2026)",
      "description": "The Didymos-Dimorphos binary system was the target of NASA's DART planetary defense test. The impact ejected subsurface material, providing unprecedented information about asteroid interior composition. ESA's Hera mission (arriving 2026) will study the impact crater in detail, making this the best-characterized binary asteroid system."
    },
    {
      "id": "AST-009",
      "name": "Apophis",
      "designation": "99942 Apophis",
      "type": "Sq-type (stony)",
      "diameter_km": "0.37",
      "composition": "Silicate with some metal; olivine, pyroxene, metal grains",
      "orbit": "0.92 AU (near-Earth Aten), period 0.89 years",
      "mining_potential": "Medium-High - extremely close Earth approach in 2029 enables easy access; well-studied",
      "mission": "OSIRIS-APEX (encounter 2029)",
      "description": "Apophis will pass within 31,000 km of Earth on April 13, 2029 - closer than geostationary satellites. This extremely close approach makes it uniquely accessible for mining missions. NASA has redirected the OSIRIS-APEX spacecraft to study Apophis during the 2029 encounter, providing detailed composition data."
    },
    {
      "id": "AST-010",
      "name": "Pallas",
      "designation": "2 Pallas",
      "type": "B-type (carbonaceous)",
      "diameter_km": "512",
      "composition": "Carbonaceous; hydrated minerals; possible water ice; high orbital inclination",
      "orbit": "2.77 AU (main belt), period 4.62 years",
      "mining_potential": "Medium - large carbonaceous body but high orbital inclination makes access difficult",
      "mission": "No dedicated mission",
      "description": "Pallas is the third-largest asteroid and has a carbonaceous composition similar to Ceres. However, its high orbital inclination (34.8°) makes it energetically expensive to reach. If access challenges can be overcome, its size and composition make it a significant potential water and organic resource."
    }
  ],
  "main": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:40:02.660Z",
    "description": "外星矿物实体库",
    "entities": []
  },
  "minerals": [
    {
      "id": "MINERAL-xk9m2p",
      "name": "Olivine (Forsterite)",
      "formula": "Mg₂SiO₄",
      "crystal_system": "Orthorhombic",
      "hardness": "6.5-7",
      "density": "3.2-4.4 g/cm³",
      "occurrence": "Ubiquitous in lunar mare basalts and asteroid regolith; major component of chondritic meteorites",
      "significance": "Source of magnesium and silicon for ISRU; potential for CO₂ mineralization on Earth; abundant on Moon and near-Earth asteroids",
      "source": "NASA Lunar Sample Analysis, JAXA Hayabusa2",
      "description": "Olivine is the most abundant mineral in the upper mantle of rocky bodies. On the Moon, it is found in mare basalts and deep crustal material. Asteroids like Ryugu and Bennu show olivine-rich compositions. Its magnesium content makes it valuable for in-situ construction and metal extraction."
    },
    {
      "id": "MINERAL-q7n4r8",
      "name": "Ilmenite",
      "formula": "FeTiO₃",
      "crystal_system": "Trigonal",
      "hardness": "5-6",
      "density": "4.7 g/cm³",
      "occurrence": "Abundant in lunar mare basalts (up to 20% by volume); found in some achondrite meteorites",
      "significance": "Primary source of titanium for space construction; also yields iron and oxygen through reduction; key ISRU target on the Moon",
      "source": "Apollo sample analysis, NASA ISRU studies",
      "description": "Ilmenite is one of the most strategically important lunar minerals. NASA and ESA have identified it as a priority ISRU target because it can be processed to yield titanium metal, iron, and oxygen simultaneously. The hydrogen reduction of ilmenite (FeTiO₃ + H₂ → Fe + TiO₂ + H₂O) is a well-studied process for lunar oxygen production."
    },
    {
      "id": "MINERAL-w3t6v1",
      "name": "Anorthite",
      "formula": "CaAl₂Si₂O₈",
      "crystal_system": "Triclinic",
      "hardness": "6-6.5",
      "density": "2.76 g/cm³",
      "occurrence": "Dominant mineral in lunar highlands (anorthosite); makes up bulk of lunar crust",
      "significance": "Source of aluminum and calcium; potential feedstock for lunar glass and ceramics; extremely abundant on Moon",
      "source": "Apollo samples, Lunar Reconnaissance Orbiter data",
      "description": "Anorthite constitutes the bulk of the lunar highlands crust, formed from the flotation of plagioclase during the lunar magma ocean crystallization. It is the most abundant mineral on the lunar surface and represents a vast resource for aluminum production and construction materials."
    },
    {
      "id": "MINERAL-p5m8k3",
      "name": "Kamacite",
      "formula": "Fe₀.₉Ni₀.₁ (iron-nickel alloy)",
      "crystal_system": "Cubic (body-centered)",
      "hardness": "4-5",
      "density": "7.8-7.9 g/cm³",
      "occurrence": "Major metallic phase in iron meteorites and M-type asteroids (e.g., 16 Psyche); found in chondritic meteorite metal grains",
      "significance": "Direct source of metallic iron and nickel; no smelting required; primary economic target for asteroid mining",
      "source": "Meteorite analysis, Psyche mission planning documents",
      "description": "Kamacite is the low-nickel phase of iron-nickel alloy found in metallic asteroids. Unlike terrestrial iron ores that require energy-intensive smelting, kamacite is already in metallic form and can be directly processed. M-type asteroids like 16 Psyche are estimated to contain vast quantities, making kamacite the most economically attractive space mining target."
    },
    {
      "id": "MINERAL-j2h7n9",
      "name": "Taenite",
      "formula": "Fe₀.₈Ni₀.₂ (iron-nickel alloy)",
      "crystal_system": "Cubic (face-centered)",
      "hardness": "5-5.5",
      "density": "8.0-8.2 g/cm³",
      "occurrence": "Found alongside kamacite in iron meteorites and M-type asteroids; higher nickel content than kamacite",
      "significance": "Source of high-grade nickel; valuable for stainless steel and superalloy production in space; PGE carrier",
      "source": "Meteorite studies, 16 Psyche spectroscopy",
      "description": "Taenite is the high-nickel phase of iron-nickel alloy in metallic asteroids. Its nickel content (20-65%) makes it particularly valuable as a source of nickel for stainless steel and superalloys. Taenite also often contains trace amounts of platinum group elements (PGEs), adding to its economic significance."
    },
    {
      "id": "MINERAL-f8q4w6",
      "name": "Pyroxene (Clinopyroxene)",
      "formula": "(Ca,Mg,Fe)SiO₃",
      "crystal_system": "Monoclinic",
      "hardness": "5-6",
      "density": "3.2-3.6 g/cm³",
      "occurrence": "Common in lunar mare basalts, Martian basalts, and achondrite meteorites; found on asteroid Vesta",
      "significance": "Source of magnesium, iron, and calcium; potential feedstock for construction materials; indicator of volcanic history",
      "source": "Apollo samples, Mars rover analysis, Dawn mission Vesta data",
      "description": "Pyroxenes are major rock-forming minerals found across the solar system. On the Moon, clinopyroxene is abundant in mare basalts. On Mars, pyroxene-bearing rocks indicate volcanic activity. The Dawn mission confirmed pyroxene-rich surfaces on Vesta, suggesting differentiated volcanic processes."
    },
    {
      "id": "MINERAL-r1s5t7",
      "name": "Spinel",
      "formula": "MgAl₂O₄",
      "crystal_system": "Cubic (isometric)",
      "hardness": "7.5-8",
      "density": "3.58 g/cm³",
      "occurrence": "Found in lunar highlands and mare basalts; present in some carbonaceous chondrites; detected on Mars",
      "significance": "Source of magnesium and aluminum; extremely refractory (high melting point); potential for high-temperature applications in space",
      "source": "Chandrayaan-1 M³ data, Apollo samples",
      "description": "Spinel has been identified across the lunar surface by Chandrayaan-1's Moon Mineralogy Mapper. Its high melting point (2135°C) makes it valuable for refractory applications in space manufacturing. Pink spinel anorthosite deposits on the Moon represent concentrated aluminum resources."
    },
    {
      "id": "MINERAL-v9b3x2",
      "name": "Troilite",
      "formula": "FeS",
      "crystal_system": "Hexagonal",
      "hardness": "3.5-4",
      "density": "4.6-4.8 g/cm³",
      "occurrence": "Ubiquitous in iron and stony-iron meteorites; found in lunar basalts; present on Mars",
      "significance": "Source of sulfur for construction (lunar concrete); potential oxygen source via roasting; indicator of reducing conditions",
      "source": "Apollo samples, meteorite analysis",
      "description": "Troilite (FeS) is the most common sulfide mineral in meteorites and is found on the Moon and Mars. Sulfur from troilite can be used to make sulfur concrete for lunar construction without water. The roasting of troilite also releases sulfur dioxide, which can be processed for oxygen extraction."
    },
    {
      "id": "MINERAL-m6k1p4",
      "name": "Plagioclase Feldspar",
      "formula": "NaAlSi₃O₈ - CaAl₂Si₂O₈ (solid solution)",
      "crystal_system": "Triclinic",
      "hardness": "6-6.5",
      "density": "2.6-2.8 g/cm³",
      "occurrence": "Most abundant mineral group in lunar crust; dominant in highlands anorthosite; found in Martian and asteroidal materials",
      "significance": "Source of aluminum, silicon, sodium, calcium; feedstock for glass and ceramic production; lunar soil main component",
      "source": "Apollo samples, Chang'e missions, Mars rovers",
      "description": "Plagioclase feldspar is the single most abundant mineral in the lunar crust, comprising up to 90% of highland anorthosites. It is a primary target for ISRU because it can be processed into glass fibers for structural composites, ceramics for heat shields, and aluminum metal for construction."
    },
    {
      "id": "MINERAL-a7d2e5",
      "name": "Chromite",
      "formula": "FeCr₂O₄",
      "crystal_system": "Cubic (isometric)",
      "hardness": "5.5",
      "density": "4.5-5.1 g/cm³",
      "occurrence": "Found in lunar mare basalts; present in some achondrites; detected in asteroid regolith samples",
      "significance": "Source of chromium for stainless steel and superalloys; strategic metal for space manufacturing; relatively rare on Moon",
      "source": "Apollo sample analysis, Hayabusa2 preliminary analysis",
      "description": "Chromite is an important source of chromium, a critical alloying element for stainless steel and superalloys needed in space applications. While less abundant than ilmenite on the Moon, chromite's strategic importance for metallurgy makes it a high-value ISRU target."
    },
    {
      "id": "MINERAL-c4f8g1",
      "name": "He-3 (Helium-3)",
      "formula": "³He",
      "crystal_system": "N/A (noble gas)",
      "hardness": "N/A",
      "density": "N/A",
      "occurrence": "Embedded in lunar regolith from solar wind implantation; concentrations of 1-50 ppb in mare regolith, higher in some highland soils",
      "significance": "Potential fuel for aneutronic fusion reactors; estimated 1 million tonnes on Moon; $3-5 billion per tonne theoretical value",
      "source": "Apollo regolith analysis, lunar resource assessments",
      "description": "Helium-3 is implanted in lunar regolith by solar wind over billions of years. While concentrations are extremely low (parts per billion), the total estimated lunar inventory of ~1 million tonnes represents a potentially transformative energy resource if practical fusion reactors are developed. Mining would require processing enormous volumes of regolith."
    },
    {
      "id": "MINERAL-h9j5l3",
      "name": "Water Ice",
      "formula": "H₂O",
      "crystal_system": "Hexagonal (Ice Ih)",
      "hardness": "1.5",
      "density": "0.92 g/cm³",
      "occurrence": "Permanently shadowed craters at lunar poles (LCROSS confirmed); subsurface ice on Mars; ice in C-type asteroid regolith",
      "significance": "Most critical ISRU resource - drinking water, oxygen, hydrogen fuel; enables all other space activities; confirmed at lunar south pole",
      "source": "LCROSS mission, Chandrayaan-1, LRO, Mars Odyssey",
      "description": "Water ice is the single most valuable space resource because it enables life support, propulsion (as LH₂/LOX), and radiation shielding. NASA's LCROSS mission confirmed water ice in permanently shadowed lunar craters. The lunar south pole is the primary target for near-term ISRU missions, with Artemis planning to establish infrastructure there."
    },
    {
      "id": "MINERAL-n2p6r8",
      "name": "Phyllosilicates (Clay Minerals)",
      "formula": "Various (e.g., Mg₃Si₂O₅(OH)₄ - serpentine group)",
      "crystal_system": "Monoclinic",
      "hardness": "1-3",
      "density": "2.2-2.8 g/cm³",
      "occurrence": "Abundant in carbonaceous chondrite asteroids (Ryugu, Bennu); detected on Mars; found in some CM chondrite meteorites",
      "significance": "Indicates past water activity; source of bound water for extraction; potential for soil conditioning in space agriculture",
      "source": "Hayabusa2 Ryugu analysis, OSIRIS-REx Bennu data, Mars Reconnaissance Orbiter",
      "description": "Phyllosilicates are clay minerals formed by aqueous alteration of silicate rocks. Their presence on asteroids like Ryugu and Bennu confirms past water activity. These minerals contain structurally bound water (OH groups) that can be extracted by heating, providing a potential water source from dry-appearing asteroid surfaces."
    },
    {
      "id": "MINERAL-t5u9w2",
      "name": "Magnetite",
      "formula": "Fe₃O₄",
      "crystal_system": "Cubic (isometric)",
      "hardness": "5.5-6.5",
      "density": "5.17 g/cm³",
      "occurrence": "Found in carbonaceous chondrites; present in some lunar samples; detected on Martian surface",
      "significance": "Source of iron ore; magnetic properties enable easy separation from regolith; potential for in-situ magnet manufacturing",
      "source": "Hayabusa2 analysis, Mars rover studies",
      "description": "Magnetite is a strongly magnetic iron oxide found in carbonaceous chondrite asteroids. Its magnetic properties allow for simple physical separation from other regolith components using magnetic separators - a significant advantage for ISRU processing. It can be reduced to metallic iron using hydrogen or carbon monoxide."
    },
    {
      "id": "MINERAL-y8z3a6",
      "name": "Rare Earth Element (REE) Minerals (e.g., Monazite, Bastnäsite)",
      "formula": "(Ce,La,Nd,Th)PO₄ (monazite); (Ce,La)(CO₃)F (bastnäsite)",
      "crystal_system": "Monoclinic (monazite); Hexagonal (bastnäsite)",
      "hardness": "5-5.5",
      "density": "4.9-5.5 g/cm³",
      "occurrence": "Trace amounts in lunar KREEP terrain; potentially enriched in some asteroid types; found in achondrite meteorites",
      "significance": "Critical for electronics, magnets, and advanced materials; supply chain concerns on Earth; potential high-value space resource",
      "source": "Apollo KREEP sample analysis, lunar orbital spectroscopy",
      "description": "Rare earth elements are concentrated in lunar KREEP (Potassium, Rare Earth Elements, Phosphorus) terrains, particularly around Mare Imbrium. While concentrations are lower than terrestrial REE deposits, the absence of environmental regulations and the co-location with other ISRU activities could make lunar REE extraction economically viable in the long term."
    }
  ],
  "mining_tech": [
    {
      "id": "MINE-001",
      "name": "Molten Regolith Electrolysis",
      "type": "Extraction",
      "description": "Electrolysis of molten lunar regolith at 1600°C to produce oxygen gas and metal alloys (Fe, Al, Si, Ti) simultaneously",
      "trl": "TRL 4-5",
      "organization": "NASA KSC, ESA, Metalysis (UK)",
      "target": "Lunar regolith",
      "status": "Laboratory demonstrated with lunar simulant and Apollo samples",
      "breakthrough": "Metalysis and ESA demonstrated oxygen and metal alloy co-production from lunar regolith simulant in 2020"
    },
    {
      "id": "MINE-002",
      "name": "Hydrogen Reduction of Ilmenite",
      "type": "Extraction",
      "description": "Reduction of ilmenite (FeTiO₃) with hydrogen gas at 900-1100°C to produce water, which is then electrolyzed for oxygen",
      "trl": "TRL 5-6",
      "organization": "NASA JSC, University of Glasgow, DLR",
      "target": "Lunar mare basalts (ilmenite-rich)",
      "status": "Extensively tested in laboratory; Carbothermal reduction demonstrated",
      "breakthrough": "NASA demonstrated continuous hydrogen reduction with >90% oxygen yield from ilmenite"
    },
    {
      "id": "MINE-003",
      "name": "Water Ice Extraction (Thermal Mining)",
      "type": "Extraction",
      "description": "Direct heating of permanently shadowed region (PSR) regolith to sublimate water ice, then capture and purify",
      "trl": "TRL 3-4",
      "organization": "NASA JPL, Colorado School of Mines, Honeybee Robotics",
      "target": "Lunar south pole PSR craters",
      "status": "Conceptual design and laboratory testing; planned for Artemis missions",
      "breakthrough": "Honeybee Robotics developed PlanetVac and thermal mining concepts for PSR ice extraction"
    },
    {
      "id": "MINE-004",
      "name": "Asteroid Capture and Bagging",
      "type": "Capture",
      "description": "Enclosing a small asteroid in a containment bag and processing it in situ or at a staging point (e.g., lunar orbit)",
      "trl": "TRL 2-3",
      "organization": "NASA (ARM concept), TransAstra, AstroForge",
      "target": "Small near-Earth asteroids (<10m)",
      "status": "Conceptual; NASA ARM cancelled but commercial efforts ongoing",
      "breakthrough": "TransAstra's Honey Bee and Queen Bee concepts for optical mining of bagged asteroids"
    },
    {
      "id": "MINE-005",
      "name": "Optical Mining",
      "type": "Extraction",
      "description": "Concentrated solar energy to fracture and volatilize asteroid material inside a containment bag, extracting water and organics",
      "trl": "TRL 3-4",
      "organization": "TransAstra Corporation",
      "target": "Carbonaceous asteroids",
      "status": "Laboratory demonstrations with simulated asteroid material",
      "breakthrough": "TransAstra demonstrated concentrated solar thermal extraction of water from simulant in vacuum chamber"
    },
    {
      "id": "MINE-006",
      "name": "3D Printing with Regolith",
      "type": "Construction",
      "description": "Using lunar or Martian regolith as feedstock for additive manufacturing of structures, tools, and spare parts",
      "trl": "TRL 4-5",
      "organization": "NASA MSFC, ESA, ICON, AI SpaceFactory",
      "target": "Lunar/Martian surface construction",
      "status": "Multiple successful demonstrations with simulants; ICON awarded NASA contract for lunar construction",
      "breakthrough": "ICON received $57.2M NASA contract to develop Olympus construction system for Moon"
    },
    {
      "id": "MINE-007",
      "name": "Sulfur Concrete Production",
      "type": "Construction",
      "description": "Using extracted sulfur (from troilite) as a binder instead of water for concrete production on the Moon",
      "trl": "TRL 4",
      "organization": "University of Hawaii, NASA JSC, ESA",
      "target": "Lunar construction",
      "status": "Laboratory demonstrated with lunar simulant; sulfur concrete achieves 50-70 MPa compressive strength",
      "breakthrough": "Demonstrated that sulfur concrete can be made and recycled on the Moon without water"
    },
    {
      "id": "MINE-008",
      "name": "Magnetic Separation of Regolith",
      "type": "Processing",
      "description": "Using magnetic fields to separate ilmenite, magnetite, and metallic iron grains from bulk regolith",
      "trl": "TRL 4-5",
      "organization": "Colorado School of Mines, NASA KSC",
      "target": "Lunar and asteroidal regolith beneficiation",
      "status": "Demonstrated with lunar simulants; ilmenite concentration from 5% to 90%+ achieved",
      "breakthrough": "Magnetic beneficiation can concentrate ilmenite from bulk mare regolith by 15-20x"
    },
    {
      "id": "MINE-009",
      "name": "Electrostatic Beneficiation",
      "type": "Processing",
      "description": "Using triboelectric charging and electrostatic fields to separate mineral grains by their charge characteristics",
      "trl": "TRL 3-4",
      "organization": "University of Hawaii, NASA KSC",
      "target": "Lunar regolith mineral separation",
      "status": "Laboratory demonstrated with simulants in vacuum conditions",
      "breakthrough": "Demonstrated separation of anorthite from ilmenite using triboelectric charging in vacuum"
    },
    {
      "id": "MINE-010",
      "name": "AstroForge Asteroid Refining",
      "type": "Commercial",
      "description": "Commercial in-space refining of asteroid metals using concentrated solar heating and vacuum distillation",
      "trl": "TRL 2-3",
      "organization": "AstroForge",
      "target": "M-type asteroids (platinum group metals)",
      "status": "Brokkr-1 demonstration mission launched 2023 (partial); Brokkr-2 planned",
      "breakthrough": "First commercial attempt at in-space asteroid metal refining; demonstrated orbital refining concept"
    }
  ],
  "processing_methods": [
    {
      "id": "PROC-001",
      "name": "Vacuum Distillation",
      "method_type": "Separation",
      "description": "Using the natural vacuum of space to distill and separate metals by their different boiling points, without need for containment vessels",
      "input_material": "Mixed asteroid metal",
      "output": "Separated pure metals (Fe, Ni, Co, PGMs)",
      "efficiency": "High for volatile metals; PGMs require very high temperatures",
      "space_viability": "Excellent - vacuum is free in space; no atmosphere to manage"
    },
    {
      "id": "PROC-002",
      "name": "Carbothermal Reduction",
      "method_type": "Chemical Reduction",
      "description": "Reduction of metal oxides using carbon (from CO₂ or methane) at high temperature to produce metals and CO/CO₂ gas",
      "input_material": "Metal oxide ores (ilmenite, regolith)",
      "output": "Metal + CO/CO₂ gas",
      "efficiency": "Moderate; requires carbon source and high temperature",
      "space_viability": "Good - carbon can be sourced from CO₂ (Mars) or imported; demonstrated with lunar simulant"
    },
    {
      "id": "PROC-003",
      "name": "Molten Salt Electrolysis (FFC Cambridge Process)",
      "method_type": "Electrochemical",
      "description": "Electrolysis of metal oxides dissolved in molten CaCl₂ to produce pure metals and oxygen",
      "input_material": "Metal oxide ores (TiO₂, lunar regolith)",
      "output": "Pure metal + oxygen gas",
      "efficiency": "High for titanium; lower energy than Kroll process",
      "space_viability": "Good - demonstrated for titanium from ilmenite; oxygen co-product valuable"
    },
    {
      "id": "PROC-004",
      "name": "Aqueous Processing (Leaching)",
      "method_type": "Chemical Dissolution",
      "description": "Dissolving target minerals in acid or base solutions to extract specific elements",
      "input_material": "Regolith or asteroid material",
      "output": "Dissolved target elements + residue",
      "efficiency": "High selectivity; requires water and chemicals",
      "space_viability": "Challenging - requires water recycling and chemical management in microgravity"
    },
    {
      "id": "PROC-005",
      "name": "Solar Thermal Processing",
      "method_type": "Thermal",
      "description": "Using concentrated sunlight to heat materials to extreme temperatures for sintering, melting, or vaporization",
      "input_material": "Regolith, asteroid material",
      "output": "Sintered/melted products, volatilized gases",
      "efficiency": "Limited by solar flux and concentrator size; free energy source",
      "space_viability": "Excellent - abundant solar energy; demonstrated for regolith sintering"
    },
    {
      "id": "PROC-006",
      "name": "Plasma Smelting",
      "method_type": "Thermal/Electrical",
      "description": "Using plasma arcs to achieve extreme temperatures (>10,000°C) for rapid metal extraction and refining",
      "input_material": "Raw asteroid or regolith material",
      "output": "Refined metals, slag, gases",
      "efficiency": "Very high temperatures achievable; energy intensive",
      "space_viability": "Moderate - requires significant electrical power; compact equipment"
    }
  ],
  "resource_assessment": [
    {
      "id": "RASS-001",
      "name": "Lunar South Pole Ice Assessment",
      "body": "Moon",
      "resource": "Water ice",
      "assessment_method": "LCROSS impact, LRO LEND, Chandrayaan-1 M³, Mini-SAR",
      "confidence": "High - confirmed presence; quantity estimates vary ±50%",
      "estimated_value": "Enabling resource for lunar and cislunar operations",
      "description": "Multiple orbital and impact missions have confirmed water ice in PSR craters. LCROSS detected ~5.6% water by mass in Cabeus ejecta. LRO data suggests ice deposits in multiple south pole craters. Artemis III will provide ground truth."
    },
    {
      "id": "RASS-002",
      "name": "16 Psyche Metal Assessment",
      "body": "16 Psyche",
      "resource": "Iron-nickel-platinum group metals",
      "assessment_method": "Ground-based spectroscopy, radar, Hubble UV observations",
      "confidence": "Medium - metal surface confirmed; interior composition uncertain until Psyche mission arrives",
      "estimated_value": "Potentially largest metal resource in solar system",
      "description": "Spectroscopic and radar data strongly suggest a metallic surface composition. However, the interior structure (solid metal vs. rubble pile with metal fragments) remains unknown. The NASA Psyche mission (arrival 2029) will provide definitive composition data."
    },
    {
      "id": "RASS-003",
      "name": "Bennu/Ryugu Water Assessment",
      "body": "Bennu, Ryugu",
      "resource": "Hydrated minerals (bound water)",
      "assessment_method": "Sample return analysis (OSIRIS-REx, Hayabusa2), orbital spectroscopy",
      "confidence": "Very High - direct sample analysis confirms hydrated minerals",
      "estimated_value": "5-10% water by mass extractable at moderate temperatures",
      "description": "Direct sample analysis from both missions confirmed phyllosilicate minerals containing structurally bound water. This represents a validated water resource that can be extracted by heating to 300-800°C."
    },
    {
      "id": "RASS-004",
      "name": "Lunar KREEP REE Assessment",
      "body": "Moon",
      "resource": "Rare Earth Elements",
      "assessment_method": "Apollo sample analysis, orbital gamma-ray spectroscopy (Lunar Prospector)",
      "confidence": "Medium - REE enrichment confirmed in KREEP terrains; economic viability uncertain",
      "estimated_value": "Significant but lower grade than terrestrial deposits",
      "description": "Apollo samples from KREEP-rich regions show elevated REE concentrations. Lunar Prospector gamma-ray data mapped thorium (a KREEP proxy) distribution globally. However, detailed REE distribution and extractability remain poorly characterized."
    },
    {
      "id": "RASS-005",
      "name": "Mars Subsurface Ice Assessment",
      "body": "Mars",
      "resource": "Water ice",
      "assessment_method": "MRO SHARAD radar, Mars Odyssey neutron spectrometer, HiRISE imagery",
      "confidence": "High - ice confirmed at multiple mid-latitude locations within 1-2m of surface",
      "estimated_value": "Essential for human missions; millions of km³ total",
      "description": "MRO discovered extensive subsurface ice at mid-latitudes, with pure ice exposed at eroding scarps. This ice is accessible with simple excavation equipment and represents the key resource for Mars ISRU."
    }
  ],
  "space_resources": [
    {
      "id": "SRES-001",
      "name": "Lunar South Pole Water Ice",
      "resource_type": "Water",
      "location": "Permanently shadowed craters (Cabeus, Shackleton, Haworth, Shoemaker)",
      "estimated_quantity": "Hundreds of millions of tonnes",
      "extraction_method": "Thermal mining / sublimation capture",
      "economic_value": "Critical enabler - worth $10M+ per tonne in orbit as propellant",
      "description": "LCROSS confirmed water ice in Cabeus crater. LRO data suggests extensive ice deposits across south pole PSRs. This is the single most valuable near-term space resource, enabling propellant production, life support, and radiation shielding."
    },
    {
      "id": "SRES-002",
      "name": "Lunar Regolith Oxygen",
      "resource_type": "Oxygen",
      "location": "Lunar surface (global - regolith is 40-45% oxygen by weight)",
      "estimated_quantity": "Effectively unlimited",
      "extraction_method": "Molten regolith electrolysis, hydrogen reduction, carbothermal reduction",
      "economic_value": "$1-5M per tonne delivered to orbit",
      "description": "Lunar regolith contains 40-45% oxygen by weight, bound in oxide minerals. Multiple extraction methods have been demonstrated. Oxygen is the most valuable near-term ISRU product after water, needed for life support and LOX propellant."
    },
    {
      "id": "SRES-003",
      "name": "16 Psyche Metal Deposits",
      "resource_type": "Iron-Nickel-PGM",
      "location": "16 Psyche (main belt, 2.9 AU)",
      "estimated_quantity": "~2×10¹⁹ kg of metal (theoretical)",
      "extraction_method": "Direct mechanical processing; no smelting needed for metallic phase",
      "economic_value": "Theoretical $10 quintillion; practical value depends on delivery cost",
      "description": "If Psyche is indeed an exposed metallic core, it represents the largest known concentration of iron, nickel, and platinum group metals in the solar system. However, the extreme distance and lack of infrastructure make near-term extraction impractical."
    },
    {
      "id": "SRES-004",
      "name": "Ceres Water Deposits",
      "resource_type": "Water",
      "location": "Ceres (main belt, 2.77 AU)",
      "estimated_quantity": "200 million km³ of ice (est.)",
      "extraction_method": "Thermal extraction from subsurface; possible brine pumping",
      "economic_value": "Enabling resource for main belt operations",
      "description": "Ceres may contain more fresh water than Earth. Dawn mission data revealed subsurface brine and ice. As a staging point for outer solar system missions, Ceres water could serve as a propellant depot for deeper space operations."
    },
    {
      "id": "SRES-005",
      "name": "Lunar Helium-3",
      "resource_type": "Helium-3",
      "location": "Lunar surface regolith (global, concentrated in mature mare soils)",
      "estimated_quantity": "~1 million tonnes total",
      "extraction_method": "Solar wind degassing of heated regolith",
      "economic_value": "$3-5 billion per tonne (if fusion reactors developed)",
      "description": "He-3 is implanted in lunar regolith by solar wind. While the total quantity is large, concentrations are extremely low (1-50 ppb). Economic viability depends entirely on the development of practical He-3 fusion reactors, which remains uncertain."
    },
    {
      "id": "SRES-006",
      "name": "Lunar Rare Earth Elements (KREEP)",
      "resource_type": "Rare Earth Elements",
      "location": "Lunar KREEP terrain (Mare Imbrium region, Oceanus Procellarum)",
      "estimated_quantity": "Significant but poorly quantified",
      "extraction_method": "Acid leaching or molten salt electrolysis of KREEP-rich regolith",
      "economic_value": "High if terrestrial supply constrained; REEs worth $100-1000/kg",
      "description": "KREEP (Potassium, Rare Earth Elements, Phosphorus) terrains on the Moon contain elevated REE concentrations. While lower grade than terrestrial deposits, the absence of environmental regulations and co-location with other ISRU activities could make extraction viable."
    },
    {
      "id": "SRES-007",
      "name": "Near-Earth Asteroid Water",
      "resource_type": "Water",
      "location": "C-type near-Earth asteroids (Bennu, Ryugu-type)",
      "estimated_quantity": "5-10% water by mass in hydrated minerals",
      "extraction_method": "Thermal dehydration of phyllosilicates at 300-800°C",
      "economic_value": "Comparable to lunar water if accessible",
      "description": "Carbonaceous asteroids contain water bound in phyllosilicate minerals. OSIRIS-REx and Hayabusa2 confirmed water-bearing minerals. While extraction requires more energy than lunar ice mining, some NEAs are energetically easier to reach than the lunar surface."
    },
    {
      "id": "SRES-008",
      "name": "Martian Water Ice",
      "resource_type": "Water",
      "location": "Mars subsurface (mid-latitudes and poles); exposed at scarps",
      "estimated_quantity": "Millions of km³ at poles; extensive subsurface deposits",
      "extraction_method": "Drilling and sublimation; warm regolith extraction",
      "economic_value": "Essential for human Mars missions",
      "description": "Mars Reconnaissance Orbiter discovered extensive subsurface water ice at mid-latitudes, accessible within 1-2 meters of the surface. This is the critical resource enabling human Mars exploration and eventual settlement."
    }
  ]
};
