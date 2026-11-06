"""Baut ki-system/js/halal-welt.js aus den Fonds- und Indexlisten im Ordner listen/.
Aufruf: python3 -I welt-bauen.py <listen-ordner> <ziel-js>
"""
import csv, json, re, sys
from collections import Counter, OrderedDict

ORDNER, ZIEL = sys.argv[1], sys.argv[2]

LAND = {  # iShares "Location" -> ISO2
    "United States": "US", "Japan": "JP", "Canada": "CA", "Sweden": "SE", "United Kingdom": "GB", "Germany": "DE",
    "France": "FR", "Switzerland": "CH", "Australia": "AU", "Hong Kong": "HK", "Finland": "FI", "Norway": "NO",
    "Italy": "IT", "Denmark": "DK", "Spain": "ES", "Netherlands": "NL", "Singapore": "SG", "New Zealand": "NZ",
    "Belgium": "BE", "Ireland": "IE", "Austria": "AT", "Portugal": "PT", "India": "IN", "China": "CN",
    "Korea (South)": "KR", "Taiwan": "TW", "Saudi Arabia": "SA", "Malaysia": "MY", "Brazil": "BR",
    "South Africa": "ZA", "Russian Federation": "RU", "Mexico": "MX", "Thailand": "TH", "Qatar": "QA",
    "United Arab Emirates": "AE", "Poland": "PL", "Kuwait": "KW", "Greece": "GR", "Turkey": "TR",
    "Indonesia": "ID", "Hungary": "HU", "Chile": "CL", "Czech Republic": "CZ", "Peru": "PE",
    "Philippines": "PH", "Colombia": "CO", "Israel": "IL", "Luxembourg": "LU", "Macau": "MO",
}
BOERSE = {  # iShares "Exchange" -> Endung (leer = US-Börse)
    "New York Stock Exchange Inc.": "", "NASDAQ": "", "Nyse Mkt Llc": "", "Cboe BZX formerly known as BATS": "",
    "Tokyo Stock Exchange": "T", "Toronto Stock Exchange": "TO", "Nasdaq Omx Nordic": "ST", "London Stock Exchange": "L",
    "Xetra": "DE", "Deutsche Boerse Xetra": "DE", "Nyse Euronext - Euronext Paris": "PA", "SIX Swiss Exchange": "SW",
    "Asx - All Markets": "AX", "Hong Kong Exchanges And Clearing Ltd": "HK", "Nasdaq Omx Helsinki Ltd.": "HE",
    "Borsa Italiana": "MI", "Oslo Bors Asa": "OL", "Euronext Amsterdam": "AS", "Omx Nordic Exchange Copenhagen A/S": "CO",
    "Bolsa De Madrid": "MC", "Nyse Euronext - Euronext Brussels": "BR", "Singapore Exchange": "SI",
    "Irish Stock Exchange - All Market": "IR", "New Zealand Exchange Ltd": "NZ", "Wiener Boerse Ag": "VI",
    "Nyse Euronext - Euronext Lisbon": "LS", "National Stock Exchange Of India": "NS", "Shanghai Stock Exchange": "SS",
    "Shenzhen Stock Exchange": "SZ", "Korea Exchange (Stock Market)": "KS", "Korea Exchange (Kosdaq)": "KQ",
    "Taiwan Stock Exchange": "TW", "Gretai Securities Market": "TWO", "Saudi Stock Exchange": "SR", "Bursa Malaysia": "KL",
    "XBSP": "SA", "Johannesburg Stock Exchange": "JO", "Standard-Classica-Forts": "ME", "Bolsa Mexicana De Valores": "MX",
    "Stock Exchange Of Thailand": "BK", "Qatar Exchange": "QA", "Abu Dhabi Securities Exchange": "AE",
    "Dubai Financial Market": "AE", "Warsaw Stock Exchange/Equities/Main Market": "WA", "Kuwait Stock Exchange": "KW",
    "Athens Exchange S.A. Cash Market": "AT", "Istanbul Stock Exchange": "IS", "Indonesia Stock Exchange": "JK",
    "Budapest Stock Exchange": "BD", "Santiago Stock Exchange": "SN", "Prague Stock Exchange": "PR",
    "Philippine Stock Exchange Inc.": "PS",
}
BBG = {  # Bloomberg-Endung (SP Funds) -> (Land, Endung)
    "KS": ("KR", "KS"), "KQ": ("KR", "KQ"), "TT": ("TW", "TW"), "HK": ("HK", "HK"), "JP": ("JP", "T"),
    "C1": ("CN", "SS"), "C2": ("CN", "SZ"), "AB": ("SA", "SR"), "UH": ("AE", "AE"), "SJ": ("ZA", "JO"),
    "MK": ("MY", "KL"), "TB": ("TH", "BK"), "IJ": ("ID", "JK"), "TI": ("TR", "IS"), "BZ": ("BR", "SA"),
    "MM": ("MX", "MX"), "CN": ("CA", "TO"), "AU": ("AU", "AX"), "NZ": ("NZ", "NZ"), "LN": ("GB", "L"),
    "SW": ("CH", "SW"), "NA": ("NL", "AS"), "IM": ("IT", "MI"), "SS": ("SE", "ST"), "FH": ("FI", "HE"),
    "DC": ("DK", "CO"), "PW": ("PL", "WA"), "SM": ("ES", "MC"), "SP": ("SG", "SI"), "PM": ("PH", "PS"),
    "GR": ("DE", "DE"), "GY": ("DE", "DE"), "FP": ("FR", "PA"), "QD": ("QA", "QA"), "KK": ("KW", "KW"),
    "IN": ("IN", "NS"), "IS": ("IN", "NS"), "CI": ("CL", "SN"), "GA": ("GR", "AT"), "HB": ("HU", "BD"),
    "CP": ("CZ", "PR"), "NO": ("NO", "OL"), "BB": ("BE", "BR"), "AV": ("AT", "VI"), "PL": ("PT", "LS"),
    "ID": ("IE", "IR"), "RM": ("RU", "ME"),
}
# Bekannte ADRs (US-Börse) ausländischer Firmen: Heimatland, falls der Name nirgends sonst vorkommt.
ADR_LAND = {
    "TSM": "TW", "ASX": "TW", "UMC": "TW", "SAP": "DE", "NOK": "FI", "ERIC": "SE", "ATEYY": "JP", "TELWY": "JP",
    "KXIAY": "JP", "IFNNY": "DE", "MRAAY": "JP", "XIACY": "CN", "FJTSY": "JP", "RNECY": "JP", "DSCSY": "JP",
    "FUJIY": "JP", "CAJPY": "JP", "HXGBY": "SE", "DASTY": "FR", "LSRCY": "JP", "NRILY": "JP", "HALMY": "GB",
    "SGPYY": "GB", "OMRNY": "JP", "TMSNY": "CH", "INFY": "IN", "WIT": "IN", "NVO": "DK", "ASML": "NL",
    "TCEHY": "CN", "SNY": "FR", "AZN": "GB", "NVS": "CH", "RHHBY": "CH", "TM": "JP", "SONY": "JP",
    "HMC": "JP", "SHEL": "GB", "TTE": "FR", "BP": "GB", "RIO": "GB", "BHP": "AU", "VALE": "BR", "PBR": "BR",
    "GFI": "ZA", "AU": "ZA", "SBSW": "ZA", "HMY": "ZA", "DRD": "ZA", "MELI": "UY", "NU": "BR", "SE": "SG",
    "GRAB": "SG", "CPNG": "KR", "BIDU": "CN", "JD": "CN", "PDD": "CN", "BABA": "CN", "NTES": "CN",
    "LI": "CN", "XPEV": "CN", "NIO": "CN", "BEKE": "CN", "TME": "CN", "YUMC": "CN", "ZTO": "CN", "HTHT": "CN",
    "SQM": "CL", "SCCO": "PE", "CX": "MX", "FMX": "MX", "KOF": "MX", "TX": "LU", "TS": "LU", "GGB": "BR",
    "SID": "BR", "EC": "CO", "CIB": "CO", "UL": "GB", "DEO": "GB", "LIN": "US", "ABBNY": "CH", "SIEGY": "DE",
    "CRARY": "FR", "LVMUY": "FR", "ADDYY": "DE", "IDEXY": "ES", "HESAY": "FR", "SMFG": "JP", "MUFG": "JP",
    "HDB": "IN", "IBN": "IN", "RDY": "IN", "MMYT": "IN", "WNS": "IN", "SIFY": "IN", "YPF": "AR", "GLOB": "AR",
    "ARCO": "BR", "STNE": "BR", "PAGS": "BR", "BAP": "PE", "ITUB": "BR", "BBD": "BR", "SUZ": "BR", "ERJ": "BR",
    "CHT": "TW", "HIMX": "TW", "LOGI": "CH", "SHOP": "CA", "CNI": "CA", "CP": "CA", "TRI": "CA", "WCN": "CA",
    "NTR": "CA", "SU": "CA", "CNQ": "CA", "CVE": "CA", "IMO": "CA", "TECK": "CA", "AEM": "CA", "WPM": "CA",
    "FNV": "CA", "KGC": "CA", "B": "CA", "GOLD": "CA", "NXPI": "NL", "STLA": "NL", "FER": "ES", "ARM": "GB",
    "CCEP": "GB", "SPOT": "SE", "ONON": "CH", "ALC": "CH", "GMAB": "DK", "ARGX": "NL", "QGEN": "NL",
    "CRTO": "FR", "TEVA": "IL", "CHKP": "IL", "NICE": "IL", "WIX": "IL", "CYBR": "IL", "MNDY": "IL",
    "ICL": "IL", "ESLT": "IL", "TSEM": "IL", "AMX": "MX", "PKX": "KR", "KB": "KR", "SHG": "KR", "LPL": "KR",
    "KEP": "KR", "SKM": "KR", "KT": "KR", "WF": "KR", "TLK": "ID", "PHI": "PH", "VIV": "BR", "TIMB": "BR",
    "NSRGY": "CH", "RCRUY": "JP", "MPNGY": "CN", "AIQUY": "FR", "CFRUY": "CH", "LRLCY": "FR", "FRCOY": "JP",
    "GSK": "GB", "RELX": "GB", "CSLLY": "AU", "ONC": "CN", "WFAFY": "AU", "HOCPY": "JP", "RBGLY": "GB", "ASAZY": "SE",
    "DSDVY": "DK", "GVDNY": "CH", "LGRDY": "FR", "EXPGY": "GB", "SXYAY": "CH", "FANUY": "JP", "CHGCY": "JP",
    "AJNMY": "JP", "MKKGY": "DE", "NVZMY": "DK", "GBERY": "CH", "BXBLY": "AU", "SMCAY": "JP", "SGSOY": "CH",
    "KRYAY": "IE", "SGIOY": "JP", "ICLR": "IE", "KHNGY": "CH", "SMMNY": "DE", "SIMO": "TW", "DFKUY": "JP",
    "SNN": "GB", "DQJCY": "JP", "NJDCY": "JP", "SMNNY": "JP",
    "IKTSY": "GB", "ASR": "MX", "CLPBY": "DK", "FROG": "IL", "HNNMY": "SE", "HENKY": "DE", "ORKLY": "NO",
    "BCH": "CL", "ENIC": "CL", "BSAC": "CL", "LTM": "CL", "CCU": "CL", "AKO.A": "CL", "AKO.B": "CL",
}
LAND_NAME = {
    "US": "USA", "CA": "Kanada", "MX": "Mexiko", "BR": "Brasilien", "CL": "Chile", "PE": "Peru", "CO": "Kolumbien",
    "AR": "Argentinien", "UY": "Uruguay", "GB": "Grossbritannien", "CH": "Schweiz", "DE": "Deutschland",
    "FR": "Frankreich", "NL": "Niederlande", "BE": "Belgien", "IT": "Italien", "ES": "Spanien", "PT": "Portugal",
    "AT": "Österreich", "IE": "Irland", "LU": "Luxemburg", "SE": "Schweden", "FI": "Finnland", "NO": "Norwegen",
    "DK": "Dänemark", "PL": "Polen", "CZ": "Tschechien", "HU": "Ungarn", "GR": "Griechenland", "TR": "Türkei",
    "RU": "Russland", "SA": "Saudi-Arabien", "AE": "Vereinigte Arabische Emirate", "QA": "Katar", "KW": "Kuwait",
    "IL": "Israel", "EG": "Ägypten", "NG": "Nigeria", "ZA": "Südafrika", "IN": "Indien", "PK": "Pakistan",
    "CN": "China", "HK": "Hongkong", "MO": "Macau", "TW": "Taiwan", "KR": "Südkorea", "JP": "Japan",
    "MY": "Malaysia", "ID": "Indonesien", "TH": "Thailand", "PH": "Philippinen", "SG": "Singapur",
    "AU": "Australien", "NZ": "Neuseeland",
}
ENDUNG_LAND = {"T": "JP", "TO": "CA", "ST": "SE", "L": "GB", "DE": "DE", "PA": "FR", "SW": "CH", "AX": "AU", "HK": "HK",
    "HE": "FI", "MI": "IT", "OL": "NO", "AS": "NL", "CO": "DK", "MC": "ES", "BR": "BE", "SI": "SG", "IR": "IE",
    "NZ": "NZ", "VI": "AT", "LS": "PT", "NS": "IN", "SS": "CN", "SZ": "CN", "KS": "KR", "KQ": "KR", "TW": "TW",
    "TWO": "TW", "SR": "SA", "KL": "MY", "SA": "BR", "JO": "ZA", "ME": "RU", "MX": "MX", "BK": "TH", "QA": "QA",
    "AE": "AE", "WA": "PL", "KW": "KW", "AT": "GR", "IS": "TR", "JK": "ID", "BD": "HU", "SN": "CL", "PR": "CZ",
    "PS": "PH", "KA": "PK", "CA": "EG", "LG": "NG"}

