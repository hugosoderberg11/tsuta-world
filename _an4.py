from PIL import Image
import sys, numpy as np
im=Image.open(sys.argv[1]).convert("RGB")
a=np.asarray(im).astype(int)
h,w,_=a.shape
sat=a.max(axis=2)-a.min(axis=2)
lum=a.sum(axis=2)/3
ink=(sat>25)|(lum<225)
def lines(x0,x1,y0,y1,lab,thr=1):
    m=ink[y0:y1,x0:x1]
    rs=m.sum(axis=1)
    bands=[];cur=None
    for i,v in enumerate(rs):
        if v>=thr and cur is None: cur=i
        elif v<thr and cur is not None:
            bands.append((y0+cur,y0+i-1)); cur=None
    if cur is not None: bands.append((y0+cur,y0+y1-y0-1))
    out=[]
    for (b0,b1) in bands:
        mm=ink[b0:b1+1,x0:x1]; cs=mm.sum(axis=0); xs=np.where(cs>=1)[0]
        out.append((b0,b1,b1-b0+1,x0+xs.min(),x0+xs.max()))
    print(lab)
    for o in out: print(f"   y {o[0]}-{o[1]} h{o[2]:3d}  x {o[3]}-{o[4]}")
lines(30,80,10,80,"01 num")
lines(95,175,10,80,"01 en")
lines(75,310,72,250,"01 copy(catch+desc+more)")
lines(28,90,245,300,"02 num")
lines(195,345,275,375,"02 catch/desc")
lines(360,415,240,300,"03 num")
lines(520,690,280,370,"03 catch/desc")
lines(28,90,398,448,"04 num")
lines(185,345,425,530,"04 catch/desc")
lines(255,300,398,448,"05 num")
lines(480,535,398,448,"06 num")
lines(350,470,240,290,"03 en")
