(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const clean = text => String(text).replace(/\*\*/g, '').replace(/(?<!\w)\*|\*(?!\w)/g, '').replace(/\\'/g, "'");
  const normalized = text => clean(text).toLowerCase().replace(/^the /, '');
  const node = (tag, text, cls) => { const el = document.createElement(tag); if (text) el.textContent = clean(text); if (cls) el.className = cls; return el; };
  const paragraph = (parent, text) => { if (text) parent.append(node('p', text)); };
  const block = (parent, title, text) => { if (!text) return; parent.append(node('h4', title)); if (Array.isArray(text)) { const ul = node('ul'); text.forEach(t => ul.append(node('li', t))); parent.append(ul); } else paragraph(parent, text); };
  const section = (parent, title, open = false) => { const details = node('details'); details.open = open; details.append(node('summary', title)); const body = node('div', '', 'star-copy'); details.append(body); parent.append(details); return body; };
  const key = (month, day) => `${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  let data, todayKey;
  function renderDaily(parent, entry, expanded) {
    parent.replaceChildren();
    entry.forEach((s, i) => {
      if (s.title === 'Sacred Question') { const q = node('blockquote', s.text, 'star-question'); parent.append(q); }
      else paragraph(section(parent, s.title, expanded && i === 0), s.text);
    });
  }
  function today() {
    const date = new Date(), dateKey = key(date.getMonth()+1,date.getDate());
    if (dateKey === todayKey) return;
    todayKey = dateKey;
    const row = data.calendar[dateKey];
    $('today-date').textContent = `${date.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})} · ${row.sign} · ${row.moon}`;
    renderDaily($('today-reading'), data.daily[row.day], true);
  }
  function risingFor(sign, time) {
    if (!time) return [];
    const [h,m] = time.split(':').map(Number), index = Math.floor(h/4);
    const regions = data.rising.rising_sign_system.regional_modifiers.regions;
    const table = data.rising.rising_sign_system.regional_shift_table;
    const row = table.rows.find(r => normalized(r.Constellation) === normalized(sign));
    const indices = h%4 === 0 && m === 0 ? [(index+5)%6,index] : [index];
    return indices.map(i => ({region:regions[i].name, sign:clean(row[table.headers[i+1]])}));
  }
  $('star-form').addEventListener('submit', event => {
    event.preventDefault();
    const row = data.calendar[key($('birth-month').value,$('birth-day').value)];
    if (!row) { $('star-status').textContent = 'That date isn’t in the calendar. Please check the month and day.'; $('star-result').hidden = true; return; }
    $('star-status').textContent = '';
    const result = $('star-result'); result.replaceChildren(); result.hidden = false;
    const sign = data.signs.find(s => normalized(s.name) === normalized(row.sign));
    const rising = risingFor(row.sign,$('birth-time').value);
    const moonName = row.moon.replace(' (Temporal Anomaly)','');
    const moon = data.moon.moon_phases_section.phases.find(p => normalized(p.name.replace(' BORN','')) === normalized(moonName));
    const house = data.rising.house_system.houses.find(h => h.name === row.house.replace(' (Extended)',''));
    const summary = node('div','','star-summary'); summary.append(node('p','Your Star Day','home-eyebrow'),node('h3',row.sign));
    paragraph(summary, `${row.month} · Day ${row.reignDay} · ${sign.element}`);
    const facts = node('dl','','star-facts');
    [['Constellation',(data.timeline.find(t => normalized(t.name) === normalized(sign.name)) || sign).status],['Moon',row.moon],['House',row.house],['Rising',rising.length ? rising.map(r => r.sign).join(' / ') : 'Birth time unknown']].forEach(([label,value]) => { const div = node('div');div.append(node('dt',label),node('dd',value));facts.append(div); });
    summary.append(facts);result.append(summary);
    if (row.day === '59.5') paragraph(result,'February 29 is the calendar’s separate leap day: Arcadian Day 59.5, under the Lovers and the Dark Moon. The rest of the year keeps its usual dates.');
    let body = section(result,'01 · Your constellation',true);
    paragraph(body,sign.core_reading);
    block(body,'Your strengths',sign.strengths);block(body,'Your shadows',sign.shadows);block(body,'In love',sign.in_love);block(body,'Destiny & calling',sign.destiny_and_calling);
    body = section(result,'02 · Your inner self — '+moonName);
    paragraph(body,moon.description);
    block(body,'Your constellation & moon together',data.moon.sacred_combinations_section.constellations[sign.name][moonName]);
    body = section(result,'03 · Your house — '+row.house);
    block(body,'What this house governs',house.domain);
    body.append(node('h4','Your house’s sacred question'),node('blockquote',house.sacred_question,'star-question'));
    const houseReading = data.rising.constellation_in_houses.constellations.find(c => c.name === sign.name).houses.find(h => h.house === house.number);
    block(body,sign.name.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())+' in '+house.name,houseReading.interpretation);
    body = section(result,'04 · Your rising sign');
    if (!rising.length) paragraph(body,'Your rising sign depends on your birth time. You can explore the rest of your reading without it, and add a time above whenever you know it.');
    else {
      if (rising.length > 1) paragraph(body,'You were born exactly at a turning between two regions. In the Almanac, you may claim either adjoining sky. Both are shown here for you to explore.');
      rising.forEach(r => { const reading = data.rising.rising_sign_system.rising_sign_meanings.signs.find(s => normalized(s.sign.replace(' Rising','')) === normalized(r.sign)); block(body,r.sign+' Rising · '+r.region,reading.description);paragraph(body,reading.quote); });
    }
    body = section(result,'05 · The Almanac reading for your birthday');renderDaily(body,data.daily[row.day],true);
    shareCard(result,row.sign,moonName+' · '+house.name,sign.strengths[0],'my-arcadian-star-day', {s:sign.name,m:moonName,h:house.name});
    result.focus({preventScroll:true});result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  });
  const pairKey = values => values.map(normalized).sort().join('|');
  const titleCase = text => text.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
  function shareCard(parent, title, subtitle, excerpt, filename, identity) {
    const card = node('div','','star-share');
    const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1350;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(0,0,1080,1350);gradient.addColorStop(0,'#382744');gradient.addColorStop(1,'#101016');ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,1350);
    for (let i=0;i<65;i++) { ctx.fillStyle=i%3?'#8d779e':'#eee0fa';ctx.beginPath();ctx.arc(45+(i*173)%990,45+(i*257)%1250,i%3?1:2,0,Math.PI*2);ctx.fill(); }
    ctx.strokeStyle='#9278a0';ctx.lineWidth=2;ctx.strokeRect(38,38,1004,1274);
    ctx.beginPath();ctx.arc(540,207,78,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(540,207,55,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#e2cafa';ctx.textAlign='center';ctx.font='28px Arial';ctx.fillText('THE ALMANAC OF STARS',540,345);
    function lines(text, size, maxWidth) {
      ctx.font=`${size}px Georgia`;const result=[];let line='';
      for(const word of clean(text).split(/\s+/)){const next=line?line+' '+word:word;if(ctx.measureText(next).width>maxWidth&&line){result.push(line);line=word;}else line=next;}
      if(line) result.push(line);return result;
    }
    let size=68, heading=lines(title,size,880);while(heading.length>3&&size>38) heading=lines(title,--size,880);
    ctx.fillStyle='#faf2ff';ctx.font=`${size}px Georgia`;let y=445;heading.forEach(line=>{ctx.fillText(line,540,y);y+=size*1.18;});
    y+=24;ctx.fillStyle='#d3bce4';lines(subtitle,30,850).forEach(line=>{ctx.fillText(line,540,y);y+=42;});
    y+=40;ctx.beginPath();ctx.moveTo(160,y);ctx.lineTo(920,y);ctx.stroke();y+=65;
    size=36;let quote=lines(excerpt,size,820);while(quote.length*size*1.45>1120-y&&size>23) quote=lines(excerpt,--size,820);
    ctx.fillStyle='#f0e8f6';ctx.font=`${size}px Georgia`;quote.forEach(line=>{ctx.fillText(line,540,y);y+=size*1.45;});
    ctx.fillStyle='#c5afd5';ctx.font='25px Arial';ctx.fillText('ARCADIAN ASTROLOGY · MILEENA RAYNE',540,1210);ctx.font='24px Arial';ctx.fillText('mileenarayne.com/astrology',540,1250);
    const image = node('img');image.src=canvas.toDataURL('image/png');image.alt=`Share card: ${title}. ${subtitle}. ${clean(excerpt)}`;image.width=1080;image.height=1350;
    const controls=node('div');controls.append(node('h4','Share your stars'));paragraph(controls,'Share a link to this reading. Only your signs and reading are included—not the dates or times you entered.');
    const url='https://mileenarayne.com/astrology/#reading?'+new URLSearchParams(identity).toString();
    const actions=node('div','','home-actions'),share=node('button','Share reading','home-button'),copy=node('button','Copy link','home-button'),status=node('p','','star-share-status');status.setAttribute('role','status');share.type=copy.type='button';
    const copyLink=async()=>{try{await navigator.clipboard.writeText(url);status.textContent='Reading link copied.';}catch{status.replaceChildren(node('span','Copy this link: '));const field=node('input');field.type='text';field.readOnly=true;field.value=url;field.setAttribute('aria-label','Reading link');status.append(field);field.focus();field.select();}};
    copy.addEventListener('click',copyLink);
    share.addEventListener('click',async()=>{if(!navigator.share){await copyLink();return;}try{await navigator.share({title:'Arcadian Astrology',text:clean(title+' — '+subtitle),url});}catch(error){if(error.name!=='AbortError') await copyLink();}});
    actions.append(share,copy);controls.append(actions,status);card.append(image,controls);parent.append(card);
  }
  function sharedReading() {
    const host=$('shared-reading');host.hidden=true;host.replaceChildren();
    if(!location.hash.startsWith('#reading?'))return;
    const params=new URLSearchParams(location.hash.slice(9));
    const sign=data.signs.find(s=>normalized(s.name)===normalized(params.get('s')));
    const moon=params.get('m');
    if(!sign || !Object.hasOwn(data.moon.sacred_combinations_section.constellations[sign.name],moon))return;
    host.hidden=false;host.append(node('p','A shared reading','home-eyebrow'),node('h2',titleCase(sign.name)));
    if(params.has('b')) {
      const other=data.signs.find(s=>normalized(s.name)===normalized(params.get('b')));
      const lunar=data.moonCompatibility.combinations.find(p=>pairKey(p.phases)===pairKey([moon,params.get('n')]));
      if(!other||!lunar){host.hidden=true;return;}
      host.querySelector('h2').textContent=titleCase(sign.name)+' & '+titleCase(other.name);
      const group=data.compatibility.compatibility_levels.find(g=>g.pairs.some(p=>pairKey(p.constellations)===pairKey([sign.name,other.name])));
      const pair=group.pairs.find(p=>pairKey(p.constellations)===pairKey([sign.name,other.name]));
      block(host,group.title,pair.description);block(host,lunar.title+' · '+moon+' & '+params.get('n'),lunar.description);
    } else {
      block(host,'Your constellation',sign.core_reading);block(host,'Your strengths',sign.strengths);block(host,'Your shadows',sign.shadows);block(host,'In love',sign.in_love);block(host,'Destiny & calling',sign.destiny_and_calling);
      block(host,'Your constellation & moon · '+moon,data.moon.sacred_combinations_section.constellations[sign.name][moon]);
      const house=data.rising.constellation_in_houses.constellations.find(c=>c.name===sign.name).houses.find(h=>h.title===params.get('h'));
      if(house)block(host,house.title,house.interpretation);
    }
    const link=node('a','Find your own Star Day','home-button');link.href='#find';host.append(link);host.scrollIntoView({block:'start'});
  }

  function compatibility() {
    $('compatibility-form').addEventListener('submit',event=>{
      event.preventDefault();
      const rows=[1,2].map(i=>data.calendar[key($('pair-month-'+i).value,$('pair-day-'+i).value)]);
      if(rows.some(row=>!row)){$('pair-status').textContent='Please check both birthdays. One of those dates isn’t in the calendar.';$('pair-result').hidden=true;return;}
      $('pair-status').textContent='';
      const wanted=pairKey(rows.map(r=>r.sign));let match,level;
      for(const group of data.compatibility.compatibility_levels){const found=group.pairs.find(p=>pairKey(p.constellations)===wanted);if(found){match=found;level=group;break;}}
      const moonNames=rows.map(r=>r.moon.replace(' (Temporal Anomaly)',''));
      const lunar=data.moonCompatibility.combinations.find(p=>pairKey(p.phases)===pairKey(moonNames));
      const result=$('pair-result');result.hidden=false;result.replaceChildren();
      const heading=rows.map(r=>r.sign).join(' & '), summary=node('div','','star-summary');summary.append(node('p','Your shared sky','home-eyebrow'),node('h3',heading));paragraph(summary,level.title);result.append(summary);
      let body=section(result,'Your constellations · '+level.title,true);paragraph(body,match.description);
      body=section(result,'Your moons · '+lunar.title,true);paragraph(body,moonNames.join(' & '));paragraph(body,lunar.description);
      body=section(result,'Reading your connection');paragraph(body,data.compatibility.conclusion.text);
      shareCard(result,heading,level.title,match.description.match(/^.*?[.!?](?:\s|$)/s)[0].trim(),'arcadian-compatibility', {s:rows[0].sign,m:moonNames[0],b:rows[1].sign,n:moonNames[1]});
      result.focus({preventScroll:true});result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    });
    $('pair-submit').disabled=false;$('pair-submit').textContent='Explore our connection';
  }
  function explorer() {
    const names=[...new Set(Object.values(data.calendar).map(r=>r.sign))];
    for(const name of names){const sign=data.signs.find(s=>normalized(s.name)===normalized(name));const article=node('article');article.append(node('p',sign.association+' · '+(data.timeline.find(t => normalized(t.name) === normalized(sign.name)) || sign).status,'home-eyebrow'),node('h3',name));paragraph(article,sign.element);const body=section(article,'Explore '+name);const timeline=data.timeline.find(t=>normalized(t.name)===normalized(name));if(timeline){block(body,'In the story timeline',timeline.era);paragraph(body,timeline.event);const link=node('a',timeline.book);link.href=timeline.url;body.append(link);paragraph(body,timeline.connection);}paragraph(body,sign.core_reading);block(body,'Your strengths',sign.strengths);block(body,'Your shadows',sign.shadows);block(body,'The prophecy',sign.prophecy);$('constellation-grid').append(article);}
  }

  fetch('/assets/data/astrology.json').then(response => { if (!response.ok) throw new Error('Readings unavailable');return response.json(); }).then(d => {
    data = d;compatibility();explorer();sharedReading();window.addEventListener('hashchange',sharedReading);$('star-submit').disabled = false;$('star-submit').textContent = 'Reveal my Star Day';today();setInterval(today,30000);document.addEventListener('visibilitychange',() => { if (!document.hidden) today(); });
  }).catch(() => { $('star-status').textContent = 'The readings couldn’t load. Please refresh the page to try again.';$('today-reading').textContent = 'Today’s reading couldn’t load. Please refresh to try again.';$('star-submit').textContent = 'Readings unavailable';$('pair-submit').textContent = 'Readings unavailable';$('pair-status').textContent = 'The readings couldn’t load. Please refresh to try again.'; });
})();
