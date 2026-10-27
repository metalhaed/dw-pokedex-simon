// variable containing a web address of a folder where Pokémon-images/(sprites) are stored (spriteUrl)
let spriteUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/"
// variable containing a web address of a folder where data (facts about a Pokémon, like its name and description) is stored (dataUrl)
let dataUrl = "https://pokeapi.co/api/v2/pokemon/1/"

// grabs the url from first to second last character using "slice", then converts the string to an array and with "split" and returns the last element in the array with "pop"
function getIdFromUrl(url) {
    return url.slice(0, -1).split("/").pop()
}

// #region asynchronous function that runs the following code while still letting the page load and allowing other code to run
async function getPokémon(id) {
    // creates API & fecthes the two required endpoints
    // endpoint (1): contains most of the required data (height, weight, type, abilities, moves.)
    const pokémonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
    const pokémon = await pokémonResponse.json()

    // endpoint (2): contains the lore data (text descriptions, evolution chain info, habitat.)
    const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`)
    const species = await speciesResponse.json()

    // finds english version description for gen4-"pearl"
    // creates a variable to contain our result
    let description = null
    // a loop that runs through each line of flavor text, and each time, call the current item/entry
    for (const entry of species.flavor_text_entries) {
        // checks that the language is english and and that the version is pearl (the "&&" which means that both must be true)
        if (entry.language.name === "en" && entry.version.name === "pearl") {
            // (\n - newline) and (\f - form feed) are some oldschool invisible characters that control formatting here we remove them by using "split" to cut away what we don't want and "join" to glue them back together "figuretively speaking <(^_^<)  (>^_^)>  <(^_^<)  (>^_^)>  <(^_^<)"
            description = entry.flavor_text
                // cuts the strings into pieces wherever it sees a (\n - newline)
                .split("\n")
                // glues the strings back together into one single string now without (\n - newline)
                .join(" ")
                // cuts the strings into pieces wherever it sees a (\f - form feed)
                .split("\f")
                // glues the strings back together into one single string now without (\f - form feed)
                .join(" ")
            break
        }

    }

    // pulls type names into an array
    const types = []
    for (const t of pokémon.types) {
        types.push(t.type.name)
    }
    // pulls move names into an array
    const moves = []
    for (const m of pokémon.moves) {
        moves.push(m.move.name)
    }
    // pulls base stats names into an object
    const baseStats = {}
    for (const s of pokémon.stats) {
        baseStats[s.stat.name] = s.base_stat
    }

    // creates the sprite address: endpoint folder + id + ".png"
    let imageString = spriteUrl + id + ".png"

    // creates the clean final object that pages will use
    const result = {
        id: pokémon.id,
        name: pokémon.name,
        types: types,
        weight: pokémon.weight,
        height: pokémon.height,
        moves: moves,
        description: description,
        baseStats: baseStats,
        sprite: imageString
    }

    return result
}
// #endregion asynchronous function that runs the following code while still letting the page load and allowing other code to run
































