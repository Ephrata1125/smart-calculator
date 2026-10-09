
const screen = document.getElementById("screen");
const previous = document.getElementById("previous");
const keypad = document.querySelector(".keypad");

let currentValue = "0";
let storedValue = null;
let selectedOperator = null;
let waitingForNextValue = false;
let justCalculated = false;

function updateDisplay() {
    screen.textContent = currentValue;
}

function clearCalculator() {
    currentValue = "0";
    storedValue = null;
    selectedOperator = null;
    waitingForNextValue = false;
    justCalculated = false;
    previous.textContent = "";
    updateDisplay();
}

function formatNumber(number) {
    if (!Number.isFinite(number)) {
        return "Error";
    }

    return String(Number.parseFloat(number.toPrecision(12)));
}

function enterNumber(number) {
    if (currentValue === "Error" || waitingForNextValue || justCalculated) {
        currentValue = number;
        waitingForNextValue = false;
        justCalculated = false;
    } else if (currentValue === "0") {
        currentValue = number;
    } else if (currentValue.length < 15) {
        currentValue += number;
    }

    updateDisplay();
}

function enterDecimal() {
    if (currentValue === "Error" || waitingForNextValue || justCalculated) {
        currentValue = "0.";
        waitingForNextValue = false;
        justCalculated = false;
    } else if (!currentValue.includes(".")) {
        currentValue += ".";
    }

    updateDisplay();
}

function calculate(first, second, operator) {
    switch (operator) {
        case "+":
            return first + second;
        case "−":
            return first - second;
        case "×":
            return first * second;
        case "÷":
            return second === 0 ? null : first / second;
        default:
            return second;
    }
}

function chooseOperator(operator) {
    if (currentValue === "Error") return;

    const inputValue = Number(currentValue);

    if (selectedOperator && !waitingForNextValue) {
        const result = calculate(storedValue, inputValue, selectedOperator);

        if (result === null || !Number.isFinite(result)) {
            currentValue = "Error";
            storedValue = null;
            selectedOperator = null;
            previous.textContent = "Cannot divide by zero";
            updateDisplay();
            return;
        }

        currentValue = formatNumber(result);
        storedValue = result;
    } else {
        storedValue = inputValue;
    }

    selectedOperator = operator;
    waitingForNextValue = true;
    justCalculated = false;
    previous.textContent = `${currentValue} ${operator}`;
    updateDisplay();
}

function showResult() {
    if (!selectedOperator || storedValue === null || waitingForNextValue) {
        return;
    }

    const first = storedValue;
    const second = Number(currentValue);
    const operator = selectedOperator;
    const result = calculate(first, second, operator);

    previous.textContent = `${formatNumber(first)} ${operator} ${formatNumber(second)} =`;

    if (result === null || !Number.isFinite(result)) {
        currentValue = "Error";
        previous.textContent = "Cannot divide by zero";
    } else {
        currentValue = formatNumber(result);
    }

    storedValue = null;
    selectedOperator = null;
    waitingForNextValue = false;
    justCalculated = true;
    updateDisplay();
}

function deleteLastDigit() {
    if (currentValue === "Error" || waitingForNextValue || justCalculated) {
        currentValue = "0";
        waitingForNextValue = false;
        justCalculated = false;
    } else {
        currentValue = currentValue.length > 1
            ? currentValue.slice(0, -1)
            : "0";

        if (currentValue === "-") currentValue = "0";
    }

    updateDisplay();
}

function convertPercent() {
    if (currentValue === "Error") return;

    currentValue = formatNumber(Number(currentValue) / 100);
    waitingForNextValue = false;
    justCalculated = false;
    updateDisplay();
}

function toggleSign() {
    if (currentValue === "Error" || Number(currentValue) === 0) return;

    currentValue = currentValue.startsWith("-")
        ? currentValue.slice(1)
        : "-" + currentValue;

    updateDisplay();
}

keypad.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.number !== undefined) {
        enterNumber(button.dataset.number);
    } else if (button.dataset.operator) {
        chooseOperator(button.dataset.operator);
    } else {
        switch (button.dataset.action) {
            case "clear":
                clearCalculator();
                break;
            case "delete":
                deleteLastDigit();
                break;
            case "decimal":
                enterDecimal();
                break;
            case "percent":
                convertPercent();
                break;
            case "sign":
                toggleSign();
                break;
            case "equals":
                showResult();
                break;
        }
    }
});

document.addEventListener("keydown", (event) => {
    if (/^[0-9]$/.test(event.key)) {
        enterNumber(event.key);
    } else if (event.key === ".") {
        enterDecimal();
    } else if (event.key === "+") {
        chooseOperator("+");
    } else if (event.key === "-") {
        chooseOperator("−");
    } else if (event.key === "*") {
        chooseOperator("×");
    } else if (event.key === "/") {
        event.preventDefault();
        chooseOperator("÷");
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        showResult();
    } else if (event.key === "Backspace") {
        deleteLastDigit();
    } else if (event.key === "Escape") {
        clearCalculator();
    } else if (event.key === "%") {
        convertPercent();
    }
});

updateDisplay();
