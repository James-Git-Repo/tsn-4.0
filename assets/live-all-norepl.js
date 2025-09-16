// assets/live-all-norepl.js (SUPABASE NORMALIZED)
import { sb } from "./sb-init.js";
import { applyBindings, collectEditable, resolveRowSmart, upsertOnEdit } from "./live-core.js";
import { detectConfig } from "./live-config.js";
function norm(m){ m=(m||"").toLowerCase(); return (m==="editor"||m==="edit")?"editor":"viewer"; }
function getMode(){ let l=null; try{ l=localStorage.getItem("tsn:mode"); }catch{} const a=document.documentElement.getAttribute("data-mode"); return norm(l||a||"viewer"); }
function setMode(m){ m=norm(m); document.documentElement.setAttribute("data-mode",m); try{ localStorage.setItem("tsn:mode",m);}catch{} }
async function fetchRow(table, keyColumn, keyValue){ const { data } = await sb.from(table).select("*").eq(keyColumn, keyValue).maybeSingle(); return data||null; }
function startPolling({ table, keyColumn, keyValue, onData }){
  let base=2000,t=null; const run=async()=>{ const row=await fetchRow(table,keyColumn,keyValue); if(row) onData(row); schedule(); };
  const schedule=()=>{ const ms=document.hidden?Math.max(base*5,10000):base; t=setTimeout(run,ms); };
  document.addEventListener("visibilitychange",()=>{ if(t){ clearTimeout(t); schedule(); }}); run(); return ()=> t&&clearTimeout(t);
}
function channel(topic){ return sb.channel(topic,{config:{broadcast:{ack:true}}}); }
document.addEventListener("DOMContentLoaded", async ()=>{
  setMode(getMode());
  const cfg0 = detectConfig();
  const { key, row } = await resolveRowSmart({ table: cfg0.table, keyColumn: cfg0.keyColumn, canonicalKey: cfg0.keyValue });
  const cfg = { ...cfg0, keyValue: key };
  if (row) applyBindings(row, cfg.bindings);
  const ch = channel(`page:${cfg.table}:${cfg.keyColumn}:${cfg.keyValue}`);
  ch.on("broadcast",{event:"page_update"}, async ()=>{ const r=await fetchRow(cfg.table,cfg.keyColumn,cfg.keyValue); if(r) applyBindings(r, cfg.bindings); });
  ch.subscribe(()=>{});
  startPolling({ table: cfg.table, keyColumn: cfg.keyColumn, keyValue: cfg.keyValue, onData: (r)=> applyBindings(r, cfg.bindings) });
  if (getMode()==="editor"){
    const editable = collectEditable(cfg.bindings);
    await upsertOnEdit({ table: cfg.table, keyColumn: cfg.keyColumn, keyValue: cfg.keyValue, editableBindings: editable });
    let t; const ping=()=>{ clearTimeout(t); t=setTimeout(async()=>{ try{ await ch.send({ type:"broadcast", event:"page_update", payload:{at:Date.now()} }); }catch{} }, 300); };
    editable.forEach(([_,b])=>{ b.el.addEventListener("input", ping); b.el.addEventListener("blur", ping); });
  }
});
