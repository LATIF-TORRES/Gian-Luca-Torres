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
    toast._t = setTimeout(function () { el.classList.remove("sichtbar"); }, 2600);
  }
  function kern(zustand, text) {
    $("#kern").className = "kern " + (zustand || "");
    $("#marke-sub").textContent = text || "Bereit";
  }

  /* ---------- Tabs ---------- */
  function zeigeTab(name) {
    document.querySelectorAll(".tab").forEach(function (t) { t.classList.toggle("aktiv", t.id === "tab-" + name); });
    document.querySelectorAll("#tabs button").forEach(function (b) { b.classList.toggle("aktiv", b.dataset.tab === name); });
    try { sessionStorage.setItem("torres-tab", name); } catch (e) {}
    if (name === "heute") heuteZeigen();
    if (name === "geld") geldZeigen();
    if (name === "chat") { verlaufZeigen(); setTimeout(function () { $("#frage").focus(); }, 50); }
    if (name === "einstellungen") einstellungenZeigen();
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
    var n = Z.einstellungen.kiName || "TORRES";
    $("#marke-name").textContent = n;
    document.querySelectorAll(".ki-name").forEach(function (el) { el.textContent = n; });
    document.title = n + " · Dein KI-System für Geld und Erfolg";
    $("#frage").placeholder = "Frag " + n + " …";
  }

  /* ---------- Heute ---------- */
  function heuteZeigen() {
    var e = Z.einstellungen;
    var h = new Date().getHours();
    var gruss = h < 11 ? "Guten Morgen" : h < 18 ? "Hallo" : "Guten Abend";
    $("#gruss").textContent = gruss + (e.name ? ", " + e.name : "");
    $("#datum").textContent = new Date().toLocaleDateString("de-CH", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    $("#hinweis-schluessel").classList.toggle("versteckt", !!e.schluessel);

    var m = monatsZahlen();
    if (e.ziel > 0) {
      var anteil = Math.min(1, m.ein / e.ziel);
      $("#ziel-text").textContent = geld(m.ein) + " von " + geld(e.ziel);
      $("#ziel-balken").style.width = Math.round(anteil * 100) + "%";
      var jetzt = new Date();
      var tageImMonat = new Date(jetzt.getFullYear(), jetzt.getMonth() + 1, 0).getDate();
      var resttage = tageImMonat - jetzt.getDate() + 1;
      var fehlt = Math.max(0, e.ziel - m.ein);
      $("#ziel-detail").textContent = fehlt > 0
        ? "Es fehlen " + geld(fehlt) + (resttage > 1 ? ". Das sind " + geld(fehlt / resttage) + " pro Tag für die restlichen " + resttage + " Tage." : ". Heute ist der letzte Tag des Monats.")
        : "Ziel erreicht. Zeit, das Ziel zu erhöhen.";
    } else {
      $("#ziel-text").textContent = geld(m.ein) + " diesen Monat";
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
    Object.keys(MODI).forEach(function (k) {
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
        system: grundauftrag(Z.einstellungen.kiName || "TORRES"), // bleibt für dieses Gespräch fest
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
      o.textContent = c.titel + " · " + c.datum.slice(5).split("-").reverse().join(".");
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
  function aktionText(name, input) {
    input = input || {};
    if (name === "merken") return "🧠 Gemerkt: " + (input.text || "");
    if (name === "aufgabe_anlegen") return "✅ Aufgabe: " + (input.text || "") + (input.wichtig ? " ★" : "");
    if (name === "buchung_eintragen") return "💰 " + (input.art === "aus" ? "Ausgabe " : "Einnahme ") + geld(input.betrag) + " · " + (input.quelle || "");
    return name;
  }

  function blaseHtml(b) {
    if (b.wer === "ich") return "<div class='blase ich'>" + esc(b.text).replace(/\n/g, "<br>") + "</div>";
    var html = "<div class='blase ki'>";
    if (b.aktionen && b.aktionen.length) html += "<div class='aktionen'>" + b.aktionen.map(function (a) { return "<span>" + esc(a) + "</span>"; }).join("") + "</div>";
    html += "<div class='md'>" + md(b.text) + "</div>";
    if (b.quellen && b.quellen.length) {
      html += "<details class='quellen'><summary>Quellen (" + b.quellen.length + ")</summary><ol>" +
        b.quellen.slice(0, 12).map(function (q) { return "<li><a href='" + esc(q.url) + "' target='_blank' rel='noopener'>" + esc(q.title) + "</a></li>"; }).join("") + "</ol></details>";
    }
    if (b.text) html += "<button class='mini vorlesen' title='Vorlesen'>🔊</button>";
    return html + "</div>";
  }

  function verlaufZeigen() {
    var c = aktiverChat(false);
    var v = $("#verlauf");
    var n = Z.einstellungen.kiName || "TORRES";
    if (!c || !c.nachrichten.length) {
      v.innerHTML = "<div class='leer'><div class='kern gross-kern'><span></span></div><p><strong>" + esc(n) + "</strong> ist bereit.</p>" +
        "<p class='leise'>Erzähl, was du kannst, wie viel Zeit du hast und wie viel du verdienen willst. Je mehr " + esc(n) + " weiss, desto besser passen die Ideen.</p></div>";
    } else {
      v.innerHTML = anzeigeAus(c.nachrichten).map(blaseHtml).join("");
    }
    v.querySelectorAll(".vorlesen").forEach(function (btn) {
      btn.onclick = function () { Stimme.vorlesen(btn.parentNode.querySelector(".md").innerText); };
    });
    $("#kosten").textContent = c && c.kosten ? "Gespräch ca. $" + c.kosten.toFixed(3) : "";
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
    if (!e.schluessel) {
      toast("Zuerst den API-Schlüssel eintragen.");
      zeigeTab("einstellungen");
      $("#e-schluessel").focus();
      return;
    }
    Stimme.stumm();
    var c = aktiverChat(true);
    if (!c.nachrichten.length) { c.titel = text.length > 40 ? text.slice(0, 40) + "…" : text; chatWahlFuellen(); }
    var modus = MODI[$("#modus").value] || MODI.stratege;
    var kontext = "<kontext>\n" + modus.auftrag + "\n" + kontextFuerKi() +
      (e.websuche ? "" : "\nNutze diesmal keine Web-Suche.") + "\n</kontext>";
    c.nachrichten.push({ role: "user", content: [{ type: "text", text: kontext }, { type: "text", text: text }] });
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
          live.querySelector(".md").innerHTML = md(gesamt);
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
      },
      fertig: function () {
        laeuft = null;
        aufraeumen();
        verlaufZeigen();
        heuteZeigen();
        if (Z.einstellungen.vorlesen && gesamt) Stimme.vorlesen(gesamt);
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
        if (letzte && letzte.role === "user" && letzte.content[1] && letzte.content[1].text === text) {
          c.nachrichten.pop();
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
      d.className = "karte vorbild";
      d.innerHTML = "<div class='vorbild-kopf'><div class='initialen'>" + esc(v.name.split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2)) + "</div>" +
        "<div><h3>" + esc(v.name) + "</h3><div class='leise klein-text'>" + esc(v.wer) + "</div></div></div>" +
        "<div class='prinzip'>" + esc(v.prinzip) + "</div><p>" + esc(v.text) + "</p>" +
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
      kachel("Bleibt übrig", geld(m.saldo) + (m.ein > 0 ? " · " + Math.round(m.quote * 100) + " %" : ""), m.saldo >= 0 ? "plus" : "minus");

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
      li.innerHTML = "<span class='leise'>" + esc(b.datum.split("-").reverse().join(".")) + "</span> <span>" + esc(b.quelle) + "</span>" +
        "<strong class='" + (b.art === "ein" ? "plus" : "minus") + "'>" + (b.art === "ein" ? "+" : "−") + geld(b.betrag) + "</strong><button class='mini' title='Löschen'>✕</button>";
      li.querySelector("button").onclick = function () { Z.buchungen = Z.buchungen.filter(function (x) { return x !== b; }); speichern(); geldZeigen(); };
      ul.appendChild(li);
    });
    rechnen();
  }
  function kachel(titel, wert, art) {
    return "<div class='karte kachel'><div class='leise klein-text'>" + esc(titel) + "</div><div class='gross " + art + "'>" + esc(wert) + "</div></div>";
  }
  $("#b-datum").value = heuteISO();
  $("#buchung-form").onsubmit = function (ev) {
    ev.preventDefault();
    toast(buchungEintragen($("#b-art").value, $("#b-betrag").value, $("#b-quelle").value, $("#b-datum").value));
    $("#b-betrag").value = "";
    $("#b-quelle").value = "";
    geldZeigen();
  };

  function zahl(id) { var n = parseFloat($(id).value); return isFinite(n) ? n : 0; }
  function rechnen() {
    // Zinseszins mit monatlicher Verzinsung
    var start = zahl("#z-start"), rate = zahl("#z-rate"), zins = zahl("#z-zins"), jahre = Math.max(0, Math.round(zahl("#z-jahre")));
    var r = zins / 100 / 12, n = jahre * 12;
    var end = r === 0 ? start + rate * n : start * Math.pow(1 + r, n) + rate * (Math.pow(1 + r, n) - 1) / r;
    var eingezahlt = start + rate * n;
    $("#z-ergebnis").innerHTML =
      "<div>Nach " + jahre + " Jahren: <strong class='gold-text'>" + geld(end) + "</strong></div>" +
      "<div class='leise'>Selbst eingezahlt: " + geld(eingezahlt) + " · Zinsen: " + geld(end - eingezahlt) + "</div>" +
      (zins > 0 ? "<div class='leise'>Regel der 72: Geld verdoppelt sich etwa alle " + (Math.round(72 / zins * 10) / 10) + " Jahre.</div>" : "") +
      "<div class='leise klein-text'>Beispielrechnung mit festem Zins. Echte Renditen schwanken, auch nach unten.</div>";

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
  var FELDER = { "#e-name": "name", "#e-ki-name": "kiName", "#e-waehrung": "waehrung", "#e-ziel": "ziel", "#e-warum": "warum", "#e-schluessel": "schluessel", "#e-modell": "modell", "#e-sprache": "sprache" };
  function einstellungenZeigen() {
    var e = Z.einstellungen;
    Object.keys(FELDER).forEach(function (s) { $(s).value = e[FELDER[s]] || ""; });
    $("#e-weckwort").checked = !!e.weckwort;
    gedaechtnisZeigen();
  }
  Object.keys(FELDER).forEach(function (s) {
    $(s).addEventListener("change", function () {
      var k = FELDER[s], wert = this.value.trim();
      if (k === "ziel") wert = Math.max(0, parseFloat(wert) || 0);
      if (k === "kiName") wert = wert || "TORRES";
      Z.einstellungen[k] = wert;
      speichern();
      namenSetzen();
      if (k === "schluessel" && wert) toast("Schlüssel gespeichert.");
    });
  });
  $("#e-weckwort").onchange = function () {
    if (this.checked && !Stimme.verfuegbar()) { this.checked = false; return toast("Dieser Browser kann nicht zuhören."); }
    Z.einstellungen.weckwort = this.checked;
    speichern();
    Stimme.weckwort(this.checked);
    toast(this.checked ? "Sag „Hey " + Z.einstellungen.kiName + "“ und dann deine Frage." : "Freihändig aus.");
  };

  function gedaechtnisZeigen() {
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
    kopie.einstellungen.schluessel = ""; // Schlüssel nie in die Datei
    var blob = new Blob([JSON.stringify(kopie, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "torres-sicherung-" + heuteISO() + ".json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  };
  $("#import").onchange = function () {
    var f = this.files[0];
    if (!f) return;
    f.text().then(function (t) {
      var d = JSON.parse(t);
      if (!d || !d.einstellungen) throw new Error("keine Sicherung");
      var schluessel = Z.einstellungen.schluessel;
      Object.keys(d).forEach(function (k) { Z[k] = d[k]; });
      if (!Z.einstellungen.schluessel) Z.einstellungen.schluessel = schluessel;
      speichern();
      alles();
      toast("Sicherung geladen.");
    }).catch(function () { toast("Diese Datei ist keine gültige Sicherung."); });
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

  modusFuellen();
  vorbilderZeigen();
  alles();
  if (Z.einstellungen.weckwort) Stimme.weckwort(true);
  var start = "heute";
  try { start = sessionStorage.getItem("torres-tab") || "heute"; } catch (e) {}
  zeigeTab(start);
  // KI-Bibliothek schon im Hintergrund laden, damit die erste Antwort schneller kommt.
  if (Z.einstellungen.schluessel) sdkLaden().catch(function () {});
})();
