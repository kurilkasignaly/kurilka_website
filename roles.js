const roles = [
  /* ==================== КАСТОМНЫЕ РОЛИ ==================== */
  {
    name: "🐭 Агрессивная коротышка",
    category: "🎭 Кастомные роли",
    color: "#5a1e4b",
    gradient: "linear-gradient(135deg, #f3c6e5 0%, #e9b3da 100%)",
    border: "#d79bc8",
    glow: "rgba(215, 155, 200, 0.65)",
    description: "Личная роль для определенного участника сервера (Администратор)",
    details: ""
  },
  {
    name: "ЧСВ",
    category: "🎭 Кастомные роли",
    color: "#5a1e4b",
    gradient: "linear-gradient(135deg, #f3d0e8 0%, #ecc1e0 100%)",
    border: "#d79bc8",
    glow: "rgba(215, 155, 200, 0.65)",
    description: "Жизнь Реагента (Администратор)",
    details: ""
  },
  {
    name: "🐀 Крыса курилки",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #ff2d6a 0%, #ff5c8a 100%)",
    border: "#ff4d7d",
    glow: "rgba(255, 77, 125, 0.7)",
    description: "Жизнь Реагента (Администратор)",
    details: ""
  },
  {
    name: "🌐 Интернет-Эксперт курилки",
    category: "🎭 Кастомные роли",
    color: "#2b3a1a",
    gradient: "linear-gradient(135deg, #c6e77a 0%, #b6dc63 100%)",
    border: "#a5cf52",
    glow: "rgba(165, 207, 82, 0.65)",
    description: "Жизнь Реагента (Администратор)",
    details: ""
  },
  {
    name: "🎭 Мемолог",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #1f78c8 0%, #3fa0e6 100%)",
    border: "#3396e0",
    glow: "rgba(51, 150, 224, 0.7)",
    description: "Жизнь Реагента (Администратор)",
    details: ""
  },
  {
    name: "🌙 Ночной философ курилки",
    category: "🎭 Кастомные роли",
    color: "#5a1e4b",
    gradient: "linear-gradient(135deg, #f3d0e8 0%, #ecc1e0 100%)",
    border: "#d79bc8",
    glow: "rgba(215, 155, 200, 0.65)",
    description: "Жизнь Реагента (Администратор)",
    details: ""
  },
  {
    name: "⌛ Живая легенда",
    category: "🎭 Кастомные роли",
    color: "#4a3a00",
    gradient: "linear-gradient(135deg, #fff34a 0%, #ffe830 100%)",
    border: "#f5d700",
    glow: "rgba(245, 215, 0, 0.7)",
    description: "Жизнь Реагента (Администратор)",
    details: ""
  },
  {
    name: "Ното Агеа",
    category: "🎭 Кастомные роли",
    color: "#5a1e4b",
    gradient: "linear-gradient(135deg, #f3c6e5 0%, #e9b3da 100%)",
    border: "#d79bc8",
    glow: "rgba(215, 155, 200, 0.65)",
    description: "Жизнь Реагента (Администратор)",
    details: ""
  },
  {
    name: "🚬 Никотиновый Магнат",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #4a2b0a 0%, #6b4218 100%)",
    border: "#7a4d1c",
    glow: "rgba(122, 77, 28, 0.65)",
    description: "Жизнь Реагента (Администратор)",
    details: ""
  },
  {
    name: "🎀 Sad Girl",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #ff2d6a 0%, #ff5c8a 100%)",
    border: "#ff4d7d",
    glow: "rgba(255, 77, 125, 0.7)",
    description: "Жизнь Реагента (Администратор)",
    details: ""
  },
  {
    name: "🍒 Пикми из Ягодной Дырки",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #ff2d6a 0%, #ff5c8a 100%)",
    border: "#ff4d7d",
    glow: "rgba(255, 77, 125, 0.7)",
    description: "Жизнь Реагента (Администратор)",
    details: ""
  },
  {
    name: "СУЕТЛАНА",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #d81b1b 0%, #f04444 100%)",
    border: "#ef3d3d",
    glow: "rgba(239, 61, 61, 0.7)",
    description: "Роль выданная в честь меря Сергея",
    details: ""
  },
  {
    name: "Олег",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #f25022 0%, #ff7043 100%)",
    border: "#ff6a3a",
    glow: "rgba(255, 106, 58, 0.7)",
    description: "Жизнь Реагента (Администратор)",
    details: ""
  },
  {
    name: "😈 Верховный Хейтер",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #10245a 0%, #1e3a7a 100%)",
    border: "#20407f",
    glow: "rgba(32, 64, 127, 0.7)",
    description: "Жизнь Реагента (Администратор)",
    details: ""
  },
  {
    name: "🐭 Крыска младшая",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #6a3b4a 0%, #8b5a6a 100%)",
    border: "#9b6b7a",
    glow: "rgba(155, 107, 122, 0.65)",
    description: "Жизнь Реагента (Участник Сервера)",
    details: ""
  },
  {
    name: "🖤 Сертифицированная Лапочка",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #7b1a3a 0%, #a32854 100%)",
    border: "#a32854",
    glow: "rgba(163, 40, 84, 0.7)",
    description: "Жизнь Реагента (Администратор)",
    details: ""
  },
  {
    name: "🎩 Аристократ хаоса",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #4a0e3a 0%, #6a1a52 100%)",
    border: "#6a1a52",
    glow: "rgba(106, 26, 82, 0.7)",
    description: "Жизнь Реагента (Администратор)",
    details: ""
  },
  {
    name: "💙 Голубой",
    category: "🎭 Кастомные роли",
    color: "#ffffff",
    gradient: "linear-gradient(135deg, #00b4d8 0%, #48cae4 100%)",
    border: "#00b4d8",
    glow: "rgba(0, 180, 216, 0.7)",
    description: "Жизнь Реагента (Участник Сервера)",
    details: ""
  }
];
