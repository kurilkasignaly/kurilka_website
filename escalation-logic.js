// ============================================================
// ЛОГИКА ЭСКАЛАЦИИ (ПОЛНАЯ ВЕРСИЯ С ИСПРАВЛЕНИЯМИ)
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
    isFirstRun: true,
    usedBigTrials: [],
    usedSmallTrials: [],
    nostophobiaCount: 0,
    usedVariators: []
};

let escTimerInterval;

// ============================================================
// ПРОВЕРКА ЗАГРУЗКИ ДАННЫХ
// ============================================================

function checkDataLoaded() {
    if (typeof mapsData === 'undefined') {
        console.error('❌ mapsData не загружен!');
        return false;
    }
    if (typeof equipmentData === 'undefined') {
        console.error('❌ equipmentData не загружен!');
        return false;
    }
    if (typeof ampsData === 'undefined') {
        console.error('❌ ampsData не загружен!');
        return false;
    }
    if (typeof ampCategories === 'undefined') {
        console.error('❌ ampCategories не загружен!');
        return false;
    }
    if (typeof trialsData === 'undefined') {
        console.error('❌ trialsData не загружен!');
        return false;
    }
    if (typeof allVariatorsData === 'undefined') {
        console.error('❌ allVariatorsData не загружен!');
        return false;
    }
    console.log('✅ Все данные загружены!');
    return true;
}

// ============================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С АМФАМИ
// ============================================================

function getAmpsByCategory(category) {
    if (typeof ampsData === 'undefined') return [];
    return ampsData.filter(function(amp) { return amp.category === category; });
}

function getUnlockedAmpsByCategory(playerIndex, category) {
    var unlocked = escState.unlockedAmps[playerIndex] || [];
    return unlocked.filter(function(ampName) {
        if (typeof ampsData === 'undefined') return false;
        var amp = ampsData.find(function(a) { return a.name === ampName; });
        return amp && amp.category === category;
    });
}

function getAvailableAmpsByCategory(playerIndex, category) {
    var used = escState.usedAmps[playerIndex] || [];
    var categoryAmps = getAmpsByCategory(category);
    return categoryAmps.filter(function(amp) { return used.indexOf(amp.name) === -1; });
}

function isCategoryComplete(playerIndex, category) {
    var categoryAmps = getAmpsByCategory(category);
    var used = escState.usedAmps[playerIndex] || [];
    return categoryAmps.every(function(amp) { return used.indexOf(amp.name) !== -1; });
}

function areAllCategoriesComplete(playerIndex) {
    if (typeof ampCategories === 'undefined') return false;
    return ampCategories.every(function(cat) { return isCategoryComplete(playerIndex, cat); });
}

function checkAllAmpsUsed(playerIndex) {
    return areAllCategoriesComplete(playerIndex);
}

function getAmpForCategory(playerIndex, category) {
    var selections = escState.ampSelections[playerIndex] || {};
    return selections[category] || null;
}

function unlockAmpForPlayer(playerIndex, ampName) {
    if (!escState.unlockedAmps[playerIndex]) {
        escState.unlockedAmps[playerIndex] = [];
    }
    if (escState.unlockedAmps[playerIndex].indexOf(ampName) === -1) {
        escState.unlockedAmps[playerIndex].push(ampName);
    }
}

// ============================================================
// КАТЕГОРИИ ВАРИАТОРОВ (ПОЛНАЯ КЛАССИФИКАЦИЯ)
// ============================================================

const variatorCategories = {
    // Категория 1: Сбор/поиск предметов
    collection: ['Сбор крыс', 'Сбор схем', 'Разбивайте телевизоры', 'Находите схемы', 'Радиопередатчик'],
    
    // Категория 2: Боссы (не могут быть вместе и ограничены по картам)
    bosses: ['Лиланд Койл', 'Матушка Гусберри', 'Франко Барби', 'Близнецы Кресс', 'Лилия Богомолова'],
    
    // Категория 3: Толкачи/бросатели/притворщики/егерь
    hunters: ['Больше толкачей', 'Больше бросателей', 'Больше притворщиков', 'Егерь'],
    
    // Категория 4: Ограничения снаряжения (могут вместе, но редко)
    equipmentRestrictions: [
        'Без амф', 'Без снаряжение', 'Без рецептов', 'Увеличенная перезарядка снаряжения',
        'Урон отключает снаряжения', 'Без улучшений снаряжения', 'Урон перезапускает снаряжения',
        'Урон отключает снаряжение'
    ],
    
    // Категория 5: Запрещенные до 20 уровня
    forbiddenBefore20: ['Ностофобия', 'Психохирургия'],
    
    // Категория 6: Обязательные после 20
    mandatoryAfter20: ['Психохирургия', 'Двойные цели'],
    
    // Категория 7: Несовместимые с Ностофобией
    nostophobiaBlocked: [
        'Без амф', 'Без снаряжение', 'Без рецептов', 'Увеличенная перезарядка снаряжения',
        'Урон отключает снаряжения', 'Без улучшений снаряжения', 'Урон перезапускает снаряжения',
        'Урон отключает снаряжение', 'Первый уровень', 'Сломанный реагент'
    ],
    
    // Категория 8: Несовместимые со Сломанным реагентом
    brokenReagentBlocked: [
        'Без амф', 'Без снаряжение', 'Без рецептов', 'Увеличенная перезарядка снаряжения',
        'Урон отключает снаряжения', 'Без улучшений снаряжения', 'Урон перезапускает снаряжения',
        'Урон отключает снаряжение', 'Первый уровень', 'Ностофобия'
    ],
    
    // Категория 9: Боссы по картам
    bossByMap: {
        'Лиланд Койл': ['Полицейский участок', 'Здание суда'],
        'Матушка Гусберри': ['Парк развлечений', 'Детский дом', 'Фабрика игрушек'],
        'Франко Барби': ['Пристань', 'Центр города', 'Пригород'],
        'Близнецы Кресс': ['Торговый центр', 'Телестудия'],
        'Лилия Богомолова': ['Курорт']
    },
    
    // Категория 10: Боссы блокируют
    bossBlocked: ['Глубокий ожог', 'Самое главное', 'Главная рулетка'],
    
    // Категория 11: Главная рулетка/Самое главное блокируют
    mainRouletteBlocked: ['Егерь', 'Больше толкачей', 'Больше бросателей', 'Больше притворщиков', 'Глубокий ожог'],
    
    // Категория 12: Глубокий ожог несовместим с
    deepBurnBlocked: ['Больше толкачей', 'Егерь', 'Больше притворщиков']
};

// ============================================================
// ПРОВЕРКА СОВМЕСТИМОСТИ ВАРИАТОРОВ
// ============================================================

