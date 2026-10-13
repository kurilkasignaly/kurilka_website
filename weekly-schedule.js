// ============================================================
// РАСПИСАНИЕ ЕЖЕНЕДЕЛЬНОЙ ЭСКАЛАЦИИ (3 НЕДЕЛИ)
// ============================================================
// ВАЖНО: Время указывается по МСК (UTC+3).
// Ваш браузер автоматически переведёт это в казахстанское время (UTC+5).
//
// Обновление — каждый вторник в 21:00 МСК = 23:00 по времени Казахстана.
//
// Формат: 'ГГГГ-ММ-ДДTЧЧ:ММ:СС+03:00' — где +03:00 — это МСК.

var WEEKLY_SCHEDULE = [
    {
        date: '2026-10-13T21:00:00+03:00', // 13.10.2026 23:00 по Казахстану
        name: 'Не Шумите',
        image: 'images/вариатор-не шумите.webp'
    },
    {
        date: '2026-10-20T21:00:00+03:00', // 20.10.2026 23:00 по Казахстану
        name: 'Галлюцинации',
        image: 'images/вариатор-галлюцинации.webp'
    },
    {
        date: '2026-10-27T21:00:00+03:00', // 27.10.2026 23:00 по Казахстану
        name: 'Кровотечение',
        image: 'images/вариатор-кровотечение.webp'
    }
];

// ============================================================
// АКТИВНЫЙ ВАРИАТОР НА ТЕКУЩИЙ МОМЕНТ
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

    if (!active && WEEKLY_SCHEDULE.length > 0) {
        active = WEEKLY_SCHEDULE[0];
    }

    return active;
}

// Экспорт
window.WEEKLY_SCHEDULE = WEEKLY_SCHEDULE;
window.getActiveWeeklyVariator = getActiveWeeklyVariator;
