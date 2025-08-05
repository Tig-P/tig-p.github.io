// 1. 요소 선택 (Element Selections)
const calculateBtn = document.getElementById('calculate-btn');
const resultDiv = document.getElementById('result');

// 입력 필드
const totalCapitalInput = document.getElementById('total-capital');
const leverageButtonsContainer = document.getElementById('leverage-buttons');
const leverageSlider = document.getElementById('leverage-slider');
const leverageSliderValue = document.getElementById('leverage-slider-value');
const investmentAmountSpan = document.getElementById('investment-amount');
const entryPriceInput = document.getElementById('entry-price');
const riskPercentInput = document.getElementById('risk-percent');
const stopLossPriceInput = document.getElementById('stop-loss-price');
const rrRatioSelect = document.getElementById('rr-ratio-select');
const takeProfitPercentInput = document.getElementById('take-profit-percent');
const takeProfitPriceInput = document.getElementById('take-profit-price');

// 결과 표시 필드 (기존과 동일)
const maxLossAmountSpan = document.getElementById('max-loss-amount');
const lossPerShareSpan = document.getElementById('loss-per-share');
const positionSizeSpan = document.getElementById('position-size');
const potentialGainPercentSpan = document.getElementById('potential-gain-percent');
const potentialLossPercentSpan = document.getElementById('potential-loss-percent');
const riskRewardRatioSpan = document.getElementById('risk-reward-ratio');
const tradeAdviceDiv = document.getElementById('trade-advice');

// 2. 상태 변수 (State Variables)
let investmentLeverage = 1; // 기본 비중 100%

// 3. 자동 계산 및 업데이트 함수 (Auto-calculation & Update Functions)

// 실제 투입금액 업데이트
function updateInvestmentAmount() {
    const totalCapital = parseFloat(totalCapitalInput.value) || 0;
    const investmentAmount = totalCapital * investmentLeverage;
    investmentAmountSpan.textContent = investmentAmount.toLocaleString();
}

// 비중 UI 업데이트 (버튼, 슬라이더, 숫자)
function updateLeverageUI(leverage) {
    investmentLeverage = leverage;
    leverageSlider.value = leverage * 100;
    leverageSliderValue.textContent = `${Math.round(leverage * 100)}%`;

    // 버튼 상태 업데이트
    leverageButtonsContainer.querySelectorAll('.leverage-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseFloat(btn.dataset.value) === leverage) {
            btn.classList.add('active');
        }
    });
    updateInvestmentAmount();
}

// (기존 자동 계산 함수들은 여기에 위치 - 생략)
function autoCalculateStopLoss() {
    const entryPrice = parseFloat(entryPriceInput.value);
    const riskPercent = parseFloat(riskPercentInput.value);
    if (isValidNumber(entryPrice) && isValidNumber(riskPercent)) {
        const stopLossPrice = entryPrice * (1 - riskPercent / 100);
        stopLossPriceInput.value = Math.floor(stopLossPrice);
        autoCalculateTargetByRRRatio();
    }
}

function autoCalculateTakeProfitPercent() {
    const entryPrice = parseFloat(entryPriceInput.value);
    const takeProfitPrice = parseFloat(takeProfitPriceInput.value);
    if (isValidNumber(entryPrice) && isValidNumber(takeProfitPrice) && entryPrice > 0) {
        const takeProfitPercent = ((takeProfitPrice - entryPrice) / entryPrice) * 100;
        takeProfitPercentInput.value = takeProfitPercent.toFixed(2);
    }
}

function autoCalculateTargetByRRRatio() {
    const ratio = rrRatioSelect.value;
    if (ratio === 'custom') return;
    const entryPrice = parseFloat(entryPriceInput.value);
    const stopLossPrice = parseFloat(stopLossPriceInput.value);
    if (isValidNumber(entryPrice) && isValidNumber(stopLossPrice)) {
        const lossPerShare = entryPrice - stopLossPrice;
        if (lossPerShare <= 0) return;
        const desiredGainPerShare = lossPerShare * parseFloat(ratio);
        const newTakeProfitPrice = entryPrice + desiredGainPerShare;
        takeProfitPriceInput.value = Math.floor(newTakeProfitPrice);
        autoCalculateTakeProfitPercent();
    }
}

// 4. 이벤트 리스너 (Event Listeners)
totalCapitalInput.addEventListener('input', updateInvestmentAmount);

leverageButtonsContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const leverage = parseFloat(e.target.dataset.value);
        updateLeverageUI(leverage);
    }
});

leverageSlider.addEventListener('input', (e) => {
    const leverage = parseFloat(e.target.value) / 100;
    updateLeverageUI(leverage);
});

