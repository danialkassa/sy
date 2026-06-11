#!/bin/bash
# Fix: proxy /health to webhook listener instead of returning static text
# Also fix: proxy /webhook/ properly

cat > /tmp/nginx-health-patch.py << 'PYEOF'
import re

with open("/etc/nginx/sites-enabled/siyang", "r") as f:
    config = f.read()

# Replace the static /health block with a proxy to the webhook listener
old_health = """    # ---- Health Check ----
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }"""

new_health = """    # ---- Health Check (proxied to webhook listener) ----
    location = /health {
        proxy_pass http://127.0.0.1:3099/health;
        proxy_set_header Host $host;
        access_log off;
    }"""

if old_health in config:
    config = config.replace(old_health, new_health)
    with open("/etc/nginx/sites-enabled/siyang", "w") as f:
        f.write(config)
    print("Nginx config updated: /health now proxies to webhook listener")
else:
    print("WARNING: Could not find the /health block to replace")
    # Try to find it with different whitespace
    if "location /health" in config:
        print("Found /health location but pattern didn't match exactly")
    else:
        print("/health location not found at all")
PYEOF

python3 /tmp/nginx-health-patch.py
nginx -t && systemctl reload nginx && echo "Nginx reloaded OK"
