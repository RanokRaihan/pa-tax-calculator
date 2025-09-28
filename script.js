// Pennsylvania State Tax Calculator JavaScript

class TaxCalculator {
  constructor() {
    this.federalTaxBrackets2024 = [
      { min: 0, max: 11000, rate: 0.1 },
      { min: 11000, max: 44725, rate: 0.12 },
      { min: 44725, max: 95375, rate: 0.22 },
      { min: 95375, max: 182050, rate: 0.24 },
      { min: 182050, max: 231250, rate: 0.32 },
      { min: 231250, max: 578125, rate: 0.35 },
      { min: 578125, max: Infinity, rate: 0.37 },
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
    this.paStateRate = 0.0307;
    this.socialSecurityWageBase = 160200; // 2024 limit

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

  init() {
    this.bindEvents();
    this.showRandomTip();
    this.togglePayInputs(); // Set initial state
  }

  bindEvents() {
    const form = document.getElementById("taxCalculatorForm");
    const payTypeInputs = document.querySelectorAll('input[name="payType"]');

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.calculateTaxes();
    });

    payTypeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        this.togglePayInputs();
      });
    });
  }

  togglePayInputs() {
    const hourlyInputs = document.getElementById("hourlyInputs");
    const salaryInputs = document.getElementById("salaryInputs");
    const payType = document.querySelector(
      'input[name="payType"]:checked'
    ).value;

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
      alert("Please check your input values and try again.");
    }
  }

  getFormData() {
    const payFrequency = document.getElementById("payFrequency").value;
    const filingStatus = document.getElementById("filingStatus").value;
    const payType = document.querySelector(
      'input[name="payType"]:checked'
    ).value;
    const preTaxDeductions =
      parseFloat(document.getElementById("preTaxDeductions").value) || 0;
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

      if (hourlyRate <= 0 || regularHours < 0 || overtimeHours < 0) {
        throw new Error("Invalid hourly input values");
      }

      grossPay = hourlyRate * regularHours + hourlyRate * 1.5 * overtimeHours;
    } else {
      const annualSalary =
        parseFloat(document.getElementById("annualSalary").value) || 0;

      if (annualSalary <= 0) {
        throw new Error("Invalid salary input");
      }

      grossPay = annualSalary / this.payFrequencyMultipliers[payFrequency];
    }

    return {
      payFrequency,
      filingStatus,
      payType,
      grossPay,
      preTaxDeductions,
      postTaxDeductions,
      localTaxRate,
    };
  }

  performCalculations(data) {
    const {
      grossPay,
      preTaxDeductions,
      postTaxDeductions,
      localTaxRate,
      payFrequency,
      filingStatus,
    } = data;

    // Calculate annual equivalent for tax calculations
    const annualGross = grossPay * this.payFrequencyMultipliers[payFrequency];
    const annualPreTax =
      preTaxDeductions * this.payFrequencyMultipliers[payFrequency];

    // Taxable income after pre-tax deductions
    const annualTaxableIncome = Math.max(0, annualGross - annualPreTax);

    // Federal taxable income after standard deduction
    const standardDeduction = this.standardDeductions[filingStatus];
    const federalTaxableIncome = Math.max(
      0,
      annualTaxableIncome - standardDeduction
    );

    const taxableIncome =
      annualTaxableIncome / this.payFrequencyMultipliers[payFrequency];

    // Federal income tax calculation (using income after standard deduction)
    const federalTax =
      this.calculateFederalTax(federalTaxableIncome) /
      this.payFrequencyMultipliers[payFrequency];

    // FICA taxes (Social Security + Medicare)
    const socialSecurityWages = Math.min(
      annualTaxableIncome,
      this.socialSecurityWageBase
    );
    const socialSecurity =
      (socialSecurityWages * this.socialSecurityRate) /
      this.payFrequencyMultipliers[payFrequency];
    const medicare =
      (annualTaxableIncome * this.medicareRate) /
      this.payFrequencyMultipliers[payFrequency];

    // Pennsylvania state tax (flat rate)
    const stateTax =
      (annualTaxableIncome * this.paStateRate) /
      this.payFrequencyMultipliers[payFrequency];

    // Local tax
    const localTax =
      (annualTaxableIncome * localTaxRate) /
      this.payFrequencyMultipliers[payFrequency];

    // Total deductions
    const totalTaxes =
      federalTax + socialSecurity + medicare + stateTax + localTax;
    const totalDeductions = preTaxDeductions + totalTaxes + postTaxDeductions;

    // Net pay
    const netPay = grossPay - totalDeductions;

    return {
      grossPay,
      preTaxDeductions,
      taxableIncome,
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

  calculateFederalTax(annualIncome) {
    let tax = 0;
    let processedIncome = 0;

    for (const bracket of this.federalTaxBrackets2024) {
      if (annualIncome <= processedIncome) break;

      // Calculate the income that falls within this bracket
      const incomeInThisBracket = Math.min(
        annualIncome - processedIncome,
        bracket.max - bracket.min
      );

      // Only tax the portion that falls within this bracket
      tax += incomeInThisBracket * bracket.rate;
      processedIncome += incomeInThisBracket;

      // If we've processed all income, we're done
      if (processedIncome >= annualIncome) break;
    }

    return tax;
  }

  displayResults(calculations, payFrequency) {
    // Hide tips and show results
    document.getElementById("financialTips").style.display = "none";
    document.getElementById("calculationResults").classList.remove("hidden");

    // Update pay period label
    const payPeriodLabels = {
      weekly: "per week",
      biweekly: "per paycheck (biweekly)",
      "semi-monthly": "per paycheck (semi-monthly)",
      monthly: "per month",
      annually: "per year",
    };

    document.getElementById("payPeriodLabel").textContent =
      payPeriodLabels[payFrequency];

    // Main net pay display
    document.getElementById("netPay").textContent =
      calculations.netPay.toFixed(2);

    // Breakdown details
    document.getElementById(
      "grossPay"
    ).textContent = `$${calculations.grossPay.toFixed(2)}`;
    document.getElementById(
      "preTaxAmount"
    ).textContent = `$${calculations.preTaxDeductions.toFixed(2)}`;
    document.getElementById(
      "taxableIncome"
    ).textContent = `$${calculations.taxableIncome.toFixed(2)}`;
    document.getElementById(
      "federalTax"
    ).textContent = `$${calculations.federalTax.toFixed(2)}`;
    document.getElementById(
      "socialSecurity"
    ).textContent = `$${calculations.socialSecurity.toFixed(2)}`;
    document.getElementById(
      "medicare"
    ).textContent = `$${calculations.medicare.toFixed(2)}`;
    document.getElementById(
      "stateTax"
    ).textContent = `$${calculations.stateTax.toFixed(2)}`;
    document.getElementById(
      "localTaxAmount"
    ).textContent = `$${calculations.localTax.toFixed(2)}`;
    document.getElementById(
      "postTaxAmount"
    ).textContent = `$${calculations.postTaxDeductions.toFixed(2)}`;
    document.getElementById(
      "totalDeductions"
    ).textContent = `$${calculations.totalDeductions.toFixed(2)}`;
    document.getElementById(
      "finalNetPay"
    ).textContent = `$${calculations.netPay.toFixed(2)}`;

    // Hide local tax row if no local tax
    const localTaxRow = document.getElementById("localTaxRow");
    if (calculations.localTax === 0) {
      localTaxRow.style.display = "none";
    } else {
      localTaxRow.style.display = "flex";
    }

    // Smooth scroll to results
    document.getElementById("calculationResults").scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  // Utility method to format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new TaxCalculator();
});

// Add some additional utility functions
function resetCalculator() {
  document.getElementById("financialTips").style.display = "block";
  document.getElementById("calculationResults").classList.add("hidden");
  document.getElementById("taxCalculatorForm").reset();
}

// Add keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        document
          .getElementById("taxCalculatorForm")
          .dispatchEvent(new Event("submit"));
        break;
      case "r":
        e.preventDefault();
        resetCalculator();
        break;
    }
  }
});

// Add form validation helpers
function validatePositiveNumber(value, fieldName) {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }
  return num;
}

function validatePercentage(value, fieldName) {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0 || num > 100) {
    throw new Error(`${fieldName} must be between 0 and 100`);
  }
  return num / 100;
}
