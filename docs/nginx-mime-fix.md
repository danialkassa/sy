# NGINX MIME TYPE FIX — APPLY ON 165.22.250.66

## Option B: types directive inside /admin/ location block

Edit `/etc/nginx/sites-available/siyang`. Replace the `/admin/` location block:

```nginx
location /admin/ {
    alias /var/www/siyang/public/admin/;
    index index.html;
    try_files $uri $uri/ /admin/index.html;

    types {
        text/yaml yaml yml;
    }
}
```

Then:

```bash
nginx -t && systemctl reload nginx
```

Verify:

```bash
curl -I http://localhost/admin/config.yml | grep -i content-type
```

Must return: `Content-Type: text/yaml`

If it doesn't, Option A as fallback — add YAML globally:

```bash
sed -i '/^types {/a\    text/yaml  yaml yml;' /etc/nginx/mime.types
nginx -t && systemctl reload nginx
```

## After MIME fix — update site files

```bash
cd /var/www/siyang/public && git pull origin main
```

Verify CMS version on server:

```bash
grep 'decap-cms' /var/www/siyang/public/admin/index.html
```

Must return: `decap-cms@3.3.3`

## Clear browser state

Open F12 Console on `http://165.22.250.66/admin/` and run:

```js
indexedDB.databases().then(d => { d.forEach(db => indexedDB.deleteDatabase(db.name)); }).then(() => location.reload());
```

## Success criteria

- `curl -I` returns `Content-Type: text/yaml`
- CMS admin loads without "editorial workflow" error
- Browser console: no "not yaml" warning
