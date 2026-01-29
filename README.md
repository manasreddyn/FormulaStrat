# FormulaStrat

A high-performance F1 data analysis dashboard powered by **FastAPI** (Python) and **React** (Vite).
Features live data integration via the **FastF1** Python library for the 2024 season.

## Project Structure

- **backend/**: Python FastAPI server handling `FastF1` data fetching, processing, and caching.
- **frontend/**: React + Vite application with premium dark-mode aesthetics and data visualization (`recharts`).

## Prerequisites

- **Python 3.8+**
- **Node.js 16+**

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Features
- **Live Telemetry**: Race-by-race results and analysis.
- **Tyre Strategy**: Visual breakdown of stints and compound performance.
- **Team Stats**: Wins, Poles, and Driver career highlights.
- **Car Specs**: 2024 Technical Specifications.
