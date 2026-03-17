/**
 * Database veicoli italiani e più diffusi in Italia.
 * Struttura: Marca → Modelli → Versioni
 * type: 'car' | 'moto' | 'van'
 */

export const vehiclesDb = [

  // ─── AUTOMOBILI ────────────────────────────────────────────────────────────

  {
    brand: 'Alfa Romeo', type: 'car', models: [
      { name: '147', versions: ['1.6 TS', '1.9 JTD', '2.0 TS', '3.2 GTA'] },
      { name: '156', versions: ['1.6 TS', '1.8 TS', '1.9 JTD', '2.0 JTS', '2.5 V6', '3.2 GTA'] },
      { name: '159', versions: ['1.9 JTDm', '2.2 JTS', '2.4 JTDm', '3.2 JTS Q4'] },
      { name: 'Giulietta', versions: ['1.4 TB 120CV', '1.4 TB 170CV', '1.6 JTDm', '1.750 TB Quadrifoglio', '2.0 JTDm'] },
      { name: 'Giulia', versions: ['2.0 Turbo 200CV', '2.0 Turbo 280CV', '2.2 JTD 160CV', '2.2 JTD 210CV', '2.9 V6 Quadrifoglio'] },
      { name: 'Stelvio', versions: ['2.0 Turbo 200CV', '2.0 Turbo 280CV', '2.2 JTD 160CV', '2.2 JTD 210CV', '2.9 V6 Quadrifoglio'] },
      { name: 'Tonale', versions: ['1.5 VGT Hybrid 160CV', '1.6 JTD 130CV', 'PHEV Q4 280CV'] },
      { name: 'MiTo', versions: ['1.4 78CV', '1.4 TB 135CV', '1.4 TB Quadrifoglio', '1.3 JTDm'] },
    ]
  },

  {
    brand: 'Audi', type: 'car', models: [
      { name: 'A1', versions: ['1.0 TFSI 95CV', '1.4 TFSI 125CV', '1.4 TFSI 150CV', '1.6 TDI 116CV', '2.0 TFSI S1'] },
      { name: 'A3', versions: ['1.0 TFSI 115CV', '1.5 TFSI 150CV', '2.0 TFSI 190CV', '2.0 TDI 116CV', '2.0 TDI 150CV', '1.4 TFSI e-tron PHEV', '40 TFSI e PHEV'] },
      { name: 'A4', versions: ['2.0 TFSI 150CV', '2.0 TFSI 190CV', '2.0 TDI 122CV', '2.0 TDI 150CV', '2.0 TDI 190CV', '3.0 TDI 218CV', 'S4 3.0 TFSI'] },
      { name: 'A6', versions: ['2.0 TFSI 252CV', '3.0 TFSI 340CV', '2.0 TDI 163CV', '3.0 TDI 218CV', '3.0 TDI 286CV', 'S6 3.0 TFSI'] },
      { name: 'Q2', versions: ['1.0 TFSI 116CV', '1.4 TFSI 150CV', '1.5 TFSI 150CV', '2.0 TDI 116CV', '2.0 TDI 150CV'] },
      { name: 'Q3', versions: ['1.5 TFSI 150CV', '2.0 TFSI 190CV', '1.6 TDI 116CV', '2.0 TDI 150CV', '45 TFSI e PHEV'] },
      { name: 'Q5', versions: ['2.0 TFSI 252CV', '45 TFSI 265CV', '2.0 TDI 163CV', '40 TDI 204CV', '3.0 TDI 286CV', '55 TFSI e PHEV'] },
      { name: 'Q7', versions: ['3.0 TFSI 340CV', '3.0 TDI 218CV', '3.0 TDI 286CV', '60 TFSI e PHEV'] },
      { name: 'e-tron', versions: ['55 quattro 408CV', '50 quattro 313CV', 'S 503CV'] },
    ]
  },

  {
    brand: 'BMW', type: 'car', models: [
      { name: 'Serie 1', versions: ['116d', '118d', '120d', '118i', '120i', '125i', 'M135i xDrive'] },
      { name: 'Serie 2', versions: ['216d', '218d', '216i', '218i', '220i', 'M240i', '220d xDrive Active Tourer'] },
      { name: 'Serie 3', versions: ['316d', '318d', '320d', '330d', '318i', '320i', '330i', '340i', '330e PHEV', 'M3'] },
      { name: 'Serie 4', versions: ['420d', '430d', '420i', '430i', '440i', 'M4'] },
      { name: 'Serie 5', versions: ['520d', '530d', '520i', '530i', '540i', '530e PHEV', 'M5'] },
      { name: 'X1', versions: ['sDrive18d', 'sDrive18i', 'xDrive20d', 'xDrive25i', 'xDrive25e PHEV', 'xDrive30e PHEV'] },
      { name: 'X3', versions: ['xDrive20d', 'xDrive30d', 'xDrive20i', 'xDrive30i', 'xDrive30e PHEV', 'M40d', 'M40i'] },
      { name: 'X5', versions: ['xDrive30d', 'xDrive40d', 'xDrive30i', 'xDrive40i', 'xDrive45e PHEV', 'M50d', 'M50i'] },
      { name: 'iX', versions: ['xDrive40', 'xDrive50', 'M60'] },
      { name: 'i3', versions: ['i3 94Ah', 'i3s 94Ah', 'i3 120Ah', 'i3s 120Ah'] },
      { name: 'i4', versions: ['eDrive35', 'eDrive40', 'xDrive40', 'M50'] },
    ]
  },

  {
    brand: 'Chevrolet', type: 'car', models: [
      { name: 'Aveo', versions: ['1.2 70CV', '1.4 100CV', '1.3 VCDI 95CV'] },
      { name: 'Cruze', versions: ['1.4 140CV', '1.6 115CV', '1.7 CDTi 130CV', '2.0 CDTi 163CV'] },
      { name: 'Spark', versions: ['1.0 65CV', '1.2 80CV'] },
      { name: 'Captiva', versions: ['2.0 VCDI 150CV', '2.0 VCDI 163CV', '2.2 CDTi 184CV'] },
    ]
  },

  {
    brand: 'Citroën', type: 'car', models: [
      { name: 'C1', versions: ['1.0 VTi 68CV', '1.0 VTi 72CV', '1.2 PureTech 82CV'] },
      { name: 'C3', versions: ['1.2 PureTech 68CV', '1.2 PureTech 83CV', '1.2 PureTech 110CV', '1.5 BlueHDI 100CV', '1.6 BlueHDI 100CV'] },
      { name: 'C3 Aircross', versions: ['1.2 PureTech 110CV', '1.2 PureTech 130CV', '1.5 BlueHDI 110CV', '1.6 BlueHDI 120CV'] },
      { name: 'C4', versions: ['1.2 PureTech 130CV', '1.5 BlueHDI 110CV', '1.6 BlueHDI 120CV', 'e-C4 Electric 136CV'] },
      { name: 'C5 Aircross', versions: ['1.2 PureTech 130CV', '1.6 PureTech 180CV', '1.5 BlueHDI 130CV', '2.0 BlueHDI 150CV', 'PHEV 225CV', 'PHEV 300CV'] },
      { name: 'Berlingo', versions: ['1.2 PureTech 110CV', '1.5 BlueHDI 100CV', '1.6 BlueHDI 120CV'] },
    ]
  },

  {
    brand: 'Dacia', type: 'car', models: [
      { name: 'Sandero', versions: ['1.0 SCe 75CV', '1.0 TCe 90CV', '1.0 TCe 100CV Bi-fuel', '1.5 Blue dCi 95CV', 'Stepway 1.0 TCe 90CV', 'Stepway 1.0 TCe 100CV'] },
      { name: 'Duster', versions: ['1.0 TCe 90CV', '1.3 TCe 130CV', '1.3 TCe 150CV 4x4', '1.5 Blue dCi 95CV', '1.5 Blue dCi 115CV 4x4'] },
      { name: 'Logan', versions: ['1.0 SCe 75CV', '1.5 Blue dCi 95CV'] },
      { name: 'Logan MCV', versions: ['1.0 SCe 75CV', '1.5 Blue dCi 95CV'] },
      { name: 'Spring', versions: ['Electric 45CV', 'Electric Extreme 65CV'] },
      { name: 'Jogger', versions: ['1.0 TCe 110CV', '1.0 TCe 110CV Bi-fuel', 'Hybrid 140CV'] },
    ]
  },

  {
    brand: 'Fiat', type: 'car', models: [
      { name: '500', versions: ['1.0 Hybrid 70CV', '1.2 69CV', '0.9 TwinAir 80CV', '0.9 TwinAir 85CV', '1.4 Abarth 135CV', '1.4 Abarth 165CV', 'Electric 118CV', 'Electric 87CV'] },
      { name: '500C', versions: ['1.0 Hybrid 70CV', '1.2 69CV', '0.9 TwinAir 85CV', 'Electric 118CV'] },
      { name: '500X', versions: ['1.0 FireFly 120CV', '1.3 FireFly 150CV', '1.6 E-torQ 110CV', '1.4 MultiAir 140CV', '2.0 MultiJet 140CV', '1.3 MultiJet 95CV', '1.6 MultiJet 120CV'] },
      { name: '500L', versions: ['1.4 95CV', '1.4 LPG 120CV', '0.9 TwinAir 105CV', '1.3 MultiJet 85CV', '1.6 MultiJet 120CV'] },
      { name: 'Panda', versions: ['1.0 Hybrid 70CV', '1.0 FireFly Hybrid 70CV', '1.2 69CV', '0.9 TwinAir 80CV', '0.9 TwinAir Natural Power 80CV', '1.3 MultiJet 80CV', '1.3 MultiJet 4x4 75CV'] },
      { name: 'Tipo', versions: ['1.4 95CV', '1.4 T-Jet 120CV', '1.6 E-torQ 110CV', '1.0 FireFly 100CV', '1.3 MultiJet 95CV', '1.6 MultiJet 120CV'] },
      { name: 'Bravo', versions: ['1.4 T-Jet 150CV', '1.6 Multijet 90CV', '1.9 Multijet 120CV', '1.9 Multijet 150CV', '2.0 Multijet 165CV'] },
      { name: 'Stilo', versions: ['1.2 80CV', '1.6 103CV', '1.8 133CV', '1.9 JTD 80CV', '1.9 JTD 100CV', '1.9 JTD 115CV', '2.4 Abarth 170CV'] },
      { name: 'Punto', versions: ['1.2 60CV', '1.2 80CV', '1.4 77CV', '1.4 T-Jet 120CV', '1.3 Multijet 75CV', '1.3 Multijet 90CV', 'Grande Punto 1.4 77CV', 'Grande Punto 1.9 JTD 130CV'] },
      { name: 'Doblo', versions: ['1.4 90CV', '1.4 T-Jet 120CV', '1.6 MultiJet 90CV', '1.6 MultiJet 120CV', '2.0 MultiJet 135CV'] },
      { name: 'Ducato', versions: ['2.0 MultiJet 110CV', '2.2 MultiJet 120CV', '2.2 MultiJet 140CV', '2.3 MultiJet 120CV', '2.3 MultiJet 150CV', '2.3 MultiJet 180CV', 'Electric 122CV'] },
      { name: 'Freemont', versions: ['1.4 T-Jet 140CV', '2.0 MultiJet 140CV', '2.0 MultiJet 170CV AWD'] },
      { name: '600', versions: ['1.2 Hybrid 136CV', 'e-Hybrid 156CV', 'Electric 115CV'] },
    ]
  },

  {
    brand: 'Ford', type: 'car', models: [
      { name: 'Fiesta', versions: ['1.1 75CV', '1.0 EcoBoost 100CV', '1.0 EcoBoost 125CV', '1.0 EcoBoost Hybrid 125CV', '1.5 TDCi 85CV', '1.5 TDCi 120CV', 'ST 1.5 EcoBoost 200CV'] },
      { name: 'Focus', versions: ['1.0 EcoBoost 100CV', '1.0 EcoBoost 125CV', '1.0 EcoBoost mHEV 125CV', '1.5 EcoBoost 182CV', '1.5 EcoBlue 95CV', '1.5 EcoBlue 120CV', '2.0 TDCi 150CV', 'ST 2.3 EcoBoost 280CV'] },
      { name: 'Puma', versions: ['1.0 EcoBoost mHEV 125CV', '1.0 EcoBoost mHEV 155CV', '1.5 EcoBlue 120CV', 'ST 1.5 EcoBoost 200CV'] },
      { name: 'Kuga', versions: ['1.5 EcoBoost 150CV', '2.0 EcoBlue 120CV', '2.0 EcoBlue 150CV', 'PHEV 225CV', '2.0 EcoBoost 4x4 242CV'] },
      { name: 'EcoSport', versions: ['1.0 EcoBoost 125CV', '1.5 TDCi 100CV', '1.5 TDCi 125CV'] },
      { name: 'Mondeo', versions: ['1.5 EcoBoost 160CV', '2.0 TDCi 150CV', '2.0 TDCi 180CV', '2.0 TDCi 210CV', 'Hybrid 2.0 187CV'] },
      { name: 'Explorer', versions: ['3.0 EcoBoost PHEV 457CV'] },
      { name: 'Mustang Mach-E', versions: ['Standard Range RWD 269CV', 'Extended Range RWD 290CV', 'Extended Range AWD 346CV', 'GT AWD 487CV'] },
    ]
  },

  {
    brand: 'Honda', type: 'car', models: [
      { name: 'Jazz', versions: ['1.3 i-VTEC 102CV', '1.5 i-MMD Hybrid 109CV', '1.5 i-MMD Hybrid Crosstar 109CV'] },
      { name: 'Civic', versions: ['1.0 VTEC 129CV', '1.5 VTEC 182CV', '1.6 i-DTEC 120CV', 'e:HEV 184CV', 'Type R 2.0 VTEC 330CV'] },
      { name: 'HR-V', versions: ['1.5 i-VTEC 130CV', '1.5 e:HEV 131CV', '1.6 i-DTEC 120CV'] },
      { name: 'CR-V', versions: ['1.5 VTEC 193CV', '1.6 i-DTEC 160CV AWD', '2.0 i-MMD Hybrid AWD 184CV'] },
      { name: 'e', versions: ['Electric 154CV', 'Advance Electric 154CV'] },
    ]
  },

  {
    brand: 'Hyundai', type: 'car', models: [
      { name: 'i10', versions: ['1.0 67CV', '1.0 67CV Techno', '1.0 T-GDI 100CV', '1.2 84CV'] },
      { name: 'i20', versions: ['1.0 T-GDI 100CV', '1.0 T-GDI 100CV 48V Hybrid', '1.2 84CV', '1.4 CRDi 90CV', 'N 1.6 T-GDI 204CV'] },
      { name: 'i30', versions: ['1.0 T-GDI 120CV', '1.5 T-GDI 110CV 48V', '1.5 T-GDI 160CV', '1.6 CRDi 115CV', '1.6 CRDi 136CV', 'N 2.0 T-GDI 280CV', 'N 2.0 T-GDI 300CV'] },
      { name: 'Kona', versions: ['1.0 T-GDI 120CV', '1.6 T-GDI 198CV 4WD', '1.6 CRDi 115CV', '1.6 CRDi 136CV', 'Electric 136CV', 'Electric 204CV'] },
      { name: 'Tucson', versions: ['1.6 T-GDI 150CV', '1.6 T-GDI 180CV 4WD', '1.6 CRDi 115CV', '1.6 CRDi 136CV', '1.6 T-GDI PHEV 265CV', '1.6 T-GDI Hybrid 230CV'] },
      { name: 'Santa Fe', versions: ['1.6 T-GDI Hybrid 230CV AWD', '1.6 T-GDI PHEV 265CV AWD', '2.0 CRDi 186CV 4WD'] },
      { name: 'IONIQ 5', versions: ['RWD 170CV', 'RWD 217CV', 'AWD 305CV', 'N AWD 650CV'] },
      { name: 'IONIQ 6', versions: ['RWD 151CV', 'RWD 228CV', 'AWD 325CV'] },
    ]
  },

  {
    brand: 'Jeep', type: 'car', models: [
      { name: 'Renegade', versions: ['1.0 T-GDI 120CV', '1.3 T4 150CV', '1.3 T4 180CV 4WD', '1.6 E-torQ 110CV', '1.6 Multijet 120CV', '2.0 Multijet 140CV 4WD', '4xe PHEV 240CV'] },
      { name: 'Compass', versions: ['1.3 T4 150CV', '1.3 T4 240CV 4WD', '1.6 Multijet 120CV', '2.0 Multijet 140CV 4WD', '4xe PHEV 240CV'] },
      { name: 'Cherokee', versions: ['2.0 Multijet 170CV', '2.2 Multijet 195CV 4WD', '3.2 V6 272CV 4WD'] },
      { name: 'Grand Cherokee', versions: ['2.0 PHEV 4xe 380CV', '3.0 V6 Diesel 250CV 4WD', '3.6 V6 286CV 4WD', '6.4 HEMI SRT 468CV'] },
      { name: 'Avenger', versions: ['1.2 T3 100CV', '1.2 T3 100CV e-Hybrid', 'Electric 156CV'] },
    ]
  },

  {
    brand: 'Kia', type: 'car', models: [
      { name: 'Picanto', versions: ['1.0 67CV', '1.0 T-GDI 100CV', '1.2 84CV'] },
      { name: 'Rio', versions: ['1.0 T-GDI 100CV', '1.0 T-GDI 100CV Mild Hybrid', '1.2 84CV', '1.4 CRDI 90CV'] },
      { name: 'Stonic', versions: ['1.0 T-GDI 100CV', '1.0 T-GDI 120CV', '1.0 T-GDI 120CV MHEV', '1.6 CRDi 115CV'] },
      { name: 'Ceed', versions: ['1.0 T-GDI 100CV', '1.4 T-GDI 140CV', '1.5 T-GDI 160CV', '1.6 CRDi 115CV', '1.6 CRDi 136CV', 'GT 1.6 T-GDI 204CV'] },
      { name: 'XCeed', versions: ['1.0 T-GDI 120CV', '1.4 T-GDI 140CV', '1.5 T-GDI 160CV', '1.6 CRDi 115CV', '1.6 CRDi 136CV', 'PHEV 141CV'] },
      { name: 'Sportage', versions: ['1.6 T-GDI 150CV', '1.6 T-GDI 177CV AWD', '1.6 CRDi 115CV', '1.6 CRDi 136CV AWD', 'PHEV AWD 265CV', 'HEV AWD 230CV'] },
      { name: 'Niro', versions: ['HEV 141CV', 'PHEV 183CV', 'Electric 204CV'] },
      { name: 'EV6', versions: ['RWD 170CV', 'RWD 228CV', 'AWD 325CV', 'GT AWD 585CV'] },
    ]
  },

  {
    brand: 'Lancia', type: 'car', models: [
      { name: 'Ypsilon', versions: ['1.0 FireFly Hybrid 70CV', '1.2 69CV', '0.9 TwinAir 85CV', '1.3 MultiJet 75CV', '1.3 MultiJet 95CV'] },
      { name: 'Delta', versions: ['1.4 MultiAir 140CV', '1.4 MultiAir 165CV', '1.6 MultiJet 120CV', '1.9 MultiJet 190CV', '2.0 MultiJet 165CV'] },
      { name: 'Musa', versions: ['1.3 MultiJet 90CV', '1.4 95CV'] },
    ]
  },

  {
    brand: 'Mazda', type: 'car', models: [
      { name: 'Mazda2', versions: ['1.5 Skyactiv-G 75CV', '1.5 Skyactiv-G 90CV', '1.5 e-Skyactiv-G 90CV Hybrid', '1.5 Skyactiv-D 105CV'] },
      { name: 'Mazda3', versions: ['2.0 Skyactiv-G 122CV', '2.0 Skyactiv-G 150CV', '2.0 Skyactiv-X 180CV', '2.0 e-Skyactiv-X 186CV', '1.8 Skyactiv-D 116CV'] },
      { name: 'Mazda6', versions: ['2.0 Skyactiv-G 165CV', '2.5 Skyactiv-G 194CV', '2.5 Turbo 231CV', '2.2 Skyactiv-D 150CV', '2.2 Skyactiv-D 184CV'] },
      { name: 'CX-3', versions: ['2.0 Skyactiv-G 121CV', '1.5 Skyactiv-D 105CV'] },
      { name: 'CX-5', versions: ['2.0 Skyactiv-G 165CV', '2.5 Skyactiv-G 194CV', '2.2 Skyactiv-D 150CV', '2.2 Skyactiv-D 184CV 4WD'] },
      { name: 'CX-30', versions: ['2.0 Skyactiv-G 122CV', '2.0 Skyactiv-G 150CV', '2.0 Skyactiv-X 180CV', '2.0 e-Skyactiv-X 186CV', '1.8 Skyactiv-D 116CV', 'e-Skyactiv G mHEV 150CV'] },
      { name: 'MX-5', versions: ['1.5 Skyactiv-G 132CV', '2.0 Skyactiv-G 184CV'] },
    ]
  },

  {
    brand: 'Mercedes-Benz', type: 'car', models: [
      { name: 'Classe A', versions: ['A 180 136CV', 'A 200 163CV', 'A 180 d 116CV', 'A 200 d 150CV', 'A 250 224CV', 'A 250 e PHEV 218CV', 'AMG A 35 306CV', 'AMG A 45 S 421CV'] },
      { name: 'Classe B', versions: ['B 180 136CV', 'B 200 163CV', 'B 180 d 116CV', 'B 200 d 150CV', 'B 250 224CV', 'B 250 e PHEV 218CV'] },
      { name: 'Classe C', versions: ['C 180 170CV', 'C 200 204CV', 'C 300 258CV', 'C 220 d 200CV', 'C 300 d 265CV', 'C 300 e PHEV 313CV', 'AMG C 43 408CV', 'AMG C 63 S 680CV'] },
      { name: 'Classe E', versions: ['E 200 197CV', 'E 300 258CV', 'E 220 d 197CV', 'E 300 d 265CV', 'E 300 e PHEV 320CV', 'AMG E 53 435CV'] },
      { name: 'GLA', versions: ['GLA 200 163CV', 'GLA 250 224CV', 'GLA 200 d 150CV', 'GLA 220 d 190CV', 'GLA 250 e PHEV 218CV', 'AMG GLA 35 306CV'] },
      { name: 'GLB', versions: ['GLB 200 163CV', 'GLB 250 224CV 4MATIC', 'GLB 200 d 150CV', 'GLB 220 d 190CV 4MATIC', 'AMG GLB 35 306CV'] },
      { name: 'GLC', versions: ['GLC 200 204CV', 'GLC 300 258CV', 'GLC 220 d 197CV', 'GLC 300 d 272CV', 'GLC 300 e PHEV 313CV', 'AMG GLC 43 421CV'] },
      { name: 'EQA', versions: ['EQA 250 190CV', 'EQA 250+ 190CV', 'EQA 300 4MATIC 228CV', 'EQA 350 4MATIC 292CV'] },
      { name: 'EQC', versions: ['EQC 400 4MATIC 408CV'] },
    ]
  },

  {
    brand: 'Mini', type: 'car', models: [
      { name: 'Cooper', versions: ['One 102CV', 'One D 95CV', 'Cooper 136CV', 'Cooper D 116CV', 'Cooper S 178CV', 'Cooper SD 150CV', 'John Cooper Works 231CV', 'Electric 184CV'] },
      { name: 'Cooper Cabrio', versions: ['One 102CV', 'Cooper 136CV', 'Cooper S 178CV', 'JCW 231CV'] },
      { name: 'Countryman', versions: ['One 102CV', 'Cooper 136CV', 'Cooper D 116CV', 'Cooper S 178CV', 'Cooper SD 150CV', 'Cooper SE ALL4 PHEV 224CV', 'JCW 306CV'] },
      { name: 'Clubman', versions: ['One D 95CV', 'Cooper 136CV', 'Cooper D 116CV', 'Cooper S 178CV', 'Cooper SD 150CV', 'JCW ALL4 306CV'] },
    ]
  },

  {
    brand: 'Nissan', type: 'car', models: [
      { name: 'Micra', versions: ['1.0 IG-T 92CV', '1.0 IG-T 100CV', '1.5 dCi 90CV', '0.9 IG-T 90CV'] },
      { name: 'Juke', versions: ['1.0 DIG-T 114CV', '1.0 DIG-T 114CV N-Connecta', '1.6 Hybrid 143CV', '1.5 dCi 110CV'] },
      { name: 'Qashqai', versions: ['1.3 DIG-T 140CV', '1.3 DIG-T 158CV MHEV', '1.3 e-Power 190CV', '1.5 dCi 115CV', 'e-Power 190CV'] },
      { name: 'X-Trail', versions: ['1.5 e-4ORCE 213CV', '1.5 e-4ORCE 252CV 4WD', '1.3 DIG-T 160CV', '2.0 dCi 177CV 4WD'] },
      { name: 'Leaf', versions: ['Leaf 150CV 40kWh', 'Leaf 217CV 62kWh e+'] },
      { name: 'Ariya', versions: ['2WD 218CV 63kWh', '2WD 242CV 87kWh', 'e-4ORCE 390CV'] },
    ]
  },

  {
    brand: 'Opel', type: 'car', models: [
      { name: 'Corsa', versions: ['1.2 75CV', '1.2 T 100CV', '1.2 T 130CV', '1.5 D 100CV', '1.5 D 120CV', 'Electric 136CV', 'GS 1.2 T 130CV'] },
      { name: 'Astra', versions: ['1.2 T 110CV', '1.2 T 130CV', '1.5 D 110CV', '1.5 D 130CV', 'Plug-in Hybrid 180CV', 'Plug-in Hybrid 225CV', 'GSe PHEV 225CV'] },
      { name: 'Mokka', versions: ['1.2 T 100CV', '1.2 T 130CV', '1.5 D 110CV', '1.5 D 130CV', 'Electric 136CV', 'GSe 1.2 T 156CV'] },
      { name: 'Crossland', versions: ['1.2 83CV', '1.2 T 110CV', '1.2 T 130CV', '1.5 D 110CV', '1.5 D 120CV'] },
      { name: 'Grandland', versions: ['1.2 T 130CV', '1.5 D 130CV', 'PHEV 225CV 4x4', 'PHEV 300CV 4x4', 'GSe PHEV 300CV'] },
      { name: 'Zafira Life', versions: ['1.5 D 120CV', '2.0 D 145CV', '2.0 D 180CV'] },
    ]
  },

  {
    brand: 'Peugeot', type: 'car', models: [
      { name: '208', versions: ['1.2 PureTech 75CV', '1.2 PureTech 100CV', '1.2 PureTech 130CV', '1.5 BlueHDI 100CV', 'Electric e-208 136CV', 'GT 1.2 PureTech 130CV'] },
      { name: '308', versions: ['1.2 PureTech 110CV', '1.2 PureTech 130CV', '1.5 BlueHDI 130CV', '2.0 BlueHDI 130CV', 'PHEV 180CV', 'PHEV 225CV', 'GT 1.6 PureTech 225CV'] },
      { name: '2008', versions: ['1.2 PureTech 100CV', '1.2 PureTech 130CV', '1.5 BlueHDI 100CV', '1.5 BlueHDI 110CV', 'Electric e-2008 136CV', 'GT 1.2 PureTech 130CV'] },
      { name: '3008', versions: ['1.2 PureTech 130CV', '1.6 PureTech 180CV', '1.5 BlueHDI 130CV', '2.0 BlueHDI 150CV', '2.0 BlueHDI 180CV', 'PHEV 225CV', 'PHEV 300CV 4x4'] },
      { name: '5008', versions: ['1.2 PureTech 130CV', '1.6 PureTech 180CV', '1.5 BlueHDI 130CV', '2.0 BlueHDI 150CV', '2.0 BlueHDI 180CV', 'PHEV 225CV', 'PHEV 300CV 4x4'] },
      { name: '408', versions: ['1.2 PureTech 130CV', '1.6 PHEV 180CV', '1.6 PHEV 225CV'] },
      { name: 'Rifter', versions: ['1.2 PureTech 110CV', '1.5 BlueHDI 100CV', '1.5 BlueHDI 130CV'] },
    ]
  },

  {
    brand: 'Renault', type: 'car', models: [
      { name: 'Twingo', versions: ['1.0 SCe 65CV', '1.0 SCe 75CV', 'Electric 82CV'] },
      { name: 'Clio', versions: ['1.0 SCe 65CV', '1.0 TCe 90CV', '1.0 TCe 100CV', '1.5 Blue dCi 85CV', '1.5 Blue dCi 100CV', 'E-Tech Hybrid 140CV', 'R.S. Line 1.0 TCe 90CV'] },
      { name: 'Captur', versions: ['1.0 TCe 90CV', '1.0 TCe 100CV', '1.3 TCe 130CV', '1.3 TCe 155CV', '1.5 Blue dCi 95CV', '1.5 Blue dCi 115CV', 'E-Tech PHEV 160CV'] },
      { name: 'Megane', versions: ['1.3 TCe 115CV', '1.3 TCe 140CV', '1.3 TCe 160CV', '1.5 Blue dCi 115CV', 'E-Tech PHEV 160CV', 'RS 300CV'] },
      { name: 'Kadjar', versions: ['1.3 TCe 140CV', '1.3 TCe 160CV', '1.5 Blue dCi 115CV', '1.7 Blue dCi 150CV 4WD'] },
      { name: 'Austral', versions: ['1.2 TCe Mild Hybrid 130CV', '1.2 TCe Mild Hybrid 160CV', 'E-Tech Full Hybrid 200CV'] },
      { name: 'Arkana', versions: ['1.3 TCe 140CV', '1.3 TCe 160CV', '1.6 E-Tech Hybrid 145CV'] },
      { name: 'Zoe', versions: ['R110 108CV 52kWh', 'R135 135CV 52kWh', 'R110 108CV 41kWh'] },
      { name: 'Kangoo', versions: ['1.3 TCe 100CV', '1.5 Blue dCi 95CV', '1.5 Blue dCi 115CV', 'Electric 90CV'] },
    ]
  },

  {
    brand: 'Seat', type: 'car', models: [
      { name: 'Ibiza', versions: ['1.0 MPI 80CV', '1.0 TSI 95CV', '1.0 TSI 110CV', '1.6 TDI 80CV', '1.6 TDI 95CV', 'FR 1.0 TSI 115CV'] },
      { name: 'Leon', versions: ['1.0 TSI 110CV', '1.5 TSI 130CV', '1.5 TSI 150CV', '2.0 TSI 190CV', '1.6 TDI 115CV', '2.0 TDI 150CV', 'e-Hybrid PHEV 204CV', 'Cupra 2.0 TSI 300CV'] },
      { name: 'Arona', versions: ['1.0 TSI 95CV', '1.0 TSI 110CV', '1.0 TSI 115CV', '1.5 TSI 150CV', '1.6 TDI 95CV'] },
      { name: 'Ateca', versions: ['1.0 TSI 115CV', '1.5 TSI 150CV', '2.0 TSI 190CV 4Drive', '1.6 TDI 115CV', '2.0 TDI 150CV', '2.0 TDI 190CV 4Drive'] },
      { name: 'Tarraco', versions: ['1.5 TSI 150CV', '2.0 TSI 190CV 4Drive', '2.0 TSI 245CV 4Drive', '2.0 TDI 150CV', '2.0 TDI 200CV 4Drive', 'e-Hybrid PHEV 245CV 4Drive'] },
    ]
  },

  {
    brand: 'Škoda', type: 'car', models: [
      { name: 'Fabia', versions: ['1.0 MPI 65CV', '1.0 TSI 95CV', '1.0 TSI 110CV', '1.4 TDI 80CV', '1.6 TDI 95CV'] },
      { name: 'Octavia', versions: ['1.0 TSI 110CV', '1.5 TSI 150CV', '2.0 TSI 190CV', '1.6 TDI 116CV', '2.0 TDI 115CV', '2.0 TDI 150CV', 'RS 2.0 TSI 230CV', 'iV PHEV 204CV'] },
      { name: 'Scala', versions: ['1.0 TSI 116CV', '1.5 TSI 150CV', '1.6 TDI 116CV'] },
      { name: 'Kamiq', versions: ['1.0 TSI 95CV', '1.0 TSI 115CV', '1.5 TSI 150CV', '1.6 TDI 115CV'] },
      { name: 'Karoq', versions: ['1.0 TSI 115CV', '1.5 TSI 150CV', '2.0 TSI 190CV 4x4', '1.6 TDI 116CV', '2.0 TDI 150CV', '2.0 TDI 190CV 4x4'] },
      { name: 'Kodiaq', versions: ['1.5 TSI 150CV', '2.0 TSI 190CV 4x4', '2.0 TSI 245CV 4x4', '2.0 TDI 150CV', '2.0 TDI 200CV 4x4', 'RS 2.0 TSI 245CV 4x4'] },
      { name: 'Enyaq iV', versions: ['iV 60 177CV', 'iV 80 204CV', 'iV 80x 265CV 4x4', 'RS iV 299CV 4x4', 'Coupe RS iV 299CV 4x4'] },
    ]
  },

  {
    brand: 'Subaru', type: 'car', models: [
      { name: 'Impreza', versions: ['2.0 i 156CV e-Boxer AWD'] },
      { name: 'XV', versions: ['1.6i 114CV', '2.0i 156CV AWD', '2.0i e-Boxer 145CV AWD'] },
      { name: 'Forester', versions: ['2.0i e-Boxer 150CV AWD', '2.0i X 156CV AWD'] },
      { name: 'Outback', versions: ['2.5i 175CV AWD', '2.5i Premium 175CV AWD'] },
      { name: 'Levorg', versions: ['1.6 GT-S 170CV AWD', '2.0 GT-S 306CV AWD'] },
      { name: 'BRZ', versions: ['2.0 200CV', '2.4 235CV'] },
    ]
  },

  {
    brand: 'Suzuki', type: 'car', models: [
      { name: 'Alto', versions: ['1.0 68CV'] },
      { name: 'Swift', versions: ['1.2 Hybrid 83CV', '1.2 Hybrid 90CV 4WD', '1.0 Boosterjet 112CV', '1.4 Boosterjet Sport 140CV'] },
      { name: 'Ignis', versions: ['1.2 Hybrid 83CV', '1.2 Hybrid 83CV 4WD AllGrip'] },
      { name: 'Vitara', versions: ['1.4 Boosterjet 129CV', '1.4 Boosterjet 129CV 4WD AllGrip', '1.5 Hybrid 102CV', '1.5 Hybrid 102CV 4WD AllGrip', '1.6 120CV'] },
      { name: 'S-Cross', versions: ['1.4 Boosterjet Hybrid 129CV', '1.4 Boosterjet Hybrid 129CV AllGrip', '1.5 Hybrid 102CV', '1.5 Hybrid 102CV AllGrip'] },
      { name: 'Jimny', versions: ['1.5 102CV 4WD', '1.3 85CV 4WD'] },
      { name: 'Across', versions: ['2.5 PHEV 306CV AWD'] },
    ]
  },

  {
    brand: 'Tesla', type: 'car', models: [
      { name: 'Model 3', versions: ['Standard Range Plus RWD 283CV', 'Long Range AWD 498CV', 'Performance AWD 567CV'] },
      { name: 'Model Y', versions: ['Standard Range RWD 252CV', 'Long Range AWD 514CV', 'Performance AWD 534CV'] },
      { name: 'Model S', versions: ['Long Range AWD 670CV', 'Plaid AWD 1020CV'] },
      { name: 'Model X', versions: ['Long Range AWD 670CV', 'Plaid AWD 1020CV'] },
    ]
  },

  {
    brand: 'Toyota', type: 'car', models: [
      { name: 'Yaris', versions: ['1.0 72CV', '1.5 Hybrid 116CV', '1.5 Hybrid GR Sport 130CV', 'GR Yaris 1.6 261CV'] },
      { name: 'Yaris Cross', versions: ['1.5 Hybrid 116CV', '1.5 Hybrid 130CV AWD'] },
      { name: 'Corolla', versions: ['1.2 T 116CV', '1.8 Hybrid 122CV', '2.0 Hybrid 184CV', '2.0 Hybrid GR Sport 197CV', '1.4 D-4D 90CV'] },
      { name: 'C-HR', versions: ['1.2 T 116CV', '1.8 Hybrid 122CV', '2.0 Hybrid 184CV'] },
      { name: 'RAV4', versions: ['2.0 173CV', '2.5 Hybrid 222CV', '2.5 PHEV 306CV AWD', '2.5 Hybrid AWD 222CV', '2.0 D-4D 143CV'] },
      { name: 'Prius', versions: ['1.8 Hybrid 122CV', '2.0 PHEV 223CV', '2.5 PHEV 306CV AWD'] },
      { name: 'Camry', versions: ['2.5 Hybrid 218CV'] },
      { name: 'Land Cruiser', versions: ['2.8 D-4D 204CV AWD', '3.0 D-4D 190CV AWD'] },
      { name: 'GR86', versions: ['2.4 234CV'] },
      { name: 'bZ4X', versions: ['FWD 204CV', 'AWD 218CV'] },
    ]
  },

  {
    brand: 'Volkswagen', type: 'car', models: [
      { name: 'Polo', versions: ['1.0 MPI 65CV', '1.0 MPI 80CV', '1.0 TSI 95CV', '1.0 TSI 110CV', '1.6 TDI 80CV', '1.6 TDI 95CV', 'GTI 2.0 TSI 207CV'] },
      { name: 'Golf', versions: ['1.0 TSI 110CV', '1.5 TSI 130CV', '1.5 eTSI 130CV', '1.5 eTSI 150CV', '2.0 TSI 190CV', '2.0 TDI 115CV', '2.0 TDI 150CV', 'GTE PHEV 245CV', 'GTI 2.0 TSI 245CV', 'R 2.0 TSI 320CV'] },
      { name: 'T-Cross', versions: ['1.0 TSI 95CV', '1.0 TSI 110CV', '1.0 TSI 115CV', '1.6 TDI 95CV', '1.5 TSI 150CV'] },
      { name: 'T-Roc', versions: ['1.0 TSI 115CV', '1.5 TSI 150CV', '2.0 TSI 190CV 4Motion', '1.6 TDI 115CV', '2.0 TDI 150CV', '2.0 TDI 190CV 4Motion', 'R 2.0 TSI 300CV', 'Cabriolet 1.5 TSI 150CV'] },
      { name: 'Tiguan', versions: ['1.5 TSI 130CV', '1.5 TSI 150CV', '2.0 TSI 190CV 4Motion', '2.0 TSI 245CV 4Motion', '2.0 TDI 150CV', '2.0 TDI 190CV 4Motion', 'eHybrid PHEV 245CV', 'R 2.0 TSI 320CV 4Motion'] },
      { name: 'Passat', versions: ['1.5 TSI 150CV', '2.0 TSI 190CV', '1.6 TDI 120CV', '2.0 TDI 150CV', '2.0 TDI 190CV', 'GTE PHEV 218CV'] },
      { name: 'Arteon', versions: ['1.5 TSI 150CV', '2.0 TSI 190CV', '2.0 TSI 280CV 4Motion', '2.0 TDI 150CV', '2.0 TDI 200CV', 'R 2.0 TSI 320CV', 'eHybrid PHEV 218CV'] },
      { name: 'ID.3', versions: ['Pure Performance 150CV 45kWh', 'Pro Performance 204CV 58kWh', 'Pro S Performance 204CV 77kWh', 'GTX 4Motion 326CV 77kWh'] },
      { name: 'ID.4', versions: ['Pure Performance 170CV 52kWh', 'Pro 204CV 77kWh', 'Pro 4Motion AWD 265CV', 'GTX 4Motion 299CV', 'GTX 4Motion 326CV'] },
      { name: 'Transporter', versions: ['2.0 TDI 90CV', '2.0 TDI 110CV', '2.0 TDI 150CV', '2.0 TDI 198CV 4Motion'] },
    ]
  },

  {
    brand: 'Volvo', type: 'car', models: [
      { name: 'XC40', versions: ['B3 163CV', 'B4 197CV', 'B5 250CV AWD', 'D3 150CV', 'D4 190CV AWD', 'T5 PHEV 262CV', 'Recharge Electric 231CV', 'Recharge Twin 408CV AWD'] },
      { name: 'XC60', versions: ['B4 197CV', 'B5 250CV AWD', 'B6 300CV AWD', 'D4 190CV AWD', 'T6 PHEV 340CV AWD', 'T8 PHEV 390CV AWD', 'Recharge T8 455CV AWD'] },
      { name: 'XC90', versions: ['B5 250CV AWD', 'B6 300CV AWD', 'D5 235CV AWD', 'T8 PHEV 390CV AWD', 'T8 PHEV 420CV AWD', 'Recharge T8 455CV AWD'] },
      { name: 'V60', versions: ['B3 163CV', 'B4 197CV', 'B5 250CV AWD', 'D3 150CV', 'D4 190CV AWD', 'T6 PHEV 340CV AWD', 'T8 PHEV 390CV AWD'] },
      { name: 'V90', versions: ['B5 250CV AWD', 'D5 235CV AWD', 'T8 PHEV 390CV AWD', 'T8 PHEV 420CV AWD Cross Country'] },
      { name: 'S60', versions: ['B3 163CV', 'B4 197CV', 'B5 250CV AWD', 'T8 Recharge 455CV AWD'] },
    ]
  },

  // ─── MOTOCICLI ─────────────────────────────────────────────────────────────

  {
    brand: 'Ducati', type: 'moto', models: [
      { name: 'Monster', versions: ['Monster 937', 'Monster 1200', 'Monster 821', 'Monster 696', 'Monster SP 937'] },
      { name: 'Panigale', versions: ['Panigale V2 955', 'Panigale V4 1103', 'Panigale V4 S', 'Panigale V4 R', 'Panigale V4 SP2'] },
      { name: 'Multistrada', versions: ['V2 937', 'V2 S', 'V4 1158', 'V4 S', 'V4 Pikes Peak'] },
      { name: 'Scrambler', versions: ['Icon 803', 'Full Throttle 803', 'Desert Sled 803', 'Nightshift 803', '1100 PRO'] },
      { name: 'Streetfighter', versions: ['V2 955', 'V4 1103', 'V4 S', 'V4 SP2'] },
      { name: 'Diavel', versions: ['Diavel V4 1158'] },
      { name: 'Hypermotard', versions: ['698 Mono', '950', '950 SP', '950 RVE'] },
    ]
  },

  {
    brand: 'Honda', type: 'moto', models: [
      { name: 'CB500F', versions: ['CB500F ABS', 'CB500F'] },
      { name: 'CB650R', versions: ['CB650R ABS', 'CB650R E-Clutch'] },
      { name: 'CBR600RR', versions: ['CBR600RR ABS', 'CBR600RR'] },
      { name: 'CBR1000RR', versions: ['Fireblade 1000RR', 'Fireblade SP', 'Fireblade SP2'] },
      { name: 'Africa Twin', versions: ['CRF1100L', 'CRF1100L Adventure Sports', 'CRF1100L DCT'] },
      { name: 'NC750X', versions: ['NC750X DCT', 'NC750X ABS'] },
      { name: 'Forza', versions: ['Forza 350', 'Forza 750'] },
      { name: 'CB1000R', versions: ['CB1000R', 'CB1000R Black Edition', 'CB1000R +'] },
      { name: 'Gold Wing', versions: ['GL1800 Tour DCT', 'GL1800 Airbag DCT'] },
      { name: 'Hornet', versions: ['CB750 Hornet', 'CB1000 Hornet'] },
    ]
  },

  {
    brand: 'Kawasaki', type: 'moto', models: [
      { name: 'Ninja 400', versions: ['Ninja 400 ABS', 'Ninja 400 KRT Edition'] },
      { name: 'Ninja 650', versions: ['Ninja 650 ABS', 'Ninja 650 KRT Edition'] },
      { name: 'Ninja ZX-6R', versions: ['ZX-6R 636', 'ZX-6R 636 KRT'] },
      { name: 'Ninja ZX-10R', versions: ['ZX-10R', 'ZX-10R KRT Edition', 'ZX-10RR', 'ZX-10R SE'] },
      { name: 'Z900', versions: ['Z900', 'Z900 SE', 'Z900 RS', 'Z900 RS Cafe'] },
      { name: 'Versys 650', versions: ['Versys 650 ABS', 'Versys 650 Grand Tourer'] },
      { name: 'Versys 1000', versions: ['Versys 1000 SE', 'Versys 1000 Grand Tourer SE'] },
      { name: 'Z650', versions: ['Z650 ABS', 'Z650RS'] },
      { name: 'Z1000', versions: ['Z1000 ABS', 'Z1000 SX'] },
    ]
  },

  {
    brand: 'Yamaha', type: 'moto', models: [
      { name: 'MT-03', versions: ['MT-03 321cc'] },
      { name: 'MT-07', versions: ['MT-07 689cc', 'MT-07 SP'] },
      { name: 'MT-09', versions: ['MT-09 890cc', 'MT-09 SP', 'MT-09 Tracer GT+'] },
      { name: 'MT-10', versions: ['MT-10 998cc', 'MT-10 SP', 'MT-10 Tourer Edition'] },
      { name: 'YZF-R1', versions: ['R1', 'R1M'] },
      { name: 'YZF-R7', versions: ['R7 689cc'] },
      { name: 'Tracer 9', versions: ['Tracer 9', 'Tracer 9 GT', 'Tracer 9 GT+'] },
      { name: 'Tenere 700', versions: ['Ténéré 700', 'Ténéré 700 World Raid', 'Ténéré 700 Rally'] },
      { name: 'XMAX', versions: ['XMAX 125', 'XMAX 300', 'XMAX 400'] },
      { name: 'T-MAX', versions: ['T-MAX 560', 'T-MAX 560 Tech MAX'] },
      { name: 'NMAX', versions: ['NMAX 125 ABS', 'NMAX 125 A-Class'] },
    ]
  },

  {
    brand: 'KTM', type: 'moto', models: [
      { name: 'Duke 125', versions: ['125 Duke ABS'] },
      { name: 'Duke 390', versions: ['390 Duke ABS'] },
      { name: 'Duke 790', versions: ['790 Duke', '890 Duke'] },
      { name: 'Duke 1290', versions: ['1290 Super Duke R', '1290 Super Duke RR'] },
      { name: 'RC 390', versions: ['RC 390 ABS'] },
      { name: 'Adventure', versions: ['390 Adventure', '790 Adventure', '890 Adventure', '890 Adventure R', '1290 Super Adventure S', '1290 Super Adventure R'] },
      { name: 'SMC R', versions: ['690 SMC R ABS', '690 Enduro R'] },
    ]
  },

  {
    brand: 'BMW Motorrad', type: 'moto', models: [
      { name: 'R 1250 GS', versions: ['R 1250 GS', 'R 1250 GS Adventure', 'R 1250 GS Triple Black'] },
      { name: 'R 1250 RT', versions: ['R 1250 RT'] },
      { name: 'R 1250 RS', versions: ['R 1250 RS', 'R 1250 RS Sport'] },
      { name: 'R 1250 R', versions: ['R 1250 R', 'R 1250 R Roadster'] },
      { name: 'S 1000 RR', versions: ['S 1000 RR', 'S 1000 RR M Sport'] },
      { name: 'S 1000 R', versions: ['S 1000 R', 'S 1000 R Sport'] },
      { name: 'S 1000 XR', versions: ['S 1000 XR'] },
      { name: 'F 900 R', versions: ['F 900 R', 'F 900 XR'] },
      { name: 'F 850 GS', versions: ['F 850 GS', 'F 850 GS Adventure'] },
      { name: 'G 310 R', versions: ['G 310 R ABS', 'G 310 GS ABS'] },
    ]
  },

  {
    brand: 'Aprilia', type: 'moto', models: [
      { name: 'RS 660', versions: ['RS 660', 'RS 660 Extrema'] },
      { name: 'Tuono 660', versions: ['Tuono 660', 'Tuono 660 Factory'] },
      { name: 'RSV4', versions: ['RSV4 1100', 'RSV4 Factory 1100', 'RSV4 XTrenta'] },
      { name: 'Tuono V4', versions: ['Tuono V4 1100', 'Tuono V4 Factory 1100'] },
      { name: 'Dorsoduro', versions: ['Dorsoduro 900', 'Dorsoduro 1200'] },
      { name: 'Shiver', versions: ['Shiver 900'] },
    ]
  },

  {
    brand: 'MV Agusta', type: 'moto', models: [
      { name: 'F3', versions: ['F3 675', 'F3 800', 'F3 RR 800'] },
      { name: 'F4', versions: ['F4 1000 RC', 'F4 RR'] },
      { name: 'Brutale', versions: ['Brutale 800 RR', 'Brutale 1000 RS', 'Brutale 1000 RR', 'Brutale 1000 Nürburgring'] },
      { name: 'Turismo Veloce', versions: ['800 Rosso', '800 Lusso', '800 RC SCS'] },
    ]
  },

  // ─── FURGONI ───────────────────────────────────────────────────────────────

  {
    brand: 'Fiat', type: 'van', models: [
      { name: 'Ducato', versions: ['28 2.2 MultiJet 120CV', '30 2.2 MultiJet 140CV', '35 2.2 MultiJet 140CV', '35 2.3 MultiJet 150CV', '35 2.3 MultiJet 180CV', '35 Electric 122CV'] },
      { name: 'Scudo', versions: ['1.5 BlueHDI 100CV', '2.0 BlueHDI 145CV', '2.0 BlueHDI 180CV', 'Electric 136CV'] },
      { name: 'Doblo Cargo', versions: ['1.3 MultiJet 85CV', '1.6 MultiJet 105CV', '2.0 MultiJet 135CV'] },
    ]
  },

  {
    brand: 'Volkswagen', type: 'van', models: [
      { name: 'Transporter T6', versions: ['2.0 TDI 84CV', '2.0 TDI 102CV', '2.0 TDI 150CV', '2.0 TDI 198CV 4Motion'] },
      { name: 'Transporter T6.1', versions: ['2.0 TDI 90CV', '2.0 TDI 110CV', '2.0 TDI 150CV', '2.0 TDI 199CV 4Motion'] },
      { name: 'Caddy', versions: ['2.0 TDI 75CV', '2.0 TDI 102CV', '2.0 TSI 114CV', '1.5 TSI 114CV', 'Electric 204CV'] },
      { name: 'Crafter', versions: ['2.0 TDI 102CV', '2.0 TDI 140CV', '2.0 TDI 177CV'] },
    ]
  },

  {
    brand: 'Mercedes-Benz', type: 'van', models: [
      { name: 'Sprinter', versions: ['314 CDI 143CV', '316 CDI 163CV', '319 CDI 190CV', '316 CDI e Electric'] },
      { name: 'Vito', versions: ['111 CDI 114CV', '114 CDI 136CV', '116 CDI 163CV', '119 CDI 190CV', '116 e Electric'] },
      { name: 'Citan', versions: ['108 CDI 75CV', '110 CDI 95CV', '112 CDI 116CV', '110 e Electric'] },
    ]
  },

  {
    brand: 'Ford', type: 'van', models: [
      { name: 'Transit Custom', versions: ['2.0 EcoBlue 105CV', '2.0 EcoBlue 130CV', '2.0 EcoBlue 170CV', 'PHEV 126CV'] },
      { name: 'Transit', versions: ['2.0 EcoBlue 105CV', '2.0 EcoBlue 130CV', '2.0 EcoBlue 170CV', 'E-Transit Electric'] },
      { name: 'Transit Connect', versions: ['1.0 EcoBoost 100CV', '1.5 EcoBlue 75CV', '1.5 EcoBlue 100CV', '1.5 EcoBlue 120CV'] },
    ]
  },

  {
    brand: 'Renault', type: 'van', models: [
      { name: 'Trafic', versions: ['1.6 dCi 90CV', '1.6 dCi 120CV', '2.0 Blue dCi 120CV', '2.0 Blue dCi 145CV', '2.0 Blue dCi 170CV'] },
      { name: 'Master', versions: ['2.3 dCi 110CV', '2.3 dCi 135CV', '2.3 dCi 150CV', '2.3 dCi 165CV', 'E-TECH Electric'] },
      { name: 'Kangoo Express', versions: ['1.3 TCe 100CV', '1.5 Blue dCi 75CV', '1.5 Blue dCi 95CV', 'E-Tech Electric'] },
    ]
  },

]

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Lista di tutte le marche, opzionalmente filtrata per tipo */
export function getBrands(type = null) {
  const entries = type ? vehiclesDb.filter(e => e.type === type) : vehiclesDb
  return [...new Set(entries.map(e => e.brand))].sort()
}

/** Lista modelli per una marca (e opzionalmente tipo) */
export function getModels(brand, type = null) {
  const entry = vehiclesDb.find(e => e.brand === brand && (type === null || e.type === type))
  if (!entry) return []
  return entry.models.map(m => m.name).sort()
}

/** Lista versioni per marca + modello */
export function getVersions(brand, modelName) {
  const entry = vehiclesDb.find(e => e.brand === brand)
  if (!entry) return []
  const model = entry.models.find(m => m.name === modelName)
  return model ? model.versions : []
}

/** Tipo veicolo dalla marca */
export function getTypeByBrand(brand) {
  const entry = vehiclesDb.find(e => e.brand === brand)
  return entry?.type || 'car'
}
