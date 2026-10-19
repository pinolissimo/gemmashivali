from PIL import Image
import os
base=r"site\screenshots"
def crop(src, name, top, bottom, width=None):
    im=Image.open(os.path.join(base,src))
    box=(0, top, im.width, min(bottom, im.height))
    c=im.crop(box)
    if width and c.width>width:
        c=c.resize((width, int(c.height*width/c.width)), Image.LANCZOS)
    c.save(os.path.join(base,name), optimize=True)
    print(name, c.size)
crop("home-full.png","crop-home-hero.png",0,2200,1100)
crop("home-full.png","crop-home-programs-intro.png",2100,4600,1100)
crop("home-full.png","crop-home-process-about.png",4300,7000,1100)
crop("home-full.png","crop-home-quote-calendar.png",6800,8200,1100)
crop("home-full.png","crop-home-contact.png",8000,9330,1100)
crop("home-mobile-full.png","crop-mobile-top.png",0,2600,390)
crop("services-full.png","crop-services-hero.png",0,2500,1100)
crop("services-full.png","crop-services-programs.png",2400,5200,1100)
crop("services-full.png","crop-services-retreat.png",6800,9200,1100)
crop("services-full.png","crop-services-faq.png",9200,11604,1100)
