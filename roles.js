const roles = [
  /* ==================== КАСТОМНЫЕ РОЛИ ==================== */
  {
    name: "🐭 Агрессивная коротышка",
    category: "🎭 Кастомные роли",
    color: "#5a1e4b",
    gradient: "linear-gradient(135deg, #f3c6e5 0%, #e9b3da 100%)",
    border: "#d79bc8",
    glow: "rgba(215, 155, 200, 0.65)",
    description: "Личная Роль (Администрации)",
    details: ""
  },
  {
    name: "ЧСВ",
    category: "🎭 Кастомные роли",
    color: "#5a1e4b",
    gradient: "linear-gradient(135deg, #f3d0e8 0%, #ecc1e0 100%)",
    border: "#d79bc8",
    glow: "rgba(215, 155, 200, 0.65)",
    description: "Личная Роль (Администрации)",
    details: ""
  },
  {
    name: "🐀 Крыса курилки",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #ff2d6a 0%, #ff5c8a 100%)",
    border: "#ff4d7d",
    glow: "rgba(255, 77, 125, 0.7)",
    description: "Личная Роль (Администрации)",
    details: ""
  },
  {
    name: "🌐 Интернет-Эксперт курилки",
    category: "🎭 Кастомные роли",
    color: "#2b3a1a",
    gradient: "linear-gradient(135deg, #c6e77a 0%, #b6dc63 100%)",
    border: "#a5cf52",
    glow: "rgba(165, 207, 82, 0.65)",
    description: "Личная Роль (Администрации)",
    details: ""
  },
  {
    name: "🎭 Мемолог",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #1f78c8 0%, #3fa0e6 100%)",
    border: "#3396e0",
    glow: "rgba(51, 150, 224, 0.7)",
    description: "Личная Роль (Администрации)",
    details: ""
  },
  {
    name: "🌙 Ночной философ курилки",
    category: "🎭 Кастомные роли",
    color: "#5a1e4b",
    gradient: "linear-gradient(135deg, #f3d0e8 0%, #ecc1e0 100%)",
    border: "#d79bc8",
    glow: "rgba(215, 155, 200, 0.65)",
    description: "Личная Роль (Администрации)",
    details: ""
  },
  {
    name: "⌛ Живая легенда",
    category: "🎭 Кастомные роли",
    color: "#4a3a00",
    gradient: "linear-gradient(135deg, #fff34a 0%, #ffe830 100%)",
    border: "#f5d700",
    glow: "rgba(245, 215, 0, 0.7)",
    description: "Личная Роль (Администрации)",
    details: ""
  },
  {
    name: "Ноmо Аrеа",
    category: "🎭 Кастомные роли",
    color: "#5a1e4b",
    gradient: "linear-gradient(135deg, #f3c6e5 0%, #e9b3da 100%)",
    border: "#d79bc8",
    glow: "rgba(215, 155, 200, 0.65)",
    description: "Личная Роль (Администрации)",
    details: ""
  },
  {
    name: "🚬 Никотиновый Магнат",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #4a2b0a 0%, #6b4218 100%)",
    border: "#7a4d1c",
    glow: "rgba(122, 77, 28, 0.65)",
    description: "Личная Роль (Администрации)",
    details: ""
  },
  {
    name: "🎀 Sad Girl",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #ff2d6a 0%, #ff5c8a 100%)",
    border: "#ff4d7d",
    glow: "rgba(255, 77, 125, 0.7)",
    description: "Личная Роль (Администрации)",
    details: ""
  },
  {
    name: "🍒 Пикми из Ягодной Дырки",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #ff2d6a 0%, #ff5c8a 100%)",
    border: "#ff4d7d",
    glow: "rgba(255, 77, 125, 0.7)",
    description: "Личная Роль (Администрации)",
    details: ""
  },
  {
    name: "СУЕТЛАНА",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #d81b1b 0%, #f04444 100%)",
    border: "#ef3d3d",
    glow: "rgba(239, 61, 61, 0.7)",
    description: "Роль выданная в честь мема СУЕТЛАНА",
    details: ""
  },
  {
    name: "Олег",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #f25022 0%, #ff7043 100%)",
    border: "#ff6a3a",
    glow: "rgba(255, 106, 58, 0.7)",
    description: "Личная Роль Участнику Сервера",
    details: ""
  },
  {
    name: "😈 Верховный Хейтер",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #10245a 0%, #1e3a7a 100%)",
    border: "#20407f",
    glow: "rgba(32, 64, 127, 0.7)",
    description: "Личная Роль Участнику Сервера",
    details: ""
  },
  {
    name: "🐭 Крыска младшая",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #6a3b4a 0%, #8b5a6a 100%)",
    border: "#9b6b7a",
    glow: "rgba(155, 107, 122, 0.65)",
    description: "Личная Роль Участнику Сервера",
    details: ""
  },
  {
    name: "🖤 Сертифицированная Лапочка",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #7b1a3a 0%, #a32854 100%)",
    border: "#a32854",
    glow: "rgba(163, 40, 84, 0.7)",
    description: "Личная Роль Участнику Сервера",
    details: ""
  },
  {
    name: "🎩 Аристократ хаоса",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #4a0e3a 0%, #6a1a52 100%)",
    border: "#6a1a52",
    glow: "rgba(106, 26, 82, 0.7)",
    description: "Личная Роль Участнику Сервера",
    details: ""
  },
  {
    name: "💙 Голубой",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #00b4d8 0%, #48cae4 100%)",
    border: "#00b4d8",
    glow: "rgba(0, 180, 216, 0.7)",
    description: "Личная Роль Участнику Сервера",
    details: ""
  },

  /* ==================== ОБЩИЕ РОЛИ (продолжение) ==================== */
  {
    name: "🧊 Лёдный",
    category: "👥 Основные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #6b6b6b 0%, #8a8a8a 100%)",
    border: "#7a7a7a",
    glow: "rgba(122, 122, 122, 0.65)",
    description: "Базовая роль выдаётся всем участникам сервера",
    details: ""
  },
  {
    name: "🌟 Спонсор Курилки",
    category: "💎 Платные / VIP роли",
    color: "#4a3a00",
    gradient: "linear-gradient(135deg, #ffe79a 0%, #fbd76a 100%)",
    border: "#f5c842",
    glow: "rgba(245, 200, 66, 0.7)",
    description: "Данную роль можно получить, поддержав сервер своим бустом ❤️",
    details: ""
  },
  {
    name: "💨 Дымок",
    category: "👥 Основные роли",
    color: "#0d3c5e",
    gradient: "linear-gradient(135deg, #b8e6f0 0%, #9ad9e8 100%)",
    border: "#79c8dc",
    glow: "rgba(121, 200, 220, 0.65)",
    description: "Базовая роль выдаётся парням",
    details: ""
  },
  {
    name: "💗 Дымка",
    category: "👥 Основные роли",
    color: "#7a1240",
    gradient: "linear-gradient(135deg, #f6c6e0 0%, #f0b3d4 100%)",
    border: "#e69cc4",
    glow: "rgba(230, 156, 196, 0.65)",
    description: "Базовая роль выдаётся девушкам",
    details: ""
  },
  {
    name: "🌙 Лунный круг",
    category: "✨ Бонусные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #5b0e8a 0%, #7b1fa2 100%)",
    border: "#7b1fa2",
    glow: "rgba(123, 31, 162, 0.7)",
    description: "Участники пришедшие с Twitch",
    details: ""
  },
  {
    name: "📢 В рекомендациях",
    category: "✨ Бонусные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #0f5fa8 0%, #1e78c8 100%)",
    border: "#1e78c8",
    glow: "rgba(30, 120, 200, 0.7)",
    description: "Участники пришедшие с TikTok",
    details: ""
  },
  {
    name: "🧡 Коротышки френдли",
    category: "✨ Бонусные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #e67320 0%, #ff8c3a 100%)",
    border: "#ff8c3a",
    glow: "rgba(255, 140, 58, 0.7)",
    description: "Друзья Администрации",
    details: ""
  },
  {
    name: "Оглушение",
    category: "👥 Основные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #e60012 0%, #ff2a2a 100%)",
    border: "#ff2a2a",
    glow: "rgba(255, 42, 42, 0.7)",
    description: "Участник сервера предпочитает играть в Оглушение",
    details: ""
  },
  {
    name: "Завеса",
    category: "👥 Основные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #6a1fa8 0%, #8e44ad 100%)",
    border: "#8e44ad",
    glow: "rgba(142, 68, 173, 0.7)",
    description: "Участник сервера предпочитает играть в Завесу",
    details: ""
  },
  {
    name: "Исцеление",
    category: "👥 Основные роли",
    color: "#0d3c3a",
    gradient: "linear-gradient(135deg, #6fd6d0 0%, #4fc3bc 100%)",
    border: "#3fb0a9",
    glow: "rgba(63, 176, 169, 0.65)",
    description: "Участник сервера предпочитает играть в Исцеление",
    details: ""
  },
  {
    name: "Глушилка",
    category: "👥 Основные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #f5821f 0%, #ff9b3a 100%)",
    border: "#ff9b3a",
    glow: "rgba(255, 155, 58, 0.7)",
    description: "Участник сервера предпочитает играть в Глушилку",
    details: ""
  },
  {
    name: "Баррикада",
    category: "👥 Основные роли",
    color: "#4a3a00",
    gradient: "linear-gradient(135deg, #ffe71f 0%, #fbd500 100%)",
    border: "#f5c800",
    glow: "rgba(245, 200, 0, 0.7)",
    description: "Участник сервера предпочитает играть в Баррикаду",
    details: ""
  },
  {
    name: "Рентген",
    category: "👥 Основные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #4ba36b 0%, #5fbc80 100%)",
    border: "#5fbc80",
    glow: "rgba(95, 188, 128, 0.7)",
    description: "Участник сервера предпочитает играть в Рентген",
    details: ""
  },
  {
    name: "🧿 Всевидящие",
    category: "✨ Бонусные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #4a2b0a 0%, #6b4218 100%)",
    border: "#7a4d1c",
    glow: "rgba(122, 77, 28, 0.65)",
    description: "Особая роль для избранных участников сервера",
    details: ""
  },
  {
    name: "🩸 Добрая кровь",
    category: "🎉 Ивент роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #e6005c 0%, #ff2a7a 100%)",
    border: "#ff2a7a",
    glow: "rgba(255, 42, 122, 0.7)",
    description: "Данную роль можно получить следующим образом: Пройти (все задания/миссии) программы \"Сдача Крови\" на сложности ПСИХОХИРУРГИЯ на оценку А+",
    details: "Получение данной роли:\n<br>Для получение данной роли нужно предоставить следующий (1) скриншот. ВНИМАНИЕ! Скриншоты должны быть полноэкранного размера как показано на Рисунке 1 (обрезать скрины нельзя!) \n<img src=\"images/Кровь ивент.webp\">\n<div class='center-text'>Рисунок 1. Пример скриншота на отправку для получения роли \"🩸 Добрая кровь\"</div>"
  },
  {
    name: "☢️ Токсичный Объект",
    category: "🎉 Ивент роли",
    color: "#5a6b1a",
    gradient: "linear-gradient(135deg, #d4e84a 0%, #c2d93a 100%)",
    border: "#a8c22a",
    glow: "rgba(168, 194, 42, 0.65)",
    description: "Данную роль можно получить следующим образом: Пройти (все задания/миссии) программы \"Утечка химикатов\" на сложности ПСИХОХИРУРГИЯ на оценку А+",
    details: "Получение данной роли:\n<br>Для получение данной роли нужно предоставить следующий (1) скриншот. ВНИМАНИЕ! Скриншоты должны быть полноэкранного размера как показано на Рисунке 1 (обрезать скрины нельзя!) \n<img src=\"images/Газ ивент.webp\">\n<div class='center-text'>Рисунок 1. Пример скриншота на отправку для получения роли \"☢️ Токсичный Объект\"</div>"
  }
];
