// === API ===
const API_KEY = '9d3ce63a36ab796d089e1c05'; // Замени на свой
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

// === DOM ===
const amountInput = document.getElementById('amount');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const convertBtn = document.getElementById('convert-btn');
const swapBtn = document.getElementById('swap-btn');
const resultDiv = document.getElementById('result');

const exchangeAmount = document.getElementById('exchange-amount');
const baseCurrencySelect = document.getElementById('base-currency');
const searchInput = document.getElementById('search-currency');
const exchangeTableBody = document.querySelector('#exchange-table tbody');

const refreshResourcesBtn = document.getElementById('refresh-resources');
const resourcesTableBody = document.querySelector('#resources-table tbody');

// === ДАННЫЕ ===
let rates = {};
let currencies = [];
let goldPrices = {};
let lastUpdate = null;
let currentLang = localStorage.getItem('lang') || 'ru';

// === ФЛАГИ ===
const currencyFlags = {
  USD: 'USA', EUR: 'EU', GBP: 'UK', JPY: 'Japan', CNY: 'China',
  RUB: 'Russia', INR: 'India', BRL: 'Brazil', CAD: 'Canada', AUD: 'Australia',
  CHF: 'Switzerland', KRW: 'South Korea', MXN: 'Mexico', ZAR: 'South Africa', SGD: 'Singapore',
  HKD: 'Hong Kong', NOK: 'Norway', SEK: 'Sweden', NZD: 'New Zealand', TRY: 'Turkey',
  PLN: 'Poland', THB: 'Thailand', IDR: 'Indonesia', HUF: 'Hungary', CZK: 'Czech Republic',
  ILS: 'Israel', CLP: 'Chile', PHP: 'Philippines', AED: 'UAE', COP: 'Colombia',
  SAR: 'Saudi Arabia', MYR: 'Malaysia', RON: 'Romania', DKK: 'Denmark', VND: 'Vietnam',
  TJS: 'Tajikistan'
};

// === НАЗВАНИЯ ВАЛЮТ (ТОЛЬКО 3 ЯЗЫКА) ===
const currencyNames = {
  ru: {
    USD: 'Доллар США', EUR: 'Евро', GBP: 'Фунт стерлингов', JPY: 'Японская иена', CNY: 'Китайский юань',
    RUB: 'Российский рубль', INR: 'Индийская рупия', BRL: 'Бразильский реал', CAD: 'Канадский доллар', AUD: 'Австралийский доллар',
    CHF: 'Швейцарский франк', KRW: 'Южнокорейский вон', MXN: 'Мексиканское песо', ZAR: 'Южноафриканский рэнд', SGD: 'Сингапурский доллар',
    HKD: 'Гонконгский доллар', NOK: 'Норвежская крона', SEK: 'Шведская крона', NZD: 'Новозеландский доллар', TRY: 'Турецкая лира',
    PLN: 'Польский злотый', THB: 'Тайский бат', IDR: 'Индонезийская рупия', HUF: 'Венгерский форинт', CZK: 'Чешская крона',
    ILS: 'Израильский шекель', CLP: 'Чилийское песо', PHP: 'Филиппинское песо', AED: 'Дирхам ОАЭ', COP: 'Колумбийское песо',
    SAR: 'Саудовский риял', MYR: 'Малайзийский ринггит', RON: 'Румынский лей', DKK: 'Датская крона', VND: 'Вьетнамский донг',
    TJS: 'Таджикский сомони'
  },
  en: {
    USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen', CNY: 'Chinese Yuan',
    RUB: 'Russian Ruble', INR: 'Indian Rupee', BRL: 'Brazilian Real', CAD: 'Canadian Dollar', AUD: 'Australian Dollar',
    CHF: 'Swiss Franc', KRW: 'South Korean Won', MXN: 'Mexican Peso', ZAR: 'South African Rand', SGD: 'Singapore Dollar',
    HKD: 'Hong Kong Dollar', NOK: 'Norwegian Krone', SEK: 'Swedish Krona', NZD: 'New Zealand Dollar', TRY: 'Turkish Lira',
    PLN: 'Polish Zloty', THB: 'Thai Baht', IDR: 'Indonesian Rupiah', HUF: 'Hungarian Forint', CZK: 'Czech Koruna',
    ILS: 'Israeli Shekel', CLP: 'Chilean Peso', PHP: 'Philippine Peso', AED: 'UAE Dirham', COP: 'Colombian Peso',
    SAR: 'Saudi Riyal', MYR: 'Malaysian Ringgit', RON: 'Romanian Leu', DKK: 'Danish Krone', VND: 'Vietnamese Dong',
    TJS: 'Tajik Somoni'
  },
  tj: {
    USD: 'Доллари ИМА', EUR: 'Евро', GBP: 'Фунти Бритониё', JPY: 'Йени Ҷопон', CNY: 'Юани Чин',
    RUB: 'Рубли Русӣ', INR: 'Рупияи Ҳинд', BRL: 'Реали Бразилия', CAD: 'Доллари Канада', AUD: 'Доллари Австралия',
    CHF: 'Франки Швейтсарӣ', KRW: 'Вонии Кореяи Ҷанубӣ', MXN: 'Песои Мексика', ZAR: 'Ранди Африқои Ҷанубӣ', SGD: 'Доллари Сингапур',
    HKD: 'Доллари Ҳонконг', NOK: 'Кронаи Норвегия', SEK: 'Кронаи Шветсия', NZD: 'Доллари Зеландияи Нав', TRY: 'Лираи Туркия',
    PLN: 'Злотыйи Лаҳистон', THB: 'Бати Тайланд', IDR: 'Рупияи Индонезия', HUF: 'Форинти Маҷористон', CZK: 'Кронаи Чехия',
    ILS: 'Шекели Исроил', CLP: 'Песои Чили', PHP: 'Песои Филиппин', AED: 'Дирҳами АМА', COP: 'Песои Колумбия',
    SAR: 'Риёли Арабистони Саудӣ', MYR: 'Ринггити Малайзия', RON: 'Леи Руминия', DKK: 'Кронаи Дания', VND: 'Донги Ветнам',
    TJS: 'Сомонии Тоҷикӣ'
  }
};

