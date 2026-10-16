# Pennsylvania State Tax Calculator

A modern, responsive web application for calculating take-home pay with detailed tax breakdowns for Pennsylvania residents.

## Features

### 💼 Flexible Pay Input

- **Pay Frequencies**: Weekly, Biweekly, Semi-Monthly, Monthly, or Annually
- **Pay Types**: Hourly (with overtime support) or Salary
- **Hours Math**: Regular and overtime hours accept simple arithmetic (`+ - * /`), e.g. `8*5` or `32+8`
- **Deductions**: Pre-tax and post-tax deductions
- **Local Tax**: Support for municipal tax rates (Philadelphia, Pittsburgh, etc.)

### 🧮 Comprehensive Tax Calculations

- **Federal Income Tax**: Progressive tax brackets for 2024
- **FICA Taxes**: Social Security (6.2%) and Medicare (1.45%)
- **Pennsylvania State Tax**: Flat rate of 3.07%
- **Local Taxes**: Customizable municipal tax rates
- **Overtime Pay**: Automatic 1.5x calculation for hourly workers

### 🎨 Modern Design

- **Dark Theme**: Professional, modern interface with colorful accents
- **Split-Screen Layout**: Input form on left, results on right
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Smooth Animations**: Professional transitions and hover effects
- **Visual Breakdown**: Color-coded tax categories for easy understanding

### 💡 Financial Tips

- **Educational Content**: Random financial tips displayed before calculations
- **Pennsylvania-Specific**: Local tax information and retirement benefits
- **Practical Advice**: Budgeting, savings, and tax planning tips

## How to Use

1. **Select Pay Frequency**: Choose how often you're paid
2. **Choose Pay Type**: Select Hourly or Salary
3. **Enter Pay Information**:
   - For Hourly: Enter rate, regular hours, and overtime hours
     - Hours fields accept numbers or simple math using `+ - * /` (e.g. `8*5`, `32+8`, `45-5`); the result is shown under the field as you type
     - Parentheses, exponents, and negative results are not allowed
   - For Salary: Enter annual salary amount
4. **Add Deductions** (optional):
   - Pre-tax deductions (401k, health insurance)
   - Post-tax deductions (Roth IRA, life insurance)
   - Local tax rate (if applicable)
5. **Click Calculate**: See your detailed take-home pay breakdown

## Tax Information

### Pennsylvania Tax Details

- **State Income Tax**: 3.07% flat rate on all income
- **No Local Tax**: Many PA municipalities have no local income tax
- **Philadelphia**: 3.87% local income tax
- **Pittsburgh**: 3.00% local income tax
- **Retirement Friendly**: No tax on retirement income for residents 60+

### Federal Tax Brackets (2024)

Single filers:

- 10% on income up to $11,600
- 12% on income $11,601 to $47,150
- 22% on income $47,151 to $100,525
- 24% on income $100,526 to $191,950
- 32% on income $191,951 to $243,725
- 35% on income $243,726 to $609,350
- 37% on income over $609,350

Married filing jointly:

- 10% on income up to $23,200
- 12% on income $23,201 to $94,300
- 22% on income $94,301 to $201,050
- 24% on income $201,051 to $383,900
- 32% on income $383,901 to $487,450
- 35% on income $487,451 to $731,200
- 37% on income over $731,200

## File Structure

```
pa-tax-calculator/
├── index.html          # Main HTML structure
├── styles.css          # Modern CSS styling with dark theme
├── script.js           # Tax calculation logic and interactions
└── README.md           # This file
```

## Technical Features

### JavaScript Functionality

- **Class-Based Architecture**: Organized, maintainable code structure
- **Progressive Tax Calculation**: Accurate federal tax bracket calculations
- **Form Validation**: Input validation with error handling, including a strict `eval`-free parser for hours expressions
- **Dynamic UI**: Real-time form switching between hourly/salary
- **Responsive Updates**: Live calculation updates

### CSS Features

- **CSS Grid Layout**: Modern, flexible layout system
- **Custom Properties**: Consistent color scheme and spacing
- **Smooth Transitions**: Professional hover and focus effects
- **Mobile-First Design**: Responsive breakpoints for all devices
- **Glass Morphism**: Modern backdrop-filter effects

### Accessibility

- **Semantic HTML**: Proper form labels and structure
- **Keyboard Navigation**: Full keyboard support with shortcuts
- **Screen Reader Friendly**: Proper ARIA labels and descriptions
- **High Contrast**: Dark theme with sufficient color contrast

## Browser Compatibility

- Chrome 88+
- Firefox 84+
- Safari 14+
- Edge 88+

## Getting Started

1. Clone or download the project files
2. Open `index.html` in a modern web browser
3. Or serve the files using a local web server:
   ```bash
   python3 -m http.server 8080
   # Then visit http://localhost:8080
   ```

## Keyboard Shortcuts

- **Ctrl/Cmd + Enter**: Calculate taxes
- **Escape**: Reset calculator

## Disclaimer

This calculator provides estimates based on 2024 tax rates and brackets. Actual tax calculations may vary based on additional factors not included in this tool. Consult a tax professional for official tax advice.

## License

This project is open source and available for educational and personal use.
