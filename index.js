class Tourney {

    // hash: [NAME][#Categories][CategoryName][#Cont]...
    constructor(name, isFreestyle, categories) {
        
        this.id = getId(name);
        this.name = name;
        this.isFreestyle = isFreestyle;
        this.categories = categories;
        
        for (let c of categories) {
            c.id = this.id + '/' + c.id;
        }
    }
}

class Category {

    constructor(name, doShuffle, contestants) {

        if (doShuffle) {
            this.queue = shuffle(contestants);
        }
        else {
            this.queue = contestants;
        }

        this.name = name;
        this.leaderboard = [];

        this.id = getId(name); // number related to name
    }

    updateLeaderboard(upto) {
        this.leaderboard = [];

        for (let i = 0; i < upto; i++) {

            if (i === 0) {
                this.leaderboard[0] = this.queue[i];
                continue;
            }

            let j = 0;
            while (j < i) {

                if (this.leaderboard[j] < this.queue[i]) {
                    for (let r = i; r > j; r--) {
                        this.leaderboard[r] = this.leaderboard[r-1];
                    }

                    this.leaderboard[j] = this.queue[i];
                    break;
                }

                if (++j === i) {
                    this.leaderboard[j] = this.queue[i];
                }
            }
        }
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

function getId(str) {

    let val = str;

    for (char of val) {
        if (char === ' ') {
            char = '-';
        }
    }

    return val;
}

let tourneys = [];

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

        for (let g of e.querySelectorAll('input')) {
            competitors.push(new Competitor(g.value));
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
            
            g.id = G.id; // yes working maybe?
            g.className = 'category-file';
            g.innerHTML = `<img src="./assets/mocha/puppet.svg"><span>${G.name}</span>`;

            console.log(g);
            g.addEventListener("click", () => activateCategory(g));

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

let activeCategory;
let activeCompetitorIndex = 0;
let isTourneyStarted = false;

function updateScorer() {
    let e = document.getElementById('scorer');

    if (isTourneyStarted) {
        hideTab('scorer-await');
        showTab('scorer-interface');
    }
    else {
        hideTab('scorer-interface');
        showTab('scorer-await');
    }

    document.getElementById('scorer-competitor-header').textContent = activeCategory.queue[activeCompetitorIndex].name;

    for (let i = 1; i <= activeCategory.leaderboard.length; i++) {
        let e = document.createElement('div');

        console.log(activeCategory.leaderboard[i-1]);
    
        e.className = 'list-element';
        e.innerHTML = `
            <span class="text-order">${i}</span>
            <span class="text-element">${activeCategory.leaderboard[i-1].name}</span>
        `;
    
        queue.appendChild(e);
    }
}

function activateCategory(e) {
    // search for category with id equal to e.id
    console.log('tourneys:', tourneys);

    console.log(e);
    let foundValue = false;

    for (let T of tourneys) for (let cc of T.categories) {
        console.log(cc);

        if (cc.id === e.id) {
            activeCategory = cc;
            foundValue = true;
            break;
        }
    }

    if (!foundValue) {
        return;
    }

    // assign values to tab

    let queue = document.getElementById('scorer-queue');
    console.log(queue);
    queue.innerHTML = ``;

    console.log(activeCategory);

    for (let i = 1; i <= activeCategory.queue.length; i++) {
        let e = document.createElement('div');

        console.log(activeCategory.queue[i-1]);
    
        e.className = 'list-element';
        e.innerHTML = `
            <span class="text-order">${i}</span>
            <span class="text-element">${activeCategory.queue[i-1].name}</span>
        `;
    
        queue.appendChild(e);
    }

    let leaderboard = document.getElementById('scorer-leaderboard');
    leaderboard.innerHTML = ``;

    // show tab
    console.log('category opened');

    showTab('scorer');
    isTourneyStarted = false;

    updateScorer();
}

function startCategory() {
    isTourneyStarted = true;

    // go to first competitor up to eval.
    activeCompetitorIndex = 0; // start indexing from 0
    updateScorer();
}

function endCategory() {
    // add results to leaderboard
    updateScorer();
}

function submitEval() {

    const T = document.getElementById('scorer-technical-scores').querySelectorAll('input');
    const P = document.getElementById('scorer-presentation-scores').querySelectorAll('input');
    const D = document.getElementById('scorer-deduction-scores').querySelectorAll('input');

    let t = 0.0, p = 0.0, d = 0.0;

    for (let input of T) {
        t += Number(input.value);
    }

    for (let input of P) {
        p += Number(input.value);
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
    }
    
    // there's only one examinator, so no average is needed (yet)
    document.getElementById('tech-score').textContent = t.toFixed(1);
    document.getElementById('presen-score').textContent = p.toFixed(1);
    document.getElementById('deduction-score').textContent = d.toFixed(1);

    document.documentElement.style.setProperty('--font-color-scorer', 'hsl(226deg, 64%, 88%)');
    
    document.getElementById('total-score').textContent = (t + p - d).toFixed(3);
    
    activeCategory.queue[activeCompetitorIndex].setScores(t, p, d);
    
    activeCategory.updateLeaderboard(activeCompetitorIndex);
    alert('Score submitted!');
    
    
    showTab('scorer-continue-btn');
    hideTab('scorer-submit-btn');
    
    // this change happens right after you submit your score
    document.documentElement.style.setProperty('--font-color-scorer-big', 'hsl(23deg, 92%, 75%)');
    
    // this change is after all the examinators submitted
    // document.documentElement.style.setProperty('--font-color-scorer-big', 'hsl(226deg, 64%, 88%)');
}

function jumpToNext() {
    activeCompetitorIndex++;
    
    if (activeCompetitorIndex >= activeCategory.queue.length) {
        endCategory();
        return;
    }
    
    document.getElementById('tech-score').textContent = '-.-';
    document.getElementById('presen-score').textContent = '-.-';
    document.getElementById('deduction-score').textContent = '-.-';
    document.getElementById('total-score').textContent = '-.---';
    
    document.documentElement.style.setProperty('--font-color-scorer', 'hsl(240deg, 21%, 15%)');
    document.documentElement.style.setProperty('--font-color-scorer-big', 'hsl(240deg, 21%, 15%)');

    updateScorer();

    showTab('scorer-submit-btn');
    hideTab('scorer-continue-btn');
}