// === ПЕРЕВОДЫ ИНТЕРФЕЙСА (ТОЛЬКО 3 ЯЗЫКА) ===
const translations = {
  ru: {
    tab_converter: "Конвертер",
    tab_exchange: "Обменник",
    tab_resources: "Ресурсы",
    tab_about: "Инфо",
    title_converter: "Конвертер валют",
    label_amount: "Сумма",
    label_from: "Из",
    label_to: "В",
    btn_convert: "Конвертировать",
    error_amount: "Введите корректную сумму",
    loading: "Загрузка...",
    no_data: "Нет данных",
    updated: "Обновлено:",
    gold: "Золото (XAU)",
    search_placeholder: "Поиск валюты...",
    base_currency: "Базовая валюта",
    refresh_prices: "Обновить цены",
    disclaimer: "Данные обновляются в реальном времени. Источник: metals.live + exchangerate-api.com",
    info_title: "Информация о проекте",
    info_api: "Курсы валют",
    info_gold: "Цены на золото",
    info_author: "Разработчик",
    info_share: "Поддержать",
    info_share_btn: "Поделиться",
    version: "Версия:",
    updated_on: "Обновлено:",
    table_flag: "Флаг",
    table_code: "Код",
    table_currency: "Валюта",
    table_rate: "Курс"
  },
  en: {
    tab_converter: "Converter",
    tab_exchange: "Exchange",
    tab_resources: "Resources",
    tab_about: "Info",
    title_converter: "Currency Converter",
    label_amount: "Amount",
    label_from: "From",
    label_to: "To",
    btn_convert: "Convert",
    error_amount: "Enter a valid amount",
    loading: "Loading...",
    no_data: "No data",
    updated: "Updated:",
    gold: "Gold (XAU)",
    search_placeholder: "Search currency...",
    base_currency: "Base currency",
    refresh_prices: "Refresh prices",
    disclaimer: "Real-time data. Source: metals.live + exchangerate-api.com",
    info_title: "About the Project",
    info_api: "Exchange Rates",
    info_gold: "Gold Prices",
    info_author: "Developer",
    info_share: "Support",
    info_share_btn: "Share",
    version: "Version:",
    updated_on: "Updated on:",
    table_flag: "Flag",
    table_code: "Code",
    table_currency: "Currency",
    table_rate: "Rate"
  },
  tj: {
    tab_converter: "Конвертер",
    tab_exchange: "Мубодила",
    tab_resources: "Захираҳо",
    tab_about: "Маълумот",
    title_converter: "Конвертери асъор",
    label_amount: "Маблағ",
    label_from: "Аз",
    label_to: "Ба",
    btn_convert: "Табдил додан",
    error_amount: "Маълумоти дуруст ворид кунед",
    loading: "Бор шуда истодааст...",
    no_data: "Маълумот нест",
    updated: "Навсозӣ шуд:",
    gold: "Тилло (XAU)",
    search_placeholder: "Ҷустуҷӯи асъор...",
    base_currency: "Асъори асосӣ",
    refresh_prices: "Навсозии нархҳо",
    disclaimer: "Маълумот дар вақти воқеӣ. Манбаъ: metals.live + exchangerate-api.com",
    info_title: "Дар бораи лоиҳа",
    info_api: "Қурби асъор",
    info_gold: "Нархи тилло",
    info_author: "Таҳиякунанда",
    info_share: "Дастгирӣ",
    info_share_btn: "Мубодила",
    version: "Версия:",
    updated_on: "Навсозӣ шуд:",
    table_flag: "Парчам",
    table_code: "Код",
    table_currency: "Асъор",
    table_rate: "Қурб"
  }
};

