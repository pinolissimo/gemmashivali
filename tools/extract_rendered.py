import re, html, glob, os
from html.parser import HTMLParser

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip=0; self.parts=[]; self.in_main=False; self.images=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag in ("script","style","noscript"): self.skip+=1
        if tag=="img" and a.get("src"): self.images.append(a["src"])
        if tag in ("h1","h2","h3","h4","h5","h6","p","li","br","section","div"): self.parts.append("\n")
    def handle_endtag(self, tag):
        if tag in ("script","style","noscript") and self.skip>0: self.skip-=1
        if tag in ("p","li","h1","h2","h3","h4","h5","h6"): self.parts.append("\n")
    def handle_data(self, data):
        if not self.skip: self.parts.append(data)

for fn in sorted(glob.glob(r"source\content\rendered\*.html")):
    p=TextExtractor(); p.feed(open(fn,encoding="utf-8",errors="ignore").read())
    txt=html.unescape("".join(p.parts))
    txt=re.sub(r"[ \t]+"," ",txt); txt=re.sub(r"\n\s*\n+","\n",txt).strip()
    out=fn.replace(".html",".txt")
    open(out,"w",encoding="utf-8").write(txt)
    print("="*40, os.path.basename(fn), len(txt))
    print(txt[:1200])
    print("IMAGES:", p.images[:10], "count", len(p.images))
