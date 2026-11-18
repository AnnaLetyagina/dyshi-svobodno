const APP_URL = "https://annaletyagina.github.io/dyshi-svobodno/";
const FIREBASE_URL = "https://dyshi-svobodno-9b06f-default-rtdb.europe-west1.firebasedatabase.app/";

function initQR() {
    const qrImg = document.getElementById("qrImage");
    if (qrImg) {
        qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=" + encodeURIComponent(APP_URL);
    }
}

async function loadByCode() {
    const code = document.getElementById("codeInput").value.trim();
    const banner = document.getElementById("importBanner");
    const statsEl = document.getElementById("stats");
    const listEl = document.getElementById("resultsList");

    if (!code || code.length !== 4) {
        alert("Введите 4-значный код!");
        return;
    }

    banner.style.display = "none";
    statsEl.innerHTML = "";
    listEl.innerHTML = `<div class="empty">Загрузка...</div>`;

    try {
        const response = await fetch(`${FIREBASE_URL}/results/${code}.json`);
        if (!response.ok) throw new Error("Network error");
        const data = await response.json();

        if (!data) {
            banner.style.display = "block";
            banner.style.background = "#7f1d1d";
            banner.style.borderColor = "#ef4444";
            banner.style.color = "#fecaca";
            banner.innerHTML = `❌ Код <strong>${code}</strong> не найден. Попросите студента открыть раздел «Поделиться с психологом» в приложении.`;
            listEl.innerHTML = "";
            return;
        }

        const items = Array.isArray(data) ? data : [data];

        banner.style.display = "block";
        banner.style.background = "#14532d";
        banner.style.borderColor = "#22c55e";
        banner.style.color = "#dcfce7";
        banner.innerHTML = `✅ Найдены результаты для кода <strong>${code}</strong>: ${items.length} записей`;

        const modules = {};
        items.forEach(r => { modules[r.module] = (modules[r.module] || 0) + 1; });

        statsEl.innerHTML = `<div class="stat-card"><div class="stat-num">${items.length}</div><div class="stat-label">Записей</div></div> ${Object.entries(modules).map(([m, c]) => `<div class="stat-card"><div class="stat-num">${c}</div><div class="stat-label">${m}</div></div>`).join("")}`;

        let html = `<table class="results-table"><thead><tr><th>Дата</th><th>Модуль</th><th>Результат</th><th>Доп.</th></tr></thead><tbody>`;
        items.forEach(r => {
            html += `<tr><td>${r.date || ""}</td><td><strong>${r.module || ""}</strong></td><td>${r.result || ""}</td><td style="color:#94a3b8; font-size:0.85rem;">${r.extra || ""}</td></tr>`;
        });
        html += `</tbody></table>`;
        listEl.innerHTML = html;

    } catch (e) {
        banner.style.display = "block";
        banner.style.background = "#7f1d1d";
        banner.style.borderColor = "#ef4444";
        banner.style.color = "#fecaca";
        banner.innerHTML = `❌ Ошибка подключения к базе данных. Проверьте настройку FIREBASE_URL в коде.`;
        listEl.innerHTML = "";
    }
}

function clearAll() {
    if (!confirm("Удалить все результаты с экрана?")) return;
    document.getElementById("stats").innerHTML = "";
    document.getElementById("resultsList").innerHTML = `<div class="empty">Результаты очищены.</div>`;
    const banner = document.getElementById("importBanner");
    banner.style.display = "block";
    banner.style.background = "#7f1d1d";
    banner.style.borderColor = "#ef4444";
    banner.style.color = "#fecaca";
    banner.innerHTML = `🗑️ Все результаты удалены.`;
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { initQR(); });
} else {
    initQR();
}
