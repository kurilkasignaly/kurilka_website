// ============================================================
// ЛОГИКА ЭСКАЛАЦИИ
// ============================================================

let escState = {
    level: 1,
    playerCount: 0,
    players: [],
    equipSelections: {},
    ampSelections: {},
    usedAmps: {},
    unlockedAmps: {},
    allAmpsUsed: {},
    currentStep: 1,
    map: null,
    trial: null,
    difficulty: null,
    variators: [],
    isFirstRun: true
};

let escTimerInterval;

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С АМФАМИ =====
function getAmpsByCategory(category) {
    if (typeof ampsData === 'undefined') return [];
    return ampsData.filter(amp => amp.category === category);
}

function getUnlockedAmpsByCategory(playerIndex, category) {
    const unlocked = escState.unlockedAmps[playerIndex] || [];
    return unlocked.filter(ampName => {
        if (typeof ampsData === 'undefined') return false;
        const amp = ampsData.find(a => a.name === ampName);
        return amp && amp.category === category;
    });
}

function getAvailableAmpsByCategory(playerIndex, category) {
    const used = escState.usedAmps[playerIndex] || [];
    const categoryAmps = getAmpsByCategory(category);
    return categoryAmps.filter(amp => !used.includes(amp.name));
}

function isCategoryComplete(playerIndex, category) {
    const categoryAmps = getAmpsByCategory(category);
    const used = escState.usedAmps[playerIndex] || [];
    return categoryAmps.every(amp => used.includes(amp.name));
}

function areAllCategoriesComplete(playerIndex) {
    if (typeof ampCategories === 'undefined') return false;
    return ampCategories.every(cat => isCategoryComplete(playerIndex, cat));
}

function checkAllAmpsUsed(playerIndex) {
    return areAllCategoriesComplete(playerIndex);
}

function getAmpForCategory(playerIndex, category) {
    const selections = escState.ampSelections[playerIndex] || {};
    return selections[category] || null;
}

