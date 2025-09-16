// assets/live-core.js (FINAL same as before but tiny)
import { sb } from "./sb-init.js";
export function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }
export function bindGetSet(sel, mode="text"){ const el=document.querySelector(sel); if(!el) return null; return { el, get:()=> mode==="html"?el.innerHTML:el.textContent, set:(v)=>{v=v??""; if(mode==="html") el.innerHTML=v; else el.textContent=v;}, makeEditable:()=>{ el.setAttribute("contenteditable","true"); el.classList.add("editable","edit-outline"); } }; }
export function applyBindings(row, bindings){ if(!row) return; for(const f in bindings){ const b=bindings[f]; if(b&&b.set) b.set(row[f]); } }
export function collectEditable(bindings){ const L=[]; for(const f in bindings){ const b=bindings[f]; if(b&&b.makeEditable){ b.makeEditable(); L.push([f,b]); } } return L; }
export async function wireLiveEditor({ table, keyColumn, keyValue, editableBindings }){
  const deb = debounce(async (delta)=>{ const up={...delta, status:"published", updated_at:new Date().toISOString()}; const { error } = await sb.from(table).update(up).eq(keyColumn, keyValue); if(error) console.error("Live save failed:", error.message); }, 600);
  editableBindings.forEach(([f,b])=>{ const h=()=>deb({[f]:b.get()}); b.el.addEventListener("input", h); b.el.addEventListener("blur", h); });
}