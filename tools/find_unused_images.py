import os, glob, json
ROOT=r"C:\Users\alloc\OneDrive\Desktop\gemmashivali"
pub=os.path.join(ROOT,"site","public","images")
texts=[]
for p in [os.path.join(ROOT,"site","src","build.mjs"),os.path.join(ROOT,"site","src","content","site.json"),os.path.join(ROOT,"site","src","styles","site.css")]:
    texts.append(open(p,encoding="utf-8").read())
for p in glob.glob(os.path.join(ROOT,"site","dist","**","*.html"),recursive=True):
    texts.append(open(p,encoding="utf-8").read())
blob="\n".join(texts)
unused=[]
for f in sorted(os.listdir(pub)):
    if f not in blob:
        unused.append(f)
print("unused:",unused)
