import urllib.request
import ssl
import os
import hashlib
import sys

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def download_image(url, save_path):
    """Download an image from a URL, following redirects."""
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    })

    # Follow redirects automatically
    opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))

    try:
        resp = opener.open(req, timeout=120)
        data = resp.read()
        final_url = resp.url

        print(f"  Status: {resp.status}")
        print(f"  Final URL: {final_url}")
        print(f"  Content-Type: {resp.headers.get('Content-Type', 'N/A')}")
        print(f"  Data length: {len(data)}")

        # Check if it's a JPEG
        if data[:2] == b'\xff\xd8':
            with open(save_path, 'wb') as f:
                f.write(data)
            md5 = hashlib.md5(data).hexdigest()
            print(f"  SUCCESS: {len(data)} bytes, MD5: {md5}")
            return True
        else:
            print(f"  WARNING: Not a JPEG, first bytes: {data[:4].hex()}")
            # Save anyway
            with open(save_path, 'wb') as f:
                f.write(data)
            md5 = hashlib.md5(data).hexdigest()
            print(f"  Saved: {len(data)} bytes, MD5: {md5}")
            return True

    except Exception as e:
        print(f"  FAILED: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: download_image.py <url> <save_path>")
        sys.exit(1)

    url = sys.argv[1]
    save_path = sys.argv[2]
    download_image(url, save_path)
