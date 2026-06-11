from PIL import Image
import os

# Check the image
img_path = r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\factory.jpg'
img = Image.open(img_path)
print(f"Dimensions: {img.size}")
print(f"Mode: {img.mode}")
print(f"Format: {img.format}")

# Check if it's a blank/uniform image
import numpy as np
arr = np.array(img)
print(f"Min pixel: {arr.min()}, Max pixel: {arr.max()}")
print(f"Mean pixel: {arr.mean():.1f}")
print(f"Std dev: {arr.std():.1f}")

# Check if it has meaningful content (not just a solid color)
unique_colors = len(np.unique(arr.reshape(-1, arr.shape[-1]), axis=0))
print(f"Unique colors: {unique_colors}")

# Sample some pixels from different regions
h, w = arr.shape[:2]
regions = {
    'top-left': arr[0:h//4, 0:w//4],
    'center': arr[h//4:3*h//4, w//4:3*w//4],
    'bottom-right': arr[3*h//4:, 3*w//4:]
}
for name, region in regions.items():
    print(f"  {name} mean: {region.mean():.1f}, std: {region.std():.1f}")
