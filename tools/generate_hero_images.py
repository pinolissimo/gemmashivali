import json, urllib.request, base64, os, time, sys
key=open(r"C:\Users\alloc\AppData\Local\Temp\kilo\openai-key.txt",encoding="utf-8").read().strip()
out=r"source\generated"; os.makedirs(out,exist_ok=True)
style=("Ultra-photorealistic editorial photograph for a luxury wellness brand, shot on a professional full-frame reflex camera, 85mm prime lens, f/2.0, natural skin texture, anatomically correct hands, realistic fine details, cinematic color grading in warm taupe, soft rose and sage tones, soft natural light, shallow depth of field, high dynamic range, no text, no logos, no watermark, no extra limbs, no distorted anatomy. 3:2 landscape composition, subject positioned on the right third with generous calm negative space on the left for typography.")
scenes=[
 ("hero-01-meditation","A serene woman in her early forties meditating cross-legged on smooth rocks beside a calm Mediterranean sea at sunrise. She wears a flowing sand-colored linen dress, eyes closed, hands resting on her knees, gentle waves and soft golden-pink light, a sense of grounded calm and vitality."),
 ("hero-02-session","A close-up of a holistic therapist's hands hovering just above a woman's shoulders during an energy healing session. The woman lies on a treatment table with her eyes closed, wrapped in soft linen, in a warm minimalist room with candles, natural textures and soft window light. Intimate, respectful and tasteful, not clinical."),
 ("hero-03-circle","A small circle of women in their thirties to fifties sitting on linen floor cushions in a warm minimalist studio, holding hands with eyes closed. Candles, dried flowers and soft afternoon light, elegant neutral clothing, a feeling of safety and sisterhood, seen from a respectful distance."),
 ("hero-04-retreat","A woman walking barefoot along a quiet forest path in autumn, seen from behind, wearing a long warm taupe coat. Golden morning light filters through the trees, mist and fallen leaves, a cinematic sense of transition, stillness and renewal."),
 ("hero-05-qigong","A woman practicing qigong in a sunlit meadow at sunrise, captured mid-movement with her arms open in a graceful flowing gesture. She wears flowing sage-green clothing, mist and wildflowers around her, soft golden light, a feeling of vitality and presence."),
 ("hero-06-tantra","A tasteful, intimate silhouette of a couple facing each other by candlelight in a warm minimalist room, hands gently touching, soft focus and deep shadows. No explicit content. Elegant, sensual and respectful, with warm rose and amber tones, a sense of connection and presence."),
]
for name,scene in scenes:
    body={"model":"gpt-image-1","prompt":scene+"\n\n"+style,"n":1,"size":"1536x1024","quality":"high","output_format":"jpeg","output_compression":92}
    req=urllib.request.Request("https://api.openai.com/v1/images/generations",data=json.dumps(body).encode(),headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"})
    for attempt in range(3):
        try:
            t=time.time()
            with urllib.request.urlopen(req,timeout=300) as r:
                data=json.loads(r.read().decode())
            item=data["data"][0]
            b64=item.get("b64_json")
            if not b64:
                raise RuntimeError("no b64_json")
            path=os.path.join(out,name+".jpg")
            open(path,"wb").write(base64.b64decode(b64))
            print(name,"OK",os.path.getsize(path),"bytes",round(time.time()-t,1),"s",flush=True)
            break
        except urllib.error.HTTPError as e:
            msg=e.read().decode()[:800]
            print(name,"HTTP",e.code,msg,flush=True)
            if e.code in (400,401,403): sys.exit(1)
            time.sleep(4)
        except Exception as e:
            print(name,"ERR",type(e).__name__,str(e)[:400],flush=True)
            time.sleep(4)
