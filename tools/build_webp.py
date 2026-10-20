from PIL import Image, ImageOps
import os, json, glob
ROOT=r"C:\Users\alloc\OneDrive\Desktop\gemmashivali"
OUT=os.path.join(ROOT,"site","public","images")

def webp(name,q=80):
    src=os.path.join(OUT,name)
    im=Image.open(src).convert("RGB")
    dst=os.path.splitext(src)[0]+".webp"
    im.save(dst,"WEBP",quality=q,method=6)
    return dst

# small logo
logo=Image.open(os.path.join(OUT,"logo.jpg")).convert("RGB")
logo96=ImageOps.fit(logo,(96,96),Image.LANCZOS)
logo96.save(os.path.join(OUT,"logo-96.jpg"),"JPEG",quality=88,optimize=True)
logo96.save(os.path.join(OUT,"logo-96.webp"),"WEBP",quality=88,method=6)

# square card variants for the three oversized program images
def card(src_name,dst_name,size=264):
    im=Image.open(os.path.join(OUT,src_name)).convert("RGB")
    im=ImageOps.fit(im,(size,size),Image.LANCZOS,centering=(0.5,0.45))
    im.save(os.path.join(OUT,dst_name),"JPEG",quality=86,optimize=True,progressive=True)
    im.save(os.path.splitext(os.path.join(OUT,dst_name))[0]+".webp","WEBP",quality=86,method=6)

card("program-postpartum.jpg","program-postpartum-card.jpg")
card("program-masculine-feminine.jpg","program-masculine-feminine-card.jpg")
card("services-retreats.jpg","services-retreats-card.jpg")

# webp for every remaining jpeg
for p in sorted(glob.glob(os.path.join(OUT,"*.jpg"))):
    if p.endswith(".webp"): continue
    webp(os.path.basename(p),82)

# manifest update
man_path=os.path.join(ROOT,"site","src","content","images.json")
man=json.load(open(man_path,encoding="utf-8"))
for name in ["logo-96.jpg","program-postpartum-card.jpg","program-masculine-feminine-card.jpg","services-retreats-card.jpg"]:
    im=Image.open(os.path.join(OUT,name)); man[name]={"width":im.width,"height":im.height,"bytes":os.path.getsize(os.path.join(OUT,name))}
# remove now-unused full-size program/logo assets from manifest
for name in ["logo.jpg","program-postpartum.jpg","program-masculine-feminine.jpg","program-transition.jpg"]:
    man.pop(name,None)
json.dump(man,open(man_path,"w",encoding="utf-8"),ensure_ascii=False,indent=2)
print("manifest entries",len(man))
# delete now-unused files
for name in ["logo.jpg","program-postpartum.jpg","program-masculine-feminine.jpg","program-transition.jpg"]:
    p=os.path.join(OUT,name)
    if os.path.exists(p): os.remove(p)
print("webp files",len(glob.glob(os.path.join(OUT,"*.webp"))))