// (기존 이벤트 리스너들은 여기에 위치 - 생략)
entryPriceInput.addEventListener('input', autoCalculateStopLoss);
riskPercentInput.addEventListener('input', autoCalculateStopLoss);
stopLossPriceInput.addEventListener('input', () => {
    const entryPrice = parseFloat(entryPriceInput.value);
    const stopLossPrice = parseFloat(stopLossPriceInput.value);
    if(isValidNumber(entryPrice) && isValidNumber(stopLossPrice) && entryPrice > 0) {
        const riskPercent = ((entryPrice - stopLossPrice) / entryPrice) * 100;
        riskPercentInput.value = riskPercent.toFixed(2);
    }
    autoCalculateTargetByRRRatio();
});
rrRatioSelect.addEventListener('change', autoCalculateTargetByRRRatio);
takeProfitPriceInput.addEventListener('input', () => {
    rrRatioSelect.value = 'custom';
    autoCalculateTakeProfitPercent();
});
takeProfitPercentInput.addEventListener('input', () => {
    rrRatioSelect.value = 'custom';
    const entryPrice = parseFloat(entryPriceInput.value);
    const takeProfitPercent = parseFloat(takeProfitPercentInput.value);
    if(isValidNumber(entryPrice) && isValidNumber(takeProfitPercent)) {
        const takeProfitPrice = entryPrice * (1 + takeProfitPercent / 100);
        takeProfitPriceInput.value = Math.floor(takeProfitPrice);
    }
});


calculateBtn.addEventListener('click', () => {
    // 5. 최종 계산 로직 (기존과 거의 동일, investmentAmount 사용)
    const totalCapital = parseFloat(totalCapitalInput.value) || 0;
    const investmentAmount = totalCapital * investmentLeverage;
    const entryPrice = parseFloat(entryPriceInput.value);
    const stopLossPrice = parseFloat(stopLossPriceInput.value);
    const takeProfitPrice = parseFloat(takeProfitPriceInput.value);

    if (!isValidNumber(totalCapital) || !isValidNumber(entryPrice) || !isValidNumber(stopLossPrice) || !isValidNumber(takeProfitPrice)) {
        alert('모든 가격과 금액 필드에 유효한 숫자를 입력해주세요.');
        return;
    }
    if (entryPrice <= stopLossPrice) { alert('진입 가격은 손절 가격보다 높아야 합니다.'); return; }
    if (takeProfitPrice <= entryPrice) { alert('목표 가격은 진입 가격보다 높아야 합니다.'); return; }

    const riskPercent = parseFloat(riskPercentInput.value);
    const maxLossAmount = investmentAmount * (riskPercent / 100);
    const lossPerShare = entryPrice - stopLossPrice;
    const positionSize = lossPerShare > 0 ? Math.floor(maxLossAmount / lossPerShare) : 0;
    const gainPerShare = takeProfitPrice - entryPrice;
    const riskRewardRatio = lossPerShare > 0 ? gainPerShare / lossPerShare : 0;
    const potentialGainPercent = (gainPerShare / entryPrice) * 100;
    const potentialLossPercent = (lossPerShare / entryPrice) * 100;

    resultDiv.classList.remove('hidden');
    maxLossAmountSpan.textContent = maxLossAmount.toLocaleString();
    lossPerShareSpan.textContent = lossPerShare.toLocaleString();
    positionSizeSpan.textContent = positionSize.toLocaleString();
    potentialGainPercentSpan.textContent = potentialGainPercent.toFixed(2);
    potentialLossPercentSpan.textContent = potentialLossPercent.toFixed(2);
    riskRewardRatioSpan.textContent = `${riskRewardRatio.toFixed(2)} : 1`;

    updateTradeAdvice(riskRewardRatio);
});

// 6. Helper Functions & 초기화
function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}

function updateTradeAdvice(riskRewardRatio) {
    if (riskRewardRatio >= 2) {
        tradeAdviceDiv.textContent = '손익비가 2:1 이상입니다. 긍정적인 진입 후보입니다.';
        tradeAdviceDiv.style.backgroundColor = '#d4edda';
        tradeAdviceDiv.style.color = '#155724';
    } else if (riskRewardRatio >= 1) {
        tradeAdviceDiv.textContent = '손익비가 1:1 이상이지만, 더 나은 기회를 찾아보는 것을 고려해보세요.';
        tradeAdviceDiv.style.backgroundColor = '#fff3cd';
        tradeAdviceDiv.style.color = '#856404';
    } else {
        tradeAdviceDiv.textContent = '손익비가 1:1 미만입니다. 진입하지 않는 것을 강력히 권장합니다.';
        tradeAdviceDiv.style.backgroundColor = '#f8d7da';
        tradeAdviceDiv.style.color = '#721c24';
    }
}

// 페이지 로드 시 초기 설정
updateLeverageUI(1); // 기본값 100%로 UI 설정
