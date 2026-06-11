from curl_cffi import requests as cffi_requests
import hashlib

session = cffi_requests.Session(impersonate="chrome131")

url = "https://aka.doubaocdn.com/s/6y9P1wZqFv"
resp1 = session.get(url, allow_redirects=False, timeout=120)
print(f"Step 1 Status: {resp1.status_code}")
if resp1.status_code in (301, 302, 303, 307, 308):
    redirect_url = resp1.headers.get('Location')
    print(f"Redirect: {redirect_url[:100]}...")

    resp2 = session.get(redirect_url, allow_redirects=True, timeout=120, headers={'Referer': url})
    print(f"Step 2 Status: {resp2.status_code}")
    print(f"Content-Type: {resp2.headers.get('Content-Type', 'N/A')}")
    print(f"Content-Encoding: {resp2.headers.get('Content-Encoding', 'N/A')}")
    print(f"Content-Length: {resp2.headers.get('Content-Length', 'N/A')}")

    data = resp2.content
    print(f"Data length: {len(data)}")
    print(f"First 16 bytes (hex): {data[:16].hex()}")
    print(f"First 16 bytes (raw): {data[:16]}")

    # Check format
    if data[:2] == b'\xff\xd8':
        print("Format: JPEG")
    elif data[:4] == b'\x89PNG':
        print("Format: PNG")
    elif data[:4] == b'RIFF':
        print("Format: WebP")
    elif data[:3] == b'GIF':
        print("Format: GIF")
    elif data[:4] == b'\x00\x00\x00\x1c' or data[:4] == b'\x00\x00\x00\x20':
        print("Format: AVIF/HEIF")
    else:
        print(f"Format: Unknown (starts with {data[:4].hex()})")

    # Try saving and checking with PIL
    with open(r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\test_temp.jpg', 'wb') as f:
        f.write(data)

    from PIL import Image
    try:
        img = Image.open(r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\test_temp.jpg')
        print(f"PIL Format: {img.format}, Size: {img.size}, Mode: {img.mode}")
    except Exception as e:
        print(f"PIL Error: {e}")
