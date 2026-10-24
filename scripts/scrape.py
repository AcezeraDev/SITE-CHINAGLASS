"""Extrai produtos, categorias e imagens de chinaglass.com.br (Loja Integrada)."""
import hashlib, html, json, os, re, sys, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

BASE = "https://www.chinaglass.com.br"
OUT = "\\\\?\\" + os.path.abspath(sys.argv[1])
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
IMG_DIR = os.path.join(OUT, "imagens")
DATA_DIR = os.path.join(OUT, "dados")


def get(url, binary=False, tries=3):
    for i in range(tries):
        try:
            safe = urllib.parse.quote(url, safe=":/?&=%#+,")
            with urllib.request.urlopen(urllib.request.Request(safe, headers=UA), timeout=60) as r:
                b = r.read()
                return b if binary else b.decode("utf-8", "replace")
        except Exception as e:
            if i == tries - 1:
                print("ERRO", url, e)
                return None
            time.sleep(2)


def original(url):
    """Remove o segmento de tamanho (ex.: /2500x2500/) para pegar o arquivo original."""
    url = html.unescape(url).split("?")[0]
    if url.startswith("//"):
        url = "https:" + url
    return re.sub(r"cdn\.awsli\.com\.br/\d+x\d+/", "cdn.awsli.com.br/", url)


def slug_of(url):
    return urlparse(url).path.strip("/").replace("/", "_") or "home"


