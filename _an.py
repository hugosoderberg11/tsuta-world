from PIL import Image
import sys, numpy as np
p=sys.argv[1]
im=Image.open(p).convert("RGB")
a=np.asarray(im).astype(int)
print("size",im.size)
h,w,_=a.shape
# non-white mask
nz = (a.max(axis=2)-a.min(axis=2) > 18) | (a.sum(axis=2) < 700)
def band(y0,y1,label):
    m=nz[y0:y1]
    cols=m.sum(axis=0)
    xs=np.where(cols>3)[0]
    rows=m.sum(axis=1)
    ys=np.where(rows>3)[0]
    print(label,"x",xs.min() if len(xs) else None, xs.max() if len(xs) else None,
          "y",(ys.min()+y0) if len(ys) else None,(ys.max()+y0) if len(ys) else None)
    return cols
cols=band(0,h,"ALL")
# print column profile coarse
for y0,y1,lab in [(0,int(h*0.45),"hero"),(int(h*0.45),int(h*0.72),"pair"),(int(h*0.72),h,"trio")]:
    band(y0,y1,lab)
