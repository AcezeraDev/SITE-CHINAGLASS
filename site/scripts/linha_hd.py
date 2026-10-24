"""Monta a faixa da linha de lapidação em alta a partir de um módulo gerado (lapidadora + transfer).

Uso: python linha_hd.py <modulo.png>
Gera public/img/linha-foto.webp (foto) e public/img/linha-desenho.webp (desenho técnico tirado das bordas da foto).
"""
import os
import sys
from PIL import Image, ImageChops, ImageFilter, ImageOps

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "img"))
mod = Image.open(sys.argv[1]).convert("RGB")
W, H = mod.size

# faixa vertical onde há máquina (ignora o branco de cima e de baixo)
diff = ImageChops.difference(mod, Image.new("RGB", mod.size, "white")).convert("L").point(lambda v: 255 if v > 18 else 0)
_, top, _, bottom = diff.getbbox()
top, bottom = max(0, top - 16), min(H, bottom + 24)
band = mod.crop((0, top, W, bottom))
bh = band.height

# fim da lapidadora (antes do transfer): primeira coluna quase toda branca depois do meio-esquerdo
cols = diff.crop((0, top, W, bottom))
def coluna_vazia(x):
    return sum(cols.getpixel((x, y)) for y in range(0, bh, 2)) < 255 * 6
fim_lap = next((x for x in range(int(W * 0.55), int(W * 0.7)) if coluna_vazia(x)), int(W * 0.6))

# 3 módulos + lapidadora final, com fusão de 24 px nas emendas
SEAM = 24
step = W - SEAM
total = step * 3 + fim_lap + SEAM
strip = Image.new("RGB", (total, bh), "white")
mask = Image.linear_gradient("L").rotate(90).resize((SEAM, bh))  # 0→255 da esquerda para a direita
for i in range(4):
    x = i * step
    piece = band if i < 3 else band.crop((0, 0, fim_lap + SEAM, bh))
    if i == 0:
        strip.paste(piece, (0, 0))
        continue
    strip.paste(piece.crop((SEAM, 0, piece.width, bh)), (x + SEAM, 0))
    region = strip.crop((x, 0, x + SEAM, bh))
    strip.paste(Image.composite(piece.crop((0, 0, SEAM, bh)), region, ImageOps.invert(mask)), (x, 0))

strip.save(os.path.join(OUT, "linha-foto.webp"), "WEBP", quality=84, method=6)

# desenho técnico: bordas da própria foto, em azul-tinta sobre branco (alinha 100% com a foto)
g = ImageOps.grayscale(strip).filter(ImageFilter.GaussianBlur(0.6))
edges = g.filter(ImageFilter.FIND_EDGES)
edges = ImageOps.autocontrast(edges, cutoff=1).point(lambda v: 0 if v < 40 else min(255, int(v * 1.6)))
# o filtro marca a moldura da imagem como borda: zera 3 px em volta
edges = ImageOps.expand(edges.crop((3, 3, edges.width - 3, edges.height - 3)), 3, fill=0)
ink = Image.new("RGB", strip.size, (16, 52, 120))
draw = Image.composite(ink, Image.new("RGB", strip.size, "white"), edges)
draw.save(os.path.join(OUT, "linha-desenho.webp"), "WEBP", quality=84, method=6)

print("faixa", strip.size, "fim da lapidadora", fim_lap)
