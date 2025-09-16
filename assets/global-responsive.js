/* assets/global-responsive.js (FINAL) */
(function(){
  const html = document.documentElement;
  function setDevice(){ const w=innerWidth; html.classList.toggle('mobile', w<640); html.classList.toggle('tablet', w>=640&&w<1024); html.classList.toggle('desktop', w>=1024); }
  const throttle = (fn,ms)=>{ let t=0; return (...a)=>{const n=Date.now(); if(n-t>ms){ t=n; fn(...a);}}};
  setDevice(); addEventListener('resize', throttle(setDevice,120), {passive:true});
  function setupNav(){
    const panel = document.getElementById('primaryNav') || document.querySelector('nav'); if(!panel) return;
    if(!panel.id) panel.id='primaryNav';
    const existing = document.querySelector('[data-nav-toggle]');
    let btn = existing;
    if(!btn){ btn=document.createElement('button'); btn.className='nav-toggle'; btn.setAttribute('data-nav-toggle',''); btn.setAttribute('aria-controls',panel.id); btn.setAttribute('aria-expanded','false'); btn.type='button'; btn.textContent='Menu'; (document.querySelector('.navbar')||panel.parentElement).insertBefore(btn,panel); }
    const isSmall = ()=> innerWidth<1024;
    const open = ()=>{ btn.setAttribute('aria-expanded','true'); panel.removeAttribute('hidden'); panel.classList.add('is-open'); setTimeout(()=>document.addEventListener('click', onDoc),0); };
    const close= ()=>{ btn.setAttribute('aria-expanded','false'); panel.setAttribute('hidden',''); panel.classList.remove('is-open'); document.removeEventListener('click', onDoc); };
    const onDoc = (e)=>{ if(!panel.contains(e.target) && e.target!==btn) close(); };
    if(isSmall()) close(); else panel.removeAttribute('hidden');
    btn.addEventListener('click', (e)=>{ e.stopPropagation(); (btn.getAttribute('aria-expanded')==='true')?close():open(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && btn.getAttribute('aria-expanded')==='true') close(); });
    panel.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=>{ if(isSmall()) close(); }));
    addEventListener('resize', throttle(()=>{ if(!isSmall()){ panel.removeAttribute('hidden'); btn.setAttribute('aria-expanded','false'); panel.classList.remove('is-open'); } else if(btn.getAttribute('aria-expanded')!=='true'){ panel.setAttribute('hidden',''); } },120), {passive:true});
  }
  if (document.readyState!=='loading') setupNav(); else document.addEventListener('DOMContentLoaded', setupNav);
})();