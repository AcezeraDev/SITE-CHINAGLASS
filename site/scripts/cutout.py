"""Remove o fundo claro das fotos de máquinas (preenchimento a partir das bordas) e salva WebP com transparência."""
import os
import sys
from collections import deque
from PIL import Image, ImageFilter

IMG = os.path.abspath(os.environ.get("CUT_DIR") or os.path.join(os.path.dirname(__file__), "..", "public", "img"))
NOMES = sys.argv[1:]
TOL = 34  # distância máxima de cor em relação ao fundo


def cutout(name):
    src = os.path.join(IMG, name + ".webp")
    im = Image.open(src).convert("RGB")
    w, h = im.size
    px = im.load()

    # cor de fundo = mediana dos pixels da borda
    border = [px[x, 0] for x in range(w)] + [px[x, h - 1] for x in range(w)] + [px[0, y] for y in range(h)] + [px[w - 1, y] for y in range(h)]
    bg = tuple(sorted(c[i] for c in border)[len(border) // 2] for i in range(3))

    def near(c):
        return abs(c[0] - bg[0]) + abs(c[1] - bg[1]) + abs(c[2] - bg[2]) <= TOL * 3 and min(c) > 170

    mask = Image.new("L", (w, h), 255)
    m = mask.load()
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if m[x, y] == 0 or not near(px[x, y]):
            continue
        m[x, y] = 0
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))

    # suaviza a borda do recorte
    mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = im.convert("RGBA")
    out.putalpha(mask)
    bbox = mask.point(lambda v: 255 if v > 20 else 0).getbbox()
    if bbox:
        pad = 8
        out = out.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(w, bbox[2] + pad), min(h, bbox[3] + pad)))
    out.save(os.path.join(IMG, name + "-cut.webp"), "WEBP", quality=86, method=6)
    print(name, bg, out.size)


for n in NOMES:
    cutout(n)
