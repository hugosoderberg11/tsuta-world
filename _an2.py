from PIL import Image
import sys, numpy as np
p=sys.argv[1]
im=Image.open(p).convert("RGB")
a=np.asarray(im).astype(int)
h,w,_=a.shape
nz = (a.max(axis=2)-a.min(axis=2) > 18) | (a.sum(axis=2) < 700)
def prof(y0,y1,lab,step=1):
    cols=nz[y0:y1].sum(axis=0)
    s="".join("#" if c> (y1-y0)*0.5 else ("+" if c>(y1-y0)*0.15 else ("." if c>2 else " ")) for c in cols)
    print(lab)
    for i in range(0,w,120):
        print(f"{i:4d} |{s[i:i+120]}|")
def rowprof(x0,x1,lab):
    rows=nz[:,x0:x1].sum(axis=1)
    s="".join("#" if c>(x1-x0)*0.5 else ("+" if c>(x1-x0)*0.15 else ("." if c>2 else " ")) for c in rows)
    print(lab, "".join(s))
prof(0,255,"HERO cols")
prof(255,408,"PAIR cols")
prof(408,h,"TRIO cols")
