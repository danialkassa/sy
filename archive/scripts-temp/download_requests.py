import requests
import urllib.parse
import ssl
import os
import hashlib
import re
import sys
import warnings
warnings.filterwarnings('ignore')

# Generate all 4 images using WebFetch-style approach
# We need to call the API with proper authentication

# Since the API requires authentication that only WebFetch provides,
# we'll use the URLs that were already obtained via WebFetch

def download_with_requests(url, save_path):
    """Download image using requests library with session."""
    session = requests.Session()
    session.verify = False
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    })

    try:
        # First request: get redirect URL
        resp1 = session.get(url, allow_redirects=False, timeout=120)
        print(f"  Step 1 Status: {resp1.status_code}")

        if resp1.status_code in (301, 302, 303, 307, 308):
            redirect_url = resp1.headers.get('Location')
            print(f"  Redirect to: {redirect_url}")

            # Second request: download from redirect URL with Referer
            resp2 = session.get(redirect_url, allow_redirects=True, timeout=120,
                              headers={'Referer': url})
            print(f"  Step 2 Status: {resp2.status_code}")
            print(f"  Final URL: {resp2.url}")
            print(f"  Content-Type: {resp2.headers.get('Content-Type', 'N/A')}")

            data = resp2.content
        elif resp1.status_code == 200:
            data = resp1.content
        else:
            print(f"  FAILED: HTTP {resp1.status_code}")
            return False

        with open(save_path, 'wb') as f:
            f.write(data)

        md5 = hashlib.md5(data).hexdigest()
        is_jpeg = data[:2] == b'\xff\xd8'
        print(f"  SUCCESS: {len(data)} bytes, JPEG: {is_jpeg}, MD5: {md5}")
        return True

    except Exception as e:
        print(f"  FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

# Test with a known URL
if len(sys.argv) >= 3:
    url = sys.argv[1]
    save_path = sys.argv[2]
    download_with_requests(url, save_path)
else:
    print("Usage: download_requests.py <url> <save_path>")