def clean(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()


class Block(HTMLParser):
    """Captura o HTML interno do primeiro elemento cujo atributo bate com `match`."""

    def __init__(self, match):
        super().__init__(convert_charrefs=False)
        self.match, self.depth, self.tag, self.buf, self.done = match, 0, None, [], False

    def handle_starttag(self, tag, attrs):
        if self.done:
            return
        if self.depth:
            if tag == self.tag:
                self.depth += 1
            self.buf.append(self.get_starttag_text())
        elif self.match(dict(attrs)):
            self.tag, self.depth = tag, 1

    def handle_endtag(self, tag):
        if self.depth and not self.done:
            if tag == self.tag:
                self.depth -= 1
                if not self.depth:
                    self.done = True
                    return
            self.buf.append(f"</{tag}>")

    def handle_data(self, d):
        if self.depth and not self.done:
            self.buf.append(d)

    handle_entityref = lambda self, n: self.handle_data(f"&{n};")
    handle_charref = lambda self, n: self.handle_data(f"&#{n};")


def inner(page, match):
    p = Block(match)
    p.feed(page)
    return "".join(p.buf)


def html_to_text(h):
    """Converte a descrição em texto legível preservando parágrafos e linhas de tabela."""
    h = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", "", h)
    h = re.sub(r"(?i)</t[dh]>\s*", " | ", h)
    h = re.sub(r"(?i)<br\s*/?>|</(p|div|tr|li|h\d)>", "\n", h)
    h = re.sub(r"(?i)<li[^>]*>", "- ", h)
    t = html.unescape(re.sub(r"<[^>]+>", "", h)).replace("\xa0", " ")
    lines = [re.sub(r"[ \t]+", " ", l).strip(" |") for l in t.splitlines()]
    out = []
    for l in lines:
        if l or (out and out[-1]):
            out.append(l)
    return "\n".join(out).strip()


def meta(page, key):
    m = re.search(r'<meta[^>]+(?:name|property)="%s"[^>]+content="([^"]*)"' % re.escape(key), page)
    return html.unescape(m.group(1)).strip() if m else ""


def sitemap(name):
    x = get(f"{BASE}/sitemap/{name}-1.xml") or ""
    return [html.unescape(u) for u in re.findall(r"<loc>([^<]+)</loc>", x)]


downloads = {}  # url -> caminho local


def queue(url, folder, name=None):
    url = original(url)
    if url in downloads:
        return downloads[url]
    fname = name or unquote(os.path.basename(urlparse(url).path))
    stem, ext = os.path.splitext(fname)
    if len(stem) > 45:
        stem = stem[:40] + "-" + hashlib.md5(url.encode()).hexdigest()[:4]
    fname = stem + ext
    path = os.path.join(folder, fname)
    downloads[url] = path
    return path


def rel(p):
    return os.path.relpath(p, OUT).replace("\\", "/")


# ---------- categorias ----------
categorias = []
for url in sitemap("category"):
    page = get(url) or ""
    nome = clean(re.search(r'<h1 class="titulo[^"]*">(.*?)</h1>', page, re.S).group(1)) if "<h1 class=\"titulo" in page else ""
    ids = re.findall(r'<div class="listagem-item prod-id-(\d+)', page)
    desc = html_to_text(inner(page, lambda a: "categoria-descricao" in (a.get("class") or "")))
    categorias.append({
        "nome": nome, "url": url, "slug": slug_of(url),
        "titulo_pagina": clean(re.search(r"<title>(.*?)</title>", page, re.S).group(1)) if "<title>" in page else "",
        "meta_description": meta(page, "description"),
        "descricao": desc, "produto_ids": ids,
    })
    print("categoria", nome, len(ids))

cat_por_produto = {}
for c in categorias:
    for i in c["produto_ids"]:
        cat_por_produto.setdefault(i, []).append(c["nome"])

# ---------- produtos ----------
produtos = []


def parse_produto(url):
    page = get(url)
    if not page:
        return None
    slug = slug_of(url)
    pid = (re.search(r'data-id="(\d+)"', page) or re.search(r"/produto/(\d+)/", page))
    pid = pid.group(1) if pid else ""
    nome = clean((re.search(r'<h1 class="nome-produto[^"]*"[^>]*>(.*?)</h1>', page, re.S) or [None, ""])[1])
    sku = clean((re.search(r'itemprop="sku">(.*?)<', page) or [None, ""])[1])
    bc = re.search(r'<div class="breadcrumbs.*?</ul>', page, re.S)
    trilha = [clean(a) for a in re.findall(r"<a [^>]*>(.*?)</a>", re.sub(r"<!--.*?-->", "", bc.group(0), flags=re.S))] if bc else []
    galeria = list(dict.fromkeys(re.findall(r'data-imagem-grande="([^"]+)"', page)))
    if not galeria:
        og = meta(page, "og:image")
        galeria = [og] if og else []
    desc_html = inner(page, lambda a: a.get("id") == "descricao")
    desc_imgs = list(dict.fromkeys(re.findall(r'<img[^>]+src="([^"]+)"', desc_html)))
    videos = list(dict.fromkeys(re.findall(r"(?:youtube\.com/embed/|youtu\.be/|youtube\.com/watch\?v=)([\w-]{11})", page)))
    preco = "Preço sob consulta" if "produto-consulta-preco" in page else clean((re.search(r'itemprop="price"[^>]*content="([^"]+)"', page) or [None, ""])[1])
    pasta = os.path.join(IMG_DIR, "produtos", f"{pid}-{slug[:35]}")
    fotos = [queue(u, pasta, f"{n:02d}-{unquote(os.path.basename(urlparse(original(u)).path))}") for n, u in enumerate(galeria, 1)]
    fotos_desc = [queue(u, os.path.join(pasta, "descricao")) for u in desc_imgs if "awsli" in u or u.startswith("/")]
    return {
        "id": pid, "nome": nome, "sku": sku, "url": url, "slug": slug,
        "categorias": cat_por_produto.get(pid) or trilha[1:],
        "trilha": trilha, "preco": preco,
        "titulo_pagina": clean((re.search(r"<title>(.*?)</title>", page, re.S) or [None, ""])[1]),
        "meta_description": meta(page, "description"),
        "meta_keywords": meta(page, "keywords"),
        "videos_youtube": [f"https://www.youtube.com/watch?v={v}" for v in videos],
        "descricao": html_to_text(desc_html),
        "descricao_html": desc_html.strip(),
        "imagens_galeria_url": [original(u) for u in galeria],
        "imagens_descricao_url": [original(u) for u in desc_imgs],
        "imagens_galeria": [rel(p) for p in fotos],
        "imagens_descricao": [rel(p) for p in fotos_desc],
    }


with ThreadPoolExecutor(6) as ex:
    for p in ex.map(parse_produto, sitemap("product")):
        if p:
            produtos.append(p)
            print("produto", p["sku"], len(p["imagens_galeria"]), "+", len(p["imagens_descricao"]), p["nome"][:60])

# ---------- home: logo, banners, selos ----------
home = get(BASE + "/") or ""
banners = []
for m in re.finditer(r'<img[^>]+src="([^"]+/(?:banner|logo|marca)/[^"]+)"[^>]*?(?:alt="([^"]*)")?', home):
    src, alt = m.group(1), html.unescape(m.group(2) or "")
    tipo = re.search(r"/(banner|logo|marca)/", src).group(1)
    p = queue(src, os.path.join(IMG_DIR, {"banner": "banners", "logo": "logo", "marca": "logo"}[tipo]))
    banners.append({"tipo": tipo, "alt": alt, "url": original(src), "arquivo": rel(p)})
for m in re.finditer(r'(?:href|src)="([^"]*?/favicon[^"]*)"', home):
    queue(m.group(1) if m.group(1).startswith("http") else BASE + m.group(1), os.path.join(IMG_DIR, "logo"))

site = {
    "url": BASE, "nome": "China Glass", "plataforma": "Loja Integrada",
    "titulo": clean((re.search(r"<title>(.*?)</title>", home, re.S) or [None, ""])[1]),
    "meta_description": meta(home, "description"),
    "telefones": sorted(set(re.findall(r"\(\d{2}\)\s?\d{4,5}-\d{4}", clean(home)))),
    "emails": sorted(set(re.findall(r"[\w.+-]+@chinaglass\.com\.br", home))),
    "cnpj": (re.search(r"\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}", home) or [""])[0],
    "sobre": html_to_text(inner(home, lambda a: "sobre-loja-rodape" in (a.get("class") or "") or "institucional" in (a.get("class") or ""))),
    "redes_sociais": sorted(set(u for u in re.findall(r'href="([^"]+)"', home) if re.search(r"facebook|instagram|youtube|youtu\.be|linkedin|wa\.me|whatsapp", u))),
    "banners_e_logos": banners,
}

# ---------- download ----------
def baixar(item):
    url, path = item
    if os.path.exists(path) and os.path.getsize(path):
        return url, path, True
    b = get(url, binary=True)
    if not b:
        return url, path, False
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "wb") as f:
        f.write(b)
    return url, path, True


