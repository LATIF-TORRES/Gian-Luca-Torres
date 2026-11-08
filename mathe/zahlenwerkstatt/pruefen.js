const fs=require('fs'), vm=require('vm');
// Prüft alle Aufgaben-Generatoren. Aufruf: node pruefen.js
const D=require('path').join(__dirname,'js')+'/';
const ctx={window:{}, document:{addEventListener(){}}, localStorage:null, Math, console, Number, Set, Array, Object, String, JSON, Error, isNaN, parseFloat};
ctx.window=ctx; vm.createContext(ctx);
for(const f of ['util.js','aufgaben.js']) vm.runInContext(fs.readFileSync(D+f,'utf8'),ctx);
const ZW=ctx.ZW; let bad=0; const err=m=>{bad++; if(bad<30) console.log('FEHLER',m)};
// Zahlwörter
const w={1:'eins',21:'einundzwanzig',30:'dreissig',101:'einhunderteins',1000:'eintausend',4307:'viertausenddreihundertsieben',21000:'einundzwanzigtausend',101001:'einhunderteintausendeins',999999:'neunhundertneunundneunzigtausendneunhundertneunundneunzig',1000000:'eine Million'};
for(const [n,s] of Object.entries(w)) if(ZW.zahlwort(+n)!==s) err(`zahlwort ${n} ${ZW.zahlwort(+n)}`);
if(ZW.fmt(1000000)!=="1'000'000"||ZW.fmt(2.75)!=='2.75'||ZW.fr(140050)!=="Fr. 1'400.50") err('fmt');
const raum={3:1000,4:100000,5:1000000};
const evalText=t=>{ // rechnet einfache Texte nach
  const m=t.text.replace(/'/g,'').match(/^([\d.]+) ([+−×:]) ([\d.]+)$/); if(!m) return null;
  const a=+m[1],b=+m[3]; return {'+':a+b,'−':a-b,'×':a*b,':':a/b}[m[2]];
};
for(const k of [3,4,5]) for(const s of [1,2,3]){
  for(let i=0;i<3000;i++){
    const t=ZW.rechenAufgabe(k,s);
    if(!(t.answer>0)) err(`antwort<=0 ${k}/${s} ${t.text}`);
    if(t.answer>raum[k]) err(`zu gross ${k}/${s} ${t.text}=${t.answer}`);
    const e=evalText(t); if(e!=null && Math.abs(e-t.answer)>1e-9) err(`falsch ${t.text} ${t.answer}`);
    if(e!=null && t.text.includes(':') && !Number.isInteger(t.answer)) err('div rest '+t.text);
    if(k<5 && !Number.isInteger(t.answer)) err('dezimal in '+k+' '+t.text);
  }
  for(let i=0;i<300;i++){ const c=ZW.strahlConfig(k,s), z=ZW.strahlZiel(c); if(z<=c.min||z>=c.max||(z-c.min)%c.schritt) err(`strahl ${k}/${s}`);}
  for(let i=0;i<500;i++){ const a=ZW.stellenAufgabe(k,s); if(a.zahl>=10**ZW.stellenAnzahl(k,s)) err('stellen gross');
    if(a.art==='buendeln'){ const v=a.teile.reduce((x,z,j)=>x+z*ZW.STELLEN[j].w,0); if(v!==a.zahl||!a.teile.some(z=>z>9)||a.teile.some(z=>z<0)) err('buendeln '+a.text+' '+a.zahl);} }
  for(let i=0;i<300;i++){ const {rows,versteckt}=ZW.mauerAufgabe(k,s); if(!ZW.mauerLoesbar(rows,versteckt)) err('mauer unlösbar');
    if(rows[rows.length-1][0]>raum[k]) err(`mauer gross ${k}/${s} ${rows[rows.length-1][0]}`);
    for(let r=1;r<rows.length;r++) rows[r].forEach((v,j)=>{ if(v!==rows[r-1][j]+rows[r-1][j+1]) err('mauer summe');}); }
  for(let i=0;i<300;i++){ const r=ZW.jagdRunde(k,s); if(r.zahlen.length!==16||new Set(r.zahlen).size!==16) err('jagd 16'); if(r.richtig.size<4) err('jagd wenig');}
  for(let i=0;i<300;i++){ const r=ZW.ladenRunde(k,s,i%6); if(r.summe%5) err('5 Rp'); if(r.modus==='rueckgeld'&&!(r.answer>0)) err('rueckgeld '+JSON.stringify(r)); r.waren.forEach(w=>{if(!w.akk) err('akk')}); }
  for(let i=0;i<200;i++){ const p=ZW.memoryPaare(k,s); if(p.length!==(s===3?8:6)) err(`memory ${k}/${s} ${p.length}`);}
}
console.log(bad?`${bad} Fehler`:'Alles in Ordnung');
process.exitCode = bad ? 1 : 0;
