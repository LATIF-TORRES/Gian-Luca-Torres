/* Oberfläche: Tabs, Heute, Mentor-Chat, Vorbilder, Geld, Einstellungen. */

(function () {
  var $ = function (s) { return document.querySelector(s); };
  var laeuft = null; // laufende Antwort

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function md(text) {
    if (window.marked && window.DOMPurify) {
      return DOMPurify.sanitize(marked.parse(String(text || ""), { breaks: true }));
    }
    return "<p>" + esc(text).replace(/\n/g, "<br>") + "</p>";
  }
  function toast(t) {
    var el = $("#toast");
    el.textContent = t;
    el.classList.add("sichtbar");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("sichtbar"); }, Math.max(2600, String(t).length * 55));
  }
  function kern(zustand, text) {
    $("#kern").className = "kern " + (zustand || "");
    $("#marke-sub").textContent = text || (Z.einstellungen.kiName === STANDARD_NAME ? VOLLER_NAME : "Bereit");
  }

  /* ---------- Tabs ---------- */
  function zeigeTab(name) {
    document.querySelectorAll(".tab").forEach(function (t) { t.classList.toggle("aktiv", t.id === "tab-" + name); });
    document.querySelectorAll("#tabs button").forEach(function (b) { b.classList.toggle("aktiv", b.dataset.tab === name); });
    try { sessionStorage.setItem("aundt-tab", name); } catch (e) {}
    document.body.setAttribute("data-tab", name);
    if (name === "heute") heuteZeigen();
    if (name === "geld") geldZeigen();
    if (name === "chat") { verlaufZeigen(); setTimeout(function () { $("#frage").focus(); }, 50); }
    if (name === "einstellungen") einstellungenZeigen();
    if (name === "depot") { if (!istBesitzer()) return zeigeTab("heute"); Depot.zeigen(); }
    window.scrollTo(0, 0);
  }
  $("#tabs").addEventListener("click", function (ev) {
    var b = ev.target.closest("button[data-tab]");
    if (b) zeigeTab(b.dataset.tab);
  });
  document.addEventListener("click", function (ev) {
    var g = ev.target.closest("[data-gehe]");
    if (g) zeigeTab(g.dataset.gehe);
  });

  function namenSetzen() {
    var n = Z.einstellungen.kiName || STANDARD_NAME;
    $("#marke-name").textContent = n;
    document.querySelectorAll(".ki-name").forEach(function (el) { el.textContent = n; });
    document.title = n === STANDARD_NAME ? n + " · " + VOLLER_NAME : n + " · Dein KI-System für Geld und Erfolg";
    $("#frage").placeholder = "Frag " + n + " …";
  }

  /* ---------- Heute ---------- */
  function heuteZeigen() {
    var e = Z.einstellungen;
    var h = new Date().getHours();
    var gruss = h < 11 ? "Guten Morgen" : h < 18 ? "Hallo" : "Guten Abend";
    $("#gruss").textContent = gruss + (e.name ? ", " + e.name : "");
    $("#datum").textContent = new Date().toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    $("#hinweis-schluessel").classList.toggle("versteckt", hatSchluessel());

    var m = monatsZahlen();
    if (e.ziel > 0) {
      var anteil = Math.min(1, m.einHalal / e.ziel);
      $("#ziel-text").textContent = geld(m.einHalal) + " von " + geld(e.ziel);
      $("#ziel-balken").style.width = Math.round(anteil * 100) + "%";
      var jetzt = new Date();
      var tageImMonat = new Date(jetzt.getFullYear(), jetzt.getMonth() + 1, 0).getDate();
      var resttage = tageImMonat - jetzt.getDate() + 1;
      var fehlt = Math.max(0, e.ziel - m.einHalal);
      $("#ziel-detail").textContent = fehlt > 0
        ? "Es fehlen " + geld(fehlt) + (resttage > 1 ? ". Das sind " + geld(fehlt / resttage) + " pro Tag für die restlichen " + resttage + " Tage." : ". Heute ist der letzte Tag des Monats.")
        : "Ziel erreicht. Zeit, das Ziel zu erhöhen.";
    } else {
      $("#ziel-text").textContent = geld(m.einHalal) + " diesen Monat";
      $("#ziel-balken").style.width = "0%";
      $("#ziel-detail").innerHTML = "Setze unter <a href='#' data-gehe='einstellungen'>„Ich“</a> ein Monatsziel.";
    }

    var offen = Z.aufgaben.filter(function (a) { return !a.erledigt; });
    var eine = offen.filter(function (a) { return a.wichtig; })[0] || offen[0];
    $("#eine-sache").textContent = eine ? eine.text : "Noch nichts geplant. Lass dir den Tag planen.";

    aufgabenZeigen();

    var chips = $("#schnellstart");
    chips.innerHTML = "";
    SCHNELLSTART.forEach(function (s) {
      var b = document.createElement("button");
      b.className = "chip";
      b.textContent = s.text;
      b.onclick = function () {
        zeigeTab("chat");
        $("#modus").value = s.modus;
        modusInfo();
        $("#frage").value = s.text;
        groesse();
        if (s.offen) $("#frage").focus(); else fragen();
      };
      chips.appendChild(b);
    });
  }

  function aufgabenZeigen() {
    var ul = $("#aufgaben");
    ul.innerHTML = "";
    var sortiert = Z.aufgaben.slice().sort(function (a, b) {
      return (a.erledigt - b.erledigt) || (b.wichtig - a.wichtig);
    });
    if (!sortiert.length) ul.innerHTML = "<li class='leise'>Noch keine Aufgaben.</li>";
    sortiert.slice(0, 40).forEach(function (a) {
      var li = document.createElement("li");
      li.className = a.erledigt ? "erledigt" : "";
      li.innerHTML = "<label class='haken'><input type='checkbox' " + (a.erledigt ? "checked" : "") + "> <span>" + esc(a.text) + "</span></label>" +
        "<button class='mini' title='Wichtigste heute'>" + (a.wichtig ? "★" : "☆") + "</button>" +
        "<button class='mini' title='Löschen'>✕</button>";
      li.querySelector("input").onchange = function () { a.erledigt = this.checked; speichern(); heuteZeigen(); if (a.erledigt) toast("Stark. Weiter so."); };
      var knoepfe = li.querySelectorAll("button");
      knoepfe[0].onclick = function () { var war = a.wichtig; Z.aufgaben.forEach(function (x) { x.wichtig = false; }); a.wichtig = !war; speichern(); heuteZeigen(); };
      knoepfe[1].onclick = function () { Z.aufgaben = Z.aufgaben.filter(function (x) { return x !== a; }); speichern(); heuteZeigen(); };
      ul.appendChild(li);
    });
  }

  $("#aufgabe-form").onsubmit = function (ev) {
    ev.preventDefault();
    var t = $("#aufgabe-text").value.trim();
    if (!t) return;
    aufgabeAnlegen(t, false);
    $("#aufgabe-text").value = "";
    heuteZeigen();
  };
  $("#tag-planen").onclick = function () {
    zeigeTab("chat");
    $("#modus").value = "coach";
    modusInfo();
    $("#frage").value = "Plane meinen heutigen Tag: höchstens 3 Aufgaben, eine davon die wichtigste, die mich meinem Geldziel näher bringt.";
    fragen();
  };

  /* ---------- Chat ---------- */
  function modusFuellen() {
    var sel = $("#modus");
    sel.innerHTML = "";
    Object.keys(MODI).forEach(function (k) {
      if (MODI[k].besitzer && !istBesitzer()) return; // nur für den Besitzer
      var o = document.createElement("option");
      o.value = k;
      o.textContent = MODI[k].titel;
      sel.appendChild(o);
    });
    sel.onchange = modusInfo;
  }
  function modusInfo() {
    var m = MODI[$("#modus").value];
    $("#modus-info").textContent = m ? m.info : "";
    var c = aktiverChat(false);
    if (c) { c.modus = $("#modus").value; speichern(); }
  }

  function aktiverChat(anlegen) {
    var c = Z.chats.filter(function (x) { return x.id === Z.aktiverChat; })[0];
    if (!c && anlegen) {
      c = {
        id: neueId(), titel: "Neues Gespräch", modus: $("#modus").value || "stratege",
        system: grundauftrag(Z.einstellungen.kiName || STANDARD_NAME), // bleibt für dieses Gespräch fest
        anbieter: Z.einstellungen.anbieter, // Gemini und Claude speichern Gespräche verschieden
        nachrichten: [], kosten: 0, datum: heuteISO()
      };
      Z.chats.push(c);
      Z.aktiverChat = c.id;
      speichern();
      chatWahlFuellen();
    }
    return c;
  }

  function chatWahlFuellen() {
    var sel = $("#chat-wahl");
    sel.innerHTML = "";
    var liste = Z.chats.slice().reverse();
    if (!liste.length) {
      sel.innerHTML = "<option>Noch kein Gespräch</option>";
      return;
    }
    liste.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c.id;
      o.textContent = (c.titel || "Gespräch") + (c.datum ? " · " + String(c.datum).slice(5).split("-").reverse().join(".") : "");
      if (c.id === Z.aktiverChat) o.selected = true;
      sel.appendChild(o);
    });
  }
  $("#chat-wahl").onchange = function () {
    Z.aktiverChat = this.value;
    var c = aktiverChat(false);
    if (c && c.modus) $("#modus").value = c.modus;
    modusInfo();
    speichern();
    verlaufZeigen();
  };
  $("#chat-loeschen").onclick = function () {
    var c = aktiverChat(false);
    if (laeuft || !c) return;
    if (!confirm("Dieses Gespräch löschen? Was A&T sich gemerkt hat, bleibt.")) return;
    Z.chats = Z.chats.filter(function (x) { return x !== c; });
    Z.aktiverChat = Z.chats.length ? Z.chats[Z.chats.length - 1].id : null;
    speichern();
    chatWahlFuellen();
    var neu = aktiverChat(false);
    if (neu && neu.modus) $("#modus").value = neu.modus;
    modusInfo();
    verlaufZeigen();
    toast("Gespräch gelöscht.");
  };
  $("#chat-neu").onclick = function () {
    if (laeuft) return;
    Z.aktiverChat = null;
    speichern();
    chatWahlFuellen();
    verlaufZeigen();
    $("#frage").focus();
  };

  // Liest aus den gespeicherten API-Nachrichten, was angezeigt wird.
  function anzeigeAus(nachrichten) {
    var blasen = [];
    nachrichten.forEach(function (n) {
      if (n.parts) n = geminiAlsAnzeige(n);
      else if (typeof n.content === "string" || n.role === "tool") n = lokalAlsAnzeige(n);
      if (!n) return;
      if (n.role === "user") {
        var texte = (Array.isArray(n.content) ? n.content : [{ type: "text", text: n.content }])
          .filter(function (b) { return b.type === "text" && b.text.indexOf("<kontext>") !== 0; });
        if (texte.length) blasen.push({ wer: "ich", text: texte.map(function (b) { return b.text; }).join("\n") });
        return;
      }
      var letzte = blasen[blasen.length - 1];
      if (!letzte || letzte.wer !== "ki") { letzte = { wer: "ki", text: "", quellen: [], aktionen: [] }; blasen.push(letzte); }
      (n.content || []).forEach(function (b) {
        if (b.type === "text") letzte.text += (letzte.text && !/\n$/.test(letzte.text) ? "\n\n" : "") + b.text;
        if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
          b.content.forEach(function (r) {
            if (r.url && !letzte.quellen.some(function (q) { return q.url === r.url; })) letzte.quellen.push({ title: r.title || r.url, url: r.url });
          });
        }
        if (b.type === "tool_use") letzte.aktionen.push(aktionText(b.name, b.input));
      });
    });
    return blasen;
  }
  // Lokale KI (Ollama): Nachrichten in dieselbe Form wie bei Claude bringen, nur für die Anzeige.
  function lokalAlsAnzeige(n) {
    if (n.role === "tool") return null;
    if (n.role === "user") return { role: "user", content: [{ type: "text", text: n._anzeige || n.content }] };
    var inhalt = n.content ? [{ type: "text", text: n.content }] : [];
    (n.tool_calls || []).forEach(function (a) {
      var args = a.function && a.function.arguments;
      if (typeof args === "string") { try { args = JSON.parse(args); } catch (x) { args = {}; } }
      inhalt.push({ type: "tool_use", name: a.function && a.function.name, input: args });
    });
    return { role: "assistant", content: inhalt };
  }
  // Wandelt eine Gemini-Nachricht in dieselbe Form wie bei Claude, nur für die Anzeige.
  function geminiAlsAnzeige(n) {
    var inhalt = [];
    if (n.role === "user") {
      return { role: "user", content: n.parts.filter(function (p) { return typeof p.text === "string"; }).map(function (p) { return { type: "text", text: p.text }; }) };
    }
    var text = "";
    n.parts.forEach(function (p) {
      if (typeof p.text === "string" && !p.thought) text += p.text;
      if (p.functionCall) inhalt.push({ type: "tool_use", name: p.functionCall.name, input: p.functionCall.args });
    });
    if (text) inhalt.unshift({ type: "text", text: text });
    if (n._quellen) inhalt.push({ type: "web_search_tool_result", content: n._quellen.map(function (q) { return { url: q.url, title: q.title }; }) });
    return { role: n.role === "model" ? "assistant" : "user", content: inhalt };
  }
  function aktionText(name, input) {
    input = input || {};
    if (name === "merken") return "🧠 Gemerkt: " + (input.text || "");
    if (name === "aufgabe_anlegen") return "✅ Aufgabe: " + (input.text || "") + (input.wichtig ? " ★" : "");
    if (name === "kurs_abfragen") return "📈 Kurs " + (input.symbol || "");
    if (name === "halal_pruefen") return "🔎 Halal-Prüfung " + (input.symbol || "");
    if (name === "depot_anzeigen") return "📊 Depot angesehen";
    if (name === "kandidaten_scannen") return "🔭 Kandidaten gescannt";
    if (name === "order_aufgeben") return "🧾 Order: " + (input.seite || "") + " " + (input.anzahl || "") + " " + (input.symbol || "");
    if (name === "ueberweisung_vorbereiten") return "💸 Überweisung vorbereitet: " + (Number(input.betrag) || 0).toFixed(2) + " " + (input.waehrung || "") + " an " + (input.empfaenger || "");
    if (name === "buchung_eintragen") return (input.art === "sadaqa" ? "🤲 " : "💰 ") + (BUCHUNGSARTEN[input.art] || "Buchung") + " " + geld(input.betrag) + " · " + (input.quelle || "") + (input.halal === "nicht_halal" ? " · nicht halal" : "");
    return name;
  }

  function blaseHtml(b) {
    if (b.wer === "ich") return "<div class='blase ich'>" + esc(b.text).replace(/\n/g, "<br>") + "</div>";
    var html = "<div class='blase ki'>";
    if (b.aktionen && b.aktionen.length) html += "<div class='aktionen'>" + b.aktionen.map(function (a) { return "<span>" + esc(a) + "</span>"; }).join("") + "</div>";
    var vs = vorschlaegeTrennen(b.text);
    html += "<div class='md'>" + md(vs.text) + "</div>";
    if (vs.vorschlaege.length) html += "<div class='vorschlaege'>" + vs.vorschlaege.map(function (x) { return "<button type='button' class='vorschlag' data-text='" + esc(x) + "'>" + esc(x) + "</button>"; }).join("") + "</div>";
    if (b.quellen && b.quellen.length) {
      html += "<details class='quellen'><summary>Quellen (" + b.quellen.length + ")</summary><ol>" +
        b.quellen.slice(0, 12).map(function (q) { return "<li><a href='" + esc(q.url) + "' target='_blank' rel='noopener'>" + esc(q.title) + "</a></li>"; }).join("") + "</ol></details>";
    }
    if (b.text) html += "<div class='blasen-knoepfe'><button class='mini kopieren' title='Kopieren'>📋</button><button class='mini vorlesen' title='Vorlesen'>🔊</button><button class='mini gut' title='Hilfreich'>👍</button><button class='mini schlecht' title='Nicht hilfreich'>👎</button></div>";
    return html + "</div>";
  }

  function kopieren(text) {
    function alt() {
      var t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); toast("Kopiert."); } catch (e) { toast("Kopieren ging nicht."); }
      t.remove();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { toast("Kopiert."); }, alt);
    else alt();
  }

  function verlaufZeigen() {
    var c = aktiverChat(false);
    var v = $("#verlauf");
    var n = Z.einstellungen.kiName || STANDARD_NAME;
    if (!c || !c.nachrichten.length) {
      v.innerHTML = "<div class='leer'><div class='kern gross-kern'><span></span></div><p><strong>" + esc(n) + "</strong> ist bereit.</p>" +
        "<p class='leise'>Erzähl, was du kannst, wie viel Zeit du hast und wie viel du verdienen willst. Je mehr " + esc(n) + " weiss, desto besser passen die Ideen.</p></div>";
    } else {
      v.innerHTML = anzeigeAus(c.nachrichten).map(blaseHtml).join("");
    }
    v.querySelectorAll(".vorschlag").forEach(function (btn) {
      btn.onclick = function () { if (!laeuft) fragen(btn.getAttribute("data-text")); };
    });
    v.querySelectorAll(".vorlesen").forEach(function (btn) {
      btn.onclick = function () { Stimme.vorlesen(btn.closest(".blase").querySelector(".md").innerText); };
    });
    v.querySelectorAll(".blasen-knoepfe .gut, .blasen-knoepfe .schlecht").forEach(function (btn) {
      btn.onclick = function () {
        var blase = btn.closest(".blase"), gut = btn.classList.contains("gut"), notiz = "", vor = blase.previousElementSibling;
        while (vor && !vor.classList.contains("ich")) vor = vor.previousElementSibling;
        if (!gut) { notiz = prompt("Was soll " + (Z.einstellungen.kiName || STANDARD_NAME) + " besser machen? (z. B. kürzer, mehr Zahlen, konkreter) – optional"); if (notiz === null) return; }
        toast(rueckmeldung(gut, vor ? vor.innerText : "", blase.querySelector(".md").innerText, notiz));
        btn.parentNode.querySelectorAll(".gut, .schlecht").forEach(function (x) { x.disabled = true; });
        btn.classList.add("gewaehlt");
      };
    });
    v.querySelectorAll(".kopieren").forEach(function (btn) {
      btn.onclick = function () { kopieren(btn.closest(".blase").querySelector(".md").innerText); };
    });
    $("#kosten").textContent = c && c.anbieter === "lokal" ? "Lokal · kostenlos, ohne Limit" : c && c.anbieter === "gemini" ? "Gemini · kostenlos" : c && c.kosten ? "Gespräch ca. $" + c.kosten.toFixed(3) : "";
    v.scrollTop = v.scrollHeight;
    window.scrollTo(0, document.body.scrollHeight);
  }

  function groesse() {
    var t = $("#frage");
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 180) + "px";
  }
  $("#frage").addEventListener("input", groesse);
  $("#frage").addEventListener("keydown", function (ev) {
    if (ev.key === "Enter" && !ev.shiftKey && !ev.isComposing) { ev.preventDefault(); fragen(); }
  });
  $("#chat-form").onsubmit = function (ev) { ev.preventDefault(); if (laeuft) { laeuft.stoppen(); } else fragen(); };

  function fragen(textVonStimme) {
    var text = (textVonStimme || $("#frage").value).trim();
    if (!text || laeuft) return;
    var e = Z.einstellungen;
    if (!hatSchluessel()) {
      toast(e.anbieter === "claude" ? "Zuerst den Claude-Schlüssel eintragen." : "Zuerst den kostenlosen Gemini-Schlüssel eintragen.");
      zeigeTab("einstellungen");
      $(e.anbieter === "claude" ? "#e-schluessel" : "#e-gemini-schluessel").focus();
      return;
    }
    Stimme.stumm();
    var c = aktiverChat(false);
    if (c && (c.anbieter || "claude") !== e.anbieter && c.nachrichten.length) {
      // Anderer Anbieter: neues Gespräch, weil die Formate verschieden sind.
      Z.aktiverChat = null;
      toast("Neues Gespräch mit " + ({ claude: "Claude", gemini: "Gemini", lokal: "der lokalen KI" })[e.anbieter] + ".");
    }
    c = aktiverChat(true);
    auftragAktuell(c, e.kiName || STANDARD_NAME);
    if (!c.nachrichten.length) c.anbieter = e.anbieter;
    if (!c.nachrichten.length) { c.titel = text.length > 40 ? text.slice(0, 40) + "…" : text; chatWahlFuellen(); }
    var modus = MODI[$("#modus").value] || MODI.stratege;
    var kontext = "<kontext>\n" + HALAL_ERINNERUNG + "\n" + modus.auftrag + "\n" + kontextFuerKi() + (typeof wissenKontext === "function" ? wissenKontext(text) : "") +
      (typeof planStandardsFuer === "function" && planStandardsFuer(text) ? "\n" + planStandardsFuer(text) : "") +
      (e.websuche ? "" : "\nNutze diesmal keine Web-Suche.") + "\n</kontext>";
    // Endet der Verlauf schon mit einer Nutzer-Nachricht (z. B. nach einem Abbruch), dort anhängen:
    // Beide Anbieter erwarten abwechselnd Nutzer und KI.
    var letzteN = c.nachrichten[c.nachrichten.length - 1];
    var neueTeile = c.anbieter === "gemini" ? [{ text: kontext }, { text: text }] : [{ type: "text", text: kontext }, { type: "text", text: text }];
    var angehaengt = !!(letzteN && letzteN.role === "user");
    var vorher = angehaengt ? JSON.stringify(letzteN) : null;
    if (c.anbieter === "lokal") {
      // Ollama: Text als eine Zeichenkette; _anzeige ist nur für die Anzeige.
      if (angehaengt) {
        letzteN.content += "\n\n" + kontext + "\n\n" + text;
        letzteN._anzeige = (letzteN._anzeige ? letzteN._anzeige + "\n" : "") + text;
      } else c.nachrichten.push({ role: "user", content: kontext + "\n\n" + text, _anzeige: text });
    } else if (angehaengt) {
      var feld = c.anbieter === "gemini" ? "parts" : "content";
      if (!Array.isArray(letzteN[feld])) letzteN[feld] = [{ type: "text", text: String(letzteN[feld]) }];
      Array.prototype.push.apply(letzteN[feld], neueTeile);
    } else if (c.anbieter === "gemini") c.nachrichten.push({ role: "user", parts: neueTeile });
    else c.nachrichten.push({ role: "user", content: neueTeile });
    speichern();
    $("#frage").value = "";
    groesse();
    verlaufZeigen();

    var v = $("#verlauf");
    var live = document.createElement("div");
    live.className = "blase ki live";
    live.innerHTML = "<div class='aktionen'></div><div class='md'><span class='tippt'><i></i><i></i><i></i></span></div><div class='status leise'></div>";
    v.appendChild(live);
    v.scrollTop = v.scrollHeight;
    var gesamt = "", geplant = false;
    $("#senden").textContent = "■";
    $("#senden").title = "Stoppen";
    kern("denkt", "denkt nach …");

    laeuft = antwortHolen(c, {
      text: function (d) {
        gesamt += d;
        if (geplant) return;
        geplant = true;
        requestAnimationFrame(function () {
          geplant = false;
          live.querySelector(".md").innerHTML = md(vorschlaegeTrennen(gesamt).text);
          v.scrollTop = v.scrollHeight;
        });
      },
      status: function (s) { live.querySelector(".status").textContent = s; kern("denkt", s); },
      quelle: function () {},
      werkzeug: function (name, erg) {
        var span = document.createElement("span");
        span.textContent = erg;
        live.querySelector(".aktionen").appendChild(span);
        if (name === "buchung_eintragen" || name === "aufgabe_anlegen") heuteZeigen();
        if (name === "ueberweisung_vorbereiten") geldZeigen();
      },
      fertig: function () {
        laeuft = null;
        aufraeumen();
        verlaufZeigen();
        heuteZeigen();
        if (Z.einstellungen.vorlesen && gesamt) Stimme.vorlesen(vorschlaegeTrennen(gesamt).text);
      },
      fehler: function (t) {
        laeuft = null;
        aufraeumen();
        verlaufZeigen();
        var f = document.createElement("div");
        f.className = "blase fehler";
        f.textContent = t;
        $("#verlauf").appendChild(f);
        // Unbeantwortete Frage wieder ins Eingabefeld holen und aus dem Verlauf nehmen,
        // aber nur, wenn noch keine Antwort darauf gespeichert ist (Verlauf bleibt sonst unverändert).
        var letzte = c.nachrichten[c.nachrichten.length - 1];
        if (letzte && letzte.role === "user" && c.nachrichten.indexOf(letzte) === c.nachrichten.length - 1 &&
            JSON.stringify(letzte).indexOf(JSON.stringify(text).slice(1, -1)) !== -1) {
          if (angehaengt) c.nachrichten[c.nachrichten.length - 1] = JSON.parse(vorher); else c.nachrichten.pop();
          speichern();
          $("#frage").value = text;
          groesse();
        }
      }
    });
  }
  function aufraeumen() {
    $("#senden").textContent = "➤";
    $("#senden").title = "Senden";
    kern("", "Bereit");
  }

  /* Stimme */
  $("#mikro").onclick = function () {
    Stimme.einmal(function (text, fehler) {
      if (fehler) return toast(fehler);
      if (text) { $("#frage").value = text; groesse(); fragen(); }
    });
  };
  Stimme.beiZustand(function (an) {
    $("#mikro").classList.toggle("an", an);
    if (an) kern("hoert", "hört zu …"); else if (!laeuft) kern("", "Bereit");
  });
  Stimme.beiText(function (text) {
    if (!text) { toast("Ja? Ich höre."); return; }
    zeigeTab("chat");
    fragen(text);
  });
  $("#websuche").onchange = function () { Z.einstellungen.websuche = this.checked; speichern(); };
  $("#vorlesen").onchange = function () { Z.einstellungen.vorlesen = this.checked; speichern(); if (!this.checked) Stimme.stumm(); };
  $("#tiefe").onchange = function () { Z.einstellungen.tiefe = this.value; speichern(); };

  /* ---------- Vorbilder ---------- */
  function vorbilderZeigen() {
    var box = $("#vorbilder");
    box.innerHTML = "";
    VORBILDER.forEach(function (v) {
      var d = document.createElement("article");
      d.className = "karte vorbild" + (v.islamisch ? " islamisch" : "");
      var initialen = v.initialen || v.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2);
      d.innerHTML = "<div class='vorbild-kopf'><div class='initialen'>" + esc(initialen) + "</div>" +
        "<div><h3>" + esc(v.name) + "</h3><div class='leise klein-text'>" + esc(v.wer) + "</div></div></div>" +
        "<div class='prinzip'>" + esc(v.prinzip) + "</div><p>" + esc(v.text) + "</p>" +
        (v.halal ? "<p class='halal-hinweis'><strong>Halal-Hinweis:</strong> " + esc(v.halal) + "</p>" : "") +
        "<p class='uebung'><strong>Deine Übung:</strong> " + esc(v.uebung) + "</p>" +
        "<button class='knopf klein'>Auf mich anwenden</button>";
      d.querySelector("button").onclick = function () {
        zeigeTab("chat");
        $("#modus").value = "spiegel";
        modusInfo();
        $("#frage").value = v.frage + " (Prinzip: „" + v.prinzip + "“ von " + v.name + ")";
        fragen();
      };
      box.appendChild(d);
    });
  }

  /* ---------- Geld ---------- */
  function geldZeigen() {
    var m = monatsZahlen();
    var monat = new Date().toLocaleDateString("de-CH", { month: "long" });
    $("#geld-kacheln").innerHTML =
      kachel("Einnahmen " + monat, geld(m.ein), "plus") +
      kachel("Ausgaben " + monat, geld(m.aus), "minus") +
      kachel("Bleibt übrig", geld(m.saldo) + (m.ein > 0 ? " · " + String(Math.round(m.quote * 100)).replace("-", "−") + " %" : ""), m.saldo >= 0 ? "plus" : "minus") +
      (function () {
        var sv = sadaqaVorschlag();
        if (!sv.prozent) return "";
        return kachel("Sadaqa-Vorschlag " + monat, geld(sv.vorschlag), "gold-zahl",
          String(sv.prozent).replace(".", ",") + " % deiner Einnahmen. Nur ein Vorschlag, es wird nichts abgezogen." +
          (sv.gegeben > 0 ? " Selbst eingetragen: " + geld(sv.gegeben) + "." : ""));
      })();

    var q = Object.keys(m.quellen).sort(function (a, b) { return m.quellen[b] - m.quellen[a]; });
    var max = q.length ? m.quellen[q[0]] : 1;
    $("#quellen").innerHTML = q.length
      ? "<h3>Woher dein Geld diesen Monat kommt</h3>" + q.map(function (k) {
          return "<div class='quelle'><span>" + esc(k) + "</span><div class='balken klein'><div style='width:" + Math.round(m.quellen[k] / max * 100) + "%'></div></div><strong>" + geld(m.quellen[k]) + "</strong></div>";
        }).join("")
      : "";

    var ul = $("#buchungen");
    ul.innerHTML = "";
    var liste = Z.buchungen.slice().sort(function (a, b) { return a.datum < b.datum ? 1 : -1; }).slice(0, 40);
    if (!liste.length) ul.innerHTML = "<li class='leise'>Noch keine Buchungen. Trag deine erste Einnahme ein.</li>";
    liste.forEach(function (b) {
      var li = document.createElement("li");
      var marke = b.art === "sadaqa" ? "<em class='marke-klein gut'>Sadaqa</em>" :
        b.halal === "nicht_halal" ? "<em class='marke-klein schlecht'>nicht halal</em>" :
        b.halal === "zweifelhaft" ? "<em class='marke-klein mittel'>zweifelhaft</em>" : "";
      li.className = "buchung";
      li.innerHTML = "<span class='leise datum'>" + esc(b.datum.split("-").reverse().join(".").slice(0, 6)) + "</span><span class='wachsen'>" + esc(b.quelle) + " " + marke + "</span>" +
        "<strong class='" + (b.art === "ein" ? "plus" : "minus") + "'>" + (b.art === "ein" ? "+" : "−") + geld(b.betrag) + "</strong><button class='mini' title='Löschen'>✕</button>";
      li.querySelector("button").onclick = function () { Z.buchungen = Z.buchungen.filter(function (x) { return x !== b; }); speichern(); geldZeigen(); };
      ul.appendChild(li);
    });
    if (istBesitzer()) Depot.ueberweisungenZeigen(); else $("#ueberweisungen-karte").classList.add("versteckt");
    rechnen();
  }
  window.geldNeuZeigen = function () { geldZeigen(); };
  function kachel(titel, wert, art, notiz) {
    return "<div class='karte kachel'><div class='leise klein-text'>" + esc(titel) + "</div><div class='gross " + art + "'>" + esc(wert) + "</div>" +
      (notiz ? "<div class='leise klein-text'>" + esc(notiz) + "</div>" : "") + "</div>";
  }
  $("#b-datum").value = heuteISO();
  $("#b-art").onchange = function () {
    $("#b-halal").classList.toggle("versteckt", this.value !== "ein");
    $("#b-quelle").placeholder = { ein: "Woher? z. B. Nachhilfe", aus: "Wofür? z. B. Werbung", sadaqa: "An wen? z. B. Moschee" }[this.value];
  };
  $("#buchung-form").onsubmit = function (ev) {
    ev.preventDefault();
    toast(buchungEintragen($("#b-art").value, $("#b-betrag").value, $("#b-quelle").value, $("#b-datum").value, $("#b-halal").value));
    $("#b-betrag").value = "";
    $("#b-quelle").value = "";
    geldZeigen();
  };

  function zahl(id) { var n = parseFloat($(id).value); return isFinite(n) ? n : 0; }
  function rechnen() {
    // Sparziel ohne Zinsen: nur eigenes Geld, kein Zins, kein Zinseszins
    var sparZiel = zahl("#p-ziel"), gespart = zahl("#p-gespart"), proMonat = zahl("#p-rate");
    var fehlt = Math.max(0, sparZiel - gespart);
    var monate = proMonat > 0 ? Math.ceil(fehlt / proMonat) : 0;
    var fertig = new Date();
    fertig.setMonth(fertig.getMonth() + monate);
    $("#p-ergebnis").innerHTML = fehlt === 0
      ? "<div><strong class='gold-text'>Ziel erreicht.</strong> Alhamdulillah.</div>"
      : proMonat > 0
        ? "<div>Noch <strong class='gold-text'>" + monate + " " + (monate === 1 ? "Monat" : "Monate") + "</strong> bis zum Ziel</div>" +
          "<div class='leise'>" + geld(fehlt) + " ÷ " + geld(proMonat) + " pro Monat = " + (Math.round(fehlt / proMonat * 10) / 10) + " Monate, also etwa " +
          fertig.toLocaleDateString("de-CH", { month: "long", year: "numeric" }) + "</div>" +
          "<div class='leise'>Schneller geht es mit mehr Einnahmen aus erlaubter Arbeit und erlaubtem Handel, nicht mit Zinsen.</div>"
        : "<div class='leise'>Trag ein, wie viel du pro Monat sparen kannst.</div>";

    // Zakat: 2,5 % auf das Vermögen über dem Nisab (Wert von 85 g Gold), wenn es ein Mondjahr lang gehalten wurde
    var goldpreis = zahl("#k-goldpreis");
    var vermoegen = zahl("#k-bar") + zahl("#k-gold") + zahl("#k-waren") + zahl("#k-anteile") + zahl("#k-forderungen");
    var netto = vermoegen - zahl("#k-schulden");
    var nisab = goldpreis * 85;
    var zakat = netto * 0.025;
    $("#k-ergebnis").innerHTML = goldpreis <= 0
      ? "<div class='leise'>Trag den heutigen Goldpreis pro Gramm ein. Daraus ergibt sich der Nisab.</div>"
      : "<div>Nisab (85 g Gold): " + geld(nisab) + "</div>" +
        "<div>Dein zakatpflichtiges Vermögen: " + geld(vermoegen) + " − " + geld(zahl("#k-schulden")) + " = <strong>" + geld(netto) + "</strong></div>" +
        (netto >= nisab
          ? "<div>Zakat: " + geld(netto) + " × 2,5 % = <strong class='gold-text'>" + geld(zakat) + "</strong></div>" +
            "<div class='leise'>Fällig, wenn dein Vermögen ein ganzes Mondjahr (Hawl) über dem Nisab lag.</div>"
          : "<div><strong class='gold-text'>Keine Zakat fällig.</strong> Dein Vermögen liegt unter dem Nisab.</div>") +
        "<div class='leise klein-text'>Die Rechtsschulen rechnen teils verschieden (z. B. Silber-Nisab, Aktien, Schmuck). Frag im Zweifel einen Gelehrten.</div>";

    // Stundensatz
    var ziel = zahl("#s-ziel"), kosten = zahl("#s-kosten"), std = zahl("#s-stunden"), wochen = zahl("#s-wochen"), ausl = zahl("#s-auslastung");
    var bezahlt = std * wochen * ausl / 100;
    var satz = bezahlt > 0 ? (ziel + kosten) / bezahlt : 0;
    $("#s-ergebnis").innerHTML =
      "<div>Dein Stundensatz: <strong class='gold-text'>" + geld(satz) + "</strong></div>" +
      "<div class='leise'>" + geld(ziel + kosten) + " ÷ " + Math.round(bezahlt) + " bezahlte Stunden (" + std + " h × " + wochen + " Wochen × " + ausl + " %)</div>" +
      "<div class='leise klein-text'>Steuern und Versicherungen sind nicht eingerechnet. Rechne sie bei den Kosten dazu.</div>";
  }
  document.querySelectorAll("#tab-geld .formular input").forEach(function (i) { i.addEventListener("input", rechnen); });

  /* ---------- Einstellungen ---------- */
  var FELDER = { "#e-name": "name", "#e-ki-name": "kiName", "#e-waehrung": "waehrung", "#e-ziel": "ziel", "#e-warum": "warum", "#e-schluessel": "schluessel", "#e-modell": "modell", "#e-sprache": "sprache",
    "#e-anbieter": "anbieter", "#e-lokal-modell": "lokalModell", "#e-sadaqa": "sadaqaProzent", "#e-gemini-schluessel": "geminiSchluessel", "#e-gemini-modell": "geminiModell" };
  function geminiOption(id) {
    var sel = $("#e-gemini-modell");
    if (id && !Array.prototype.some.call(sel.options, function (o) { return o.value === id; })) {
      var o = document.createElement("option");
      o.value = id; o.textContent = id;
      sel.appendChild(o);
    }
  }
  function anbieterZeigen() {
    var a = Z.einstellungen.anbieter;
    $("#zugang-lokal").classList.toggle("versteckt", a !== "lokal");
    $("#zugang-gemini").classList.toggle("versteckt", a !== "gemini");
    $("#info-gemini").classList.toggle("versteckt", a !== "gemini");
    $("#zugang-claude").classList.toggle("versteckt", a !== "claude");
    $("#info-claude").classList.toggle("versteckt", a !== "claude");
  }
  function lokalOption(id) {
    var sel = $("#e-lokal-modell");
    if (id && !Array.prototype.some.call(sel.options, function (o) { return o.value === id; })) {
      var o = document.createElement("option"); o.value = id; o.textContent = id; sel.appendChild(o);
    }
  }
  // Prüft, ob Ollama läuft, und füllt die Modellliste.
  function lokalStatusPruefen(still) {
    var st = $("#lokal-status");
    if (!still) { st.className = "klein-text leise"; st.textContent = "Prüfe …"; }
    return lokalPruefen().then(function (p) {
      if (p.ok && p.modelle.length) {
        p.modelle.forEach(lokalOption);
        if (!Z.einstellungen.lokalModell) { Z.einstellungen.lokalModell = p.modell; speichern(); }
        $("#e-lokal-modell").value = Z.einstellungen.lokalModell;
        st.className = "klein-text plus";
        st.textContent = "✓ Lokale KI läuft. Modelle: " + p.modelle.join(", ") + ". Unbegrenzt und kostenlos.";
      } else if (p.ok) {
        st.className = "klein-text minus";
        st.textContent = "Ollama läuft, aber es ist noch kein Modell geladen. Starte „Lokale KI installieren.cmd“.";
      } else {
        st.className = "klein-text minus";
        st.textContent = "Keine lokale KI gefunden. Unter Windows: Doppelklick auf „Lokale KI installieren.cmd“. Ist sie schon installiert, öffne Ollama im Startmenü.";
      }
      return p;
    });
  }
  $("#lokal-pruefen").onclick = function () { lokalStatusPruefen(false); };
  $("#modelle-laden").onclick = function () {
    var k = Z.einstellungen.geminiSchluessel;
    if (!k) { toast("Zuerst den Gemini-Schlüssel eintragen."); return; }
    this.disabled = true;
    var knopf = this;
    geminiModelleLaden(k).then(function (liste) {
      var sel = $("#e-gemini-modell");
      sel.innerHTML = "<option value=''>Automatisch: klügstes Modell für wichtige Aufgaben (empfohlen)</option>";
      liste.forEach(function (m) {
        var o = document.createElement("option");
        o.value = m.id;
        o.textContent = m.titel + (m.pro ? " · am klügsten, wenige Gratis-Anfragen" : m.lite ? " · mehr Gratis-Anfragen" : " · schnell und gut") + (m.vorschau ? " · Vorschau" : "");
        sel.appendChild(o);
      });
      geminiOption(Z.einstellungen.geminiModell);
      sel.value = Z.einstellungen.geminiModell;
      speichern();
      toast(liste.length + " Modelle gefunden. Schlüssel funktioniert.");
    }).catch(function (f) {
      toast(f.message === "schluessel" ? "Der Gemini-Schlüssel stimmt nicht." : "Keine Verbindung zu Google.");
    }).then(function () { knopf.disabled = false; });
  };
  function einstellungenZeigen() {
    var e = Z.einstellungen;
    geminiOption(e.geminiModell);
    lokalOption(e.lokalModell);
    Object.keys(FELDER).forEach(function (s) { $(s).value = e[FELDER[s]] || ""; });
    anbieterZeigen();
    $("#e-weckwort").checked = !!e.weckwort;
    gedaechtnisZeigen();
  }
  Object.keys(FELDER).forEach(function (s) {
    $(s).addEventListener("change", function () {
      var k = FELDER[s], wert = this.value.trim();
      if (k === "ziel") wert = Math.max(0, parseFloat(wert) || 0);
      if (k === "sadaqaProzent") wert = Math.max(0, parseFloat(wert) || 0);
      if (k === "kiName") wert = wert || STANDARD_NAME;
      Z.einstellungen[k] = wert;
      speichern();
      namenSetzen();
      if ((k === "schluessel" || k === "geminiSchluessel") && wert) toast("Schlüssel gespeichert.");
      if (k === "geminiSchluessel") {
        _geminiListe = null;
        Z.einstellungen.geminiErschoepft = null;
        Z.einstellungen.geminiKeinGratis = [];
        delete Z.einstellungen.geminiSucheOk;
        speichern();
      }
      if (k === "geminiSchluessel" && wert && !Z.einstellungen.geminiModell) $("#modelle-laden").click();
      if (k === "anbieter") { Z.einstellungen.anbieterManuell = true; speichern(); anbieterZeigen(); heuteZeigen(); if (wert === "lokal") lokalStatusPruefen(false); }
    });
  });
  $("#e-weckwort").onchange = function () {
    if (this.checked && !Stimme.verfuegbar()) { this.checked = false; return toast("Dieser Browser kann nicht zuhören."); }
    Z.einstellungen.weckwort = this.checked;
    speichern();
    Stimme.weckwort(this.checked);
    toast(this.checked ? "Sag „Hey " + Z.einstellungen.kiName + "“ und dann deine Frage." : "Freihändig aus.");
  };

  function lernenZeigen() {
    if (typeof lernDaten !== "function") return;
    var l = lernDaten(), ul = $("#lernregeln"), rb = $("#rueckblicke");
    ul.innerHTML = l.regeln.length ? "" : "<li class='leise'>Noch keine. Tipp bei Antworten auf 👍 oder 👎.</li>";
    l.regeln.slice().reverse().forEach(function (r) {
      var li = document.createElement("li");
      li.innerHTML = "<span>" + esc(r.text) + "</span><span class='leise klein-text'>" + esc(r.quelle || "") + "</span><button class='mini' title='Löschen'>✕</button>";
      li.querySelector("button").onclick = function () { l.regeln = l.regeln.filter(function (x) { return x !== r; }); speichern(); lernenZeigen(); };
      ul.appendChild(li);
    });
    rb.innerHTML = l.rueckblicke.length ? "" : "<li class='leise'>Noch keiner. A&T macht einmal am Tag automatisch einen Rückblick.</li>";
    l.rueckblicke.slice(-7).reverse().forEach(function (r) {
      var li = document.createElement("li");
      li.innerHTML = "<span class='wachsen'><strong>" + esc(r.datum.split("-").reverse().join(".")) + "</strong> " + esc(r.text) + "</span><button class='mini' title='Löschen'>✕</button>";
      li.querySelector("button").onclick = function () { l.rueckblicke = l.rueckblicke.filter(function (x) { return x !== r; }); speichern(); lernenZeigen(); };
      rb.appendChild(li);
    });
  }
  $("#jetzt-lernen").onclick = async function () {
    this.disabled = true; toast("Lerne aus den Gesprächen …");
    var r = await rueckblickMachen(true); this.disabled = false; toast(r.text); gedaechtnisZeigen();
  };
  function gedaechtnisZeigen() {
    lernenZeigen();
    var ul = $("#gedaechtnis");
    ul.innerHTML = "";
    if (!Z.gedaechtnis.length) ul.innerHTML = "<li class='leise'>Noch nichts gespeichert.</li>";
    Z.gedaechtnis.forEach(function (g) {
      var li = document.createElement("li");
      li.innerHTML = "<span>" + esc(g.text) + "</span><span class='leise klein-text'>" + esc(g.datum.split("-").reverse().join(".")) + "</span><button class='mini' title='Vergessen'>✕</button>";
      li.querySelector("button").onclick = function () { Z.gedaechtnis = Z.gedaechtnis.filter(function (x) { return x !== g; }); speichern(); gedaechtnisZeigen(); };
      ul.appendChild(li);
    });
  }
  $("#merken-form").onsubmit = function (ev) {
    ev.preventDefault();
    toast(merken($("#merken-text").value));
    $("#merken-text").value = "";
    gedaechtnisZeigen();
  };

  $("#export").onclick = function () {
    var kopie = JSON.parse(JSON.stringify(Z));
    var mitSchluesseln = $("#export-schluessel") && $("#export-schluessel").checked;
    if (!mitSchluesseln) { // Standard: Schlüssel nie in die Datei
      kopie.einstellungen.schluessel = "";
      kopie.einstellungen.geminiSchluessel = "";
      kopie.einstellungen.besitzer = false;
      if (kopie.depot) kopie.depot.finnhubSchluessel = "";
    } else if (!confirm("Die Datei enthält dann deine Schlüssel und die Besitzer-Freischaltung. Bewahre sie nur für dich auf (z. B. in deinem eigenen Google Drive) und schick sie niemandem. Weiter?")) return;
    var blob = new Blob([JSON.stringify(kopie, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "aundt-sicherung-" + heuteISO() + ".json";
    a.click();
    Z.einstellungen.letzteSicherung = heuteISO(); speichern();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  };
  function sicherungLaden(f, danach) {
    if (!f) return;
    f.text().then(function (t) {
      var d = JSON.parse(t);
      if (!d || !d.einstellungen) throw new Error("keine Sicherung");
      var schluessel = Z.einstellungen.schluessel, gSchluessel = Z.einstellungen.geminiSchluessel, besitzerVorher = Z.einstellungen.besitzer;
      var leer = leererZustand();
      Object.keys(leer).forEach(function (k) { if (d[k] !== undefined) Z[k] = d[k]; });
      Z.einstellungen = Object.assign(leer.einstellungen, d.einstellungen);
      if (!Z.einstellungen.schluessel) Z.einstellungen.schluessel = schluessel;
      if (!Z.einstellungen.geminiSchluessel) Z.einstellungen.geminiSchluessel = gSchluessel;
      if (!Z.einstellungen.besitzer && besitzerVorher) Z.einstellungen.besitzer = true;
      Z.einstellungen.eingerichtet = true;
      speichern();
      if (danach) danach();
      alles();
      toast("Sicherung geladen. Willkommen zurück!");
    }).catch(function () { toast("Diese Datei ist keine gültige Sicherung."); });
  }
  $("#import").onchange = function () { sicherungLaden(this.files[0]); this.value = ""; };
  $("#ein-import").onchange = function () {
    sicherungLaden(this.files[0], function () {
      $("#einrichtung").classList.add("versteckt");
      document.body.classList.remove("gesperrt");
      zeigeTab("heute");
    });
    this.value = "";
  };
  $("#loeschen").onclick = function () {
    if (!confirm("Wirklich alles löschen? Gespräche, Gedächtnis, Aufgaben, Buchungen und Schlüssel sind dann weg.")) return;
    Stimme.weckwort(false);
    var leer = leererZustand();
    Object.keys(leer).forEach(function (k) { Z[k] = leer[k]; });
    speichern();
    alles();
    toast("Alles gelöscht.");
  };

  /* ---------- Start ---------- */
  function alles() {
    namenSetzen();
    $("#websuche").checked = Z.einstellungen.websuche !== false;
    $("#vorlesen").checked = !!Z.einstellungen.vorlesen;
    $("#tiefe").value = Z.einstellungen.tiefe || "medium";
    var c = aktiverChat(false);
    $("#modus").value = (c && c.modus) || "stratege";
    modusInfo();
    chatWahlFuellen();
    heuteZeigen();
    einstellungenZeigen();
    geldZeigen();
  }

  // Links in Antworten öffnen in einem neuen Fenster.
  if (window.DOMPurify && DOMPurify.addHook) {
    DOMPurify.addHook("afterSanitizeAttributes", function (node) {
      if (node.tagName === "A") { node.setAttribute("target", "_blank"); node.setAttribute("rel", "noopener noreferrer"); }
    });
  }
  $("#einrichtung-neu").onclick = function () { Einrichtung.start(function () { alles(); zeigeTab("heute"); }); };

  // Besitzer-Modus: Depot, Halal-Trader und Überweisungen nur für den Besitzer.
  function besitzerAnzeigen() {
    var an = istBesitzer();
    $("#tabs button[data-tab=depot]").classList.toggle("versteckt", !an);
    $("#tab-depot").classList.toggle("versteckt-immer", !an);
    $("#besitzer-aus").classList.toggle("versteckt", !an);
    if (an) $("#besitzer-form").classList.add("versteckt");
    $("#app-version").textContent = "A&T Version " + APP_VERSION + (an ? " · Besitzer-Modus" : "");
    var gewaehlt = $("#modus").value;
    modusFuellen();
    $("#modus").value = MODI[gewaehlt] && (!MODI[gewaehlt].besitzer || an) ? gewaehlt : "stratege";
    modusInfo();
  }
  var versionKlicks = 0;
  $("#app-version").onclick = function () {
    if (istBesitzer()) return;
    if (++versionKlicks >= 5) { $("#besitzer-form").classList.remove("versteckt"); $("#besitzer-code").focus(); }
  };
  $("#besitzer-form").onsubmit = function (ev) {
    ev.preventDefault();
    if (besitzerCodePruefen($("#besitzer-code").value)) {
      Z.einstellungen.besitzer = true;
      speichern();
      $("#besitzer-code").value = "";
      besitzerAnzeigen();
      toast("Besitzer-Modus an: Depot und Überweisungen sind freigeschaltet.");
      startlisteAutomatisch(function (r) { toast("Halal-Liste ergänzt: " + r.neu.length.toLocaleString("de-CH") + " Aktien aus der weltweiten Halal-Liste übernommen."); });
    } else {
      var eingabe = $("#besitzer-code").value.trim();
      toast(/^AT/i.test(eingabe) ? "Besitzer-Code falsch. Er beginnt mit AT und hat 3 Vierergruppen, z. B. AT-XXXX-XXXX-XXXX." :
        "Das ist nicht der Besitzer-Code (er beginnt mit AT-). Der Finnhub-Schlüssel kommt nicht hierhin: Erst freischalten, dann im Depot unter „Einstellungen“ eintragen.");
    }
  };
  $("#besitzer-aus").onclick = function () {
    Z.einstellungen.besitzer = false;
    speichern();
    versionKlicks = 0;
    besitzerAnzeigen();
    geldZeigen();
    toast("Besitzer-Modus aus. Deine Depot-Daten bleiben gespeichert.");
  };

  vorbilderZeigen();
  Depot.verbinden();
  besitzerAnzeigen();
  alles();
  $("#b-art").onchange.call($("#b-art"));
  Neuigkeiten.beimStart();
  startlisteAutomatisch(function (r) { toast("Halal-Liste ergänzt: " + r.neu.length.toLocaleString("de-CH") + " Aktien aus der weltweiten Halal-Liste übernommen."); });
  if (!Z.einstellungen.eingerichtet) Einrichtung.start(function () { alles(); zeigeTab("heute"); });
  // Erinnerung an eine Sicherung: höchstens einmal pro Tag, wenn die letzte älter als 14 Tage ist.
  else (function () {
    var e = Z.einstellungen, heute = heuteISO();
    var alt = !e.letzteSicherung || (new Date(heute) - new Date(e.letzteSicherung)) > 14 * 86400000;
    if (!alt || e.sicherungErinnert === heute) return;
    e.sicherungErinnert = heute; speichern();
    setTimeout(function () { toast("Tipp: Mach unter „Ich“ eine Sicherung mit Schlüsseln. Dann bist du nach einem Datenverlust in 10 Sekunden zurück."); }, 2500);
  })();
  $("#neu-zeigen").onclick = Neuigkeiten.zeigen;
  $("#update-link").href = DOWNLOAD_URL;
  Neuigkeiten.updatePruefen(false).then(function (v) {
    if (!v) return;
    $("#update-version").textContent = v;
    $("#hinweis-update").classList.remove("versteckt");
  });
  // Läuft eine lokale KI (Ollama) und hat man nichts anderes gewählt, wird sie automatisch genutzt.
  lokalStatusPruefen(true).then(function (p) {
    if (p.ok && p.modelle.length && Z.einstellungen.anbieter !== "lokal" && !Z.einstellungen.anbieterManuell) {
      Z.einstellungen.anbieter = "lokal";
      speichern();
      alles();
      toast("Lokale KI gefunden: A&T läuft jetzt unbegrenzt und kostenlos auf deinem PC.");
    }
  });
  // Auf einer Internet-Adresse (z. B. GitHub Pages) als App installierbar und schneller beim Start.
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && location.hostname !== "localhost") {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
  if (Z.einstellungen.weckwort) Stimme.weckwort(true);
  if (typeof Akhi !== "undefined") Akhi.verbinden();
  // Einmal am Tag im Hintergrund aus den Gesprächen lernen
  setTimeout(function () { if (typeof lernenAutomatisch === "function") lernenAutomatisch(function (t) { toast(t); }); }, 6000);
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(function (ja) { if (!ja) navigator.storage.persist(); }); } catch (e) {}
  var start = "heute";
  try { start = sessionStorage.getItem("aundt-tab") || "heute"; } catch (e) {}
  zeigeTab(start);
  // KI-Bibliothek schon im Hintergrund laden, damit die erste Antwort schneller kommt.
  if (Z.einstellungen.anbieter === "claude" && Z.einstellungen.schluessel) sdkLaden().catch(function () {});
})();