falhas = []
with ThreadPoolExecutor(8) as ex:
    for url, path, ok in ex.map(baixar, downloads.items()):
        if not ok:
            falhas.append(url)

os.makedirs(DATA_DIR, exist_ok=True)
for c in categorias:
    c["produtos"] = [p["nome"] for p in produtos if p["id"] in c["produto_ids"]]
json.dump(site, open(os.path.join(DATA_DIR, "site.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
json.dump(categorias, open(os.path.join(DATA_DIR, "categorias.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
json.dump(produtos, open(os.path.join(DATA_DIR, "produtos.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
desc_dir = os.path.join(DATA_DIR, "descricoes")
os.makedirs(desc_dir, exist_ok=True)
for p in produtos:
    with open(os.path.join(desc_dir, p["id"] + "-" + p["slug"][:50] + ".md"), "w", encoding="utf-8") as f:
        f.write(f"# {p['nome']}\n\n- Código: {p['sku']}\n- Categorias: {', '.join(p['categorias'])}\n- URL: {p['url']}\n")
        if p["videos_youtube"]:
            f.write(f"- Vídeos: {', '.join(p['videos_youtube'])}\n")
        f.write("\n## Descrição\n\n" + p["descricao"] + "\n")

print(f"\nPRODUTOS {len(produtos)} | CATEGORIAS {len(categorias)} | IMAGENS {len(downloads) - len(falhas)}/{len(downloads)}")
for u in falhas:
    print("FALHOU", u)
