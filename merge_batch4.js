const fs = require('fs');

const batch4 = {
  "Galvanized Iron GI Pipe S40 Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7_KuNnSP8EPPQx5l0dmhrZ7hGLEAUemOEgjWt_CJ5Cw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjU_tCcmu8PZ6GAm5oQeTIt_r4zgOd6pa9QgnMf17IYw&s=10"
  ],
  "GI Pipe Samurai Schedule 40 Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShBhy57figfc9DWNOQS0NGERXYLa4MPs1FytU1m32NIA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7_KuNnSP8EPPQx5l0dmhrZ7hGLEAUemOEgjWt_CJ5Cw&s=10"
  ],
  "Steel Plain Round Bar Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9Fdy9suyoPMDlCp3bL5190Ti4EOZIL4CpnioJBOUgBA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCI6--i7rqoRzykr5qQPGVdCt7gZ-Sm9oiaGqYpx-0Ew&s=10"
  ],
  "Island Paint QDE International Red Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7TTq7x1wG_3GAuSMaFyoMKmHHw_duta3UNmPXlrxaqQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhzjchqi_wBsIxzdyV9q7pkbwv5_5vWsOfE5WLyk8TLA&s=10"
  ],
  "Island Paint QDE Signal Red Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYcFzw8ePk8A201uOpTp5d4CG7Uf6TSVALnLOkiUgC2w&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL_E1y1TLmoCeey7UmjNagyPK0dA59QOdmuZ6GW76yuQ&s=10"
  ],
  "Island Primer Red Oxide Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNbDyCJuLZX1P_e8QGjbtfBPEB09ZQns6OF4P01Jq0kg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi0g8qTxYNW8N8gmBDdYURKrZcCG_ezOTn0WFQTvc67Q&s=10"
  ],
  "Star Elastomer Paint Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYAH01v-_sU5P3VcqWdygSPXFoUG8PE5OLIO9fdELiCA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWoa8CjDd7oX_VRTwk_PmpsiNhcS_fP7H9fNKnZnS-yQ&s=10"
  ],
  "Boysen Roofkote Nut Brown Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd4R4uadtsYBDygSiC2S1ZIxvVnogbiFpbHCJScBPz8w&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgmKczc99T1znydPIDzFPyQQRT6Ih_XegwbM1LiP0m-A&s=10"
  ],
  "Boysen Roofkote Clear Blue Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNKxjhDZmPEPtdAT_X303iJcjqQwYEpzS43UkbAR6Stg&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_hqVrNflVzJIxwgN0vfkWmGlf6mBY2w04Vta5P7NGng&s=10"
  ],
  "PVC Blue End Cap Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoHGeE8CpBlacBv1NSYDKCBqUejemAOABVsEe-_ImMOQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9LSeZCTLupXKouqd8HCGCwLqcRww6gTm--EEiDI2mVg&s=10"
  ],
  "Rosco Telephone Shower Set Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2B_OOBSE_lxLuKsGLlALP6mD1KVXyr4Jb5RAogO272w&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS82YRkU_cUZ4rQQDPjJaL72ZTyfYfRmDqAayPDRtgCLQ&s=10"
  ],
  "Stainless Steel Kitchen Sink Single Bowl Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDDAzue7kuBs2CRIsd5q4oEe1y1uJrxwWotsQPVVvmNQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp50bvNYgxqHr0-eH9CaLbojYybTbCVyIIAik2FkGT1g&s=10"
  ],
  "Stainless Steel Floor Drain Trap Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb0OMfoeJnhwgIMkHxDpQpFItAiI2UhNkvmrS7JNMFJw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRB1ddEpqSL4KJg3XbXsVZKYUocijY12dafmuoQ8R16rg&s"
  ],
  "Teflon Thread Seal Tape Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_udX3ZrMChv-hZ7rOk-i88_JDfQzfAwQC_jBZgqoEFQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ94qKY34ggWdydrKPDlV9TlkWYoR-ubRpgtuePLsFMlA&s=10"
  ],
  "Water Pump Pressure Switch Square D Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoYoArRC3S_JY1IZxDnCnx6SLcl79Ea2MtRFzaWRDhwQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqMha6R1o9kJvFeyyIryZBG-OuKkc0-dKBrxPzNyVFWw&s=10"
  ]
};

const existing = JSON.parse(fs.readFileSync('real_hardware_images.json', 'utf8'));
const merged = { ...existing, ...batch4 };
fs.writeFileSync('real_hardware_images.json', JSON.stringify(merged, null, 2));
console.log(`real_hardware_images.json updated: now has ${Object.keys(merged).length} verified queries.`);
