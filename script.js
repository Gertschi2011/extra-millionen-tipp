// Darkmode: Automatisch & manuell
function setDarkModeBySystem() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.body.classList.toggle('dark-mode', savedTheme === "dark");
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}
setDarkModeBySystem();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setDarkModeBySystem);

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem("theme", isDark ? "dark" : "light");
}

// Zahlen- und Sternzahlen-Buttons anzeigen und auswählbar machen
const numberGrid = document.getElementById('numberGrid');
const starGrid = document.getElementById('starGrid');
let selectedNumbers = [];
let selectedStars = [];

function renderNumberGrid() {
    numberGrid.innerHTML = '';
    for (let i = 1; i <= 50; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = selectedNumbers.includes(i) ? 'selected' : '';
        btn.onclick = () => {
            if (selectedNumbers.includes(i)) {
                selectedNumbers = selectedNumbers.filter(n => n !== i);
            } else if (selectedNumbers.length < 5) {
                selectedNumbers.push(i);
            }
            renderNumberGrid();
        };
        numberGrid.appendChild(btn);
    }
}

function renderStarGrid() {
    starGrid.innerHTML = '';
    for (let i = 1; i <= 12; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = selectedStars.includes(i) ? 'selected' : '';
        btn.onclick = () => {
            if (selectedStars.includes(i)) {
                selectedStars = selectedStars.filter(n => n !== i);
            } else if (selectedStars.length < 2) {
                selectedStars.push(i);
            }
            renderStarGrid();
        };
        starGrid.appendChild(btn);
    }
}

// Initiales Rendern
renderNumberGrid();
renderStarGrid();

// Optional: clearSelection Funktion
function clearSelection() {
    selectedNumbers = [];
    selectedStars = [];
    renderNumberGrid();
    renderStarGrid();
}

const statistik = document.getElementById('statistik') || document.createElement('div');
const savedTipsList = document.getElementById('savedTipsList');
const statistikChart = document.getElementById('statistikChart');

let ziehungen = [];

// Lade Ziehungsdaten und rendere Archiv & Heatmap
importDraws();

function importDraws() {
    fetch("ziehungen.json")
        .then(res => {
            if (!res.ok) throw new Error("JSON nicht gefunden");
            return res.json();
        })
        .then(data => {
            ziehungen = data.filter(draw => Array.isArray(draw.numbers) && Array.isArray(draw.stars));
            renderHeatmap();
            renderStatistics();
        })
        .catch(err => {
            console.warn("Fallback auf historische Daten:", err);
            if (typeof historicalDraws !== 'undefined' && Array.isArray(historicalDraws)) {
                ziehungen = historicalDraws.filter(draw => Array.isArray(draw.numbers) && Array.isArray(draw.stars));
                renderHeatmap();
                renderStatistics();
            } else {
                console.error("Keine gültigen Ziehungsdaten verfügbar.");
            }
        });
}

