#!/usr/bin/env python3
"""构建NIST真实数据训练集——分子生成焓+沸点"""
import json
from rdkit import Chem
from rdkit.Chem import Descriptors

# NIST标准生成焓ΔfH°(gas) kJ/mol + 沸点°C
# 来源: NIST Chemistry WebBook (webbook.nist.gov)
nist_data = [
    ('methane','C',-74.6,-161.5),('ethane','CC',-84.0,-88.6),('propane','CCC',-104.7,-42.1),
    ('butane','CCCC',-125.6,-0.5),('pentane','CCCCC',-146.9,36.1),('hexane','CCCCCC',-167.2,68.7),
    ('heptane','CCCCCCC',-187.8,98.4),('octane','CCCCCCCC',-208.7,125.5),
    ('ethylene','C=C',52.3,-103.7),('propylene','C=CC',20.0,-47.6),('1-butene','C=CCC',-0.1,-6.3),
    ('acetylene','C#C',226.7,-84.0),('propyne','C#CC',185.4,-23.2),
    ('cyclopentane','C1CCCC1',-77.2,49.3),('cyclohexane','C1CCCCC1',-123.1,80.7),
    ('benzene','c1ccccc1',82.9,80.1),('toluene','Cc1ccccc1',50.0,110.6),
    ('ethylbenzene','CCc1ccccc1',29.8,136.2),('o-xylene','Cc1ccccc1C',-24.4,144.4),
    ('p-xylene','Cc1ccc(C)cc1',-24.4,138.4),
    ('methanol','CO',-201.0,64.7),('ethanol','CCO',-234.8,78.2),
    ('1-propanol','CCCO',-255.2,97.0),('2-propanol','CC(C)O',-272.8,82.6),
    ('1-butanol','CCCCO',-247.6,117.7),('phenol','c1ccccc1O',-96.4,181.7),
    ('formaldehyde','C=O',-108.6,-19.3),('acetaldehyde','CC=O',-166.2,20.2),
    ('acetone','CC(=O)C',-217.3,56.0),('MEK','CCC(=O)C',-238.5,79.6),
    ('formic-acid','C(=O)O',-378.6,100.6),('acetic-acid','CC(=O)O',-432.2,118.1),
    ('benzoic-acid','c1ccccc1C(=O)O',-290.2,249.0),
    ('methyl-acetate','CC(=O)OC',-413.0,57.1),('ethyl-acetate','CC(=O)OCC',-444.5,77.1),
    ('dimethyl-ether','COC',-184.1,-24.8),('diethyl-ether','CCOCC',-252.1,34.6),
    ('THF','C1CCCO1',-184.2,66.0),
    ('aniline','c1ccccc1N',87.5,184.1),('pyridine','c1ccncc1',99.2,115.2),
    ('acetonitrile','CC#N',65.3,81.6),('nitromethane','C[N+](=O)[O-]',-113.1,101.2),
    ('nitroethane','CC[N+](=O)[O-]',-102.3,114.0),
    ('dimethylamine','CNC',-18.8,7.0),('trimethylamine','CN(C)C',-23.7,3.0),
    ('DMF','CN(C)C=O',-192.3,153.0),
    ('chloromethane','CCl',-81.9,-24.2),('dichloromethane','ClCCl',-95.7,39.6),
    ('chloroform','ClC(Cl)Cl',-102.7,61.2),('carbon-tetrachloride','ClC(Cl)(Cl)Cl',-95.7,76.8),
    ('chlorobenzene','Clc1ccccc1',51.8,131.7),('fluorobenzene','Fc1ccccc1',-150.6,84.7),
    ('bromobenzene','Brc1ccccc1',81.1,156.0),
    ('carbon-disulfide','S=C=S',117.4,46.3),('DMSO','CS(=O)C',-203.2,189.0),
    ('thiophene','c1ccsc1',80.2,84.1),
    ('water','O',-241.8,100.0),('ammonia','N',-45.9,-33.3),
    ('hydrogen-peroxide','OO',-136.3,150.2),('hydrazine','NN',95.4,113.5),
    ('carbon-dioxide','O=C=O',-393.5,-78.5),('carbon-monoxide','[C-]#[O+]',-110.5,-191.5),
    ('sulfur-dioxide','O=S=O',-296.8,-10.0),('nitrogen-dioxide','N(=O)[O-]',33.1,21.2),
    ('hydrogen-sulfide','S',-20.6,-60.2),
    ('1,2-dichloroethane','ClCCCl',-129.8,83.5),('vinyl-chloride','C=CCl',28.5,-13.4),
    ('styrene','C=Cc1ccccc1',147.9,145.0),('naphthalene','c1ccc2ccccc2c1',150.6,218.0),
    ('cyclohexanone','O=C1CCCCC1',-270.3,155.7),('acetophenone','CC(=O)c1ccccc1',-86.9,202.0),
    ('p-cresol','Cc1ccc(O)cc1',-125.4,202.0),
    ('1-pentene','C=CCCC',-21.0,30.0),('1-hexene','C=CCCCC',-41.7,63.4),
    ('1-octene','C=CCCCCCC',-81.4,121.3),
    ('butyraldehyde','CCCC=O',-204.8,74.8),('isobutyraldehyde','CC(C)C=O',-215.6,64.1),
    ('propionic-acid','CCC(=O)O',-454.6,141.1),('butyric-acid','CCCC(=O)O',-476.3,163.5),
    ('ethyl-formate','C(=O)OCC',-398.2,54.0),('propyl-acetate','CC(=O)OCCC',-469.5,101.6),
    ('butyl-acetate','CC(=O)OCCCC',-492.8,126.1),
    ('dipropyl-ether','CCCOCCC',-328.8,90.1),('anisole','COc1ccccc1',-67.9,153.6),
    ('dioxane','C1COCCO1',-219.3,101.1),
    ('ethylamine','CCN',-47.4,16.6),('triethylamine','CCN(CC)CC',-127.7,89.5),
    ('propionitrile','CCC#N',13.0,97.4),('acrylonitrile','C=CC#N',185.9,77.0),
    ('benzonitrile','N#Cc1ccccc1',215.5,191.1),('nitrobenzene','c1ccccc1[N+](=O)[O-]',51.8,210.9),
    ('formamide','C(=O)N',-186.3,210.0),('acetamide','CC(=O)N',-317.0,221.0),
    ('1-chloropropane','CCCCl',-131.9,46.6),('2-chloropropane','CC(C)Cl',-150.3,35.0),
    ('iodobenzene','Ic1ccccc1',133.3,188.3),
]

