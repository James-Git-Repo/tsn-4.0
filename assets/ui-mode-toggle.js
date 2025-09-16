/* assets/ui-mode-toggle.js
   Floating dev toggle. Appears only when ?dev=1 in URL OR localStorage['tsn:dev']=='1'.
   Click to switch viewer/editor and reloads. Alt+E also works (mode-compat).
*/
(function(){
  var params = new URL(location.href).searchParams;
  var dev = params.get("dev");
  if (dev === "1") { try{ localStorage.setItem("tsn:dev","1"); }catch(e){} }
  var enabled = (dev === "1") || (function(){ try{ return localStorage.getItem("tsn:dev")==="1"; }catch(e){ return false; } })();
  if (!enabled) return;

  var btn = document.createElement("button");
  btn.id = "tsnModeToggle";
  btn.type = "button";
  btn.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:9999;padding:10px 12px;border-radius:12px;border:1px solid #cbd5e1;background:#fff;box-shadow:0 6px 18px rgba(0,0,0,.12);cursor:pointer;font:600 13px system-ui,Segoe UI,Roboto,Arial;";
  function label(){
    var m = document.documentElement.getAttribute("data-mode") || "viewer";
    btn.textContent = (m==="editor"?"Editor":"Viewer") + " • toggle";
  }
  btn.addEventListener("click", function(){
    var m = document.documentElement.getAttribute("data-mode") || "viewer";
    var next = (m==="editor")?"viewer":"editor";
    try{ localStorage.setItem("tsn:mode", next); }catch(e){}
    document.documentElement.setAttribute("data-mode", next);
    location.reload();
  });
  label();
  document.body.appendChild(btn);
})();