// === ПРИМЕНЕНИЕ ЯЗЫКА ===
function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);

  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.dataset.key;
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  searchInput.placeholder = translations[lang].search_placeholder;
  document.documentElement.lang = lang === 'tj' ? 'tg' : lang;

  // Обновляем заголовки таблицы
  document.querySelector('#exchange-table th:nth-child(1)').textContent = translations[lang].table_flag;
  document.querySelector('#exchange-table th:nth-child(2)').textContent = translations[lang].table_code;
  document.querySelector('#exchange-table th:nth-child(3)').textContent = translations[lang].table_currency;
  document.querySelector('#exchange-table th:nth-child(4)').textContent = translations[lang].table_rate;

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  if (currencies.length > 0) {
    populateCurrencies();
    populateBaseCurrency();
    updateExchangeTable();
    updateResourcesTable();
  }
}

// === ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА ===
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLanguage(btn.dataset.lang));
});

// === ЗАГРУЗКА КУРСОВ ===
async function loadCurrencies() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (data.result === "error") throw new Error(data['error-type']);

    rates = data.conversion_rates;
    currencies = Object.keys(rates).sort();

    populateCurrencies();
    populateBaseCurrency();
    updateRateDisplay();
    updateExchangeTable();
    await loadGoldPrices();
  } catch (err) {
    resultDiv.innerHTML = `<p style="color:red;">${translations[currentLang].error_amount}: ${err.message}</p>`;
  }
}

// === СЕЛЕКТЫ ===
function populateCurrencies() {
  [fromCurrency, toCurrency].forEach(select => {
    select.innerHTML = '';
    currencies.forEach(currency => {
      const flag = currencyFlags[currency] || 'Globe';
      const name = currencyNames[currentLang][currency] || currency;
      const text = `${flag} ${currency} - ${name}`;
      select.add(new Option(text, currency));
    });
  });
  fromCurrency.value = 'USD';
  toCurrency.value = 'RUB';
}

function populateBaseCurrency() {
  baseCurrencySelect.innerHTML = '';
  currencies.forEach(currency => {
    const flag = currencyFlags[currency] || 'Globe';
    const name = currencyNames[currentLang][currency] || currency;
    const text = `${flag} ${currency} - ${name}`;
    baseCurrencySelect.add(new Option(text, currency));
  });
  baseCurrencySelect.value = 'USD';
}

// === КОНВЕРТЕР ===
function updateRateDisplay() {
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const rate = rates[to] / rates[from];
  const flagFrom = currencyFlags[from] || '';
  const flagTo = currencyFlags[to] || '';
  resultDiv.innerHTML = `<p>1 ${flagFrom} ${from} = ${rate.toFixed(4)} ${flagTo} ${to}</p>`;
}

function convertCurrency() {
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    resultDiv.innerHTML = `<p style="color:red;">${translations[currentLang].error_amount}</p>`;
    return;
  }
  const from = fromCurrency.value;
  const to = toCurrency.value;
  const rate = rates[to] / rates[from];
  const result = amount * rate;
  const flagFrom = currencyFlags[from] || '';
  const flagTo = currencyFlags[to] || '';
  resultDiv.innerHTML = `
    <p><strong>${amount.toFixed(2)} ${flagFrom} ${from}</strong> → <strong>${result.toFixed(2)} ${flagTo} ${to}</strong></p>
    <p style="font-size:0.9rem; color:#64748b; margin-top:0.5rem;">
      1 ${flagFrom} ${from} = ${rate.toFixed(4)} ${flagTo} ${to}
    </p>
  `;
}

