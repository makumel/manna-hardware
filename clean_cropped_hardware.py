import urllib.request
from PIL import Image
import os

os.makedirs('storefront-app/public/images', exist_ok=True)
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# 1. Clean Pressure Switch (Remove DT-HOME.PH)
url_ps = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1QkjwmYk5g3roBEWW3O7lrVx_6Iv62FwOSttX25CfhQ&s'
urllib.request.urlretrieve(url_ps, 'ps_orig.jpg')
img_ps = Image.open('ps_orig.jpg')
w, h = img_ps.size
# DT-HOME.PH is in top 20%, "BEST SALE" is bottom 25%
# Crop center pressure switch
ps_crop = img_ps.crop((int(w * 0.10), int(h * 0.18), int(w * 0.85), int(h * 0.78)))
ps_crop.save('storefront-app/public/images/pressure_switch_clean.jpg', quality=95)
print("Saved pressure_switch_clean.jpg (DT-HOME.PH removed)")

# 2. Clean Floor Drain (Remove COMFY)
url_fd = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFyHWo8JhuVYQFilOIe9rTVoWYHYEYf0xsHHMP29_H5g&s=10'
urllib.request.urlretrieve(url_fd, 'fd_orig.jpg')
img_fd = Image.open('fd_orig.jpg')
w, h = img_fd.size
# COMFY is top-right corner. The drain is center-left.
# Crop x: 0 to 0.75, y: 0.15 to 0.85
fd_crop = img_fd.crop((int(w * 0.05), int(h * 0.12), int(w * 0.75), int(h * 0.88)))
fd_crop.save('storefront-app/public/images/floor_drain_clean.jpg', quality=95)
print("Saved floor_drain_clean.jpg (COMFY removed)")

# 3. Clean Safety Hasp (Remove FAR EASTERN HARDWARE & LUCKY)
url_hasp = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRXDjvv6eGomgOQVF5ZcRfOmCKw1zNxkKDQaOh6XkomA&s=10'
urllib.request.urlretrieve(url_hasp, 'hasp_orig.jpg')
img_hasp = Image.open('hasp_orig.jpg')
w, h = img_hasp.size
# FAR EASTERN HARDWARE is at bottom right (x > 0.65, y > 0.80)
# Stanley is at top left.
# Crop the center black and chrome hasps
hasp_crop = img_hasp.crop((int(w * 0.10), int(h * 0.15), int(w * 0.85), int(h * 0.80)))
hasp_crop.save('storefront-app/public/images/safety_hasp_clean.jpg', quality=95)
print("Saved safety_hasp_clean.jpg (FAR EASTERN removed)")

# 4. Clean Plumb Bob (Remove LUCKY online depot)
# Let's crop the actual plumb bob tool cleanly without the store header
url_pb = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2DTfW0doxqzpUfXBXNiAQz7eZY6n-frwPmkFq54p9hw&s'
urllib.request.urlretrieve(url_pb, 'pb_orig.jpg')
img_pb = Image.open('pb_orig.jpg')
w, h = img_pb.size
# Crop the blister pack tool
pb_crop = img_pb.crop((int(w * 0.20), int(h * 0.15), int(w * 0.85), int(h * 0.88)))
pb_crop.save('storefront-app/public/images/plumb_bob_clean.jpg', quality=95)
print("Saved plumb_bob_clean.jpg (LUCKY removed)")
