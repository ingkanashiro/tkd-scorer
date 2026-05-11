class Tourney {

    // hash: [NAME][#Categories][CategoryName][#Cont]...
    constructor(name, isFreestyle, categories) {
        
        this.id = name;
        this.isFreestyle = true;
        this.categories = true;
        
    }
}

class Category {

    constructor(name, doShuffle, contestants) {

        let list = contestants;

        if (doShuffle) {
            list = shuffle(list);
        }

        this.id = name;
        this.queue = list;
        this.leaderboard = [];
    }
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

    console.log('creating tourney...');

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

    let categories = [];

    for (let e of document.getElementsByClassName('category-input')) {
        
        /*
        <div class="category-header">
            <div style="display: flex; align-items: center; gap: 4px;">
                <img src="./assets/icons/debug-step-into.svg" style="width:16px">
                <span class="category-name">...</span>
            </div>
            <button onclick="addCompetitorField(this)">
                <img src="./assets/icons/add.svg">
            </button>
        </div>
        */

        let name = e.querySelector('.category-name').textContent;
        let competitors = [];

        for (let g of e.getElementsByClassName('input-line').value) {
            competitors.push(g);
        }

        let c = new Category(name, doShuffle, competitors);
    }

    let tourney = new Tourney(name, isFreestyle, categories);

    alert('Tourney created!');
    return;
}