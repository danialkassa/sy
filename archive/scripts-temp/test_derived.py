from curl_cffi import requests as cffi_requests
import hashlib

# Try the derived URLs from WebFetch
urls = [
    'https://aka.doubaocdn.com/s/obBs1wZqKo',
    'https://aka.doubaocdn.com/s/mVQ21wZqKw',
    'https://aka.doubaocdn.com/s/7jY01wZqL7',
]

session = cffi_requests.Session(impersonate="chrome131")

for url in urls:
    print(f"\nTrying: {url}")
    try:
        resp1 = session.get(url, allow_redirects=False, timeout=120)
        print(f"  Status: {resp1.status_code}")
        if resp1.status_code in (301, 302, 303, 307, 308):
            redirect_url = resp1.headers.get('Location')
            print(f"  Redirect: {redirect_url[:100]}...")
            resp2 = session.get(redirect_url, allow_redirects=True, timeout=120, headers={'Referer': url})
            data = resp2.content
            md5 = hashlib.md5(data).hexdigest()
            print(f"  Size: {len(data)}, MD5: {md5}")
            if md5 != '19a0b822edb11957055e4588c2159058':
                print(f"  DIFFERENT! Found real image!")
                break
        elif resp1.status_code == 200:
            data = resp1.content
            md5 = hashlib.md5(data).hexdigest()
            print(f"  Direct: Size: {len(data)}, MD5: {md5}")
    except Exception as e:
        print(f"  Error: {e}")
