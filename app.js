const FIREBASE_URL = "https://dyshi-svobodno-9b06f-default-rtdb.europe-west1.firebasedatabase.app/";
const appEl = document.getElementById("app");

function saveResult(module, result, extra = "") {
    const results = JSON.parse(localStorage.getItem("student_results") || "[]");
    results.push({
        date: new Date().toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        module, result, extra
    });
    localStorage.setItem("student_results", JSON.stringify(results));
    syncToFirebase(results);
}

async function syncToFirebase(results) {
    let code = localStorage.getItem("student_code");
    if (!code) {
        code = Math.floor(1000 + Math.random() * 9000).toString();
        localStorage.setItem("student_code", code);
    }
    try {
        await fetch(`${FIREBASE_URL}/results/${code}.json`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(results)
        });
    } catch (e) {
        console.error("Firebase sync error:", e);
    }
}

function navigate(route) {
    appEl.innerHTML = "";
    if (route === "menu") renderMenu();
    if (route === "quest") renderQuest();
    if (route === "quiz") renderQuiz();
    if (route === "clicker") renderClicker();
    if (route === "scenario") renderScenario();
    if (route === "share") renderShare();
    window.scrollTo(0, 0);
}

function renderMenu() {
    appEl.innerHTML = `
        <h1>Дыши свободно</h1>
        <p class="sub">Интерактивная программа о вреде вейпов.</p>
        <button class="menu-card" onclick="navigate('quest')">
            <span class="ico">🎮</span><span class="txt"><strong>Квест: 24 часа</strong><small>Проживи день без срывов</small></span>
        </button>
        <button class="menu-card" onclick="navigate('quiz')">
            <span class="ico">🎯</span><span class="txt"><strong>Миф или правда</strong><small>Проверь знания</small></span>
        </button>
        <button class="menu-card" onclick="navigate('clicker')">
            <span class="ico">👆</span><span class="txt"><strong>Кликер: Очисти лёгкие</strong><small>Мини-игра</small></span>
        </button>
        <button class="menu-card" onclick="navigate('scenario')">
            <span class="ico">🎭</span><span class="txt"><strong>Ситуации: Твой выбор</strong><small>Интерактивная история</small></span>
        </button>
        <button class="menu-card" onclick="navigate('share')">
            <span class="ico">🔢</span><span class="txt"><strong>Поделиться с психологом</strong><small>Получить код</small></span>
        </button>`;
}

let questState = { step: 0, craving: 20, energy: 80 };
const QUEST_STEPS = [
    { time: "08:00", text: "Утро. Ты просыпаешься и чувствуешь лёгкую тягу закурить.", choices: [
        { text: "Выпить стакан воды и сделать зарядку", craving: -15, energy: 10 },
        { text: "Залипнуть в телефон в кровати", craving: 10, energy: -5 }
    ]},
    { time: "13:00", text: "Учёба. Сложная контрольная, стресс зашкаливает.", choices: [
        { text: "Съесть шоколадку и глубоко подышать", craving: -10, energy: 5 },
        { text: "Вспомнить, как вейп 'помогает' от стресса", craving: 25, energy: -10 }
    ]},
    { time: "18:00", text: "Прогулка с друзьями. Кто-то достаёт вейп.", choices: [
        { text: "Предложить сыграть в мяч или настолку", craving: -20, energy: 15 },
        { text: "Отойти в сторону, чтобы не вдыхать пар", craving: -5, energy: -5 }
    ]},
    { time: "22:00", text: "Вечер. Ты дома, чувствуешь усталость.", choices: [
        { text: "Лечь спать пораньше", craving: -10, energy: 20 },
        { text: "Сидеть в соцсетях допоздна", craving: 15, energy: -15 }
    ]}
];

