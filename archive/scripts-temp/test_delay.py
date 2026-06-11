import time
from curl_cffi import requests as cffi_requests
import hashlib

url = "https://aka.doubaocdn.com/s/lNEY1wZqI3"
save_path = r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\factory.jpg'

session = cffi_requests.Session(impersonate="chrome131")

# Try downloading multiple times with delays
for attempt in range(5):
    print(f"\nAttempt {attempt + 1}...")
    try:
        resp1 = session.get(url, allow_redirects=False, timeout=120)
        if resp1.status_code in (301, 302, 303, 307, 308):
            redirect_url = resp1.headers.get('Location')
            print(f"  Redirect to: {redirect_url[:80]}...")

            resp2 = session.get(redirect_url, allow_redirects=True, timeout=120, headers={'Referer': url})
            data = resp2.content
            md5 = hashlib.md5(data).hexdigest()
            is_jpeg = data[:2] == b'\xff\xd8'
            print(f"  Size: {len(data)}, JPEG: {is_jpeg}, MD5: {md5}")

            if md5 != '19a0b822edb11957055e4588c2159058':
                print(f"  DIFFERENT from default! Saving...")
                with open(save_path, 'wb') as f:
                    f.write(data)
                break
            else:
                print(f"  Still same as default placeholder")
        else:
            print(f"  Status: {resp1.status_code}")
    except Exception as e:
        print(f"  Error: {e}")

    if attempt < 4:
        print(f"  Waiting 15 seconds...")
        time.sleep(15)

# Final save regardless
print("\nFinal download...")
resp1 = session.get(url, allow_redirects=False, timeout=120)
if resp1.status_code in (301, 302, 303, 307, 308):
    redirect_url = resp1.headers.get('Location')
    resp2 = session.get(redirect_url, allow_redirects=True, timeout=120, headers={'Referer': url})
    with open(save_path, 'wb') as f:
        f.write(resp2.content)
    print(f"Saved: {len(resp2.content)} bytes")
