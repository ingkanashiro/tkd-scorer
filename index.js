class Tourney {

    // hash: [NAME][#Categories][CategoryName][#Cont]...
    constructor(name, isFreestyle, categories) {
        
        this.id = getHash(name);
        this.name = name;
        this.isFreestyle = isFreestyle;
        this.categories = categories;
        
        for (let c of categories) {
            c.id = this.id + c.id;
        }

        console.log('c:', categories);
    }
}

class Category {

    constructor(name, doShuffle, contestants) {

        let list = contestants;

        if (doShuffle) {
            list = shuffle(list);
        }

        this.name = name;
        this.queue = list;
        this.leaderboard = [];

        let id = 0;
        for (let char in name) {
            id += char;
            id *= 100;
        }

        this.id = getHash(name); // number related to name
        console.log(id, name);
    }
}

class Competitor {
    
    constructor(name) {
        this.name = name;
        this.scores = [0, 0, 0];
    }

    setScores(T, P, D) {
        this.scores = [T, P, D];
    }

    getScore() {
        return (this.scores[0] + this.scores[1] - this.scores[2]);
    }
}

let tourneys = [];

function getHash(str) {
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }

    let string = toString(hash);

    return string;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements at i and j using destructuring assignment
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}


function addCategoryField() {
    const input = document.createElement('input');

    input.className = 'dyn-input';
    input.placeholder = '...';

    const list = document.getElementById('competitor-inputs')
    input.competitors = document.createElement('div');

    input.competitors.className = "category-input";

    input.competitors.innerHTML = `
        <div class="category-header">
            <div style="display: flex; align-items: center; gap: 4px;">
                <img src="./assets/mocha/puppet.svg" style="width:16px">
                <span class="category-name">...</span>
            </div>
            <button onclick="addCompetitorField(this)">
                <img src="./assets/icons/add.svg">
            </button>
        </div>
    `;

    list.appendChild(input.competitors);
    
    // Remove if unfocused and empty
    input.addEventListener('blur', () => {
        
        input.competitors.querySelector(".category-name").textContent = input.value;

        if (input.value.trim() === '') {
            input.competitors.remove();
            input.remove();
        }
    });

    const parent = document.getElementById('category-list');
    parent.appendChild(input);


    input.focus();
}

function addCompetitorField(e) {
    const input = document.createElement('input');

    input.className = 'line-input';
    input.placeholder = '...';

    // Remove if unfocused and empty
    input.addEventListener('blur', () => {
        if (input.value.trim() === '') {
            input.remove();
        }
    });

    const div = e.parentNode.parentNode;
    div.appendChild(input);


    input.focus();
}

function throwErrorMsg(msg) {
    document.getElementById('new-tourney-error-msgbox').textContent = msg;
}

function createNewTourney() {
    const T = document.getElementById('tourney-settings');

    for (let e of document.getElementsByClassName('error-border')) {
        e.classList.remove('error-border');
    }
    throwErrorMsg('');

    console.log('creating tourney...');

    // Missing fields

    if (document.getElementById('tourney-name').value.trim() === '') {
        document.getElementById('tourney-name').focus();
        document.getElementById('tourney-name').classList.add('error-border');

        throwErrorMsg('Tournament name is required');

        return;
    }

    if (document.getElementById('category-list').childElementCount < 1) {
        throwErrorMsg('At least one category is required');
        return;
    }

    let doCategoryEmpty = false;
    for (let e of document.getElementsByClassName('category-input')) {
        
        if (e.childElementCount < 2) {
            doCategoryEmpty = true;        
            e.classList.add('error-border');
        }
    }

    if (doCategoryEmpty) {
        throwErrorMsg('All categories must have at least one contestant');
        return;
    }

    const name = document.getElementById('tourney-name').value;
    const isFreestyle = document.getElementById('tourney-is-freestyle').checked;
    const doShuffle = document.getElementById('tourney-do-shuffle').checked;

    // Repetitons
    for (let L of tourneys) {
        if (L.name === name) {
            document.getElementById('tourney-name').focus();
            document.getElementById('tourney-name').classList.add('error-border');

            throwErrorMsg('A tournament with this name already exists');
            return;
        }
    }

    let categories = [];

    const usedNames = new Set();

    for (let e of document.getElementsByClassName('category-input')) {

        const c_name = e.querySelector('.category-name').textContent;
        if (usedNames.has(c_name)) {
            e.classList.add('error-border');
            
            throwErrorMsg('Categories within a tournament must have unique names');
            return;
        }

        usedNames.add(c_name);

        let competitors = [];

        for (let g of e.getElementsByClassName('input-line')) {
            competitors.push(Competitor(g.value));
        }

        let c = new Category(c_name, doShuffle, competitors);
        categories.push(c);
    }

    let tourney = new Tourney(name, isFreestyle, categories);
    tourneys.push(tourney);

    updateExplorer();
    alert('Tourney created!');

    hideTab('new-tourney');
    return;
}

