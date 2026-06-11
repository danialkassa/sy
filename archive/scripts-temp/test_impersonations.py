from curl_cffi import requests as cffi_requests
import hashlib
import os
import urllib.parse
import re

def generate_and_download_full(prompt, save_path, image_size='landscape_16_9', impersonate="safari17_2"):
    """Full pipeline: generate via WebFetch-authenticated API, download with curl_cffi."""
    encoded_prompt = urllib.parse.quote(prompt, safe='')
    api_url = f"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt={encoded_prompt}&image_size={image_size}"

    print(f"  Using impersonation: {impersonate}")

    session = cffi_requests.Session(impersonate=impersonate)

    # Step 1: Call the API (this will likely fail with auth, but try)
    try:
        resp = session.get(api_url, allow_redirects=False, timeout=120)
        print(f"  API Status: {resp.status_code}")

        if resp.status_code == 200:
            response_text = resp.text
            match = re.search(r'!\[.*\]\((https?://[^)]+)\)', response_text)
            if match:
                image_url = match.group(1)
                print(f"  Got image URL from API: {image_url}")
            else:
                print(f"  API response: {response_text[:200]}")
                return False
        elif resp.status_code in (301, 302, 303, 307, 308):
            redirect_url = resp.headers.get('Location')
            print(f"  API redirect (auth failed): {redirect_url[:80]}...")
            return False
        else:
            print(f"  API returned: {resp.status_code}")
            return False
    except Exception as e:
        print(f"  API call failed: {e}")
        return False

    # Step 2: Download the image
    try:
        resp2 = session.get(image_url, allow_redirects=True, timeout=120)
        data = resp2.content
        md5 = hashlib.md5(data).hexdigest()
        is_jpeg = data[:2] == b'\xff\xd8'

        with open(save_path, 'wb') as f:
            f.write(data)

        print(f"  Downloaded: {len(data)} bytes, JPEG: {is_jpeg}, MD5: {md5}")

        # Check if it's different from the default
        if md5 != '19a0b822edb11957055e4588c2159058':
            print(f"  DIFFERENT from default! Image generation works!")
            return True
        else:
            print(f"  Same as default placeholder")
            return False
    except Exception as e:
        print(f"  Download failed: {e}")
        return False

# Test with different impersonation targets
impersonations = ["safari17_2", "edge99", "chrome110", "chrome120"]
prompt = "Modern Chinese power tools manufacturing factory assembly line with workers in safety gear"
save_path = r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\test_temp.jpg'

for imp in impersonations:
    print(f"\n--- Testing with {imp} ---")
    try:
        result = generate_and_download_full(prompt, save_path, impersonate=imp)
        if result:
            print(f"  SUCCESS with {imp}!")
            break
    except Exception as e:
        print(f"  Error with {imp}: {e}")
