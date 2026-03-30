from PIL import Image
import os
import io

img_path = r'C:\Users\91842\.gemini\antigravity\brain\ade93c19-dbf0-4ef6-9acf-4e191ffd8be3\real_car_marker_1774782457183.png'
out_path = r'..\frontend\public\real_car_marker.png'

print('Processing:', img_path)
img = Image.open(img_path).convert('RGBA')

# Convert purely to image transparency matrix
pixels = img.load()
for y in range(img.height):
    for x in range(img.width):
        r, g, b, a = pixels[x, y]
        # Any very dark pixel becomes smoothly transparent (making a cool drop shadow)
        if r < 30 and g < 30 and b < 30:
            pixels[x, y] = (0, 0, 0, 0)

# Crop the transparent borders tightly
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)

# Resize so it perfectly fits Leaflet without scaling artifacts
img = img.resize((48, int(img.height * (48 / img.width))), Image.LANCZOS)
img.save(out_path, 'PNG')
print('Done saving to', out_path)
