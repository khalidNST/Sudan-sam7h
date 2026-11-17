"""استخراج صور الملف وتحويلها لـ WebP مضغوطة.
الاستخدام:  py tools/extract_images.py "مسار/الملف.pdf"
"""
import sys, io, os
import pymupdf as fitz
from PIL import Image

# (رقم الصفحة، ترتيب الصورة في الصفحة) ← اسم الملف
MAP = {
  (2,0):'wardi', (2,1):'mohamed-alamin',
  (3,0):'mustafa-sidahmed', (3,2):'sayed-khalifa',
  (4,0):'alkashif', (4,1):'asma-hamza',
  (5,0):'nancy-ajaj', (5,2):'huda-arabi',
  (6,0):'omar-alamin', (6,2):'shukrallah', (6,4):'mustafa-alsunni', (6,6):'rimaz',
  (7,0):'nada-algalaa', (7,1):'iman-alsharif',
  (8,0):'flippter', (8,2):'soulja',
  (9,0):'haleem', (9,2):'dafencii', (9,4):'kordofani', (9,6):'awab',
  (10,0):'colo', (10,2):'connan', (10,3):'montiyago',
  (11,0):'trend-sayed-malik', (11,1):'trend-kara',
  (12,0):'doka', (12,1):'mufraka', (12,2):'gadah', (12,3):'tabag', (12,4):'fundug', (12,5):'zeer',
  (13,0):'gulla', (13,1):'jebena', (13,2):'siin', (13,3):'angareeb', (13,4):'mabkhar', (13,6):'mugshasha',
  (13,7):'birish', (13,8):'muhbash', (13,9):'koz',
}
pdf = sys.argv[1]
out = os.path.join(os.path.dirname(__file__), '..', 'public', 'images')
doc = fitz.open(pdf)
for (pg, idx), name in MAP.items():
    xref = doc[pg-1].get_images(full=True)[idx][0]
    im = Image.open(io.BytesIO(doc.extract_image(xref)['image'])).convert('RGB')
    im.thumbnail((640, 640))
    im.save(os.path.join(out, name + '.webp'), 'WEBP', quality=80, method=6)
    print(name, im.size)
