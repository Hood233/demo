#!/usr/bin/env python3
"""Builds Rate Diary APK without the Android SDK: hand-written binary manifest + resources.arsc,
dx for dex, apksig (Sign.java) for v1+v2 signing. Run from this folder: python3 build.py"""
import struct, zipfile, shutil, subprocess, os, sys

PKG, LABEL, VCODE, VNAME = "com.ratediary.app", "Rate Diary", 2, "1.1"
MIN_SDK, TARGET_SDK = 24, 34
ANDROID_NS = "http://schemas.android.com/apk/res/android"
TOOLS = os.environ.get("TOOLS", "/home/user/apkbuild/tools")
OUT = "build"

# ---------- string pool (UTF-8) ----------
def string_pool(strings):
    def enc_len(n):
        return bytes([n]) if n < 0x80 else bytes([(n >> 8) | 0x80, n & 0xFF])
    data, offs = b"", []
    for s in strings:
        b = s.encode("utf-8")
        offs.append(len(data))
        data += enc_len(len(s)) + enc_len(len(b)) + b + b"\0"
    while len(data) % 4: data += b"\0"
    hdr = 28
    start = hdr + 4 * len(strings)
    body = b"".join(struct.pack("<I", o) for o in offs) + data
    return struct.pack("<HHIIIIII", 0x0001, hdr, hdr + len(body), len(strings), 0, 0x100, start, 0) + body

# ---------- binary XML ----------
ATTR_IDS = {"versionCode": 0x0101021b, "versionName": 0x0101021c, "minSdkVersion": 0x0101020c, "targetSdkVersion": 0x01010270,
            "label": 0x01010001, "icon": 0x01010002, "allowBackup": 0x01010280, "hardwareAccelerated": 0x010102d3,
            "name": 0x01010003, "exported": 0x01010010, "configChanges": 0x0101001f, "windowSoftInputMode": 0x0101022b}
T_REF, T_STR, T_DEC, T_HEX, T_BOOL = 0x01, 0x03, 0x10, 0x11, 0x12

def axml(tree):
    # tree: (tag, [(ns?, name, type, value)], [children])
    attr_names, other = [], []
    def walk(n):
        tag, attrs, kids = n
        for ns, name, t, v in attrs:
            if ns and name not in attr_names: attr_names.append(name)
        for k in kids: walk(k)
    walk(tree)
    attr_names.sort(key=lambda n: ATTR_IDS[n])
    strings = list(attr_names)
    def si(s):
        if s not in strings: strings.append(s)
        return strings.index(s)
    for s in ("android", ANDROID_NS): si(s)
    chunks = []
    line = [1]
    def start(n):
        tag, attrs, kids = n
        recs = []
        for ns, name, t, v in sorted(attrs, key=lambda a: ATTR_IDS.get(a[1], 0x7fffffff) if a[0] else -1):
            nsi = si(ANDROID_NS) if ns else 0xFFFFFFFF
            ni = si(name)
            if t == T_STR: raw, data = si(v), si(v)
            else: raw, data = 0xFFFFFFFF, (0xFFFFFFFF if (t == T_BOOL and v) else (0 if t == T_BOOL else v))
            recs.append(struct.pack("<IIIHBBI", nsi, ni, raw, 8, 0, t, data & 0xFFFFFFFF))
        body = struct.pack("<IIHHHHHH", 0xFFFFFFFF, si(tag), 20, 20, len(recs), 0, 0, 0) + b"".join(recs)
        chunks.append(struct.pack("<HHIII", 0x0102, 16, 16 + len(body), line[0], 0xFFFFFFFF) + body); line[0] += 1
        for k in kids: start(k)
        chunks.append(struct.pack("<HHIIIII", 0x0103, 16, 24, line[0], 0xFFFFFFFF, 0xFFFFFFFF, si(tag))); line[0] += 1
    start(tree)
    ns_start = struct.pack("<HHIIIII", 0x0100, 16, 24, 0, 0xFFFFFFFF, si("android"), si(ANDROID_NS))
    ns_end = struct.pack("<HHIIIII", 0x0101, 16, 24, line[0], 0xFFFFFFFF, si("android"), si(ANDROID_NS))
    pool = string_pool(strings)
    resmap = struct.pack("<HHI", 0x0180, 8, 8 + 4 * len(attr_names)) + b"".join(struct.pack("<I", ATTR_IDS[n]) for n in attr_names)
    body = pool + resmap + ns_start + b"".join(chunks) + ns_end
    return struct.pack("<HHI", 0x0003, 8, 8 + len(body)) + body

