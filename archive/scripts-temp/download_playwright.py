import asyncio
import os
import hashlib
import urllib.parse
from playwright.async_api import async_playwright

async def download_images():
    images = [
        {
            'prompt': 'Modern Chinese power tools manufacturing factory assembly line with workers in safety gear, bright industrial lighting, rows of power drills on conveyor belt, clean professional facility, wide angle shot',
            'save_path': r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\factory.jpg',
            'name': 'FACTORY'
        },
        {
            'prompt': 'Large industrial warehouse filled with organized boxes and pallets of power tools for export shipping, forklift in background, shelving units with product inventory, professional logistics facility',
            'save_path': r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\warehouse.jpg',
            'name': 'WAREHOUSE'
        },
        {
            'prompt': 'Professional power tools showroom display with drill drivers angle grinders and saws on modern display stands, yellow accent lighting, clean corporate presentation, B2B trade show style',
            'save_path': r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\showroom.jpg',
            'name': 'SHOWROOM'
        },
        {
            'prompt': 'Quality control testing laboratory for power tools, engineer testing drill torque on testing equipment, measurement instruments, safety certification testing station, professional industrial setting',
            'save_path': r'c:\Users\DanielkassaMuruts\Documents\B2B\html1-suite\public-website\images\quality-lab.jpg',
            'name': 'QUALITY LAB'
        }
    ]

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
        )

        for img in images:
            print(f"\n=== Generating {img['name']} image ===")
            encoded_prompt = urllib.parse.quote(img['prompt'], safe='')
            api_url = f"https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt={encoded_prompt}&image_size=landscape_16_9"

            page = await context.new_page()

            # Navigate to the API URL
            print(f"  Navigating to API...")
            try:
                response = await page.goto(api_url, wait_until='networkidle', timeout=60000)
                print(f"  Status: {response.status}")
                print(f"  URL: {page.url}")

                # Get the page content
                content = await page.content()
                print(f"  Content length: {len(content)}")
                print(f"  Content preview: {content[:300]}")

                # Check if we got redirected to default image
                if 'default.jpeg' in page.url:
                    print(f"  WARNING: Redirected to default image (auth failed)")
                    await page.close()
                    continue

                # Try to extract image URL from the content
                import re
                match = re.search(r'!\[.*\]\((https?://[^)]+)\)', content)
                if match:
                    image_url = match.group(1)
                    print(f"  Image URL: {image_url}")

                    # Navigate to the image URL and download
                    print(f"  Downloading image...")
                    img_response = await page.goto(image_url, wait_until='networkidle', timeout=60000)
                    print(f"  Image response status: {img_response.status}")
                    print(f"  Image URL: {page.url}")

                    # Get the image data
                    img_data = await img_response.body()
                    md5 = hashlib.md5(img_data).hexdigest()
                    is_jpeg = img_data[:2] == b'\xff\xd8'
                    print(f"  Image size: {len(img_data)} bytes, JPEG: {is_jpeg}, MD5: {md5}")

                    with open(img['save_path'], 'wb') as f:
                        f.write(img_data)
                    print(f"  Saved to: {img['save_path']}")
                else:
                    # Maybe the API returned the image directly
                    if response.status == 200:
                        body = await response.body()
                        if body[:2] == b'\xff\xd8':
                            print(f"  Got JPEG directly: {len(body)} bytes")
                            with open(img['save_path'], 'wb') as f:
                                f.write(body)
                        else:
                            print(f"  Content is not an image: {body[:100]}")

            except Exception as e:
                print(f"  Error: {e}")

            await page.close()

        await browser.close()

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

asyncio.run(download_images())
