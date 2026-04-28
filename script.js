const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSQzfZTKBqqFnG8FVx__6L9SDbfkkJGeM5mQ74xChqsWag7OB675Rh0i8KID55t7M7WnMZgwopbXJF0/pub?gid=783537768&single=true&output=csv";
let merchData = [];
let filteredData = [];
let currentIndex = 0;
let gameFilter = "";
let merchTypeFilter = "";

async function loadData() {
    try {
        const response = await fetch(sheetUrl);
        const csvText = await response.text();
        Papa.parse(csvText, {
            header: true, 
            skipEmptyLines: true, 
            transformHeader: h => h.trim(),
            complete: function(results) {
                merchData = results.data.filter(row => row["Item Name / Description"]);
                populateGameDropdown();
                applyFilters();
                updateDisplay();
            }
        });
    } catch (err) { 
        document.getElementById('item-name').innerText = "Network Error"; 
    }
}

function populateGameDropdown() {
    const gameSelect = document.getElementById('game-search');
    const uniqueGames = [...new Set(merchData.map(item => item["Game"]).filter(Boolean))].sort();
    
    // Keep the "All Games" option
    while (gameSelect.options.length > 1) {
        gameSelect.remove(1);
    }
    
    // Add unique games
    uniqueGames.forEach(game => {
        const option = document.createElement('option');
        option.value = game;
        option.textContent = game;
        gameSelect.appendChild(option);
    });
}

function applyFilters() {
    filteredData = merchData.filter(item => {
        const game = (item["Game"] || "").toLowerCase();
        const merch = (item["Merch Type"] || "").toLowerCase();
        return game.includes(gameFilter.toLowerCase()) && merch.includes(merchTypeFilter.toLowerCase());
    });
    currentIndex = 0;
}

function updateDisplay() {
    if (!filteredData.length) {
        const itemNameElement = document.getElementById('item-name');
        itemNameElement.innerText = "No Results";
        itemNameElement.className = 'item-name-heading';
        document.getElementById('item-game').innerText = "—";
        document.getElementById('item-type').innerText = "—";
        document.getElementById('item-year').innerText = "—";
        document.getElementById('item-employee').innerText = "—";
        document.getElementById('item-price').innerText = "—";
        document.getElementById('counter').innerText = "0 / 0";
        document.getElementById('display-area').innerHTML = '<div class="placeholder-text">No Results</div>';
        return;
    }
    
    const item = filteredData[currentIndex];
    const itemName = item["Item Name / Description"] || "Unnamed Item";
    
    // Update Text Data
    const itemNameElement = document.getElementById('item-name');
    itemNameElement.innerText = itemName;
    
    // Apply large class if name is longer than 50 characters
    if (itemName.length > 50) {
        itemNameElement.className = 'item-name-heading item-name-heading-large';
    } else {
        itemNameElement.className = 'item-name-heading';
    }
    document.getElementById('item-game').innerText = item["Game"] || "—";
    document.getElementById('item-type').innerText = item["Merch Type"] || "—";
    document.getElementById('item-year').innerText = item["Year"] || "—";
    document.getElementById('item-employee').innerText = item["Employee Only"] || "No";
    document.getElementById('item-price').innerText = item["Price"] || "—";
    document.getElementById('counter').innerText = `${currentIndex + 1} / ${filteredData.length}`;

    const displayArea = document.getElementById('display-area');
    let imgValue = item["Image Preview Link"] ? item["Image Preview Link"].trim() : "";

    // Reset square and add loading pulse
    displayArea.innerHTML = '';
    displayArea.classList.add('loading');

    if (imgValue !== "") {
        // Logic: If starts with http, use web link. 
        // Else, use images/[game-folder]/[filename]
        const finalSrc = imgValue.toLowerCase().startsWith('http') ? imgValue : "images/" + imgValue;

        const img = new Image();
        img.src = finalSrc;
        img.referrerPolicy = "no-referrer";
        
        img.onload = () => {
            displayArea.classList.remove('loading');
            displayArea.innerHTML = `<img src="${finalSrc}" alt="${itemName}">`;
        };

        img.onerror = () => {
            displayArea.classList.remove('loading');
            showPlaceholder(itemName);
        };
    } else {
        displayArea.classList.remove('loading');
        showPlaceholder(itemName);
    }
}

function showPlaceholder(name) {
    document.getElementById('display-area').innerHTML = `<div class="placeholder-text">${name}</div>`;
}

// Navigation Controls
function nextItem() { 
    if (filteredData.length === 0) return;
    currentIndex = (currentIndex + 1) % filteredData.length; 
    updateDisplay(); 
}

function prevItem() { 
    if (filteredData.length === 0) return;
    currentIndex = (currentIndex - 1 + filteredData.length) % filteredData.length; 
    updateDisplay(); 
}

// Search Filter Handlers
document.getElementById('game-search').addEventListener('change', (e) => {
    gameFilter = e.target.value;
    applyFilters();
    updateDisplay();
});

document.getElementById('merch-search').addEventListener('input', (e) => {
    merchTypeFilter = e.target.value;
    applyFilters();
    updateDisplay();
});

document.getElementById('clear-filters').addEventListener('click', () => {
    gameFilter = "";
    merchTypeFilter = "";
    document.getElementById('game-search').value = "";
    document.getElementById('merch-search').value = "";
    applyFilters();
    updateDisplay();
});

document.getElementById('nextBtn').addEventListener('click', nextItem);
document.getElementById('prevBtn').addEventListener('click', prevItem);

document.addEventListener('keydown', (e) => {
    if (e.key === "ArrowRight") nextItem();
    if (e.key === "ArrowLeft") prevItem();
});

loadData();
