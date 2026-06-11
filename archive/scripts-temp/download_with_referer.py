import urllib.request
import ssl
import os
import hashlib
import sys

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def download_image_with_referer(short_url, save_path):
    """Download image by first getting the redirect URL, then downloading with Referer."""
    opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))

    # Step 1: Get redirect URL without following
    class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    opener_no_redirect = urllib.request.build_opener(NoRedirectHandler, urllib.request.HTTPSHandler(context=ctx))

    req1 = urllib.request.Request(short_url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })

    try:
        resp1 = opener_no_redirect.open(req1, timeout=120)
        print(f"  Step 1 Status: {resp1.status}")
        # No redirect - save directly
        data = resp1.read()
        with open(save_path, 'wb') as f:
            f.write(data)
        print(f"  SUCCESS (no redirect): {len(data)} bytes")
        return True
    except urllib.error.HTTPError as e:
        if e.code in (301, 302, 303, 307, 308):
            redirect_url = e.headers.get('Location')
            print(f"  Step 1: Redirect to: {redirect_url}")
        else:
            print(f"  Step 1 FAILED: HTTP {e.code}")
            return False

    # Step 2: Download from redirect URL with Referer
    req2 = urllib.request.Request(redirect_url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Referer': short_url,
    })

    try:
        resp2 = opener.open(req2, timeout=120)
        data = resp2.read()
        print(f"  Step 2 Status: {resp2.status}")
        print(f"  Final URL: {resp2.url}")
        print(f"  Content-Type: {resp2.headers.get('Content-Type', 'N/A')}")
        print(f"  Data length: {len(data)}")

        with open(save_path, 'wb') as f:
            f.write(data)

        md5 = hashlib.md5(data).hexdigest()
        is_jpeg = data[:2] == b'\xff\xd8'
        print(f"  SUCCESS: {len(data)} bytes, JPEG: {is_jpeg}, MD5: {md5}")
        return True
    except Exception as e:
        print(f"  Step 2 FAILED: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: download_with_referer.py <url> <save_path>")
        sys.exit(1)

    url = sys.argv[1]
    save_path = sys.argv[2]
    download_image_with_referer(url, save_path)
