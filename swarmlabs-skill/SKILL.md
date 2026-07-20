# SwarmLabs Molecular Property Prediction Skill

## Description
SwarmLabs provides AI-powered molecular property prediction based on 166,000+ real molecules (QM9 DFT + ChEMBL + Tox21 + ToxCast + NIST). One API call returns quantum chemistry, bioactivity, toxicity, and thermodynamic properties in seconds.

## Capabilities

### Molecular Property Prediction
- **Quantum Chemistry**: Dipole moment, HOMO, LUMO, band gap, polarizability, zero-point energy (trained on QM9 130K molecules)
- **Bio/Chemical**: logD (lipophilicity), logS (solubility), hydration free energy, BACE pIC50 (trained on 18K molecules)
- **Toxicity**: 12 Tox21 binary classifiers + 15 ToxCast regression models (617 endpoints)
- **Thermodynamics**: Boiling point, heat of formation (trained on NIST experimental data)
- **Drug Likeness**: Lipinski Rule of 5 assessment

### Full Workflow Prediction
One API call (`/api/v1/workflow/full_predict`) returns all properties simultaneously:
- 6 quantum chemistry properties
- 5 bio/chemical properties  
- 12+5 toxicity predictions
- Lipinski assessment
- Citation generation (BibTeX/APA)

### Batch Prediction
Submit up to 100 molecules at once (`/api/v1/workflow/batch_predict`)

### GNN + RF Dual Model
Graph Neural Network (3D molecular structure) + RandomForest comparison for quantum chemistry

## Usage

### Register API Key
```bash
curl -X POST https://swarmlabs.tools/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@lab.edu", "name": "Your Lab"}'
```

### Predict Molecular Properties
```bash
# Full workflow (all properties in one call)
curl -H "Authorization: Bearer gtk_xxx" \
  "https://swarmlabs.tools/api/v1/workflow/full_predict?smiles=CCO"

# Quantum chemistry only
curl -H "Authorization: Bearer gtk_xxx" \
  "https://swarmlabs.tools/api/v1/qm9/predict?n_C=2&n_H=6&n_O=1"

# Toxicity prediction
curl -H "Authorization: Bearer gtk_xxx" \
  "https://swarmlabs.tools/api/v1/bio/predict?smiles=CC(=O)Oc1ccccc1C(=O)O"
```

### Response Example
```json
{
  "status": "success",
  "input": {"smiles": "CCO", "molecular_weight": 46.07},
  "quantum_chemistry": {
    "dipole": {"label": "Dipole Moment (Debye)", "value": 2.0464},
    "homo": {"label": "HOMO (eV)", "value": -7.1996},
    "gap": {"label": "Band Gap (eV)", "value": 9.4814}
  },
  "bio_chemistry": {
    "logD": {"label": "Lipophilicity logD", "value": 0.008},
    "logS": {"label": "Solubility logS", "value": 0.999},
    "tox21": {"toxic_count": 0, "details": {"...": "12 endpoints"}}
  },
  "drug_likeness": {"lipinski_violations": 0, "assessment": "Pass"},
  "summary": {"total_skills_called": 5, "elapsed_seconds": 0.58}
}
```

## Use Cases
1. **Drug Discovery**: Screen lead compounds for activity + toxicity in minutes
2. **Materials Design**: Predict electronic properties for optoelectronic materials
3. **Environmental Risk**: Assess chemical toxicity across 27 endpoints
4. **Academic Research**: Get DFT-level approximations without running DFT
5. **Chemical Education**: Visualize structure-property relationships

## API Tiers
- **Free**: 30 calls/hour (register at /api/v1/register)
- **Pro**: $19/month, 1K calls/hour + GNN + SHAP
- **Team**: $99/month, 10K calls/hour + 5 seats
- **Enterprise**: $499/month, unlimited

## Data Sources
- QM9: 130,831 molecules with DFT calculations (B3LYP/6-31G(2df,p))
- ChEMBL: 4,200 molecules with experimental logD
- Tox21: 7,823 molecules with 12 toxicity labels
- ToxCast: 8,578 molecules with 617 assay endpoints
- NIST: 271 molecules with experimental thermodynamics
- FreeSolv: 642 molecules with hydration free energy
- ESOL: 1,128 molecules with water solubility

## Citation
When using SwarmLabs in your research:
```bibtex
@misc{swarmlabs2026,
  title={SwarmLabs AI molecular property prediction},
  author={SwarmLabs},
  year={2026},
  url={https://swarmlabs.tools}
}
```