function updateExplorer() {

    const e = document.getElementById('explorer');

    // Clear the explorer
    e.innerHTML = ``;

    // Reload the explorer from the 'tourneys' array
    for (let T of tourneys) {
        let d = document.createElement('div');
        d.className = 'tourney-file';

        d.innerHTML = `
            <button class="tourney-file-header">
                <img src="./assets/mocha/nim.svg">
                <span>${T.name}</span>
            </button>
        `

        let c = document.createElement('div');
        c.className = 'category-files';

        for (let G of T.categories) {
            let g = document.createElement('button');
            
            g.className = 'category-file';
            g.innerHTML = `<img src="./assets/mocha/puppet.svg"><span>${G.name}</span>`;

            g.onclick = '';

            c.appendChild(g);
        }

        d.appendChild(c);
        e.appendChild(d);
    }
}

function newTourneyTab() {

    const e = document.getElementById('new-tourney');
    e.innerHTML = `
        <div id="new-tourney-contents">
            <div id="tourney-settings">
                <h1 style="text-align: center">NEW TOURNEY</h1>

                <p>Name</p>
                <input id="tourney-name" class="long-input">
                
                <p>Categories</p>
                <div style="display: flex; flex-direction: row; align-items: center; height: 2rem">
                    <div id="category-list"></div>
                    <button id="add-new-category" onclick="addCategoryField()">
                        <img src="./assets/icons/add.svg">
                    </button>
                </div>

                <br>
                <br>

                <input id="tourney-is-freestyle" type="checkbox" class="checkbox">
                <span class="text-opt">Freestyle tourney</span>
                <p class="desc">Flips max scores for technical and presentation scores to match 
                    freestyle scoring guidelines. Currently, there's no support for mixed tournaments for
                    scoring both freestyle and recognized poomsae. You can, alternatively, create two separate 
                    tournaments.
                </p> <br>
                
                <input id="tourney-do-shuffle" type="checkbox" class="checkbox">
                <span class="text-opt">Shuffle order</span>
                <p class="desc">Determines whether or not the program should shuffle the competition's order
                    or use the order given in the input lists.
                </p> <br> <br>
                

                <p>Competitors</p>
                <div id="competitor-inputs">
                </div>
            </div>

            <button id="close-new-tourney-window" onclick="hideTab('new-tourney')">
                <img src="./assets/icons/chrome-close.svg">
            </button>
        </div>
        <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">

            <span id="new-tourney-error-msgbox" style="width: 75%; color: hsl(343deg, 81%, 75%); font-style: italic; font-size: 12px;"></span>

            <div id="new-tourney-controls"> <!-- Save, Abort options... -->
                <button class="setting-btn save" onclick="createNewTourney()">Create new tournament</button>
                <button class="setting-btn">Copy from hash</button>
            </div>
        </div>
    `; // reset values (???)

    showTab('new-tourney');
}

function showTab(T) {
    document.getElementById(T).hidden = false;
}

function hideTab(T) {
    document.getElementById(T).hidden = true;
}

function activateCategory(e) {
    // search for category with id equal to e.id

    // assign queue, leaderboard and competitor
}

let activeQueue = [
    Competitor('JOHN DOE'),
    Competitor('JANE DOE'),
    Competitor('STEVE FROM MINECRAFT')
];
let activeCompetitor;

function submitEval() {
    const T = document.getElementById('scorer-techical-scores').querySelectorAll('input');
    const P = document.getElementById('scorer-presentation-scores').querySelectorAll('input');
    const D = document.getElementById('scorer-deduction-scores').querySelectorAll('input');

    let t = 0.0, p = 0.0, d = 0.0;

    for (let input of T) {
        t += input.value;
    }

    for (let input of P) {
        p += input.value;
    }

    for (let input of D) {

        if ((input.id === 'd-hs' || input.id === 'd-bs' || input.id === 'd-tk') && !input.checked) {
            d += 0.3;
        }

        if (input.id === 'd-re' && input.checked) {
            d += 0.6;
        }

        if ((input.id === 'd-ot' || input.id === 'd-sb') && input.checked) {
            d += 0.3;
        }

        if (input.id === 'd-gn') {
            d += (0.3 * input.value); 
        }

        // there's only one examinator, so no average is needed (yet)
        activeCompetitor.setScores(t, p, d);
    }



}