// Pennsylvania State Tax Calculator

class TaxCalculator {
  constructor() {
    // 2024 Federal Tax Brackets — Single / Married Filing Separately
    this.federalBracketsSingle = [
      { min: 0,      max: 11600,   rate: 0.10 },
      { min: 11600,  max: 47150,   rate: 0.12 },
      { min: 47150,  max: 100525,  rate: 0.22 },
      { min: 100525, max: 191950,  rate: 0.24 },
      { min: 191950, max: 243725,  rate: 0.32 },
      { min: 243725, max: 609350,  rate: 0.35 },
      { min: 609350, max: Infinity, rate: 0.37 },
    ];

    // 2024 Federal Tax Brackets — Married Filing Jointly
    this.federalBracketsMarried = [
      { min: 0,      max: 23200,   rate: 0.10 },
      { min: 23200,  max: 94300,   rate: 0.12 },
      { min: 94300,  max: 201050,  rate: 0.22 },
      { min: 201050, max: 383900,  rate: 0.24 },
      { min: 383900, max: 487450,  rate: 0.32 },
      { min: 487450, max: 731200,  rate: 0.35 },
      { min: 731200, max: Infinity, rate: 0.37 },
    ];

    this.payFrequencyMultipliers = {
      weekly: 52,
      biweekly: 26,
      "semi-monthly": 24,
      monthly: 12,
      annually: 1,
    };

    this.socialSecurityRate = 0.062;
    this.medicareRate = 0.0145;
    this.additionalMedicareRate = 0.009;
    this.additionalMedicareSingleThreshold = 200000;
    this.additionalMedicareMarriedThreshold = 250000;

    this.paStateRate = 0.0307;
    this.socialSecurityWageBase = 168600; // 2024

    // 2024 Standard Deductions
    this.standardDeductions = {
      single: 14600,
      married: 29200,
    };

    this.financialTips = [
      { tip: "Consider contributing to a 401(k) to reduce your taxable income. Every dollar you contribute pre-tax reduces your current tax burden.", category: "Retirement Planning" },
      { tip: "Pennsylvania has a flat income tax rate of 3.07%, making it relatively tax-friendly compared to other states.", category: "Tax Knowledge" },
      { tip: "Maximize your Health Savings Account (HSA) contributions - they're triple tax-advantaged: deductible, grow tax-free, and withdrawals for medical expenses are tax-free.", category: "Healthcare Savings" },
      { tip: "Create an emergency fund covering 3-6 months of expenses. Start with even $25 per paycheck to build this safety net.", category: "Emergency Fund" },
      { tip: "Local taxes in Pennsylvania vary by municipality. Philadelphia has one of the highest at 3.87%, while many areas have no local income tax.", category: "Local Taxes" },
      { tip: "Review your tax withholdings annually. If you consistently get large refunds, you may be giving the government an interest-free loan.", category: "Tax Planning" },
      { tip: "Consider a Roth IRA for post-tax retirement savings. While contributions aren't deductible, qualified withdrawals in retirement are tax-free.", category: "Retirement Planning" },
      { tip: "Track your expenses for at least one month to understand where your money goes. Many people are surprised by their spending patterns.", category: "Budgeting" },
      { tip: "Pennsylvania doesn't tax retirement income from 401(k)s, IRAs, or pensions for residents 60 and older.", category: "Retirement Benefits" },
      { tip: "Automate your savings by setting up direct deposit into a separate savings account. Pay yourself first before other expenses.", category: "Savings Strategy" },
    ];

    // UI state
    this.showAnnual = false;
    this.lastCalculations = null;
    this.tipIndex = Math.floor(Math.random() * this.financialTips.length);

    this.init();
  }

  // ─── localStorage ───

  saveHourlyRate(rate) {
    try {
      localStorage.setItem("paCalc_hourlyRate", rate.toString());
      this.showSaveIndicator();
    } catch (error) {
      console.warn("Could not save hourly rate to localStorage:", error);
    }
  }

  // #11 (from original issues.md): CSS class instead of leaking inline styles
  showSaveIndicator() {
    const input = document.getElementById("hourlyRate");
    input.classList.add("hourly-saved");
    setTimeout(() => input.classList.remove("hourly-saved"), 700);
  }

  loadHourlyRate() {
    try {
      const savedRate = localStorage.getItem("paCalc_hourlyRate");
      return savedRate ? parseFloat(savedRate) : null;
    } catch (error) {
      console.warn("Could not load hourly rate from localStorage:", error);
      return null;
    }
  }

  // ─── Init ───

  init() {
    this.bindEvents();
    this.loadSavedData();
    this.renderTip();
    this.togglePayInputs();
    this.toggleAnnuallyOption();
  }

