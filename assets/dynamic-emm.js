// assets/dynamic-emm.js (FINAL without HTML comments)
import { sb } from "./sb-init.js";
const $ = (id) => document.getElementById(id);
function allowViewer(){ ["openContrib","contribDialog","contribFormContainer","contribForm","ctType","ctName","ctEmail","ctMsg","ctConsent","ctCancel","ctSubmit"].forEach(id=>{ const el=$(id); if(el) el.setAttribute("data-view-allowed",""); }); }
function wireContribForm(){
  const form = $("contribForm") || $("contribFormContainer"); if (!form) return;
  $("ctCancel")?.addEventListener("click", ()=>{ $("contribDialog")?.setAttribute("hidden",""); });
  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const type=$("ctType")?.value||"feedback"; const name=$("ctName")?.value?.trim(); const email=$("ctEmail")?.value?.trim(); const msg=$("ctMsg")?.value?.trim(); const ok=$("ctConsent")?.checked;
    if(!name||!email||!msg||!ok) return;
    const url = new URL(location.href); const article_slug = url.searchParams.get("a") || null;
    try{ const { error } = await sb.from("emm_contribs").insert({ name,email,type,message:msg,article_slug }); if(error) throw error; $("contribDialog")?.setAttribute("hidden",""); alert("Thanks for your contribution!"); }catch(e2){ alert(e2?.message||e2||"Unexpected error"); }
  });
}
document.addEventListener("DOMContentLoaded", ()=>{ allowViewer(); wireContribForm(); });