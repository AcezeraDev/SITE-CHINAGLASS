"""Gera src/maquinasData.ts e as fotos das máquinas a partir de ../chinaglass/dados.

Uso: python scripts/gen_maquinas.py
"""
import json, os, re
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
DADOS = os.path.join(SITE, "..", "chinaglass", "dados")
IMGS = os.path.join(SITE, "..", "chinaglass")
OUT_IMG = os.path.join(SITE, "public", "img", "maquinas")
OUT_TS = os.path.join(SITE, "src", "maquinasData.ts")
OUT_CATS = os.path.join(SITE, "src", "maquinasCategorias.ts")
FOTOS_POR_MAQUINA = 4

fichas = json.load(open(os.path.join(DADOS, "fichas_maquinas.json"), encoding="utf-8"))["maquinas"]
produtos = {p["id"]: p for p in json.load(open(os.path.join(DADOS, "produtos.json"), encoding="utf-8"))}

# Categorias do menu do site original -> rótulo e endereço no site novo
CATEGORIAS = [
    ("Mesa corte vidro automática", "Mesas de corte", "mesa-de-corte"),
    ("Linha Lapidação", "Linha de lapidação", "lapidacao"),
    ("Bilateral", "Bilateral", "bilateral"),
    ("Biseladora", "Biseladora", "biseladora"),
    ("Furadeira", "Furadeira", "furadeira"),
    ("Lavadora", "Lavadora", "lavadora"),
    ("Jateadora", "Jateadora", "jateadora"),
    ("Laser", "Laser", "laser"),
    ("Centro Usinagem CNC", "Centro de usinagem CNC", "centro-usinagem"),
    ("Forno Laminação EVA", "Forno laminação EVA", "forno-eva"),
    ("Carregadoras / Descarregadoras", "Carregadoras e movimentação", "carregadoras"),
]
ORIGINAL = {o: slug for o, _, slug in CATEGORIAS}
# produto sem categoria no site original
SEM_CATEGORIA = {"355775590": ["mesa-de-corte"]}

# Nome curto para cartões e títulos (o nome completo do site original vai em nomeOriginal)
NOMES = {
    "81770856": "Linha de corte automática 4200 / 6100 mm (Jumbo)",
    "217194615": "Linha de corte de vidro laminado",
    "355775590": "Mesa de corte de laminado semi-automática",
    "384386974": "Mesa de corte CNC XYZ com braço basculante",
    "397708527": "Mesa de corte CNC 4200 × 2800 mm",
    "81769971": "Mesa de corte CNC 3 em 1 (3660 mm)",
    "355640119": "Mesa de corte CNC basculante 3600 mm",
    "344423780": "Mesa de corte CNC XYZ 3600 mm",
    "34607018": "Modeladora semi-automática",
    "299665459": "Lapidadora copo 9 rebolos inox com PLC Siemens",
    "26195533": "Lapidadora copo 9 rebolos com display digital",
    "242693919": "Lapidadora copo 10 rebolos inox",
    "23523155": "Lapidadora copo 9 rebolos inox automática",
    "277831702": "Linha de lapidação bilateral 20 ou 24 motores",
    "211000219": "Canteadeira automática",
    "25036002": "Turnover: mesa de transferência automática",
    "180212740": "Bilateral periférica 12 ou 8 rebolos",
    "91095488": "Lapidadora bilateral 20 rebolos",
    "81791287": "Biseladora 9 rebolos",
    "55679219": "Furadeira 3 posições duplo cabeçote",
    "402869343": "Furadeira 4 posições duplo cabeçote",
    "23525454": "Furadeira automática duplo cabeçote",
    "34607218": "Lavadora horizontal inox com turbo ventilador",
    "25035495": "Lavadora vertical Open Top",
    "59082959": "Lavadora horizontal inox",
    "35239646": "Jateadora automática M3",
    "278452532": "Marcação a laser 140 W",
    "398723570": "Centro de usinagem CNC",
    "398873522": "Forno de laminação EVA 3 bandejas",
    "275917064": "Carregadora para mesa de corte (1 a 6 cavaletes)",
    "343610648": "Carregadora robótica 4 eixos para bilateral",
    "380647494": "Carregadora para lapidadora vertical",
    "237682619": "Carregadora para lapidadora bilateral",
    "364216038": "Carregadora móvel 3660 mm com controle remoto",
    "380651875": "Descarregadora para lapidadora vertical",
    "400260991": "Elevador a vácuo com braço articulado",
    "401747760": "Ventosa elétrica a bateria 400 kg",
    "401747573": "Ventosa pneumática 350 kg",
}

