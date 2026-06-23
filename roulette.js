// ============================================================
// ОСНОВНАЯ ЛОГИКА РУЛЕТКИ
// ============================================================

// ===== ЗАПОЛНЕНИЕ СЕЛЕКТА КАРТ =====
document.addEventListener('DOMContentLoaded', function() {
    const mapSelect = document.getElementById('taskMap');
    if (mapSelect && typeof mapsData !== 'undefined') {
        mapsData.forEach(map => {
            const option = document.createElement('option');
            option.value = map.name;
            option.textContent = map.name;
            mapSelect.appendChild(option);
        });
    }

    // Загружаем прогресс особых испытаний
    loadTrialProgress();

    // Рендерим особые испытания
    renderSpecialTrials();

    // Запускаем диалог
    setTimeout(startDialog, 400);

    // Остальные функции
    getDailyMission();
    startTimer();
    loadTasks();
});

// ============================================================
// ЗАДАНИЕ ДНЯ
// ============================================================

function getDailyMission() {
    const saved = localStorage.getItem('dailyMission');
    const savedDate = localStorage.getItem('dailyMissionDate');
    const now = Date.now();

    if (!saved || !savedDate || (now - parseInt(savedDate) > 24 * 60 * 60 * 1000)) {
        generateNewDailyMission();
    } else {
        renderDailyMission(JSON.parse(saved));
    }
}

function generateNewDailyMission() {
    if (typeof mapsData === 'undefined' || typeof variatorsData === 'undefined') return;
    
    const mapData = mapsData[Math.floor(Math.random() * mapsData.length)];
    const variatorsCount = Math.floor(Math.random() * 5) + 1;
    const shuffled = [...variatorsData].sort(() => Math.random() - 0.5);
    const selectedVariators = shuffled.slice(0, variatorsCount);

    const mission = { map: mapData, variators: selectedVariators, count: variatorsCount, timestamp: Date.now() };
    localStorage.setItem('dailyMission', JSON.stringify(mission));
    localStorage.setItem('dailyMissionDate', Date.now().toString());
    renderDailyMission(mission);
}

function renderDailyMission(mission) {
    const content = document.getElementById('missionContent');
    if (!content) return;
    
    content.innerHTML = `
        <div class="mission-map">
            <img src="${mission.map.image}" alt="${mission.map.name}" onerror="this.src='https://placehold.co/160x160/1a1a2e/e16d48?text=${encodeURIComponent(mission.map.name)}'">
            <span class="map-name">${mission.map.name}</span>
        </div>
        <div class="mission-variators">
            <div class="variator-items">
                ${mission.variators.map(v => `
                    <div class="variator-item">
                        <img src="${v.image}" alt="${v.name}" title="${v.name}" onerror="this.src='https://placehold.co/75x75/1a1a2e/e16d48?text=?'">
                        <span class="var-name">${v.name}</span>
                    </div>
                `).join('')}
            </div>
            <span class="variator-count">${mission.count} вариатор${mission.count > 1 ? 'а' : ''}</span>
        </div>
    `;
}

// ============================================================
// ТАЙМЕР
// ============================================================

let timerInterval;

