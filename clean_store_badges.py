import urllib.request
from PIL import Image
import os

os.makedirs('storefront-app/public/images', exist_ok=True)

# 1. Clean Stikwel (Remove Baesa Colors)
url_stikwel = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS20uVYntzqz98IlF-MQ98PKdGrXRDy-isqGCJCY8B8rw&s=10'
urllib.request.urlretrieve(url_stikwel, 'stikwel_orig.jpg')
img_s = Image.open('stikwel_orig.jpg')
w, h = img_s.size
# Baesa Colors is top-right corner. The yellow jar is centered.
# Crop x: 0.15 to 0.85, y: 0.15 to 0.98
stikwel_crop = img_s.crop((int(w * 0.18), int(h * 0.16), int(w * 0.82), int(h * 0.98)))
stikwel_crop.save('storefront-app/public/images/stikwel_clean.jpg', quality=95)
print("Saved stikwel_clean.jpg (Baesa Colors removed)")

# 2. Clean Lacquer Flo (Remove Baesa Colors)
url_flo = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy0j52Yj_GUfQ7mJ61_TjK7c-UnpdIoCRbvrC3p-P8NQ&s=10'
urllib.request.urlretrieve(url_flo, 'flo_orig.jpg')
img_f = Image.open('flo_orig.jpg')
w, h = img_f.size
flo_crop = img_f.crop((int(w * 0.15), int(h * 0.15), int(w * 0.85), int(h * 0.98)))
flo_crop.save('storefront-app/public/images/lacquer_flo_clean.jpg', quality=95)
print("Saved lacquer_flo_clean.jpg (Baesa Colors removed)")

# 3. Clean Rosco Water Jug Faucet (Remove Ace Hardware)
url_rosco = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH7m3D3528b1j1x6h4z9m0g&s=10'
# We will use clean faucet packshot
print("Prepared clean assets")
