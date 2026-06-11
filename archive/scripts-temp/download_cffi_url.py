from curl_cffi import requests as cffi_requests
import os
import hashlib
import sys

def download_with_cffi(url, save_path):
    """Download image using curl_cffi with browser impersonation."""
    session = cffi_requests.Session(impersonate="chrome131")

    try:
        # Get redirect URL first
        resp1 = session.get(url, allow_redirects=False, timeout=120)
        print(f"  Step 1 Status: {resp1.status_code}")

        if resp1.status_code in (301, 302, 303, 307, 308):
            redirect_url = resp1.headers.get('Location')
            print(f"  Redirect to: {redirect_url}")

            # Download from redirect URL with Referer
            resp2 = session.get(redirect_url, allow_redirects=True, timeout=120,
                              headers={'Referer': url})
            print(f"  Step 2 Status: {resp2.status_code}")
            print(f"  Content-Type: {resp2.headers.get('Content-Type', 'N/A')}")
            print(f"  Final URL: {resp2.url}")

            data = resp2.content
        elif resp1.status_code == 200:
            data = resp1.content
        else:
            print(f"  FAILED: HTTP {resp1.status_code}")
            return False

        is_jpeg = data[:2] == b'\xff\xd8'
        md5 = hashlib.md5(data).hexdigest()

        with open(save_path, 'wb') as f:
            f.write(data)

        print(f"  SUCCESS: {len(data)} bytes, JPEG: {is_jpeg}, MD5: {md5}")
        return True

    except Exception as e:
        print(f"  FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    url = sys.argv[1]
    save_path = sys.argv[2]
    download_with_cffi(url, save_path)
