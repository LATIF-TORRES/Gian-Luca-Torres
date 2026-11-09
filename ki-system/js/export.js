/*
 * Dokumente speichern als PDF, Word (.docx), Word 97 (.doc), Text (.txt) und Markdown (.md).
 * Ohne fremde Bibliothek: .docx wird hier selbst gebaut (ZIP ohne Kompression + Office-XML),
 * damit es auch offline und aus dem Windows-Paket (file://) funktioniert.
 */

// Einfach gehalten: Google Docs zuerst, dann PDF, Word-Datei (öffnet auch Google Docs, Pages, LibreOffice), Text.
// .doc und .md gibt es weiterhin über dokumentExport, aber nicht im Menü.
var EXPORT_FORMATE = [["gdocs", "Google Docs"], ["pdf", "PDF"], ["docx", "Word-Datei (.docx)"], ["txt", "Text"]];

function exportAuswahlHtml(klasse) {
  return "<select class='export-wahl " + (klasse || "") + "' title='Speichern als'><option value=''>⬇ Speichern als …</option>" +
    EXPORT_FORMATE.map(function (f) { return "<option value='" + f[0] + "'>" + f[1] + "</option>"; }).join("") + "</select>";
}
// Verbindet ein Auswahlfeld mit einem Dokument (titel und Markdown kommen erst beim Klick, damit sie aktuell sind)
function exportVerbinden(select, holen) {
  select.onchange = function () {
    var f = select.value; select.value = "";
    if (!f) return;
    var d = holen();
    dokumentExport(d.titel, d.inhalt, f);
  };
}

function dateiName(titel, endung) {
  var n = String(titel || "Dokument").replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 80) || "Dokument";
  return n + "." + endung;
}
function herunterladen(blob, name) {
  var url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = name; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
}

function dokumentExport(titel, markdown, format) {
  markdown = String(markdown || "");
  if (format === "pdf") return alsPdf(titel, markdown);
  if (format === "gdocs") return inGoogleDocs(titel, markdown);
  if (format === "md") return herunterladen(new Blob(["# " + titel + "\n\n" + markdown], { type: "text/markdown;charset=utf-8" }), dateiName(titel, "md"));
  if (format === "txt") return herunterladen(new Blob([titel + "\n\n" + mdZuText(markdown)], { type: "text/plain;charset=utf-8" }), dateiName(titel, "txt"));
  if (format === "doc") return herunterladen(new Blob(["﻿" + mdZuWordHtml(titel, markdown)], { type: "application/msword" }), dateiName(titel, "doc"));
  if (format === "docx") return herunterladen(mdZuDocx(titel, markdown), dateiName(titel, "docx"));
}

/* ---------- Google Docs: formatiert kopieren, neues Google-Dokument öffnen, einfügen ---------- */
// Ohne Google-Anmeldung in A&T: docs.new legt im eigenen Google-Konto ein leeres Dokument an.
function inGoogleDocs(titel, md) {
  var html = "<h1>" + String(titel || "").replace(/</g, "&lt;") + "</h1>" + (window.marked ? marked.parse(md) : "<pre>" + md.replace(/</g, "&lt;") + "</pre>");
  if (window.DOMPurify) html = DOMPurify.sanitize(html);
  var text = titel + "\n\n" + mdZuText(md);
  var fenster = window.open("https://docs.new", "_blank"); // sofort öffnen, sonst blockiert der Browser das Fenster
  try { if (fenster) fenster.opener = null; } catch (e) {}
  function fertig(formatiert) {
    var t = "Kopiert. Im neuen Google-Dokument einfügen: Strg+V (Mac: Cmd+V, Handy: lange tippen → Einfügen)." + (formatiert ? "" : " (ohne Formatierung)");
    var el = document.querySelector("#toast");
    if (el) { el.textContent = t; el.classList.add("sichtbar"); setTimeout(function () { el.classList.remove("sichtbar"); }, 7000); }
    if (!fenster) { // Fenster blockiert: Link anbieten statt A&T zu verlassen
      var l = document.createElement("a"); l.href = "https://docs.new"; l.target = "_blank"; l.rel = "noopener"; document.body.appendChild(l); l.click(); l.remove();
    }
  }
  try {
    if (navigator.clipboard && window.ClipboardItem && window.isSecureContext) {
      navigator.clipboard.write([new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([text], { type: "text/plain" }) })])
        .then(function () { fertig(true); }, function () { kopierenEinfach(text); fertig(false); });
      return;
    }
  } catch (e) { /* weiter mit einfachem Kopieren */ }
  kopierenEinfach(text); fertig(false);
}
function kopierenEinfach(text) {
  if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).catch(function () {}); return; }
  var x = document.createElement("textarea"); x.value = text; document.body.appendChild(x); x.select();
  try { document.execCommand("copy"); } catch (e) {}
  x.remove();
}

