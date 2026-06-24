// ============================================================
// ОСНОВНАЯ ЛОГИКА РУЛЕТКИ
// ============================================================

// ===== ЗАПОЛНЕНИЕ СЕЛЕКТА КАРТ =====
document.addEventListener('DOMContentLoaded', function() {
    // Заполняем селект карт из trialsData
    var mapSelect = document.getElementById('taskMap');
    if (mapSelect && typeof trialsData !== 'undefined') {
        var mapNames = Object.keys(trialsData);
        mapNames.forEach(function(mapName) {
            var option = document.createElement('option');
            option.value = mapName;
            option.textContent = mapName;
            mapSelect.appendChild(option);
        });
    }

    // Загружаем прогресс особых испытаний
    loadTrialProgress();

    // Рендерим особые испытания
    renderSpecialTrials();

    // Запускаем диалог
    if (typeof startDialog === 'function') {
        setTimeout(startDialog, 400);
    }

    // Остальные функции
    getDailyMission();
    startTimer();
    loadTasks();
});

// ============================================================
// ЗАДАНИЕ ДНЯ
// ============================================================

function getDailyMission() {
    var saved = localStorage.getItem('dailyMission');
    var savedDate = localStorage.getItem('dailyMissionDate');
    var now = Date.now();

    if (!saved || !savedDate || (now - parseInt(savedDate) > 24 * 60 * 60 * 1000)) {
        generateNewDailyMission();
    } else {
        renderDailyMission(JSON.parse(saved));
    }
}

function generateNewDailyMission() {
    if (typeof trialsData === 'undefined' || Object.keys(trialsData).length === 0) {
        console.error('❌ trialsData не загружен!');
        return;
    }
    
    // Получаем все карты и их испытания
    var mapNames = Object.keys(trialsData);
    var allTrials = [];
    
    // Собираем все испытания со всех карт
    for (var m = 0; m < mapNames.length; m++) {
        var mapName = mapNames[m];
        var mapData = trialsData[mapName];
        
        if (mapData && mapData.trials) {
            for (var t = 0; t < mapData.trials.length; t++) {
                var trial = mapData.trials[t];
                allTrials.push({
                    mapName: mapName,
                    mapImage: mapData.image,
                    trial: trial
                });
            }
        }
    }
    
    if (allTrials.length === 0) {
        console.error('❌ Не найдено ни одного испытания!');
        return;
    }
    
    // Выбираем случайное испытание
    var randomIndex = Math.floor(Math.random() * allTrials.length);
    var selected = allTrials[randomIndex];
    
    // Выбираем случайное количество вариаторов (1-5)
    var variatorsCount = Math.floor(Math.random() * 5) + 1;
    
    // Перемешиваем вариаторы и выбираем нужное количество
    var shuffledVariators = [];
    if (typeof allVariatorsData !== 'undefined') {
        shuffledVariators = allVariatorsData.slice().sort(function() { return Math.random() - 0.5; });
    } else if (typeof variatorsData !== 'undefined') {
        shuffledVariators = variatorsData.slice().sort(function() { return Math.random() - 0.5; });
    }
    var selectedVariators = shuffledVariators.slice(0, variatorsCount);

    var mission = {
        map: { 
            name: selected.mapName, 
            image: selected.mapImage 
        },
        trial: selected.trial,
        variators: selectedVariators,
        count: variatorsCount,
        timestamp: Date.now()
    };
    
    localStorage.setItem('dailyMission', JSON.stringify(mission));
    localStorage.setItem('dailyMissionDate', Date.now().toString());
    renderDailyMission(mission);
}

function renderDailyMission(mission) {
    var content = document.getElementById('missionContent');
    if (!content) return;
    
    // Проверяем наличие данных
    if (!mission || !mission.map || !mission.trial) {
        content.innerHTML = '<div style="color: #888; text-align: center; padding: 1rem;">Задание не найдено</div>';
        return;
    }
    
    content.innerHTML = `
        <div class="mission-map">
            <img src="${mission.map.image}" alt="${mission.map.name}" onerror="this.src='https://placehold.co/160x160/1a1a2e/e16d48?text=${encodeURIComponent(mission.map.name)}'">
            <span class="map-name">${mission.map.name}</span>
        </div>
        <div class="mission-trial" style="text-align: left; max-width: 400px;">
            <div style="color: #ffbc9a; font-weight: 600; font-size: 1.1rem; margin-bottom: 0.3rem;">${mission.trial.name}</div>
            <div style="color: #c2b9d4; font-size: 0.85rem; line-height: 1.4;">${mission.trial.desc}</div>
        </div>
        <div class="mission-variators">
            <div class="variator-items">
                ${mission.variators && mission.variators.length > 0 ? mission.variators.map(function(v) {
                    return `
                        <div class="variator-item">
                            <img src="${v.image}" alt="${v.name}" title="${v.name}" onerror="this.src='https://placehold.co/75x75/1a1a2e/e16d48?text=?'">
                            <span class="var-name">${v.name}</span>
                        </div>
                    `;
                }).join('') : '<div style="color: #888; font-size: 0.8rem;">Без вариаторов</div>'}
            </div>
            <span class="variator-count">${mission.count || 0} вариатор${mission.count > 1 ? 'а' : ''}</span>
        </div>
    `;
}

// ============================================================
// ТАЙМЕР
// ============================================================

var timerInterval;

