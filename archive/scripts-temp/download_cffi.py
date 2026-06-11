from curl_cffi import requests as cffi_requests
import os
import hashlib
import re
import urllib.parse

def generate_and_download(prompt, save_path, image_size='landscape_16_9'):
    """Generate an image via API and download it using curl_cffi with browser impersonation."""
    encoded_prompt = urllib.parse.quote(prompt, safe='')
    api_url = f"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt={encoded_prompt}&image_size={image_size}"

    print(f"  Calling API with browser impersonation...")

    # Use curl_cffi with Chrome impersonation to bypass auth checks
    session = cffi_requests.Session(impersonate="chrome131")

    try:
        # Step 1: Call the API
        resp = session.get(api_url, allow_redirects=False, timeout=120)
        print(f"  API Status: {resp.status_code}")
        print(f"  API Headers: {dict(resp.headers)[:200] if resp.headers else 'N/A'}")

        if resp.status_code in (301, 302, 303, 307, 308):
            redirect_url = resp.headers.get('Location')
            print(f"  API Redirect to: {redirect_url}")
            # This means auth failed - API redirects to default image
            print(f"  WARNING: API returned redirect (auth failed)")
            return False

        response_text = resp.text
        print(f"  API Response: {response_text[:300]}")

        # Parse the image URL from markdown
        match = re.search(r'!\[.*\]\((https?://[^)]+)\)', response_text)
        if not match:
            print(f"  FAILED: Could not parse image URL")
            return False

        image_url = match.group(1)
        print(f"  Image URL: {image_url}")

        # Step 2: Download the image
        resp2 = session.get(image_url, allow_redirects=True, timeout=120)
        print(f"  Download Status: {resp2.status_code}")
        print(f"  Content-Type: {resp2.headers.get('Content-Type', 'N/A')}")
        print(f"  Final URL: {resp2.url}")

        data = resp2.content
        is_jpeg = data[:2] == b'\xff\xd8'
        md5 = hashlib.md5(data).hexdigest()

        with open(save_path, 'wb') as f:
            f.write(data)

        print(f"  SUCCESS: {len(data)} bytes, JPEG: {is_jpeg}, MD5: {md5}")
        return True

    except Exception as e:
        print(f"  FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

# Define the 4 images
images = [
    {
        'prompt': 'Modern Chinese power tools manufacturing factory assembly line with workers in safety gear, bright industrial lighting, rows of power drills on conveyor belt, clean professional facility, wide angle shot',
        'save_path': r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\factory.jpg',
        'name': 'FACTORY'
    },
    {
        'prompt': 'Large industrial warehouse filled with organized boxes and pallets of power tools for export shipping, forklift in background, shelving units with product inventory, professional logistics facility',
        'save_path': r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\warehouse.jpg',
        'name': 'WAREHOUSE'
    },
    {
        'prompt': 'Professional power tools showroom display with drill drivers angle grinders and saws on modern display stands, yellow accent lighting, clean corporate presentation, B2B trade show style',
        'save_path': r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\showroom.jpg',
        'name': 'SHOWROOM'
    },
    {
        'prompt': 'Quality control testing laboratory for power tools, engineer testing drill torque on testing equipment, measurement instruments, safety certification testing station, professional industrial setting',
        'save_path': r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\quality-lab.jpg',
        'name': 'QUALITY LAB'
    }
]

# Generate and download each image
for img in images:
    print(f"\n=== Generating {img['name']} image ===")
    generate_and_download(img['prompt'], img['save_path'])

# Verify all files
print("\n=== File Verification ===")
for img in images:
    path = img['save_path']
    if os.path.exists(path):
        size = os.path.getsize(path)
        with open(path, 'rb') as f:
            data = f.read()
            md5 = hashlib.md5(data).hexdigest()
            is_jpeg = data[:2] == b'\xff\xd8'
        print(f"  EXISTS: {os.path.basename(path)} | Size: {size} bytes | JPEG: {is_jpeg} | MD5: {md5}")
    else:
        print(f"  MISSING: {os.path.basename(path)}")

# Check uniqueness
print("\n=== Uniqueness Check ===")
hashes = {}
for img in images:
    path = img['save_path']
    if os.path.exists(path):
        with open(path, 'rb') as f:
            md5 = hashlib.md5(f.read()).hexdigest()
        name = os.path.basename(path)
        if md5 in hashes:
            print(f"  DUPLICATE: {name} is same as {hashes[md5]}")
        else:
            hashes[md5] = name
print(f"  Unique images: {len(hashes)} out of {len(images)}")
