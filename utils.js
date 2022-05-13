const mathOperators = {
  "+": (a, b) => Number((a + b).toFixed(8)),
  "-": (a, b) => Number((a - b).toFixed(8)),
  "*": (a, b) => Number((a * b).toFixed(8)),
  "/": (a, b) => {
    if (b === 0) {
      return zeroError();
    }
    return Number((a / b).toFixed(8));
  },
  "%": (a, b) => Number(((a / 100) * b).toFixed(8)),
  "^": (a, b) => Number(Math.pow(a, b).toFixed(8)),
  "√": (a, b) => {
    // чтобы вычислять корни из отрицательных чисел, требуется вводить мнимые числа
    if (a < 0) {
      return zeroError();
    }
    return Number(Math.pow(a, 1 / b).toFixed(8));
  },
  sin: (x) => Math.sin(x),
  cos: (x) => Math.cos(x),
  tan: (x) => Math.tan(x),
};

function validateSymbol(symbol) {
  // Enter, Backspace и CE не являются операторами, поэтому перехватываются
  // для передачи им особых обработчиков.
  // Знак = не является бинарным оператором и эквивалентен Enter
  if (symbol === "Enter" || symbol === "=") {
    calculator.requestSubmit();
    return false;
  }

  if (symbol === "Backspace") {
    removeLastSymbol();
    return false;
  }

  // очистка калькулятора
  if (symbol === "CE") {
    clearInput();
    return false;
  }

  // операторы %, +/-, sin, cos и tan являются унарными операторами поэтому
  // также перехватываются для передачи им особых обработчиков

  // применение +/-
  if (symbol === "invert") {
    let splitted = currentLine.value.split(" ");

    if (splitted[2] && splitted[2] !== ".") {
      splitted[2] *= -1;
    } else {
      if (splitted[0] && splitted[0] !== ".") {
        splitted[0] *= -1;
      }
    }

    currentLine.value = splitted.join(" ");
    adjustFontSize();
    return false;
  }

  if (symbol === "%") {
    let calculated = calculatePercentage();

    if (calculated !== undefined) {
      previousLine.innerText = currentLine.value + "% =";
      currentLine.value = calculated;
      adjustFontSize();
    }
    return false;
  }

  // встроенные методы Math sin(), cos() и tan() ужасно неточные.
  // В математике sin(90) = 1, но Math.sin(90) = 0.8939966636005579
  // поэтому для более точного результата используется формула Бхаскара
  if (symbol === "sin" || symbol === "cos" || symbol === "tan") {
    handleTrigFunction(symbol);
    return false;
  }
  // = = = = = = = = = = = = = = end of sinus cosinus

  const isKeyAllowed = /^[\d-+√*^%\/.]$/.test(symbol);

  if (!isKeyAllowed) {
    return false;
  }
  return true;
}

function removeLastSymbol() {
  const expressionLength = currentLine.value.length;

  if (expressionLength) {
    // операторы с обоих сторон отделены пробелами от чисел, поэтому
    // если последний символ является пробелом, то в конце строки оператор
    if (currentLine.value[expressionLength - 1] === " ") {
      currentLine.value = currentLine.value.slice(0, expressionLength - 3);
      adjustFontSize();
      return;
    }

    currentLine.value = currentLine.value.slice(0, expressionLength - 1);

    // если после удаления символа остался только минус, то удалить и его
    if (currentLine.value[currentLine.value.length - 1] === "-") {
      removeLastSymbol();
    }

    adjustFontSize();
  }
}

// = = = = = = = = = = = = = = = подстраивает размер текста под длину выражения
function adjustFontSize() {
  currentLine.style.fontSize = "1.75rem";
  if (currentLine.value.length > 16) {
    currentLine.style.fontSize = "1.25rem";
  }
  if (currentLine.value.length > 23) {
    currentLine.style.fontSize = "1rem";
  }
  if (currentLine.value.length > 30) {
    currentLine.style.fontSize = "0.875rem";
  }
}

function clearInput() {
  currentLine.value = "";
  adjustFontSize();
}

function calculatePercentage(num) {
  let [operand1, operator, operand2] = currentLine.value.split(" ");
  // для расчета процента должны соблюдаться 2 условия
  // должны быть оба операнда и пооледний оператор должен быть умножением
  if (operator === "*" && operand2) {
    operand1 = operand1 === "." ? 0 : Number(operand1);
    operand2 = operand2 === "." ? 0 : Number(operand2);
    return mathOperators["%"](operand1, operand2);
  }
  return;
}

function handleTrigFunction(symbol) {
  let [operand1, operator, operand2] = currentLine.value.split(" ");

  operand1 = operand1 === "." ? 0 : Number(operand1);

  let isCalculated = false;
  let calculatedValue;

  if (typeof operand2 !== "undefined") {
    operand2 = operand2 === "." ? 0 : Number(operand2);

    // конвертация из градусов в радианы
    let radians = (operand2 * Math.PI) / 180;

    calculatedValue = Number(mathOperators[symbol](radians).toFixed(8));
    // если sin, cos или tan были вторым оператором в строке, то
    // сначала вычисляется значение тригонометрической функции, а затем
    // это результат используется для расчета всего выражения
    calculatedValue = mathOperators[operator](operand1, calculatedValue);
    previousLine.innerText =
      [operand1, operator, `${symbol}(${operand2})`].join(" ") + " =";
    isCalculated = true;
  }

  if (!isCalculated && typeof operand1 !== "undefined") {
    let radians = (operand1 * Math.PI) / 180;
    calculatedValue = Number(mathOperators[symbol](radians).toFixed(8));
    previousLine.innerText = `${symbol}(${operand1}) =`;
    isCalculated = true;
  }

  if (isCalculated) {
    currentLine.value = calculatedValue;
    adjustFontSize();
  }
}
