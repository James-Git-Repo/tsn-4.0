// assets/live-core.js (SUPABASE NORMALIZED)
import { sb } from "./sb-init.js";

export function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; }

export async function resolveRowSmart({ table, keyColumn, canonicalKey, defaults={} }){
  let one = await sb.from(table).select("*").eq(keyColumn, canonicalKey).maybeSingle();
  if (!one.error && one.data) return { key: canonicalKey, row: one.data };
  const last = (canonicalKey.split("/").pop() || canonicalKey).toLowerCase();
  let like = await sb.from(table).select("*").ilike(keyColumn, `%/${last}`).limit(1).maybeSingle();
  if (!like.error && like.data) return { key: like.data[keyColumn], row: like.data };
  const stub = { [keyColumn]: canonicalKey, status: "published", updated_at: new Date().toISOString(), ...defaults };
  let ins = await sb.from(table).upsert(stub, { onConflict: keyColumn }).select().maybeSingle();
  return { key: canonicalKey, row: ins.data || stub };
}

export function bindGetSet(selector, mode="text"){
  const el = document.querySelector(selector);
  if (!el) return null;
  return {
    el,
    get: () => mode === "html" ? el.innerHTML : el.textContent,
    set: (val) => { if (val == null) val = ""; if (mode === "html") el.innerHTML = val; else el.textContent = val; },
    makeEditable: () => { el.setAttribute("contenteditable","true"); el.classList.add("editable","edit-outline"); }
  };
}

export function applyBindings(row, bindings){
  if (!row) return;
  for (const field in bindings){
    const b = bindings[field];
    if (!b) continue;
    const { set } = b;
    if (typeof set === "function") set(row[field]);
  }
}

export function collectEditable(bindings){
  const list = [];
  for (const field in bindings){
    const b = bindings[field];
    if (b && b.makeEditable){ b.makeEditable(); list.push([field, b]); }
  }
  return list;
}

export async function upsertOnEdit({ table, keyColumn, keyValue, editableBindings }){
  const debouncedSave = debounce(async (delta)=>{
    const up = { [keyColumn]: keyValue, ...delta, status: "published", updated_at: new Date().toISOString() };
    const { error } = await sb.from(table).upsert(up, { onConflict: keyColumn });
    if (error) console.error("Live save failed:", error.message);
  }, 600);
  editableBindings.forEach(([field, b])=>{
    const handler = ()=> debouncedSave({ [field]: b.get() });
    b.el.addEventListener("input", handler);
    b.el.addEventListener("blur", handler);
  });
}
