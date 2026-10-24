"""Copia e otimiza (WebP) as imagens do catálogo usadas na página inicial."""
import os
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "chinaglass", "imagens"))
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "img"))
os.makedirs(OUT, exist_ok=True)

PROD = os.path.join(ROOT, "produtos")


def first(prefix):
    d = next(x for x in os.listdir(PROD) if x.startswith(prefix + "-"))
    d = os.path.join(PROD, d)
    return os.path.join(d, sorted(f for f in os.listdir(d) if os.path.isfile(os.path.join(d, f)))[0])


def save(src, name, max_w=1400, crop=None, quality=82):
    im = Image.open(src).convert("RGB")
    if crop:
        im = im.crop(crop(im.size))
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT, name + ".webp"), "WEBP", quality=quality, method=6)
    print(name, im.size)


MAQUINAS = {
    "carregadora-mesa": "364216038",
    "mesa-corte-4200": "397708527",
    "bilateral-20": "91095488",
    "lapidadora-copo-10": "242693919",
    "furadeira-4": "402869343",
    "lavadora-horizontal": "59082959",
    "centro-usinagem": "398723570",
    "forno-eva": "398873522",
    "laser-140w": "278452532",
    "linha-bilateral": "277831702",
    "mesa-3em1": "81769971",
    "lavadora-vertical": "25035495",
    "canteadeira": "211000219",
    "jateadora": "35239646",
    "elevador": "400260991",
    "ventosa-eletrica": "401747760",
}
for name, pid in MAQUINAS.items():
    save(first(pid), name, max_w=1100)

B = os.path.join(ROOT, "banners")
# Linhas de lapidação: corta o título e os logos do topo
save(os.path.join(B, "2023-06-14-10-53-53-5esmsugwdj.jpg"), "linha-foto", 1160, lambda s: (0, 56, s[0], s[1]))
save(os.path.join(B, "2023-06-14-10-53-53---i3erll9kg6.jpg"), "linha-desenho", 1160, lambda s: (0, 56, s[0], s[1]))
# Peças: remove a legenda da parte de baixo
save(os.path.join(B, "d75d33b7d6.jpg"), "pecas-mesa-corte", 800, lambda s: (0, 0, 560, 425))
save(os.path.join(B, "d75d33b7d6.jpg"), "pecas-pincas", 800, lambda s: (584, 0, s[0], 425))
save(os.path.join(B, "c48b83fe97.jpg"), "pecas-escovas", 800, lambda s: (0, 0, s[0], 420))
save(os.path.join(B, "4a0917ad7f.jpg"), "pecas-mandril", 800, lambda s: (0, 0, s[0], 420))
save(os.path.join(B, "7bc5dbb51d.jpg"), "fachada", 1600)
# Foto real de fábrica
save(os.path.join(PROD, "343610648-carregadora-vidro-bilateral", "01-1-j5lnj9p5hj.jpg"), "fabrica", 1600)