FONDS = {
    "SPUS": "SP Funds S&P 500 Sharia (USA), Stand 5.11.2026",
    "SPWO": "SP Funds S&P World ex-US Sharia, Stand 5.11.2026",
    "SPTE": "SP Funds S&P Global Technology Sharia, Stand 5.11.2026",
    "SPRE": "SP Funds S&P Global REIT Sharia, Stand 5.11.2026",
    "ISUS": "iShares MSCI USA Islamic, Stand 4.11.2026",
    "ISWD": "iShares MSCI World Islamic, Stand 4.11.2026",
    "ISEM": "iShares MSCI EM Islamic, Stand 4.11.2026",
    "SCMY": "Securities Commission Malaysia, Scharia-Liste 29.5.2026",
    "OJK": "OJK Indonesien, Daftar Efek Syariah ab 1.6.2026",
    "KMI": "Pakistan Stock Exchange, KMI All Share Islamic (Scharia-Status Dezember 2025)",
    "EGX": "EGX 33 Shariah Index (Ägypten), Stand 5.11.2026",
    "NGX": "NGX Lotus Islamic Index (Nigeria), Stand 5.11.2026",
    "J140": "FTSE/JSE Shari'ah Top 40 (Südafrika, grösste Positionen), Stand 30.9.2026",
}