function renderQuest() {
    if (questState.craving >= 100) {
        saveResult("Квест: 24 часа", "Срыв", "Тяга достигла 100%");
        appEl.innerHTML = `<button class="back" onclick="navigate('menu')">← В меню</button><h2>😔 Срыв</h2><p class="sub">Тяга стала слишком сильной. Но каждый новый день — это новый шанс!</p><button class="btn" onclick="resetQuest()">Попробовать снова</button><button class="btn secondary" onclick="navigate('share')">🔢 Получить код</button>`;
        return;
    }
    if (questState.step >= QUEST_STEPS.length) {
        saveResult("Квест: 24 часа", "Победа!", `Энергия: ${questState.energy}%, Тяга: ${questState.craving}%`);
        appEl.innerHTML = `<button class="back" onclick="navigate('menu')">← В меню</button><h2>🏆 Победа!</h2><p class="sub">Ты успешно прожил 24 часа без вейпа! Твои лёгкие благодарят тебя.</p><div class="card"><div class="row"><span>Итоговая энергия</span><strong>${questState.energy}%</strong></div><div class="row"><span>Итоговая тяга</span><strong>${questState.craving}%</strong></div></div><button class="btn" onclick="navigate('share')">🔢 Получить код</button><button class="btn secondary" onclick="resetQuest()">Пройти ещё раз</button>`;
        return;
    }
    const step = QUEST_STEPS[questState.step];
    appEl.innerHTML = `<button class="back" onclick="navigate('menu')">← В меню</button> <h2>Квест: 24 часа без вейпа</h2> <div class="quest-stats"> <div class="stat-box"><span>⚡ Энергия</span><div class="bar"><div class="bar-fill energy" style="width:${questState.energy}%"></div></div></div> <div class="stat-box"><span>🔥 Тяга</span><div class="bar"><div class="bar-fill craving" style="width:${questState.craving}%"></div></div></div> </div> <div class="card scenario-card"><div class="time-badge">${step.time}</div><p class="scenario-text">${step.text}</p></div> <div class="choices-list">${step.choices.map((c, i) => `<button class="choice-btn" onclick="makeQuestChoice(${i})">${c.text}</button>`).join("")}</div>`;
}

function makeQuestChoice(i) {
    const c = QUEST_STEPS[questState.step].choices[i];
    questState.craving = Math.max(0, Math.min(100, questState.craving + c.craving));
    questState.energy = Math.max(0, Math.min(100, questState.energy + c.energy));
    questState.step++;
    renderQuest();
}
function resetQuest() { questState = { step: 0, craving: 20, energy: 80 }; renderQuest(); }

let qIndex = 0, qScore = 0;
const QUIZ = [
    { q: "Вейп безопаснее обычных сигарет?", a: ["Да", "Нет, вред сопоставим", "Он безвреден"], c: 1, f: "В паре вейпа есть альдегиды и металлы." },
    { q: "Никотин — это просто привычка?", a: ["Да", "Нет, это физическая зависимость", "Зависит от человека"], c: 1, f: "Никотин вызывает зависимость на уровне рецепторов." },
    { q: "Сколько смолы оседает за год курения?", a: ["50 г", "200 г", "Более 500 г"], c: 2, f: "До 500-700 г смолы в год." },
    { q: "Вейп помогает бросить?", a: ["Да", "Нет, двойная зависимость", "Только без никотина"], c: 1, f: "Большинство совмещают." },
    { q: "Сколько веществ в паре вейпа?", a: ["5-10", "50", "Более 200"], c: 2, f: "Более 200 соединений." },
    { q: "Курение влияет на мозг?", a: ["Нет", "Да, память", "При больших дозах"], c: 1, f: "Влияет на префронтальную кору." },
    { q: "Пассивный пар опасен?", a: ["Нет", "Да", "Для детей"], c: 1, f: "Содержит никотин." },
    { q: "Через сколько лет риск инфаркта растёт?", a: ["5-10", "20-30", "1-2"], c: 0, f: "В 2-4 раза уже через 5 лет." },
    { q: "Организм восстанавливается?", a: ["Через год", "Через 20 минут", "Через 10 лет"], c: 1, f: "Пульс через 20 мин." },
    { q: "Что помогает бросить?", a: ["Сила воли", "Замена + поддержка", "Ничего"], c: 1, f: "Замена ритуала." }
];

