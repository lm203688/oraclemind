const DB = {
  "updated": "2026-05-29T02:27:01.440Z",
  "stats": {
    "astrobiology": 6,
    "exoplanets": 12,
    "planetary_science": 5,
    "space_habitats": 6,
    "space_missions": 10,
    "space_telescopes": 5
  },
  "astrobiology": [
    {
      "id": "ASTRO-001",
      "name": "Hydrothermal Vent Origin Theory",
      "type": "Origin of life hypothesis",
      "description": "Life originated at deep-sea hydrothermal vents where chemical gradients provided energy for the first metabolic reactions",
      "significance": "Explains how life could arise without sunlight; relevant to icy moons (Europa, Enceladus) with subsurface vents",
      "evidence": "Alkaline hydrothermal vents (Lost City) produce H₂ and mineral microcompartments similar to cells; vent chemistry is consistent with core metabolic pathways (acetyl-CoA pathway)"
    },
    {
      "id": "ASTRO-002",
      "name": "Panspermia Hypothesis",
      "type": "Life distribution theory",
      "description": "Life (or its building blocks) is distributed throughout the universe by meteorites, comets, and interstellar dust",
      "significance": "If valid, life may be widespread; Earth life could share common origin with life elsewhere",
      "evidence": "Amino acids found in meteorites (Murchison); organic molecules in interstellar clouds; tardigrades survive space exposure; lithopanspermia between Mars-Earth is dynamically feasible"
    },
    {
      "id": "ASTRO-003",
      "name": "Enceladus Plume Biosignature Search",
      "type": "Active investigation",
      "description": "Cassini detected molecular hydrogen, methane, and complex organics in Enceladus's plumes - consistent with but not proof of life",
      "significance": "Enceladus has all ingredients for life: liquid water, organic molecules, energy source, and nutrients. Plume sampling makes it accessible without drilling.",
      "evidence": "H₂ in plumes suggests hydrothermal activity; methane could be biological or geological; Cassini's Cosmic Dust Analyzer found complex macromolecular organics"
    },
    {
      "id": "ASTRO-004",
      "name": "Venus Phosphine Controversy",
      "type": "Potential biosignature detection",
      "description": "2020: Greaves et al. reported phosphine (PH₃) in Venus's atmosphere, a gas with no known abiotic source at detected concentrations",
      "significance": "If confirmed, would strongly suggest life in Venus's cloud layers (50-60 km altitude, where conditions are temperate)",
      "evidence": "JCMT and ALMA detected PH₃ at 20 ppb; subsequent analyses questioned the detection and abiotic sources (volcanism, lightning) were proposed; 2024 reanalysis with JCMT supports original detection but debate continues"
    },
    {
      "id": "ASTRO-005",
      "name": "Mars Perseverance Biosignature Search",
      "type": "Active investigation",
      "description": "Perseverance rover is caching samples from Jezero Crater, a former lake with high biosignature preservation potential",
      "significance": "First systematic search for ancient Martian life; samples will be returned to Earth for definitive analysis via Mars Sample Return",
      "evidence": "Jezero Crater contains carbonate rocks and hydrated minerals that preserve biosignatures on Earth; Perseverance has identified organic molecules in multiple samples"
    },
    {
      "id": "ASTRO-006",
      "name": "Great Filter Theory",
      "type": "Fermi Paradox explanation",
      "description": "Some evolutionary step is extremely improbable, explaining why we see no evidence of advanced civilizations",
      "significance": "If the filter is behind us, life is rare; if ahead, civilizations may be doomed. Astrobiology research helps identify which steps are hard.",
      "evidence": "No confirmed technosignatures despite 60+ years of SETI; Fermi Paradox remains unresolved; Drake Equation parameters increasingly constrained by exoplanet data"
    }
  ],
  "exoplanets": [
    {
      "id": "EXO-001",
      "name": "Proxima Centauri b",
      "type": "Rocky (terrestrial)",
      "distance": "4.24 ly",
      "mass": "1.17 M⊕",
      "radius": "~1.07 R⊕ (estimated)",
      "orbital_period": "11.2 days",
      "habitable": "Possibly - within habitable zone but stellar activity concerns",
      "discovery_method": "Radial velocity (ESO HARPS)",
      "description": "The closest known exoplanet to Earth, orbiting Proxima Centauri (M5.5Ve red dwarf). While within the habitable zone, the planet likely receives 400x more X-ray flux than Earth and may have lost its atmosphere to stellar winds. JWST observations are attempting to detect an atmosphere. A 2022 candidate signal (BLC1) was not confirmed."
    },
    {
      "id": "EXO-002",
      "name": "TRAPPIST-1e",
      "type": "Rocky (terrestrial)",
      "distance": "40.7 ly",
      "mass": "0.692 M⊕",
      "radius": "0.918 R⊕",
      "orbital_period": "6.1 days",
      "habitable": "Best candidate in TRAPPIST-1 system - right density and irradiation for liquid water",
      "discovery_method": "Transit (TRAPPIST, Spitzer)",
      "description": "The most promising habitable candidate in the 7-planet TRAPPIST-1 system. Its density (5.5 g/cm³) suggests a rocky composition similar to Earth. JWST has observed the system extensively; 2024 data suggests TRAPPIST-1b and c lack thick atmospheres, but TRAPPIST-1e remains the best hope. The system is a prime target for atmospheric characterization."
    },
    {
      "id": "EXO-003",
      "name": "Kepler-442b",
      "type": "Rocky (super-Earth)",
      "distance": "1,206 ly",
      "mass": "~2.3 M⊕ (estimated)",
      "radius": "1.34 R⊕",
      "orbital_period": "112.3 days",
      "habitable": "Yes - highest Earth Similarity Index (0.836) of any confirmed exoplanet",
      "discovery_method": "Transit (Kepler)",
      "description": "One of the most Earth-like exoplanets discovered, with an ESI of 0.836. It receives ~70% of Earth's insolation from its K-type host star, placing it comfortably in the habitable zone. The K-type star is more stable and longer-lived than the Sun, potentially giving life more time to evolve. However, its distance makes atmospheric characterization extremely difficult."
    },
    {
      "id": "EXO-004",
      "name": "GJ 1214 b",
      "type": "Sub-Neptune / Water world",
      "distance": "48 ly",
      "mass": "6.55 M⊕",
      "radius": "2.74 R⊕",
      "orbital_period": "1.58 days",
      "habitable": "No - too hot; but scientifically important as archetype of most common planet type",
      "discovery_method": "Transit (MEarth Project)",
      "description": "The most studied sub-Neptune exoplanet and archetype for the most common type of planet in the galaxy. JWST (2023) revealed a reflective, flat spectrum suggesting either a hazy atmosphere or a water world with high-altitude clouds. This result has major implications for understanding the most abundant planet type in the Milky Way."
    },
    {
      "id": "EXO-005",
      "name": "55 Cancri e (Janssen)",
      "type": "Super-Earth (lava world)",
      "distance": "41 ly",
      "mass": "8.08 M⊕",
      "radius": "1.875 R⊕",
      "orbital_period": "0.74 days",
      "habitable": "No - surface temperature ~2,500°C; lava ocean world",
      "discovery_method": "Transit (MOST, Spitzer) + Radial velocity",
      "description": "A super-hot super-Earth with a possible carbon-rich interior (some models suggest diamond core). JWST (2024) detected a volatile-rich atmosphere with CO₂ and possibly SiO gas, suggesting the planet is outgassing from a magma ocean. This is the first detection of a secondary atmosphere on a rocky exoplanet, reshaping our understanding of rocky planet evolution."
    },
    {
      "id": "EXO-006",
      "name": "K2-18 b",
      "type": "Sub-Neptune / Hycean candidate",
      "distance": "124 ly",
      "mass": "8.63 M⊕",
      "radius": "2.61 R⊕",
      "orbital_period": "32.9 days",
      "habitable": "Potentially - 'hycean' world candidate with possible ocean surface under H-rich atmosphere",
      "discovery_method": "Transit (K2) + Radial velocity",
      "description": "JWST (2023) detected methane and CO₂ in K2-18 b's atmosphere, with a possible dimethyl sulfide (DMS) signal - a molecule on Earth only produced by life. This sparked intense debate. If confirmed, K2-18 b could be a 'hycean' world (habitable ocean under hydrogen atmosphere). However, the DMS detection remains controversial and needs further observations."
    },
    {
      "id": "EXO-007",
      "name": "TOI-700 d",
      "type": "Rocky (terrestrial)",
      "distance": "101 ly",
      "mass": "~1.72 M⊕ (estimated)",
      "radius": "1.19 R⊕",
      "orbital_period": "37.4 days",
      "habitable": "Yes - within habitable zone of quiet M-dwarf star",
      "discovery_method": "Transit (TESS)",
      "description": "The first Earth-size habitable zone planet discovered by TESS. Its host star is unusually quiet for an M-dwarf, reducing the risk of atmospheric stripping. Climate models suggest TOI-700 d could maintain liquid water under various atmospheric scenarios. It's a prime target for future JWST atmospheric characterization."
    },
    {
      "id": "EXO-008",
      "name": "WASP-39 b",
      "type": "Hot Saturn (gas giant)",
      "distance": "700 ly",
      "mass": "0.28 MJ",
      "radius": "1.27 RJ",
      "orbital_period": "4.14 days",
      "habitable": "No - hot gas giant; but scientifically critical",
      "discovery_method": "Transit (SuperWASP)",
      "description": "JWST's first exoplanet atmosphere target, demonstrating unprecedented chemical characterization. JWST detected H₂O, CO₂, CO, SO₂, Na, and K in its atmosphere. The detection of SO₂ was groundbreaking - it's produced by photochemistry from the host star's UV, the first detection of a photochemical product on an exoplanet. WASP-39 b proved JWST can do detailed exoplanet chemistry."
    },
    {
      "id": "EXO-009",
      "name": "LHS 1140 b",
      "type": "Rocky (super-Earth)",
      "distance": "49 ly",
      "mass": "6.98 M⊕",
      "radius": "1.73 R⊕",
      "orbital_period": "24.7 days",
      "habitable": "Yes - within habitable zone; dense enough to retain atmosphere",
      "discovery_method": "Transit (MEarth) + Radial velocity",
      "description": "A dense super-Earth (density ~9 g/cm³, higher than Earth) in the habitable zone. Its high density suggests an iron-rich or water-rich composition. 2024 JWST data hints at a nitrogen-rich atmosphere, which would be the first detection of a secondary atmosphere on a habitable zone rocky planet. Follow-up observations are ongoing."
    },
    {
      "id": "EXO-010",
      "name": "HD 209458 b (Osiris)",
      "type": "Hot Jupiter",
      "distance": "159 ly",
      "mass": "0.69 MJ",
      "radius": "1.38 RJ",
      "orbital_period": "3.52 days",
      "habitable": "No - hot gas giant",
      "discovery_method": "Transit (first transiting exoplanet, 1999)",
      "description": "The first exoplanet observed to transit its star (1999), and the first to have its atmosphere detected (2001). Hubble detected sodium, hydrogen, carbon, and oxygen in its atmosphere. It's losing atmosphere at ~100,000 tonnes/year, creating a comet-like tail. Osiris established the technique of transmission spectroscopy that JWST now uses on thousands of planets."
    },
    {
      "id": "EXO-011",
      "name": "Kepler-22b",
      "type": "Super-Earth / Mini-Neptune (uncertain)",
      "distance": "620 ly",
      "mass": "~36 M⊕ (upper limit)",
      "radius": "2.4 R⊕",
      "orbital_period": "289.9 days",
      "habitable": "Possibly - first Kepler planet in habitable zone",
      "discovery_method": "Transit (Kepler)",
      "description": "The first exoplanet confirmed in the habitable zone by the Kepler mission (2011). Its composition is uncertain - it could be a rocky super-Earth with a thick atmosphere, or a mini-Neptune with no solid surface. Its 290-day orbit around a Sun-like star makes it one of the most Earth-like orbital configurations known."
    },
    {
      "id": "EXO-012",
      "name": "Ross 128 b",
      "type": "Rocky (terrestrial)",
      "distance": "11 ly",
      "mass": "~1.4 M⊕ (minimum)",
      "radius": "~1.5 R⊕ (estimated)",
      "orbital_period": "9.9 days",
      "habitable": "Possibly - temperate; host star is very quiet for a red dwarf",
      "discovery_method": "Radial velocity (HARPS)",
      "description": "One of the closest temperate rocky exoplanets, orbiting a particularly quiet M-dwarf (few flares). This means Ross 128 b may have retained its atmosphere despite its proximity to its star. At 11 light-years, it's the second-closest known potentially habitable planet after Proxima b, but with a much more benign stellar environment."
    }
  ],
  "main": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:40:02.828Z",
    "description": "地外科学实体库",
    "entities": []
  },
  "missions": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:44:16.573Z",
    "description": "探测任务库",
    "entities": [
      {
        "id": "EM-001",
        "name": "JWST",
        "agency": "NASA/ESA",
        "type": "空间望远镜",
        "status": "运行中",
        "targets": [
          "系外行星大气",
          "早期宇宙"
        ]
      },
      {
        "id": "EM-002",
        "name": "Europa Clipper",
        "agency": "NASA",
        "type": "轨道器",
        "status": "飞行中",
        "targets": [
          "木卫二海洋"
        ]
      },
      {
        "id": "EM-003",
        "name": "Dragonfly",
        "agency": "NASA",
        "type": "旋翼飞行器",
        "status": "开发中",
        "targets": [
          "土卫六泰坦"
        ]
      },
      {
        "id": "EM-004",
        "name": "PLATO",
        "agency": "ESA",
        "type": "空间望远镜",
        "status": "开发中",
        "targets": [
          "宜居带行星"
        ]
      },
      {
        "id": "EM-005",
        "name": "天问系列",
        "agency": "CNSA",
        "type": "多任务",
        "status": "进行中",
        "targets": [
          "火星",
          "小行星",
          "木星系"
        ]
      }
    ]
  },
  "planetary_science": [
    {
      "id": "PLSC-001",
      "name": "Enceladus Ocean Chemistry",
      "body": "Enceladus (Saturn moon)",
      "type": "Ocean world chemistry",
      "description": "Cassini measured pH ~9 (alkaline), dissolved H₂, CH₄, and complex organics in Enceladus's subsurface ocean",
      "findings": "Molecular hydrogen suggests ongoing hydrothermal activity; methane could be biological; organics up to 200+ amu detected in plume ice grains"
    },
    {
      "id": "PLSC-002",
      "name": "Mars Jezero Carbonates",
      "body": "Mars",
      "type": "Sedimentary geology",
      "description": "Perseverance discovered carbonate-bearing rocks in Jezero Crater's marginal units, ideal for preserving biosignatures",
      "findings": "Carbonate rocks form in liquid water and can entomb microbial structures for billions of years; Jezero samples contain organic molecules"
    },
    {
      "id": "PLSC-003",
      "name": "Titan Methane Cycle",
      "body": "Titan (Saturn moon)",
      "type": "Atmospheric/surface chemistry",
      "description": "Titan has a complete methane cycle analogous to Earth's water cycle: rain, rivers, lakes, evaporation",
      "findings": "Methane-ethane lakes at poles; tholins (complex organics) produced in upper atmosphere; prebiotic chemistry at liquid water-organic interfaces during impacts"
    },
    {
      "id": "PLSC-004",
      "name": "Europa Ice Shell Structure",
      "body": "Europa (Jupiter moon)",
      "type": "Ice shell / ocean",
      "description": "Europa's ice shell is ~15-25 km thick, overlaying a ~60-150 km deep liquid water ocean in contact with a rocky seafloor",
      "findings": "Chaos terrain suggests liquid water pockets within the ice; plume evidence from Hubble; REASON radar on Europa Clipper will map ice structure in detail"
    },
    {
      "id": "PLSC-005",
      "name": "Venus Cloud Layer Habitability",
      "body": "Venus",
      "type": "Atmospheric habitability",
      "description": "Venus's cloud layer at 50-60 km altitude has temperate conditions (0-50°C, 1 atm pressure) and concentrated sulfuric acid droplets",
      "findings": "Phosphine detection (debated); possible ammonia; some models suggest microbial life could survive in cloud droplets; proposed Venus life missions (VLF, Rocket Lab)"
    }
  ],
  "space_habitats": [
    {
      "id": "SHAB-001",
      "name": "ISS (International Space Station)",
      "type": "Orbital habitat",
      "location": "LEO (400 km altitude)",
      "capacity": "6 crew continuous",
      "description": "Continuously inhabited since 2000. Demonstrates long-duration life support, human health in microgravity, and international cooperation. ISS is the baseline for all space habitat design.",
      "status": "Operational; planned deorbit 2030-2031"
    },
    {
      "id": "SHAB-002",
      "name": "Tiangong Space Station",
      "type": "Orbital habitat",
      "location": "LEO (340-450 km)",
      "capacity": "3-6 crew",
      "description": "China's modular space station, completed in 2022. Features the Wentian and Mengtian lab modules. Demonstrates independent long-duration spaceflight capability and hosts international experiments.",
      "status": "Operational; planned 10+ year lifetime"
    },
    {
      "id": "SHAB-003",
      "name": "Lunar Gateway",
      "type": "Cislunar orbital habitat",
      "location": "Near-rectilinear halo orbit (NRHO) around Moon",
      "capacity": "4 crew (visiting)",
      "description": "NASA-led international space station in lunar orbit, serving as a staging point for Artemis lunar landings and future Mars missions. Modules: PPE, HALO, I-Hab, Esprit.",
      "status": "Under development; first modules launching 2025-2026"
    },
    {
      "id": "SHAB-004",
      "name": "Artemis Base Camp",
      "type": "Lunar surface habitat",
      "location": "Lunar South Pole (Shackleton crater rim area)",
      "capacity": "4 crew (initially)",
      "description": "NASA's planned permanent lunar base, starting with pressurized rovers and evolving to a fixed habitat. Leverages local water ice for life support and propellant. Foundation for Mars mission architecture.",
      "status": "Planning; first habitation targeted for late 2020s"
    },
    {
      "id": "SHAB-005",
      "name": "Mars Base Camp (Lockheed Martin concept)",
      "type": "Mars orbital habitat",
      "location": "Mars orbit",
      "capacity": "6 crew",
      "description": "A crewed Mars orbital station from which astronauts would remotely operate surface rovers and deploy landers. Avoids the complexity of landing humans on Mars initially while enabling detailed exploration.",
      "status": "Concept; not yet funded"
    },
    {
      "id": "SHAB-006",
      "name": "O'Neill Cylinder",
      "type": "Free-space settlement concept",
      "location": "Earth-Moon L5 (proposed)",
      "capacity": "Millions",
      "description": "Gerald K. O'Neill's 1976 concept for a rotating cylinder 32 km long and 8 km in diameter, providing Earth-normal gravity through rotation. Would be built from lunar and asteroid materials. The ultimate vision for space settlement.",
      "status": "Theoretical concept; far future"
    }
  ],
  "space_missions": [
    {
      "id": "SMIS-001",
      "name": "James Webb Space Telescope (JWST)",
      "agency": "NASA / ESA / CSA",
      "type": "Infrared space telescope",
      "target": "Exoplanet atmospheres, early universe, solar system",
      "launch_year": "2021",
      "status": "Operational - transforming exoplanet science",
      "description": "JWST is revolutionizing exoplanet characterization through transmission spectroscopy. It has detected CO₂, water, SO₂, and possible biosignatures in exoplanet atmospheres. Its NIRSpec and MIRI instruments can characterize atmospheres of planets down to Earth size. JWST's exoplanet observations are the most impactful in the field since Kepler."
    },
    {
      "id": "SMIS-002",
      "name": "PLATO (PLAnetary Transits and Oscillations of stars)",
      "agency": "ESA",
      "type": "Transit survey telescope",
      "target": "Habitable zone Earth-size planets around Sun-like stars",
      "launch_year": "2026",
      "status": "On track for 2026 launch",
      "description": "ESA's PLATO will survey ~1 million stars for transiting planets, with a specific focus on finding Earth-size planets in the habitable zones of Sun-like stars (G and K type). Unlike TESS which focuses on bright nearby M-dwarfs, PLATO targets Sun-like stars. It will also perform asteroseismology to precisely measure host star masses and radii, improving planet parameter accuracy."
    },
    {
      "id": "SMIS-003",
      "name": "Nancy Grace Roman Space Telescope",
      "agency": "NASA",
      "type": "Wide-field infrared survey + coronagraph",
      "target": "Direct imaging of exoplanets; dark energy; galaxy surveys",
      "launch_year": "2027",
      "status": "Under development; coronagraph technology demonstrator",
      "description": "Roman's coronagraph will be the first space-based high-contrast imager, capable of directly imaging Jupiter-size exoplanets and possibly super-Earths. Its wide-field instrument will also discover thousands of exoplanets via microlensing, including free-floating planets. Roman's coronagraph is a technology precursor for the Habitable Worlds Observatory."
    },
    {
      "id": "SMIS-004",
      "name": "ARIEL (Atmospheric Remote-sensing Infrared Exoplanet Large-survey)",
      "agency": "ESA",
      "type": "Dedicated exoplanet atmosphere survey",
      "target": "1,000+ exoplanet atmospheres (statistical survey)",
      "launch_year": "2029",
      "status": "Under development; Phase C/D",
      "description": "ARIEL will be the first space mission dedicated entirely to exoplanet atmosphere characterization. It will survey ~1,000 exoplanets to build a statistical picture of atmospheric chemistry across planet types, temperatures, and stellar environments. This will reveal how planetary atmospheres form and evolve, and identify which planets have unusual compositions worth detailed follow-up."
    },
    {
      "id": "SMIS-005",
      "name": "Habitable Worlds Observatory (HWO)",
      "agency": "NASA",
      "type": "Direct imaging telescope (6m class, UV/Optical/IR)",
      "target": "Direct imaging and spectroscopy of ~25 Earth-like habitable zone planets",
      "launch_year": "~2040s",
      "status": "Early planning; 2020 Astrophysics Decadal Survey top recommendation",
      "description": "The ultimate exoplanet mission - designed to directly image Earth-size planets in the habitable zones of Sun-like stars and search for biosignatures in their atmospheres. Requires 10⁻¹⁰ contrast ratio (seeing a firefly next to a lighthouse). Technology development is underway for ultra-stable optics, coronagraphs, and starshades. This is the highest priority large mission of the 2020 Decadal Survey."
    },
    {
      "id": "SMIS-006",
      "name": "TESS (Transiting Exoplanet Survey Satellite)",
      "agency": "NASA",
      "type": "All-sky transit survey",
      "target": "Nearby bright stars (planet discovery for follow-up characterization)",
      "launch_year": "2018",
      "status": "Operational; extended mission ongoing; 400+ confirmed planets, 7,000+ candidates",
      "description": "TESS surveys the entire sky for transiting planets around nearby bright stars, providing the best targets for atmospheric characterization by JWST and future missions. It has discovered TOI-700 d (first habitable zone Earth-size from TESS), LHS 3844 b (bare rock), and many sub-Neptunes. Its extended mission is discovering planets around previously unsurveyed stars."
    },
    {
      "id": "SMIS-007",
      "name": "CHEOPS (CHaracterising ExOPlanet Satellite)",
      "agency": "ESA (Switzerland-led)",
      "type": "Follow-up photometry",
      "target": "Precise radius measurements of known exoplanets",
      "launch_year": "2019",
      "status": "Operational; improving density measurements for hundreds of planets",
      "description": "CHEOPS provides ultra-precise transit photometry for known exoplanets to measure their radii precisely. Combined with radial velocity mass measurements, this yields bulk densities that reveal whether planets are rocky, water-rich, or gas-dominated. CHEOPS has discovered new planets in known systems and measured densities for dozens of sub-Neptunes."
    },
    {
      "id": "SMIS-008",
      "name": "Breakthrough Listen",
      "agency": "Breakthrough Initiatives (Yuri Milner)",
      "type": "SETI search - radio and optical",
      "target": "1 million nearby stars + 100 galaxies for technosignatures",
      "launch_year": "2016",
      "status": "Ongoing; most comprehensive SETI search in history; 1+ PB of data collected",
      "description": "The most comprehensive search for extraterrestrial intelligence ever conducted. Using the Green Bank Telescope, Parkes, MeerKAT, and automated pipelines, Breakthrough Listen surveys 1 million nearby stars and 100 galaxies across radio and optical wavelengths. It has found no confirmed technosignatures but has detected several 'signals of interest' (including BLC1 from Proxima Centauri, later attributed to Earth-based interference)."
    },
    {
      "id": "SMIS-009",
      "name": "Europa Clipper",
      "agency": "NASA",
      "type": "Planetary orbiter (ice-penetrating radar, ocean detection)",
      "target": "Jupiter's moon Europa - subsurface ocean and habitability",
      "launch_year": "2024",
      "status": "Launched Oct 2024; Jupiter arrival 2030",
      "description": "Europa Clipper will determine whether Europa's subsurface ocean could support life. It carries 9 instruments including ice-penetrating radar (REASON) to map the ice shell and detect water, a magnetometer to measure ocean properties, and mass spectrometers to study surface chemistry. Europa is considered one of the most promising abodes for life in our solar system."
    },
    {
      "id": "SMIS-010",
      "name": "Dragonfly (Titan rotorcraft)",
      "agency": "NASA",
      "type": "Rotorcraft lander (aerial exploration)",
      "target": "Saturn's moon Titan - prebiotic chemistry and habitability",
      "launch_year": "2028",
      "status": "Under development; launch 2028, arrival 2034",
      "description": "A nuclear-powered octocopter that will fly across Titan's surface, landing at multiple sites to study prebiotic chemistry. Titan has a thick nitrogen atmosphere, hydrocarbon lakes, and complex organic chemistry that may resemble early Earth. Dragonfly will search for chemical steps that could lead to life, making it the first mission to explore an ocean world's surface."
    }
  ],
  "space_telescopes": [
    {
      "id": "STEL-001",
      "name": "Hubble Space Telescope",
      "type": "Optical/UV/Near-IR",
      "wavelength": "115 nm - 2.5 μm",
      "launch_year": "1990",
      "status": "Operational (extended; gyroscope issues)",
      "description": "The most productive astronomical observatory in history. Hubble has made critical exoplanet contributions: first atmospheric detection (HD 209458 b, 2001), first visible-light direct image (Fomalhaut b), and transit spectroscopy of dozens of planets. Its UV capability remains unique and complementary to JWST's infrared focus."
    },
    {
      "id": "STEL-002",
      "name": "JWST",
      "type": "Infrared",
      "wavelength": "0.6 - 28.3 μm",
      "launch_year": "2021",
      "status": "Operational - exceeding expectations",
      "description": "The most powerful space telescope ever built. JWST's infrared capabilities enable unprecedented exoplanet atmosphere characterization through transmission spectroscopy, emission spectroscopy, and direct imaging. Key results: CO₂ on WASP-39 b, possible DMS on K2-18 b, atmosphere of 55 Cancri e, and direct imaging of HIP 65426 b."
    },
    {
      "id": "STEL-003",
      "name": "Spitzer Space Telescope",
      "type": "Infrared",
      "wavelength": "3.6 - 160 μm",
      "launch_year": "2003 (decommissioned 2020)",
      "status": "Decommissioned",
      "description": "Spitzer made groundbreaking exoplanet contributions: first detection of light from an exoplanet (HD 209458 b, 2005), first temperature map of an exoplanet (HD 189733 b), and the discovery of the TRAPPIST-1 system's 7 planets through 1,000+ hours of monitoring. Its warm mission (after coolant depletion) was still productive for exoplanet transit observations."
    },
    {
      "id": "STEL-004",
      "name": "Chandra X-ray Observatory",
      "type": "X-ray",
      "wavelength": "0.1 - 10 keV",
      "launch_year": "1999",
      "status": "Operational (under budget threat)",
      "description": "Chandra studies X-ray emission from exoplanet host stars, revealing the high-energy radiation environment that affects planetary atmospheres and habitability. It has measured X-ray flares from TRAPPIST-1 and other M-dwarfs, quantifying the atmospheric stripping risk for habitable zone planets."
    },
    {
      "id": "STEL-005",
      "name": "ALMA (Atacama Large Millimeter/submillimeter Array)",
      "type": "Radio/mm/submm interferometer",
      "wavelength": "0.3 - 9.6 mm",
      "launch_year": "2011 (full operations)",
      "status": "Operational",
      "description": "ALMA studies planet-forming disks around young stars, revealing the birthplaces of exoplanets. It has imaged gaps, rings, and spirals in protoplanetary disks where planets are forming. ALMA also detected phosphine in Venus's atmosphere (later debated) and can study exoplanet atmospheres at mm wavelengths."
    }
  ]
};