function startTimer() {
    var savedDate = localStorage.getItem('dailyMissionDate');
    if (!savedDate) { 
        generateNewDailyMission(); 
        return; 
    }
    var startTime = parseInt(savedDate);
    var totalDuration = 24 * 60 * 60 * 1000;

    function updateTimer() {
        var now = Date.now();
        var remaining = Math.max(0, totalDuration - (now - startTime));
        var hours = Math.floor(remaining / (60 * 60 * 1000));
        var minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        var seconds = Math.floor((remaining % (60 * 1000)) / 1000);

        var hoursEl = document.getElementById('hours');
        var minutesEl = document.getElementById('minutes');
        var secondsEl = document.getElementById('seconds');
        
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
    var grid = document.getElementById('specialTrialsGrid');
    if (!grid || typeof specialTrials === 'undefined') return;

    grid.innerHTML = specialTrials.map(function(trial, index) {
        return `
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
                        ${trial.variators.map(function(v) {
                            return `
                                <div class="var-block">
                                    <img src="${v.image}" alt="${v.name}" onerror="this.style.display='none'">
                                    <span class="var-name">${v.name}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="trial-conditions">
                        <div class="cond-label"><i class="fas fa-list"></i> Условия выполнения:</div>
                        <div class="cond-text">
                            ${trial.conditions.map(function(c) { return '• ' + c; }).join('<br>')}
                        </div>
                    </div>
                    <div class="trial-actions">
                        <button class="complete-btn ${trial.completed ? 'completed' : ''}" onclick="markTrialComplete(${trial.id})">
                            ${trial.completed ? '✅ Выполнено' : '📋 Отметить как выполненное'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function markTrialComplete(trialId) {
    if (typeof specialTrials === 'undefined') return;
    
    var trial = specialTrials.find(function(t) { return t.id === trialId; });
    if (!trial) return;

    if (trial.completed) return;

    trial.completed = true;

    var card = document.getElementById('trialCard_' + trialId);
    if (card) {
        var checkmark = document.getElementById('checkmark_' + trialId);
        if (checkmark) {
            checkmark.classList.add('visible');
        }

        var btn = card.querySelector('.complete-btn');
        if (btn) {
            btn.textContent = '✅ Выполнено';
            btn.classList.add('completed');
        }
    }

    saveTrialProgress();
}

function saveTrialProgress() {
    if (typeof specialTrials === 'undefined') return;
    
    var progress = specialTrials.map(function(t) {
        return {
            id: t.id,
            completed: t.completed
        };
    });
    localStorage.setItem('specialTrialsProgress', JSON.stringify(progress));
}

function loadTrialProgress() {
    if (typeof specialTrials === 'undefined') return;
    
    var saved = localStorage.getItem('specialTrialsProgress');
    if (saved) {
        try {
            var progress = JSON.parse(saved);
            progress.forEach(function(p) {
                var trial = specialTrials.find(function(t) { return t.id === p.id; });
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

var tasks = [];

function loadTasks() {
    var saved = localStorage.getItem('rouletteTasks');
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
    var grid = document.getElementById('tasksGrid');
    if (!grid) return;
    
    if (tasks.length === 0) {
        grid.innerHTML = '<div class="empty-tasks">Пока нет созданных заданий. Будьте первым!</div>';
        return;
    }
    grid.innerHTML = tasks.map(function(task) {
        return `
            <div class="task-item">
                <div class="task-name">${task.map}</div>
                <div class="task-meta"><i class="fas fa-dice"></i> ${task.variators} вар. · <i class="fas fa-tag"></i> ${task.mode} · <i class="fas fa-star"></i> ${task.difficulty}</div>
                <div class="task-meta" style="margin-top: 2px; font-style: italic;">${task.description}</div>
                <div class="task-actions">
                    <button onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i> Удалить</button>
                    <button onclick="useTask(${task.id})"><i class="fas fa-play"></i> Использовать</button>
                </div>
            </div>
        `;
    }).join('');
}

function deleteTask(id) {
    tasks = tasks.filter(function(t) { return t.id !== id; });
    saveTasks();
}

function useTask(id) {
    var task = tasks.find(function(t) { return t.id === id; });
    if (task && typeof trialsData !== 'undefined') {
        // Ищем карту в trialsData
        var mapData = null;
        var mapNames = Object.keys(trialsData);
        for (var m = 0; m < mapNames.length; m++) {
            var mapName = mapNames[m];
            if (mapName === task.map) {
                mapData = { name: mapName, image: trialsData[mapName].image };
                break;
            }
        }
        
        if (!mapData) {
            // Если карта не найдена, берем первую попавшуюся
            var firstMap = mapNames[0];
            mapData = { name: firstMap, image: trialsData[firstMap].image };
        }
        
        // Выбираем случайное испытание для этой карты
        var trials = trialsData[mapData.name].trials || [{ name: "Стандартное задание", desc: "Выполните задание на карте." }];
        var trial = trials[Math.floor(Math.random() * trials.length)];
        
        var shuffledVariators = [];
        if (typeof allVariatorsData !== 'undefined') {
            shuffledVariators = allVariatorsData.slice().sort(function() { return Math.random() - 0.5; });
        } else if (typeof variatorsData !== 'undefined') {
            shuffledVariators = variatorsData.slice().sort(function() { return Math.random() - 0.5; });
        }
        var selectedVariators = shuffledVariators.slice(0, task.variators);
        
        renderDailyMission({ 
            map: mapData, 
            trial: trial,
            variators: selectedVariators, 
            count: task.variators 
        });
        alert('✅ Задание "' + task.map + '" загружено в задание дня!');
    }
}

// ============================================================
// ОБРАБОТЧИК ФОРМЫ
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('taskForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var task = {
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