STOP = set("INC CORP CORPORATION CO COMPANY LTD LIMITED PLC SA AG NV SE AB ASA OYJ HOLDINGS HOLDING HLDGS GROUP THE CLASS "
           "A B C ADR SPONSORED BHD BERHAD TBK PT SAB DE CV SPA KK REG SHS ORD N V S P OF AND & CL".split())


def norm_name(n):
    n = re.sub(r"[^A-Z0-9 ]", " ", n.upper().replace("&", " "))
    w = [x for x in n.split() if x not in STOP]
    return " ".join(w)


def sauber(t):
    t = t.strip().upper().rstrip(".").replace("/", "-").replace(" ", "-")
    return re.sub(r"[^A-Z0-9.\-]", "", t)


eintraege = OrderedDict()  # symbol -> dict
namen_land = {}  # norm_name -> land (aus Listen mit Land)


def zahl(s):
    try:
        return float(str(s).replace("’", "").replace(",", "").replace("%", ""))
    except ValueError:
        return 0.0


def aufnehmen(sym, name, land, quelle, gewicht=0.0, sektor="", gesperrt=False):
    name = re.sub(r"[#^*]+", "", name).strip()
    if not sym or re.search(r"\bRIGHTS?\b|\bRTS\b|WARRANT|\bETF\b|INDEX FUND", name, re.I):
        return
    if re.search(r"CVR$", sym) or (land == "US" and re.match(r"^\d{5,}[A-Z]?$", sym)):
        return  # Abwicklungsrechte und Altpositionen ohne Börsenhandel
    e = eintraege.get(sym)
    if e:
        if quelle not in e["q"]:
            e["q"].append(quelle)
        e["g"] = max(e["g"], gewicht)
        if not e["b"] and sektor:
            e["b"] = sektor
        if e["l"] == "XX" and land != "XX":
            e["l"] = land
        return
    eintraege[sym] = {"s": sym, "n": name.strip(), "l": land, "q": [quelle], "g": gewicht, "b": sektor, "x": gesperrt}


