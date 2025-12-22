const types=["Normal","Fire","Water","Electric","Grass","Ice","Fighting","Poison","Ground","Flying","Psychic","Bug","Rock","Ghost","Dragon","Dark","Steel","Fairy"];
const genMap = {
  1: ["red-blue", "yellow"],
  2: ["gold-silver", "crystal"],
  3: ["ruby-sapphire", "emerald", "firered-leafgreen"],
  4: ["diamond-pearl", "platinum", "heartgold-soulsilver"],
  5: ["black-white", "black-2-white-2"],
  6: ["x-y", "omega-ruby-alpha-sapphire"],
  7: ["sun-moon", "ultra-sun-ultra-moon"],
  8: ["sword-shield", "brilliant-diamond-shining-pearl", "legends-arceus"],
  9: ["scarlet-violet"]
};
let cachedMoves = [];
const moveTypeCache = {};
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

let allPokemon = [];

async function getMoveType(move) {
  if (moveTypeCache[move.name]) {
    return moveTypeCache[move.name];
  }

  const res = await fetch(move.url);
  const data = await res.json();

  const type = data.type.name;
  moveTypeCache[move.name] = type; // cache it
  return type;
}


// Fetch all Pokémon names for fuzzy search
fetch('https://pokeapi.co/api/v2/pokemon?limit=10000')
  .then(res => res.json())
  .then(data => {
    allPokemon = data.results.map(p => p.name);
    window.fuse = new Fuse(allPokemon, { includeScore: true, threshold: 0.4 });
  });

// Fetch species for Pokédex entry
async function getSpecies(name) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
  const data = await res.json();
  const flavorEntry = data.flavor_text_entries.find(e => e.language.name === "en");
  return flavorEntry ? flavorEntry.flavor_text.replace(/\n|\f/g, ' ') : "No Pokédex entry found.";
}

// Search function
async function searchPokemon() {
  const query = document.getElementById('search').value.toLowerCase();
  let match = query;

  if (window.fuse) {
    const results = fuse.search(query);
    if (results.length > 0) match = results[0].item;
  }

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${match}`);
    const data = await res.json();
    const dexEntry = await getSpecies(match);

    cachedMoves = [];

data.moves.forEach(move => {
  move.version_group_details.forEach(vgd => {
    if (vgd.move_learn_method.name === "level-up") {
      cachedMoves.push({
        name: move.move.name,
        level: vgd.level_learned_at,
        version: vgd.version_group.name,
        url: move.move.url
      });
    }
  });
});

    let html = `
      <h2>${data.name.toUpperCase()}</h2>
      <p><strong>Types:</strong> ${data.types.map(t => `<span class="type-icon type-${t.type.name}">${t.type.name}</span>`).join(' ')}</p>
      <p><strong>Pokédex Entry:</strong> ${dexEntry}</p>
      <img src="${data.sprites.front_default}" alt="${data.name}" />
      <label><strong>Game Generation:</strong></label>
<select id="genSelect" onchange="updateMoveTable()">
  <option value="all">All</option>
  <option value="1">Red/Blue</option>
  <option value="2">Gold/Silver</option>
  <option value="3">Saph/Ruby</option>
  <option value="4">Diam/Pearl</option>
  <option value="5">Black/White</option>
  <option value="6">X/Y</option>
  <option value="7">Sun/Moon</option>
  <option value="8">Sword/Sheild</option>
  <option value="9">Scarlet/Violet</option>
</select>

<h3>Moves Learned by Level-Up</h3>
<table class="type-table">
        <thead>
          <tr>
            <th>Level</th>
            <th>Move</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
    `;

    // Collect unique level-up moves
const moveMap = new Map();

data.moves.forEach(move => {
  const levelUp = move.version_group_details
    .filter(v => v.move_learn_method.name === "level-up")
    .sort((a, b) => b.level_learned_at - a.level_learned_at)[0];

  if (levelUp) {
    if (
      !moveMap.has(move.move.name) ||
      levelUp.level_learned_at < moveMap.get(move.move.name).level
    ) {
      moveMap.set(move.move.name, {
        name: move.move.name,
        level: levelUp.level_learned_at,
        url: move.move.url
      });
    }
  }
});

// Sort moves by level
const moves = [...moveMap.values()].sort((a, b) => a.level - b.level);

// Build rows
for (const m of moves) {
  const type = await getMoveType({ name: m.name, url: m.url });

  html += `
    <tr>
      <td>${m.level}</td>
      <td>${m.name}</td>
      <td>
        <span class="type-icon type-${type}">${type}</span>
      </td>
    </tr>
  `;
}


    html += `</tbody></table>`;
    document.getElementById('result').innerHTML = html;

    updateMoveTable();

  } catch {
    document.getElementById('result').innerText = "Pokémon not found!";
  }
}

async function updateMoveTable() {
  const gen = document.getElementById("genSelect")?.value || "all";
  const tbody = document.querySelector(".type-table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  const moveMap = new Map();

  cachedMoves.forEach(m => {
    if (gen !== "all" && !genMap[gen].includes(m.version)) return;

    if (!moveMap.has(m.name) || m.level < moveMap.get(m.name).level) {
      moveMap.set(m.name, m);
    }
  });

  const moves = [...moveMap.values()].sort((a, b) => a.level - b.level);

  for (const m of moves) {
    const type = await getMoveType(m);

    tbody.innerHTML += `
      <tr>
        <td>${m.level}</td>
        <td>${m.name}</td>
        <td><span class="type-icon type-${type}">${type}</span></td>
      </tr>`;
  }
}



buildTable();
fillDropdowns();