A = True
manifest = ("manifest", [(None, "package", T_STR, PKG), (A, "versionCode", T_DEC, VCODE), (A, "versionName", T_STR, VNAME)], [
    ("uses-sdk", [(A, "minSdkVersion", T_DEC, MIN_SDK), (A, "targetSdkVersion", T_DEC, TARGET_SDK)], []),
    ("application", [(A, "label", T_STR, LABEL), (A, "icon", T_REF, 0x7f010000), (A, "allowBackup", T_BOOL, True), (A, "hardwareAccelerated", T_BOOL, True)], [
        ("activity", [(A, "name", T_STR, PKG + ".MainActivity"), (A, "exported", T_BOOL, True),
                      (A, "configChanges", T_HEX, 0x04a0), (A, "windowSoftInputMode", T_HEX, 0x10)], [
            ("intent-filter", [], [
                ("action", [(A, "name", T_STR, "android.intent.action.MAIN")], []),
                ("category", [(A, "name", T_STR, "android.intent.category.LAUNCHER")], []),
            ]),
        ]),
    ]),
])

# ---------- resources.arsc: one mipmap/ic_launcher ----------
def arsc():
    gpool = string_pool(["res/mipmap/ic_launcher.png"])
    tpool, kpool = string_pool(["mipmap"]), string_pool(["ic_launcher"])
    spec = struct.pack("<HHIBBHI", 0x0202, 16, 16 + 4, 1, 0, 0, 1) + struct.pack("<I", 0)
    config = struct.pack("<I", 64) + b"\0" * 60
    entry = struct.pack("<HHI", 8, 0, 0) + struct.pack("<HBBI", 8, 0, T_STR, 0)
    thdr = 8 + 4 + 4 + 4 + len(config)
    tbody = struct.pack("<I", 0) + entry
    typ = struct.pack("<HHIBBHII", 0x0201, thdr, thdr + len(tbody), 1, 0, 0, 1, thdr + 4) + config + tbody
    name = PKG.encode("utf-16-le").ljust(256, b"\0")
    phdr = 288
    pbody = tpool + kpool + spec + typ
    pkg = struct.pack("<HHII", 0x0200, phdr, phdr + len(pbody), 0x7f) + name + struct.pack("<IIIII", phdr, 1, phdr + len(tpool), 1, 0) + pbody
    body = gpool + pkg
    return struct.pack("<HHII", 0x0002, 12, 12 + len(body), 1) + body

def run(cmd):
    print("+", " ".join(cmd)); subprocess.run(cmd, check=True)

def main():
    shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT + "/classes")
    os.makedirs(OUT + "/stubs")
    run(["javac", "--release", "8", "-nowarn", "-d", OUT + "/stubs", "stubs/android/webkit/JavascriptInterface.java"])
    run(["javac", "--release", "8", "-nowarn", "-cp", TOOLS + "/android.jar:" + OUT + "/stubs", "-d", OUT + "/classes", "src/com/ratediary/app/MainActivity.java"])
    run(["java", "-cp", TOOLS + "/dx.jar", "com.android.dx.command.Main", "--dex", "--min-sdk-version=24", "--output=" + OUT + "/classes.dex", OUT + "/classes"])
    files = [("AndroidManifest.xml", axml(manifest), zipfile.ZIP_DEFLATED),
             ("resources.arsc", arsc(), zipfile.ZIP_STORED),
             ("classes.dex", open(OUT + "/classes.dex", "rb").read(), zipfile.ZIP_DEFLATED),
             ("res/mipmap/ic_launcher.png", open("icon.png", "rb").read(), zipfile.ZIP_STORED),
             ("assets/index.html", open("../supplier-rates/index.html", "rb").read(), zipfile.ZIP_DEFLATED)]
    unsigned = OUT + "/unsigned.apk"
    with open(unsigned, "wb") as fh:
        z = zipfile.ZipFile(fh, "w")
        for name, data, comp in files:
            zi = zipfile.ZipInfo(name, (2026, 1, 1, 0, 0, 0)); zi.compress_type = comp
            if comp == zipfile.ZIP_STORED:  # 4-byte align data (needed for resources.arsc on Android 11+)
                off = fh.tell() + 30 + len(name.encode())
                zi.extra = b"\0" * ((4 - off % 4) % 4)
            z.writestr(zi, data)
        z.close()
    if not os.path.exists("release.p12"):
        run(["keytool", "-genkeypair", "-keystore", "release.p12", "-storetype", "PKCS12", "-storepass", "ratediary", "-keypass", "ratediary",
             "-alias", "ratediary", "-keyalg", "RSA", "-keysize", "2048", "-validity", "10000", "-dname", "CN=Rate Diary, O=Rate Diary, C=IN"])
    run(["javac", "-nowarn", "-cp", TOOLS + "/apksig.jar", "-d", OUT, "Sign.java"])
    run(["java", "--add-exports", "java.base/sun.security.x509=ALL-UNNAMED", "--add-exports", "java.base/sun.security.pkcs=ALL-UNNAMED", "--add-exports", "java.base/sun.security.util=ALL-UNNAMED", "-cp", OUT + ":" + TOOLS + "/apksig.jar", "Sign", "release.p12", "ratediary", "ratediary", unsigned, "RateDiary.apk"])
    print("APK:", os.path.abspath("RateDiary.apk"), os.path.getsize("RateDiary.apk"), "bytes")

if __name__ == "__main__":
    main()
