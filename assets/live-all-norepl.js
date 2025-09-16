// assets/live-all-norepl.js (FINAL)
import { sb } from "./sb-init.js";
import { applyBindings, collectEditable, wireLiveEditor } from "./live-core.js";
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
  const cfg=detectConfig(); const { table,keyColumn,keyValue,bindings }=cfg;
  const first=await fetchRow(table,keyColumn,keyValue); if(first) applyBindings(first, bindings);
  const ch=channel(`page:${table}:${keyColumn}:${keyValue}`);
  const onPing=async()=>{ const row=await fetchRow(table,keyColumn,keyValue); if(row) applyBindings(row, bindings); };
  ch.on("broadcast",{event:"page_update"}, onPing); ch.subscribe(()=>{});
  startPolling({ table,keyColumn,keyValue, onData:(row)=> applyBindings(row, bindings) });
  if(getMode()==="editor"){
    const editable=collectEditable(bindings);
    await wireLiveEditor({ table,keyColumn,keyValue, editableBindings:editable });
    let t; const ping=()=>{ clearTimeout(t); t=setTimeout(async()=>{ try{ await ch.send({ type:"broadcast", event:"page_update", payload:{at:Date.now()} }); }catch{} },300); };
    editable.forEach(([_,b])=>{ b.el.addEventListener("input", ping); b.el.addEventListener("blur", ping); });
  }
  window.__tsnToggleMode = function(){ const next=getMode()==="editor"?"viewer":"editor"; setMode(next); location.reload(); };
});