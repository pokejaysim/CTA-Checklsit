# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Clinical Trial Budget Forecaster - a browser-based web application for budget specialists to plan and forecast budgets for industry-sponsored clinical trials. It's a lightweight, client-side only application with no backend requirements.

## Development Commands

This is a React application built with Vite:
- **Install dependencies**: `cd cta-budget-app && npm install`
- **Run development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Type checking**: `npm run tsc`

## Architecture

This is a React-based single-page application (SPA) with the following structure:
- **cta-budget-app/** - Main application directory
  - **src/components/** - React components for each feature
  - **src/types/** - TypeScript type definitions
  - **src/utils/** - Utility functions (storage management)
  - **src/App.tsx** - Main application component
- **Tailwind CSS** - Utility-first CSS framework for styling
- **react-chartjs-2 & Chart.js** - For revenue visualizations

## Key Components

### Data Model
The application manages several data categories stored in localStorage:
1. **Startup Fees** - IRB, Ethics, Archiving, Pharmacy costs
2. **Visit Schedule** - Custom visits with per-visit payments
3. **Custom Revenues** - Flexible line items (SAE reimbursement, etc.)
4. **Personnel Costs** - Two types:
   - Per-patient/visit roles (calculated based on enrollment)
   - Flat/monthly roles (fixed costs)
5. **Enrollment Target** - Total target enrollment for forecasting
6. **Overhead Rate** - Institutional overhead percentage
7. **Consultation Notes** - Free-text notes area

### Core Functionality
- All data persists using browser localStorage
- Export/import functionality uses JSON format
- Revenue forecasting based on target enrollment
- Automatic margin calculations (Revenue - Total Site Cost)
- Real-time updates as users input data

## Development Guidelines

### localStorage Keys
When implementing, use consistent localStorage keys:
- `ctaBudget_startupFees`
- `ctaBudget_visitSchedule`
- `ctaBudget_customRevenues`
- `ctaBudget_personnelCosts`
- `ctaBudget_enrollment`
- `ctaBudget_overhead`
- `ctaBudget_notes`

### UI/UX Considerations
- Keep the interface clean and professional
- Ensure all inputs auto-save to localStorage on change
- Provide clear visual feedback for user actions
- Make calculations transparent and easy to understand
- Responsive design for desktop and tablet use

### Chart.js Integration
- Use Chart.js for revenue visualizations
- Implement both line and bar chart options
- Update charts automatically when data changes