const fs = require('fs');

const batch5 = {
  "Galvanized Iron GI Nipple Fittings Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuRghx-om8BG3tjAlNJ92J02g9ZkCKcSEnuTWAOMtj7w&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpj9pFTrj_2l_5c2PEeCdFvdcFB6ls6zA9CQ_upQQCVw&s=10"
  ],
  "Boysen Oil Tinting Colors OTC Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3c4IngjAQ7ENJ6qfKgy4K1Y9EVn8sRjNykeww1vZ1tg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjgVayvge1gPtRXa-luAiTRJzsyi2M7LF8ezE4HFjOiA&s=10"
  ],
  "Island Oil Tinting Color Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQavGfBbGTZ21TwjWvWHd2cOP9XAMOechQwTdc6Os3h0Q&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeTvyfOL8zZW9etwx_XNWYmqYHnfSyRLgs-jR8QHGc2Q&s=10"
  ],
  "Carborundum Sharpening Stone Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSh5St25RSkLWpVYka5o7t9VX4THg1Ti_freYZfMexJXQ&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQA2MZJ0Bxb4eJNdG3TQnRqebKC7mtlksinj1dLVwqjCw&s=10"
  ],
  "Wood Handsaw Hand Tool Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmJSv_nZD4zSg0ahYP9A1J5Mkgf4ck0MeumuObHB-PEA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvI2267vAcsA6rv0BnRwIAFIuIjXVxkGFtPVLNvVobVA&s=10"
  ],
  "Dormer HSS Drill Bit Heavy Duty Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrNjK2zUdAS_rs7m52lzPEIqx8r_bPFAuqAM9p_EFT_g&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX4k1DWV8GGKgz_pMAAvdkTkUgYfl_TbFQKsJ7fyiG0g&s=10"
  ],
  "Wood Chisel Set Hand Tools Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNRbR0MsWmlgI988ZNjpehKUP9gNpzOZH-S_SUeVxHug&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQd0xEAvx-gMd9njLbxgQ75gFbEr9ODDrO8nOLQFdEJcA&s=10"
  ],
  "Cold Chisel Pointed Flat Metal Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSk-RYIZ2mx5USxj_BAyPsBZBlHH6hUMLgm3vChab2h0g&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsg4Mtne8ZhW1ySNJSZ2Q9XTnqY0N0qTxFMqUeGJPZQA&s"
  ],
  "EMT Conduit Coupling Electrical Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtCmzElx280QD9C0T6xkToYYTb1vfe8wK9231IIaTalg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGq8QXglilFN8HfnwBVlTKYMihGn3QU4UviTB6Ix7ZlQ&s=10"
  ],
  "Service Entrance Cap Electrical Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH0g6sU4v5j6plXasLMiGORmmmnwMA4DhAJC9OHthB6w&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi0Rqhrt6WYS5nSGtCF_i6LOJ1vt30fk0EBdmxqnnCAg&s=10"
  ],
  "Magnetic Door Catches Cabinet Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY152y6ZrhIcGK_dd91BDgzaFZ6qGQo1aWijVcYs_cLw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdMYn9gstf5RZDgQsJYyMGrnRWcV1uCf6mm2rEqd6V1g&s=10"
  ],
  "Long Nose Pliers Heavy Duty Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm2qttV5DSPIbdjURY4D5dqr24AXdPJTK1hPPwvbAzoQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYyfQKJPee0ulgBf-HlXVGZBuvl-jroTNLvSVngUUVoA&s=10"
  ],
  "Tin Snips Sheet Metal Cutter Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQftn_aXu11qkaQgL10ZBSmL5mTcBK1zwMJh-llKcC0XA_ataxyh2Gpnzo&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnTSkf722uuvYLmrdpSJkcgv8t31lbxYlfuZuvPEt5aw&s"
  ],
  "Diamond Cutting Disc Angle Grinder Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5yv1DQu-fDM82dL9yzmvyzdK5K49enpmLHCf1n0hRog&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEcqxF5pMxA8cqvC1bJWHz42eERu9_RD00iv9A0uv2Jg&s=10"
  ],
  "Electric Soldering Iron 40W 60W Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGBzJAPJH0K8V2Af6kqr_6bn5BzeSq-rbSinjF0Wn6BQ&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-CHbeFGj5nPe4lOsOXcNsMZ92f57GhwkqRN-Tz_L9xQ&s=10"
  ],
  "LPG Gas Hose Heavy Duty Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzbGugeq59yBpSPoHkuwzYoZhKyYuq2ZcbWHFoYEzFgA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREywgL-8ph7T0405RjR3uYVuRJdXDm6X14oa5KuYizUQ&s=10"
  ],
  "Gooseneck Kitchen Faucet Flexible Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQomQgdpE57iz0MVIHDUrQMwQWA4Ziu8PxW9PSKstA1uw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC1M_lfgU35O13fxm_wTLDjGt3BSpVkbVZjBD4oPf79A&s"
  ],
  "Plumb Bob Brass Magnetic Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYoQceau04EhTdGmu1amFa__bTBkC8hr5rn_kTiCY-sA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW9B2yKfIsCaNDO8nptB3rKvc7LMkOaDUXLfzCP45SEw&s=10"
  ],
  "Safety Hasp and Staple Door Lock Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQqcXiu9y-yeg6HzRS2Qr8IQXb7K6c6lJlhSVjbp7kFw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxU20p9dtbk2caNaQzfM5bUN1rvM-buuxAWTaNNkfhHQ&s"
  ],
  "Tek Screw Self Drilling Hex Head Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqSdaq5-ug-rKshD2r6MLqIW26micitUqnH-TCw2adRw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRc8BygQ_u8F--hSfeUnQH3M29kt304Td2hgJb3goWhog&s=10"
  ]
};

const existing = JSON.parse(fs.readFileSync('real_hardware_images.json', 'utf8'));
const merged = { ...existing, ...batch5 };
fs.writeFileSync('real_hardware_images.json', JSON.stringify(merged, null, 2));
console.log(`real_hardware_images.json updated: now has ${Object.keys(merged).length} verified queries.`);
