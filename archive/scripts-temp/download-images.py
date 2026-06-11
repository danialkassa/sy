import urllib.request
import urllib.parse
import ssl
import os
import hashlib
import re
import json

# Create SSL context
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def generate_and_download(prompt, save_path, image_size='landscape_16_9'):
    """Generate an image via API and download it immediately."""
    encoded_prompt = urllib.parse.quote(prompt, safe='')
    api_url = f"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt={encoded_prompt}&image_size={image_size}"

    print(f"  Calling API...")

    # Use headers similar to what WebFetch would send
    req = urllib.request.Request(api_url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'identity',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    })

    # Don't follow redirects - we want to see the actual response
    class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    opener = urllib.request.build_opener(NoRedirectHandler, urllib.request.HTTPSHandler(context=ctx))

    try:
        resp = opener.open(req, timeout=120)
        response_data = resp.read()
        content_type = resp.headers.get('Content-Type', '')

        print(f"  Status: {resp.status}")
        print(f"  Content-Type: {content_type}")
        print(f"  Response length: {len(response_data)}")

        # Check if response is binary (JPEG)
        if response_data[:2] == b'\xff\xd8':
            print(f"  Got JPEG directly ({len(response_data)} bytes)")
            with open(save_path, 'wb') as f:
                f.write(response_data)
            md5 = hashlib.md5(response_data).hexdigest()
            print(f"  SUCCESS: {len(response_data)} bytes, MD5: {md5}")
            return True

        # Try to decode as text
        response_text = response_data.decode('utf-8', errors='replace')
        print(f"  Response text: {response_text[:300]}")

        # Parse the image URL from markdown: ![](URL)
        match = re.search(r'!\[.*\]\((https?://[^)]+)\)', response_text)
        if match:
            image_url = match.group(1)
            print(f"  Image URL: {image_url}")

            # Download the image from the CDN
            req2 = urllib.request.Request(image_url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Referer': api_url,
            })
            with urllib.request.urlopen(req2, context=ctx, timeout=120) as resp2:
                print(f"  Download Status: {resp2.status}")
                print(f"  Content-Type: {resp2.headers.get('Content-Type', 'N/A')}")
                print(f"  Final URL: {resp2.url}")

                data = resp2.read()
                with open(save_path, 'wb') as f:
                    f.write(data)

                md5 = hashlib.md5(data).hexdigest()
                print(f"  SUCCESS: {len(data)} bytes, MD5: {md5}")
                return True

        # Try parsing as JSON
        try:
            json_resp = json.loads(response_text)
            print(f"  JSON response: {json.dumps(json_resp, indent=2)[:500]}")
            if 'url' in json_resp:
                image_url = json_resp['url']
            elif 'data' in json_resp and 'url' in json_resp['data']:
                image_url = json_resp['data']['url']
            elif 'image_url' in json_resp:
                image_url = json_resp['image_url']
            else:
                print(f"  FAILED: Could not find image URL in JSON response")
                return False
        except json.JSONDecodeError:
            print(f"  FAILED: Response is not JSON or markdown with image URL")
            return False

    except urllib.error.HTTPError as e:
        print(f"  HTTP Error {e.code}: {e.reason}")
        if e.code in (301, 302, 303, 307, 308):
            redirect_url = e.headers.get('Location')
            print(f"  Redirect to: {redirect_url}")
        # Read error body
        try:
            error_body = e.read().decode('utf-8', errors='replace')
            print(f"  Error body: {error_body[:500]}")
        except:
            pass
        return False
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