function startTimer() {
    const savedDate = localStorage.getItem('dailyMissionDate');
    if (!savedDate) { generateNewDailyMission(); return; }
    const startTime = parseInt(savedDate);
    const totalDuration = 24 * 60 * 60 * 1000;

    function updateTimer() {
        const now = Date.now();
        const remaining = Math.max(0, totalDuration - (now - startTime));
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

        if (remaining <= 0) {
            clearInterval(timerInterval);
            generateNewDailyMission();
            startTimer();
        }
    }
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

// ============================================================
// ОСОБЫЕ ИСПЫТАНИЯ
// ============================================================

function renderSpecialTrials() {
    const grid = document.getElementById('specialTrialsGrid');
    if (!grid || typeof specialTrials === 'undefined') return;

    grid.innerHTML = specialTrials.map((trial, index) => `
        <div class="trial-card" id="trialCard_${trial.id}">
            <div class="completion-check ${trial.completed ? 'visible' : ''}" id="checkmark_${trial.id}">
                <img src="images/галочка.png" alt="Выполнено" onerror="this.src='https://placehold.co/36x36/2ecc71/2ecc71?text=✓'">
            </div>
            <div class="trial-header">
                <div class="trial-icon" id="trialIcon_${trial.id}">
                    <img src="${trial.icon}" alt="${trial.title}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-star icon-fallback\\'></i>'">
                </div>
                <div class="trial-title">
                    <h3>${trial.title}</h3>
                </div>
            </div>
            <div class="trial-body">
                <div class="trial-map">
                    <img src="${trial.mapImage}" alt="${trial.map}" onerror="this.src='https://placehold.co/70x70/1a1a2e/e16d48?text=?'">
                    <span class="map-name">${trial.map}</span>
                </div>
                <div class="trial-desc">${trial.description}</div>
                <div class="trial-variators">
                    ${trial.variators.map(v => `
                        <div class="var-block">
                            <img src="${v.image}" alt="${v.name}" onerror="this.style.display='none'">
                            <span class="var-name">${v.name}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="trial-conditions">
                    <div class="cond-label"><i class="fas fa-list"></i> Условия выполнения:</div>
                    <div class="cond-text">
                        ${trial.conditions.map(c => `• ${c}`).join('<br>')}
                    </div>
                </div>
                <div class="trial-actions">
                    <button class="complete-btn ${trial.completed ? 'completed' : ''}" onclick="markTrialComplete(${trial.id})">
                        ${trial.completed ? '✅ Выполнено' : '📋 Отметить как выполненное'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function markTrialComplete(trialId) {
    if (typeof specialTrials === 'undefined') return;
    
    const trial = specialTrials.find(t => t.id === trialId);
    if (!trial) return;

    if (trial.completed) return;

    trial.completed = true;

    const card = document.getElementById(`trialCard_${trialId}`);
    if (card) {
        const checkmark = document.getElementById(`checkmark_${trialId}`);
        if (checkmark) {
            checkmark.classList.add('visible');
        }

        const btn = card.querySelector('.complete-btn');
        if (btn) {
            btn.textContent = '✅ Выполнено';
            btn.classList.add('completed');
        }
    }

    saveTrialProgress();
}

function saveTrialProgress() {
    if (typeof specialTrials === 'undefined') return;
    
    const progress = specialTrials.map(t => ({
        id: t.id,
        completed: t.completed
    }));
    localStorage.setItem('specialTrialsProgress', JSON.stringify(progress));
}

function loadTrialProgress() {
    if (typeof specialTrials === 'undefined') return;
    
    const saved = localStorage.getItem('specialTrialsProgress');
    if (saved) {
        try {
            const progress = JSON.parse(saved);
            progress.forEach(p => {
                const trial = specialTrials.find(t => t.id === p.id);
                if (trial) {
                    trial.completed = p.completed;
                }
            });
        } catch (e) {
            console.warn('Ошибка загрузки прогресса:', e);
        }
    }
}

// ============================================================
// ЗАДАНИЯ ПОЛЬЗОВАТЕЛЕЙ
// ============================================================

let tasks = [];

function loadTasks() {
    const saved = localStorage.getItem('rouletteTasks');
    if (saved) {
        try { tasks = JSON.parse(saved); } catch (e) { tasks = []; }
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('rouletteTasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    const grid = document.getElementById('tasksGrid');
    if (!grid) return;
    
    if (tasks.length === 0) {
        grid.innerHTML = '<div class="empty-tasks">Пока нет созданных заданий. Будьте первым!</div>';
        return;
    }
    grid.innerHTML = tasks.map(task => `
        <div class="task-item">
            <div class="task-name">${task.map}</div>
            <div class="task-meta"><i class="fas fa-dice"></i> ${task.variators} вар. · <i class="fas fa-tag"></i> ${task.mode} · <i class="fas fa-star"></i> ${task.difficulty}</div>
            <div class="task-meta" style="margin-top: 2px; font-style: italic;">${task.description}</div>
            <div class="task-actions">
                <button onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i> Удалить</button>
                <button onclick="useTask(${task.id})"><i class="fas fa-play"></i> Использовать</button>
            </div>
        </div>
    `).join('');
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
}

function useTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task && typeof mapsData !== 'undefined' && typeof variatorsData !== 'undefined') {
        const mapData = mapsData.find(m => m.name === task.map) || mapsData[0];
        const shuffled = [...variatorsData].sort(() => Math.random() - 0.5);
        const selectedVariators = shuffled.slice(0, task.variators);
        renderDailyMission({ map: mapData, variators: selectedVariators, count: task.variators });
        alert(`✅ Задание "${task.map}" загружено в задание дня!`);
    }
}

// ============================================================
// ОБРАБОТЧИК ФОРМЫ
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('taskForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const task = {
                id: Date.now(),
                map: document.getElementById('taskMap').value,
                variators: parseInt(document.getElementById('taskVariators').value),
                mode: document.getElementById('taskMode').value,
                difficulty: document.getElementById('taskDifficulty').value,
                description: document.getElementById('taskDescription').value || 'Без описания',
                createdAt: new Date().toLocaleString()
            };
            tasks.unshift(task);
            saveTasks();
            this.reset();
            document.getElementById('taskDescription').value = '';
        });
    }
});
