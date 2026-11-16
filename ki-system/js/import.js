/*
 * Dateien hochladen und lesen: PDF, Word (.docx), OpenDocument (.odt), Text, Markdown, CSV.
 * Alles passiert im Browser; die Datei verlässt das Gerät erst, wenn du sie Akhi zum Analysieren gibst.
 * PDF braucht beim ersten Mal Internet (pdf.js wird von jsDelivr geladen).
 */

var PDFJS_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs";
var PDFJS_WORKER = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";
var IMPORT_MAX_ZEICHEN = 60000;

async function dateiLesen(datei) {
  var name = datei.name || "Datei", endung = (name.split(".").pop() || "").toLowerCase(), text;
  if (/^(txt|md|markdown|csv|tsv|json|html?)$/.test(endung)) {
    text = await datei.text();
    if (/^html?$/.test(endung)) text = text.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, "").replace(/<\/(p|div|h\d|li|tr)>/gi, "\n").replace(/<[^>]+>/g, " ");
  } else if (endung === "docx") {
    text = officeText(await zipDatei(await datei.arrayBuffer(), "word/document.xml"), "w");
  } else if (endung === "odt") {
    text = officeText(await zipDatei(await datei.arrayBuffer(), "content.xml"), "text");
  } else if (endung === "pdf") {
    text = await pdfText(await datei.arrayBuffer());
  } else if (endung === "doc" || endung === "rtf" || endung === "pages") {
    throw new Error("Alte Word-Dateien (." + endung + ") kann A&T nicht lesen. Öffne sie in Word oder Google Docs und speichere sie als .docx oder PDF.");
  } else {
    throw new Error("Dieses Format kann A&T nicht lesen. Möglich sind PDF, Word (.docx), .odt, .txt, .md und .csv.");
  }
  text = String(text || "").replace(/ /g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!text) throw new Error("In der Datei wurde kein Text gefunden" + (endung === "pdf" ? " (vielleicht ein eingescanntes Bild ohne Text)." : "."));
  var gekuerzt = text.length > IMPORT_MAX_ZEICHEN;
  return { titel: name.replace(/\.[^.]+$/, ""), text: gekuerzt ? text.slice(0, IMPORT_MAX_ZEICHEN) : text, gekuerzt: gekuerzt, zeichen: text.length, format: endung };
}

// Holt eine Datei aus einem ZIP (Word, OpenDocument). Entpackt mit dem Browser (DecompressionStream).
async function zipDatei(puffer, gesucht) {
  var b = new Uint8Array(puffer), v = new DataView(puffer);
  var ende = -1;
  for (var i = b.length - 22; i >= Math.max(0, b.length - 66000); i--) { if (v.getUint32(i, true) === 0x06054b50) { ende = i; break; } }
  if (ende < 0) throw new Error("Die Datei ist beschädigt oder kein Word-Dokument.");
  var anzahl = v.getUint16(ende + 10, true), pos = v.getUint32(ende + 16, true);
  for (var n = 0; n < anzahl; n++) {
    if (v.getUint32(pos, true) !== 0x02014b50) break;
    var methode = v.getUint16(pos + 10, true), komprimiert = v.getUint32(pos + 20, true);
    var nameL = v.getUint16(pos + 28, true), extraL = v.getUint16(pos + 30, true), kommentarL = v.getUint16(pos + 32, true), lokal = v.getUint32(pos + 42, true);
    var name = new TextDecoder().decode(b.subarray(pos + 46, pos + 46 + nameL));
    if (name === gesucht) {
      var start = lokal + 30 + v.getUint16(lokal + 26, true) + v.getUint16(lokal + 28, true);
      var daten = b.subarray(start, start + komprimiert);
      if (methode === 0) return new TextDecoder().decode(daten);
      if (methode !== 8) throw new Error("Unbekannte Kompression in der Datei.");
      if (typeof DecompressionStream === "undefined") throw new Error("Dieser Browser kann Word-Dateien nicht entpacken. Nimm Chrome, Edge oder Safari (aktuell).");
      var strom = new Blob([daten]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      return await new Response(strom).text();
    }
    pos += 46 + nameL + extraL + kommentarL;
  }
  throw new Error("Im Dokument wurde kein Text gefunden.");
}
function officeText(xml, praefix) {
  var p = praefix === "w" ? "w:p" : "text:(p|h)";
  return xml.replace(praefix === "w" ? /<w:tab\/>/g : /<text:tab\/>/g, "\t")
    .replace(praefix === "w" ? /<w:br\/>/g : /<text:line-break\/>/g, "\n")
    .replace(new RegExp("</" + p + ">", "g"), "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
}

var _pdfjs = null;
async function pdfText(puffer) {
  if (!_pdfjs) {
    try { _pdfjs = await import(PDFJS_URL); } catch (e) { throw new Error("Der PDF-Leser konnte nicht geladen werden. Prüfe dein Internet."); }
    _pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  }
  var doc = await _pdfjs.getDocument({ data: new Uint8Array(puffer), isEvalSupported: false }).promise, seiten = [];
  for (var s = 1; s <= Math.min(doc.numPages, 300); s++) {
    var inhalt = await (await doc.getPage(s)).getTextContent();
    var zeile = "", text = [];
    inhalt.items.forEach(function (it) { zeile += it.str; if (it.hasEOL) { text.push(zeile); zeile = ""; } else zeile += " "; });
    if (zeile) text.push(zeile);
    seiten.push(text.join("\n"));
  }
  return seiten.join("\n\n");
}
