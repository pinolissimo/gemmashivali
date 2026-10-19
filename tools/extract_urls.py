import json, re, os

with open(r"source\content\web-final.json", encoding="utf-8") as f:
    data = json.load(f)

urls = set()
def walk(o):
    if isinstance(o, dict):
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
    elif isinstance(o, str):
        if o.startswith("http://") or o.startswith("https://"):
            urls.add(o)
walk(data)

# CSS urls
css_urls = set()
for p in [r"source\raw\css\app.css", r"source\raw\css\chunk-vendors.css"]:
    t = open(p, encoding="utf-8", errors="ignore").read()
    for m in re.finditer(r"url\(([^)]+)\)", t):
        u = m.group(1).strip("'\"")
        if u.startswith("/"):
            css_urls.add("https://gemmashivali.com" + u)
        elif not u.startswith("data:") and not u.startswith("#"):
            css_urls.add(u)

allu = sorted(urls)
categorized = {"images":[], "videos":[], "fonts":[], "other":[]}
for u in allu:
    path = u.split("?")[0].lower()
    if re.search(r"\.(jpg|jpeg|png|gif|webp|svg|avif|ico|bmp)$", path):
        categorized["images"].append(u)
    elif re.search(r"\.(mp4|webm|mov|avi|ogv)$", path):
        categorized["videos"].append(u)
    elif re.search(r"\.(woff2?|ttf|otf|eot)$", path):
        categorized["fonts"].append(u)
    else:
        categorized["other"].append(u)

print("JSON urls:", len(allu))
for k,v in categorized.items():
    print(f"\n{k}: {len(v)}")
    for u in v: print(" ", u)

print("\nCSS urls:", len(css_urls))
for u in sorted(css_urls): print(" ", u)