function isVariatorCompatible(variator, selectedVariators, mapName, playerCount, level) {
    var variatorName = variator.name;
    var selectedNames = selectedVariators.map(function(v) { return v.name; });
    
    // Правило 7: Сильнее вместе только для 2+ игроков
    if (variatorName === 'Сильнее вместе' && playerCount === 1) {
        return false;
    }
    
    // Правило 2: Ностофобия и Психохирургия не выпадают до 20 уровня
    if (level < 21) {
        if (variatorName === 'Ностофобия' || variatorName === 'Психохирургия') {
            return false;
        }
    }
    
    // Правило 8: Ностофобия выпадает с очень маленьким шансом после 20
    if (variatorName === 'Ностофобия' && level >= 21) {
        // 2% шанс на 21+ уровне
        if (Math.random() > 0.02) {
            return false;
        }
        // Проверяем блокировки
        for (var n = 0; n < variatorCategories.nostophobiaBlocked.length; n++) {
            if (selectedNames.indexOf(variatorCategories.nostophobiaBlocked[n]) !== -1) {
                return false;
            }
        }
        return true;
    }
    
    // Категория 1: Вариаторы из одной категории не могут быть вместе
    var allCategories = [
        variatorCategories.collection,
        variatorCategories.bosses,
        variatorCategories.hunters,
        variatorCategories.equipmentRestrictions
    ];
    
    for (var c = 0; c < allCategories.length; c++) {
        var category = allCategories[c];
        if (category.indexOf(variatorName) !== -1) {
            for (var s = 0; s < selectedNames.length; s++) {
                if (category.indexOf(selectedNames[s]) !== -1 && selectedNames[s] !== variatorName) {
                    return false;
                }
            }
        }
    }
    
    // Правило 9: Боссы ограничены по картам
    var bossMapRestrictions = variatorCategories.bossByMap;
    for (var boss in bossMapRestrictions) {
        if (variatorName === boss) {
            var restrictedMaps = bossMapRestrictions[boss];
            if (restrictedMaps.indexOf(mapName) !== -1) {
                return false;
            }
        }
    }
    
    // Правило 4: Боссы несовместимы с глубокий ожог, самое главное, главная рулетка
    if (variatorCategories.bosses.indexOf(variatorName) !== -1) {
        for (var b = 0; b < variatorCategories.bossBlocked.length; b++) {
            if (selectedNames.indexOf(variatorCategories.bossBlocked[b]) !== -1) {
                return false;
            }
        }
    }
    if (selectedNames.some(function(n) { return variatorCategories.bosses.indexOf(n) !== -1; })) {
        if (variatorCategories.bossBlocked.indexOf(variatorName) !== -1) {
            return false;
        }
    }
    
    // Правило 5: Главная рулетка или Самое главное
    var mainRouletteNames = ['Главная рулетка', 'Самое главное'];
    if (mainRouletteNames.indexOf(variatorName) !== -1) {
        for (var d = 0; d < variatorCategories.mainRouletteBlocked.length; d++) {
            if (selectedNames.indexOf(variatorCategories.mainRouletteBlocked[d]) !== -1) {
                return false;
            }
        }
    }
    if (selectedNames.some(function(n) { return mainRouletteNames.indexOf(n) !== -1; })) {
        if (variatorCategories.mainRouletteBlocked.indexOf(variatorName) !== -1) {
            return false;
        }
    }
    
    // Правило 3: Сломанный реагент
    if (variatorName === 'Сломанный реагент') {
        for (var br = 0; br < variatorCategories.brokenReagentBlocked.length; br++) {
            if (selectedNames.indexOf(variatorCategories.brokenReagentBlocked[br]) !== -1) {
                return false;
            }
        }
    }
    if (selectedNames.indexOf('Сломанный реагент') !== -1) {
        if (variatorCategories.brokenReagentBlocked.indexOf(variatorName) !== -1) {
            return false;
        }
    }
    
    // Глубокий ожог несовместим с больше толкачей, егерь, больше притворщиков
    if (variatorName === 'Глубокий ожог') {
        for (var db = 0; db < variatorCategories.deepBurnBlocked.length; db++) {
            if (selectedNames.indexOf(variatorCategories.deepBurnBlocked[db]) !== -1) {
                return false;
            }
        }
    }
    if (selectedNames.indexOf('Глубокий ожог') !== -1) {
        if (variatorCategories.deepBurnBlocked.indexOf(variatorName) !== -1) {
            return false;
        }
    }
    
    // Ограничения снаряжения могут быть вместе, но не все сразу (максимум 2)
    if (variatorCategories.equipmentRestrictions.indexOf(variatorName) !== -1) {
        var equipmentCount = 0;
        for (var e = 0; e < selectedNames.length; e++) {
            if (variatorCategories.equipmentRestrictions.indexOf(selectedNames[e]) !== -1) {
                equipmentCount++;
            }
        }
        // Если уже есть 2 ограничения снаряжения - не добавляем третье
        if (equipmentCount >= 2) {
            return false;
        }
    }
    
    // Проверяем, не пытаемся ли мы добавить вариатор, который уже есть
    if (selectedNames.indexOf(variatorName) !== -1) {
        return false;
    }
    
    return true;
}

// ============================================================
// ПОЛУЧЕНИЕ ВАРИАТОРОВ ДЛЯ УРОВНЯ
// ============================================================

