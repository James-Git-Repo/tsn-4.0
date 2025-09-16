/* assets/mode-compat.js (FINAL) */
(function(){
  var ROOT = document.documentElement;
  var KEY = "tsn:mode";
  var LEG = "tsn_mode";
  function norm(v){ v=String(v||"").toLowerCase(); return (v==="editor"||v==="edit")?"editor":"viewer"; }
  try{
    var v = localStorage.getItem(KEY) || localStorage.getItem(LEG) || ROOT.getAttribute("data-mode") || "viewer";
    v = norm(v);
    ROOT.setAttribute("data-mode", v);
    localStorage.setItem(KEY, v);
    localStorage.removeItem(LEG);
    // keyboard toggle Alt+E
    document.addEventListener("keydown", function(e){
      if(e.altKey && (e.key==="e"||e.key==="E")){
        var next = ROOT.getAttribute("data-mode")==="editor"?"viewer":"editor";
        localStorage.setItem(KEY, next); ROOT.setAttribute("data-mode", next); location.reload();
      }
    });
  }catch(e){
    ROOT.setAttribute("data-mode", "viewer");
  }
})();