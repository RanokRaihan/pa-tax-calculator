// Sample document conforming to the Project schema, describing this repo.
// addedBy / deletedBy are placeholders — replace with a real User ObjectId before inserting.

const paTaxCalculatorProject = {
  addedBy: "000000000000000000000000", // TODO: replace with real User _id

  title: "PA Tax Calculator",
  slug: "pa-tax-calculator",
  tagline: "Know your real take-home pay in Pennsylvania, in seconds.",
  summary:
    "A lightweight, no-build web app that calculates Pennsylvania take-home pay from an hourly rate or salary, accounting for federal, state, local, and FICA taxes.",
  description:
    "PA Tax Calculator is a static, client-side tool that helps Pennsylvania workers estimate their net take-home pay per pay period. Users enter their gross pay, filing status, pay frequency, pre/post-tax deductions, and local tax rate; the app annualizes income, applies the 2024 federal progressive brackets, flat PA state tax, Social Security (capped at the wage base) and Medicare, then breaks everything back down per pay period. Built with vanilla HTML, CSS, and JavaScript with zero dependencies, zero build steps, and instant load times, it's designed to be fast, transparent, and easy to audit.",
  highlights:
    "Zero-dependency vanilla JS (no framework, no bundler, no npm install), Full 2024 federal progressive tax bracket calculation for single and married filers, Handles pre-tax (Section 125/401k) and post-tax deductions separately, Social Security wage base cap and Medicare flat-rate handling, Persists last-used hourly rate to localStorage with debounced auto-save, Keyboard-first UX (Ctrl/Cmd+Enter to submit, Esc to reset), Deployed on GitHub Pages with zero server cost",
  challenges:
    "Modeling Pennsylvania's tax quirks accurately was the main challenge — PA disallows 401(k) deductions from state taxable wages (unlike federal), so state and local tax had to be computed off FICA wages rather than federal taxable income. Getting the annualize-then-deannualize math right across arbitrary pay frequencies (weekly, biweekly, semi-monthly, monthly) while keeping rounding errors from compounding also required care.",
  lessons:
    "Reinforced that tax logic is a great example of a domain where 'no framework needed' is genuinely true — a single well-organized class handles the entire calculation pipeline clearly. Also learned the value of small UX touches (debounced localStorage saves, a save-confirmation flash) in making a purely computational tool feel polished.",

  techStack: {
    frontend: ["HTML5", "CSS3", "Vanilla JavaScript"],
    backend: [],
    database: [],
    devops: ["GitHub Pages", "GitHub Actions"],
    other: ["Google Fonts (Bebas Neue, Nunito, Poppins)"],
  },

  coverImage: "assets/images/og-image.png",
  thumbnailImage: "assets/images/og-image.png",
  images: ["assets/images/og-image.png"],
  videoUrl: undefined,
  demoGifUrl: undefined,

  tags: [
    "tax-calculator",
    "pennsylvania",
    "personal-finance",
    "vanilla-js",
    "no-build",
    "static-site",
  ],
  category: "FRONTEND",
  type: "PERSONAL",
  status: "PUBLISHED",
  complexity: "INTERMEDIATE",

  frontendLiveUrl: "https://ranokraihan.github.io/pa-tax-calculator/",
  frontendRepoUrl: "https://github.com/RanokRaihan/pa-tax-calculator",
  backendLiveUrl: undefined,
  backendRepoUrl: undefined,
  caseStudyUrl: undefined,
  npmUrl: undefined,
  devToUrl: undefined,
  figmaUrl: undefined,

  linesOfCode: 797,
  githubStars: 0,
  npmDownloads: undefined,
  activeUsers: undefined,

  teamSize: 1,
  myRole: "Sole developer — design, tax logic implementation, and deployment",
  contributors: [],

  metaTitle: "PA Tax Calculator — Pennsylvania Take-Home Pay Estimator",
  metaDescription:
    "Free calculator for Pennsylvania take-home pay. Enter your hourly rate or salary to see federal, state, local, and FICA tax deductions per paycheck.",
  ogImage: "assets/images/og-image.png",

  featured: true,
  sortOrder: 1,
  isFeaturedOnHome: true,

  isDeleted: false,
  deletedBy: undefined,
  deletedAt: undefined,

  startedAt: new Date("2024-01-15"),
  completedAt: new Date("2024-02-10"),
};

module.exports = { paTaxCalculatorProject };