function getVariatorsForLevel(level, mapName, playerCount) {
    if (typeof allVariatorsData === 'undefined') return [];
    
    console.log('🔄 Генерация вариаторов для уровня:', level);
    console.log('📍 Карта:', mapName);
    console.log('👥 Игроков:', playerCount);
    
    // Получаем все вариаторы кроме Ультра II
    var availableVariators = allVariatorsData.filter(function(v) {
        return v.name !== "Ультра II";
    });
    
    // Увеличиваем счетчик ностофобии
    escState.nostophobiaCount++;
    
    // Уровень 21+ - особые правила
    if (level >= 21) {
        console.log('🎯 Уровень 21+ - обязательно Психохирургия и Двойные цели');
        
        var psycho = allVariatorsData.find(function(v) { return v.name === "Психохирургия"; });
        var doubleTargets = allVariatorsData.find(function(v) { return v.name === "Двойные цели"; });
        
        if (!psycho || !doubleTargets) {
            console.error('❌ Вариаторы Психохирургия или Двойные цели не найдены!');
            var fallback = availableVariators.slice().sort(function() { return Math.random() - 0.5; });
            return fallback.slice(0, 8);
        }
        
        // Начинаем с обязательных вариаторов
        var result = [psycho, doubleTargets];
        console.log('📋 Обязательные вариаторы:', result.map(function(v) { return v.name; }).join(', '));
        
        // Остальные вариаторы (без психохирургии, двойных целей и ультра II)
        var others = allVariatorsData.filter(function(v) {
            return v.name !== "Психохирургия" && v.name !== "Двойные цели" && v.name !== "Ультра II";
        });
        
        // Перемешиваем остальные
        var shuffled = others.slice().sort(function() { return Math.random() - 0.5; });
        console.log('📋 Доступно других вариаторов:', shuffled.length);
        
        // Проверяем совместимость для каждого и добавляем до 6
        for (var i = 0; i < shuffled.length && result.length < 8; i++) {
            var candidate = shuffled[i];
            var tempSelected = result.concat([]);
            if (isVariatorCompatible(candidate, tempSelected, mapName, playerCount, level)) {
                result.push(candidate);
                console.log('✅ Добавлен вариатор:', candidate.name);
            }
        }
        
        // Если не хватает до 8, пробуем еще раз
        if (result.length < 8) {
            console.log('⚠️ Не хватает вариаторов до 8, пробуем добавить больше...');
            var remaining = others.filter(function(v) {
                return result.indexOf(v) === -1;
            });
            for (var j = 0; j < remaining.length && result.length < 8; j++) {
                var candidate2 = remaining[j];
                if (result.indexOf(candidate2) === -1) {
                    // Проверяем базовую совместимость без жестких ограничений
                    var basicCheck = true;
                    // Проверяем только категории
                    for (var cat = 0; cat < variatorCategories.collection.length; cat++) {
                        if (candidate2.name === variatorCategories.collection[cat]) {
                            for (var sc = 0; sc < result.length; sc++) {
                                if (variatorCategories.collection.indexOf(result[sc].name) !== -1) {
                                    basicCheck = false;
                                    break;
                                }
                            }
                        }
                    }
                    if (basicCheck) {
                        result.push(candidate2);
                        console.log('✅ Добавлен вариатор (принудительно):', candidate2.name);
                    }
                }
            }
        }
        
        // Сбрасываем счетчик ностофобии на 21+ уровне
        escState.nostophobiaCount = 0;
        
        console.log('✅ Итоговое количество вариаторов для 21+:', result.length);
        console.log('📋 Финальные вариаторы:', result.map(function(v) { return v.name; }).join(', '));
        
        return result;
    }
    
    // Для уровней 1-20
    var count;
    if (level === 1) {
        count = 1;
    } else if (level >= 2 && level <= 5) {
        count = Math.floor(Math.random() * 2) + 2;
    } else if (level >= 6 && level <= 15) {
        count = Math.floor(Math.random() * 2) + 3;
    } else if (level >= 16 && level <= 20) {
        count = Math.floor(Math.random() * 3) + 4;
    } else {
        count = 1;
    }
    
    console.log('🎯 Нужно вариаторов для уровня', level, ':', count);
    
    // Исключаем запрещенные до 20 уровня
    var filteredVariators = availableVariators.filter(function(v) {
        return variatorCategories.forbiddenBefore20.indexOf(v.name) === -1;
    });
    
    // Перемешиваем все доступные вариаторы
    var shuffledBase = filteredVariators.slice().sort(function() { return Math.random() - 0.5; });
    var result = [];
    
    for (var k = 0; k < shuffledBase.length && result.length < count; k++) {
        var candidate = shuffledBase[k];
        if (isVariatorCompatible(candidate, result, mapName, playerCount, level)) {
            result.push(candidate);
            console.log('✅ Добавлен вариатор:', candidate.name);
        }
    }
    
    // Если не хватает, добираем
    if (result.length < count) {
        console.log('⚠️ Не хватает вариаторов, добираем...');
        for (var m = 0; m < shuffledBase.length && result.length < count; m++) {
            var candidate2 = shuffledBase[m];
            if (result.indexOf(candidate2) === -1) {
                // Базовая проверка на категории
                var basicOk = true;
                for (var cat2 = 0; cat2 < variatorCategories.collection.length; cat2++) {
                    if (candidate2.name === variatorCategories.collection[cat2]) {
                        for (var sc2 = 0; sc2 < result.length; sc2++) {
                            if (variatorCategories.collection.indexOf(result[sc2].name) !== -1) {
                                basicOk = false;
                                break;
                            }
                        }
                    }
                }
                if (basicOk) {
                    result.push(candidate2);
                    console.log('✅ Добавлен вариатор (принудительно):', candidate2.name);
                }
            }
        }
    }
    
    console.log('✅ Итоговое количество вариаторов:', result.length);
    console.log('📋 Финальные вариаторы:', result.map(function(v) { return v.name; }).join(', '));
    
    return result;
}

// ============================================================
// ПОЛУЧЕНИЕ КАРТЫ И ИСПЫТАНИЯ
// ============================================================

function getMapAndTrial(level) {
    if (typeof trialsData === 'undefined') return null;
    
    console.log('🔄 Поиск карты и испытания для уровня:', level);
    
    var mapNames = Object.keys(trialsData);
    var isBigLevel = (level % 10 === 0);
    console.log('🔤 Тип уровня:', isBigLevel ? 'БОЛЬШАЯ карта' : 'маленькая карта');
    
    var availableTrials = [];
    
    for (var m = 0; m < mapNames.length; m++) {
        var mapName = mapNames[m];
        var mapData = trialsData[mapName];
        
        for (var t = 0; t < mapData.trials.length; t++) {
            var trial = mapData.trials[t];
            var isBig = trial.name === trial.name.toUpperCase();
            
            if (isBigLevel && isBig) {
                if (escState.usedBigTrials.indexOf(trial.name) === -1) {
                    availableTrials.push({
                        mapName: mapName,
                        mapImage: mapData.image,
                        trial: trial
                    });
                }
            } else if (!isBigLevel && !isBig) {
                if (escState.usedSmallTrials.indexOf(trial.name) === -1) {
                    availableTrials.push({
                        mapName: mapName,
                        mapImage: mapData.image,
                        trial: trial
                    });
                }
            }
        }
    }
    
    if (availableTrials.length === 0) {
        console.log('🔄 Все карты использованы, сброс списка использованных');
        if (isBigLevel) {
            escState.usedBigTrials = [];
            for (var m2 = 0; m2 < mapNames.length; m2++) {
                var mapName2 = mapNames[m2];
                var mapData2 = trialsData[mapName2];
                for (var t2 = 0; t2 < mapData2.trials.length; t2++) {
                    var trial2 = mapData2.trials[t2];
                    if (trial2.name === trial2.name.toUpperCase()) {
                        availableTrials.push({
                            mapName: mapName2,
                            mapImage: mapData2.image,
                            trial: trial2
                        });
                    }
                }
            }
        } else {
            escState.usedSmallTrials = [];
            for (var m3 = 0; m3 < mapNames.length; m3++) {
                var mapName3 = mapNames[m3];
                var mapData3 = trialsData[mapName3];
                for (var t3 = 0; t3 < mapData3.trials.length; t3++) {
                    var trial3 = mapData3.trials[t3];
                    if (trial3.name !== trial3.name.toUpperCase()) {
                        availableTrials.push({
                            mapName: mapName3,
                            mapImage: mapData3.image,
                            trial: trial3
                        });
                    }
                }
            }
        }
    }
    
    if (availableTrials.length === 0) {
        console.error('❌ Не найдено доступных испытаний!');
        return null;
    }
    
    var randomIndex = Math.floor(Math.random() * availableTrials.length);
    var selected = availableTrials[randomIndex];
    
    console.log('✅ Выбрано испытание:', selected.trial.name);
    console.log('📍 Карта:', selected.mapName);
    
    if (selected.trial.name === selected.trial.name.toUpperCase()) {
        escState.usedBigTrials.push(selected.trial.name);
    } else {
        escState.usedSmallTrials.push(selected.trial.name);
    }
    
    return selected;
}

