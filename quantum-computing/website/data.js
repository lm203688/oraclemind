const DB = {
  "updated": "2026-05-29T02:27:01.438Z",
  "stats": {
    "algorithms": 7,
    "processors": 8
  },
  "algorithms": [
    {
      "id": "QALG-001",
      "name": "Shor's Algorithm",
      "type": "Number theory / Cryptography",
      "complexity": "O((log N)³) vs classical O(exp((log N)^(1/3)))",
      "application": "Integer factorization - breaks RSA, ECC encryption",
      "description": "Shor's algorithm (1994) can factor large integers exponentially faster than any known classical algorithm. This threatens RSA-2048 and ECC, the backbone of internet security. Requires ~4,000 logical qubits (millions of physical qubits with error correction). NIST has standardized post-quantum cryptography (CRYSTALS-Kyber, CRYSTALS-Dilithium) in response."
    },
    {
      "id": "QALG-002",
      "name": "Grover's Algorithm",
      "type": "Search / Optimization",
      "complexity": "O(√N) vs classical O(N)",
      "application": "Unstructured search, cryptographic key search, database search",
      "description": "Grover's algorithm (1996) provides quadratic speedup for unstructured search problems. While less dramatic than Shor's exponential speedup, it's more broadly applicable. For a 256-bit key, Grover reduces effective security to 128 bits. This motivates AES-256 as the post-quantum symmetric encryption standard."
    },
    {
      "id": "QALG-003",
      "name": "VQE (Variational Quantum Eigensolver)",
      "type": "Chemistry / Materials",
      "complexity": "Heuristic - no proven speedup; practical advantage on NISQ devices",
      "application": "Molecular ground state energy, drug discovery, catalyst design, materials science",
      "description": "VQE is the most widely used NISQ-era quantum algorithm. It uses a hybrid quantum-classical loop: a quantum circuit prepares a trial state, measures the energy, and a classical optimizer updates parameters. IBM, Google, and others have used VQE to simulate small molecules (H₂, LiH, BeH₂). The key question is whether VQE scales to chemically relevant systems."
    },
    {
      "id": "QALG-004",
      "name": "QAOA (Quantum Approximate Optimization Algorithm)",
      "type": "Combinatorial Optimization",
      "complexity": "Heuristic - no proven speedup; competitive with classical for some problems",
      "application": "Max-Cut, portfolio optimization, scheduling, logistics, vehicle routing",
      "description": "QAOA (Farhi et al., 2014) is a hybrid quantum-classical algorithm for combinatorial optimization. It alternates between problem and mixer Hamiltonians, with parameters optimized classically. At p→∞, QAOA converges to the optimal solution. In practice, low-depth QAOA (p=1-10) is used on NISQ devices. Whether QAOA provides practical advantage over classical heuristics remains open."
    },
    {
      "id": "QALG-005",
      "name": "Quantum Phase Estimation (QPE)",
      "type": "Algebraic / Eigenvalue",
      "complexity": "O(poly(n)) - exponential speedup for eigenvalue problems",
      "application": "Chemistry (exact energy levels), factoring (part of Shor's), quantum simulation",
      "description": "QPE is a fundamental quantum subroutine that estimates the eigenvalue (phase) of a unitary operator. It's the core of Shor's algorithm and the most promising approach for exact quantum chemistry simulation. QPE requires fault-tolerant quantum computers (not NISQ), but when available, it can simulate molecular energies with exponential speedup over classical methods."
    },
    {
      "id": "QALG-006",
      "name": "Quantum Machine Learning (QML)",
      "type": "Machine Learning",
      "complexity": "Varies - most QML algorithms lack proven speedup",
      "application": "Classification, generative models, anomaly detection, reinforcement learning",
      "description": "QML explores whether quantum computers can accelerate machine learning tasks. Approaches include quantum kernel methods, variational quantum circuits as neural network layers, and quantum Boltzmann machines. While theoretical speedups exist for specific problems (HHL for linear systems), practical QML advantage remains unproven. Hybrid quantum-classical ML is the current focus."
    },
    {
      "id": "QALG-007",
      "name": "Quantum Error Correction (Surface Code)",
      "type": "Error Correction",
      "complexity": "O(d²) physical qubits per logical qubit (d = code distance)",
      "application": "Enabling fault-tolerant quantum computation",
      "description": "The surface code is the leading quantum error correction scheme. It arranges physical qubits on a 2D lattice where each logical qubit requires d² physical qubits for code distance d. Google's Willow demonstrated below-threshold error correction with the surface code in 2024. At ~1,000 physical qubits per logical qubit, a million-qubit machine could support ~1,000 logical qubits."
    }
  ],
  "main": {
    "version": "1.0.0",
    "last_updated": "2026-05-26T04:40:02.687Z",
    "description": "量子计算实体库",
    "entities": []
  },
  "processors": [
    {
      "id": "QPU-001",
      "name": "IBM Heron",
      "manufacturer": "IBM",
      "qubits": "133 (single chip); modular architecture supports multi-chip scaling",
      "technology": "Superconducting transmon",
      "gate_fidelity": "99.5% 2-qubit gate; 99.9% single-qubit",
      "status": "Operational (2023); deployed via IBM Quantum Network",
      "description": "IBM's flagship quantum processor featuring a modular architecture with classical communication between chips. Heron achieves 99.5% two-qubit gate fidelity, a significant improvement over the previous Eagle processor. IBM plans to connect multiple Heron chips to build systems with 100,000+ qubits by 2033 via the 'Starling' and 'Blue Jay' systems."
    },
    {
      "id": "QPU-002",
      "name": "Google Willow",
      "manufacturer": "Google Quantum AI",
      "qubits": "105",
      "technology": "Superconducting transmon",
      "gate_fidelity": "99.7% 2-qubit gate; below quantum error correction threshold",
      "status": "Operational (Dec 2024); demonstrated below-threshold error correction",
      "description": "Willow achieved a historic milestone: quantum error correction below the critical threshold, where adding more qubits reduces errors rather than increasing them. This is the first demonstration of exponential error suppression. Willow also completed a random circuit sampling benchmark in 5 minutes that would take the world's fastest supercomputer 10 septillion years."
    },
    {
      "id": "QPU-003",
      "name": "Quantinuum H2",
      "manufacturer": "Quantinuum",
      "qubits": "32 (trapped ions); all-to-all connectivity",
      "technology": "Trapped ion (ytterbium-171)",
      "gate_fidelity": "99.8% 2-qubit gate; 99.99% single-qubit",
      "status": "Operational (2023); highest-fidelity quantum computer",
      "description": "Quantinuum's H2 holds the record for highest gate fidelities of any quantum computer. Trapped ions offer all-to-all connectivity (any qubit can directly interact with any other), eliminating the need for SWAP gates. The H2 has demonstrated 20+ logical qubits with error correction. Quantinuum is building the Helios system with 96 qubits."
    },
    {
      "id": "QPU-004",
      "name": "Atom Computing (Now NVIDIA Partner)",
      "manufacturer": "Atom Computing",
      "qubits": "1,225",
      "technology": "Neutral atom (strontium-87); optical tweezer array",
      "gate_fidelity": "99.5% 2-qubit gate; 99.9% single-qubit",
      "status": "Operational (2024); largest qubit count for gate-based system",
      "description": "Atom Computing built the first gate-based quantum computer exceeding 1,000 qubits using neutral atoms trapped in optical tweezer arrays. Strontium-87 atoms are arranged in a 2D grid, with Rydberg interactions enabling entangling gates. The system offers native all-to-all connectivity through atom rearrangement. NVIDIA partnership announced for hybrid quantum-classical computing."
    },
    {
      "id": "QPU-005",
      "name": "Microsoft Majorana 1",
      "manufacturer": "Microsoft Quantum",
      "qubits": "8 (topological); architecture supports million-qubit scaling",
      "technology": "Topological qubit (Majorana zero modes in indium arsenide/aluminum nanowires)",
      "gate_fidelity": "Not yet benchmarked; topological protection inherently reduces errors",
      "status": "Announced Feb 2025; first topological qubit demonstrated",
      "description": "Microsoft announced the world's first topological qubit in February 2025, based on Majorana zero modes in semiconductor-superconductor nanowires. Topological qubits store information non-locally, making them inherently resistant to local noise. If scaled, this approach could dramatically reduce the overhead needed for error correction. Microsoft aims for a million-qubit topological quantum computer."
    },
    {
      "id": "QPU-006",
      "name": "IonQ Forte Enterprise",
      "manufacturer": "IonQ",
      "qubits": "36 (algorithmic qubits)",
      "technology": "Trapped ion (ytterbium-171)",
      "gate_fidelity": "99.6% 2-qubit gate",
      "status": "Operational (2024); available on major cloud platforms",
      "description": "IonQ's Forte Enterprise is the first rack-mounted trapped-ion quantum computer designed for on-premises deployment at enterprise data centers. IonQ uses 'algorithmic qubits' metric (accounting for error correction overhead), claiming 36 AQ = roughly equivalent to 70+ physical qubits. Available on AWS Braket, Azure Quantum, and Google Cloud."
    },
    {
      "id": "QPU-007",
      "name": "QuEra Aquila / Gemini",
      "manufacturer": "QuEra Computing",
      "qubits": "256 (neutral atom); Gemini: 2 logical qubits",
      "technology": "Neutral atom (rubidium-87); programmable quantum simulator",
      "gate_fidelity": "99.5% 2-qubit gate; analog mode with programmable interactions",
      "status": "Operational on AWS Braket; Gemini logical qubit system announced 2024",
      "description": "QuEra operates the largest publicly accessible quantum computer (256-qubit Aquila on AWS Braket). Uses neutral atoms in optical tweezers with programmable interactions. In 2024, QuEra demonstrated 2 logical qubits with error correction and announced Gemini, a hybrid analog-digital system. Backed by Google, Amazon, and SoftBank."
    },
    {
      "id": "QPU-008",
      "name": "PsiQuantum Omega",
      "manufacturer": "PsiQuantum",
      "qubits": "Targeting 1 million+ (photonic); not yet disclosed",
      "technology": "Photonic (silicon photonics); fusion-based measurement",
      "gate_fidelity": "N/A - measurement-based quantum computing",
      "status": "Building utility-scale quantum computer in Brisbane, Australia; $940M investment",
      "description": "PsiQuantum is building a million-qubit photonic quantum computer using silicon photonics manufactured in existing semiconductor fabs. Their approach uses fusion-based measurement (no need for deterministic gates). Advantages: room-temperature operation, compatibility with semiconductor manufacturing, and natural networking. Queensland government invested $940M for a Brisbane facility."
    }
  ]
};
