// assets/live-config.js (SUPABASE NORMALIZED)
import { bindGetSet } from "./live-core.js";

function normSlug(v){ return (v||"").toString().trim().toLowerCase(); }

function canonicalPathKey(){
  let p = (location.pathname || "/").toLowerCase().replace(/\/+$/,"");
  let file = p.split("/").pop() || "index.html";
  if (file === "" || file === "index.html") file = "home.html";
  return "/" + file;
}

export function detectConfig(){
  const html = document.documentElement;
  const explicitTable = html.getAttribute("data-collection");
  const explicitKeyCol = html.getAttribute("data-key-col");
  const explicitKeyVal = html.getAttribute("data-key") || null;

  const bindings = {
    title: bindGetSet('.proj-title') || bindGetSet('.page-title') || bindGetSet('[data-bind="title"]'),
    subtitle: bindGetSet('.proj-subtitle') || bindGetSet('.page-subtitle') || bindGetSet('[data-bind="subtitle"]'),
    body_html: bindGetSet('.proj-body','html') || bindGetSet('.page-body','html') || bindGetSet('[data-bind="body_html"]','html'),
  };

  const heroEl = document.querySelector('.proj-hero, .page-hero, [data-bind="hero_url"]');
  if (heroEl){
    bindings.hero_url = { el: heroEl, get: ()=> heroEl.dataset.src || "", set: (url)=>{
      if (!url) return;
      heroEl.style.backgroundImage = `url('${url}')`;
      heroEl.style.backgroundSize = "cover";
      heroEl.style.backgroundPosition = "center";
      heroEl.dataset.src = url;
    }, makeEditable: ()=>{} };
  }

  if (explicitTable) {
    const keyColumn = explicitKeyCol || "slug";
    const keyValue = explicitKeyVal || normSlug(new URL(location.href).searchParams.get("slug")) || canonicalPathKey();
    return { table: explicitTable, keyColumn, keyValue, bindings };
  }

  const name = location.pathname.split("/").pop().toLowerCase();
  const slug = normSlug(new URL(location.href).searchParams.get("slug"));

  if (name.startsWith("project")) {
    return { table: "project_pages", keyColumn: "slug", keyValue: slug, bindings };
  }
  if (name.startsWith("emm")) {
    return { table: "emm_articles", keyColumn: "slug", keyValue: slug || canonicalPathKey(), bindings, fallback: { table: "site_pages", keyColumn: "path", keyValue: canonicalPathKey() } };
  }
  if (name.includes("bio")) {
    return { table: "bio_pages", keyColumn: "slug", keyValue: slug || canonicalPathKey(), bindings, fallback: { table: "site_pages", keyColumn: "path", keyValue: canonicalPathKey() } };
  }

  return { table: "site_pages", keyColumn: "path", keyValue: canonicalPathKey(), bindings };
}
