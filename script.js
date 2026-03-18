const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSQzfZTKBqqFnG8FVx__6L9SDbfkkJGeM5mQ74xChqsWag7OB675Rh0i8KID55t7M7WnMZgwopbXJF0/pub?gid=783537768&single=true&output=csv";
let merchData = [];
let currentIndex = 0;

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
                updateDisplay();
            }
        });
    } catch (err) { 
        document.getElementById('item-name').innerText = "Network Error"; 
    }
}

function updateDisplay() {
    if (!merchData.length) return;
    const item = merchData[currentIndex];
    const itemName = item["Item Name / Description"] || "Unnamed Item";
    
    // Update Text Data
    document.getElementById('item-name').innerText = itemName;
    document.getElementById('item-game').innerText = item["Game"] || "—";
    document.getElementById('item-type').innerText = item["Merch Type"] || "—";
    document.getElementById('item-year').innerText = item["Year"] || "—";
    document.getElementById('item-employee').innerText = item["Employee Only"] || "No";
    document.getElementById('item-price').innerText = item["Price"] || "—";
    document.getElementById('counter').innerText = `${currentIndex + 1} / ${merchData.length}`;

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
    if (merchData.length === 0) return;
    currentIndex = (currentIndex + 1) % merchData.length; 
    updateDisplay(); 
}

function prevItem() { 
    if (merchData.length === 0) return;
    currentIndex = (currentIndex - 1 + merchData.length) % merchData.length; 
    updateDisplay(); 
}

document.getElementById('nextBtn').addEventListener('click', nextItem);
document.getElementById('prevBtn').addEventListener('click', prevItem);

document.addEventListener('keydown', (e) => {
    if (e.key === "ArrowRight") nextItem();
    if (e.key === "ArrowLeft") prevItem();
});

loadData();
