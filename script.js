// ⚠️ ЗАМЕНИТЕ НА СВОЙ КЛЮЧ С https://www.exchangerate-api.com
const API_KEY = 'fbb888721138e7b5c1ac79e4';

const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

let ratesData = null;

// Фиксированные курсы криптовалют (обновляйте раз в месяц)
const CRYPTO_RATES = {
    BTC: 60000,   // 1 BTC = $60,000
    ETH: 3000,    // 1 ETH = $3,000
    USDT: 1       // 1 USDT = $1
};

async function fetchRates() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.result !== 'success') {
            throw new Error('API error');
        }
        
        ratesData = data.conversion_rates;
        
        // Добавляем криптовалюты в курсы
        ratesData.BTC = 1 / CRYPTO_RATES.BTC;
        ratesData.ETH = 1 / CRYPTO_RATES.ETH;
        ratesData.USDT = 1 / CRYPTO_RATES.USDT;
        
        calculate();
        showRates();
        
    } catch (error) {
        document.getElementById('result').innerHTML = '❌ Ошибка загрузки курсов';
        console.error('Error fetching rates:', error);
    }
}

function calculate() {
    if (!ratesData) return;
    
    const amountInput = document.getElementById('amount');
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    const resultDiv = document.getElementById('result');
    
    const amount = parseFloat(amountInput.value) || 0;
    const from = fromSelect.value;
    const to = toSelect.value;
    
    let result = amount;
    
    if (from === 'USD') {
        result = amount * ratesData[to];
    } else if (to === 'USD') {
        result = amount / ratesData[from];
    } else {
        result = (amount / ratesData[from]) * ratesData[to];
    }
    
    // Форматируем результат
    let formattedResult;
    if (result < 0.01) {
        formattedResult = result.toExponential(4);
    } else if (result > 1000000) {
        formattedResult = result.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    } else {
        formattedResult = result.toFixed(4);
    }
    
    resultDiv.innerHTML = `${amount} ${from} = ${formattedResult} ${to}`;
}

function showRates() {
    const container = document.getElementById('rates');
    
    container.innerHTML = '<h3>Текущие курсы (к 1 USD)</h3>';
    
    const currencies = ['EUR', 'RUB', 'BRL', 'MXN', 'NGN', 'INR', 'ZAR', 'BTC', 'ETH', 'USDT'];
    
    currencies.forEach(curr => {
        const rate = ratesData[curr];
        
        // Получаем название валюты из селекта
        const option = document.querySelector(`#from option[value="${curr}"]`);
        const name = option ? option.textContent : curr;
        
        container.innerHTML += `
            <div class="rate-item">
                <span>${name}</span>
                <span>${rate < 0.01 ? rate.toExponential(4) : rate.toFixed(4)} ${curr}</span>
            </div>
        `;
    });
}

// События
document.getElementById('amount').addEventListener('input', calculate);
document.getElementById('from').addEventListener('change', calculate);
document.getElementById('to').addEventListener('change', calculate);

// Загрузка при старте
fetchRates();

// Обновление каждые 5 минут
setInterval(fetchRates, 300000);
