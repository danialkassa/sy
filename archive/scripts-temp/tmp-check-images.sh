#!/bin/bash
# Check what images the homepage references
curl -s https://siyang.tools/ | grep -oP 'src="[^"]*images[^"]*"' | head -20
echo '---'
# Check if the "generating" text is in any image
for f in /var/www/siyang/public/images/products/*.jpg; do
  if strings "$f" 2>/dev/null | grep -qi "generating"; then
    echo "PLACEHOLDER FOUND: $f"
  fi
done
echo '---'
# Check the factory/warehouse/showroom/quality-lab images
for f in factory warehouse showroom quality-lab; do
  path="/var/www/siyang/public/images/${f}.jpg"
  if [ -f "$path" ]; then
    if strings "$path" 2>/dev/null | grep -qi "generating"; then
      echo "PLACEHOLDER: $path"
    else
      echo "OK: $path ($(wc -c < "$path") bytes)"
    fi
  fi
done
