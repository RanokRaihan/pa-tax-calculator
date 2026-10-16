# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static, no-build vanilla HTML/CSS/JS web app for calculating Pennsylvania take-home pay. No package manager, no bundler, no framework — just three files served as-is.

Deployed on GitHub Pages: `https://ranokraihan.github.io/pa-tax-calculator/`

## Running the App

Open `index.html` directly in a browser, or serve it locally:

```bash
python3 -m http.server 8080
# Visit http://localhost:8080
```

There are no build steps, no `npm install`, and no test suite.

## Architecture

All logic lives in `script.js` as a single `TaxCalculator` class. The class is instantiated once on `DOMContentLoaded`.

**Calculation flow** (`performCalculations`):
1. Annualize the per-period gross pay using `payFrequencyMultipliers`
2. Subtract pre-tax deductions → `annualTaxableIncome`
3. Subtract the standard deduction (filing-status-specific) → `federalTaxableIncome`
4. Run federal progressive brackets against `federalTaxableIncome` via `calculateFederalTax`
5. Apply flat rates for FICA and local tax against `annualFicaWages` (gross minus Section 125); PA state tax also uses `annualFicaWages` because PA does not allow a 401(k) deduction
6. Social Security is capped at the `socialSecurityWageBase` ($168,600 for 2024)
7. Divide all annual tax amounts back to per-period, then subtract post-tax deductions

**Hours expressions**: `#regularHours` and `#overtimeHours` are `type="text"` inputs that accept simple arithmetic (e.g. `10+2`, `8*5`). `evaluateHoursExpression(raw, label)` parses them strictly — no `eval`/`Function`: a character whitelist (digits, `.`, whitespace, `+ - * /`), a tokenizer that must reconstruct the input exactly, a `number (op number)*` grammar check (no parentheses, no unary minus, no spaces inside numbers), then a two-pass fold (`* /` before `+ -`). Division by zero throws; results are rounded to 2 decimals. `bindHoursExpression` shows a live `= N hours` hint (or the error) in `#regularHoursHint` / `#overtimeHoursHint`; `reset()` clears them via `clearHoursHints()`. Negative results (e.g. `4-6`) are caught by the existing "Hours cannot be negative" check in `getFormData`.

**localStorage**: The hourly rate is persisted under the key `paCalc_hourlyRate` with a 500 ms debounce on input, plus an immediate save on blur. A brief green border flash confirms the save.

**UI state**: The results panel (`#calculationResults`) starts hidden; financial tips (`#financialTips`) are shown first. After a calculation, tips are hidden and results are shown.

## Tax Constants (2024)

- Federal brackets: progressive 10%–37% (single: $14,600 standard deduction; married: $29,200)
- Social Security: 6.2% up to $168,600 annual wages
- Medicare: 1.45% (no cap)
- PA state: 3.07% flat rate
- Local tax: user-supplied percentage (Philadelphia 3.87%, Pittsburgh 3.00%)

## Keyboard Shortcuts

- `Ctrl/Cmd + Enter` — submit the form
- `Esc` — reset the calculator (clears form, shows tips again; only fires when no input is focused)

## Fonts & Assets

Google Fonts are loaded from CDN (Bebas Neue, Nunito, Poppins). OG image at `assets/images/og-image.png` is sized 1200×630. Favicon is at both `favicon.ico` (root) and `assets/images/favicon.png`.