training_data = []
for name, smi, hf, bp in nist_data:
    mol = Chem.MolFromSmiles(smi)
    if not mol: continue
    d = {
        'name': name, 'smiles': smi,
        'molecular_weight': round(Descriptors.MolWt(mol), 3),
        'xlogp': round(Descriptors.MolLogP(mol), 2),
        'tpsa': round(Descriptors.TPSA(mol), 2),
        'h_donors': Descriptors.NumHDonors(mol),
        'h_acceptors': Descriptors.NumHAcceptors(mol),
        'rotatable_bonds': Descriptors.NumRotatableBonds(mol),
        'n_atoms': mol.GetNumAtoms(),
        'n_heavy_atoms': mol.GetNumHeavyAtoms(),
        'n_rings': Descriptors.RingCount(mol),
        'n_aromatic': sum(1 for a in mol.GetAtoms() if a.GetIsAromatic()),
        'n_halogens': sum(1 for a in mol.GetAtoms() if a.GetSymbol() in ['F','Cl','Br','I']),
        'n_oxygens': sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'O'),
        'n_nitrogens': sum(1 for a in mol.GetAtoms() if a.GetSymbol() == 'N'),
        'exp_heat_of_formation_kJ_mol': hf,
        'exp_boiling_point_C': bp,
        'source': 'NIST Chemistry WebBook',
        'source_url': f'https://webbook.nist.gov/cgi/cbook.cgi?Name={name}',
    }
    training_data.append(d)

with open('/home/z/my-project/swarmlabs_training_data_real.json', 'w') as f:
    json.dump(training_data, f, ensure_ascii=False, indent=2)

print(f'{len(training_data)} molecules saved')
hfs = [d['exp_heat_of_formation_kJ_mol'] for d in training_data]
bps = [d['exp_boiling_point_C'] for d in training_data]
print(f'Hf range: {min(hfs):.1f} ~ {max(hfs):.1f} kJ/mol')
print(f'Bp range: {min(bps):.1f} ~ {max(bps):.1f} C')