  loadSavedData() {
    const savedHourlyRate = this.loadHourlyRate();
    if (savedHourlyRate !== null && savedHourlyRate > 0) {
      document.getElementById("hourlyRate").value = savedHourlyRate.toFixed(2);
    }
  }

  bindEvents() {
    const form = document.getElementById("taxCalculatorForm");
    const hourlyRateInput = document.getElementById("hourlyRate");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.calculateTaxes();
    });

    document.querySelectorAll('input[name="payType"]').forEach((input) => {
      input.addEventListener("change", () => {
        this.togglePayInputs();
        this.toggleAnnuallyOption();
      });
    });

    let saveTimeout;
    hourlyRateInput.addEventListener("input", (e) => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const rate = parseFloat(e.target.value);
        if (!isNaN(rate) && rate > 0) this.saveHourlyRate(rate);
      }, 500);
    });

    hourlyRateInput.addEventListener("blur", (e) => {
      clearTimeout(saveTimeout);
      const rate = parseFloat(e.target.value);
      if (!isNaN(rate) && rate > 0) this.saveHourlyRate(rate);
    });

    // #10: next tip cycling
    document.getElementById("nextTipBtn").addEventListener("click", () => this.nextTip());

    // #3: reset button in results panel
    document.getElementById("resetBtn").addEventListener("click", () => this.reset());

    // #8: annual / per-period toggle
    document.getElementById("periodToggleBtn").addEventListener("click", () => this.toggleAnnual());

    // #19: deductions accordion
    document.getElementById("deductionsToggle").addEventListener("click", () => this.toggleDeductions());

    // #14: mobile tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
    });
  }

  // ─── Pay input controls ───

  // Disable "Annually" when Hourly is selected — combining them is nonsensical
  toggleAnnuallyOption() {
    const payType = document.querySelector('input[name="payType"]:checked').value;
    const payFrequencySelect = document.getElementById("payFrequency");
    const annuallyOption = payFrequencySelect.querySelector('option[value="annually"]');

    if (payType === "hourly") {
      annuallyOption.disabled = true;
      if (payFrequencySelect.value === "annually") {
        payFrequencySelect.value = "biweekly";
      }
    } else {
      annuallyOption.disabled = false;
    }
  }

  togglePayInputs() {
    const payType = document.querySelector('input[name="payType"]:checked').value;
    document.getElementById("hourlyInputs").classList.toggle("hidden", payType !== "hourly");
    document.getElementById("salaryInputs").classList.toggle("hidden", payType === "hourly");
  }

  // ─── Tips ───

  renderTip() {
    const tip = this.financialTips[this.tipIndex];
    document.getElementById("tipContent").innerHTML = `
      <p>${tip.tip}</p>
      <span class="tip-category">${tip.category}</span>
    `;
  }

  nextTip() {
    this.tipIndex = (this.tipIndex + 1) % this.financialTips.length;
    this.renderTip();
  }

  // ─── UI state: tabs, accordion, annual toggle ───

  // #14: mobile tab switching
  switchTab(tab) {
    const mainContent = document.getElementById("mainContent");
    mainContent.classList.toggle("show-inputs", tab === "inputs");
    mainContent.classList.toggle("show-results", tab === "results");

    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });
  }

  // #19: deductions accordion
  toggleDeductions() {
    const section = document.getElementById("deductionsSection");
    const toggle = document.getElementById("deductionsToggle");
    const isOpen = section.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  }

  // #8: annual / per-period toggle
  toggleAnnual() {
    this.showAnnual = !this.showAnnual;
    const btn = document.getElementById("periodToggleBtn");
    btn.textContent = this.showAnnual ? "Show Per-Period" : "Show Annual";
    btn.classList.toggle("annual-active", this.showAnnual);
    if (this.lastCalculations) {
      this.renderValues(this.lastCalculations);
    }
  }

  // ─── Error handling (#5) ───

  showError(message) {
    const el = document.getElementById("formError");
    el.textContent = message;
    el.classList.add("visible");
  }

  clearError() {
    document.getElementById("formError").classList.remove("visible");
  }

  // ─── Reset (#3, #10 from original issues) ───

  reset() {
    document.getElementById("financialTips").style.removeProperty("display");
    document.getElementById("calculationResults").classList.add("hidden");
    document.getElementById("taxCalculatorForm").reset();

    // form.reset() wipes the field — restore the saved rate
    try {
      const savedRate = parseFloat(localStorage.getItem("paCalc_hourlyRate"));
      if (!isNaN(savedRate) && savedRate > 0) {
        document.getElementById("hourlyRate").value = savedRate.toFixed(2);
      }
    } catch (_) {}

    this.clearError();
    this.lastCalculations = null;
    this.showAnnual = false;

    const toggleBtn = document.getElementById("periodToggleBtn");
    toggleBtn.textContent = "Show Annual";
    toggleBtn.classList.remove("annual-active");

    this.switchTab("inputs");
  }

  // ─── Calculation ───

  calculateTaxes() {
    this.clearError();
    try {
      const formData = this.getFormData();
      const calculations = this.performCalculations(formData);
      this.lastCalculations = calculations;
      this.displayResults(calculations);
    } catch (error) {
      console.error("Calculation error:", error);
      // #5: inline error instead of alert()
      this.showError(error.message || "Please check your input values and try again.");
    }
  }

  getFormData() {
    const payFrequency = document.getElementById("payFrequency").value;
    const filingStatus = document.getElementById("filingStatus").value;
    const payType = document.querySelector('input[name="payType"]:checked').value;

    // Section 125 benefits reduce both income tax and FICA
    const preTaxBenefits = parseFloat(document.getElementById("preTaxBenefits").value) || 0;
    // Retirement contributions (401k/403b) reduce income tax only — not FICA
    const retirementContributions = parseFloat(document.getElementById("retirementContributions").value) || 0;
    const postTaxDeductions = parseFloat(document.getElementById("postTaxDeductions").value) || 0;
    const localTaxRate = parseFloat(document.getElementById("localTax").value) / 100 || 0;

    let grossPay = 0;

    if (payType === "hourly") {
      const hourlyRate = parseFloat(document.getElementById("hourlyRate").value) || 0;
      const regularHours = parseFloat(document.getElementById("regularHours").value) || 0;
      const overtimeHours = parseFloat(document.getElementById("overtimeHours").value) || 0;

      if (hourlyRate <= 0) throw new Error("Please enter a valid hourly rate.");
      if (regularHours < 0 || overtimeHours < 0) throw new Error("Hours cannot be negative.");
      if (regularHours === 0 && overtimeHours === 0) throw new Error("Please enter regular or overtime hours.");

      grossPay = hourlyRate * regularHours + hourlyRate * 1.5 * overtimeHours;
    } else {
      const annualSalary = parseFloat(document.getElementById("annualSalary").value) || 0;
      if (annualSalary <= 0) throw new Error("Please enter a valid annual salary.");
      grossPay = annualSalary / this.payFrequencyMultipliers[payFrequency];
    }

    return { payFrequency, filingStatus, payType, grossPay, preTaxBenefits, retirementContributions, postTaxDeductions, localTaxRate };
  }

  performCalculations(data) {
    const { grossPay, preTaxBenefits, retirementContributions, postTaxDeductions, localTaxRate, payFrequency, filingStatus } = data;

    const multiplier = this.payFrequencyMultipliers[payFrequency];
    const annualGross = grossPay * multiplier;

    const annualPreTaxBenefits = preTaxBenefits * multiplier;
    const annualRetirement = retirementContributions * multiplier;

    // Section 125 reduces FICA; 401(k) does not
    const annualFicaWages = Math.max(0, annualGross - annualPreTaxBenefits);
    const annualTaxableIncome = Math.max(0, annualGross - annualPreTaxBenefits - annualRetirement);

    // Federal taxable income — further reduced by standard deduction
    const standardDeduction = this.standardDeductions[filingStatus];
    const federalTaxableIncome = Math.max(0, annualTaxableIncome - standardDeduction);

    const taxableIncomePerPeriod = annualTaxableIncome / multiplier;

    // Federal income tax using filing-status brackets
    const brackets = filingStatus === "married" ? this.federalBracketsMarried : this.federalBracketsSingle;
    const federalTax = this.calculateFederalTax(federalTaxableIncome, brackets) / multiplier;

    // Social Security: 6.2% up to wage base
    const socialSecurityWages = Math.min(annualFicaWages, this.socialSecurityWageBase);
    const socialSecurity = (socialSecurityWages * this.socialSecurityRate) / multiplier;

    // Medicare: 1.45% + 0.9% ACA surtax on high earners
    const additionalMedicareThreshold = filingStatus === "married"
      ? this.additionalMedicareMarriedThreshold
      : this.additionalMedicareSingleThreshold;
    const excessWages = Math.max(0, annualFicaWages - additionalMedicareThreshold);
    const annualMedicare = annualFicaWages * this.medicareRate + excessWages * this.additionalMedicareRate;
    const medicare = annualMedicare / multiplier;

    // PA state income tax: 3.07% flat
    const stateTax = (annualTaxableIncome * this.paStateRate) / multiplier;

    // Local EIT: assessed on gross wages (PA standard)
    const localTax = (annualGross * localTaxRate) / multiplier;

    const totalTaxesPerPeriod = federalTax + socialSecurity + medicare + stateTax + localTax;
    const totalPreTax = preTaxBenefits + retirementContributions;
    const totalDeductions = totalPreTax + totalTaxesPerPeriod + postTaxDeductions;
    const netPay = grossPay - totalDeductions;

    return {
      grossPay,
      preTaxBenefits,
      retirementContributions,
      taxableIncomePerPeriod,
      federalTax,
      socialSecurity,
      medicare,
      stateTax,
      localTax,
      postTaxDeductions,
      totalDeductions,
      netPay,
      totalTaxesPerPeriod, // #9: for effective rate
      periodMultiplier: multiplier, // #8: for annual toggle
      payFrequency,                 // #8: for label updates
    };
  }

  calculateFederalTax(annualIncome, brackets) {
    let tax = 0;
    let processedIncome = 0;

    for (const bracket of brackets) {
      if (annualIncome <= processedIncome) break;
      const incomeInThisBracket = Math.min(annualIncome - processedIncome, bracket.max - bracket.min);
      tax += incomeInThisBracket * bracket.rate;
      processedIncome += incomeInThisBracket;
      if (processedIncome >= annualIncome) break;
    }

    return tax;
  }

  // ─── Display ───

  displayResults(calculations) {
    document.getElementById("financialTips").style.display = "none";
    document.getElementById("calculationResults").classList.remove("hidden");

    // Negative pay state
    const netPayContainer = document.querySelector(".net-pay");
    const negativeWarning = document.getElementById("negativePayWarning");
    if (calculations.netPay < 0) {
      netPayContainer.classList.add("negative");
      negativeWarning.classList.add("visible");
    } else {
      netPayContainer.classList.remove("negative");
      negativeWarning.classList.remove("visible");
    }

    this.renderValues(calculations);

    // #14: auto-switch to results tab on mobile after calculation
    this.switchTab("results");

    document.getElementById("calculationResults").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // Separated so the annual toggle can re-render without re-running the full display flow
  renderValues(calculations) {
    const m = this.showAnnual ? calculations.periodMultiplier : 1;
    const fmt = (n) => `$${(n * m).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // #8: pay period label changes when showing annual
    const perPeriodLabels = {
      weekly: "per week",
      biweekly: "per paycheck (biweekly)",
      "semi-monthly": "per paycheck (semi-monthly)",
      monthly: "per month",
      annually: "per year",
    };
    const annualLabels = {
      weekly: "per year (52 weeks)",
      biweekly: "per year (26 pay periods)",
      "semi-monthly": "per year (24 pay periods)",
      monthly: "per year (12 months)",
      annually: "per year",
    };
    document.getElementById("payPeriodLabel").textContent = this.showAnnual
      ? annualLabels[calculations.payFrequency]
      : perPeriodLabels[calculations.payFrequency];

    document.getElementById("netPay").textContent =
      (calculations.netPay * m).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    document.getElementById("grossPay").textContent                     = fmt(calculations.grossPay);
    document.getElementById("preTaxBenefitsAmount").textContent         = fmt(calculations.preTaxBenefits);
    document.getElementById("retirementContributionsAmount").textContent = fmt(calculations.retirementContributions);
    document.getElementById("taxableIncome").textContent                = fmt(calculations.taxableIncomePerPeriod);
    document.getElementById("federalTax").textContent                   = fmt(calculations.federalTax);
    document.getElementById("socialSecurity").textContent               = fmt(calculations.socialSecurity);
    document.getElementById("medicare").textContent                     = fmt(calculations.medicare);
    document.getElementById("stateTax").textContent                     = fmt(calculations.stateTax);
    document.getElementById("localTaxAmount").textContent               = fmt(calculations.localTax);
    document.getElementById("postTaxAmount").textContent                = fmt(calculations.postTaxDeductions);
    document.getElementById("totalDeductions").textContent              = fmt(calculations.totalDeductions);

    // #9: effective tax rate (percentage — unchanged by period toggle)
    const effectiveRate = calculations.grossPay > 0
      ? ((calculations.totalTaxesPerPeriod / calculations.grossPay) * 100).toFixed(1)
      : "0.0";
    document.getElementById("effectiveTaxRate").textContent = `${effectiveRate}%`;
  }
}

// ─── Bootstrap ───

let calculatorInstance;

document.addEventListener("DOMContentLoaded", () => {
  calculatorInstance = new TaxCalculator();
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    document.getElementById("taxCalculatorForm").dispatchEvent(new Event("submit"));
  }
  if (e.key === "Escape" && calculatorInstance) {
    calculatorInstance.reset();
  }
});