function unlockAmpForPlayer(playerIndex, ampName) {
    if (!escState.unlockedAmps[playerIndex]) {
        escState.unlockedAmps[playerIndex] = [];
    }
    if (!escState.unlockedAmps[playerIndex].includes(ampName)) {
        escState.unlockedAmps[playerIndex].push(ampName);
    }
}

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ВАРИАТОРАМИ =====
function getVariatorsForLevel(level) {
    if (typeof allVariatorsData === 'undefined') return [];
    
    const baseVariators = allVariatorsData.filter(v => 
        v.name !== "Ультра II" && v.name !== "Психохирургия"
    );
    
    if (level === 1) {
        const shuffled = [...baseVariators].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 1);
    }
    
    if (level >= 2 && level <= 5) {
        const count = Math.floor(Math.random() * 2) + 2;
        const shuffled = [...baseVariators].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    
    if (level >= 6 && level <= 15) {
        const count = Math.floor(Math.random() * 2) + 3;
        const shuffled = [...baseVariators].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    
    if (level >= 16 && level <= 20) {
        const count = Math.floor(Math.random() * 3) + 4;
        const shuffled = [...baseVariators].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    
    if (level >= 21) {
        const ultra = allVariatorsData.find(v => v.name === "Ультра II");
        const psycho = allVariatorsData.find(v => v.name === "Психохирургия");
        const others = allVariatorsData.filter(v => 
            v.name !== "Ультра II" && v.name !== "Психохирургия"
        );
        const shuffled = others.sort(() => Math.random() - 0.5);
        return [ultra, psycho, ...shuffled];
    }
    
    return [];
}

function getDifficultyByLevel(level) {
    if (level >= 1 && level <= 5) {
        return { name: "Начальная", class: "level-difficulty-intro" };
    } else if (level >= 6 && level <= 15) {
        return { name: "Нормальная", class: "level-difficulty-standard" };
    } else if (level >= 16 && level <= 20) {
        return { name: "Высокая", class: "level-difficulty-intensive" };
    } else {
        return { name: "Психохирургия", class: "level-difficulty-psycho" };
    }
}

// ============================================================
// НАВИГАЦИЯ
// ============================================================

function goToEscStep(step) {
    escState.currentStep = step;
    document.querySelectorAll('.step-container').forEach(el => el.classList.add('hidden'));
    document.getElementById('escStep1').classList.add('hidden');
    document.getElementById('escStep2').classList.add('hidden');
    document.getElementById('escStep3').classList.add('hidden');
    document.getElementById('escStep4').classList.add('hidden');
    
    const result = document.getElementById('escResult');
    if (result) {
        result.classList.remove('active');
        result.style.display = 'none';
    }

    const stepMap = {
        1: 'escStep1',
        2: 'escStep2',
        3: 'escStep3',
        4: 'escStep4'
    };

    const target = document.getElementById(stepMap[step]);
    if (target) target.classList.remove('hidden');
}

function updateLevelCounter() {
    const levelNum = document.getElementById('levelNumber');
    const levelDiff = document.getElementById('levelDifficulty');
    const difficulty = getDifficultyByLevel(escState.level);
    
    if (levelNum) levelNum.textContent = escState.level;
    if (levelDiff) {
        levelDiff.textContent = difficulty.name;
        levelDiff.className = `level-difficulty ${difficulty.class}`;
    }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ ЭСКАЛАЦИИ
// ============================================================

function initEscalation() {
    // Шаг 1: Выбор игроков
    const options = document.querySelectorAll('#escPlayerCountOptions .player-count-btn');
    options.forEach(btn => {
        btn.addEventListener('click', function() {
            options.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            escState.playerCount = parseInt(this.dataset.count);
            document.getElementById('escStep1Next').disabled = false;
        });
    });

    document.getElementById('escStep1Next').addEventListener('click', function() {
        goToEscStep(2);
        renderEscPlayerNames();
    });

    // Шаг 2: Имена
    document.getElementById('escStep2Back').addEventListener('click', function() { goToEscStep(1); });
    document.getElementById('escStep2Next').addEventListener('click', function() {
        const inputs = document.querySelectorAll('#escPlayerNameInputs input');
        escState.players = [];
        inputs.forEach((input, i) => {
            escState.players.push(input.value.trim() || `Игрок ${i + 1}`);
        });
        // Инициализируем массивы для игроков
        escState.players.forEach((_, idx) => {
            if (!escState.usedAmps[idx]) escState.usedAmps[idx] = [];
            if (!escState.ampSelections[idx]) escState.ampSelections[idx] = {};
            if (!escState.unlockedAmps[idx]) escState.unlockedAmps[idx] = [];
            escState.allAmpsUsed[idx] = false;
        });
        goToEscStep(3);
        renderEscEquipment();
    });

    // Шаг 3: Снаряжение
    document.getElementById('escStep3Back').addEventListener('click', function() { goToEscStep(2); });
    document.getElementById('escStep3Next').addEventListener('click', function() { 
        goToEscStep(4);
        renderEscAmps();
    });

    // Шаг 4: Ампы (первый выбор)
    document.getElementById('escStep4Back').addEventListener('click', function() { goToEscStep(3); });
    document.getElementById('escStep4Next').addEventListener('click', function() {
        // Сохраняем выбранные ампы и разблокируем их
        escState.players.forEach((_, idx) => {
            const selected = escState.ampSelections[idx] || {};
            Object.entries(selected).forEach(([category, ampName]) => {
                if (ampName) {
                    if (!escState.usedAmps[idx]) escState.usedAmps[idx] = [];
                    if (!escState.usedAmps[idx].includes(ampName)) {
                        escState.usedAmps[idx].push(ampName);
                    }
                    unlockAmpForPlayer(idx, ampName);
                }
            });
        });
        // Генерируем первое испытание
        generateEscResult();
    });

    // Кнопка "Далее" для следующего уровня
    document.getElementById('escNextLevelBtn').addEventListener('click', function() {
        escState.level++;
        updateLevelCounter();
        
        // Проверяем, все ли категории завершены для всех игроков
        const allComplete = escState.players.every((_, idx) => areAllCategoriesComplete(idx));
        
        if (allComplete) {
            alert('Не осталось выбора улучшения. Все улучшения были применены.');
            generateEscResult();
        } else {
            showBreakModal();
        }
    });

    // Кнопка выхода
    document.getElementById('escExitBtn').addEventListener('click', function() {
        document.getElementById('confirmModal').classList.add('active');
    });

    // Перезапуск
    document.getElementById('escRestartBtn').addEventListener('click', function() {
        resetEscalation();
    });
}

// ============================================================
// ОТРИСОВКА ШАГОВ
// ============================================================

function renderEscPlayerNames() {
    const container = document.getElementById('escPlayerNameInputs');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < escState.playerCount; i++) {
        const row = document.createElement('div');
        row.className = 'input-row';
        row.innerHTML = `
            <label><i class="fas fa-user"></i> Игрок ${i + 1}</label>
            <input type="text" placeholder="Введите ник..." id="escPlayerName_${i}" value="${escState.players[i] || ''}">
        `;
        container.appendChild(row);
    }
    const firstInput = container.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 300);
}

function renderEscEquipment() {
    const container = document.getElementById('escStep3Content');
    if (!container || typeof equipmentData === 'undefined') return;
    container.innerHTML = '';
    
    escState.players.forEach((player, idx) => {
        const section = document.createElement('div');
        section.style.marginBottom = '1.8rem';
        section.style.borderBottom = '1px solid rgba(220,90,50,0.1)';
        section.style.paddingBottom = '1.2rem';
        
        const title = document.createElement('div');
        title.style.fontWeight = '600';
        title.style.color = '#ffbc9a';
        title.style.marginBottom = '0.8rem';
        title.style.fontSize = '1.05rem';
        title.style.textAlign = 'center';
        title.innerHTML = `<i class="fas fa-user"></i> ${player}`;
        section.appendChild(title);
        
        const wrapper = document.createElement('div');
        wrapper.className = 'selection-wrapper';
        
        const grid = document.createElement('div');
        grid.className = 'selection-grid';
        
        const shuffled = [...equipmentData].sort(() => Math.random() - 0.5);
        const selectedEquip = shuffled.slice(0, 3);
        
        selectedEquip.forEach(eq => {
            const item = document.createElement('div');
            item.className = 'selection-item';
            item.dataset.player = idx;
            item.dataset.equip = eq.name;
            const isSelected = escState.equipSelections[idx] === eq.name;
            if (isSelected) item.classList.add('selected');
            
            item.innerHTML = `
                <div class="check-mark"><i class="fas fa-check-circle"></i></div>
                <img src="${eq.image}" alt="${eq.name}" onerror="this.src='https://placehold.co/90x90/1a1a2e/e16d48?text=?'">
                <div class="item-name">${eq.name}</div>
            `;
            
            item.addEventListener('click', function() {
                const parent = this.closest('.selection-grid');
                parent.querySelectorAll('.selection-item').forEach(el => el.classList.remove('selected'));
                this.classList.add('selected');
                escState.equipSelections[idx] = eq.name;
                checkEscEquipReady();
            });
            
            grid.appendChild(item);
        });
        
        wrapper.appendChild(grid);
        section.appendChild(wrapper);
        container.appendChild(section);
    });
    checkEscEquipReady();
}

function checkEscEquipReady() {
    const allSelected = escState.players.every((_, idx) => escState.equipSelections[idx] !== undefined);
    document.getElementById('escStep3Next').disabled = !allSelected;
}

function renderEscAmps() {
    const container = document.getElementById('escStep4Content');
    if (!container || typeof ampsData === 'undefined' || typeof ampCategories === 'undefined') return;
    container.innerHTML = '';
    
    escState.players.forEach((player, idx) => {
        const section = document.createElement('div');
        section.style.marginBottom = '1.8rem';
        section.style.borderBottom = '1px solid rgba(220,90,50,0.1)';
        section.style.paddingBottom = '1.2rem';
        
        const title = document.createElement('div');
        title.style.fontWeight = '600';
        title.style.color = '#ffbc9a';
        title.style.marginBottom = '0.8rem';
        title.style.fontSize = '1.05rem';
        title.style.textAlign = 'center';
        title.innerHTML = `<i class="fas fa-user"></i> ${player}`;
        section.appendChild(title);

        // Выбираем случайную категорию для первого выбора
        const availableCategories = ampCategories.filter(cat => !isCategoryComplete(idx, cat));
        const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        
        const catLabel = document.createElement('div');
        catLabel.style.cssText = 'text-align: center; color: #e16d48; font-size: 0.85rem; margin-bottom: 0.8rem;';
        catLabel.innerHTML = `<i class="fas fa-tag"></i> Категория: ${randomCategory}`;
        section.appendChild(catLabel);
        
        const wrapper = document.createElement('div');
        wrapper.className = 'selection-wrapper';
        
        const grid = document.createElement('div');
        grid.className = 'selection-grid';
        
        const availableAmps = getAvailableAmpsByCategory(idx, randomCategory);
        const shuffled = availableAmps.sort(() => Math.random() - 0.5);
        const selectedAmps = shuffled.slice(0, 3);
        
        selectedAmps.forEach(amp => {
            const item = document.createElement('div');
            item.className = 'selection-item';
            item.dataset.player = idx;
            item.dataset.amp = amp.name;
            const currentAmp = escState.ampSelections[idx]?.[randomCategory];
            const isSelected = currentAmp === amp.name;
            if (isSelected) item.classList.add('selected');
            
            item.innerHTML = `
                <div class="check-mark"><i class="fas fa-check-circle"></i></div>
                <img src="${amp.image}" alt="${amp.name}" onerror="this.src='https://placehold.co/90x90/1a1a2e/e16d48?text=?'">
                <div class="item-name">${amp.name}</div>
                <div style="font-size: 0.6rem; color: #666;">${amp.category}</div>
            `;
            
            item.addEventListener('click', function() {
                const parent = this.closest('.selection-grid');
                parent.querySelectorAll('.selection-item').forEach(el => el.classList.remove('selected'));
                this.classList.add('selected');
                if (!escState.ampSelections[idx]) escState.ampSelections[idx] = {};
                escState.ampSelections[idx][randomCategory] = amp.name;
                unlockAmpForPlayer(idx, amp.name);
                checkEscAmpsReady();
            });
            
            grid.appendChild(item);
        });
        
        wrapper.appendChild(grid);
        section.appendChild(wrapper);
        container.appendChild(section);
    });
    checkEscAmpsReady();
}

function checkEscAmpsReady() {
    let allSelected = true;
    escState.players.forEach((_, idx) => {
        const availableCategories = ampCategories.filter(cat => !isCategoryComplete(idx, cat));
        if (availableCategories.length > 0) {
            const hasSelection = availableCategories.some(cat => escState.ampSelections[idx]?.[cat]);
            if (!hasSelection) allSelected = false;
        }
    });
    document.getElementById('escStep4Next').disabled = !allSelected;
}

// ============================================================
// ГЕНЕРАЦИЯ РЕЗУЛЬТАТА
// ============================================================

function generateEscResult() {
    if (typeof mapsData === 'undefined' || typeof trialsData === 'undefined' || typeof variatorsData === 'undefined') return;
    
    const mapData = mapsData[Math.floor(Math.random() * mapsData.length)];
    escState.map = mapData;
    
    const trials = trialsData[mapData.name] || [{ name: "Стандартное задание", desc: "Выполните задание на карте." }];
    const trial = trials[Math.floor(Math.random() * trials.length)];
    escState.trial = trial;
    
    const difficulty = getDifficultyByLevel(escState.level);
    escState.difficulty = difficulty.name;
    escState.variators = getVariatorsForLevel(escState.level);

    document.querySelectorAll('.step-container').forEach(el => el.classList.add('hidden'));
    const resultContainer = document.getElementById('escResult');
    if (resultContainer) {
        resultContainer.style.display = 'block';
        resultContainer.classList.add('active');
    }

    // Карта
    const resultMap = document.getElementById('escResultMap');
    if (resultMap) {
        resultMap.innerHTML = `
            <img class="map-image" src="${mapData.image}" alt="${mapData.name}" onerror="this.src='https://placehold.co/160x160/1a1a2e/e16d48?text=${encodeURIComponent(mapData.name)}'">
            <div class="result-map-info">
                <div class="map-label"><i class="fas fa-map"></i> Карта</div>
                <div class="map-name">${mapData.name}</div>
                <div class="trial-name">${trial.name}</div>
                <div class="trial-desc">${trial.desc}</div>
                <div class="map-meta">
                    <span class="map-meta-item"><strong>№ Эскалационной терапии:</strong> #${escState.level}</span>
                    <span class="map-meta-item"><strong>Сложность:</strong> ${escState.difficulty}</span>
                    <span class="map-meta-item"><strong>Вариаторов:</strong> ${escState.variators.length}</span>
                </div>
            </div>
        `;
    }

    // Вариаторы
    const resultVariators = document.getElementById('escResultVariators');
    if (resultVariators) {
        resultVariators.innerHTML = escState.variators.map(v => `
            <div class="var-item">
                <img src="${v.image}" alt="${v.name}" onerror="this.src='https://placehold.co/60x60/1a1a2e/e16d48?text=?'">
                <span class="var-name">${v.name}</span>
            </div>
        `).join('');
    }

    // Игроки
    renderEscResultPlayers();
    
    if (resultContainer) {
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ============================================================
// ОТОБРАЖЕНИЕ ИГРОКОВ В РЕЗУЛЬТАТЕ
// ============================================================

function renderEscResultPlayers() {
    const container = document.getElementById('escResultPlayers');
    if (!container) return;
    
    let playersHtml = '';
    escState.players.forEach((player, idx) => {
        const equip = escState.equipSelections[idx] || 'Не выбрано';
        const amps = escState.ampSelections[idx] || {};
        const equipData = typeof equipmentData !== 'undefined' ? equipmentData.find(e => e.name === equip) : null;
        const allUsed = checkAllAmpsUsed(idx);
        
        playersHtml += `
            <div class="player-result">
                <div class="player-name"><i class="fas fa-user-circle"></i> ${player}</div>
                <div class="player-equip">
                    ${equipData ? `<img src="${equipData.image}" alt="${equip}" onerror="this.style.display='none'">` : ''}
                    <span class="label">СНАРЯЖЕНИЕ:</span>
                    <span class="value">${equip}</span>
                </div>
                <div style="margin-top: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                        <span style="color: #888; font-size: 0.75rem; font-weight: 500;"><i class="fas fa-capsules"></i> УЛУЧШЕНИЯ:</span>
                        ${!allUsed ? `<span style="color: #e16d48; font-size: 0.65rem;">Нажмите на категорию для смены</span>` : ''}
                    </div>
                    <div class="player-amps-categories">
                        ${ampCategories.map(category => {
                            const ampName = getAmpForCategory(idx, category);
                            const ampData = typeof ampsData !== 'undefined' ? ampsData.find(a => a.name === ampName) : null;
                            const isComplete = isCategoryComplete(idx, category);
                            
                            return `
                                <div class="amp-category-block" onclick="${!allUsed ? `openAmpModal(${idx}, '${category}')` : ''}" style="cursor: ${!allUsed ? 'pointer' : 'default'};">
                                    <div class="category-header">
                                        <span class="category-name">${category}</span>
                                        ${!allUsed ? `<button class="category-change-btn" onclick="event.stopPropagation(); openAmpModal(${idx}, '${category}')" title="Сменить ампу"><i class="fas fa-sync-alt"></i></button>` : ''}
                                    </div>
                                    ${isComplete ? 
                                        `<div class="category-complete"><i class="fas fa-check-circle"></i> Все ампы использованы</div>` :
                                        (ampData ? 
                                            `<div class="category-amp-name">${ampData.name}</div>` :
                                            `<div class="category-amp-empty">Не выбрана</div>`
                                        )
                                    }
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                ${allUsed ? `
                    <div style="margin-top: 0.8rem; color: #2ecc71; font-size: 0.8rem; font-weight: 500; text-align: center;">
                        <i class="fas fa-check-circle"></i> Все улучшения применены
                    </div>
                ` : ''}
            </div>
        `;
    });

    container.innerHTML = playersHtml;
}

// ============================================================
// МОДАЛЬНОЕ ОКНО ДЛЯ СМЕНЫ АМФЫ
// ============================================================

let modalState = {
    playerIndex: null,
    selectedAmp: null,
    selectedCategory: "Инструмент"
};

function initAmpModal() {
    const modal = document.getElementById('ampModal');
    const closeBtn = document.getElementById('ampModalClose');
    const confirmBtn = document.getElementById('ampModalConfirm');

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (modal) modal.classList.remove('active');
        });
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            if (modalState.playerIndex !== null && modalState.selectedAmp && modalState.selectedCategory) {
                const idx = modalState.playerIndex;
                const category = modalState.selectedCategory;
                
                if (!escState.ampSelections[idx]) escState.ampSelections[idx] = {};
                
                const oldAmp = escState.ampSelections[idx][category];
                if (oldAmp && escState.usedAmps[idx]) {
                    escState.usedAmps[idx] = escState.usedAmps[idx].filter(a => a !== oldAmp);
                }
                
                escState.ampSelections[idx][category] = modalState.selectedAmp;
                
                if (!escState.usedAmps[idx]) escState.usedAmps[idx] = [];
                if (!escState.usedAmps[idx].includes(modalState.selectedAmp)) {
                    escState.usedAmps[idx].push(modalState.selectedAmp);
                }
                unlockAmpForPlayer(idx, modalState.selectedAmp);

                renderEscResultPlayers();
                if (modal) modal.classList.remove('active');
            }
        });
    }
}

function openAmpModal(playerIndex, category) {
    if (checkAllAmpsUsed(playerIndex)) {
        alert('Все улучшения уже применены. Смена амп невозможна.');
        return;
    }

    if (isCategoryComplete(playerIndex, category)) {
        alert('Все ампы в этой категории уже использованы.');
        return;
    }

    const playerName = escState.players[playerIndex];
    const currentAmp = getAmpForCategory(playerIndex, category);
    
    modalState.playerIndex = playerIndex;
    modalState.selectedCategory = category;
    modalState.selectedAmp = currentAmp;

    const playerNameEl = document.getElementById('ampModalPlayerName');
    if (playerNameEl) {
        playerNameEl.textContent = `${playerName} — ${category}`;
    }

    // Создаем вкладки категорий
    const tabsContainer = document.getElementById('ampCategoryTabs');
    if (tabsContainer) {
        tabsContainer.innerHTML = '';
        
        const availableCategories = ampCategories.filter(cat => !isCategoryComplete(playerIndex, cat));
        
        if (availableCategories.length === 0) {
            const grid = document.getElementById('ampModalGrid');
            if (grid) {
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; color: #2ecc71; padding: 2rem;">
                        <i class="fas fa-check-circle" style="font-size: 2rem;"></i>
                        <div style="margin-top: 0.5rem;">Все улучшения применены</div>
                    </div>
                `;
            }
            const confirmBtn = document.getElementById('ampModalConfirm');
            if (confirmBtn) confirmBtn.disabled = true;
            const modal = document.getElementById('ampModal');
            if (modal) modal.classList.add('active');
            return;
        }

        availableCategories.forEach(cat => {
            const tab = document.createElement('button');
            tab.textContent = cat;
            tab.dataset.category = cat;
            if (cat === category) {
                tab.classList.add('active');
            }
            tab.addEventListener('click', function() {
                if (tabsContainer) {
                    tabsContainer.querySelectorAll('button').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    const newCategory = this.dataset.category;
                    modalState.selectedCategory = newCategory;
                    modalState.selectedAmp = getAmpForCategory(playerIndex, newCategory);
                    renderAmpModalGrid(playerIndex, newCategory);
                }
            });
            tabsContainer.appendChild(tab);
        });
    }

    renderAmpModalGrid(playerIndex, category);
    const modal = document.getElementById('ampModal');
    if (modal) modal.classList.add('active');
}

function renderAmpModalGrid(playerIndex, category) {
    const grid = document.getElementById('ampModalGrid');
    if (!grid || typeof ampsData === 'undefined') return;
    
    grid.innerHTML = '';

    const categoryAmps = getAmpsByCategory(category);
    const used = escState.usedAmps[playerIndex] || [];
    const unlocked = escState.unlockedAmps[playerIndex] || [];
    const currentAmp = getAmpForCategory(playerIndex, category);

    let hasAvailable = false;

    categoryAmps.forEach(amp => {
        const isUsed = used.includes(amp.name);
        const isUnlocked = unlocked.includes(amp.name);
        const isCurrent = currentAmp === amp.name;
        
        const isAvailable = isUnlocked || isCurrent;

        const item = document.createElement('div');
        item.className = 'amp-modal-item';
        
        if (isCurrent) {
            item.classList.add('selected');
        }

        if (!isAvailable) {
            item.classList.add('locked');
            item.innerHTML = `
                <div class="lock-overlay">
                    <i class="fas fa-lock"></i>
                    <span>Засекречено</span>
                </div>
                <img src="${amp.image}" alt="${amp.name}" style="opacity: 0.3;" onerror="this.src='https://placehold.co/65x65/1a1a2e/e16d48?text=?'">
                <div class="amp-name">${amp.name}</div>
                <div class="amp-category-label">${amp.category}</div>
                <div class="amp-status locked">🔒 Засекречено</div>
            `;
        } else {
            hasAvailable = true;
            item.innerHTML = `
                <img src="${amp.image}" alt="${amp.name}" onerror="this.src='https://placehold.co/65x65/1a1a2e/e16d48?text=?'">
                <div class="amp-name">${amp.name}</div>
                <div class="amp-category-label">${amp.category}</div>
                <div class="amp-status ${isCurrent ? 'current' : 'available'}">
                    ${isCurrent ? '✓ Текущая' : 'Доступна'}
                </div>
            `;
            item.addEventListener('click', function() {
                if (this.classList.contains('locked')) return;
                grid.querySelectorAll('.amp-modal-item').forEach(el => el.classList.remove('selected'));
                this.classList.add('selected');
                modalState.selectedAmp = amp.name;
                const confirmBtn = document.getElementById('ampModalConfirm');
                if (confirmBtn) confirmBtn.disabled = false;
            });
        }
        grid.appendChild(item);
    });

    if (!hasAvailable) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.cssText = 'grid-column: 1 / -1; text-align: center; color: #888; padding: 2rem;';
        emptyMsg.textContent = 'В этой категории нет доступных амп. Выберите другую категорию.';
        grid.appendChild(emptyMsg);
    }

    const confirmBtn = document.getElementById('ampModalConfirm');
    if (confirmBtn) confirmBtn.disabled = true;
}

// ============================================================
// ПЕРЕРЫВ (выбор амп)
// ============================================================

function showBreakModal() {
    let hasAvailable = false;
    escState.players.forEach((_, idx) => {
        if (!areAllCategoriesComplete(idx)) {
            hasAvailable = true;
        }
    });

    if (!hasAvailable) {
        alert('Не осталось выбора улучшения. Все улучшения были применены.');
        generateEscResult();
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'amp-modal-overlay active';
    overlay.id = 'breakModal';
    overlay.style.display = 'flex';
    overlay.style.zIndex = '1500';

    overlay.innerHTML = `
        <div class="amp-modal">
            <div class="amp-modal-header">
                <h2><i class="fas fa-coffee"></i> ПЕРЕРЫВ — выбор амп</h2>
                <button class="amp-modal-close" id="breakModalClose">&times;</button>
            </div>
            <div style="margin-bottom: 1.5rem; color: #c2b9d4; text-align: center;">
                Каждому игроку нужно выбрать 1 ампу из доступной категории
            </div>
            <div id="breakModalContent"></div>
            <div class="amp-modal-confirm">
                <button id="breakModalConfirm">Продолжить →</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('breakModalClose').addEventListener('click', function() {
        overlay.remove();
    });

    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            overlay.remove();
        }
    });

    const content = document.getElementById('breakModalContent');
    const breakSelections = {};

    escState.players.forEach((player, idx) => {
        const section = document.createElement('div');
        section.style.cssText = 'margin-bottom: 1.5rem; border-bottom: 1px solid rgba(220,90,50,0.1); padding-bottom: 1rem;';
        
        const title = document.createElement('div');
        title.style.cssText = 'font-weight: 600; color: #ffbc9a; margin-bottom: 0.8rem; text-align: center; font-size: 1.1rem;';
        title.innerHTML = `<i class="fas fa-user"></i> ${player}`;
        section.appendChild(title);

        if (areAllCategoriesComplete(idx)) {
            const completeMsg = document.createElement('div');
            completeMsg.style.cssText = 'text-align: center; color: #2ecc71; padding: 0.5rem;';
            completeMsg.innerHTML = '<i class="fas fa-check-circle"></i> Все улучшения применены';
            section.appendChild(completeMsg);
            content.appendChild(section);
            breakSelections[idx] = null;
            return;
        }

        const availableCategories = ampCategories.filter(cat => !isCategoryComplete(idx, cat));
        const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        
        const availableAmps = getAvailableAmpsByCategory(idx, randomCategory);
        const shuffled = availableAmps.sort(() => Math.random() - 0.5);
        const displayAmps = shuffled.slice(0, 3);

        const catLabel = document.createElement('div');
        catLabel.style.cssText = 'text-align: center; color: #e16d48; font-size: 0.85rem; margin-bottom: 0.8rem;';
        catLabel.innerHTML = `<i class="fas fa-tag"></i> Категория: ${randomCategory}`;
        section.appendChild(catLabel);

        const wrapper = document.createElement('div');
        wrapper.className = 'selection-wrapper';

        const grid = document.createElement('div');
        grid.className = 'selection-grid';

        breakSelections[idx] = null;

        displayAmps.forEach(amp => {
            const item = document.createElement('div');
            item.className = 'selection-item';
            item.innerHTML = `
                <img src="${amp.image}" alt="${amp.name}" onerror="this.src='https://placehold.co/90x90/1a1a2e/e16d48?text=?'">
                <div class="item-name">${amp.name}</div>
                <div style="font-size: 0.6rem; color: #666;">${amp.category}</div>
            `;
            item.addEventListener('click', function() {
                grid.querySelectorAll('.selection-item').forEach(el => el.classList.remove('selected'));
                this.classList.add('selected');
                breakSelections[idx] = amp.name;
                unlockAmpForPlayer(idx, amp.name);
                checkBreakReady();
            });
            grid.appendChild(item);
        });

        wrapper.appendChild(grid);
        section.appendChild(wrapper);
        content.appendChild(section);
    });

    function checkBreakReady() {
        let ready = true;
        escState.players.forEach((_, idx) => {
            if (!areAllCategoriesComplete(idx) && !breakSelections[idx]) {
                ready = false;
            }
        });
        document.getElementById('breakModalConfirm').disabled = !ready;
    }
    checkBreakReady();

    document.getElementById('breakModalConfirm').addEventListener('click', function() {
        escState.players.forEach((_, idx) => {
            if (breakSelections[idx]) {
                const category = ampCategories.find(cat => {
                    const amp = ampsData.find(a => a.name === breakSelections[idx]);
                    return amp && amp.category === cat;
                });
                if (category) {
                    if (!escState.ampSelections[idx]) escState.ampSelections[idx] = {};
                    escState.ampSelections[idx][category] = breakSelections[idx];
                    
                    if (!escState.usedAmps[idx]) escState.usedAmps[idx] = [];
                    if (!escState.usedAmps[idx].includes(breakSelections[idx])) {
                        escState.usedAmps[idx].push(breakSelections[idx]);
                    }
                    unlockAmpForPlayer(idx, breakSelections[idx]);
                }
            }
        });
        overlay.remove();
        generateEscResult();
    });
}

// ============================================================
// СБРОС ЭСКАЛАЦИИ
// ============================================================

function resetEscalation() {
    escState = {
        level: 1,
        playerCount: 0,
        players: [],
        equipSelections: {},
        ampSelections: {},
        usedAmps: {},
        unlockedAmps: {},
        allAmpsUsed: {},
        currentStep: 1,
        map: null,
        trial: null,
        difficulty: null,
        variators: [],
        isFirstRun: true
    };
    
    document.querySelectorAll('#escPlayerCountOptions .player-count-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('escStep1Next').disabled = true;
    document.getElementById('escResult').classList.remove('active');
    document.getElementById('escResult').style.display = 'none';
    updateLevelCounter();
    goToEscStep(1);
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ МОДАЛЬНЫХ ОКОН
// ============================================================

function initConfirmModal() {
    document.getElementById('confirmCancel').addEventListener('click', function() {
        document.getElementById('confirmModal').classList.remove('active');
    });

    document.getElementById('confirmExit').addEventListener('click', function() {
        document.getElementById('confirmModal').classList.remove('active');
        resetEscalation();
    });

    document.getElementById('confirmModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
}

// ============================================================
// ЗАПУСК ЭСКАЛАЦИИ
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('escalationWrapper')) {
        initEscalation();
        initAmpModal();
        initConfirmModal();
        updateLevelCounter();
    }
});
