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
            competitors.push(g.value);
        }

        let c = new Category(name, doShuffle, competitors);
    }

    let tourney = new Tourney(name, isFreestyle, categories);
    tourneys.push(tourney);

    alert('Tourney created!');
    updateExplorer();
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
        for (let G of T.categories) {
            let g = document.createElement('button');
            
            g.className = 'category-file';
            g.innerHTML = `<img src="./assets/mocha/puppet.svg"><span>${g.name}</span>`
        }
    }

    /*
        <div class="tourney-file">
            <div class="tourney-file-header">
                <img src="./assets/mocha/nim.svg">
                <span>New tournament</span>
            </div>
            <div class="category-files">
                <button class="category-file"><img src="./assets/mocha/puppet.svg"><span>Under 17 M</span></button>
                <button class="category-file"><img src="./assets/mocha/puppet.svg"><span>Over 17 M</span></button>
                <button class="category-file"><img src="./assets/mocha/puppet.svg"><span>Under 17 F</span></button>
            </div>
        </div>
    */


}