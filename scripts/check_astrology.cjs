const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=process.argv[2]||process.cwd();
const data=JSON.parse(fs.readFileSync(root+'/assets/data/astrology.json'));
class Element {
 constructor(tag='div'){this.tag=tag;this.children=[];this.handlers={};this.value='';this.textContent='';}
 append(...els){this.children.push(...els)}
 replaceChildren(...els){this.children=els}
 addEventListener(name,fn){this.handlers[name]=fn}
 setAttribute(){} focus(){} scrollIntoView(){} getContext(){return null}
 querySelector(tag){return this.children.find(e=>e.tag===tag)}
}
const els=new Map();const get=id=>{if(!els.has(id))els.set(id,new Element());return els.get(id)};
const document={getElementById:get,createElement:t=>new Element(t),addEventListener(){}};
const ctx={document,window:{addEventListener(){}},location:{hash:''},fetch:async()=>({ok:true,json:async()=>data}),setInterval(){},matchMedia:()=>({matches:true}),URLSearchParams,console,Date};
const text=e=>e.textContent+' '+e.children.map(text).join(' ');
(async()=>{
 vm.runInNewContext(fs.readFileSync(root+'/assets/js/star-day.js','utf8'),ctx);
 await new Promise(r=>setImmediate(r));
 assert.equal(get('star-submit').textContent,'Reveal my Star Day');
 assert.equal(Object.keys(data.calendar).length,366);assert.equal(Object.keys(data.daily).length,366);
 const submit=()=>get('star-form').handlers.submit({preventDefault(){}});
 for(const [date,row] of Object.entries(data.calendar)){
  const [m,d]=date.split('-');get('birth-month').value=m;get('birth-day').value=d;
  for(const time of ['', '00:00','03:59','04:00','08:00','12:00','16:00','20:00','23:59']){
   get('birth-time').value=time;submit();assert.equal(get('star-result').hidden,false);assert(!text(get('star-result')).includes('undefined'));
   if(!time)assert(text(get('star-result')).includes('Provisional noon reading'));
  }
  assert(data.daily[row.day].some(s=>s.title==='Sacred Question'));
 }
 for(const date of ['02-30','04-31']){const[m,d]=date.split('-');get('birth-month').value=m;get('birth-day').value=d;submit();assert.equal(get('star-result').hidden,true)}
 assert.equal(data.calendar['02-29'].day,'59.5');assert.equal(data.calendar['03-01'].day,'60');
 for(const day of ['27','28','29','30']){assert.equal(data.calendar['12-'+day].moon,'New Moon');assert(data.calendar['12-'+day].house.startsWith('The Void Temple'))}
 assert.equal(data.calendar['12-31'].moon,'Waxing Crescent');assert.equal(data.calendar['01-01'].moon,'New Moon');
 const dates=[...new Map(Object.entries(data.calendar).map(([d,r])=>[r.sign,d])).values()];let pairs=0;
 for(let a=0;a<dates.length;a++)for(let b=a;b<dates.length;b++){
  for(const [i,date] of [dates[a],dates[b]].entries()){const[m,d]=date.split('-');get('pair-month-'+(i+1)).value=m;get('pair-day-'+(i+1)).value=d}
  get('compatibility-form').handlers.submit({preventDefault(){}});assert.equal(get('pair-result').hidden,false);assert(!text(get('pair-result')).includes('undefined'));pairs++;
 }
 const norm=s=>s.toLowerCase().replace(/^the /,'');
 const lunar=new Set(data.moonCompatibility.combinations.map(c=>c.phases.map(norm).sort().join('|')));
 const phases=data.moon.moon_phases_section.phases.map(p=>p.name.replace(' BORN',''));
 for(let a=0;a<8;a++)for(let b=a;b<8;b++)assert(lunar.has([phases[a],phases[b]].map(norm).sort().join('|')));
 assert.equal(pairs,78);assert.equal(lunar.size,36);
 console.log('PASS: 366 birthdays × 9 time cases; invalid dates; leap day and year-end stations; 78 relationship results; 36 lunar pairings; daily rendering.');
})().catch(e=>{console.error(e);process.exitCode=1});
