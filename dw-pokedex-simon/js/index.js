// creates base DOM elements
let rootElement = document.querySelector("#root");
const headElm = document.createElement("header");
const mainElm = document.createElement("main");
const sectHeadElm = document.createElement("section");
const sectMainElm = document.createElement("section");

// creates the header section elements
sectHeadElm.innerHTML = `
<div class="top-row">
    <figure class="logo"><img src="res/pokeball.svg" alt="pokéball"></figure>
    <h1 class="page-title">Pokédex</h1>
    <button class="button"><img src="res/sort_btn_numbers.svg" alt="sorting_button"></button>
</div>
<input class="search" type="text" placeholder="Search">
`

// creates the main section elements i.e. the list of pokemons & the sentinel div
sectMainElm.innerHTML = `
    <ul class="pokédex_list"></ul>
    <div id="sentinel"></div>
`

// appends the header & main
rootElement.append(headElm);
rootElement.append(mainElm);

// appends the header & main sections
headElm.append(sectHeadElm);
mainElm.append(sectMainElm);

// specifies the batch size to be fetched
const BATCH_SIZE = 20

// a variable that contains every pokémon id and name
let pokemonIndex = []   // 

// sets "sortByName" as false by default such that it sorts by pokémon id unless the sort button is pressed
let sortByName = false

// how many cards are currently loaded (starts at 0)
let position = 0


// sets loading to be false by default which is essential for the function of the safeguard on line 53-55 and the sort button
let loading = false

// makes sure that there are no more requests once all 493 are loaded unless the sort button resets it
let finished = false

// transforms the first character of each name to uppercase i.e. "pikachu" -> "Pikachu" (the API stores names in lowercase)
function capitalize(str) {
    // "str.charAt(0)" grabs the first character of the string (character 0), "touppercase" makes it uppercase and the "+" adds the capitalized first character to the original word after after the first letter is removed with "str.slice(1)"
    return str.charAt(0).toUpperCase() + str.slice(1)
}

// #region asynchronous function that runs the following code while still letting the page load and allowing other code to run
// requests all 493 names & ids at once (no sprites/stats/desc)
async function buildIndex() {
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=493")
    const data = await response.json()
    pokemonIndex = data.results.map(entry => ({
        // simply reuses the helper from pokémon.js
        id: Number(getIdFromUrl(entry.url)),
        name: entry.name
    }))
}

// sorts pokemonIndex by number or by name
function sortIndex() {
    if (sortByName) {
        pokemonIndex.sort((a, b) => a.name.localeCompare(b.name))
    } else {
        pokemonIndex.sort((a, b) => a.id - b.id)
    }
}
// #endregion asynchronous function that runs the following code while still letting the page load and allowing other code to run


// #region asynchronous function that runs the following code while still letting the page load and allowing other code to run
async function loadBatch() {

    // three safeguards to make sure the function doesn't run if it doesn't need to: (1) "loading" if a batch is already being fetched it returns the function, (2) "finished" means that it returns once all 493 pokémon are loaded, (3) "pokemonIndex.length === 0" makes sure we don't remove the sentinel when someone presses the sort button if the index is not build, (the "||" means that it becomes an "or statment" i.e. one is enough to return the function)
    if (loading || finished || pokemonIndex.length === 0) return

    // if the function makes it past the safeguard this sets "loading" to "true" such that the safeguard will be activated if the function is run again immediately
    loading = true

    // 
    const nextOnes = pokemonIndex.slice(position, position + BATCH_SIZE)
    position += nextOnes.length

    // runs function "getPokémon" and sorts the ids with "Promise.all" so the pokémon show up in correct order
    const batch = await Promise.all(nextOnes.map(p => getPokémon(p.id)))

    // grabs the css selector ".pokédex_list" and uses "insertAdjacentHTML" to build the pokédex list
    const listElm = document.querySelector(".pokédex_list")
    // "batch.map(xyz)" takes the array of data objects and produces an array of HTML strings, the "=>" arrow is a compact way of writing "function (p) { return xyz }" and "join("")" glues the 20 HTML strings into one big string
    listElm.insertAdjacentHTML("beforeend", batch.map(p => `
        <li class="card">
            <a href="pokédex_entry.html?id=${p.id}">
            <span class="card-number">#${p.id}</span>
            <img class="card-img" src="${p.sprite}" alt="${p.name}">
            <h2 class="card-name">${capitalize(p.name)}</h2>
            </a>
        </li>
    `).join(""))

    // resets the safeguard (a new batch can then be fetched)
    loading = false

    // when everything is finished stops the observer watching and removes the sentinel
    if (position >= pokemonIndex.length) {
        finished = true
        observer.disconnect()
        document.querySelector("#sentinel").remove()
    }
}
// #endregion asynchronous function that runs the following code while still letting the page load and allowing other code to run

// the observer tells whenever the sentinel enters the viewport
const observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
        loadBatch()
    }
})

// toggle/sort button
document.querySelector(".button").addEventListener("click", function () {
    sortByName = !sortByName

    // swap the svg icon to show the current mode
    document.querySelector(".button img").src = sortByName
        ? "res/sort_btn_name.svg"
        : "res/sort_btn_numbers.svg"

    // re-sorts and resets the list completely
    sortIndex()
    position = 0
    finished = false
    document.querySelector(".pokédex_list").innerHTML = ""

    // bring the sentinel back if it had been removed
    if (!document.querySelector("#sentinel")) {
        const sentinel = document.createElement("div")
        sentinel.id = "sentinel"
        sectMainElm.append(sentinel)
    }
    observer.observe(document.querySelector("#sentinel"))

    // load the first batch immediately
    loadBatch()

})

// 
async function start() {
    // gets all the names
    await buildIndex()
    // puts them in order
    sortIndex()
    observer.observe(document.querySelector("#sentinel"))
    // loads first batch
    loadBatch()
}
start()