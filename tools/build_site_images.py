from PIL import Image, ImageOps
import os, json, shutil

ROOT = r"C:\Users\alloc\OneDrive\Desktop\gemmashivali"
SRC = os.path.join(ROOT, "source", "images", "originals")
OUT = os.path.join(ROOT, "site", "public", "images")
os.makedirs(OUT, exist_ok=True)

# name, relative source, max width/height, format, quality
jobs = [
    ("hero.jpg", "2022/04/CABECERA.jpg", (1920, 1200), "JPEG", 84),
    ("logo.jpg", "2022/04/FAVICON-02.jpg", (480, 480), "JPEG", 86),
    ("about-gemma.jpg", "2022/04/sobre-mi-02.jpg", (800, 1000), "JPEG", 84),
    ("program-empowerment.jpg", "2022/04/PROGRAMA-01.jpg", (400, 400), "JPEG", 86),
    ("program-postpartum.jpg", "2022/04/PROGRAMA-02-1.jpg", (600, 600), "JPEG", 85),
    ("program-menopause.jpg", "2022/04/programa-03.jpg", (300, 300), "JPEG", 88),
    ("program-masculine-feminine.jpg", "2022/04/PROGRAMA-04-scaled.jpg", (700, 700), "JPEG", 85),
    ("program-40plus.jpg", "2022/04/PROGRAMA-05.jpg", (300, 300), "JPEG", 88),
    ("program-transition.jpg", "2022/04/PROGRAMA-06.jpg", (300, 300), "JPEG", 88),
    ("services-intro.jpg", "2022/07/INTRO-SERVICIOS.jpg", (900, 900), "JPEG", 84),
    ("services-individual.jpg", "2022/07/074B2404-gemma-1-horizontal-064.jpg", (1100, 900), "JPEG", 84),
    ("services-workshops.jpg", "2022/04/1653650095197.jpg", (1200, 900), "JPEG", 84),
    ("services-retreats.jpg", "2022/04/retiros.jpg", (700, 1000), "JPEG", 84),
    ("program-menopause-detail.jpg", "2022/07/programa-menopausia.jpg", (750, 1100), "JPEG", 84),
    ("tantra-retreat.jpg", "2025/08/WEB-RETIRO.001.jpeg", (900, 1200), "JPEG", 84),
    ("qigong.jpg", "2025/08/QIGONG.png", (900, 1200), "JPEG", 84),
    ("tantra.jpg", "2025/08/TANTRA.png", (900, 1200), "JPEG", 84),
]

manifest = {}
for name, rel, box, fmt, q in jobs:
    src = os.path.join(SRC, *rel.split("/"))
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        im = im.convert("RGBA")
        bg.paste(im, mask=im.split()[-1])
        im = bg
    else:
        im = im.convert("RGB")
    im.thumbnail(box, Image.LANCZOS)
    dest = os.path.join(OUT, name)
    if fmt == "JPEG":
        im.save(dest, "JPEG", quality=q, optimize=True, progressive=True)
    else:
        im.save(dest, fmt, optimize=True)
    manifest[name] = {"width": im.width, "height": im.height, "bytes": os.path.getsize(dest)}
    print(f"{name}: {im.width}x{im.height} {os.path.getsize(dest)//1024} KB")

# OG cover 1200x630 crop from hero
hero = Image.open(os.path.join(OUT, "hero.jpg")).convert("RGB")
hero = ImageOps.fit(hero, (1200, 630), Image.LANCZOS, centering=(0.5, 0.35))
hero.save(os.path.join(OUT, "og-cover.jpg"), "JPEG", quality=84, optimize=True, progressive=True)
manifest["og-cover.jpg"] = {"width": 1200, "height": 630, "bytes": os.path.getsize(os.path.join(OUT, "og-cover.jpg"))}
print("og-cover.jpg:", manifest["og-cover.jpg"]["bytes"]//1024, "KB")

# Favicons
fav = Image.open(os.path.join(SRC, "2022", "04", "favicon-gemma.png")).convert("RGBA")
for size, name in [(64, "favicon.png"), (180, "apple-touch-icon.png")]:
    im = fav.copy(); im.thumbnail((size,size), Image.LANCZOS)
    canvas = Image.new("RGBA", (size,size), (0,0,0,0)); canvas.paste(im, ((size-im.width)//2,(size-im.height)//2), im)
    canvas.save(os.path.join(ROOT,"site","public",name), "PNG", optimize=True)
    print(name, os.path.getsize(os.path.join(ROOT,"site","public",name))//1024, "KB")

# Fonts
fout = os.path.join(ROOT,"site","public","fonts"); os.makedirs(fout, exist_ok=True)
for f in ["OpenSans-Regular.woff2","OpenSans-Bold.woff2"]:
    shutil.copyfile(os.path.join(ROOT,"source","fonts","OpenSans",f), os.path.join(fout,f))
    print(f, os.path.getsize(os.path.join(fout,f))//1024, "KB")

with open(os.path.join(ROOT,"site","src","content","images.json"),"w",encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print("TOTAL", round(sum(v["bytes"] for v in manifest.values())/1024/1024,2), "MB")
