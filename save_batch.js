const fs = require('fs');

const initialData = {
  "C-purlins Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs0xq8LSZ1RbLaY3gZz6I97DZTkMaU0_Jtpf9GEtbAqQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5cWo_0PrRcO4G0PuIPXdnnIzhkJzfS3KPlc7MjvV5pA&s=10"
  ],
  "Island Paint QDE Nile Green Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYcFzw8ePk8A201uOpTp5d4CG7Uf6TSVALnLOkiUgC2w&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU9HdwlZGlQW9x7l7OVOa5H9rTAjHdFrzJw6U0hTFbew&s=10"
  ],
  "Shark SF2408 Faucet Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQojkoa6wdoHRjgflkt8ggWM9xmVJH4Rw4oTLnEtvhKDg&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8cThDinHQpTlLT95U0UcBiUzqEpKW_pBPgrlt8pszXQ&s"
  ],
  "Boysen Permacoat Flat Latex White Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9XMJRZV8QrW6xzO8oLfF3MSobAXdDGO9IE-2mV6D9wQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT18bzkvPf8ul0gcbM2gIUNLGNaE1_WIgulhItkhXyNtA&s=10"
  ],
  "Amerilock Hinges Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrZUqYIkHf4H8Jq4QbtkdF5a2RLp_Zx7jr-uZcBIFB1A&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSz4tCLHTcQwymaBuAZLnMXmx_hI7q8I64jiw_ZO2S4Q&s=10"
  ],
  "Plain Bar 16mm Steel Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1t0HUFpqAwdW9b_jaU77V8Ez9XWmRaXSQ9PYqVgoiWw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8fjAukpbTZO7GajPWrYT6IRarUatNGmul0om-lI5xMg&s=10"
  ],
  "Polycarbonate Roofing Sheet Twinwall Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQQBYfxFl1-kSo3EtnQrJ2X-16IzxJWKwA52wXJBMl7Q&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx492ZMmeTul3qS1vwkGeeNuAnjQwxrE791tVn8uVU_w&s=10"
  ],
  "Island Paint QDE Pink Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4SaqrI9t0zu1SIjunF4uSTrMJzv3k3UBfnvuTNBi-QA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbLMXNeE1web0Yh-ijgd9YkDlpu_wRxTR3AyS0kvzpng&s=10"
  ],
  "Boysen Roofkote Baguio Green Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYXjS3tbfu0GuG4ddbW-s5dXrAfvrIX7pe0GCHDLHpZQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbgTpxDihoS0bufJU391YTkRAI83zTZ5iq6LNQEnnD-w&s=10"
  ],
  "Boysen Acrytex Cast Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjYfaqao04Z9tPJQKa5cpZR0GYMUABleVSeVlnhJb1oQ&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUQ5ytxAAGeRa1mqMbpMLpzF3zLJKMYn_Dd6wHB5YP5Q&s=10"
  ],
  "Stikwel Wood Glue Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS20uVYntzqz98IlF-MQ98PKdGrXRDy-isqGCJCY8B8rw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQusinmcdT_DgORoRMS23Irh_czkeIgF0gOoh7BNau_pw&s=10"
  ],
  "Makita Planer Blade Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeARUcm5hC9Zqi-Y8bdC16kHA_adl2FKQCEZUUCcl4QA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZe6Y0Md01oi7Q5ONW8iw7OWV3B2tRmvJUE_XFXLhVag&s"
  ],
  "Dewalt Drill Bit Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTt52-kJM5uOrV00z7ZaEIK-xGZDm-ywQKWZ4Y9GXvbsA&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtN8BoyzQai56BUBZ4PNiS8R0SR-nr6y6dnSxFOlRgdA&s=10"
  ],
  "Pitcher Pump Champion Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRODOsUAJ6tlvU6yrrgaNidVZ1K3WFtW0oENWwJ58X_A&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMQz4-yc3cabP2c63YOky7W-u08gGRMdUo49iKoZaTuQ&s=10"
  ],
  "Gypsum Screw Black Philippines": [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgpz4mFUqO9YpMuCy6Ycu_f7yTvQ0bO7BTRHwwmT-iyw&s=10",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBmVAm4csd38Tbi30j8ZIzKGZg8_ns4sQCnmdET9RRTA&s=10"
  ]
};

let existing = {};
try {
  existing = JSON.parse(fs.readFileSync('real_hardware_images.json', 'utf8'));
} catch (e) {}

const merged = { ...existing, ...initialData };
fs.writeFileSync('real_hardware_images.json', JSON.stringify(merged, null, 2));
console.log(`real_hardware_images.json has ${Object.keys(merged).length} verified queries.`);
