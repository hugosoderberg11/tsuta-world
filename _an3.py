from PIL import Image
import sys, numpy as np
im=Image.open(sys.argv[1]).convert("RGB")
a=np.asarray(im).astype(int)
h,w,_=a.shape
sat=a.max(axis=2)-a.min(axis=2)
lum=a.sum(axis=2)/3
ink = (sat>25)|(lum<225)
def bbox(x0,x1,y0,y1,lab,thr=1):
    m=ink[y0:y1,x0:x1]
    cs=m.sum(axis=0); rs=m.sum(axis=1)
    xs=np.where(cs>=thr)[0]; ys=np.where(rs>=thr)[0]
    if len(xs)==0: print(lab,"empty"); return
    print(f"{lab:24s} x {x0+xs.min():4d}-{x0+xs.max():4d} (w {xs.max()-xs.min()+1:4d})  y {y0+ys.min():4d}-{y0+ys.max():4d} (h {ys.max()-ys.min()+1:4d})")
# photo 01: strong ink only
strong=(sat>40)|(lum<170)
m=strong[0:255,300:760]
cs=m.sum(axis=0); rs=m.sum(axis=1)
xs=np.where(cs>20)[0]; ys=np.where(rs>60)[0]
print("PHOTO01 x",300+xs.min(),300+xs.max(),"y",ys.min(),ys.max())
bbox(20,80,20,70,"01 number")
bbox(85,200,25,60,"01 en label")
bbox(70,300,70,150,"01 catch")
bbox(70,300,150,225,"01 desc")
bbox(70,300,225,245,"01 viewmore")
bbox(650,700,20,240,"01 vert")
bbox(255,340,140,215,"01 script")
bbox(20,80,255,290,"02 number")
bbox(60,200,270,295,"02 en")
bbox(25,180,295,370,"02 photo")
bbox(195,340,280,320,"02 catch")
bbox(195,340,320,365,"02 desc")
bbox(355,410,250,290,"03 number")
bbox(400,500,250,285,"03 en")
bbox(360,520,285,385,"03 photo")
bbox(525,700,290,320,"03 catch")
bbox(525,700,320,360,"03 desc")
bbox(20,80,405,440,"04 number")
bbox(25,190,425,530,"04 photo")
bbox(190,340,430,470,"04 catch")
bbox(255,305,405,440,"05 number")
bbox(485,530,405,440,"06 number")
