function GetFormPtrByName( form_name ) {
  if (form_name == '') form_name='myform';
  for (var i=0;i<document.forms.length;i++) {
    var e = document.forms[i];
    if (e.name == form_name ) {
      return e;
    }
  }
  alert("INTERNAL ERROR> Form with name '"+form_name+"' not found");
  return null;
}
function getSmileFromJME(){
  var sm  = document.JME.smiles();
  var frm=GetFormPtrByName("search_form");
  frm.smiles_pattern.value=sm;
}
function submitSearch() {
  var mol = document.JME.jmeFile();
  var frm=GetFormPtrByName("search_form");  
  frm.p.value=jme;
  frm.sm.value=document.JME.smiles();
  frm.jme_mol.value=mol;
  frm.submit();
}

function submitSearch2()
{
  var mol = document.moledit.getSearchMolfile();
  var frm=GetFormPtrByName("search_form");
  frm.jme_mol.value=mol;
  frm.submit();
}



var smiles = "";
var jme = "0 0";

function fromEditor(smiles,jme) {
  // this function is called from jme_window
  // editor fills variable smiles & jme
  if (smiles=="") {
    alert ("no molecule submitted");
    return;
  }
  document.forms.convform.p.value=smiles;
  document.forms.convform.submit();
}

function submitSmiles() {
  var smiles = document.JME.smiles();
  var jme = document.JME.jmeFile();
  if (smiles == "") {
    alert("Nothing to submit");
  }
  else {
    fromEditor(smiles,jme);
  }
}

function getQueryParams()
{
  var params = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    params[decodeURIComponent(pair[0])] = pair.length == 2 ? decodeURIComponent(pair[1]) : "";
  } 
  return params;
}

function openHelpWindow() {
  window.open("jme_help_window.html","","toolbar=no,menubar=no,scroolbars=no,resizable=yes,width=500,height=600")
}


function gotoURL(pc,mobile)
{
  if (navigator.userAgent.match('iPad')||navigator.userAgent.match('iPod')||navigator.userAgent.match('iPhone'))
    window.location = mobile;
  else
    window.location = pc;
  return false;
}
//------------------------------------------------------------------------------------------------------------------------------------
