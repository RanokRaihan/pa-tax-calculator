// Pennsylvania State Tax Calculator JavaScript

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
    // ACA Additional Medicare Tax: 0.9% on wages above the threshold
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
      {
        tip: "Consider contributing to a 401(k) to reduce your taxable income. Every dollar you contribute pre-tax reduces your current tax burden.",
        category: "Retirement Planning",
      },
      {
        tip: "Pennsylvania has a flat income tax rate of 3.07%, making it relatively tax-friendly compared to other states.",
        category: "Tax Knowledge",
      },
      {
        tip: "Maximize your Health Savings Account (HSA) contributions - they're triple tax-advantaged: deductible, grow tax-free, and withdrawals for medical expenses are tax-free.",
        category: "Healthcare Savings",
      },
      {
        tip: "Create an emergency fund covering 3-6 months of expenses. Start with even $25 per paycheck to build this safety net.",
        category: "Emergency Fund",
      },
      {
        tip: "Local taxes in Pennsylvania vary by municipality. Philadelphia has one of the highest at 3.87%, while many areas have no local income tax.",
        category: "Local Taxes",
      },
      {
        tip: "Review your tax withholdings annually. If you consistently get large refunds, you may be giving the government an interest-free loan.",
        category: "Tax Planning",
      },
      {
        tip: "Consider a Roth IRA for post-tax retirement savings. While contributions aren't deductible, qualified withdrawals in retirement are tax-free.",
        category: "Retirement Planning",
      },
      {
        tip: "Track your expenses for at least one month to understand where your money goes. Many people are surprised by their spending patterns.",
        category: "Budgeting",
      },
      {
        tip: "Pennsylvania doesn't tax retirement income from 401(k)s, IRAs, or pensions for residents 60 and older.",
        category: "Retirement Benefits",
      },
      {
        tip: "Automate your savings by setting up direct deposit into a separate savings account. Pay yourself first before other expenses.",
        category: "Savings Strategy",
      },
    ];

    this.init();
  }

  saveHourlyRate(rate) {
    try {
      localStorage.setItem("paCalc_hourlyRate", rate.toString());
      this.showSaveIndicator();
    } catch (error) {
      console.warn("Could not save hourly rate to localStorage:", error);
    }
  }

  showSaveIndicator() {
    const hourlyRateInput = document.getElementById("hourlyRate");
    hourlyRateInput.style.border = "2px solid #4CAF50";
    setTimeout(() => {
      hourlyRateInput.style.border = "";
      hourlyRateInput.style.transition = "";
    }, 600);
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

  init() {
    this.bindEvents();
    this.loadSavedData();
    this.showRandomTip();
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
    const payTypeInputs = document.querySelectorAll('input[name="payType"]');
    const hourlyRateInput = document.getElementById("hourlyRate");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.calculateTaxes();
    });

    payTypeInputs.forEach((input) => {
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
        if (!isNaN(rate) && rate > 0) {
          this.saveHourlyRate(rate);
        }
      }, 500);
    });

    hourlyRateInput.addEventListener("blur", (e) => {
      clearTimeout(saveTimeout);
      const rate = parseFloat(e.target.value);
      if (!isNaN(rate) && rate > 0) {
        this.saveHourlyRate(rate);
      }
    });
  }

  // Disable the "Annually" pay frequency option when Hourly pay type is selected,
  // since combining them produces a nonsensical annual income of one period's hours.
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
    const hourlyInputs = document.getElementById("hourlyInputs");
    const salaryInputs = document.getElementById("salaryInputs");
    const payType = document.querySelector('input[name="payType"]:checked').value;

    if (payType === "hourly") {
      hourlyInputs.classList.remove("hidden");
      salaryInputs.classList.add("hidden");
    } else {
      hourlyInputs.classList.add("hidden");
      salaryInputs.classList.remove("hidden");
    }
  }

  showRandomTip() {
    const tipContent = document.getElementById("tipContent");
    const randomTip =
      this.financialTips[Math.floor(Math.random() * this.financialTips.length)];
    tipContent.innerHTML = `
      <p>${randomTip.tip}</p>
      <span class="tip-category">${randomTip.category}</span>
    `;
  }

  calculateTaxes() {
    try {
      const formData = this.getFormData();
      const calculations = this.performCalculations(formData);
      this.displayResults(calculations, formData.payFrequency);
    } catch (error) {
      console.error("Calculation error:", error);
      alert(error.message || "Please check your input values and try again.");
    }
  }

  getFormData() {
    const payFrequency = document.getElementById("payFrequency").value;
    const filingStatus = document.getElementById("filingStatus").value;
    const payType = document.querySelector('input[name="payType"]:checked').value;

    // Section 125 benefits (health/dental/vision, FSA) reduce both income tax and FICA
    const preTaxBenefits =
      parseFloat(document.getElementById("preTaxBenefits").value) || 0;
    // Retirement contributions (401k, 403b) reduce income tax only — not FICA
    const retirementContributions =
      parseFloat(document.getElementById("retirementContributions").value) || 0;
    const postTaxDeductions =
      parseFloat(document.getElementById("postTaxDeductions").value) || 0;
    const localTaxRate =
      parseFloat(document.getElementById("localTax").value) / 100 || 0;

    let grossPay = 0;

    if (payType === "hourly") {
      const hourlyRate =
        parseFloat(document.getElementById("hourlyRate").value) || 0;
      const regularHours =
        parseFloat(document.getElementById("regularHours").value) || 0;
      const overtimeHours =
        parseFloat(document.getElementById("overtimeHours").value) || 0;

      if (hourlyRate <= 0) {
        throw new Error("Please enter a valid hourly rate.");
      }
      if (regularHours < 0 || overtimeHours < 0) {
        throw new Error("Hours cannot be negative.");
      }
      if (regularHours === 0 && overtimeHours === 0) {
        throw new Error("Please enter regular or overtime hours.");
      }

      grossPay = hourlyRate * regularHours + hourlyRate * 1.5 * overtimeHours;
    } else {
      const annualSalary =
        parseFloat(document.getElementById("annualSalary").value) || 0;
      if (annualSalary <= 0) {
        throw new Error("Please enter a valid annual salary.");
      }
      grossPay = annualSalary / this.payFrequencyMultipliers[payFrequency];
    }

    return {
      payFrequency,
      filingStatus,
      payType,
      grossPay,
      preTaxBenefits,
      retirementContributions,
      postTaxDeductions,
      localTaxRate,
    };
  }

  performCalculations(data) {
    const {
      grossPay,
      preTaxBenefits,
      retirementContributions,
      postTaxDeductions,
      localTaxRate,
      payFrequency,
      filingStatus,
    } = data;

    const multiplier = this.payFrequencyMultipliers[payFrequency];
    const annualGross = grossPay * multiplier;

    // Section 125 benefits reduce both income tax wages and FICA wages
    const annualPreTaxBenefits = preTaxBenefits * multiplier;
    // Retirement contributions reduce income tax wages but not FICA wages
    const annualRetirement = retirementContributions * multiplier;

    // FICA wages: only Section 125 deductions reduce the base
    const annualFicaWages = Math.max(0, annualGross - annualPreTaxBenefits);

    // Income tax wages: both deduction types reduce the base
    const annualTaxableIncome = Math.max(
      0,
      annualGross - annualPreTaxBenefits - annualRetirement
    );

    // Federal taxable income: further reduced by the filing-status standard deduction
    const standardDeduction = this.standardDeductions[filingStatus];
    const federalTaxableIncome = Math.max(
      0,
      annualTaxableIncome - standardDeduction
    );

    // Per-period taxable income (for display only)
    const taxableIncomePerPeriod = annualTaxableIncome / multiplier;

    // Federal income tax — use brackets matched to filing status
    const brackets =
      filingStatus === "married"
        ? this.federalBracketsMarried
        : this.federalBracketsSingle;
    const federalTax =
      this.calculateFederalTax(federalTaxableIncome, brackets) / multiplier;

    // Social Security: 6.2% on FICA wages up to the annual wage base
    const socialSecurityWages = Math.min(annualFicaWages, this.socialSecurityWageBase);
    const socialSecurity = (socialSecurityWages * this.socialSecurityRate) / multiplier;

    // Medicare: 1.45% on all FICA wages + 0.9% Additional Medicare Tax on high earners
    const additionalMedicareThreshold =
      filingStatus === "married"
        ? this.additionalMedicareMarriedThreshold
        : this.additionalMedicareSingleThreshold;
    const excessWages = Math.max(0, annualFicaWages - additionalMedicareThreshold);
    const annualMedicare =
      annualFicaWages * this.medicareRate +
      excessWages * this.additionalMedicareRate;
    const medicare = annualMedicare / multiplier;

    // PA state income tax: flat 3.07% on income-taxable wages
    const stateTax = (annualTaxableIncome * this.paStateRate) / multiplier;

    // Local/municipal earned income tax: assessed on gross wages (PA EIT standard)
    const localTax = (annualGross * localTaxRate) / multiplier;

    const totalTaxes = federalTax + socialSecurity + medicare + stateTax + localTax;
    const totalPreTax = preTaxBenefits + retirementContributions;
    const totalDeductions = totalPreTax + totalTaxes + postTaxDeductions;
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
    };
  }

  calculateFederalTax(annualIncome, brackets) {
    let tax = 0;
    let processedIncome = 0;

    for (const bracket of brackets) {
      if (annualIncome <= processedIncome) break;
      const incomeInThisBracket = Math.min(
        annualIncome - processedIncome,
        bracket.max - bracket.min
      );
      tax += incomeInThisBracket * bracket.rate;
      processedIncome += incomeInThisBracket;
      if (processedIncome >= annualIncome) break;
    }

    return tax;
  }

  displayResults(calculations, payFrequency) {
    document.getElementById("financialTips").style.display = "none";
    document.getElementById("calculationResults").classList.remove("hidden");

    const payPeriodLabels = {
      weekly: "per week",
      biweekly: "per paycheck (biweekly)",
      "semi-monthly": "per paycheck (semi-monthly)",
      monthly: "per month",
      annually: "per year",
    };
    document.getElementById("payPeriodLabel").textContent =
      payPeriodLabels[payFrequency];

    // Net pay — flag negative results
    const netPayEl = document.getElementById("netPay");
    netPayEl.textContent = calculations.netPay.toFixed(2);
    const netPayContainer = document.querySelector(".net-pay");
    const negativeWarning = document.getElementById("negativePayWarning");
    if (calculations.netPay < 0) {
      netPayContainer.classList.add("negative");
      negativeWarning.style.display = "block";
    } else {
      netPayContainer.classList.remove("negative");
      negativeWarning.style.display = "none";
    }

    // Breakdown
    document.getElementById("grossPay").textContent =
      `$${calculations.grossPay.toFixed(2)}`;
    document.getElementById("preTaxBenefitsAmount").textContent =
      `$${calculations.preTaxBenefits.toFixed(2)}`;
    document.getElementById("retirementContributionsAmount").textContent =
      `$${calculations.retirementContributions.toFixed(2)}`;
    document.getElementById("taxableIncome").textContent =
      `$${calculations.taxableIncomePerPeriod.toFixed(2)}`;
    document.getElementById("federalTax").textContent =
      `$${calculations.federalTax.toFixed(2)}`;
    document.getElementById("socialSecurity").textContent =
      `$${calculations.socialSecurity.toFixed(2)}`;
    document.getElementById("medicare").textContent =
      `$${calculations.medicare.toFixed(2)}`;
    document.getElementById("stateTax").textContent =
      `$${calculations.stateTax.toFixed(2)}`;
    document.getElementById("localTaxAmount").textContent =
      `$${calculations.localTax.toFixed(2)}`;
    document.getElementById("postTaxAmount").textContent =
      `$${calculations.postTaxDeductions.toFixed(2)}`;
    document.getElementById("totalDeductions").textContent =
      `$${calculations.totalDeductions.toFixed(2)}`;
    document.getElementById("finalNetPay").textContent =
      `$${calculations.netPay.toFixed(2)}`;

    const localTaxRow = document.getElementById("localTaxRow");
    localTaxRow.style.display = calculations.localTax === 0 ? "none" : "flex";

    document.getElementById("calculationResults").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TaxCalculator();
});

function resetCalculator() {
  document.getElementById("financialTips").style.display = "block";
  document.getElementById("calculationResults").classList.add("hidden");
  document.getElementById("taxCalculatorForm").reset();

  // Restore saved hourly rate — form.reset() clears the field
  try {
    const savedRate = parseFloat(localStorage.getItem("paCalc_hourlyRate"));
    if (!isNaN(savedRate) && savedRate > 0) {
      document.getElementById("hourlyRate").value = savedRate.toFixed(2);
    }
  } catch (_) {}
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    document
      .getElementById("taxCalculatorForm")
      .dispatchEvent(new Event("submit"));
  }
  // Escape resets the calculator (avoids conflicting with Ctrl+R browser refresh)
  if (e.key === "Escape") {
    resetCalculator();
  }
});
