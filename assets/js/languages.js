(() => {
  const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘]/g,"'").trim();
  document.querySelectorAll('[data-dictionary]').forEach(input => {
    const name=input.dataset.dictionary,container=document.querySelector(`[data-words="${name}"]`),status=document.getElementById(name+'-count');
    const entries=[...container.querySelectorAll('.word-entry')];
    const update=()=>{
      const query=normalize(input.value);let count=0;
      entries.forEach(entry=>{entry.hidden=!normalize(entry.textContent).includes(query);if(!entry.hidden) count++;});
      container.querySelectorAll('.letter-section').forEach(group=>{group.hidden=![...group.querySelectorAll('.word-entry')].some(e=>!e.hidden);});
      status.textContent=query?(count?`${count} matching ${count===1?'entry':'entries'}.`:'No matching words. Try another spelling or an English meaning.'):`${entries.length} dictionary entries. Search a word or browse by letter.`;
    };
    input.addEventListener('input',update);update();
    const nav=input.closest('.language-reference-body').querySelector('.alphabet-nav');
    nav.addEventListener('click',()=>{input.value='';update();});
  });
  function revealHash(){
    let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    // Keep older dictionary letter links usable.
    if(id.startsWith('letter-'))id='bae-'+id;
    const target=document.getElementById(id);if(!target)return;
    let ancestor=target;while(ancestor){if(ancestor.tagName==='DETAILS')ancestor.open=true;ancestor=ancestor.parentElement;}
    requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
  }
  addEventListener('hashchange',revealHash);revealHash();
})();
