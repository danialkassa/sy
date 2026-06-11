import os, re
from pathlib import Path

base = Path('.')
img_refs = {}
for html_file in base.rglob('*.html'):
    # Skip supamode-scrape
    if 'supamode-scrape' in str(html_file):
        continue
    text = html_file.read_text(encoding='utf-8', errors='ignore')
    for m in re.finditer(r'(?:src|data-src)=["\']([^"\']+\.(jpg|jpeg|png|gif|svg|webp))["\']', text, re.IGNORECASE):
        src = m.group(1)
        if src.startswith('http') or src.startswith('data:') or src.startswith('//'):
            continue
        fpath = str(html_file).replace('\\','/')
        if src not in img_refs:
            img_refs[src] = []
        img_refs[src].append(fpath)

broken = []
for src, sources in sorted(img_refs.items()):
    # Resolve relative paths
    for source_file in sources[:1]:
        source_dir = str(Path(source_file).parent)
        if src.startswith('/'):
            target = base / src.lstrip('/')
        else:
            target = Path(source_dir) / src
        target = target.resolve()
        if not target.exists():
            broken.append((src, list(set(sources))[:3]))

print(f'Total unique image references: {len(img_refs)}')
print(f'Broken image references: {len(broken)}')
for src, srcs in broken:
    print(f'  BROKEN: {src}')
    for s in srcs:
        print(f'    from: {s}')
