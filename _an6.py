from PIL import Image
import sys, numpy as np
im=Image.open(sys.argv[1]).convert("RGB")
a=np.asarray(im).astype(int)
h,w,_=a.shape
sat=a.max(axis=2)-a.min(axis=2); lum=a.sum(axis=2)/3
strong=(sat>45)|(lum<160)
ink=(sat>25)|(lum<225)
def photo(x0,x1,y0,y1,lab,cthr=8,rthr=8):
    m=strong[y0:y1,x0:x1]
    cs=m.sum(axis=0); rs=m.sum(axis=1)
    xs=np.where(cs>cthr)[0]; ys=np.where(rs>rthr)[0]
    print(f"{lab:10s} x {x0+xs.min()}-{x0+xs.max()} w{xs.max()-xs.min()+1}  y {y0+ys.min()}-{y0+ys.max()} h{ys.max()-ys.min()+1}")
photo(300,660,10,250,"photo01")
photo(25,195,290,375,"photo02")
photo(360,525,280,392,"photo03")
photo(25,195,420,535,"photo04")
photo(250,420,420,535,"photo05")
photo(475,650,420,535,"photo06")
def lines(x0,x1,y0,y1,lab,thr=2):
    m=ink[y0:y1,x0:x1]; rs=m.sum(axis=1)
    bands=[];cur=None
    for i,v in enumerate(rs):
        if v>=thr and cur is None: cur=i
        elif v<thr and cur is not None: bands.append((y0+cur,y0+i-1)); cur=None
    if cur is not None: bands.append((y0+cur,y1-1))
    print(lab)
    for (b0,b1) in bands:
        mm=ink[b0:b1+1,x0:x1]; cs=mm.sum(axis=0); xs=np.where(cs>=1)[0]
        print(f"   y {b0}-{b1} h{b1-b0+1:3d}  x {x0+xs.min()}-{x0+xs.max()}")
lines(75,320,150,245,"01 desc/more")
lines(185,350,425,540,"04 catch/desc",3)
lines(350,480,425,540,"05 catch/desc",3)
lines(570,700,425,540,"06 catch/desc",3)
lines(470,545,398,455,"06 num/en")
lines(250,330,398,455,"05 num/en")
lines(655,710,20,240,"01 vert")
