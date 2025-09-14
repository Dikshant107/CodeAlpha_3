// script.js - BattleCalc logic with keyboard support and live preview

const expressionEl = document.getElementById('expression');
const previewEl = document.getElementById('preview');
const buttons = Array.from(document.querySelectorAll('.btn'));

let expr = '';          // stored expression (with plain symbols like + - * /)
let parenToggle = false; // helpful for simple parentheses insertion

// helper: map displayed operator symbols to JS operators
const displayToJs = { '×': '*', '÷': '/', '−': '-' };
const jsToDisplay = { '*': '×', '/': '÷', '-': '−' };

// update UI
function render() {
  expressionEl.textContent = expr || '0';
  const val = tryEvaluate(expr);
  previewEl.textContent = (val === null ? '' : `= ${formatNumber(val)}`);
}

// sanitize expression for evaluation: allow digits, operators, parentheses and dot
function sanitizeForEval(s) {
  // replace display operators with JS ones
  let t = s.replace(/[×÷−]/g, m => displayToJs[m] || m);
  // remove any disallowed chars
  if (/[^0-9+\-*/().\s]/.test(t)) return null;
  return t;
}

// try to evaluate expression; return number or null on error
function tryEvaluate(s) {
  const sanitized = sanitizeForEval(s);
  if (!sanitized) return null;
  // avoid evaluating expressions that end with operator
  if (/[\+\-*/.\s]$/.test(sanitized)) {
    // try evaluating without trailing operators if possible
    const trimmed = sanitized.replace(/[\+\-*/.\s]+$/,'');
    if (!trimmed) return null;
    try {
      const result = Function('"use strict";return (' + trimmed + ')')();
      return Number.isFinite(result) ? result : null;
    } catch(e){ return null; }
  }
  try {
    const result = Function('"use strict";return (' + sanitized + ')')();
    return Number.isFinite(result) ? result : null;
  } catch (e) { return null; }
}

// format big/small numbers cleanly
function formatNumber(n) {
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 1e-6 && n !== 0)) {
    return n.toExponential(6);
  }
  return Number.isFinite(n) ? +parseFloat(n.toFixed(10)) : n;
}

// button click handling
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const value = btn.dataset.value;

    if (action === 'clear') {
      expr = '';
      render();
      return;
    }
    if (action === 'back') {
      expr = expr.slice(0, -1);
      render();
      return;
    }
    if (action === 'paren') {
      // simple toggle: insert '(' then next toggle ')'
      const leftCount = (expr.match(/\(/g) || []).length;
      const rightCount = (expr.match(/\)/g) || []).length;
      if (leftCount === rightCount) {
        expr += '(';
      } else {
        expr += ')';
      }
      render();
      return;
    }
    if (action === 'equals') {
      const val = tryEvaluate(expr);
      if (val !== null) {
        expr = String(formatNumber(val));
      }
      render();
      return;
    }

    // normal value buttons (numbers, dot, operators)
    if (value) {
      // prevent multiple dots in a number segment
      if (value === '.' ) {
        // find last operator index
        const lastOp = Math.max(
          expr.lastIndexOf('+'),
          expr.lastIndexOf('−'),
          expr.lastIndexOf('-'),
          expr.lastIndexOf('×'),
          expr.lastIndexOf('*'),
          expr.lastIndexOf('÷'),
          expr.lastIndexOf('/'),
        );
        const segment = expr.slice(lastOp + 1);
        if (segment.includes('.')) return; // ignore second dot
      }

      // convert js operator display if user clicked + - × ÷
      expr += value;
      render();
    }
  });
});

// keyboard support
window.addEventListener('keydown', (e) => {
  // numbers
  if (/^[0-9]$/.test(e.key)) {
    expr += e.key;
    render();
    e.preventDefault();
    return;
  }
  // operators + - * / or × ÷
  if (e.key === '+' || e.key === '-') {
    expr += e.key;
    render();
    e.preventDefault();
    return;
  }
  if (e.key === '*' || e.key === '/') {
    // display friendly operator
    const display = e.key === '*' ? '×' : '÷';
    expr += display;
    render();
    e.preventDefault();
    return;
  }
  // Enter / =
  if (e.key === 'Enter' || e.key === '=') {
    const val = tryEvaluate(expr);
    if (val !== null) expr = String(formatNumber(val));
    render();
    e.preventDefault();
    return;
  }
  // Backspace
  if (e.key === 'Backspace') {
    expr = expr.slice(0, -1);
    render();
    e.preventDefault();
    return;
  }
  // Esc -> clear
  if (e.key === 'Escape') {
    expr = '';
    render();
    e.preventDefault();
    return;
  }
  // parentheses
  if (e.key === '(' || e.key === ')') {
    expr += e.key;
    render();
    e.preventDefault();
    return;
  }
  // dot
  if (e.key === '.') {
    expr += '.';
    render();
    e.preventDefault();
    return;
  }
});

// initial render
render();
