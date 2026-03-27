import { BugReportTask, WriteTestTask } from '../../types';

export const WRITE_TEST_TASKS: WriteTestTask[] = [
  {
    id: 'write_test1', type: 'write_test', icon: '📝', xp: 35, color: '#a855f7',
    title: 'Напиши тест-кейс',
    desc: 'Составь грамотный тест-кейс на основе требования. Проверяется структура и конкретика.',
    requirement: 'Система восстановления пароля: пользователь вводит email, получает ссылку на почту. Ссылка должна быть одноразовой и действовать 24 часа.',
    checkItems: [
      { label: "Название содержит 'Восстановление пароля'", check: v => v.title?.toLowerCase().includes('восстановление пароля') ?? false },
      { label: 'В шагах указан ввод email', check: v => v.steps?.toLowerCase().includes('email') || v.steps?.toLowerCase().includes('почт') || false },
      { label: 'В ожидаемом результате есть проверка ссылки', check: v => v.expected?.toLowerCase().includes('ссылк') ?? false },
      { label: 'Указано предусловие (наличие аккаунта)', check: v => v.precond?.toLowerCase().includes('зарегистрирован') || v.precond?.toLowerCase().includes('аккаунт') || false },
    ],
    solution: {
      title: 'Восстановление пароля через валидный email',
      precondition: 'Пользователь зарегистрирован в системе, имеет доступ к почте',
      steps: [
        'Открыть страницу логина',
        "Нажать 'Забыли пароль?'",
        'Ввести валидный email (test@example.com)',
        "Нажать 'Отправить ссылку'",
      ],
      expected: 'Отображается сообщение об отправке. На почту приходит письмо с уникальной ссылкой.',
    },
  },
  {
    id: 'write_test2', type: 'write_test', icon: '📅', xp: 40, color: '#3b82f6',
    title: 'Тестирование календаря',
    desc: 'Напиши тест-кейсы для виджета выбора даты (Date Picker).',
    requirement: "Поле 'Дата рождения'. Должно принимать даты от 01.01.1900 до текущей даты. Учитывать високосные годы.",
    checkItems: [
      { label: 'Проверка 29 февраля в високосный год', check: v => v.steps?.toLowerCase().includes('29') && v.steps?.toLowerCase().includes('феврал') || false },
      { label: 'Проверка будущего времени (невалидно)', check: v => v.expected?.toLowerCase().includes('ошибк') || v.expected?.toLowerCase().includes('нельзя') || false },
      { label: 'Проверка нижней границы (1900 год)', check: v => v.steps?.includes('1900') ?? false },
    ],
    solution: {
      title: 'Валидация граничных дат в календаре',
      precondition: 'Открыта форма регистрации',
      steps: [
        'Выбрать дату 29.02.2024 (високосный)',
        'Выбрать дату 01.01.1900 (нижняя граница)',
        'Попробовать ввести завтрашнюю дату',
      ],
      expected: '2024 и 1900 принимаются. Будущая дата блокируется или выдает ошибку.',
    },
  },
  {
    id: 'write_test3', type: 'write_test', icon: '🛒', xp: 45, color: '#10b981',
    title: 'Тестирование корзины',
    desc: 'Напиши негативные тест-кейсы для корзины интернет-магазина.',
    requirement: 'Корзина должна позволять добавлять товары, изменять количество (1-99) и применять один промокод.',
    checkItems: [
      { label: 'Проверка ввода 0 или отрицательного количества', check: v => v.steps?.includes('0') || v.steps?.includes('-') || false },
      { label: 'Проверка ввода букв в поле количества', check: v => v.steps?.toLowerCase().includes('букв') || v.steps?.toLowerCase().includes('текст') || false },
      { label: 'Проверка применения двух промокодов', check: v => v.steps?.toLowerCase().includes('два') || v.steps?.toLowerCase().includes('второй') || false },
    ],
    solution: {
      title: 'Негативные сценарии работы с корзиной',
      precondition: 'В корзине есть 1 товар',
      steps: [
        'Изменить количество товара на 0',
        "Ввести в поле количества текст 'abc'",
        "Применить промокод 'SALE10', затем попробовать применить 'GIFT20'",
      ],
      expected: 'Количество не меняется или выдает ошибку. Второй промокод заменяет первый или отклоняется.',
    },
  },
  {
    id: 'write_test4', type: 'write_test', icon: '📁', xp: 40, color: '#f59e0b',
    title: 'Загрузка файлов',
    desc: 'Напиши тест-кейсы для компонента загрузки аватара.',
    requirement: 'Принимаются файлы: JPG, PNG. Макс размер: 2МБ. Миниатюра должна отображаться сразу после выбора.',
    checkItems: [
      { label: 'Проверка загрузки файла .exe или .pdf', check: v => v.steps?.toLowerCase().includes('exe') || v.steps?.toLowerCase().includes('pdf') || false },
      { label: 'Проверка файла размером 3МБ', check: v => v.steps?.includes('3') || v.steps?.toLowerCase().includes('больше') || false },
      { label: 'Проверка отображения превью', check: v => v.expected?.toLowerCase().includes('превью') || v.expected?.toLowerCase().includes('миниатюр') || false },
    ],
    solution: {
      title: 'Тестирование валидации загрузки аватара',
      precondition: 'Открыт профиль пользователя',
      steps: [
        "Выбрать файл 'virus.exe'",
        "Выбрать картинку 'large.jpg' весом 5МБ",
        "Выбрать валидный 'photo.png' весом 1МБ",
      ],
      expected: 'Система выдает ошибку на .exe и большой файл. Для .png отображается миниатюра.',
    },
  },
  {
    id: 'write_test5', type: 'write_test', icon: '🔍', xp: 50, color: '#8b5cf6',
    title: 'Сложный поиск',
    desc: 'Напиши тест-кейсы для фильтра поиска авиабилетов.',
    requirement: 'Фильтры: Город (откуда/куда), Дата, Количество пассажиров (1-9), Класс (Эконом/Бизнес).',
    checkItems: [
      { label: 'Проверка 10 пассажиров (граничное значение)', check: v => v.steps?.includes('10') || v.steps?.toLowerCase().includes('гранич') || false },
      { label: 'Проверка даты в прошлом', check: v => v.steps?.toLowerCase().includes('прошл') || v.steps?.toLowerCase().includes('вчера') || false },
      { label: 'Проверка одинаковых городов (откуда = куда)', check: v => v.steps?.toLowerCase().includes('одинак') || v.steps?.toLowerCase().includes('тот же') || false },
    ],
    solution: {
      title: 'Тестирование фильтров поиска билетов',
      precondition: 'Главная страница поиска',
      steps: [
        "Выбрать город 'Москва' в обоих полях",
        "Выбрать дату 'вчера'",
        'Указать 10 пассажиров',
      ],
      expected: 'Система выдает ошибки валидации: города должны быть разными, дата не может быть в прошлом, лимит 9 человек.',
    },
  },
];

