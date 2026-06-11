from curl_cffi import requests as cffi_requests
import hashlib
import os

images = [
    {
        'url': 'https://aka.doubaocdn.com/s/iIm91wZqQt',
        'save_path': r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\factory.jpg',
        'name': 'FACTORY'
    },
    {
        'url': 'https://aka.doubaocdn.com/s/EqOY1wZqQv',
        'save_path': r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\warehouse.jpg',
        'name': 'WAREHOUSE'
    },
    {
        'url': 'https://aka.doubaocdn.com/s/iWvl1wZqQx',
        'save_path': r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\showroom.jpg',
        'name': 'SHOWROOM'
    },
    {
        'url': 'https://aka.doubaocdn.com/s/VSaI1wZqQz',
        'save_path': r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\quality-lab.jpg',
        'name': 'QUALITY LAB'
    }
]

session = cffi_requests.Session(impersonate="chrome131")

for img in images:
    print(f"\nDownloading {img['name']}...")
    try:
        resp1 = session.get(img['url'], allow_redirects=False, timeout=120)
        if resp1.status_code in (301, 302, 303, 307, 308):
            redirect_url = resp1.headers.get('Location')
            print(f"  CDN URL: {redirect_url[:80]}...")
            resp2 = session.get(redirect_url, allow_redirects=True, timeout=120, headers={'Referer': img['url']})
            data = resp2.content
        elif resp1.status_code == 200:
            data = resp1.content
        else:
            print(f"  FAILED: HTTP {resp1.status_code}")
            continue

        with open(img['save_path'], 'wb') as f:
            f.write(data)

        md5 = hashlib.md5(data).hexdigest()
        is_jpeg = data[:2] == b'\xff\xd8'
        print(f"  SUCCESS: {len(data)} bytes, JPEG: {is_jpeg}, MD5: {md5}")
    except Exception as e:
        print(f"  FAILED: {e}")

# Verify all files
print("\n=== File Verification ===")
for img in images:
    path = img['save_path']
    if os.path.exists(path):
        size = os.path.getsize(path)
        with open(path, 'rb') as f:
            data = f.read()
            md5 = hashlib.md5(data).hexdigest()
        print(f"  EXISTS: {os.path.basename(path)} | Size: {size} bytes | MD5: {md5}")
    else:
        print(f"  MISSING: {os.path.basename(path)}")
