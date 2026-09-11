from PIL import Image
import sys, numpy as np
im=Image.open(sys.argv[1]).convert("RGB")
a=np.asarray(im).astype(int)
h,w,_=a.shape
sat=a.max(axis=2)-a.min(axis=2); lum=a.sum(axis=2)/3
ink=(sat>14)|(lum<246)
def runs(y0,y1,lab,frac=0.92,minw=25,xmax=760):
    m=ink[y0:y1,:xmax]
    cs=m.sum(axis=0); H=y1-y0
    on=cs>=H*frac
    out=[];cur=None
    for i,v in enumerate(on):
        if v and cur is None: cur=i
        elif not v and cur is not None:
            if i-cur>minw: out.append((cur,i-1))
            cur=None
    if cur is not None: out.append((cur,xmax-1))
    print(lab,"H=",H)
    for (x0,x1) in out:
        mm=ink[:,x0:x1+1]; rs=mm.sum(axis=1)
        ys=np.where(rs>=(x1-x0+1)*0.9)[0]
        print(f"   x {x0}-{x1} w{x1-x0+1}   ytall {ys.min() if len(ys) else '-'}-{ys.max() if len(ys) else '-'}")
runs(60,200,"HERO photo")
runs(310,360,"PAIR photos")
runs(440,520,"TRIO photos")
