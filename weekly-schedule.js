// ============================================================
// РАСПИСАНИЕ ЕЖЕНЕДЕЛЬНОЙ ЭСКАЛАЦИИ
// ============================================================
// Каждый вторник в 21:00 МСК происходит автоматическое обновление.
// date — дата и время (МСК), с которой начинает действовать вариатор.
// name — точное название вариатора (как в variators-all.js).
// image — путь к картинке для баннера.

var WEEKLY_SCHEDULE = [
    {
        date: '2026-10-13T21:00:00+03:00',
        name: 'Таймер Бомбы',
        image: 'images/вариатор-таймербомбы.webp'
    },
    {
        date: '2026-10-20T21:00:00+03:00',
        name: 'Галлюцинации',
        image: 'images/вариатор-галлюцинации.webp'
    },
    {
        date: '2026-10-27T21:00:00+03:00',
        name: 'Кровотечение',
        image: 'images/вариатор-кровотечение.webp'
    }
];

// ============================================================
// ФУНКЦИЯ: ПОЛУЧИТЬ АКТИВНЫЙ ВАРИАТОР НА ТЕКУЩИЙ МОМЕНТ
// ============================================================
function getActiveWeeklyVariator() {
    var now = new Date();
    var active = null;

    for (var i = 0; i < WEEKLY_SCHEDULE.length; i++) {
        var item = WEEKLY_SCHEDULE[i];
        var itemDate = new Date(item.date);
        if (itemDate <= now) {
            active = item;
        } else {
            break;
        }
    }

    // Если расписание ещё не началось — берём первый элемент
    if (!active && WEEKLY_SCHEDULE.length > 0) {
        active = WEEKLY_SCHEDULE[0];
    }

    return active;
}

// ============================================================
// ФУНКЦИЯ: ПОЛУЧИТЬ СЛЕДУЮЩЕЕ ОБНОВЛЕНИЕ
// ============================================================
function getNextWeeklyUpdate() {
    var now = new Date();
    for (var i = 0; i < WEEKLY_SCHEDULE.length; i++) {
        var item = WEEKLY_SCHEDULE[i];
        var itemDate = new Date(item.date);
        if (itemDate > now) {
            return item;
        }
    }
    return null;
}

// Экспорт
window.WEEKLY_SCHEDULE = WEEKLY_SCHEDULE;
window.getActiveWeeklyVariator = getActiveWeeklyVariator;
window.getNextWeeklyUpdate = getNextWeeklyUpdate;
