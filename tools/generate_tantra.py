import json, urllib.request, base64, os, time
key=open(r"C:\Users\alloc\AppData\Local\Temp\kilo\openai-key.txt",encoding="utf-8").read().strip()
scene=("A tasteful editorial photograph of two people sitting cross-legged opposite each other in a warm minimalist room, fully clothed in soft neutral linen, eyes closed, hands resting on their hearts, a single candle and a small bowl of rose petals between them, practicing tantra meditation. No physical contact, no sexual content, respectful, serene and elegant. Ultra-photorealistic, full-frame reflex camera, 85mm lens, f/2.0, natural skin texture, cinematic warm taupe and rose tones, soft natural light, shallow depth of field, fine details, no text, no logos, no watermark, 3:2 landscape composition with calm negative space on the left.")
body={"model":"gpt-image-1","prompt":scene,"n":1,"size":"1536x1024","quality":"high","output_format":"jpeg","output_compression":92}
req=urllib.request.Request("https://api.openai.com/v1/images/generations",data=json.dumps(body).encode(),headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"})
try:
    with urllib.request.urlopen(req,timeout=300) as r:
        data=json.loads(r.read().decode())
    item=data["data"][0]
    path=r"source\generated\hero-06-tantra.jpg"
    open(path,"wb").write(base64.b64decode(item["b64_json"]))
    print("OK",os.path.getsize(path))
except urllib.error.HTTPError as e:
    print("HTTP",e.code,e.read().decode()[:800])
except Exception as e:
    print(type(e).__name__,str(e)[:500])