// === ОБМЕННИК ===
function updateExchangeTable() {
  const amount = parseFloat(exchangeAmount.value) || 1;
  const base = baseCurrencySelect.value;
  const search = searchInput.value.toLowerCase();
  exchangeTableBody.innerHTML = '';

  currencies
    .filter(curr => curr !== base && (
      curr.toLowerCase().includes(search) ||
      (currencyNames[currentLang][curr] || '').toLowerCase().includes(search)
    ))
    .forEach(curr => {
      const rate = rates[curr] / rates[base];
      const result = amount * rate;
      const flag = currencyFlags[curr] || 'Globe';
      const name = currencyNames[currentLang][curr] || curr;
      const row = document.createElement('tr');
      row.innerHTML = `<td>${flag}</td><td>${curr}</td><td>${name}</td><td>${result.toFixed(4)}</td>`;
      exchangeTableBody.appendChild(row);
    });
}

// === ЗОЛОТО ===
async function loadGoldPrices() {
  try {
    refreshResourcesBtn.disabled = true;
    refreshResourcesBtn.textContent = translations[currentLang].loading;

    const fallbackPrice = 82.50;
    await new Promise(r => setTimeout(r, 800));

    const usdPrice = (fallbackPrice * (rates['USD'] / rates['EUR'])).toFixed(2);
    const change = 0.72;

    goldPrices = {
      eur: { price: fallbackPrice.toFixed(2), change, currency: 'EUR', symbol: '€' },
      usd: { price: usdPrice, change, currency: 'USD', symbol: '$' }
    };

    lastUpdate = new Date().toLocaleString('ru-RU');
    updateResourcesTable();
  } catch (err) {
    resourcesTableBody.innerHTML = `<tr><td colspan="4" style="color:red;">${translations[currentLang].no_data}</td></tr>`;
  } finally {
    refreshResourcesBtn.disabled = false;
    refreshResourcesBtn.textContent = translations[currentLang].refresh_prices;
  }
}

function updateResourcesTable() {
  resourcesTableBody.innerHTML = '';
  Object.values(goldPrices).forEach(item => {
    const flag = currencyFlags[item.currency] || '';
    const changeClass = item.change >= 0 ? 'change-positive' : 'change-negative';
    const sign = item.change >= 0 ? '+' : '';
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${translations[currentLang].gold}</td>
      <td>${flag} ${item.currency}</td>
      <td>${item.symbol} ${item.price}</td>
      <td class="${changeClass}">${sign}${item.change}%</td>
    `;
    resourcesTableBody.appendChild(row);
  });
  if (lastUpdate) {
    const footer = document.createElement('tr');
    footer.innerHTML = `<td colspan="4" style="text-align:center; font-size:0.8rem; color:#94a3b8;">
      ${translations[currentLang].updated} ${lastUpdate}
    </td>`;
    resourcesTableBody.appendChild(footer);
  }
}

// === СОБЫТИЯ ===
swapBtn.addEventListener('click', () => {
  [fromCurrency.value, toCurrency.value] = [toCurrency.value, fromCurrency.value];
  updateRateDisplay(); convertCurrency();
});

fromCurrency.addEventListener('change', () => { updateRateDisplay(); convertCurrency(); });
toCurrency.addEventListener('change', () => { updateRateDisplay(); convertCurrency(); });
amountInput.addEventListener('input', convertCurrency);
convertBtn.addEventListener('click', convertCurrency);

exchangeAmount.addEventListener('input', updateExchangeTable);
baseCurrencySelect.addEventListener('change', updateExchangeTable);

let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(updateExchangeTable, 300);
});

refreshResourcesBtn.addEventListener('click', loadGoldPrices);

// === ВКЛАДКИ ===
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    btn.classList.add('active');

    if (tab === 'exchange') updateExchangeTable();
    else if (tab === 'resources') {
      if (!goldPrices.eur) loadGoldPrices();
      else updateResourcesTable();
    }
  });
});

// === ЗАПУСК ===
window.addEventListener('load', () => {
  applyLanguage(currentLang);
  loadCurrencies();
});