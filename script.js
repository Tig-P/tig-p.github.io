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

// 결과 표시 필드
const maxLossAmountSpan = document.getElementById('max-loss-amount');
const lossPerShareSpan = document.getElementById('loss-per-share');
const positionSizeSpan = document.getElementById('position-size');
const potentialGainPercentSpan = document.getElementById('potential-gain-percent');
const potentialLossPercentSpan = document.getElementById('potential-loss-percent');
const riskRewardRatioSpan = document.getElementById('risk-reward-ratio');
const tradeAdviceDiv = document.getElementById('trade-advice');
const disclaimerP = document.getElementById('disclaimer');

// 통합 추가 매수 섹션 요소
const targetAvgPriceInput = document.getElementById('target-avg-price');
const avgPrice2Input = document.getElementById('avg-price-2');
const avgQty2Input = document.getElementById('avg-qty-2');
const avgPrice3Input = document.getElementById('avg-price-3');
const avgQty3Input = document.getElementById('avg-qty-3');
const calculateAvgBtn = document.getElementById('calculate-avg-btn');
const reverseCalculateBtn = document.getElementById('reverse-calculate-btn');
const applyAvgBtn = document.getElementById('apply-avg-btn');

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

    leverageButtonsContainer.querySelectorAll('.leverage-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseFloat(btn.dataset.value) === leverage) {
            btn.classList.add('active');
        }
    });
    updateInvestmentAmount();
}

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

calculateBtn.addEventListener('click', calculateRisk);
calculateAvgBtn.addEventListener('click', calculateAveragePrice);
reverseCalculateBtn.addEventListener('click', reverseCalculateAverage);
applyAvgBtn.addEventListener('click', applyCalculatedAverageToMain);

// 5. 계산 로직 (Calculation Logic)
function calculateRisk() {
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
    disclaimerP.textContent = '※ 위 계산은 거래세, 수수료를 포함하지 않은 결과입니다.';

    updateTradeAdvice(riskRewardRatio);
}

function calculateAveragePrice() {
    const entryPrice1 = parseFloat(entryPriceInput.value);
    const positionSize1 = parseFloat(positionSizeSpan.textContent.replace(/,/g, '')) || 0;

    if (!isValidNumber(entryPrice1) || positionSize1 === 0) {
        alert('먼저 위 계산기에서 1차 매수 계산을 완료해주세요. (적정 매수 수량이 0이면 안됩니다)');
        return;
    }

    const price2 = parseFloat(avgPrice2Input.value) || 0;
    const qty2 = parseFloat(avgQty2Input.value) || 0;
    const price3 = parseFloat(avgPrice3Input.value) || 0;
    const qty3 = parseFloat(avgQty3Input.value) || 0;

    let totalCost = entryPrice1 * positionSize1;
    let totalQty = positionSize1;

    if (isValidNumber(price2) && isValidNumber(qty2) && qty2 > 0) {
        totalCost += price2 * qty2;
        totalQty += qty2;
    }
    if (isValidNumber(price3) && isValidNumber(qty3) && qty3 > 0) {
        totalCost += price3 * qty3;
        totalQty += qty3;
    }

    if (totalQty > 0) {
        const averagePrice = totalCost / totalQty;
        targetAvgPriceInput.value = averagePrice.toFixed(2);
        applyAvgBtn.classList.remove('hidden');
    } else {
        alert('유효한 매수 정보를 입력해주세요.');
    }
}

