const numberGrid = document.getElementById('numberGrid');
const starGrid = document.getElementById('starGrid');
const statistik = document.getElementById('statistik');

for (let i = 1; i <= 50; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => toggleSelection(btn, 5, 'number-grid');
    numberGrid.appendChild(btn);
}

for (let i = 1; i <= 12; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => toggleSelection(btn, 2, 'star-grid');
    starGrid.appendChild(btn);
}

function toggleSelection(button, max, gridClass) {
    const selected = document.querySelectorAll('.' + gridClass + ' button.selected');
    if (button.classList.contains('selected')) {
        button.classList.remove('selected');
    } else {
        if (selected.length < max) {
            button.classList.add('selected');
        }
    }
}

function toggleStatistik() {
    statistik.style.display = statistik.style.display === 'none' ? 'block' : 'none';
}

function clearSelection() {
    document.querySelectorAll('button.selected').forEach(btn => btn.classList.remove('selected'));
}

function generateStatisticalTip() {
    const mainNumbers = [37, 3, 29, 35, 12];
    const stars = [11, 12];

    clearSelection();

    [...numberGrid.children].forEach(btn => {
        if (mainNumbers.includes(parseInt(btn.textContent))) btn.classList.add('selected');
    });

    [...starGrid.children].forEach(btn => {
        if (stars.includes(parseInt(btn.textContent))) btn.classList.add('selected');
    });
}