/* ---------- Markdown → Text ---------- */
function mdZuText(md) {
  return md.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)").replace(/^#{1,6}\s*/gm, "").replace(/^\s*[-*]\s+\[ \]\s*/gm, "☐ ")
    .replace(/^\s*[-*]\s+\[x\]\s*/gim, "☑ ").replace(/^\s*[-*]\s+/gm, "• ").replace(/^\|?\s*-{3,}[-|\s:]*$/gm, "")
    .replace(/^\|(.*)\|\s*$/gm, function (z, inhalt) { return inhalt.split("|").map(function (x) { return x.trim(); }).join("\t"); });
}

/* ---------- Markdown → Word-HTML (.doc) ---------- */
function mdZuWordHtml(titel, md) {
  var html = window.marked ? marked.parse(md) : "<pre>" + md.replace(/</g, "&lt;") + "</pre>";
  if (window.DOMPurify) html = DOMPurify.sanitize(html);
  var t = String(titel || "").replace(/</g, "&lt;");
  return "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>" +
    "<head><meta charset='utf-8'><title>" + t + "</title><style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.4}" +
    "h1{font-size:20pt;color:#7a5a00}h2{font-size:14pt;color:#7a5a00}h3{font-size:12pt}table{border-collapse:collapse}td,th{border:1px solid #999;padding:4pt 6pt}</style></head>" +
    "<body><p style='font-size:8pt;color:#666'>A&amp;T · Amanah &amp; Tijara · " + new Date().toLocaleDateString("de-CH") + "</p><h1>" + t + "</h1>" + html + "</body></html>";
}