def ishares(datei, quelle):
    zeilen = list(csv.reader(open(f"{ORDNER}/{datei}", encoding="utf-8-sig")))[3:]
    for z in zeilen:
        if len(z) < 12 or z[3] != "Equity":
            continue
        tick, name, sektor, wert, gew, ort, boerse = z[0], z[1], z[2], z[4], z[5], z[9], z[10]
        if boerse not in BOERSE or ort not in LAND:
            continue
        land = LAND[ort]
        endung = BOERSE[boerse]
        t = sauber(tick)
        if endung == "HK" and t.isdigit():
            t = t.zfill(4)
        if endung == "TO":
            t = t.replace(".", "-")
        if endung == "BK":
            t = re.sub(r"[.-]R$", "", t)
        sym = t + ("." + endung if endung else "")
        gesperrt = land == "RU"
        if zahl(wert) <= 0 and not gesperrt:
            continue  # Rest-/Altposition ohne Wert
        namen_land.setdefault(norm_name(name), land)
        aufnehmen(sym, name.title(), land, quelle, zahl(gew), sektor, gesperrt)


def spfunds(datei, quelle):
    for z in list(csv.reader(open(f"{ORDNER}/{datei}", encoding="utf-8-sig")))[1:]:
        if len(z) < 9:
            continue
        tick, cusip, name = z[2], z[3], z[4]
        if cusip.startswith("CASH") or tick.startswith("Cash") or len(tick) == 3 and cusip.startswith("CASH"):
            continue
        if cusip == "Cash&Other" or "CASH" in cusip.upper():
            continue
        teile = tick.split()
        if len(teile) >= 2 and teile[-1] in BBG:
            land, endung = BBG[teile[-1]]
            t = sauber(" ".join(teile[:-1]))
            if endung == "HK" and t.isdigit():
                t = t.zfill(4)
            if endung == "BK":
                t = re.sub(r"[.-]R$", "", t)
            sym = t + "." + endung
        else:
            sym = sauber(tick.replace("/", "."))
            land = "US" if quelle == "SPUS" else ADR_LAND.get(sym, namen_land.get(norm_name(name), "XX"))
            if quelle == "SPRE" and land == "XX":
                land = "US"
        aufnehmen(sym, name, land, quelle, zahl(z[8]))


