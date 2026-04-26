# ORE IR Swap Web Application

## Project Overview

Open Source Risk Engine (ORE) 기반의 Interest Rate Swap 가격 계산 웹 애플리케이션입니다.

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Code Editor**: react-simple-code-editor + Prism.js (XML syntax highlighting)
- **Linting**: ESLint + Prettier

## Development Commands

### Frontend (`cd frontend`)

```bash
# Start dev server
npm run dev

# Run tests (lint + format check)
npm run test

# Build for production
npm run build

# Linting
npm run lint          # Check ESLint
npm run lint:fix      # Fix ESLint issues
npm run format        # Format with Prettier
npm run format:check  # Check Prettier formatting

# Preview production build
npm run preview
```

## Important Development Practices

### Before Testing/Demo

Always run `npm run test` in the frontend directory before testing or demonstrating changes. This ensures:
- Code passes ESLint checks
- Code is properly formatted with Prettier

```bash
cd frontend && npm run test
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── InputEditor/
│   │   │   ├── CodeEditor.jsx    # XML editor with theme switching
│   │   │   ├── FileEditor.jsx    # File editing component
│   │   │   ├── FileSelector.jsx  # File list sidebar
│   │   │   └── forms/            # Form-based editors
│   │   ├── Output/
│   │   │   ├── NPVDisplay.jsx    # NPV results display
│   │   │   ├── CashflowsTable.jsx # Cashflow schedule
│   │   │   ├── CurvesChart.jsx   # Yield curve charts
│   │   │   └── LogViewer.jsx     # ORE execution logs
│   │   └── Tabs.jsx              # Tab navigation
│   ├── services/
│   │   └── api.js                # Backend API client
│   ├── App.jsx                   # Main application
│   └── main.jsx                  # React entry point
└── index.css                     # Global styles + Tailwind
```

## Key Features

1. **XML Editor** with syntax highlighting and multiple themes
2. **Form-based editing** for common files (ore.xml, irswap.xml, conventions.xml)
3. **FRED Integration** for live interest rate data
4. **Real-time valuation** with NPV calculation
5. **Cashflow visualization** with charts and tables
