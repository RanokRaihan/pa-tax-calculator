# Pennsylvania State Tax Calculator

A modern, responsive web application for calculating take-home pay with detailed tax breakdowns for Pennsylvania residents.

## Features

### 💼 Flexible Pay Input

- **Pay Frequencies**: Weekly, Biweekly, Semi-Monthly, Monthly, or Annually
- **Pay Types**: Hourly (with overtime support) or Salary
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

- 10% on income up to $11,000
- 12% on income $11,001 to $44,725
- 22% on income $44,726 to $95,375
- 24% on income $95,376 to $182,050
- 32% on income $182,051 to $231,250
- 35% on income $231,251 to $578,125
- 37% on income over $578,125

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
- **Form Validation**: Input validation with error handling
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
- **Ctrl/Cmd + R**: Reset calculator

## Disclaimer

This calculator provides estimates based on 2024 tax rates and brackets. Actual tax calculations may vary based on additional factors not included in this tool. Consult a tax professional for official tax advice.

## License

This project is open source and available for educational and personal use.
