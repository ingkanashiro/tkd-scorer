function addCategoryField() {
    const input = document.createElement('input');

    input.className = 'dyn-input';
    input.placeholder = '...';

    const list = document.getElementById('competitor-inputs')
    input.competitors = document.createElement('div');

    input.competitors.innerHTML = `
        <div class="category-input">
            <div class="category-header">
                <div style="display: flex; align-items: center; gap: 4px;">
                    <img src="./icons/dark/debug-step-into.svg" style="width:16px">
                    <span class="category-name">...</span>
                </div>
                <button onclick="addCompetitorField(this)">
                    <img src="./icons/dark/add.svg">
                </button>
            </div>
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

    const button = document.getElementById('add-new-category');
    button.parentNode.insertBefore(input, button);


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