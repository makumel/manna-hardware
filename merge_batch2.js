const fs = require('fs');

const batch2 = {
  "PVC Blue Elbow 90 Degree Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNvkJFN91Stxvw0raoiE9lHg_JBAjSrqzDjDEKbiyQQQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSV3KLjxrTsBG-nuLKStM8grKqwhv7DmuNc1bb_83PenQ&s"
  ],
  "PVC Blue Tee Fitting Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKP0nJWmr8GUm6l1aHt8o2WWqP2cqkL620UAM4SMMRLw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM-6rzTN9rAjg7tM9Dw6mdNA_qn8eTGuQRRAi0pNr7qw&s"
  ],
  "PVC Blue Male Adaptor Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRD24A-aEbKAooOVdmAVHiiL8gIo4f_rLn1Y6CVRW-PGw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRachyBZPxmdsvmsvIwaisuvhRYF8GKnw80bRyUzVEE0Q&s=10"
  ],
  "Shark Faucet Shower Plumbing Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMBcBMe36N8STn5o9APVrsvp_sxkc6_etf9bPthpHDVQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKzqSzNzo22oOfHRkHv9T1ro2zS48lo3awCBXvb36QTQ&s=10"
  ],
  "Blind Rivets Aluminum Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZ5DEO_PQxUB_PfSOLz378-0P_eJJ_WB5xJRiBX3c3Yw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVKtUhKf21P6up7GQppTFNlLVSAJVbfPh0a4YPiiopSA&s"
  ],
  "PVC Blue Union Patente Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_CxqKVbV-VNWSxEet-q_PBPIOlxOTALLIzjYKgXL4qg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2n4p2sAxQFluQQaCuYnMBytuneqlpYPWsNVBf6BTrNw&s=10"
  ],
  "Waterproof Silicon Carbide Sandpaper Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIz9e2HzT4HtMo_Nt_NcB5C8cPirlehGM9CHNiVAnX0Q&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTmf52KUIBKm6-iMir0J4g-CKwUOmUofqbRz2TOr6AhA&s=10"
  ],
  "PVC Ball Valve Industrial Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqVeqjRnRXlfVMiDVHEuxnFZIIVLD4b-DRqpzLDH6oqw&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuZ6hXE1ktJ1wlT4DxEbmXUZgSjsUXnEcZR0RZ6dnNJA&s"
  ],
  "PVC Blue Plug End Cap Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYVjDHYR0F2m53TtuWlsGfjmMDeT78886AkrVTE-ICHg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkp7zHR3InJbLGOmFdbZOfCdt1_0_C1QSb1ez6kM6T4w&s=10"
  ],
  "Stainless Steel Hose Clamp Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbN1PXzpr76owdim4W76LiH_8hq6KafDsJ-vsOU2S2Cg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfaosjy2STeg7LBppeclGtDK1e4b9AzXs2QlcXonbvUg&s=10"
  ],
  "Amerilock Hinges Lockset Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRl_Iu3X9no-_Anvaf4cvWNH0GM4wxcmJxIcLpVKvVidA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxnbQOXA3VKPK9F9mO5eZo2wvKKevUZeTyHHbTvX_MsA&s"
  ],
  "Foot Valve Brass Plumbing Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK2Og1ilgfsSx05jAwd9ksLPwBTFlNKtfY7Qu5y8A0-g&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUudJ4_NqLPdBrohK2smD__eHqcZa0E9bx9eT7S1U9GQ&s=10"
  ],
  "Swing Check Valve Brass Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXGtTVgWVLyfwSMDrvrRyv9WFSEM5_VZw6avKbzhbTQw&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD5e7IeQ0Tfy_6drLTh49qu6wyvRSZqMoVmXA-IgcnYQ&s=10"
  ],
  "Gate Valve Brass Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF83Sfm8--JJ22U8yOa21RWhMkT8uTufwBKtufCcFAjw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1_ABD4alNe6-AE6n9CbVMlB7B_226YZZpsyDqWBcPMQ&s=10"
  ],
  "Miniature Circuit Breaker Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRe1V8WHbM1En2tIJe7MZu_kBEB96vZY1oGHl4pQPGX2w&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRP3z-BX8hVFZ9owS2h1HSth2-WHyR9D2CngS4TqoIo3g&s=10"
  ]
};

const existing = JSON.parse(fs.readFileSync('real_hardware_images.json', 'utf8'));
const merged = { ...existing, ...batch2 };
fs.writeFileSync('real_hardware_images.json', JSON.stringify(merged, null, 2));
console.log(`real_hardware_images.json updated: now has ${Object.keys(merged).length} verified queries.`);
