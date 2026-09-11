from PIL import Image
import sys, numpy as np
im=Image.open(sys.argv[1]).convert("RGB")
a=np.asarray(im).astype(int)
h,w,_=a.shape
print("size",w,h)
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
    if cur is not None: bands.append((y0+cur,y1-1))
    print(lab)
    for (b0,b1) in bands:
        mm=ink[b0:b1+1,x0:x1]; cs=mm.sum(axis=0); xs=np.where(cs>=1)[0]
        print(f"   y {b0}-{b1} h{b1-b0+1:3d}  x {x0+xs.min()}-{x0+xs.max()}")
for spec in sys.argv[2:]:
    x0,x1,y0,y1,lab=spec.split(",")
    lines(int(x0),int(x1),int(y0),int(y1),lab)
