# Money Tracker

A smart financial tracking application that makes expense management effortless. Simply describe your expenses in natural language, and let the app intelligently parse and categorize them.

## Features

### 🎯 Intelligent Expense Parsing

- Write expenses naturally: "50 on bus", "200 for lunch at restaurant", "salary received 50000"
- Automatic amount extraction and categorization
- Smart type detection (income vs expense)

### 📊 Comprehensive Analytics

- Interactive pie charts with category breakdowns
- Income vs expense analysis with toggle views
- Detailed transaction tables with filtering
- Indian number formatting (Cr, L, K)

### 📁 CSV Management

- Upload existing financial data in CSV format
- Automatic column detection and mapping
- Dynamic data validation and suggestions
- Export updated data as CSV

### 🎨 Modern UI/UX

- Dark theme with glassmorphism effects
- Responsive design for all devices
- Smooth animations and transitions
- Intuitive navigation and interactions

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd money-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Upload CSV data** (optional)

   - Use the "Upload CSV" button in the navigation
   - Or start fresh and add entries manually

5. **Add expenses naturally**

   - Go to "Add Entry" page
   - Type expenses like: "taxi 150", "coffee 80", "monthly salary 50000"
   - Preview and confirm entries

6. **Analyze your finances**
   - Visit the "Analysis" page
   - Toggle between income and expenses
   - Filter by categories and explore insights

## Technology Stack

- **Frontend**: React 19 with React Router
- **Charts**: Plotly.js for interactive visualizations
- **CSV Processing**: Papa Parse for robust data handling
- **Build Tool**: Vite for fast development and builds
- **Styling**: Custom CSS with CSS variables and modern design

## Project Structure

```
src/
├── components/          # Reusable UI components
├── customHooks/         # CSV context and data management
├── pages/              # Main application pages
├── App.jsx             # Main app component with routing
└── App.css             # Comprehensive styling system
```
