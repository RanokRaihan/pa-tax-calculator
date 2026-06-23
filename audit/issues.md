# PA Tax Calculator — Audit Report

Date: 2026-06-22

---

## 1. Wrong Tax Year: Federal Brackets Are 2023, Not 2024

**File:** `script.js:5–13` (`federalTaxBrackets2024`)

The array is labelled `2024` but the thresholds match the **2023** IRS tables. The 2024 and 2025 correct values are listed below.

| Bracket | Code (wrong — 2023) | Correct 2024 | Correct 2025 |
|---------|---------------------|--------------|--------------|
| 10%     | $0 – $11,000        | $0 – $11,600 | $0 – $11,925 |
| 12%     | $11,001 – $44,725   | $11,601 – $47,150 | $11,926 – $48,475 |
| 22%     | $44,726 – $95,375   | $47,151 – $100,525 | $48,476 – $103,350 |
| 24%     | $95,376 – $182,050  | $100,526 – $191,950 | $103,351 – $197,300 |
| 32%     | $182,051 – $231,250 | $191,951 – $243,725 | $197,301 – $250,525 |
| 35%     | $231,251 – $578,125 | $243,726 – $609,350 | $250,526 – $626,350 |
| 37%     | $578,125+           | $609,350+    | $626,350+    |

The same wrong brackets are repeated verbatim in **`README.md` lines 59–67**.

---

## 2. Social Security Wage Base Is One Year Behind

**File:** `script.js:26`

```js
this.socialSecurityWageBase = 160200; // 2024 limit
```

The comment is wrong. $160,200 is the **2023** limit.

| Year | Correct Wage Base |
|------|-------------------|
| 2024 | $168,600          |
| 2025 | $176,100          |

---

## 3. Married Filing Jointly Uses Single-Filer Brackets

**File:** `script.js:5–13, 276–279`

The selector for filing status (`#filingStatus`) lets users choose "Married Filing Jointly", and the standard deduction is correctly differentiated (`single: 14600, married: 29200`). However, `calculateFederalTax` always uses `federalTaxBrackets2024`, which are single-filer thresholds only. Married filing jointly brackets are twice as wide at each rate, so a married couple pays thousands more in simulated federal tax than they would in reality.

**Correct 2024 Married Filing Jointly brackets:**

| Bracket | Threshold |
|---------|-----------|
| 10%     | $0 – $23,200 |
| 12%     | $23,201 – $94,300 |
| 22%     | $94,301 – $201,050 |
| 24%     | $201,051 – $383,900 |
| 32%     | $383,901 – $487,450 |
| 35%     | $487,451 – $731,200 |
| 37%     | $731,200+ |

**Fix required:** Add a separate `marriedTaxBrackets2024` array and select between them based on `filingStatus`.

---

## 4. Standard Deductions Are Stale for the Claimed Year

**File:** `script.js:29–32`

```js
this.standardDeductions = {
  single: 14600,
  married: 29200,
};
```

$14,600 / $29,200 are the **2024** values (they happen to be correct if the app targets 2024). However, given that the brackets and wage base are actually 2023 values, there is an inconsistency — 2023 standard deductions were $13,850 / $27,700. If the intent is to update to 2024, the standard deductions are right but the brackets (issues 1–3) still need fixing. For 2025 the values are $15,000 / $30,000.

---

## 5. FICA Applied Incorrectly to All Pre-Tax Deductions

**File:** `script.js:291–302`

```js
const socialSecurityWages = Math.min(annualTaxableIncome, this.socialSecurityWageBase);
const socialSecurity = (socialSecurityWages * this.socialSecurityRate) / ...
const medicare = (annualTaxableIncome * this.medicareRate) / ...
```

`annualTaxableIncome` is gross minus all pre-tax deductions. In reality:

- **Traditional 401(k) / 403(b)** contributions reduce federal and state income tax but do **not** reduce Social Security or Medicare wages.
- **Section 125 (cafeteria plan)** deductions (health/dental/vision premiums, FSA) reduce both income tax **and** FICA.

Because the app bundles all pre-tax deductions into one field and deducts all of them from FICA, it systematically under-reports Social Security and Medicare tax for anyone with 401(k) contributions. For an employee contributing $10,000/yr to a 401(k), this understates FICA by roughly $765 per year.

---

## 6. Annual Pay Frequency + Hourly Pay Type Produces Nonsensical Results

**File:** `script.js:222–244, 267–268`

When a user selects "Annually" as pay frequency and "Hourly" as pay type, the gross pay is calculated as:

```js
grossPay = hourlyRate * regularHours + hourlyRate * 1.5 * overtimeHours;
```

Then:

```js
const annualGross = grossPay * this.payFrequencyMultipliers["annually"]; // × 1
```

So the calculator treats a single session's hours (e.g., 40 hours at $25 = $1,000) as the person's entire annual income. A user legitimately entering their hours to see their annual picture would get wildly wrong results with 1 being the multiplier.

**Fix:** Either disable the Annual option when Hourly is selected, or clarify in the UI that "Annual" assumes the entered hours represent the whole year.

---

## 7. No Additional Medicare Tax on High Earners

**File:** `script.js:298–301`

