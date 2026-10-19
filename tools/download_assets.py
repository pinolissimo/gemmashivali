import json, re, os, urllib.request, urllib.parse, hashlib, time, csv
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = r"C:\Users\alloc\OneDrive\Desktop\gemmashivali"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"

urls = set()
for fn in [r"source\content\all-image-urls.txt"]:
    for line in open(os.path.join(ROOT, fn), encoding="utf-8"):
        line=line.strip()
        if line.startswith("http"): urls.add(line)

# Images referenced by rendered pages
for fn in os.listdir(os.path.join(ROOT, "source", "content", "rendered")):
    if fn.endswith(".html"):
        t=open(os.path.join(ROOT,"source","content","rendered",fn),encoding="utf-8",errors="ignore").read()
        for m in re.finditer(r'(?:src|href)="(https://[^"]+\.(?:jpg|jpeg|png|webp|gif|svg|avif))(?:\?[^"]*)?"', t, re.I):
            urls.add(m.group(1))

# Fonts
font_urls = [
    "https://gemmashivali.com/fonts/OpenSans/OpenSans-Regular.woff2",
    "https://gemmashivali.com/fonts/OpenSans/OpenSans-Bold.woff2",
    "https://gemmashivali.com/fontawesome/css/all.min.css",
]
for u in font_urls: urls.add(u)

# Skip invalid/placeholder
urls = sorted(u for u in urls if re.match(r"^https?://", u) and not u.endswith("/wp-includes/images/media/default.png"))

def local_path(u):
    p = urllib.parse.urlparse(u)
    path = urllib.parse.unquote(p.path)
    if "/wp-content/uploads/" in path:
        tail = path.split("/wp-content/uploads/",1)[1]
        return os.path.join(ROOT, "source", "images", "originals", *tail.split("/"))
    if path.startswith("/fonts/"):
        return os.path.join(ROOT, "source", "fonts", *path[len("/fonts/"):].split("/"))
    if path.startswith("/fontawesome/"):
        return os.path.join(ROOT, "source", "fontawesome", *path[len("/fontawesome/"):].split("/"))
    return os.path.join(ROOT, "source", "images", "misc", os.path.basename(path))

def download(u):
    out = local_path(u)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    if os.path.exists(out) and os.path.getsize(out) > 0:
        return (u, out, os.path.getsize(out), "cached")
    req = urllib.request.Request(u, headers={"User-Agent": UA, "Referer": "https://gemmashivali.com/"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=45) as r:
                data = r.read()
                ctype = r.headers.get("Content-Type","")
            if not data: raise ValueError("empty body")
            if "text/html" in ctype.lower() and not u.endswith((".css",)):
                raise ValueError(f"unexpected content-type {ctype}")
            with open(out, "wb") as f: f.write(data)
            return (u, out, len(data), "ok")
        except Exception as e:
            if attempt == 3: return (u, out, 0, f"ERROR {e}")
            time.sleep(1.5*(attempt+1))

rows=[]
with ThreadPoolExecutor(max_workers=8) as ex:
    futs = {ex.submit(download,u): u for u in urls}
    for fut in as_completed(futs):
        rows.append(fut.result())

rows.sort(key=lambda r:r[0])
with open(os.path.join(ROOT,"source","images","manifest.csv"),"w",newline="",encoding="utf-8") as f:
    w=csv.writer(f); w.writerow(["url","local_path","bytes","status"])
    for r in rows: w.writerow([r[0], os.path.relpath(r[1],ROOT), r[2], r[3]])

ok=[r for r in rows if r[3] in ("ok","cached")]
bad=[r for r in rows if r not in ok]
print(f"Downloaded/cached {len(ok)} of {len(rows)} URLs")
print("Total bytes:", sum(r[2] for r in ok))
for r in bad: print("FAILED:", r[0], r[3])
