(()=>{const root=document.documentElement,body=document.body,lang=body.dataset.lang||'home';
try{const saved=localStorage.getItem('fau-theme');root.dataset.theme=saved||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch{}
let size=20;try{size=Number(localStorage.getItem('fau-font')||20)}catch{};const apply=()=>root.style.setProperty('--reader-size',size+'px');apply();
document.querySelector('[data-theme-toggle]')?.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('fau-theme',root.dataset.theme)}catch{}});
document.querySelector('[data-font-down]')?.addEventListener('click',()=>{size=Math.max(16,size-1);apply();try{localStorage.setItem('fau-font',size)}catch{}});
document.querySelector('[data-font-up]')?.addEventListener('click',()=>{size=Math.min(28,size+1);apply();try{localStorage.setItem('fau-font',size)}catch{}});
const toc=document.querySelector('.toc'),scrim=document.querySelector('.scrim');const close=()=>{toc?.classList.remove('open');scrim?.classList.remove('show')};document.querySelector('[data-menu]')?.addEventListener('click',()=>{toc?.classList.toggle('open');scrim?.classList.toggle('show')});scrim?.addEventListener('click',close);toc?.addEventListener('click',e=>{if(e.target.closest('a'))close()});
document.querySelector('#episode-filter')?.addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();document.querySelectorAll('.toc-list li').forEach(li=>li.hidden=!li.textContent.toLowerCase().includes(q))});
const bar=document.querySelector('.progress span'),top=document.querySelector('.back-top');const onScroll=()=>{const max=document.documentElement.scrollHeight-innerHeight;if(bar)bar.style.width=(max?scrollY/max*100:0)+'%';top?.classList.toggle('show',scrollY>700)};addEventListener('scroll',onScroll,{passive:true});onScroll();top?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
const links=new Map([...document.querySelectorAll('.toc-list a')].map(a=>[a.getAttribute('href').slice(1),a]));if(links.size){const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){links.forEach(a=>a.classList.remove('active'));links.get(e.target.id)?.classList.add('active')}},{rootMargin:'-20% 0px -70%'});document.querySelectorAll('.episode').forEach(e=>io.observe(e))}
})();