function reverseCalculateAverage() {
    const entryPrice1 = parseFloat(entryPriceInput.value);
    const positionSize1 = parseFloat(positionSizeSpan.textContent.replace(/,/g, '')) || 0;

    if (!isValidNumber(entryPrice1) || positionSize1 === 0) {
        alert('먼저 위 계산기에서 1차 매수 계산을 완료해주세요. (적정 매수 수량이 0이면 안됩니다)');
        return;
    }

    const targetAvgPrice = parseFloat(targetAvgPriceInput.value);
    const price2 = parseFloat(avgPrice2Input.value);
    const qty2 = parseFloat(avgQty2Input.value);
    const price3 = parseFloat(avgPrice3Input.value);
    const qty3 = parseFloat(avgQty3Input.value);

    const inputs = [
        { id: 'target-avg-price', value: targetAvgPrice, element: targetAvgPriceInput },
        { id: 'avg-price-2', value: price2, element: avgPrice2Input },
        { id: 'avg-qty-2', value: qty2, element: avgQty2Input },
        { id: 'avg-price-3', value: price3, element: avgPrice3Input },
        { id: 'avg-qty-3', value: qty3, element: avgQty3Input }
    ];

    let emptyCount = 0;
    let emptyField = null;

    inputs.forEach(input => {
        if (!isValidNumber(input.value)) {
            emptyCount++;
            emptyField = input;
        }
    });

    if (emptyCount !== 1) {
        alert('목표 평균가, 2차/3차 매수 가격, 2차/3차 매수 수량 중 정확히 한 칸만 비워두고 다시 시도해주세요.');
        return;
    }

    let calculatedValue;

    // 1차 매수 정보의 총액과 총 수량
    const cost1 = entryPrice1 * positionSize1;
    const qty1 = positionSize1;

    switch (emptyField.id) {
        case 'target-avg-price': // 목표 평균가 계산 (정방향과 동일)
            let totalCost_calc_avg = cost1;
            let totalQty_calc_avg = qty1;
            if (isValidNumber(price2) && isValidNumber(qty2)) { totalCost_calc_avg += price2 * qty2; totalQty_calc_avg += qty2; }
            if (isValidNumber(price3) && isValidNumber(qty3)) { totalCost_calc_avg += price3 * qty3; totalQty_calc_avg += qty3; }
            calculatedValue = totalQty_calc_avg > 0 ? totalCost_calc_avg / totalQty_calc_avg : 0;
            break;
        case 'avg-price-2': // 2차 매수 가격 역계산
            if (!isValidNumber(targetAvgPrice) || !isValidNumber(qty2) || qty2 <= 0) { alert('목표 평균가와 2차 매수 수량을 입력해주세요.'); return; }
            let remainingCost2 = targetAvgPrice * (qty1 + qty2 + (qty3 || 0)) - cost1 - ((price3 || 0) * (qty3 || 0));
            calculatedValue = remainingCost2 / qty2;
            break;
        case 'avg-qty-2': // 2차 매수 수량 역계산
            if (!isValidNumber(targetAvgPrice) || !isValidNumber(price2) || price2 <= 0) { alert('목표 평균가와 2차 매수 가격을 입력해주세요.'); return; }
            let numerator2 = targetAvgPrice * (qty1 + (qty3 || 0)) - cost1 - ((price3 || 0) * (qty3 || 0));
            let denominator2 = price2 - targetAvgPrice;
            calculatedValue = denominator2 !== 0 ? numerator2 / denominator2 : 0;
            break;
        case 'avg-price-3': // 3차 매수 가격 역계산
            if (!isValidNumber(targetAvgPrice) || !isValidNumber(qty3) || qty3 <= 0) { alert('목표 평균가와 3차 매수 수량을 입력해주세요.'); return; }
            let remainingCost3 = targetAvgPrice * (qty1 + (qty2 || 0) + qty3) - cost1 - ((price2 || 0) * (qty2 || 0));
            calculatedValue = remainingCost3 / qty3;
            break;
        case 'avg-qty-3': // 3차 매수 수량 역계산
            if (!isValidNumber(targetAvgPrice) || !isValidNumber(price3) || price3 <= 0) { alert('목표 평균가와 3차 매수 가격을 입력해주세요.'); return; }
            let numerator3 = targetAvgPrice * (qty1 + (qty2 || 0)) - cost1 - ((price2 || 0) * (qty2 || 0));
            let denominator3 = price3 - targetAvgPrice;
            calculatedValue = denominator3 !== 0 ? numerator3 / denominator3 : 0;
            break;
    }

    if (isValidNumber(calculatedValue) && calculatedValue >= 0) {
        emptyField.element.value = calculatedValue.toFixed(2);
        alert('필요 정보가 역계산되어 입력되었습니다.');
        applyAvgBtn.classList.remove('hidden');
    } else {
        alert('유효한 값을 계산할 수 없습니다. 입력값을 확인해주세요.');
    }
}

function applyCalculatedAverageToMain() {
    const calculatedAvgPrice = parseFloat(targetAvgPriceInput.value);
    if (isValidNumber(calculatedAvgPrice) && calculatedAvgPrice > 0) {
        entryPriceInput.value = calculatedAvgPrice.toFixed(2);
        autoCalculateStopLoss(); // 새 진입가 기준으로 손절가 등 자동 재계산
        alert(`계산된 평균 매수가 ${calculatedAvgPrice.toFixed(2)}원이 위 계산기에 적용되었습니다. 손절/익절가를 다시 확인하고 계산 버튼을 누르세요.`);
    } else {
        alert('적용할 유효한 평균가가 없습니다.');
    }
}

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
