// creates base DOM elements
let rootElement = document.querySelector("#root");
const headElm = document.createElement("header");
const mainElm = document.createElement("main");
const sectHeadElm = document.createElement("section");
const sectMainElm = document.createElement("section");

// desides the last id to be fetched (which is also used to stop the observer from running)
const LAST_ID = 493

// transforms the first character of each name to uppercase i.e. "pikachu" -> "Pikachu" (the API stores names in lowercase)
function capitalize(str) {
    // "str.charAt(0)" grabs the first character of the string (character 0), "touppercase" makes it uppercase and the "+" adds the capitalized first character to the original word after after the first letter is removed with "str.slice(1)"
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// reads the id, i.e. "?id=xyz" which the link in "index.js" put in the address bar
const params = new URLSearchParams(location.search);
const id = params.get("id")

// adds class ".head-row" to the header section
sectHeadElm.classList.add("head-row")

// #region asynchronous function that runs the following code while still letting the page load and allowing other code to run
async function init() {

    // waits for the getPokémon async function to return
    const p = await getPokémon(id)

    // browser tab title
    document.title = capitalize(p.name)

    // creates the header section DOM elements
    sectHeadElm.innerHTML = `
        <a class="back-button" href="index.html"><img src="res/arrow_back.svg" alt="back_arrow"></a>
        <h1 class="pokemon-name">${capitalize(p.name)}</h1>
        <span class="pokemon-number">#${p.id}</span>
    `

    // the ids of the neighbours, for the side arrows
    const prevId = p.id - 1
    const nextId = p.id + 1

    // creates the main section DOM elements
    sectMainElm.innerHTML = `
    <div class="sprite-area">
        ${p.id > 1 ? `<a class="chev_arrow arrow-left" href="pokédex_entry.html?id=${prevId}"><img src="res/chevron_left.svg" alt="previous Pokémon"></a>` : `<span class="arrow-spacer"></span>`}
        <img class="sprite" src="${p.sprite}" alt="${p.name}">
        ${p.id < LAST_ID ? `<a class="chev_arrow arrow-right" href="pokédex_entry.html?id=${nextId}"><img src="res/chevron_right.svg" alt="next Pokémon"></a>` : ``}
    </div>

        // creates the list of types
        < ul class="types" >
            ${p.types.map(t => `<li class="type-pill">${t}</li>`).join("")}
    </ul >

    // creates the list of stats in the about region
        <h2>About</h2>
    <div class="facts">
        <div class="fact"><img class="fact-icon" src="res/weight.svg" alt=""><span class="fact-value">${p.weight / 10} kg</span><span class="fact-label">Weight</span></div>
        <div class="fact"><img class="fact-icon" src="res/height.svg" alt=""><span class="fact-value">${p.height / 10} m</span><span class="fact-label">Height</span></div>
        <div class="fact"><span class="fact-value">${p.moves.slice(0, 2).join("<br>")}</span><span class="fact-label">Moves</span></div>
    </div>

    // creates the description
    <p class="description">${p.description}</p>

    // creates the list of stats in the base stat region
    <h2>Base Stats</h2>
    <ul class="stats">
        ${Object.entries(p.baseStats).map(([name, value]) => `
            <li class="stat-row">
                <span class="stat-name">${statShortNames[name]}</span>
                <span class="stat-value">${value}</span>
                <div class="bar"><div class="fill" style="width: ${value / 2}%"></div></div>
            </li>
        `).join("")}
    </ul>
    `

    // appends the header & main
    rootElement.append(headElm);
    rootElement.append(mainElm);

    // appends the header & main sections
    headElm.append(sectHeadElm);
    mainElm.append(sectMainElm);
}

// creates abbreviated names for base stats region
const statShortNames = {
    "hp": "HP",
    "attack": "ATK",
    "defense": "DEF",
    "special-attack": "SATK",
    "special-defense": "SDEF",
    "speed": "SPD"
}

init()