// ============================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ВАРИАТОРАМИ
// ============================================================

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
    
    var step1 = document.getElementById('escStep1');
    var step2 = document.getElementById('escStep2');
    var step3 = document.getElementById('escStep3');
    var step4 = document.getElementById('escStep4');
    var result = document.getElementById('escResult');
    
    if (step1) step1.classList.add('hidden');
    if (step2) step2.classList.add('hidden');
    if (step3) step3.classList.add('hidden');
    if (step4) step4.classList.add('hidden');
    
    if (result) {
        result.classList.remove('active');
        result.style.display = 'none';
    }

    var stepMap = {
        1: step1,
        2: step2,
        3: step3,
        4: step4
    };

    var target = stepMap[step];
    if (target) target.classList.remove('hidden');
}

function updateLevelCounter() {
    var levelNum = document.getElementById('levelNumber');
    var levelDiff = document.getElementById('levelDifficulty');
    var difficulty = getDifficultyByLevel(escState.level);
    
    if (levelNum) levelNum.textContent = escState.level;
    if (levelDiff) {
        levelDiff.textContent = difficulty.name;
        levelDiff.className = 'level-difficulty ' + difficulty.class;
    }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ ЭСКАЛАЦИИ
// ============================================================

function initEscalation() {
    if (!checkDataLoaded()) {
        var wrapper = document.querySelector('.escalation-wrapper');
        if (wrapper) {
            wrapper.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #e16d48;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; display: block; margin-bottom: 1rem;"></i>
                    <h2>Ошибка загрузки данных</h2>
                    <p style="color: #c2b9d4; margin-top: 0.5rem;">Не удалось загрузить необходимые данные.<br>Проверьте подключение JS файлов.</p>
                </div>
            `;
        }
        return;
    }

    var options = document.querySelectorAll('#escPlayerCountOptions .player-count-btn');
    var step1Next = document.getElementById('escStep1Next');
    var step2Back = document.getElementById('escStep2Back');
    var step2Next = document.getElementById('escStep2Next');
    var step3Back = document.getElementById('escStep3Back');
    var step3Next = document.getElementById('escStep3Next');
    var step4Back = document.getElementById('escStep4Back');
    var step4Next = document.getElementById('escStep4Next');
    var nextLevelBtn = document.getElementById('escNextLevelBtn');
    var exitBtn = document.getElementById('escExitBtn');
    var restartBtn = document.getElementById('escRestartBtn');

    if (options) {
        options.forEach(function(btn) {
            btn.addEventListener('click', function() {
                options.forEach(function(b) { b.classList.remove('selected'); });
                this.classList.add('selected');
                escState.playerCount = parseInt(this.dataset.count);
                if (step1Next) step1Next.disabled = false;
            });
        });
    }

    if (step1Next) {
        step1Next.addEventListener('click', function() {
            goToEscStep(2);
            renderEscPlayerNames();
        });
    }

    if (step2Back) {
        step2Back.addEventListener('click', function() { goToEscStep(1); });
    }
    
    if (step2Next) {
        step2Next.addEventListener('click', function() {
            var inputs = document.querySelectorAll('#escPlayerNameInputs input');
            escState.players = [];
            inputs.forEach(function(input, i) {
                escState.players.push(input.value.trim() || 'Игрок ' + (i + 1));
            });
            escState.players.forEach(function(_, idx) {
                if (!escState.usedAmps[idx]) escState.usedAmps[idx] = [];
                if (!escState.ampSelections[idx]) escState.ampSelections[idx] = {};
                if (!escState.unlockedAmps[idx]) escState.unlockedAmps[idx] = [];
                escState.allAmpsUsed[idx] = false;
            });
            goToEscStep(3);
            renderEscEquipment();
        });
    }

    if (step3Back) {
        step3Back.addEventListener('click', function() { goToEscStep(2); });
    }
    
    if (step3Next) {
        step3Next.addEventListener('click', function() { 
            goToEscStep(4);
            renderEscAmps();
        });
    }

    if (step4Back) {
        step4Back.addEventListener('click', function() { goToEscStep(3); });
    }
    
    if (step4Next) {
        step4Next.addEventListener('click', function() {
            escState.players.forEach(function(_, idx) {
                var selected = escState.ampSelections[idx] || {};
                Object.keys(selected).forEach(function(category) {
                    var ampName = selected[category];
                    if (ampName) {
                        if (!escState.usedAmps[idx]) escState.usedAmps[idx] = [];
                        if (escState.usedAmps[idx].indexOf(ampName) === -1) {
                            escState.usedAmps[idx].push(ampName);
                        }
                        unlockAmpForPlayer(idx, ampName);
                    }
                });
            });
            generateEscResult();
        });
    }

    if (nextLevelBtn) {
        nextLevelBtn.addEventListener('click', function() {
            escState.level++;
            console.log('🔄 Переход на уровень:', escState.level);
            updateLevelCounter();
            
            var allComplete = escState.players.every(function(_, idx) {
                return areAllCategoriesComplete(idx);
            });
            
            if (allComplete) {
                alert('Не осталось выбора улучшения. Все улучшения были применены.');
                generateEscResult();
            } else {
                showBreakModal();
            }
        });
    }

    if (exitBtn) {
        exitBtn.addEventListener('click', function() {
            var modal = document.getElementById('confirmModal');
            if (modal) modal.classList.add('active');
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            resetEscalation();
        });
    }
}

// ============================================================
// ОТРИСОВКА ШАГОВ
// ============================================================

function renderEscPlayerNames() {
    var container = document.getElementById('escPlayerNameInputs');
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < escState.playerCount; i++) {
        var row = document.createElement('div');
        row.className = 'input-row';
        row.innerHTML = `
            <label><i class="fas fa-user"></i> Игрок ${i + 1}</label>
            <input type="text" placeholder="Введите ник..." id="escPlayerName_${i}" value="${escState.players[i] || ''}">
        `;
        container.appendChild(row);
    }
    var firstInput = container.querySelector('input');
    if (firstInput) setTimeout(function() { firstInput.focus(); }, 300);
}

function renderEscEquipment() {
    var container = document.getElementById('escStep3Content');
    if (!container) return;
    container.innerHTML = '';
    
    if (typeof equipmentData === 'undefined' || equipmentData.length === 0) {
        container.innerHTML = '<div style="color: #e16d48; text-align: center; padding: 2rem;">Ошибка: данные снаряжения не загружены</div>';
        return;
    }
    
    escState.players.forEach(function(player, idx) {
        var section = document.createElement('div');
        section.style.marginBottom = '1.8rem';
        section.style.borderBottom = '1px solid rgba(220,90,50,0.1)';
        section.style.paddingBottom = '1.2rem';
        
        var title = document.createElement('div');
        title.style.fontWeight = '600';
        title.style.color = '#ffbc9a';
        title.style.marginBottom = '0.8rem';
        title.style.fontSize = '1.05rem';
        title.style.textAlign = 'center';
        title.innerHTML = '<i class="fas fa-user"></i> ' + player;
        section.appendChild(title);
        
        var wrapper = document.createElement('div');
        wrapper.className = 'selection-wrapper';
        
        var grid = document.createElement('div');
        grid.className = 'selection-grid';
        
        var shuffled = equipmentData.slice().sort(function() { return Math.random() - 0.5; });
        var selectedEquip = shuffled.slice(0, 3);
        
        selectedEquip.forEach(function(eq) {
            var item = document.createElement('div');
            item.className = 'selection-item';
            item.dataset.player = idx;
            item.dataset.equip = eq.name;
            var isSelected = escState.equipSelections[idx] === eq.name;
            if (isSelected) item.classList.add('selected');
            
            item.innerHTML = `
                <div class="check-mark"><i class="fas fa-check-circle"></i></div>
                <img src="${eq.image}" alt="${eq.name}" onerror="this.src='https://placehold.co/100x100/1a1a2e/e16d48?text=?'" style="width:100px; height:100px;">
                <div class="item-name">${eq.name}</div>
            `;
            
            item.addEventListener('click', function() {
                var parent = this.closest('.selection-grid');
                parent.querySelectorAll('.selection-item').forEach(function(el) { el.classList.remove('selected'); });
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
    var allSelected = escState.players.every(function(_, idx) {
        return escState.equipSelections[idx] !== undefined;
    });
    var btn = document.getElementById('escStep3Next');
    if (btn) btn.disabled = !allSelected;
}

function renderEscAmps() {
    var container = document.getElementById('escStep4Content');
    if (!container) return;
    container.innerHTML = '';
    
    if (typeof ampsData === 'undefined' || ampsData.length === 0) {
        container.innerHTML = '<div style="color: #e16d48; text-align: center; padding: 2rem;">Ошибка: данные амф не загружены</div>';
        return;
    }
    
    if (typeof ampCategories === 'undefined' || ampCategories.length === 0) {
        container.innerHTML = '<div style="color: #e16d48; text-align: center; padding: 2rem;">Ошибка: категории амф не загружены</div>';
        return;
    }
    
    escState.players.forEach(function(player, idx) {
        var section = document.createElement('div');
        section.style.marginBottom = '1.8rem';
        section.style.borderBottom = '1px solid rgba(220,90,50,0.1)';
        section.style.paddingBottom = '1.2rem';
        
        var title = document.createElement('div');
        title.style.fontWeight = '600';
        title.style.color = '#ffbc9a';
        title.style.marginBottom = '0.8rem';
        title.style.fontSize = '1.05rem';
        title.style.textAlign = 'center';
        title.innerHTML = '<i class="fas fa-user"></i> ' + player;
        section.appendChild(title);

        var availableCategories = ampCategories.filter(function(cat) {
            return !isCategoryComplete(idx, cat);
        });
        
        if (availableCategories.length === 0) {
            var msg = document.createElement('div');
            msg.style.cssText = 'text-align: center; color: #2ecc71; padding: 0.5rem;';
            msg.textContent = 'Все улучшения применены';
            section.appendChild(msg);
            container.appendChild(section);
            return;
        }
        
        var randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        
        var catLabel = document.createElement('div');
        catLabel.style.cssText = 'text-align: center; color: #e16d48; font-size: 0.85rem; margin-bottom: 0.8rem;';
        catLabel.innerHTML = '<i class="fas fa-tag"></i> Категория: ' + randomCategory;
        section.appendChild(catLabel);
        
        var wrapper = document.createElement('div');
        wrapper.className = 'selection-wrapper';
        
        var grid = document.createElement('div');
        grid.className = 'selection-grid';
        
        var availableAmps = getAvailableAmpsByCategory(idx, randomCategory);
        var shuffled = availableAmps.slice().sort(function() { return Math.random() - 0.5; });
        
        var ampCount = Math.floor(Math.random() * 4);
        var selectedAmps = shuffled.slice(0, ampCount);
        
        console.log('🎯 Для игрока', player, 'выбрано амф:', ampCount);
        
        if (selectedAmps.length === 0) {
            for (var i = 0; i < 3; i++) {
                var emptyItem = document.createElement('div');
                emptyItem.className = 'selection-item';
                emptyItem.style.opacity = '0.5';
                emptyItem.style.cursor = 'default';
                emptyItem.innerHTML = `
                    <div style="font-size: 3rem; color: #555;">⛔</div>
                    <div class="item-name" style="color: #555;">ПУСТО</div>
                `;
                grid.appendChild(emptyItem);
            }
        } else {
            selectedAmps.forEach(function(amp) {
                var item = document.createElement('div');
                item.className = 'selection-item';
                item.dataset.player = idx;
                item.dataset.amp = amp.name;
                var currentAmp = escState.ampSelections[idx] ? escState.ampSelections[idx][randomCategory] : null;
                var isSelected = currentAmp === amp.name;
                if (isSelected) item.classList.add('selected');
                
                item.innerHTML = `
                    <div class="check-mark"><i class="fas fa-check-circle"></i></div>
                    <img src="${amp.image}" alt="${amp.name}" onerror="this.src='https://placehold.co/100x100/1a1a2e/e16d48?text=?'" style="width:100px; height:100px;">
                    <div class="item-name">${amp.name}</div>
                    <div style="font-size: 0.6rem; color: #666;">${amp.category}</div>
                `;
                
                item.addEventListener('click', function() {
                    var parent = this.closest('.selection-grid');
                    parent.querySelectorAll('.selection-item').forEach(function(el) { el.classList.remove('selected'); });
                    this.classList.add('selected');
                    if (!escState.ampSelections[idx]) escState.ampSelections[idx] = {};
                    escState.ampSelections[idx][randomCategory] = amp.name;
                    unlockAmpForPlayer(idx, amp.name);
                    checkEscAmpsReady();
                });
                
                grid.appendChild(item);
            });
            
            if (selectedAmps.length < 3) {
                for (var j = selectedAmps.length; j < 3; j++) {
                    var emptyItem = document.createElement('div');
                    emptyItem.className = 'selection-item';
                    emptyItem.style.opacity = '0.5';
                    emptyItem.style.cursor = 'default';
                    emptyItem.innerHTML = `
                        <div style="font-size: 3rem; color: #555;">⛔</div>
                        <div class="item-name" style="color: #555;">ПУСТО</div>
                    `;
                    grid.appendChild(emptyItem);
                }
            }
        }
        
        wrapper.appendChild(grid);
        section.appendChild(wrapper);
        container.appendChild(section);
    });
    checkEscAmpsReady();
}

function checkEscAmpsReady() {
    var btn = document.getElementById('escStep4Next');
    if (btn) btn.disabled = false;
}

// ============================================================
// ГЕНЕРАЦИЯ РЕЗУЛЬТАТА
// ============================================================

function generateEscResult() {
    console.log('🔄 Генерация результата для уровня:', escState.level);
    
    if (typeof mapsData === 'undefined' || mapsData.length === 0) {
        console.error('❌ mapsData не загружен!');
        return;
    }
    
    if (typeof trialsData === 'undefined' || Object.keys(trialsData).length === 0) {
        console.error('❌ trialsData не загружен!');
        return;
    }
    
    var selected = getMapAndTrial(escState.level);
    if (!selected) {
        console.error('❌ Не найдено подходящее испытание!');
        return;
    }
    
    var mapName = selected.mapName;
    var mapImage = selected.mapImage;
    var trial = selected.trial;
    
    escState.map = { name: mapName, image: mapImage };
    escState.trial = trial;
    
    console.log('📍 Карта:', mapName);
    console.log('📋 Испытание:', trial.name);
    
    var difficulty = getDifficultyByLevel(escState.level);
    escState.difficulty = difficulty.name;
    console.log('📊 Сложность:', difficulty.name);
    
    escState.variators = getVariatorsForLevel(escState.level, mapName, escState.playerCount);
    console.log('🎯 Количество вариаторов:', escState.variators.length);
    
    var variatorNames = escState.variators.map(function(v) { return v.name; });
    console.log('📋 Вариаторы:', variatorNames.join(', '));

    var step1 = document.getElementById('escStep1');
    var step2 = document.getElementById('escStep2');
    var step3 = document.getElementById('escStep3');
    var step4 = document.getElementById('escStep4');
    
    if (step1) step1.classList.add('hidden');
    if (step2) step2.classList.add('hidden');
    if (step3) step3.classList.add('hidden');
    if (step4) step4.classList.add('hidden');
    
    var resultContainer = document.getElementById('escResult');
    if (resultContainer) {
        resultContainer.style.display = 'block';
        resultContainer.classList.add('active');
    }

    var resultMap = document.getElementById('escResultMap');
    if (resultMap) {
        var trialImage = trial.image || mapImage;
        
        resultMap.innerHTML = `
            <img class="map-image" src="${trialImage}" alt="${trial.name}" onerror="this.src='https://placehold.co/160x160/1a1a2e/e16d48?text=${encodeURIComponent(trial.name)}'">
            <div class="result-map-info">
                <div class="map-label"><i class="fas fa-map"></i> Карта</div>
                <div class="map-name">${mapName}</div>
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

    var resultVariators = document.getElementById('escResultVariators');
    if (resultVariators) {
        if (escState.variators.length === 0) {
            resultVariators.innerHTML = '<div style="color: #888; text-align: center; padding: 1rem;">Нет вариаторов</div>';
        } else {
            resultVariators.innerHTML = escState.variators.map(function(v) {
                return `
                    <div class="var-item">
                        <img src="${v.image}" alt="${v.name}" onerror="this.src='https://placehold.co/100x100/1a1a2e/e16d48?text=?'" style="width:100px; height:100px; object-fit:contain; border-radius:14px; background:rgba(0,0,0,0.3); padding:8px; border:1px solid rgba(220,90,50,0.15);">
                        <span class="var-name" style="font-size:0.75rem; color:#c2b9d4; text-align:center; max-width:85px; line-height:1.2;">${v.name}</span>
                    </div>
                `;
            }).join('');
        }
    }

    renderEscResultPlayers();
    
    if (resultContainer) {
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    console.log('✅ Результат сгенерирован!');
}

// ============================================================
// ОТОБРАЖЕНИЕ ИГРОКОВ В РЕЗУЛЬТАТЕ
// ============================================================

function renderEscResultPlayers() {
    var container = document.getElementById('escResultPlayers');
    if (!container) return;
    
    var playersHtml = '';
    escState.players.forEach(function(player, idx) {
        var equip = escState.equipSelections[idx] || 'Не выбрано';
        var amps = escState.ampSelections[idx] || {};
        var equipData = typeof equipmentData !== 'undefined' ? equipmentData.find(function(e) { return e.name === equip; }) : null;
        var allUsed = checkAllAmpsUsed(idx);
        
        playersHtml += `
            <div class="player-result">
                <div class="player-name"><i class="fas fa-user-circle"></i> ${player}</div>
                <div class="player-equip">
                    ${equipData ? '<img src="' + equipData.image + '" alt="' + equip + '" onerror="this.style.display=\'none\'" style="width:100px; height:100px; object-fit:contain;">' : ''}
                    <span class="label">СНАРЯЖЕНИЕ:</span>
                    <span class="value">${equip}</span>
                </div>
                <div style="margin-top: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                        <span style="color: #888; font-size: 0.75rem; font-weight: 500;"><i class="fas fa-capsules"></i> УЛУЧШЕНИЯ:</span>
                        ${!allUsed ? '<span style="color: #e16d48; font-size: 0.65rem;">Нажмите на категорию для смены</span>' : ''}
                    </div>
                    <div class="player-amps-categories">
                        ${ampCategories.map(function(category) {
                            var ampName = getAmpForCategory(idx, category);
                            var ampData = typeof ampsData !== 'undefined' ? ampsData.find(function(a) { return a.name === ampName; }) : null;
                            var isComplete = isCategoryComplete(idx, category);
                            
                            return `
                                <div class="amp-category-block" onclick="${!allUsed ? 'openAmpModal(' + idx + ', \'' + category + '\')' : ''}" style="cursor: ${!allUsed ? 'pointer' : 'default'};">
                                    <div class="category-header">
                                        <span class="category-name">${category}</span>
                                        ${!allUsed ? '<button class="category-change-btn" onclick="event.stopPropagation(); openAmpModal(' + idx + ', \'' + category + '\')" title="Сменить амфу"><i class="fas fa-sync-alt"></i></button>' : ''}
                                    </div>
                                    ${isComplete ? 
                                        '<div class="category-complete"><i class="fas fa-check-circle"></i> Все амфы использованы</div>' :
                                        (ampData ? 
                                            '<div class="category-amp-name">' + ampData.name + '</div>' :
                                            '<div class="category-amp-empty">Не выбрана</div>'
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

var modalState = {
    playerIndex: null,
    selectedAmp: null,
    selectedCategory: "Инструмент"
};

function initAmpModal() {
    var modal = document.getElementById('ampModal');
    var closeBtn = document.getElementById('ampModalClose');
    var confirmBtn = document.getElementById('ampModalConfirm');

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        });
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            if (modalState.playerIndex !== null && modalState.selectedAmp && modalState.selectedCategory) {
                var idx = modalState.playerIndex;
                var category = modalState.selectedCategory;
                
                var currentAmps = escState.ampSelections[idx] || {};
                var oldAmp = currentAmps[category];
                
                if (oldAmp === modalState.selectedAmp) {
                    if (modal) {
                        modal.classList.remove('active');
                        modal.style.display = 'none';
                    }
                    return;
                }
                
                if (oldAmp && escState.usedAmps[idx]) {
                    escState.usedAmps[idx] = escState.usedAmps[idx].filter(function(a) { return a !== oldAmp; });
                }
                
                if (!escState.ampSelections[idx]) escState.ampSelections[idx] = {};
                escState.ampSelections[idx][category] = modalState.selectedAmp;
                
                if (!escState.usedAmps[idx]) escState.usedAmps[idx] = [];
                if (escState.usedAmps[idx].indexOf(modalState.selectedAmp) === -1) {
                    escState.usedAmps[idx].push(modalState.selectedAmp);
                }
                unlockAmpForPlayer(idx, modalState.selectedAmp);

                renderEscResultPlayers();
                
                if (modal) {
                    modal.classList.remove('active');
                    modal.style.display = 'none';
                }
                
                console.log('✅ Амфа успешно изменена!');
            } else {
                console.warn('⚠️ Не все данные для смены амфы заполнены');
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
        }
    });
}

function openAmpModal(playerIndex, category) {
    if (checkAllAmpsUsed(playerIndex)) {
        alert('Все улучшения уже применены. Смена амф невозможна.');
        return;
    }

    if (isCategoryComplete(playerIndex, category)) {
        alert('Все амфы в этой категории уже использованы.');
        return;
    }

    var playerName = escState.players[playerIndex];
    var currentAmp = getAmpForCategory(playerIndex, category);
    
    modalState.playerIndex = playerIndex;
    modalState.selectedCategory = category;
    modalState.selectedAmp = currentAmp;

    var playerNameEl = document.getElementById('ampModalPlayerName');
    if (playerNameEl) {
        playerNameEl.textContent = playerName + ' — ' + category;
    }

    var tabsContainer = document.getElementById('ampCategoryTabs');
    if (tabsContainer) {
        tabsContainer.innerHTML = '';
        
        var availableCategories = ampCategories.filter(function(cat) {
            return !isCategoryComplete(playerIndex, cat);
        });
        
        if (availableCategories.length === 0) {
            var grid = document.getElementById('ampModalGrid');
            if (grid) {
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; color: #2ecc71; padding: 2rem;">
                        <i class="fas fa-check-circle" style="font-size: 2rem;"></i>
                        <div style="margin-top: 0.5rem;">Все улучшения применены</div>
                    </div>
                `;
            }
            var confirmBtn = document.getElementById('ampModalConfirm');
            if (confirmBtn) confirmBtn.disabled = true;
            var modal = document.getElementById('ampModal');
            if (modal) {
                modal.classList.add('active');
                modal.style.display = 'flex';
            }
            return;
        }

        availableCategories.forEach(function(cat) {
            var tab = document.createElement('button');
            tab.textContent = cat;
            tab.dataset.category = cat;
            if (cat === category) {
                tab.classList.add('active');
            }
            tab.addEventListener('click', function() {
                if (tabsContainer) {
                    tabsContainer.querySelectorAll('button').forEach(function(t) {
                        t.classList.remove('active');
                    });
                    this.classList.add('active');
                    var newCategory = this.dataset.category;
                    modalState.selectedCategory = newCategory;
                    modalState.selectedAmp = getAmpForCategory(playerIndex, newCategory);
                    renderAmpModalGrid(playerIndex, newCategory);
                }
            });
            tabsContainer.appendChild(tab);
        });
    }

    renderAmpModalGrid(playerIndex, category);
    var modal = document.getElementById('ampModal');
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function renderAmpModalGrid(playerIndex, category) {
    var grid = document.getElementById('ampModalGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    if (typeof ampsData === 'undefined' || ampsData.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: #e16d48; padding: 2rem;">Ошибка: данные амф не загружены</div>';
        return;
    }

    var categoryAmps = getAmpsByCategory(category);
    var used = escState.usedAmps[playerIndex] || [];
    var unlocked = escState.unlockedAmps[playerIndex] || [];
    var currentAmp = getAmpForCategory(playerIndex, category);

    var hasAvailable = false;

    categoryAmps.forEach(function(amp) {
        var isUsed = used.indexOf(amp.name) !== -1;
        var isUnlocked = unlocked.indexOf(amp.name) !== -1;
        var isCurrent = currentAmp === amp.name;
        
        var isAvailable = isUnlocked || isCurrent;

        var item = document.createElement('div');
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
                grid.querySelectorAll('.amp-modal-item').forEach(function(el) {
                    el.classList.remove('selected');
                });
                this.classList.add('selected');
                modalState.selectedAmp = amp.name;
                var confirmBtn = document.getElementById('ampModalConfirm');
                if (confirmBtn) confirmBtn.disabled = false;
            });
        }
        grid.appendChild(item);
    });

    if (!hasAvailable) {
        var emptyMsg = document.createElement('div');
        emptyMsg.style.cssText = 'grid-column: 1 / -1; text-align: center; color: #888; padding: 2rem;';
        emptyMsg.textContent = 'В этой категории нет доступных амф. Выберите другую категорию.';
        grid.appendChild(emptyMsg);
    }

    var confirmBtn = document.getElementById('ampModalConfirm');
    if (confirmBtn) confirmBtn.disabled = true;
}

// ============================================================
// ПЕРЕРЫВ (выбор амф)
// ============================================================

function showBreakModal() {
    var hasAvailable = false;
    escState.players.forEach(function(_, idx) {
        if (!areAllCategoriesComplete(idx)) {
            hasAvailable = true;
        }
    });

    if (!hasAvailable) {
        alert('Не осталось выбора улучшения. Все улучшения были применены.');
        generateEscResult();
        return;
    }

    var oldModal = document.getElementById('breakModal');
    if (oldModal) {
        oldModal.remove();
    }

    var overlay = document.createElement('div');
    overlay.className = 'amp-modal-overlay active';
    overlay.id = 'breakModal';
    overlay.style.display = 'flex';
    overlay.style.zIndex = '1500';
    overlay.style.pointerEvents = 'auto';

    overlay.innerHTML = `
        <div class="amp-modal">
            <div class="amp-modal-header">
                <h2><i class="fas fa-coffee"></i> ПЕРЕРЫВ — выбор амф</h2>
                <button class="amp-modal-close" id="breakModalClose" style="display:none;">&times;</button>
            </div>
            <div style="margin-bottom: 1.5rem; color: #c2b9d4; text-align: center;">
                Каждому игроку нужно выбрать 1 амфу из доступной категории
            </div>
            <div id="breakModalContent"></div>
            <div class="amp-modal-confirm">
                <button id="breakModalConfirm">Продолжить →</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            // Не закрываем по клику вне
        }
    });

    var content = document.getElementById('breakModalContent');
    var breakSelections = {};

    escState.players.forEach(function(player, idx) {
        var section = document.createElement('div');
        section.style.cssText = 'margin-bottom: 1.5rem; border-bottom: 1px solid rgba(220,90,50,0.1); padding-bottom: 1rem;';
        
        var title = document.createElement('div');
        title.style.cssText = 'font-weight: 600; color: #ffbc9a; margin-bottom: 0.8rem; text-align: center; font-size: 1.1rem;';
        title.innerHTML = '<i class="fas fa-user"></i> ' + player;
        section.appendChild(title);

        if (areAllCategoriesComplete(idx)) {
            var completeMsg = document.createElement('div');
            completeMsg.style.cssText = 'text-align: center; color: #2ecc71; padding: 0.5rem;';
            completeMsg.innerHTML = '<i class="fas fa-check-circle"></i> Все улучшения применены';
            section.appendChild(completeMsg);
            content.appendChild(section);
            breakSelections[idx] = null;
            return;
        }

        var availableCategories = ampCategories.filter(function(cat) {
            return !isCategoryComplete(idx, cat);
        });
        var randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        
        var availableAmps = getAvailableAmpsByCategory(idx, randomCategory);
        var shuffled = availableAmps.slice().sort(function() { return Math.random() - 0.5; });
        var displayAmps = shuffled.slice(0, 3);

        var catLabel = document.createElement('div');
        catLabel.style.cssText = 'text-align: center; color: #e16d48; font-size: 0.85rem; margin-bottom: 0.8rem;';
        catLabel.innerHTML = '<i class="fas fa-tag"></i> Категория: ' + randomCategory;
        section.appendChild(catLabel);

        var wrapper = document.createElement('div');
        wrapper.className = 'selection-wrapper';

        var grid = document.createElement('div');
        grid.className = 'selection-grid';

        breakSelections[idx] = null;

        if (displayAmps.length === 0) {
            for (var i = 0; i < 3; i++) {
                var emptyItem = document.createElement('div');
                emptyItem.className = 'selection-item';
                emptyItem.style.opacity = '0.5';
                emptyItem.style.cursor = 'default';
                emptyItem.innerHTML = `
                    <div style="font-size: 3rem; color: #555;">⛔</div>
                    <div class="item-name" style="color: #555;">ПУСТО</div>
                `;
                grid.appendChild(emptyItem);
            }
            breakSelections[idx] = 'skip';
        } else {
            displayAmps.forEach(function(amp) {
                var item = document.createElement('div');
                item.className = 'selection-item';
                item.innerHTML = `
                    <img src="${amp.image}" alt="${amp.name}" onerror="this.src='https://placehold.co/100x100/1a1a2e/e16d48?text=?'" style="width:100px; height:100px;">
                    <div class="item-name">${amp.name}</div>
                    <div style="font-size: 0.6rem; color: #666;">${amp.category}</div>
                `;
                item.addEventListener('click', function() {
                    grid.querySelectorAll('.selection-item').forEach(function(el) {
                        el.classList.remove('selected');
                    });
                    this.classList.add('selected');
                    breakSelections[idx] = amp.name;
                    unlockAmpForPlayer(idx, amp.name);
                    checkBreakReady();
                });
                grid.appendChild(item);
            });
            
            if (displayAmps.length < 3) {
                for (var j = displayAmps.length; j < 3; j++) {
                    var emptyItem = document.createElement('div');
                    emptyItem.className = 'selection-item';
                    emptyItem.style.opacity = '0.5';
                    emptyItem.style.cursor = 'default';
                    emptyItem.innerHTML = `
                        <div style="font-size: 3rem; color: #555;">⛔</div>
                        <div class="item-name" style="color: #555;">ПУСТО</div>
                    `;
                    grid.appendChild(emptyItem);
                }
            }
        }

        wrapper.appendChild(grid);
        section.appendChild(wrapper);
        content.appendChild(section);
    });

    function checkBreakReady() {
        var ready = true;
        escState.players.forEach(function(_, idx) {
            if (!areAllCategoriesComplete(idx) && !breakSelections[idx]) {
                ready = false;
            }
        });
        var confirmBtn = document.getElementById('breakModalConfirm');
        if (confirmBtn) confirmBtn.disabled = !ready;
    }
    checkBreakReady();

    var confirmBtn = document.getElementById('breakModalConfirm');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function() {
            escState.players.forEach(function(_, idx) {
                if (breakSelections[idx] && breakSelections[idx] !== 'skip') {
                    var category = ampCategories.find(function(cat) {
                        var amp = ampsData.find(function(a) { return a.name === breakSelections[idx]; });
                        return amp && amp.category === cat;
                    });
                    if (category) {
                        if (!escState.ampSelections[idx]) escState.ampSelections[idx] = {};
                        escState.ampSelections[idx][category] = breakSelections[idx];
                        
                        if (!escState.usedAmps[idx]) escState.usedAmps[idx] = [];
                        if (escState.usedAmps[idx].indexOf(breakSelections[idx]) === -1) {
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
        isFirstRun: true,
        usedBigTrials: [],
        usedSmallTrials: [],
        nostophobiaCount: 0,
        usedVariators: []
    };
    
    var buttons = document.querySelectorAll('#escPlayerCountOptions .player-count-btn');
    buttons.forEach(function(b) { b.classList.remove('selected'); });
    
    var step1Next = document.getElementById('escStep1Next');
    if (step1Next) step1Next.disabled = true;
    
    var result = document.getElementById('escResult');
    if (result) {
        result.classList.remove('active');
        result.style.display = 'none';
    }
    
    updateLevelCounter();
    goToEscStep(1);
    
    var modal = document.getElementById('ampModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ МОДАЛЬНЫХ ОКОН
// ============================================================

function initConfirmModal() {
    var cancelBtn = document.getElementById('confirmCancel');
    var exitBtn = document.getElementById('confirmExit');
    var modal = document.getElementById('confirmModal');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (modal) modal.classList.remove('active');
        });
    }

    if (exitBtn) {
        exitBtn.addEventListener('click', function() {
            if (modal) modal.classList.remove('active');
            resetEscalation();
        });
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    }
}

// ============================================================
// ЗАПУСК ЭСКАЛАЦИИ
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Запуск эскалации...');
    
    if (document.getElementById('escalationWrapper')) {
        console.log('✅ Страница эскалации найдена');
        
        setTimeout(function() {
            if (typeof mapsData === 'undefined') {
                console.error('❌ Данные не загружены!');
                var wrapper = document.querySelector('.escalation-wrapper');
                if (wrapper) {
                    wrapper.innerHTML = `
                        <div style="text-align: center; padding: 3rem; color: #e16d48;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; display: block; margin-bottom: 1rem;"></i>
                            <h2>Ошибка загрузки данных</h2>
                            <p style="color: #c2b9d4; margin-top: 0.5rem;">Не удалось загрузить необходимые данные.<br>Проверьте подключение JS файлов.</p>
                            <a href="roulette.html" style="display: inline-block; margin-top: 1.5rem; color: #e16d48; text-decoration: none; border: 1px solid #e16d48; padding: 0.5rem 2rem; border-radius: 30px;">Вернуться к рулетке</a>
                        </div>
                    `;
                }
                return;
            }
            
            console.log('✅ Данные загружены:');
            console.log('  - mapsData:', mapsData.length, 'карт');
            console.log('  - equipmentData:', equipmentData.length, 'снаряжений');
            console.log('  - ampsData:', ampsData.length, 'амф');
            console.log('  - ampCategories:', ampCategories);
            console.log('  - trialsData:', Object.keys(trialsData).length, 'карт с испытаниями');
            console.log('  - allVariatorsData:', allVariatorsData.length, 'вариаторов');
            
            initEscalation();
            initAmpModal();
            initConfirmModal();
            updateLevelCounter();
            
            console.log('✅ Эскалация инициализирована!');
        }, 300);
    }
});