def malaysia():
    text = open(f"{ORDNER}/my.txt").read().split("\n")
    start = next(i for i, l in enumerate(text) if l.strip() == "MAIN MARKET")
    ende = next(i for i, l in enumerate(text) if l.strip().startswith("LEAP MARKET"))
    akt = None
    sektor = ""
    for l in text[start:ende]:
        m = re.match(r"^\d+\.\s+(\d{4}|\d{4}[A-Z]{1,2})\s+(.+)$", l.strip())
        if m:
            if akt:
                aufnehmen(*akt)
            code, name = m.group(1), m.group(2).strip()
            akt = [code + ".KL", name, "MY", "SCMY", 0.0, sektor] if code.isdigit() else None
            continue
        s = l.strip()
        if akt and s and not s.startswith("--") and not re.match(r"^(No\.|Bil\.|Shariah|Majlis|List of|Senarai|\d+$)", s) and s[0].isupper() and len(akt[1]) < 60 and akt[1].split()[-1] not in ("Bhd", "Berhad", "Limited", "Ltd"):
            akt[1] += " " + s
        elif s.isupper() and len(s) > 3 and not s.startswith("MAIN") and not s.startswith("PASARAN"):
            sektor = s.title()
    if akt:
        aufnehmen(*akt)


def indonesien():
    text = open(f"{ORDNER}/idx.txt").read()
    teil = text.split("I. Saham yang Diterbitkan")[1].split("L. Perusahaan Publik")[0]
    for m in re.finditer(r"^\d+ ([A-Z]{4}) (PT .+)$", teil, re.M):
        aufnehmen(m.group(1) + ".JK", m.group(2).replace("PT ", "", 1).replace(" Tbk.", "").replace(" Tbk", ""), "ID", "OJK")


