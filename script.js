const numberGrid = document.getElementById('numberGrid');
const starGrid = document.getElementById('starGrid');
const statistik = document.getElementById('statistik');
const savedTipsList = document.getElementById('savedTipsList');
const statistikChart = document.getElementById('statistikChart');

let ziehungen = [];

fetch("euromillionen_draws_2004_2025.json")
  .then(response => response.json())
  .then(data => {
    ziehungen = data;
    console.log("Ziehungen geladen:", ziehungen.length);

    // Jetzt die Statistik berechnen
    const { topZahlen } = berechneHäufigkeit(ziehungen);

    const chart = new Chart(statistikChart, {
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
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    const listZahlen = document.getElementById("topNumbersList");
    const listSterne = document.getElementById("topStarsList");

    const { topSterne } = berechneHäufigkeit(ziehungen);

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
  });
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
            savedTipsList.appendChild(li);
        } catch (e) {
            console.warn("Fehler beim Entschlüsseln:", e);
        }
    });
}

// Sofort beim Laden der Seite ausführen
document.addEventListener("DOMContentLoaded", loadSavedTips);

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