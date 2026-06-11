from curl_cffi import requests as cffi_requests
import hashlib

session = cffi_requests.Session(impersonate="chrome131")

# Test with cat image
url = "https://aka.doubaocdn.com/s/6y9P1wZqFv"
resp1 = session.get(url, allow_redirects=False, timeout=120)
print(f"Status: {resp1.status_code}")
if resp1.status_code in (301, 302, 303, 307, 308):
    redirect_url = resp1.headers.get('Location')
    print(f"Redirect: {redirect_url}")
    resp2 = session.get(redirect_url, allow_redirects=True, timeout=120, headers={'Referer': url})
    data = resp2.content
    md5 = hashlib.md5(data).hexdigest()
    print(f"Size: {len(data)}, MD5: {md5}, JPEG: {data[:2] == b'\\xff\\xd8'}")
    # Check if it's different from the default image
    default_md5 = '19a0b822edb11957055e4588c2159058'
    if md5 == default_md5:
        print("SAME as default image - CDN is serving placeholder for all URLs")
    else:
        print("DIFFERENT from default image - API generates different images!")