export const BUG_REPORT_TASKS: BugReportTask[] = [
  {
    id: 'bug_report1', type: 'bug_report', icon: '🐛', xp: 40, color: '#ec4899',
    title: 'Оформи баг-репорт',
    desc: 'Опиши найденный баг максимально профессионально.',
    scenario: "Ты нажал кнопку 'Оформить заказ' в корзине, и приложение просто закрылось (вылетело на рабочий стол). В корзине был один товар: 'iPhone 15'.",
    checkItems: [
      { label: "Заголовок содержит 'Crash' или 'Вылет'", check: v => v.title?.toLowerCase().includes('crash') || v.title?.toLowerCase().includes('вылет') || false },
      { label: 'В шагах указана корзина', check: v => v.steps?.toLowerCase().includes('корзин') || false },
      { label: 'Указан конкретный товар', check: v => v.steps?.toLowerCase().includes('iphone') || false },
      { label: 'Заголовок отражает критичность падения', check: v => v.title?.toLowerCase().includes('crash') || v.title?.toLowerCase().includes('вылет') || v.actual?.toLowerCase().includes('аварийн') || false },
    ],
    solution: {
      title: "[Checkout] Crash при нажатии 'Оформить заказ' с iPhone 15 в корзине",
      steps: [
        "Добавить 'iPhone 15' в корзину",
        'Перейти в корзину',
        "Нажать кнопку 'Оформить заказ'",
      ],
      actual: 'Приложение аварийно завершается (Crash)',
      expected: 'Открывается экран выбора способа оплаты',
      severity: 'Critical',
    },
  },
  {
    id: 'bug_report2', type: 'bug_report', icon: '📡', xp: 45, color: '#ef4444',
    title: 'Сложный баг-репорт',
    desc: "Опиши 'плавающий' баг (Race Condition).",
    scenario: 'В чате при одновременной отправке сообщения двумя пользователями, сообщения иногда меняются местами или одно из них пропадает. Воспроизводится примерно 2 раза из 10.',
    checkItems: [
      { label: 'Указана частота воспроизведения (2/10)', check: v => v.steps?.includes('2/10') || v.steps?.toLowerCase().includes('иногда') || false },
      { label: "Заголовок содержит 'Race Condition' или 'Порядок'", check: v => v.title?.toLowerCase().includes('race') || v.title?.toLowerCase().includes('порядок') || false },
      { label: 'Описаны действия двух пользователей', check: v => v.steps?.toLowerCase().includes('дву') || v.steps?.toLowerCase().includes('одновремен') || false },
    ],
    solution: {
      title: '[Chat] Race condition: нарушение порядка сообщений при одновременной отправке',
      steps: [
        'Открыть один чат с двух разных аккаунтов',
        "Одновременно (в одну секунду) отправить сообщения 'A' и 'B'",
        'Повторить 10 раз',
      ],
      actual: "В 2 случаях из 10 сообщение 'B' отображается перед 'A' или пропадает",
      expected: 'Сообщения отображаются в строгом хронологическом порядке получения сервером',
      severity: 'Major',
    },
  },
  {
    id: 'bug_report3', type: 'bug_report', icon: '🔓', xp: 60, color: '#ef4444',
    title: 'Security: IDOR уязвимость',
    desc: 'Опиши баг, позволяющий видеть чужие заказы через смену ID в URL.',
    requirement: 'URL заказа: /orders/123. Если сменить 123 на 124, открывается заказ другого пользователя.',
    checkItems: [
      { label: 'Указание уязвимости IDOR', check: v => v.title?.toLowerCase().includes('idor') || v.desc?.toLowerCase().includes('доступ к чужим') || false },
      { label: 'Шаги со сменой ID в URL', check: v => v.steps?.includes('URL') || v.steps?.includes('ID') || false },
      { label: 'Ожидаемый результат: 403 Forbidden', check: v => v.expected?.includes('403') || v.expected?.toLowerCase().includes('запрещен') || false },
    ],
    solution: {
      title: '[Security] IDOR: Доступ к чужим заказам через URL',
      steps: [
        'Авторизоваться под User A',
        'Перейти в заказ /orders/100',
        'Сменить в адресной строке 100 на 101 (заказ User B)',
      ],
      expected: 'Система должна вернуть 403 Forbidden или 404 Not Found. Сейчас открывается заказ User B.',
    },
  },
];
