import os, json, base64, urllib.request
from PIL import Image

ROOT=r"C:\Users\alloc\OneDrive\Desktop\gemmashivali"
SHOTS=os.path.join(ROOT,"site","screenshots")
OUT=os.path.join(SHOTS,"audit-images")
os.makedirs(OUT,exist_ok=True)

def crop(src,name,top,bottom,maxw=1000):
    im=Image.open(os.path.join(SHOTS,src))
    c=im.crop((0,top,im.width,min(bottom,im.height)))
    if c.width>maxw:
        c=c.resize((maxw,int(c.height*maxw/c.width)),Image.LANCZOS)
    c=c.convert("RGB")
    p=os.path.join(OUT,name)
    c.save(p,"JPEG",quality=80,optimize=True)
    print(name,c.size,os.path.getsize(p)//1024,"KB")
    return p

paths=[]
paths.append(crop("home-full2.png","home-hero.jpg",0,2600))
paths.append(crop("home-full2.png","home-process.jpg",2600,5200))
paths.append(crop("services-full2.png","services-hero.jpg",0,3200))
paths.append(crop("services-full2.png","services-bottom.jpg",6500,11523))
paths.append(crop("home-mobile-full.png","mobile-hero.jpg",0,2600,420))
paths.append(crop("home-mobile-full.png","mobile-mid.jpg",2600,5200,420))

key=open(r"C:\Users\alloc\AppData\Local\Temp\kilo\openai-key.txt",encoding="utf-8").read().strip()
prompt = """Sei un senior product designer e performance engineer. Fai un audit indipendente di questo sito statico VDS Engine 9 per Gemma Shivali, terapeuta olistica. Non modificare file.

Struttura:
- Home: hero cinematografica CSS-only (8 fotogrammi, 45s, prima/ultima foto originale del mare; 6 scene fotorealistiche generate), programmi (6 card), sezione "Estás en un momento de cambio", processo in 3 step, Sobre mí + filosofía + tantra, teaser servizi, calendario con ritiro, contatti/FAQ? (FAQ è nei servizi), form contatti.
- Servicios: page hero, quick nav sticky, 6 famiglie di servizi (programas, sesiones, talleres, retiros, retiro tantra, qigong, tantra), FAQ (5), banda contatti.
- 4 pagine legali complete.
- Design: Cormorant Garamond + Open Sans, palette taupe/rosa/salvia, mobile-first, zero JS runtime, asset locali, Search/GEO.

Dati Lighthouse misurati:
- Home mobile: Performance 81, LCP 4.8s, FCP 2.0s, TBT 0ms, CLS 0.013, peso 1.309 KiB. Il LCP è la prima immagine hero (mobile 900x1200 JPEG, 161 KiB); il render delay è 4.2s. Con una sola slide hero il test scende a LCP 3.2s e performance 93.
- Home desktop: Performance 98, LCP 1.0s.
- Servicios mobile: Performance 95, LCP 2.7s.
- Accessibility: 96 home / 91 servizi; problemi: contrasto badge "ONLINE · STREAMING", label "SERVICIOS EN BREVE", label fatti nel retiro, footer bottom, breadcrumb span, link breadcrumb non sottolineato.
- Best practices 100, SEO 100.

Guarda gli screenshot allegati (desktop e mobile). Rispondi in italiano, massimo 1400 parole, con priorità P0/P1/P2 e riferimenti a sezioni/classi specifiche. Analizza:
1. Architettura dell'informazione e percorso utente: cosa funziona, cosa confonde, cosa manca.
2. UI: gerarchia, tipografia, spacing, palette, immagini, coerenza, mobile-first.
3. UX: navigazione, CTA, form mailto, FAQ, calendario, fiducia/prova sociale, date/legge, attrito.
4. Performance: il sito è valido senza sacrificare la qualità visiva? Interventi concreti e misurabili (WebP/AVIF, srcset, riduzione frame hero, preload, CSS critico, font subsetting, cache).
5. Micro-animazioni: 6-10 proposte CSS-only eleganti, con fallback prefers-reduced-motion, specificando dove e perché.
6. Accessibilità/SEO/GEO: fix e opportunità.
Non inventare contenuti o dati non presenti. Sii concreto e critico, non genericamente positivo."""

content=[{"type":"text","text":prompt}]
for p in paths:
    b64=base64.b64encode(open(p,"rb").read()).decode()
    content.append({"type":"image_url","image_url":{"url":"data:image/jpeg;base64,"+b64}})
body={"model":"gpt-4o","messages":[{"role":"user","content":content}],"max_tokens":3000,"temperature":0.3}
req=urllib.request.Request("https://api.openai.com/v1/chat/completions",data=json.dumps(body).encode(),headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"})
try:
    with urllib.request.urlopen(req,timeout=300) as r:
        data=json.loads(r.read().decode())
    text=data["choices"][0]["message"]["content"]
    open(os.path.join(ROOT,"AUDIT-CHATGPT.md"),"w",encoding="utf-8").write(text+"\n")
    print("OK",len(text),"chars")
except urllib.error.HTTPError as e:
    print("HTTP",e.code,e.read().decode()[:1000])
except Exception as e:
    print(type(e).__name__,str(e)[:1000])