# Fotos a mais na ficha, escolhidas à mão: "g5" = 6ª foto da galeria, "d0" = 1ª imagem da descrição.
# Só fotos, renders e plantas de layout; logos de fornecedores e tabelas ficam de fora.
EXTRAS = {
    "81791287": ["d0"],
    "237682619": ["d0"],
    "398723570": ["d0", "d1", "d2"],
    "398873522": ["d0"],
    "278452532": ["d0", "d2", "d4", "d6", "d8", "d9"],
    "91095488": ["d0", "d5"],
    "26195533": ["d0", "g4", "g5", "g6"],
    "242693919": ["d0"],
    "59082959": ["g4", "g5", "g6", "g7", "d0"],
    "34607218": ["d0", "d1", "d2"],
    "25035495": ["g4"],
    "180212740": ["d1"],
    "81770856": ["d2", "d3"],
    "277831702": ["d0", "d1", "g4", "g8", "g9", "g10", "g11", "g13", "g16", "g17"],
    "397708527": ["d0"],
    "81769971": ["g4", "g5", "g6", "g8", "d2"],
    "344423780": ["d0", "d1"],
    "355640119": ["d0", "d1"],
    "34607018": ["d0", "g4", "g5", "g6"],
}
# Das 4 primeiras fotos da galeria, as que são tabela ou logo
FORA = {
    "35239646": ["g1", "g2", "g3"],
    "23525454": ["g3"],
    "91095488": ["g3"],
}

SIGLAS = {"cnc", "xyz", "eva", "plc", "abb", "ihm", "inox", "low-e", "ii"}


def titulo(nome):
    """Nomes em caixa alta viram frase; mantém siglas e medidas."""
    nome = re.sub(r"\s+", " ", nome.replace(" ", " ")).strip(" .,")
    letras = [c for c in nome if c.isalpha()]
    if letras and sum(c.isupper() for c in letras) / len(letras) < 0.6:
        return nome
    out = []
    for i, w in enumerate(nome.split(" ")):
        lw = w.lower()
        if lw.strip("().,/") in SIGLAS:
            out.append(w.upper() if lw != "inox" else "inox")
        elif "china" == lw:
            out.append("China")
        elif "glass" == lw:
            out.append("Glass")
        else:
            out.append(lw.capitalize() if i == 0 else lw)
    return " ".join(out)


def foto(src_rel, dest, max_w=1000):
    src = os.path.join(IMGS, src_rel)
    im = Image.open(src)
    im = im.convert("RGBA")
    fundo = Image.new("RGBA", im.size, (255, 255, 255, 255))
    im = Image.alpha_composite(fundo, im).convert("RGB")
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT_IMG, dest), "WEBP", quality=80, method=6)


os.makedirs(OUT_IMG, exist_ok=True)

# rótulos das especificações mostradas na ficha, na ordem
SPECS = [
    ("tamanhos", "Tamanhos"), ("modelo", "Modelo"), ("automacao", "Automação"),
    ("espessura", "Espessura"), ("vidro_min", "Vidro mínimo"), ("vidro_max", "Vidro máximo"),
    ("velocidade", "Velocidade"), ("capacidade", "Capacidade"), ("rebolos", "Rebolos / motores"),
    ("potencia_kw", "Potência"), ("potencia_laser", "Potência do laser"), ("tensao", "Alimentação"),
    ("ar", "Ar comprimido"), ("peso_kg", "Peso"), ("dimensoes", "Dimensões"), ("area", "Área ocupada"),
]

