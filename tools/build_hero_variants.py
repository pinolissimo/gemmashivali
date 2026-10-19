from PIL import Image, ImageOps
import os, json

ROOT=r"C:\Users\alloc\OneDrive\Desktop\gemmashivali"
OUT=os.path.join(ROOT,"site","public","images")
GEN=os.path.join(ROOT,"source","generated")
SEA=os.path.join(ROOT,"source","images","originals","2022","04","CABECERA.jpg")

def save(im, name, q=86):
    im.save(os.path.join(OUT,name),"JPEG",quality=q,optimize=True,progressive=True)
    print(name, im.size, os.path.getsize(os.path.join(OUT,name))//1024, "KB")

# Sea desktop 1920x1080: resize to height 1080 then center-crop width
sea=Image.open(SEA).convert("RGB")
sea_d=sea.resize((round(sea.width*1080/sea.height),1080),Image.LANCZOS)
left=(sea_d.width-1920)//2
sea_d=sea_d.crop((left,0,left+1920,1080))
save(sea_d,"hero-sea.jpg",87)

# Sea mobile 900x1200: crop 3:4 around the right-side subject
# original 1928x997 -> crop 748x997 at x=800
sea_m=sea.crop((800,0,800+748,997)).resize((900,1200),Image.LANCZOS)
save(sea_m,"hero-sea-mobile.jpg",87)

jobs=[
 ("hero-01-meditation.jpg","hero-meditation.jpg","hero-meditation-mobile.jpg",80,384,0),
 ("hero-02-session.jpg","hero-session.jpg","hero-session-mobile.jpg",80,600,1),
 ("hero-03-circle.jpg","hero-circle.jpg","hero-circle-mobile.jpg",80,400,2),
 ("hero-04-retreat.jpg","hero-retreat.jpg","hero-retreat-mobile.jpg",80,450,3),
 ("hero-05-qigong.jpg","hero-qigong.jpg","hero-qigong-mobile.jpg",80,450,4),
 ("hero-06-tantra.jpg","hero-tantra.jpg","hero-tantra-mobile.jpg",80,180,5),
]
for src,desk_name,mob_name,yoff,crop_x,idx in jobs:
    im=Image.open(os.path.join(GEN,src)).convert("RGB")
    # desktop 16:9: crop 1536x864 from y offset
    d=im.crop((0,yoff,1536,yoff+864)).resize((1920,1080),Image.LANCZOS)
    save(d,desk_name,86)
    # mobile 3:4: crop 768x1024
    m=im.crop((crop_x,0,crop_x+768,1024)).resize((900,1200),Image.LANCZOS)
    save(m,mob_name,86)

# Update manifest
man_path=os.path.join(ROOT,"site","src","content","images.json")
man=json.load(open(man_path,encoding="utf-8"))
for name in ["hero-sea.jpg","hero-sea-mobile.jpg","hero-meditation.jpg","hero-meditation-mobile.jpg","hero-session.jpg","hero-session-mobile.jpg","hero-circle.jpg","hero-circle-mobile.jpg","hero-retreat.jpg","hero-retreat-mobile.jpg","hero-qigong.jpg","hero-qigong-mobile.jpg","hero-tantra.jpg","hero-tantra-mobile.jpg"]:
    im=Image.open(os.path.join(OUT,name))
    man[name]={"width":im.width,"height":im.height,"bytes":os.path.getsize(os.path.join(OUT,name))}
json.dump(man,open(man_path,"w",encoding="utf-8"),ensure_ascii=False,indent=2)
print("manifest entries",len(man))