def pakistan():
    for l in open(f"{ORDNER}/kmi.txt"):
        m = re.match(r"^\d+ ([A-Z0-9]{2,10})\s+(.+?)\s+(?:\*\s+)?(?:Compliant|N/A|NC)\s", l)
        if not m:
            continue
        status = re.findall(r"(Non-Compliant|Compliant)", l)
        if not status or status[-1] != "Compliant":
            continue
        name = m.group(2).replace(" *", "").strip()
        if re.search(r"modaraba|bank|insurance|takaful|leasing|reit|etf|fund", name, re.I) and "Islamic" not in name and "Meezan" not in name:
            continue  # Finanzfirmen und Fonds weglassen (ausser ausdrücklich islamisch)
        aufnehmen(m.group(1) + ".KA", name, "PK", "KMI")


AEGYPTEN = [("ACGC", "Arab Cotton Ginning"), ("ETEL", "Telecom Egypt"), ("OCDI", "SODIC"), ("PHDC", "Palm Hills Developments"),
    ("SKPC", "Sidi Kerir Petrochemicals"), ("TMGH", "Talaat Moustafa Group"), ("ETRS", "Egyptian Transport & Commercial Services"),
    ("IFAP", "International Agricultural Products (Mahaseel)"), ("LCSW", "Lecico Egypt"), ("MASR", "Madinet Masr"),
    ("MPCO", "Mansourah Poultry"), ("ORWE", "Oriental Weavers"), ("SAUD", "Al Baraka Bank Egypt"), ("MCQE", "Misr Cement"),
    ("AMOC", "Alexandria Mineral Oils"), ("EGAS", "Egypt Gas"), ("FAIT", "Faisal Islamic Bank of Egypt"),
    ("ATQA", "Misr National Steel (Ataqa)"), ("CIRA", "Cairo Investment & Real Estate (CIRA)"), ("EGAL", "Egypt Aluminum"),
    ("JUFO", "Juhayna Food Industries"), ("ORHD", "Orascom Development Egypt"), ("ADIB", "Abu Dhabi Islamic Bank Egypt"),
    ("ARCC", "Arabian Cement"), ("ORAS", "Orascom Construction"), ("EFID", "Edita Food Industries"),
    ("OLFI", "Obour Land for Food Industries"), ("MTIE", "MM Group for Industry"), ("RACC", "Raya Contact Center"),
    ("ICFC", "International Co for Fertilizers & Chemicals"), ("ISPH", "Ibnsina Pharma"), ("RMDA", "Rameda Pharma"),
    ("EFIH", "e-finance")]
NIGERIA = [("CAP", "Chemical and Allied Products"), ("DANGCEM", "Dangote Cement"), ("NAHCO", "Nigerian Aviation Handling (NAHCO)"),
    ("OKOMUOIL", "Okomu Oil Palm"), ("WAPCO", "Lafarge Africa"), ("JAIZBANK", "Jaiz Bank"), ("MTNN", "MTN Nigeria"),
    ("AIRTELAFRI", "Airtel Africa"), ("BUACEMENT", "BUA Cement"), ("BUAFOODS", "BUA Foods")]
SUEDAFRIKA = [("GFI", "Gold Fields", 17.08), ("ANG", "AngloGold Ashanti", 15.85), ("MTN", "MTN Group", 10.46),
    ("VAL", "Valterra Platinum", 10.05), ("AGL", "Anglo American", 7.93), ("HAR", "Harmony Gold Mining", 5.21),
    ("IMP", "Impala Platinum", 4.92), ("SOL", "Sasol", 4.32), ("GLN", "Glencore", 4.07), ("NPH", "Northam Platinum", 3.06)]

