(() => {
  const sections = [...document.querySelectorAll('.section')];
  const topics = [...document.querySelectorAll('[data-topic]')];
  if (!topics.length) return;
  document.body.classList.add('js-enabled');
  const count = document.querySelector('#chapter-count');
  const prev = document.querySelector('#chapter-prev');
  const next = document.querySelector('#chapter-next');
  const directory = document.querySelector('#topic-directory');
  const directoryList = document.querySelector('#directory-list');
  const progress = document.querySelector('#reading-progress');
  const related = {
    map:['modes','settings'], modes:['prompts','continuity'], settings:['shots','quality'],
    shots:['rhythm','prompts'], rhythm:['examples','shots'], continuity:['prompts','quality'],
    prompts:['examples','production'], examples:['production','quality'], production:['quality','four-grid'],
    quality:['continuity','four-grid'], 'four-grid':['prompts','resources'], resources:['modes','examples']
  };
  let pageIndex = 0;
  const groups = new Map();
  topics.forEach((topic,index) => {
    const section=topic.closest('.section');
    topic.id=`topic-${String(index+1).padStart(2,'0')}`;
    const group=groups.get(section.id)||{section,heading:section.querySelector('.head h2')?.textContent||'课程主题',items:[]};
    group.items.push({topic,index,title:topic.dataset.title||topic.querySelector('h3')?.textContent||'主题'});
    groups.set(section.id,group);
  });
  for(const {heading,items} of groups.values()){
    const group=document.createElement('section');group.className='directory-group';
    const h=document.createElement('h3');h.textContent=heading;group.append(h);
    for(const {topic,index,title} of items){const a=document.createElement('a');a.href=`#${topic.id}`;const n=document.createElement('small');n.textContent=String(index+1).padStart(2,'0');const label=document.createElement('span');label.textContent=title;a.append(n,label);group.append(a)}
    directoryList.append(group);
  }
  function activate(index,{updateHash=true,scroll=true}={}){
    pageIndex=Math.max(0,Math.min(topics.length-1,index));
    const current=topics[pageIndex], section=current.closest('.section');
    sections.forEach(s=>s.hidden=s!==section);
    topics.forEach(t=>{const active=t===current;t.hidden=!active;t.setAttribute('aria-current',active?'page':'false');t.querySelector('.topic-meta')?.remove();t.querySelector('.related-topics')?.remove()});
    const meta=document.createElement('div');meta.className='topic-meta';meta.textContent=`主题 ${String(pageIndex+1).padStart(2,'0')} / ${topics.length}`;current.prepend(meta);
    const links=(related[section.id]||[]).map(id=>{const s=sections.find(x=>x.id===id),t=s?.querySelector('[data-topic]');return t?{topic:t,label:s.querySelector('.head h2')?.textContent||id}:null}).filter(Boolean);
    if(links.length){const footer=document.createElement('div');footer.className='related-topics';const label=document.createElement('span');label.textContent='接下来可以看';footer.append(label);for(const item of links){const a=document.createElement('a');a.href=`#${item.topic.id}`;a.textContent=`${item.label} ↗`;footer.append(a)}current.append(footer)}
    count.textContent=`${String(pageIndex+1).padStart(2,'0')} / ${topics.length}`;prev.disabled=pageIndex===0;next.disabled=pageIndex===topics.length-1;progress.style.width=`${(pageIndex+1)/topics.length*100}%`;
    document.querySelectorAll('.nav a').forEach(a=>{if(a.getAttribute('href')===`#${section.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
    if(updateHash&&location.hash!==`#${current.id}`)history.replaceState(null,'',`#${current.id}`);
    if(scroll)section.scrollIntoView({behavior:'smooth',block:'start'});
  }
  prev.addEventListener('click',()=>activate(pageIndex-1));next.addEventListener('click',()=>activate(pageIndex+1));
  document.querySelectorAll('.nav a').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href')?.slice(1),target=topics.find(t=>t.closest('.section')?.id===id);if(!target)return;e.preventDefault();activate(topics.indexOf(target))}));
  document.querySelector('#directory-open').addEventListener('click',()=>directory.showModal());document.querySelector('#directory-close').addEventListener('click',()=>directory.close());
  directory.addEventListener('click',e=>{if(e.target===directory)directory.close();const a=e.target.closest('a[href^="#topic-"]');if(!a)return;const i=topics.findIndex(t=>`#${t.id}`===a.getAttribute('href'));if(i<0)return;e.preventDefault();directory.close();activate(i)});
  document.addEventListener('click',async e=>{const button=e.target.closest('.copy-button[data-copy]');if(!button)return;const source=document.getElementById(button.dataset.copy);if(!source)return;try{await navigator.clipboard.writeText('value'in source?source.value:source.innerText);const old=button.textContent;button.textContent='已复制';setTimeout(()=>button.textContent=old,1400)}catch{button.textContent='请手动选择复制'}});
  window.addEventListener('keydown',e=>{if(directory.open||/INPUT|TEXTAREA/.test(document.activeElement?.tagName||''))return;if(e.key==='ArrowRight'||e.key==='PageDown')activate(pageIndex+1);if(e.key==='ArrowLeft'||e.key==='PageUp')activate(pageIndex-1)});
  const hashIndex=topics.findIndex(t=>`#${t.id}`===location.hash);activate(hashIndex>=0?hashIndex:0,{updateHash:hashIndex<0,scroll:false});
})();
