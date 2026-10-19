const fs = require('fs');

const batch3 = {
  "Wire Cup Brush Angle Grinder Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQX_Mly5Zq1XI2ccViYAOCUwWHIbL-NmfomyIx5Fm4LxQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1iWkOQi8WKM27W_QQXkkVQTh_voV1ZSyljNXpg4a1Ug&s=10"
  ],
  "Concrete Nails Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaKeDgoBYKvtcXlzJqZ6ykTRY-aZTGcrncCCpivqziZQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsA4v6R7cJqdgzWN1n2-awCJd5V7uNgn4M8v1Q4KRiWQ&s=10"
  ],
  "Hook and Eye Brass Hardware Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu26c6a41yeL56BUK0H9FiS9x0yqLQCyko_PofmuwbzQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrYRbNJEdCC3LRdda3OVFfDhPoIKSOownH6aiiKSn3Zg&s=10"
  ],
  "Combination Wrench Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRU8gcTG_mzh1NtQ0qSAUWIB_ncbM-8GLLh7sDtwIyN4g&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWKUIeS-cYEhOLOcRwajcj77VfMOanZOJcl_fqQcRPSQ&s=10"
  ],
  "Lavatory Hose LAMCO Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbngxaoQVxblvEDvSFrPMlzoLacP4Zicq7RZ2wVdLxbg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRS6fHREaY1HCL5sXBGrb7ng5iyQoSM0aHWPI2gcDx1TA&s=10"
  ],
  "Screen Door Spring Heavy Duty Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGlm05MBwh_lpqS6PJPaMfeGqEKiVjS441Cg-ZheLdpw&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9_nS1KnsF3FaIC6G8kaqUu7IkoFpcA9mHnHSh0ygJfg&s"
  ],
  "Flap Disc Grinding Wheel Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ9SaaaVkH0bPH6YOXjSYLM8-hyKHOjv6BZeesYrvdsA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRz9eGkN4HMGJbPaKh5cbHL-7ywD40w_lUSdOBxxnXyg&s=10"
  ],
  "Steel T-Bar I-Bar Construction Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpMTWLkErseXIKRUzuwGQsemt6UyTMpr3wVHU2UNSfIA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1_t6KfXLZ8wIbD-5I1hJM-mg7GOt41cGYWSNnhLGk9A&s=10"
  ],
  "Angle Bar Steel Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyobaL2JH6cYUvRsRg_DbY5Tgr53fGWTW9hL1SW0ID4Q&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgJRIkUfcGEXfVempqe1Z6mBmYuPOKZkWtDQzrJ4r0Lg&s=10"
  ],
  "Boysen Clear Gloss Lacquer Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsrh_7cQMfvPsRVzyC4n3CUn4WjLiLfC8ARuyIaYu_Bw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIXvVCHRIAN5Rsr0cfvMeMsfUVM4PNU4kPBLcSHfMn7g&s=10"
  ],
  "Paint Roller Brush with Tray Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLP0-jvATTKCmqQpAMcbb8ezoXo3nRoZ6MNc3WjF-uOA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLTKhk_lG7-QwSAG8lOhiqqPeMgTstErDhPyDY3wY8fw&s=10"
  ],
  "Finishing Nails Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKVuZJBXj95X8EU2OqXCdIPcItKI2zEnvAVOVi2JCM_g&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQLQjd6TFIDIbyqWC9Li4OvEMM9d36M8nI-IkROmcpMA&s=10"
  ],
  "Hasp Lock PH Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-R061ewoxoYRlJ-P9Sd_Yo8_ToWPaLbVHDEQ3YaWA8Q&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmQ-dFloI_g2nueD07hvrq4Zg0ERhzWyOENR6YGBo2kA&s=10"
  ],
  "Hose Coupling Metal Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrWeKp2ix4vbGEc_q8MDDy44gE-nnGjw8QKsqPsazr5A&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWubzkomn7ZTJA94oZ3TCG5tSfpRQJf4CdtwSB0zlN1Q&s=10"
  ],
  "Screw Insulator Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWNSUhefu_d89mki-3iMX9asf1EWVHuGjf5pjsTGfrTg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpQY5NgaIXlcFL7JejOGUOT77lx0S9GN2A3lXObfwU4A&s"
  ]
};

const existing = JSON.parse(fs.readFileSync('real_hardware_images.json', 'utf8'));
const merged = { ...existing, ...batch3 };
fs.writeFileSync('real_hardware_images.json', JSON.stringify(merged, null, 2));
console.log(`real_hardware_images.json updated: now has ${Object.keys(merged).length} verified queries.`);
