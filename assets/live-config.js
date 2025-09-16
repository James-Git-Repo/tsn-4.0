// assets/live-config.js (FINAL)
import { bindGetSet } from "./live-core.js";
function slug(){ const u=new URL(location.href); return u.searchParams.get("slug")||null; }
function pathKey(){ return location.pathname.replace(/\/+$/,""); }
export function detectConfig(){
  const html=document.documentElement;
  const explicitTable=html.getAttribute("data-collection");
  const explicitKeyCol=html.getAttribute("data-key-col");
  const explicitKeyVal=html.getAttribute("data-key")||null;
  const bindings={
    title: bindGetSet('.proj-title')||bindGetSet('.page-title')||bindGetSet('[data-bind="title"]'),
    subtitle: bindGetSet('.proj-subtitle')||bindGetSet('.page-subtitle')||bindGetSet('[data-bind="subtitle"]'),
    body_html: bindGetSet('.proj-body','html')||bindGetSet('.page-body','html')||bindGetSet('[data-bind="body_html"]','html'),
  };
  const hero=document.querySelector('.proj-hero,.page-hero,[data-bind="hero_url"]');
  if(hero){ bindings.hero_url={ el:hero, get:()=>hero.dataset.src||"", set:(u)=>{ if(!u) return; hero.style.backgroundImage=`url('${u}')`; hero.style.backgroundSize="cover"; hero.style.backgroundPosition="center"; hero.dataset.src=u; }, makeEditable:()=>{} }; }
  if(explicitTable){ const keyColumn=explicitKeyCol||"slug"; const keyValue=explicitKeyVal||slug()||pathKey(); return { table:explicitTable, keyColumn, keyValue, bindings }; }
  const name=location.pathname.split("/").pop().toLowerCase(); const s=slug();
  if(name.indexOf("project")===0) return { table:"project_pages", keyColumn:"slug", keyValue:s, bindings };
  if(name.indexOf("emm")===0) return { table:"emm_articles", keyColumn:"slug", keyValue:s||pathKey(), bindings, fallback:{ table:"site_pages", keyColumn:"path", keyValue:pathKey() } };
  if(name.includes("bio")) return { table:"bio_pages", keyColumn:"slug", keyValue:s||pathKey(), bindings, fallback:{ table:"site_pages", keyColumn:"path", keyValue:pathKey() } };
  return { table:"site_pages", keyColumn:"path", keyValue:pathKey(), bindings };
}