// Heatmap-Visualisierung mit Chart.js
function renderHeatmap() {
    if (!ziehungen.length) return;
    // Zähle, wie oft jede Zahl gezogen wurde (1-50)
    const numberCounts = Array(50).fill(0);
    ziehungen.forEach(draw => {
        draw.numbers.forEach(num => numberCounts[num - 1]++);
    });

    // Erstelle Chart
    const container = document.getElementById('heatmapChartContainer');
    // Entferne überflüssige Canvas-Elemente, falls vorhanden
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    container.innerHTML = '<canvas id="heatmapCanvas" width="400" height="120"></canvas>';
    const ctx = document.getElementById('heatmapCanvas').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Array.from({length: 50}, (_, i) => (i + 1).toString()),
            datasets: [{
                label: 'Ziehungs-Häufigkeit',
                data: numberCounts,
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                borderColor: 'rgba(56, 142, 60, 1)',
                borderWidth: 1
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}



const listZahlen = document.getElementById("topNumbersList");
const listSterne = document.getElementById("topStarsList");

function renderStatistics() {
    const { topZahlen, topSterne } = berechneHäufigkeit(ziehungen);

    if (statistikChart && Chart.getChart(statistikChart)) {
        Chart.getChart(statistikChart).destroy();
    }

    new Chart(statistikChart, {
        type: 'bar',
        data: {
            labels: topZahlen.map(z => z.num.toString()),
            datasets: [{
                label: 'Häufigkeit',
                data: topZahlen.map(z => z.count),
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                borderColor: 'rgba(56, 142, 60, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: { y: { beginAtZero: true } }
        }
    });

    listZahlen.innerHTML = '';
    listSterne.innerHTML = '';
    topZahlen.forEach(z => {
        const li = document.createElement("li");
        li.textContent = `${z.num} (${z.count}x)`;
        listZahlen.appendChild(li);
    });
    topSterne.forEach(s => {
        const li = document.createElement("li");
        li.textContent = `${s.num} (${s.count}x)`;
        listSterne.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadSavedTips();

  // Dark Mode beim Laden aktivieren
  const savedTheme = localStorage.getItem("theme");
  if (document.body && savedTheme === "dark") {
      document.body.classList.add("dark-mode");
  }
});

function checkAccessCode() {
    const input = document.getElementById("accessCodeInput").value;
    if (input === "JuliaK") {
        document.getElementById("accessOverlay").style.display = "none";
    } else {
        alert("Falscher Code!");
    }
}

function toggleStatistik() {
    statistik.style.display = statistik.style.display === 'none' ? 'block' : 'none';
}

function generateStatisticalTip() {
    selectedNumbers = [37, 3, 29, 35, 12];
    selectedStars = [11, 12];
    renderNumberGrid();
    renderStarGrid();
}

function saveTip() {
    const selectedMain = [...numberGrid.children].filter(btn => btn.classList.contains('selected')).map(btn => btn.textContent);
    const selectedStars = [...starGrid.children].filter(btn => btn.classList.contains('selected')).map(btn => btn.textContent);

    if (selectedMain.length !== 5 || selectedStars.length !== 2) {
        alert("Bitte wähle genau 5 Zahlen und 2 Sterne aus.");
        return;
    }

    const tip = `Zahlen: ${selectedMain.join(", ")} | Sterne: ${selectedStars.join(", ")}`;
    const encrypted = CryptoJS.AES.encrypt(tip, "geheim").toString();

    let tipItem = document.createElement("li");
    tipItem.textContent = tip;
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.className = "btn btn-sm btn-danger ms-2";
    deleteBtn.onclick = () => {
        savedTipsList.removeChild(tipItem);
        const gespeicherte = JSON.parse(localStorage.getItem("tipps") || "[]");
        gespeicherte.splice(gespeicherte.indexOf(encrypted), 1);
        localStorage.setItem("tipps", JSON.stringify(gespeicherte));
    };
    tipItem.appendChild(deleteBtn);
    savedTipsList.appendChild(tipItem);

    let gespeicherte = JSON.parse(localStorage.getItem("tipps") || "[]");
    gespeicherte.push(encrypted);
    localStorage.setItem("tipps", JSON.stringify(gespeicherte));
}
function loadSavedTips() {
    const gespeicherte = JSON.parse(localStorage.getItem("tipps") || "[]");
    gespeicherte.forEach(enc => {
        try {
            const entschluesselt = CryptoJS.AES.decrypt(enc, "geheim").toString(CryptoJS.enc.Utf8);
            const li = document.createElement("li");
            li.textContent = entschluesselt;
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "🗑️";
            deleteBtn.className = "btn btn-sm btn-danger ms-2";
            deleteBtn.onclick = () => {
                savedTipsList.removeChild(li);
                const gespeicherte = JSON.parse(localStorage.getItem("tipps") || "[]");
                gespeicherte.splice(gespeicherte.indexOf(enc), 1);
                localStorage.setItem("tipps", JSON.stringify(gespeicherte));
            };
            li.appendChild(deleteBtn);
            savedTipsList.appendChild(li);
        } catch (e) {
            console.warn("Fehler beim Entschlüsseln:", e);
        }
    });
}

function berechneHäufigkeit(draws) {
  const zahlenHäufigkeit = Array(51).fill(0);
  const sterneHäufigkeit = Array(13).fill(0);

  draws.forEach(draw => {
    draw.numbers.forEach(n => zahlenHäufigkeit[n]++);
    draw.stars.forEach(s => sterneHäufigkeit[s]++);
  });

  const topZahlen = zahlenHäufigkeit
    .map((count, num) => ({ num, count }))
    .slice(1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topSterne = sterneHäufigkeit
    .map((count, num) => ({ num, count }))
    .slice(1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { topZahlen, topSterne };
}

function checkTipAgainstDraws() {
    const selectedMain = [...numberGrid.children].filter(btn => btn.classList.contains('selected')).map(btn => parseInt(btn.textContent));
    const selectedStars = [...starGrid.children].filter(btn => btn.classList.contains('selected')).map(btn => parseInt(btn.textContent));

    if (selectedMain.length !== 5 || selectedStars.length !== 2) {
        alert("Bitte wähle genau 5 Zahlen und 2 Sterne aus.");
        return;
    }

    if (!ziehungen || ziehungen.length === 0) {
        alert("Ziehungsdaten noch nicht geladen.");
        return;
    }

    const match = ziehungen.find(draw =>
        selectedMain.every(n => draw.numbers.includes(n)) &&
        selectedStars.every(s => draw.stars.includes(s))
    );

    if (match) {
        alert(`Diese Kombination wurde bereits gezogen am ${match.date}!`);
    } else {
        alert("Diese Kombination wurde bisher noch nie gezogen.");
    }
}

function exportTipsAsCSV() {
    const gespeicherte = JSON.parse(localStorage.getItem("tipps") || "[]");
    const csvRows = ["Tipp"];
    gespeicherte.forEach(enc => {
        try {
            const tip = CryptoJS.AES.decrypt(enc, "geheim").toString(CryptoJS.enc.Utf8);
            csvRows.push(`"${tip}"`);
        } catch (e) {}
    });
    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'euromillionen_tipps.csv';
    a.click();
    URL.revokeObjectURL(url);
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
      .then(() => console.log("Service Worker registriert"))
      .catch(err => console.error("Service Worker Fehler:", err));
}