# Reihenfolge: zuerst Listen mit Länderangabe (für ADR-Länder), dann der Rest
ishares("iswd.csv", "ISWD")
ishares("isus.csv", "ISUS")
ishares("isem.csv", "ISEM")
spfunds("spus.csv", "SPUS")
spfunds("spwo.csv", "SPWO")
spfunds("spte.csv", "SPTE")
spfunds("spre.csv", "SPRE")
for t, n, g in SUEDAFRIKA:
    aufnehmen(t + ".JO", n, "ZA", "J140", g)
for t, n in AEGYPTEN:
    aufnehmen(t + ".CA", n, "EG", "EGX")
for t, n in NIGERIA:
    aufnehmen(t + ".LG", n, "NG", "NGX")
malaysia()
indonesien()
pakistan()

# Gleiche Firma an zwei Börsen (z. B. TSM und 2330.TW): einmal behalten, US-Börse bevorzugt (hat Kurse).
def us(sym):
    return "." not in sym or sym.rsplit(".", 1)[1] not in ENDUNG_LAND
nach_name = {}
for sym, e in list(eintraege.items()):
    k = norm_name(e["n"])
    if not k:
        continue
    if k in nach_name:
        alt = eintraege[nach_name[k]]
        bevorzugt, weg = (e, alt) if us(sym) and not us(alt["s"]) else (alt, e)
        for q in weg["q"]:
            if q not in bevorzugt["q"]:
                bevorzugt["q"].append(q)
        bevorzugt["g"] = max(bevorzugt["g"], weg["g"])
        if bevorzugt["l"] == "XX":
            bevorzugt["l"] = weg["l"]
        bevorzugt.setdefault("auch", []).append(weg["s"])
        del eintraege[weg["s"]]
        nach_name[k] = bevorzugt["s"]
    else:
        nach_name[k] = sym

liste = list(eintraege.values())
unbekannt = [e["s"] + " " + e["n"] for e in liste if e["l"] == "XX"]
for e in liste:
    if e["l"] == "XX":
        e["l"] = "US"  # an der US-Börse gehandelt, Heimatland unbekannt
quellen_idx = list(FONDS.keys())
daten = []
for e in sorted(liste, key=lambda e: (-e["g"], e["s"])):
    daten.append([e["s"], e["n"][:60], e["l"], sum(1 << quellen_idx.index(q) for q in e["q"]), round(e["g"], 2), 1 if e["x"] else 0])

js = ("/* Weltweite Halal-Aktienliste für A&T (automatisch erzeugt, nicht von Hand ändern).\n"
      " * Quellen: schariakonforme Fonds und offizielle Scharia-Listen, siehe HALAL_WELT.quellen.\n"
      " * Feld: [Kürzel, Name, Land, Quellen-Bits, Gewicht im Fonds in %, gesperrt (Sanktionen)] */\n"
      "var HALAL_WELT = {\n  version: 3,\n  stand: \"6. November 2026\",\n"
      "  quellen: " + json.dumps(list(FONDS.values()), ensure_ascii=False) + ",\n"
      "  kurz: " + json.dumps(["SPUS", "SPWO", "SPTE", "SPRE", "ISUS", "ISWD", "ISEM", "Scharia-Liste Malaysia", "Scharia-Liste Indonesien", "KMI Pakistan", "EGX 33 Shariah", "NGX Lotus Islamic", "JSE Shari'ah Top 40"], ensure_ascii=False) + ",\n"
      "  laender: " + json.dumps(LAND_NAME, ensure_ascii=False) + ",\n"
      "  daten: [\n" + ",\n".join("    " + json.dumps(d, ensure_ascii=False) for d in daten) + "\n  ]\n};\n")
open(ZIEL, "w").write(js)

c = Counter(d[2] for d in daten)
print("Aktien:", len(daten), "Länder:", len(c))
print(c.most_common())
print("US-Börse (Kurse über Finnhub):", sum(1 for d in daten if us(d[0])))
print("Heimatland unbekannt:", len(unbekannt), unbekannt[:40])
print("gesperrt:", [d[0] for d in daten if d[5]])