function renderQuiz() { qIndex = 0; qScore = 0; showQuestion(); }
function showQuestion() {
    if (qIndex >= QUIZ.length) return showQuizResult();
    const q = QUIZ[qIndex];
    appEl.innerHTML = `<button class="back" onclick="navigate('menu')">← Назад</button><p class="sub">Вопрос ${qIndex + 1} из ${QUIZ.length}</p><h2>${q.q}</h2><div id="answers"></div>`;
    const ansBox = document.getElementById("answers");
    q.a.forEach((text, i) => {
        const b = document.createElement("button");
        b.className = "answer-btn"; b.textContent = text;
        b.onclick = () => pickAnswer(i, q);
        ansBox.appendChild(b);
    });
}
function pickAnswer(idx, q) {
    document.querySelectorAll(".answer-btn").forEach((b, i) => {
        b.disabled = true;
        if (i === q.c) b.classList.add("correct");
        else if (i === idx) b.classList.add("wrong");
    });
    if (idx === q.c) qScore++;
    const fact = document.createElement("div");
    fact.className = "verdict";
    fact.innerHTML = `<strong>${idx === q.c ? "✅ Верно!" : "❌ Не совсем"}</strong><br>${q.f}`;
    appEl.appendChild(fact);
    const next = document.createElement("button");
    next.className = "btn";
    next.textContent = qIndex + 1 === QUIZ.length ? "Результат" : "Дальше";
    next.onclick = () => { qIndex++; showQuestion(); };
    appEl.appendChild(next);
}
function showQuizResult() {
    saveResult("Миф или правда", qScore + " из " + QUIZ.length);
    appEl.innerHTML = `<button class="back" onclick="navigate('menu')">← Назад</button><h2>Результат</h2><div class="card" style="text-align:center; font-size:1.5rem; font-weight:bold; color:#38bdf8;">${qScore} из ${QUIZ.length}</div><p class="verdict">${qScore >= 8 ? "Отлично!" : "Есть над чем подумать."}</p><button class="btn" onclick="navigate('share')">🔢 Получить код</button><button class="btn secondary" onclick="renderQuiz()">Пройти заново</button>`;
}

let clickerTaps = 0;
const MAX_TAPS = 30;
function renderClicker() {
    const progress = Math.min(100, (clickerTaps / MAX_TAPS) * 100);
    const filterVal = 100 - progress;
    const isDone = clickerTaps >= MAX_TAPS;
    if (isDone && clickerTaps === MAX_TAPS) saveResult("Кликер: Очисти лёгкие", "100% очищено", `Тапов: ${clickerTaps}`);
    appEl.innerHTML = `<button class="back" onclick="navigate('menu')">← В меню</button> <h2>👆 Кликер: Очисти лёгкие</h2> <p class="sub">Нажимай на кнопку, чтобы очистить лёгкие от токсинов!</p> <div class="clicker-wrap"> <svg class="clicker-lung" style="filter: grayscale(${filterVal}%) sepia(${filterVal}%) hue-rotate(330deg) saturate(200%);" viewBox="0 0 24 24" fill="#fca5a5" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"> <path d="M12 2v20M8.5 5.5A4.5 4.5 0 0 0 4 10v5a4 4 0 0 0 4 4h1a2 2 0 0 0 2-2v-5a4.5 4.5 0 0 0-2.5-6.5zM15.5 5.5A4.5 4.5 0 0 1 20 10v5a4 4 0 0 1-4 4h-1a2 2 0 0 1-2-2v-5a4.5 4.5 0 0 1 2.5-6.5z"></path> </svg> <div class="bar-label">Очищено: ${clickerTaps} / ${MAX_TAPS}</div> <div class="bar"><div class="bar-fill oxygen" style="width:${progress}%"></div></div> </div> ${isDone ? `<div class="verdict" style="text-align:center; border-color:#22c55e;"><strong>🎉 Лёгкие полностью очищены!</strong><br>Ты молодец, так держать!</div> <button class="btn" onclick="navigate('share')">🔢 Получить код</button> <button class="btn secondary" onclick="resetClicker()">Начать заново</button>` : `<button class="btn clicker-btn" onclick="tapLung()">💨 Очистить (-1 токсин)</button>`}`;
}
function tapLung() { clickerTaps++; renderClicker(); }
function resetClicker() { clickerTaps = 0; renderClicker(); }

