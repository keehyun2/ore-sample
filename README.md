# ORE IR Swap Web Application

Web application for executing ORE (Open Source Risk Engine) Interest Rate Swap valuations with editable inputs and comprehensive output display.

## Features

1. **Editable Input Files** - Modify input parameters from the UI (notional, fixed rate, maturity, market data, etc.)
2. **Output Results Display** - View NPV, cashflows, and yield curves
3. **ORE Error Logs** - View ORE execution logs when errors occur
4. **Working Directory** - Original files are preserved; edits happen in a working copy

## Prerequisites

- Go 1.22+
- Node.js 18+
- ORE executable built and available

## Quick Start

### 1. Clone and Setup

```bash
cd ore-sample
```

### 2. Backend Setup

Create `.env` file in `backend/` directory:

```bash
cd backend
cp .env.example .env
# Edit .env with your paths
```

Edit `backend/.env`:

```bash
# ORE executable path (REQUIRED)
ORE_PATH=/path/to/your/Engine/build/App/ore

# ORE example directory (REQUIRED)
# This is the original TA002_IR_Swap example directory
EXAMPLE_DIR=/path/to/your/Engine/Examples/Academy/TA002_IR_Swap

# Working directory (optional, default: ./working)
WORK_DIR=./working

# Server port (optional, default: 8080)
PORT=8080
```

Start backend:

```bash
go run main.go
```

Backend runs on `http://localhost:8080`

### 3. Frontend Setup

Create `.env` file in `frontend/` directory:

```bash
cd frontend
# Create .env file
```

Edit `frontend/.env`:

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:8080
```

Install dependencies and start:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Environment Variables

### Backend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ORE_PATH` | Yes | - | Full path to ORE executable |
| `EXAMPLE_DIR` | Yes | - | Full path to TA002_IR_Swap example directory |
| `WORK_DIR` | No | `./working` | Working directory for editable files |
| `PORT` | No | `8080` | Server port |

### Frontend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `/api` | Backend API URL |

## Architecture

```
ore-sample/
├── backend/
│   ├── main.go              # Go backend server
│   ├── .env                 # Backend configuration (create this)
│   ├── .env.example         # Example configuration
│   └── working/Input/       # Working copy of input files
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/api.js  # API client
│   │   └── App.jsx          # Main app
│   ├── .env                 # Frontend configuration (create this)
│   └── package.json
└── README.md
```

## API Endpoints

- `GET /api/input/files` - List all input files
- `GET /api/input/:filename` - Get file content
- `POST /api/input/:filename` - Update file content
- `POST /api/input/reset` - Reset all files to original
- `POST /api/run` - Execute ORE valuation
- `GET /api/results` - Get last cached results
- `GET /api/config` - Get current configuration

## Editable Input Files

| File | Purpose |
|------|---------|
| `irswap.xml` | Swap trade definition (notional, rate, maturity) |
| `ore.xml` | ORE configuration (as-of date, paths) |
| `market.txt` | Market data rates |
| `curveconfig.xml` | Curve configuration |
| `todaysmarket.xml` | Market mappings |
| `pricingengine.xml` | Pricing engine settings |
| `conventions.xml` | Market conventions |

## Expected Results

**Swap Details:**
- Type: Interest Rate Swap (20 year)
- Notional: EUR 10,000,000
- Fixed Leg: 4% (receive), annual payments
- Floating Leg: EURIBOR-6M (pay), semi-annual payments
- Maturity: 2016-03-01 to 2036-03-01
- As-of Date: 2016-02-05

**Expected NPV:** 3,257,771.39 EUR