/* ---------- Markdown → .docx ---------- */
function xmlEsc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
// Inline: **fett**, *kursiv*, `code`, [Link](url) → Word-Läufe
function docxLaeufe(text) {
  var teile = [], rest = String(text).replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
  var re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g, letzte = 0, m;
  while ((m = re.exec(rest))) {
    if (m.index > letzte) teile.push({ t: rest.slice(letzte, m.index) });
    var x = m[0];
    if (x.indexOf("**") === 0) teile.push({ t: x.slice(2, -2), b: true });
    else if (x[0] === "`") teile.push({ t: x.slice(1, -1), code: true });
    else teile.push({ t: x.slice(1, -1), i: true });
    letzte = m.index + x.length;
  }
  if (letzte < rest.length) teile.push({ t: rest.slice(letzte) });
  return teile.map(function (p) {
    var rpr = (p.b ? "<w:b/>" : "") + (p.i ? "<w:i/>" : "") + (p.code ? "<w:rFonts w:ascii='Consolas' w:hAnsi='Consolas'/>" : "");
    return "<w:r>" + (rpr ? "<w:rPr>" + rpr + "</w:rPr>" : "") + "<w:t xml:space='preserve'>" + xmlEsc(p.t) + "</w:t></w:r>";
  }).join("");
}
function docxAbsatz(text, stil, einzug) {
  return "<w:p><w:pPr>" + (stil ? "<w:pStyle w:val='" + stil + "'/>" : "") + (einzug ? "<w:ind w:left='" + einzug + "' w:hanging='280'/>" : "") + "</w:pPr>" + docxLaeufe(text) + "</w:p>";
}
function docxTabelle(zeilen) {
  var rand = "<w:tblBorders>" + ["top", "left", "bottom", "right", "insideH", "insideV"].map(function (r) { return "<w:" + r + " w:val='single' w:sz='4' w:color='999999'/>"; }).join("") + "</w:tblBorders>";
  var spalten = Math.max.apply(null, zeilen.map(function (z) { return z.length; })), breite = Math.floor(9638 / spalten); // A4 minus Ränder, in Twips
  var raster = "<w:tblGrid>" + new Array(spalten + 1).join("<w:gridCol w:w='" + breite + "'/>") + "</w:tblGrid>";
  return "<w:tbl><w:tblPr><w:tblW w:w='5000' w:type='pct'/>" + rand + "</w:tblPr>" + raster + zeilen.map(function (z, i) {
    while (z.length < spalten) z.push("");
    return "<w:tr>" + z.map(function (zelle) {
      return "<w:tc><w:tcPr><w:tcW w:w='" + breite + "' w:type='dxa'/>" + (i === 0 ? "<w:shd w:val='clear' w:color='auto' w:fill='F3E7C4'/>" : "") + "</w:tcPr><w:p>" + docxLaeufe(i === 0 ? "**" + zelle + "**" : zelle) + "</w:p></w:tc>";
    }).join("") + "</w:tr>";
  }).join("") + "</w:tbl><w:p/>";
}
function mdZuDocxKoerper(titel, md) {
  var aus = [docxAbsatz("A&T · Amanah & Tijara · " + new Date().toLocaleDateString("de-CH"), "Klein"), docxAbsatz(titel, "Title")];
  var zeilen = md.replace(/\r/g, "").split("\n"), tabelle = null;
  function tabelleSchliessen() { if (tabelle) { aus.push(docxTabelle(tabelle)); tabelle = null; } }
  zeilen.forEach(function (z) {
    var t = z.trim();
    if (/^\|.*\|$/.test(t)) {
      if (/^\|?[\s:|-]+\|?$/.test(t) && t.indexOf("-") !== -1) return; // Trennzeile
      (tabelle = tabelle || []).push(t.slice(1, -1).split("|").map(function (x) { return x.trim(); }));
      return;
    }
    tabelleSchliessen();
    if (!t) return;
    var h = t.match(/^(#{1,6})\s+(.*)$/);
    if (h) { aus.push(docxAbsatz(h[2], "Heading" + Math.min(3, h[1].length))); return; }
    if (/^(-{3,}|\*{3,})$/.test(t)) return;
    var cb = t.match(/^[-*]\s+\[( |x|X)\]\s+(.*)$/);
    if (cb) { aus.push(docxAbsatz((cb[1] === " " ? "☐ " : "☑ ") + cb[2], null, 360)); return; }
    var li = t.match(/^[-*•]\s+(.*)$/);
    if (li) { var tiefe = (z.match(/^\s*/)[0].length >= 2) ? 720 : 360; aus.push(docxAbsatz("•  " + li[1], null, tiefe)); return; }
    var nr = t.match(/^(\d+)[.)]\s+(.*)$/);
    if (nr) { aus.push(docxAbsatz(nr[1] + ".  " + nr[2], null, 360)); return; }
    if (/^>\s?/.test(t)) { aus.push(docxAbsatz(t.replace(/^>\s?/, ""), "Zitat")); return; }
    aus.push(docxAbsatz(t));
  });
  tabelleSchliessen();
  return aus.join("");
}
function mdZuDocx(titel, md) {
  var W = "xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main' xmlns:r='http://schemas.openxmlformats.org/officeDocument/2006/relationships'";
  var dateien = {
    "[Content_Types].xml": "<?xml version='1.0' encoding='UTF-8' standalone='yes'?><Types xmlns='http://schemas.openxmlformats.org/package/2006/content-types'>" +
      "<Default Extension='rels' ContentType='application/vnd.openxmlformats-package.relationships+xml'/><Default Extension='xml' ContentType='application/xml'/>" +
      "<Override PartName='/word/document.xml' ContentType='application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml'/>" +
      "<Override PartName='/word/styles.xml' ContentType='application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml'/>" +
      "<Override PartName='/docProps/core.xml' ContentType='application/vnd.openxmlformats-package.core-properties+xml'/></Types>",
    "_rels/.rels": "<?xml version='1.0' encoding='UTF-8' standalone='yes'?><Relationships xmlns='http://schemas.openxmlformats.org/package/2006/relationships'>" +
      "<Relationship Id='rId1' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument' Target='word/document.xml'/>" +
      "<Relationship Id='rId2' Type='http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties' Target='docProps/core.xml'/></Relationships>",
    "docProps/core.xml": "<?xml version='1.0' encoding='UTF-8' standalone='yes'?><cp:coreProperties xmlns:cp='http://schemas.openxmlformats.org/package/2006/metadata/core-properties' xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:dcterms='http://purl.org/dc/terms/' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>" +
      "<dc:title>" + xmlEsc(titel) + "</dc:title><dc:creator>A&amp;T</dc:creator><dcterms:created xsi:type='dcterms:W3CDTF'>" + new Date().toISOString().slice(0, 19) + "Z</dcterms:created></cp:coreProperties>",
    "word/_rels/document.xml.rels": "<?xml version='1.0' encoding='UTF-8' standalone='yes'?><Relationships xmlns='http://schemas.openxmlformats.org/package/2006/relationships'>" +
      "<Relationship Id='rId1' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles' Target='styles.xml'/></Relationships>",
    "word/styles.xml": "<?xml version='1.0' encoding='UTF-8' standalone='yes'?><w:styles " + W + ">" +
      "<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii='Calibri' w:hAnsi='Calibri' w:cs='Calibri'/><w:sz w:val='22'/><w:lang w:val='de-CH'/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after='120' w:line='276' w:lineRule='auto'/></w:pPr></w:pPrDefault></w:docDefaults>" +
      "<w:style w:type='paragraph' w:default='1' w:styleId='Normal'><w:name w:val='Normal'/></w:style>" +
      "<w:style w:type='paragraph' w:styleId='Title'><w:name w:val='Title'/><w:basedOn w:val='Normal'/><w:pPr><w:spacing w:after='240'/></w:pPr><w:rPr><w:b/><w:color w:val='7A5A00'/><w:sz w:val='40'/></w:rPr></w:style>" +
      [["Heading1", "heading 1", 32], ["Heading2", "heading 2", 28], ["Heading3", "heading 3", 24]].map(function (h, i) {
        return "<w:style w:type='paragraph' w:styleId='" + h[0] + "'><w:name w:val='" + h[1] + "'/><w:basedOn w:val='Normal'/><w:next w:val='Normal'/><w:pPr><w:keepNext/><w:spacing w:before='240' w:after='80'/><w:outlineLvl w:val='" + i + "'/></w:pPr><w:rPr><w:b/><w:color w:val='" + (i < 2 ? "7A5A00" : "333333") + "'/><w:sz w:val='" + h[2] + "'/></w:rPr></w:style>";
      }).join("") +
      "<w:style w:type='paragraph' w:styleId='Zitat'><w:name w:val='Quote'/><w:basedOn w:val='Normal'/><w:pPr><w:ind w:left='360'/></w:pPr><w:rPr><w:i/><w:color w:val='555555'/></w:rPr></w:style>" +
      "<w:style w:type='paragraph' w:styleId='Klein'><w:name w:val='Klein'/><w:basedOn w:val='Normal'/><w:pPr><w:jc w:val='right'/></w:pPr><w:rPr><w:color w:val='777777'/><w:sz w:val='16'/></w:rPr></w:style></w:styles>",
    "word/document.xml": "<?xml version='1.0' encoding='UTF-8' standalone='yes'?><w:document " + W + "><w:body>" + mdZuDocxKoerper(titel, md) +
      "<w:sectPr><w:pgSz w:w='11906' w:h='16838'/><w:pgMar w:top='1134' w:right='1134' w:bottom='1134' w:left='1134' w:header='567' w:footer='567' w:gutter='0'/></w:sectPr></w:body></w:document>"
  };
  return zipBauen(Object.keys(dateien).map(function (n) { return { name: n, daten: new TextEncoder().encode(dateien[n]) }; }),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
}

/* ---------- ZIP (ohne Kompression) ---------- */
var _crcTabelle = null;
function crc32(b) {
  if (!_crcTabelle) { _crcTabelle = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; _crcTabelle[n] = c >>> 0; } }
  var crc = 0xFFFFFFFF;
  for (var i = 0; i < b.length; i++) crc = _crcTabelle[(crc ^ b[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
function zipBauen(dateien, typ) {
  var teile = [], zentral = [], versatz = 0;
  var d = new Date(), zeit = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), datum = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  function kopf(laenge) { return new DataView(new ArrayBuffer(laenge)); }
  dateien.forEach(function (f) {
    var name = new TextEncoder().encode(f.name), crc = crc32(f.daten), groesse = f.daten.length;
    var l = kopf(30);
    l.setUint32(0, 0x04034b50, true); l.setUint16(4, 20, true); l.setUint16(6, 0x0800, true); l.setUint16(8, 0, true);
    l.setUint16(10, zeit, true); l.setUint16(12, datum, true); l.setUint32(14, crc, true); l.setUint32(18, groesse, true); l.setUint32(22, groesse, true);
    l.setUint16(26, name.length, true); l.setUint16(28, 0, true);
    teile.push(new Uint8Array(l.buffer), name, f.daten);
    var z = kopf(46);
    z.setUint32(0, 0x02014b50, true); z.setUint16(4, 20, true); z.setUint16(6, 20, true); z.setUint16(8, 0x0800, true); z.setUint16(10, 0, true);
    z.setUint16(12, zeit, true); z.setUint16(14, datum, true); z.setUint32(16, crc, true); z.setUint32(20, groesse, true); z.setUint32(24, groesse, true);
    z.setUint16(28, name.length, true); z.setUint16(30, 0, true); z.setUint16(32, 0, true); z.setUint16(34, 0, true); z.setUint16(36, 0, true); z.setUint32(38, 0, true); z.setUint32(42, versatz, true);
    zentral.push(new Uint8Array(z.buffer), name);
    versatz += 30 + name.length + groesse;
  });
  var zLaenge = zentral.reduce(function (s, x) { return s + x.length; }, 0);
  var e = kopf(22);
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, dateien.length, true); e.setUint16(10, dateien.length, true); e.setUint32(12, zLaenge, true); e.setUint32(16, versatz, true);
  return new Blob(teile.concat(zentral, [new Uint8Array(e.buffer)]), { type: typ || "application/zip" });
}
