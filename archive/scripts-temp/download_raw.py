import requests
import urllib.parse
import ssl
import os
import hashlib
import re
import sys
import warnings
warnings.filterwarnings('ignore')

def download_raw_image(short_url, save_path):
    """Download the raw image without the template processing."""
    session = requests.Session()
    session.verify = False
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
    })

    # Step 1: Get redirect URL
    resp1 = session.get(short_url, allow_redirects=False, timeout=120)
    print(f"  Step 1 Status: {resp1.status_code}")

    if resp1.status_code not in (301, 302, 303, 307, 308):
        print(f"  No redirect, status: {resp1.status_code}")
        return False

    redirect_url = resp1.headers.get('Location')
    print(f"  Original redirect: {redirect_url}")

    # Try downloading the original URL first
    print("\n  --- Attempt 1: Original URL ---")
    resp2 = session.get(redirect_url, allow_redirects=True, timeout=120,
                       headers={'Referer': short_url})
    print(f"  Status: {resp2.status_code}, Size: {len(resp2.content)}, MD5: {hashlib.md5(resp2.content).hexdigest()}")

    # Try removing the template part
    if '~' in redirect_url:
        raw_url = redirect_url.split('~')[0] + '?' + redirect_url.split('?')[1] if '?' in redirect_url else redirect_url.split('~')[0]
        print(f"\n  --- Attempt 2: Raw URL (no template) ---")
        print(f"  Raw URL: {raw_url}")
        try:
            resp3 = session.get(raw_url, allow_redirects=True, timeout=120,
                               headers={'Referer': short_url})
            print(f"  Status: {resp3.status_code}, Size: {len(resp3.content)}, MD5: {hashlib.md5(resp3.content).hexdigest()}")
            if resp3.status_code == 200 and resp3.content[:2] == b'\xff\xd8' and len(resp3.content) != 176626:
                print(f"  Different image found! Saving...")
                with open(save_path, 'wb') as f:
                    f.write(resp3.content)
                return True
        except Exception as e:
            print(f"  Failed: {e}")

    # Try with different template
    if '~tplv-' in redirect_url:
        # Replace template with a different one
        alt_url = re.sub(r'~tplv-[^.]+-image\.image', '~tplv-m4oh9fb5rh-origin.image', redirect_url)
        print(f"\n  --- Attempt 3: Origin template ---")
        print(f"  Alt URL: {alt_url}")
        try:
            resp4 = session.get(alt_url, allow_redirects=True, timeout=120,
                               headers={'Referer': short_url})
            print(f"  Status: {resp4.status_code}, Size: {len(resp4.content)}, MD5: {hashlib.md5(resp4.content).hexdigest()}")
            if resp4.status_code == 200 and resp4.content[:2] == b'\xff\xd8' and len(resp4.content) != 176626:
                print(f"  Different image found! Saving...")
                with open(save_path, 'wb') as f:
                    f.write(resp4.content)
                return True
        except Exception as e:
            print(f"  Failed: {e}")

    # Save the original anyway
    with open(save_path, 'wb') as f:
        f.write(resp2.content)
    print(f"\n  Saved original: {len(resp2.content)} bytes")
    return True

if __name__ == '__main__':
    url = sys.argv[1]
    save_path = sys.argv[2]
    download_raw_image(url, save_path)
