from PIL import Image, ImageOps
import os, json
ROOT=r"C:\Users\alloc\OneDrive\Desktop\gemmashivali"
OUT=os.path.join(ROOT,"site","public","images")
hero=Image.open(os.path.join(OUT,"hero-sea.jpg")).convert("RGB")
og=ImageOps.fit(hero,(1200,630),Image.LANCZOS,centering=(0.62,0.32))
og.save(os.path.join(OUT,"og-cover.jpg"),"JPEG",quality=85,optimize=True,progressive=True)
print("og-cover",os.path.getsize(os.path.join(OUT,"og-cover.jpg"))//1024,"KB")
man_path=os.path.join(ROOT,"site","src","content","images.json")
man=json.load(open(man_path,encoding="utf-8"))
man["og-cover.jpg"]={"width":1200,"height":630,"bytes":os.path.getsize(os.path.join(OUT,"og-cover.jpg"))}
json.dump(man,open(man_path,"w",encoding="utf-8"),ensure_ascii=False,indent=2)
