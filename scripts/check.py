import os, sys

files = [l for l in open(sys.argv[1], encoding="utf-8").read().splitlines() if l]
bad = []
for l in files:
    h = open("\\\\?\\" + os.path.abspath(l), "rb").read(8)
    if not (h[:3] == b"\xff\xd8\xff" or h == b"\x89PNG\r\n\x1a\n" or h[:4] in (b"GIF8", b"RIFF")):
        bad.append(l)
print(len(files), "arquivos; invalidos:", bad)
