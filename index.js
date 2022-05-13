const calculator = document.querySelector(".calculator");
const errorScreen = document.querySelector(".error-screen");
const previousLine = document.querySelector(".previous-line");
const currentLine = document.querySelector(".current-line");

calculator.addEventListener("submit", (e) => {
  e.preventDefault();
  calculate();
});

document.querySelector(".controls").addEventListener("click", (e) => {
  if (!e.target.value) {
    return;
  }

  const isValidated = validateSymbol(e.target.value);

  if (isValidated) {
    useSymbol(e.target.value);
  }
});

document.addEventListener("keyup", (e) => {
  const isValidated = validateSymbol(e.key);

  if (isValidated) {
    useSymbol(e.key);
  }
});

function useSymbol(symbol) {
  let [operand1, operator, operand2] = currentLine.value.split(" ");

  // так как числа длиной более 15 знаков начинают терять свою точность, а также
  // во избежание слишком длинных строк операнды ограничиваются в 15 знаков
  if (
    (!operator && currentLine.value.length >= 15) ||
    (operator && operand2?.length >= 15)
  ) {
    if (/^[0-9]*$/g.test(symbol)) return;
  }

  // если был использован оператор
  if (/[-+√*^%\/]/g.test(symbol)) {
    if (!currentLine.value.length) {
      return;
    }

    // если попытка использовать 2 оператора подряд -> удалить предыдущий оператор
    if (currentLine.value.slice(-1) === " ") {
      removeLastSymbol();
      operator = currentLine.value.split(" ")[1];
    }

    // если в выражении уже был использован оператор, то сначала вычислить
    // выражение, используя предыдущий оператор
    if (operator) {
      calculator.requestSubmit();
    }

    // если выражение было полностью стерто, то не использовать последний знак
    // иначе добавить после результата
    if (currentLine.value) {
      currentLine.value += ` ${symbol} `;
    }
  }
  // если была использована цифра или точка
  else {
    // запрет на использование больше одной точки в одном числе
    if (symbol === ".") {
      if (typeof operand2 === "undefined") {
        if (operand1.includes(".")) {
          return;
        }
      } else {
        if (operand2.includes(".")) {
          return;
        }
      }
    }

    if (symbol === "0") {
      let digitsOnly;
      if (typeof operand2 === "undefined") {
        digitsOnly = operand1.replace(/^d./g, "");
        if (digitsOnly.length === 1 && digitsOnly === "0") {
          return;
        }
      } else {
        digitsOnly = operand2.replace(/^d./g, "");
        if (digitsOnly.length === 1 && digitsOnly === "0") {
          return;
        }
      }
    }

    currentLine.value += symbol;
  }

  adjustFontSize();
}

function calculate() {
  let [operand1, operator, operand2] = currentLine.value.split(" ");

  if (operand1 && operand2) {
    operand1 = operand1 === "." ? 0 : Number(operand1);
    operand2 = operand2 === "." ? 0 : Number(operand2);

    let result = mathOperators[operator](operand1, operand2);

    previousLine.innerText = currentLine.value.length
      ? `${currentLine.value} =`
      : "";
    currentLine.value = result ? Number(result.toFixed(8)) : result;
    adjustFontSize();
  }
}

function zeroError() {
  clearInput();

  errorScreen.style.display = "flex";

  setTimeout(() => {
    errorScreen.style.display = "none";
    clearInput();
    return "";
  }, 1800);
}