The ACA Additional Medicare Tax imposes an extra **0.9%** on wages exceeding $200,000 (single) or $250,000 (married filing jointly). The calculator only applies the flat 1.45% rate. For high earners this under-reports Medicare tax by a meaningful amount.

---

## 8. Local Tax Base May Be Incorrect

**File:** `script.js:308–311`

```js
const localTax = (annualTaxableIncome * localTaxRate) / ...
```

PA municipal earned income taxes (Philadelphia, Pittsburgh, etc.) are generally assessed on **gross earned income**, not income reduced by pre-tax benefit deductions. Using `annualTaxableIncome` (after subtracting pre-tax deductions) under-reports local tax for employees with pre-tax deductions.

---

## 9. Dead Code — Three Unused Functions

**File:** `script.js:431–485`

```js
formatCurrency(amount) { ... }       // line 431 — method on class, never called
validatePositiveNumber(value, ...) { ... }  // line 471 — standalone function, never called
validatePercentage(value, ...) { ... }      // line 479 — standalone function, never called
```

None of these are called anywhere. `formatCurrency` is a class method; `validatePositiveNumber` and `validatePercentage` are module-level functions defined after the class but never imported or invoked.

---

## 10. Reset Does Not Restore Saved Hourly Rate

**File:** `script.js:446–450`

```js
function resetCalculator() {
  document.getElementById("taxCalculatorForm").reset(); // clears the hourly rate field
  ...
}
```

`form.reset()` clears the hourly rate input back to its placeholder. However, `loadSavedData()` (which restores the persisted rate from `localStorage`) is only called once during `init()`. After a reset, the saved rate is silently discarded from the UI even though it remains in `localStorage`. The user would need to reload the page to get their saved rate back.

---

## 11. Save Indicator Leaves a Stale Transition Style

**File:** `script.js:90–101`

```js
showSaveIndicator() {
  const originalBorder = hourlyRateInput.style.border; // likely ""
  hourlyRateInput.style.border = "2px solid #4CAF50";
  hourlyRateInput.style.transition = "border 0.3s ease";
  setTimeout(() => {
    hourlyRateInput.style.border = originalBorder; // restores border
    // transition is never cleared
  }, 600);
}
```

`transition` is set to `"border 0.3s ease"` but never removed. After the first save, all subsequent inline-style border changes on that element (including the reset back to `originalBorder`) will animate, which may conflict with CSS transitions defined in `styles.css`.

---

## 12. Negative Net Pay Is Displayed Without Warning

**File:** `script.js:359–427` (`displayResults`)

If deductions (pre-tax + taxes + post-tax) exceed gross pay, `netPay` will be a negative number. The results panel displays it as a bare negative dollar amount (e.g., `-$123.45`) with no validation message or visual distinction. This happens silently — a user who accidentally enters an unreasonably large deduction amount will see a confusing result.

---

## 13. Zero Regular Hours Submits Without Error

**File:** `script.js:230–234`

```js
if (hourlyRate <= 0 || regularHours < 0 || overtimeHours < 0) {
  throw new Error("Invalid hourly input values");
}
```

`regularHours < 0` allows `regularHours = 0`. Submitting with a valid hourly rate but zero regular hours and zero overtime hours computes a gross pay of $0 and renders a full results panel showing $0.00 everywhere — no validation message, which may confuse users.

---

## 14. Ctrl+R Keyboard Shortcut Conflicts With Browser Refresh

**File:** `script.js:453–467`

```js
case "r":
  e.preventDefault();
  resetCalculator();
  break;
```

`e.preventDefault()` on a `keydown` event does prevent the default action in some contexts, but browser-level keyboard shortcuts (Cmd+R on macOS, Ctrl+R on Windows/Linux for page refresh) are often handled at a higher priority than page scripts. Behavior is inconsistent across browsers and may not reliably intercept the refresh shortcut.

---

## Summary Table

| # | Severity | Category | Description |
|---|----------|----------|-------------|
| 1 | Critical | Tax accuracy | Federal brackets are 2023 values, not 2024 |
| 2 | Critical | Tax accuracy | SS wage base is $160,200 (2023), should be $168,600 (2024) |
| 3 | Critical | Tax accuracy | Married Filing Jointly uses single-filer brackets |
| 4 | Medium   | Tax accuracy | Standard deductions inconsistent with bracket year |
| 5 | High     | Tax accuracy | FICA incorrectly reduced by 401(k) pre-tax deductions |
| 6 | High     | Logic flaw   | Annual frequency + hourly type gives nonsensical results |
| 7 | Medium   | Tax accuracy | No Additional Medicare Tax (0.9%) for high earners |
| 8 | Medium   | Tax accuracy | Local tax base should be gross wages, not post-pre-tax income |
| 9 | Low      | Code quality | Three unused functions (dead code) |
| 10| Low      | UX bug       | Reset doesn't restore saved hourly rate from localStorage |
| 11| Low      | Code quality | `showSaveIndicator` leaks a CSS transition style |
| 12| Low      | UX           | Negative net pay shown without warning |
| 13| Low      | UX           | Zero hours submits silently, shows all zeros |
| 14| Low      | UX           | Ctrl+R conflicts with browser page-refresh shortcut |
