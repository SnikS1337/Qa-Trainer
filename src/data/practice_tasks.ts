import type { PracticeCheckValues, PracticeTask } from '../types';

export const PRACTICE_TASKS: PracticeTask[] = [
  {
    id: 'triage1',
    type: 'triage',
    icon: '🔴',
    xp: 20,
    color: '#f87171',
    title: 'Расставь severity',
    desc: 'Определи уровень серьёзности для каждого бага в интернет-магазине. Помни: Critical блокирует всё, Major — важную часть, Minor — неудобно, Trivial — опечатки.',
    bugs: [
      {
        id: 0,
        desc: "Кнопка 'Оплатить' не реагирует на нажатие — оформить заказ невозможно",
        correct: 'critical',
        hint: 'Блокирует основную функцию продукта — оплату',
      },
      {
        id: 1,
        desc: 'Логотип компании смещён на 3 пикселя относительно макета',
        correct: 'trivial',
        hint: 'Визуальный недочёт, не влияет на функциональность',
      },
      {
        id: 2,
        desc: 'При добавлении 11-го товара в корзину — страница вылетает с ошибкой 500',
        correct: 'major',
        hint: 'Серьёзный баг (краш), но воспроизводится в специфичном сценарии',
      },
      {
        id: 3,
        desc: "Подсказка при наведении на кнопку 'Избранное' показывает 'undefined'",
        correct: 'minor',
        hint: 'Заметная проблема, но не блокирует использование',
      },
      {
        id: 4,
        desc: 'Нельзя зайти в личный кабинет — авторизация не работает для всех пользователей',
        correct: 'critical',
        hint: 'Блокирует доступ всех пользователей к системе',
      },
    ],
    severities: [
      { key: 'critical', label: 'Critical', color: '#f87171', desc: 'Система неработоспособна' },
      { key: 'major', label: 'Major', color: '#fb923c', desc: 'Серьёзная функция сломана' },
      { key: 'minor', label: 'Minor', color: '#fbbf24', desc: 'Функция работает с ограничениями' },
      { key: 'trivial', label: 'Trivial', color: '#22d3a0', desc: 'Косметический дефект' },
    ],
  },
  {
    id: 'triage2',
    type: 'triage',
    icon: '📱',
    xp: 30,
    color: '#f43f5e',
    title: 'Triage: Мобильное приложение',
    desc: 'Ты тестируешь банковское приложение. Расставь приоритеты правильно, учитывая риски для бизнеса и пользователей.',
    bugs: [
      {
        id: 0,
        desc: 'Приложение вылетает (Crash) сразу после ввода верного PIN-кода',
        correct: 'critical',
        hint: 'Пользователь вообще не может попасть в приложение',
      },
      {
        id: 1,
        desc: "В истории операций вместо 'Пополнение' написано 'Пополнене'",
        correct: 'trivial',
        hint: 'Простая опечатка, не влияющая на деньги',
      },
      {
        id: 2,
        desc: "Кнопка 'Повторить платеж' не работает, если в названии шаблона есть кавычки",
        correct: 'minor',
        hint: 'Функция работает в 99% случаев, есть обходной путь (создать новый платеж)',
      },
      {
        id: 3,
        desc: 'При переводе по номеру телефона сумма списывается, но не доходит до получателя',
        correct: 'critical',
        hint: 'Потеря денег — это всегда критический дефект',
      },
      {
        id: 4,
        desc: "Экран 'Курсы валют' загружается 15 секунд вместо положенных 2-х",
        correct: 'major',
        hint: 'Серьезная проблема с производительностью важного экрана',
      },
    ],
    severities: [
      { key: 'critical', label: 'Critical', color: '#f87171', desc: 'Блокирует работу' },
      { key: 'major', label: 'Major', color: '#fb923c', desc: 'Серьезный дефект' },
      { key: 'minor', label: 'Minor', color: '#fbbf24', desc: 'Незначительный дефект' },
      { key: 'trivial', label: 'Trivial', color: '#22d3a0', desc: 'Косметика' },
    ],
  },
  {
    id: 'find_error1',
    type: 'find_error',
    icon: '🔍',
    xp: 25,
    color: '#60a5fa',
    title: 'Ошибки в тест-кейсе',
    desc: 'Перед тобой тест-кейс с ошибками. Найди все проблемные поля и нажми на них.',
    context: 'Фича: Регистрация нового пользователя',
    fields: [
      {
        id: 'title',
        label: 'Название',
        value: 'Регистрация',
        hasError: true,
        errorExp:
          "Слишком расплывчато. Должно быть: 'Успешная регистрация нового пользователя с валидными данными'",
      },
      { id: 'precond', label: 'Предусловие', value: 'Открыт браузер', hasError: false },
      {
        id: 'steps',
        label: 'Шаги',
        value: '1. Нажать кнопку Регистрация\n2. Заполнить поля\n3. Нажать Отправить',
        hasError: true,
        errorExp:
          'Шаги слишком абстрактны. Что именно вводить? Нет конкретных тестовых данных (email, пароль, имя)',
      },
      {
        id: 'expected',
        label: 'Ожидаемый результат',
        value: 'Всё работает',
        hasError: true,
        errorExp:
          "'Всё работает' — не конкретный результат. Должно быть: 'Пользователь перенаправлен на главную, получено письмо подтверждения'",
      },
      { id: 'priority', label: 'Приоритет', value: 'High', hasError: false },
      {
        id: 'postcond',
        label: 'Постусловие',
        value: 'Пользователь зарегистрирован в системе',
        hasError: false,
      },
    ],
  },
  {
    id: 'find_error2',
    type: 'find_error',
    icon: '🪲',
    xp: 30,
    color: '#3b82f6',
    title: 'Плохой баг-репорт',
    desc: 'Разработчик отклонил этот баг-репорт. Найди, что в нем не так.',
    context: 'Баг: Поиск не находит товары со скидкой',
    fields: [
      {
        id: 'summary',
        label: 'Заголовок',
        value: 'Поиск сломался',
        hasError: true,
        errorExp:
          'Заголовок должен отвечать на вопросы Что? Где? Когда? (Поиск не находит товары со скидкой в каталоге)',
      },
      {
        id: 'steps',
        label: 'Шаги',
        value: '1. Открыть сайт\n2. Найти товар\n3. Посмотреть результат',
        hasError: true,
        errorExp: 'Нет конкретики: какой товар искать? Какое ключевое слово вводить?',
      },
      {
        id: 'actual',
        label: 'Факт',
        value: 'Ничего не работает',
        hasError: true,
        errorExp:
          "Нужно описать конкретное поведение: 'Список результатов пуст, хотя товары со скидкой существуют'",
      },
      {
        id: 'expected',
        label: 'Ожидание',
        value: 'Должно работать как в ТЗ',
        hasError: true,
        errorExp:
          "Нельзя ссылаться на ТЗ. Нужно описать результат: 'Отображаются товары, соответствующие запросу и имеющие скидку'",
      },
      {
        id: 'env',
        label: 'Окружение',
        value: 'Мой компьютер',
        hasError: true,
        errorExp: 'Нужно указать ОС, Браузер и его версию (например: Windows 11, Chrome 122.0.x)',
      },
    ],
  },
  {
    id: 'write_test1',
    type: 'write_test',
    icon: '📝',
    xp: 35,
    color: '#a855f7',
    title: 'Напиши тест-кейс',
    desc: 'Составь грамотный тест-кейс на основе требования. Проверяется структура и конкретика.',
    requirement:
      'Система восстановления пароля: пользователь вводит email, получает ссылку на почту. Ссылка должна быть одноразовой и действовать 24 часа.',
    checkItems: [
      {
        label: "Название содержит 'Восстановление пароля'",
        check: (v: PracticeCheckValues) => v.title?.toLowerCase().includes('восстановление пароля'),
      },
      {
        label: 'В шагах указан ввод email',
        check: (v: PracticeCheckValues) =>
          v.steps?.toLowerCase().includes('email') || v.steps?.toLowerCase().includes('почт'),
      },
      {
        label: 'В ожидаемом результате есть проверка ссылки',
        check: (v: PracticeCheckValues) => v.expected?.toLowerCase().includes('ссылк'),
      },
      {
        label: 'Указано предусловие (наличие аккаунта)',
        check: (v: PracticeCheckValues) =>
          v.precond?.toLowerCase().includes('зарегистрирован') ||
          v.precond?.toLowerCase().includes('аккаунт'),
      },
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
      expected:
        'Отображается сообщение об отправке. На почту приходит письмо с уникальной ссылкой.',
    },
  },
  {
    id: 'bug_report1',
    type: 'bug_report',
    icon: '🐛',
    xp: 40,
    color: '#ec4899',
    title: 'Оформи баг-репорт',
    desc: 'Опиши найденный баг максимально профессионально.',
    scenario:
      "Ты нажал кнопку 'Оформить заказ' в корзине, и приложение просто закрылось (вылетело на рабочий стол). В корзине был один товар: 'iPhone 15'.",
    checkItems: [
      {
        label: "Заголовок содержит 'Crash' или 'Вылет'",
        check: (v: PracticeCheckValues) =>
          v.title?.toLowerCase().includes('crash') || v.title?.toLowerCase().includes('вылет'),
      },
      {
        label: 'В шагах указана корзина',
        check: (v: PracticeCheckValues) => v.steps?.toLowerCase().includes('корзин'),
      },
      {
        label: 'Указан конкретный товар',
        check: (v: PracticeCheckValues) => v.steps?.toLowerCase().includes('iphone'),
      },
      {
        label: 'В заголовке указана критичность бага',
        check: (v: PracticeCheckValues) =>
          v.title?.toLowerCase().includes('critical') ||
          v.title?.toLowerCase().includes('blocker') ||
          v.title?.toLowerCase().includes('крит'),
      },
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
    id: 'triage3',
    type: 'triage',
    icon: '💎',
    xp: 35,
    color: '#8b5cf6',
    title: 'Triage: Игровая платформа',
    desc: 'Ты тестируешь новый лаунчер для игр. Расставь приоритеты багов перед крупным обновлением.',
    bugs: [
      {
        id: 0,
        desc: 'При попытке купить игру — деньги списываются, но игра не добавляется в библиотеку',
        correct: 'critical',
        hint: 'Прямая потеря денег и невыполнение услуги — это блокер',
      },
      {
        id: 1,
        desc: "В описании игры 'The Witcher 3' перепутаны скриншоты с другой игрой",
        correct: 'minor',
        hint: 'Вводит в заблуждение, но играть и покупать можно',
      },
      {
        id: 2,
        desc: "Кнопка 'Играть' не активна, если путь к папке с игрой содержит кириллицу",
        correct: 'major',
        hint: 'Серьезная проблема для части аудитории, но есть обходной путь (переименовать папку)',
      },
      {
        id: 3,
        desc: 'При наведении на аватар друга — всплывающее окно мерцает 1 раз',
        correct: 'trivial',
        hint: 'Косметический дефект, почти не заметен',
      },
      {
        id: 4,
        desc: 'Лаунчер не запускается на Windows 10 (самая популярная ОС)',
        correct: 'critical',
        hint: 'Блокирует использование продукта для большинства пользователей',
      },
    ],
    severities: [
      { key: 'critical', label: 'Critical', color: '#f87171', desc: 'Блокирует бизнес' },
      { key: 'major', label: 'Major', color: '#fb923c', desc: 'Серьезный баг' },
      { key: 'minor', label: 'Minor', color: '#fbbf24', desc: 'Мелкий баг' },
      { key: 'trivial', label: 'Trivial', color: '#22d3a0', desc: 'Косметика' },
    ],
  },
  {
    id: 'triage4',
    type: 'triage',
    icon: '🛡️',
    xp: 40,
    color: '#10b981',
    title: 'Triage: Безопасность и API',
    desc: 'Проанализируй отчеты от службы безопасности и API мониторинга. Что критичнее?',
    bugs: [
      {
        id: 0,
        desc: 'API возвращает пароли пользователей в открытом виде в JSON-ответе профиля',
        correct: 'critical',
        hint: 'Утечка персональных данных — критическая уязвимость',
      },
      {
        id: 1,
        desc: 'Метод GET /users возвращает 500 ошибку, если в базе более 1000 записей',
        correct: 'major',
        hint: 'Серьезная проблема с масштабируемостью API',
      },
      {
        id: 2,
        desc: "Заголовок ответа 'Server' раскрывает точную версию Apache и ОС",
        correct: 'minor',
        hint: 'Информационная уязвимость, облегчает атаку хакерам',
      },
      {
        id: 3,
        desc: 'В API документации (Swagger) опечатка в описании одного необязательного поля',
        correct: 'trivial',
        hint: 'Ошибка в документации, не влияет на работу кода',
      },
      {
        id: 4,
        desc: 'Любой пользователь может удалить чужой пост, просто изменив ID в URL',
        correct: 'critical',
        hint: 'IDOR уязвимость — критическая дыра в авторизации',
      },
    ],
    severities: [
      { key: 'critical', label: 'Critical', color: '#f87171', desc: 'Угроза безопасности' },
      { key: 'major', label: 'Major', color: '#fb923c', desc: 'Отказ сервиса' },
      { key: 'minor', label: 'Minor', color: '#fbbf24', desc: 'Риск ИБ' },
      { key: 'trivial', label: 'Trivial', color: '#22d3a0', desc: 'Опечатка' },
    ],
  },
  {
    id: 'find_error3',
    type: 'find_error',
    icon: '🕵️',
    xp: 30,
    color: '#10b981',
    title: 'Ошибки в требованиях',
    desc: 'Найди логические ошибки и неопределенности в тексте ТЗ.',
    context: 'Фича: Система лояльности',
    fields: [
      {
        id: 'req1',
        label: 'Требование 1',
        value: 'Система должна работать быстро и без ошибок',
        hasError: true,
        errorExp: "Неизмеримость. Что такое 'быстро'? Нужно указать время отклика в мс.",
      },
      {
        id: 'req2',
        label: 'Требование 2',
        value: 'Пользователь получает 10 баллов за каждые 100 рублей в чеке',
        hasError: false,
      },
      {
        id: 'req3',
        label: 'Требование 3',
        value: 'Баллы можно тратить на любые товары, кроме тех, на которые нельзя',
        hasError: true,
        errorExp: 'Неопределенность. Нужно четко перечислить категории товаров-исключений.',
      },
      {
        id: 'req4',
        label: 'Требование 4',
        value: 'При возврате товара баллы возвращаются на счет',
        hasError: true,
        errorExp:
          'Противоречивость. Обычно баллы, начисленные за покупку, должны списываться при возврате.',
      },
    ],
  },
  {
    id: 'find_error4',
    type: 'find_error',
    icon: '📄',
    xp: 35,
    color: '#f59e0b',
    title: 'Проверка API документации',
    desc: 'Найди ошибки в описании эндпоинта POST /register.',
    context: 'Эндпоинт: Регистрация пользователя',
    fields: [
      {
        id: 'url',
        label: 'URL',
        value: 'GET /api/v1/register',
        hasError: true,
        errorExp: 'Неверный метод. Для создания ресурса (регистрации) должен быть POST.',
      },
      {
        id: 'body',
        label: 'Request Body',
        value: '{ "email": "string", "pass": "string" }',
        hasError: true,
        errorExp:
          'Недостаточно данных. Обычно требуется еще подтверждение пароля или имя пользователя.',
      },
      { id: 'resp200', label: 'Response 200', value: '{ "status": "success" }', hasError: false },
      {
        id: 'resp400',
        label: 'Response 400',
        value: 'Ошибка сервера',
        hasError: true,
        errorExp: '400 — это ошибка КЛИЕНТА (Bad Request), а не сервера (500).',
      },
    ],
  },
  {
    id: 'write_test2',
    type: 'write_test',
    icon: '📅',
    xp: 40,
    color: '#3b82f6',
    title: 'Тестирование календаря',
    desc: 'Напиши тест-кейсы для виджета выбора даты (Date Picker).',
    requirement:
      "Поле 'Дата рождения'. Должно принимать даты от 01.01.1900 до текущей даты. Учитывать високосные годы.",
    checkItems: [
      {
        label: 'Проверка 29 февраля в високосный год',
        check: (v: PracticeCheckValues) =>
          v.steps?.toLowerCase().includes('29') && v.steps?.toLowerCase().includes('феврал'),
      },
      {
        label: 'Проверка будущего времени (невалидно)',
        check: (v: PracticeCheckValues) =>
          v.expected?.toLowerCase().includes('ошибк') ||
          v.expected?.toLowerCase().includes('нельзя'),
      },
      {
        label: 'Проверка нижней границы (1900 год)',
        check: (v: PracticeCheckValues) => v.steps?.includes('1900'),
      },
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
    id: 'bug_report2',
    type: 'bug_report',
    icon: '📡',
    xp: 45,
    color: '#ef4444',
    title: 'Сложный баг-репорт',
    desc: "Опиши 'плавающий' баг (Race Condition).",
    scenario:
      'В чате при одновременной отправке сообщения двумя пользователями, сообщения иногда меняются местами или одно из них пропадает. Воспроизводится примерно 2 раза из 10.',
    checkItems: [
      {
        label: 'Указана частота воспроизведения (2/10)',
        check: (v: PracticeCheckValues) =>
          v.steps?.includes('2/10') || v.steps?.toLowerCase().includes('иногда'),
      },
      {
        label: "Заголовок содержит 'Race Condition' или 'Порядок'",
        check: (v: PracticeCheckValues) =>
          v.title?.toLowerCase().includes('race') || v.title?.toLowerCase().includes('порядок'),
      },
      {
        label: 'Описаны действия двух пользователей',
        check: (v: PracticeCheckValues) =>
          v.steps?.toLowerCase().includes('дву') || v.steps?.toLowerCase().includes('одновремен'),
      },
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
    id: 'write_test3',
    type: 'write_test',
    icon: '🛒',
    xp: 45,
    color: '#10b981',
    title: 'Тестирование корзины',
    desc: 'Напиши негативные тест-кейсы для корзины интернет-магазина.',
    requirement:
      'Корзина должна позволять добавлять товары, изменять количество (1-99) и применять один промокод.',
    checkItems: [
      {
        label: 'Проверка ввода 0 или отрицательного количества',
        check: (v: PracticeCheckValues) => v.steps?.includes('0') || v.steps?.includes('-'),
      },
      {
        label: 'Проверка ввода букв в поле количества',
        check: (v: PracticeCheckValues) =>
          v.steps?.toLowerCase().includes('букв') || v.steps?.toLowerCase().includes('текст'),
      },
      {
        label: 'Проверка применения двух промокодов',
        check: (v: PracticeCheckValues) =>
          v.steps?.toLowerCase().includes('два') || v.steps?.toLowerCase().includes('второй'),
      },
    ],
    solution: {
      title: 'Негативные сценарии работы с корзиной',
      precondition: 'В корзине есть 1 товар',
      steps: [
        'Изменить количество товара на 0',
        "Ввести в поле количества текст 'abc'",
        "Применить промокод 'SALE10', затем попробовать применить 'GIFT20'",
      ],
      expected:
        'Количество не меняется или выдает ошибку. Второй промокод заменяет первый или отклоняется.',
    },
  },
  {
    id: 'find_error5',
    type: 'find_error',
    icon: '🔐',
    xp: 40,
    color: '#ef4444',
    title: 'Уязвимости в логике',
    desc: 'Найди потенциальные дыры в безопасности в описании процесса смены пароля.',
    context: 'Процесс: Смена пароля в личном кабинете',
    fields: [
      {
        id: 'step1',
        label: 'Шаг 1',
        value: 'Пользователь вводит новый пароль',
        hasError: true,
        errorExp:
          'Отсутствует проверка текущего пароля. Злоумышленник, получивший доступ к сессии, может легко сменить пароль.',
      },
      {
        id: 'step2',
        label: 'Шаг 2',
        value: 'Система проверяет сложность пароля (мин 8 символов)',
        hasError: false,
      },
      {
        id: 'step3',
        label: 'Шаг 3',
        value: 'Пароль сохраняется в БД в открытом виде для быстрого восстановления',
        hasError: true,
        errorExp: 'Критическая ошибка! Пароли должны храниться только в виде хеша (с солью).',
      },
      {
        id: 'step4',
        label: 'Шаг 4',
        value: "Пользователю отправляется письмо: 'Ваш новый пароль: [пароль]'",
        hasError: true,
        errorExp:
          'Нельзя отправлять пароль в открытом виде по почте. Только уведомление о факте смены.',
      },
    ],
  },
  {
    id: 'find_error6',
    type: 'find_error',
    icon: '🗄️',
    xp: 45,
    color: '#3b82f6',
    title: 'SQL и безопасность',
    desc: 'Найди ошибки в логике работы с базой данных в коде/ТЗ.',
    context: 'Функция: Поиск пользователя по ID',
    fields: [
      {
        id: 'sql1',
        label: 'Запрос',
        value: "SELECT * FROM users WHERE id = ' + input_id + '",
        hasError: true,
        errorExp:
          'Уязвимость к SQL Injection! Нужно использовать параметризованные запросы или ORM.',
      },
      {
        id: 'sql2',
        label: 'Доступ',
        value: "Запрос выполняется под пользователем 'root'",
        hasError: true,
        errorExp:
          'Нарушение принципа наименьших привилегий. Приложение должно иметь ограниченный доступ к БД.',
      },
      {
        id: 'sql3',
        label: 'Данные',
        value: 'Запрос возвращает все поля, включая password_hash',
        hasError: true,
        errorExp:
          'Избыточность данных. Нельзя передавать хеши паролей в слои приложения, где они не нужны.',
      },
    ],
  },
  {
    id: 'write_test4',
    type: 'write_test',
    icon: '📁',
    xp: 40,
    color: '#f59e0b',
    title: 'Загрузка файлов',
    desc: 'Напиши тест-кейсы для компонента загрузки аватара.',
    requirement:
      'Принимаются файлы: JPG, PNG. Макс размер: 2МБ. Миниатюра должна отображаться сразу после выбора.',
    checkItems: [
      {
        label: 'Проверка загрузки файла .exe или .pdf',
        check: (v: PracticeCheckValues) =>
          v.steps?.toLowerCase().includes('exe') || v.steps?.toLowerCase().includes('pdf'),
      },
      {
        label: 'Проверка файла размером 3МБ',
        check: (v: PracticeCheckValues) =>
          v.steps?.includes('3') || v.steps?.toLowerCase().includes('больше'),
      },
      {
        label: 'Проверка отображения превью',
        check: (v: PracticeCheckValues) =>
          v.expected?.toLowerCase().includes('превью') ||
          v.expected?.toLowerCase().includes('миниатюр'),
      },
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
    id: 'triage5',
    type: 'triage',
    icon: '🚀',
    xp: 50,
    color: '#ef4444',
    title: 'Triage: Высокая нагрузка',
    desc: "Система под нагрузкой. Расставь приоритеты багов, когда сервер 'дымится'.",
    bugs: [
      {
        id: 0,
        desc: 'Утечка памяти: сервер перезагружается каждые 2 часа при нагрузке',
        correct: 'critical',
        hint: 'Постоянные падения сервиса — это критическая проблема стабильности',
      },
      {
        id: 1,
        desc: 'В логах много предупреждений (Warnings) о медленных запросах к БД',
        correct: 'minor',
        hint: 'Это сигнал к оптимизации, но пока не баг и не отказ',
      },
      {
        id: 2,
        desc: 'При 5000+ RPS (запросов в сек) API начинает отдавать 503 Service Unavailable',
        correct: 'major',
        hint: 'Серьезное ограничение масштабируемости, не держит целевую нагрузку',
      },
      {
        id: 3,
        desc: 'Иконка загрузки (spinner) дергается при анимации',
        correct: 'trivial',
        hint: 'Чисто визуальный баг, никак не влияет на производительность',
      },
      {
        id: 4,
        desc: 'База данных блокируется (Deadlock) при одновременном обновлении баланса',
        correct: 'critical',
        hint: 'Потеря данных или невозможность транзакций — критический баг',
      },
    ],
    severities: [
      { key: 'critical', label: 'Critical', color: '#f87171', desc: 'Отказ системы' },
      { key: 'major', label: 'Major', color: '#fb923c', desc: 'Проблемы масштабирования' },
      { key: 'minor', label: 'Minor', color: '#fbbf24', desc: 'Технический долг' },
      { key: 'trivial', label: 'Trivial', color: '#22d3a0', desc: 'Визуальный шум' },
    ],
  },
  {
    id: 'find_error7',
    type: 'find_error',
    icon: '📋',
    xp: 45,
    color: '#fbbf24',
    title: 'Ошибки в Тест-плане',
    desc: 'Найди критические ошибки в стратегии тестирования новой фичи.',
    context: 'Фича: Интеграция с Apple Pay',
    fields: [
      {
        id: 'tp1',
        label: 'Среда',
        value: 'Тестирование проводится на эмуляторе Android',
        hasError: true,
        errorExp: 'Для Apple Pay необходимо тестирование на реальных iOS устройствах.',
      },
      {
        id: 'tp2',
        label: 'Данные',
        value: 'Используются реальные банковские карты сотрудников',
        hasError: true,
        errorExp: 'Нарушение безопасности. Нужно использовать только тестовые карты (Sandbox).',
      },
      {
        id: 'tp3',
        label: 'Критерии выхода',
        value: 'Тестирование завершается, когда разработчик скажет, что багов больше нет',
        hasError: true,
        errorExp:
          "Субъективный критерий. Нужно: 'Пройдены все Smoke и Critical тесты, нет открытых багов Severity High/Critical'.",
      },
    ],
  },
  {
    id: 'write_test5',
    type: 'write_test',
    icon: '🔍',
    xp: 50,
    color: '#8b5cf6',
    title: 'Сложный поиск',
    desc: 'Напиши тест-кейсы для фильтра поиска авиабилетов.',
    requirement:
      'Фильтры: Город (откуда/куда), Дата, Количество пассажиров (1-9), Класс (Эконом/Бизнес).',
    checkItems: [
      {
        label: 'Проверка 10 пассажиров (граничное значение)',
        check: (v: PracticeCheckValues) =>
          v.steps?.includes('10') || v.steps?.toLowerCase().includes('гранич'),
      },
      {
        label: 'Проверка даты в прошлом',
        check: (v: PracticeCheckValues) =>
          v.steps?.toLowerCase().includes('прошл') || v.steps?.toLowerCase().includes('вчера'),
      },
      {
        label: 'Проверка одинаковых городов (откуда = куда)',
        check: (v: PracticeCheckValues) =>
          v.steps?.toLowerCase().includes('одинак') || v.steps?.toLowerCase().includes('тот же'),
      },
    ],
    solution: {
      title: 'Тестирование фильтров поиска билетов',
      precondition: 'Главная страница поиска',
      steps: [
        "Выбрать город 'Москва' в обоих полях",
        "Выбрать дату 'вчера'",
        'Указать 10 пассажиров',
      ],
      expected:
        'Система выдает ошибки валидации: города должны быть разными, дата не может быть в прошлом, лимит 9 человек.',
    },
  },
  {
    id: 'triage6',
    type: 'triage',
    icon: '🚨',
    xp: 55,
    color: '#ef4444',
    title: 'Triage: Продакшн инциденты',
    desc: 'Ты на дежурстве. Расставь приоритеты для багов, пришедших от реальных юзеров.',
    bugs: [
      {
        id: 0,
        desc: 'У 5% юзеров не загружаются аватарки (вместо них заглушка)',
        correct: 'minor',
        hint: 'Визуальный дефект, не блокирует работу',
      },
      {
        id: 1,
        desc: "Кнопка 'Оплатить' не нажимается в браузере Safari (30% трафика)",
        correct: 'critical',
        hint: 'Блокировка основного бизнес-процесса для огромной доли юзеров',
      },
      {
        id: 2,
        desc: 'В футере сайта опечатка в номере телефона поддержки',
        correct: 'major',
        hint: 'Высокий риск для репутации и сложности для связи с поддержкой',
      },
      {
        id: 3,
        desc: 'Приложение вылетает, если юзер вводит имя на китайском языке',
        correct: 'major',
        hint: 'Краш — это плохо, но если рынок не китайский, приоритет ниже критического',
      },
    ],
    severities: [
      { key: 'critical', label: 'Critical', color: '#f87171', desc: 'Блокирует доход' },
      { key: 'major', label: 'Major', color: '#fb923c', desc: 'Репутационный риск' },
      { key: 'minor', label: 'Minor', color: '#fbbf24', desc: 'Косметический баг' },
    ],
  },
  {
    id: 'bug_report3',
    type: 'bug_report',
    icon: '🔓',
    xp: 60,
    color: '#ef4444',
    title: 'Security: IDOR уязвимость',
    desc: 'Опиши баг, позволяющий видеть чужие заказы через смену ID в URL.',
    requirement:
      'URL заказа: /orders/123. Если сменить 123 на 124, открывается заказ другого пользователя.',
    checkItems: [
      {
        label: 'Указание уязвимости IDOR',
        check: (v: PracticeCheckValues) =>
          v.title?.toLowerCase().includes('idor') ||
          v.desc?.toLowerCase().includes('доступ к чужим'),
      },
      {
        label: 'Шаги со сменой ID в URL',
        check: (v: PracticeCheckValues) => v.steps?.includes('URL') || v.steps?.includes('ID'),
      },
      {
        label: 'Ожидаемый результат: 403 Forbidden',
        check: (v: PracticeCheckValues) =>
          v.expected?.includes('403') || v.expected?.toLowerCase().includes('запрещен'),
      },
    ],
    solution: {
      title: '[Security] IDOR: Доступ к чужим заказам через URL',
      steps: [
        'Авторизоваться под User A',
        'Перейти в заказ /orders/100',
        'Сменить в адресной строке 100 на 101 (заказ User B)',
      ],
      expected:
        'Система должна вернуть 403 Forbidden или 404 Not Found. Сейчас открывается заказ User B.',
    },
  },
];