let scenarioNodeId = 1;
const SCENARIOS = [
    { id: 1, text: "Перемена. Твой хороший друг достаёт вейп и протягивает тебе: «Да ладно, один раз не считается, попробуй!»", choices: [
        { text: "Взять и сделать затяг", nextId: 2 },
        { text: "Вежливо отказаться: «Нет, спасибо, я не курю»", nextId: 3 },
        { text: "Отшутиться: «Я на спортивном питании, мне это не совместимо»", nextId: 4 }
    ]},
    { id: 2, isEnd: true, resultText: "😔 Срыв", effect: "Ты почувствовал резкое головокружение и кашель. Зависимость сделала ещё один шаг вперёд, а друг посмотрел на это с лёгкой насмешкой." },
    { id: 3, isEnd: true, resultText: "✅ Твёрдая позиция", effect: "Друг пожал плечами: «Ок, как хочешь». Ты сохранил свои лёгкие, чистоту и самоуважение." },
    { id: 4, isEnd: true, resultText: "🏆 Супер-победа", effect: "Друг рассмеялся: «Ладно, тогда пойдём лучше сок выпьем». Ты уверенно контролируешь ситуацию и перевёл тему!" }
];
function renderScenario() {
    const node = SCENARIOS.find(s => s.id === scenarioNodeId);
    if (!node) return;
    if (node.isEnd) {
        saveResult("Ситуации: Твой выбор", node.resultText, node.effect);
        appEl.innerHTML = `<button class="back" onclick="navigate('menu')">← В меню</button><h2>🎭 Итог ситуации</h2><div class="card scenario-card"><p class="scenario-text"><strong>${node.resultText}</strong><br><br>${node.effect}</p></div><button class="btn" onclick="navigate('share')">🔢 Получить код</button><button class="btn secondary" onclick="resetScenario()">Пройти заново</button>`;
        return;
    }
    appEl.innerHTML = `<button class="back" onclick="navigate('menu')">← В меню</button><h2>🎭 Ситуации: Твой выбор</h2><div class="card scenario-card"><p class="scenario-text">${node.text}</p></div><div class="choices-list">${node.choices.map(c => `<button class="choice-btn" onclick="makeScenarioChoice(${c.nextId})">${c.text}</button>`).join("")}</div>`;
}
function makeScenarioChoice(nextId) { scenarioNodeId = nextId; renderScenario(); }
function resetScenario() { scenarioNodeId = 1; renderScenario(); }

function renderShare() {
    const results = JSON.parse(localStorage.getItem("student_results") || "[]");
    if (results.length === 0) {
        appEl.innerHTML = `<button class="back" onclick="navigate('menu')">← Назад</button><h1>Поделиться с психологом</h1><p class="sub">Сначала пройди хотя бы один модуль.</p><button class="btn" onclick="navigate('menu')">В меню</button>`;
        return;
    }

    let studentCode = localStorage.getItem("student_code");
    if (!studentCode) {
        studentCode = Math.floor(1000 + Math.random() * 9000).toString();
        localStorage.setItem("student_code", studentCode);
    }
    syncToFirebase(results);

    appEl.innerHTML = `
        <button class="back" onclick="navigate('menu')">← Назад</button>
        <h1>🔢 Твой код для психолога</h1>
        <p class="sub">Покажи этот код психологу. Он введёт его на своём компьютере и увидит твои результаты.</p>
        <div class="code-display">${studentCode}</div>
        <p class="sub" style="text-align:center; margin-top:10px;">${results.length} записей привязано к этому коду</p>
        <button class="btn secondary" style="margin-top:15px;" onclick="if(confirm('Сгенерировать новый код? Старый код перестанет работать.')){localStorage.removeItem('student_code'); navigate('share');}">🔄 Сгенерировать новый код</button>
    `;
}

navigate("menu");