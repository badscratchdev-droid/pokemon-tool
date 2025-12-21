const types=["Normal","Fire","Water","Electric","Grass","Ice","Fighting","Poison","Ground","Flying","Psychic","Bug","Rock","Ghost","Dragon","Dark","Steel","Fairy"];

const chart={
Normal:{Rock:0.5,Ghost:0,Steel:0.5},
Fire:{Fire:0.5,Water:0.5,Grass:2,Ice:2,Bug:2,Rock:0.5,Dragon:0.5,Steel:2},
Water:{Fire:2,Water:0.5,Grass:0.5,Ground:2,Rock:2,Dragon:0.5},
Electric:{Water:2,Electric:0.5,Grass:0.5,Ground:0, Flying:2,Dragon:0.5},
Grass:{Fire:0.5,Water:2,Grass:0.5,Poison:0.5,Ground:2,Flying:0.5,Bug:0.5,Rock:2,Dragon:0.5,Steel:0.5},
Ice:{Fire:0.5,Water:0.5,Ice:0.5,Ground:2,Flying:2,Dragon:2,Steel:0.5},
Fighting:{Normal:2,Ice:2,Poison:0.5,Flying:0.5,Psychic:0.5,Bug:0.5,Rock:2,Ghost:0,Dark:2,Steel:2,Fairy:0.5},
Poison:{Grass:2,Poison:0.5,Ground:0.5,Rock:0.5,Ghost:0.5,Steel:0,Fairy:2},
Ground:{Fire:2,Electric:2,Grass:0.5,Poison:2, Flying:0, Bug:0.5,Rock:2,Steel:2},
Flying:{Electric:0.5,Grass:2,Fighting:2,Bug:2,Rock:0.5,Steel:0.5},
Psychic:{Fighting:2,Poison:2,Psychic:0.5,Dark:0,Steel:0.5},
Bug:{Fire:0.5,Grass:2,Fighting:0.5,Poison:0.5,Flying:0.5,Psychic:2,Ghost:0.5,Dark:2,Steel:0.5,Fairy:0.5},
Rock:{Fire:2,Ice:2,Fighting:0.5,Ground:0.5, Flying:2,Bug:2,Steel:0.5},
Ghost:{Normal:0,Psychic:2, Ghost:2,Dark:0.5},
Dragon:{Dragon:2,Steel:0.5,Fairy:0},
Dark:{Fighting:0.5,Psychic:2,Ghost:2,Dark:0.5,Fairy:0.5},
Steel:{Fire:0.5,Water:0.5,Electric:0.5,Ice:2,Rock:2,Fairy:2},
Fairy:{Fire:0.5,Fighting:2,Poison:0.5,Dragon:2,Dark:2,Steel:0.5}
};

function buildTable(){
 let t=document.getElementById("typeTable");
 if(!t) return;
 let h="<thead><tr><th></th>";
 types.forEach(x=>h+='<th><span class="type-icon type-'+x.toLowerCase()+'">'+x+'</span></th>');
 h+="</tr></thead><tbody>";

 types.forEach(def=>{
  h+='<tr><th><span class="type-icon type-'+def.toLowerCase()+'">'+def+'</span></th>';
  types.forEach(atk=>{
   let m=chart[def][atk]||1;
   let cls="type-fx-100";
   if(m===2)cls="type-fx-200";
   if(m===0.5)cls="type-fx-50";
   if(m===0)cls="type-fx-0";
   h+='<td class="'+cls+'">'+m+'x</td>';
  });
  h+="</tr>";
 });

 t.innerHTML=h+"</tbody>";
}

function fillDropdowns(){
 types.forEach(t=>{
  let d1=document.getElementById("def1");
  if(d1) d1.innerHTML+=`<option>${t}</option>`;
  let d2=document.getElementById("def2");
  if(d2) d2.innerHTML+=`<option>${t}</option>`;
  let vA=document.getElementById("vsA");
  if(vA) vA.innerHTML+=`<option>${t}</option>`;
  let vB=document.getElementById("vsB");
  if(vB) vB.innerHTML+=`<option>${t}</option>`;
 });
}

function describe(m){
    if(m === 0) return '<span class="no-effect">0× (no effect)</span>';
    if(m > 1) return `<span class="effective">${m}× (super-effective)</span>`;
    if(m < 1) return `<span class="not-effective">${m}× (not very effective)</span>`;
    return m+'× (normal effectiveness)';
}



function calcDual(){
 let A=document.getElementById("def1").value;
 let B=document.getElementById("def2").value;
 let res="";
 types.forEach(atk=>{
  let m1=chart[A][atk]||1;
  let m2=chart[B][atk]||1;
  let total=m1*m2;
  res+=`${atk}: ${describe(total)}<br>`;
 });
 document.getElementById("dualResults").innerHTML=res;
}

function checkVs(){
    let A = document.getElementById("vsA").value;
    let B = document.getElementById("vsB").value;
    let AB = chart[A][B] || 1;
    let BA = chart[B][A] || 1;

    document.getElementById("vsResults").innerHTML =
        `<b>${A} → ${B}:</b> ${describe(AB)}<br>` +
        `<b>${B} → ${A}:</b> ${describe(BA)}`;
}


buildTable();
fillDropdowns();
