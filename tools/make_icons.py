"""يرسم أيقونة اللعبة (باب نوبي) بمقاسات PWA.  الاستخدام: py tools/make_icons.py"""
import os
from PIL import Image, ImageDraw
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'icons')
def draw(S):
    im = Image.new('RGB', (S, S), '#FBF6EC'); d = ImageDraw.Draw(im)
    u = S / 100
    def arch(x0, y0, x1, y1, fill):
        r = (x1 - x0) / 2
        d.pieslice([x0, y0, x1, y0 + 2 * r], 180, 360, fill=fill)
        d.rectangle([x0, y0 + r, x1, y1], fill=fill)
    arch(22*u, 16*u, 78*u, 86*u, '#F2B33A')
    arch(25*u, 19*u, 75*u, 86*u, '#FFFFFF')
    arch(29*u, 23*u, 71*u, 86*u, '#2F7FBF')
    cols = ['#C4553A', '#F2B33A', '#2E8A57']
    w = 6*u
    for i in range(int(42*u // w) + 1):
        x = 29*u + i*w
        if x + w > 71*u + .5: break
        d.polygon([(x, 86*u), (x + w/2, 80*u), (x + w, 86*u)], fill=cols[i % 3])
    for i in range(5):  # معيّنات أعلى الباب
        cx, cy, r = 38*u + i*6*u, 34*u, 2*u
        d.polygon([(cx, cy-r), (cx+r, cy), (cx, cy+r), (cx-r, cy)], fill='#F2B33A')
    d.rectangle([0, 86*u, S, S], fill='#1E2B4A')
    return im
for s in (192, 512):
    draw(s).save(os.path.join(OUT, f'icon-{s}.png'))
print('ok')