maquinas = []
for f in fichas:
    p = produtos[f["id"]]
    cats = [ORIGINAL[c] for c in p["categorias"] if c in ORIGINAL] or SEM_CATEGORIA.get(f["id"], [])
    cats = list(dict.fromkeys(cats))
    imgs = []
    galeria = [f"g{i}" for i in range(min(FOTOS_POR_MAQUINA, len(p["imagens_galeria"])))]
    for chave in [c for c in galeria if c not in FORA.get(f["id"], [])] + EXTRAS.get(f["id"], []):
        lista, i = ("imagens_galeria" if chave[0] == "g" else "imagens_descricao"), int(chave[1:])
        # fotos da galeria mantêm o nome antigo (id-1.webp); as extras levam a chave (id-d0.webp)
        nome = f"{f['id']}-{i + 1}.webp" if chave in galeria else f"{f['id']}-{chave}.webp"
        if not os.path.exists(os.path.join(OUT_IMG, nome)):
            foto(p[lista][i], nome)
        imgs.append(f"/img/maquinas/{nome}")
    specs = []
    for k, label in SPECS:
        v = f.get(k, "")
        if not v:
            continue
        if k == "potencia_kw":
            v = f"{v} kW"
        if k == "peso_kg":
            v = f"{v} kg"
        specs.append([label, v])
    maquinas.append({
        "id": f["id"],
        "codigo": f["codigo"],
        "nome": NOMES[f["id"]],
        "nomeOriginal": titulo(p["nome"]),
        "tipo": f["familia"],
        "categorias": cats,
        "imgs": imgs,
        "specs": specs,
        "comando": f["comando"],
        "marcas": f["marcas"],
        "destaques": f["destaques"],
        "fichaEmImagem": bool(f["spec_em_imagem"]),
        "videos": [v.split("v=")[1] for v in p["videos_youtube"]],
        "url": p["url"],
    })

ordem = {slug: i for i, (_, _, slug) in enumerate(CATEGORIAS)}
maquinas.sort(key=lambda m: (ordem.get(m["categorias"][0], 99) if m["categorias"] else 99, m["nome"]))

cats_ts = [
    {"slug": s, "nome": n, "original": o, "total": sum(s in m["categorias"] for m in maquinas)}
    for o, n, s in CATEGORIAS
]
cats_src = f"""// Gerado por scripts/gen_maquinas.py. Não edite à mão.
// Separado de maquinasData para o menu não carregar o catálogo inteiro.

export type CategoriaMaquina = {{ slug: string; nome: string; original: string; total: number }}

export const TOTAL_MAQUINAS = {len(maquinas)}

/** Categorias do menu do site original (chinaglass.com.br), sem "Partes e Peças", que tem página própria */
export const CATEGORIAS_MAQUINAS: CategoriaMaquina[] = {json.dumps(cats_ts, ensure_ascii=False, indent=2)}
"""
open(OUT_CATS, "w", encoding="utf-8").write(cats_src)

ts = f"""// Gerado por scripts/gen_maquinas.py a partir de ../chinaglass/dados. Não edite à mão.

export {{ CATEGORIAS_MAQUINAS, TOTAL_MAQUINAS, type CategoriaMaquina }} from "./maquinasCategorias"

export type MaquinaCatalogo = {{
  id: string
  codigo: string
  nome: string
  nomeOriginal: string
  tipo: string
  categorias: string[]
  imgs: string[]
  specs: [string, string][]
  comando: string
  marcas: string
  destaques: string
  fichaEmImagem: boolean
  videos: string[]
  url: string
}}

export const MAQUINAS: MaquinaCatalogo[] = {json.dumps(maquinas, ensure_ascii=False, indent=2)}
"""
open(OUT_TS, "w", encoding="utf-8").write(ts)
print(len(maquinas), "máquinas;", sum(len(m["imgs"]) for m in maquinas), "fotos")
for m in maquinas:
    print(m["categorias"], "|", m["nome"])
