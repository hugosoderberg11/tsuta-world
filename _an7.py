from PIL import Image
import sys, numpy as np
im=Image.open(sys.argv[1]).convert("RGB")
a=np.asarray(im).astype(int)
h,w,_=a.shape
sat=a.max(axis=2)-a.min(axis=2); lum=a.sum(axis=2)/3
strong=(sat>45)|(lum<160)
def runs(y0,y1,lab,frac=0.45):
    m=strong[y0:y1,:]
    cs=m.sum(axis=0); H=y1-y0
    on=cs> H*frac
    out=[];cur=None
    for i,v in enumerate(on):
        if v and cur is None: cur=i
        elif not v and cur is not None:
            if i-cur>25: out.append((cur,i-1))
            cur=None
    if cur is not None: out.append((cur,w-1))
    print(lab, "H=",H)
    for (x0,x1) in out:
        mm=strong[y0:y1,x0:x1+1]; rs=mm.sum(axis=1)
        ys=np.where(rs> (x1-x0+1)*0.45)[0]
        print(f"   x {x0}-{x1} w{x1-x0+1}   y {y0+ys.min()}-{y0+ys.max()} h{ys.max()-ys.min()+1}")
runs(25,230,"HERO photo",0.75)
runs(295,370,"PAIR photos",0.6)
runs(425,530,"TRIO photos",0.6)
