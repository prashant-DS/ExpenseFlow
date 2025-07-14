# 💸 ExpenseFlow

<div align="center">

![ExpenseFlow Logo](https://img.shields.io/badge/💸-ExpenseFlow-4F46E5?style=for-the-badge)

**Smart expense tracking with natural language processing and Google Sheets integration - just type "50 on coffee" and sync seamlessly!**

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.0-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Google Sheets](https://img.shields.io/badge/Google_Sheets-4285F4?style=flat&logo=google-sheets&logoColor=white)](https://developers.google.com/sheets/api)
[![CSV](https://img.shields.io/badge/CSV-Processing-28A745?style=flat&logo=microsoft-excel&logoColor=white)](https://www.papaparse.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat)](https://opensource.org/licenses/MIT)

[✨ Features](#-features) • [🎯 Demo](#-demo) • [🛠️ Installation](#-installation) • [🚀 Usage](#-usage) • [🤝 Contributing](#-contributing)

</div>

---

## 🌟 Features

### ☁️ **Google Sheets Integration**

- **Seamless Cloud Sync** - Connect with Google Sheets for automatic data synchronization
- **OAuth Authentication** - Secure Google account integration with proper permissions
- **Real-time Updates** - Changes sync instantly between the app and your Google Sheets
- **Automatic Backup** - Your data is safely stored in the cloud with Google's reliability
- **Multi-device Access** - Access your expense data from anywhere with Google Sheets

### 📊 **Smart Data Visualization**

- **Interactive Pie Charts** - Visualize spending patterns with beautiful, color-coded charts
- **Real-time Analytics** - Dynamic filtering by categories, date ranges, and transaction types
- **Indian Number Formatting** - Crores, Lakhs, and thousands representation for easy reading

### 🤖 **Intelligent Text Parsing**

- **Natural Language Processing** - Add expenses using plain text like "100 on coffee for morning boost"
- **Smart Pattern Recognition** - Automatically detects amounts, vendors, and descriptions
- **Multiple Input Formats** - Supports various text patterns:
  - `100 on Starbucks for coffee`
  - `50 from ATM`
  - `200 grocery shopping`

### 📁 **Data Management**

- **Multiple Data Sources** - Upload CSV files or connect to Google Sheets
- **Intelligent Column Detection** - Automatically identifies amount, category, date, and note columns
- **Export Functionality** - Download data as CSV or sync with Google Sheets
- **Format Preservation** - Maintains your original data structure and formatting
- **Cloud Backup** - Automatic synchronization with Google Sheets for data safety

### 🎯 **Smart Form Features**

- **Auto-suggestions** - Dropdown menus populated from existing data
- **Category Management** - Intelligent categorization with existing options
- **Date Format Detection** - Automatically matches your CSV's date format
- **Bulk Entry Support** - Add multiple transactions at once with preview

### 📱 **Modern UI/UX**

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Clean Interface** - Intuitive navigation with modern design principles
- **Real-time Feedback** - Instant previews and validations
- **Dark Mode Ready** - Eye-friendly interface for extended use

---

## 🎯 Demo

### 💬 Adding Expenses with Natural Language

_Just type naturally - ExpenseFlow understands!_

```bash
# Simple expenses
"50 on coffee"
"200 groceries"

# Detailed transactions
"1200 from amazon for laptop stand"
"75 on uber for office commute"
"25 coffee with friends at starbucks"

# Income entries
"salary 50000"
"freelance payment 15000"
```

### � **Google Sheets Integration**

- 🔐 **Secure OAuth Login** - Connect safely with your Google account
- ☁️ **Auto-sync** - Real-time synchronization with your Google Sheets
- 📂 **Smart Sheet Creation** - Automatically creates organized expense tracking sheets
- 🔄 **Two-way Sync** - Changes in app or sheets are reflected everywhere
- 🔒 **Data Privacy** - Your financial data stays in your Google account

### �📊 Powerful Analytics

- 📈 **Income vs Expense Analysis**
- 🏷️ **Category-wise Breakdown**
- 📅 **Date Range Filtering**
- 💹 **Trend Visualization**

---

## 🛠️ Installation

### Prerequisites

- **Node.js** (v16.0.0 or higher)
- **npm** or **yarn** package manager

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd expense-flow

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` 🚀

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

---

## 🚀 Usage

### 1. **� Connect to Google Sheets (Optional)**

- Click "Connect Google Sheets" to enable cloud synchronization
- Authenticate with your Google account using OAuth
- ExpenseFlow automatically creates and manages your expense tracking sheets

### 2. **�📤 Upload Your CSV File (Alternative)**

- Click "Upload CSV" in the navigation bar
- Select your financial data CSV file
- ExpenseFlow automatically detects columns for amounts, categories, dates, etc.

### 3. **✍️ Add New Expenses**

Navigate to the "Add Entry" tab and use either:

#### **💬 Quick Text Input**

_The magic of natural language processing!_

```bash
100 on groceries for weekly shopping
```

#### **📝 Manual Form Entry**

- Fill in the form fields
- Use auto-suggestions from existing data
- Preview before adding

### 4. **📈 Analyze Your Spending**

Switch to the "Analysis" tab to:

- 🥧 View spending by category with interactive pie charts
- 📅 Filter by date ranges
- 🔄 Toggle between income and expenses
- ☁️ Sync with Google Sheets for backup
- 💾 Export updated data

---

## 🏗️ Technical Architecture

### **🎨 Frontend Stack**

_Modern, fast, and reliable_

```
├── ⚛️  React 19.1.0              # UI Framework
├── 🛣️  React Router 7.6.3        # Navigation
├── ⚡ Vite 5.4.0               # Build Tool
├── 📊 Plotly.js 3.0.1          # Data Visualization
├── � Google OAuth 0.12.2      # Google Authentication
├── ☁️ Google APIs 150.0.1       # Google Sheets Integration
└── 🗂️ TypeScript Support        # Type Safety
```

### **📁 Project Structure**

```
src/
├── constants/
│   ├── csvConfig.ts       # CSV processing configuration
│   └── googleSheets.js    # Google Sheets API configuration
├── customHooks/
│   ├── csvContext.js      # Context for CSV data management
│   └── useCsv.jsx        # Custom hook for CSV operations
├── pages/
│   ├── Homepage.jsx      # Entry addition interface
│   ├── Analysis.jsx      # Analytics dashboard
│   └── View.jsx          # Data viewing interface
├── utils/
│   └── stringParser.js   # Natural language parsing utilities
├── App.jsx               # Main application component
└── main.jsx             # Application entry point
```

### **🔧 Key Components**

#### **🎛️ CsvProvider** (`useCsv.jsx`)

- 🗂️ Manages CSV data state
- 🔄 Handles file parsing and processing
- 🛠️ Provides data manipulation methods
- ✅ Maintains column mappings and validations

#### **🏠 Homepage** (`Homepage.jsx`)

- 🧠 Natural language expense parsing
- 📋 Dynamic form generation
- 👁️ Bulk entry preview and confirmation
- 💡 Smart auto-completion

#### **📊 Analysis** (`Analysis.jsx`)

- 📈 Interactive data visualization
- 🔍 Advanced filtering capabilities
- 💾 Export functionality
- ⚡ Real-time chart updates

---

## 🔧 Configuration

### **Supported CSV Formats**

The app intelligently detects various CSV column formats:

| Column Type  | Supported Names                            |
| ------------ | ------------------------------------------ |
| **Amount**   | `amount`, `amt`, `price`, `value`          |
| **Type**     | `type`, `transaction_type`, `debit_credit` |
| **Category** | `category`, `cat`, `group`, `tag`          |
| **Notes**    | `note`, `description`, `comment`, `memo`   |
| **Date**     | `time`, `date`, `timestamp`, `created`     |

### **Natural Language Patterns**

| Pattern          | Example                       | Extracted Data                               |
| ---------------- | ----------------------------- | -------------------------------------------- |
| `X on Y for Z`   | `100 on Starbucks for coffee` | Amount: 100, Vendor: Starbucks, Note: coffee |
| `X from Y for Z` | `50 from ATM for cash`        | Amount: 50, Source: ATM, Note: cash          |
| `X on Y`         | `75 on groceries`             | Amount: 75, Note: groceries                  |
| `X Y`            | `200 restaurant`              | Amount: 200, Note: restaurant                |

---

## 🎨 Customization

### **🎨 Styling**

- 🎨 CSS custom properties for easy theming
- 📱 Responsive breakpoints for all devices
- 🌈 Consistent color scheme throughout

### **⚙️ Data Processing**

- 🔧 Configurable column detection patterns
- 📝 Customizable parsing rules
- 📊 Extensible category management

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### **Development Setup**

```bash
# Fork the repository
git clone <your-fork-url>

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and test
npm run dev

# Submit a pull request
```

### **Contribution Guidelines**

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure responsive design principles

---

## 📋 Roadmap

### **Upcoming Features**

- [ ] 📱 **Mobile App** (React Native)
- [ ] 🔐 **Enhanced User Authentication**
- [ ] 📊 **Advanced Charts** (Line graphs, Bar charts, Trends)
- [ ] 🎯 **Budget Planning & Alerts**
- [ ] 📧 **Email Reports**
- [ ] 🔄 **Bank Integration**
- [ ] 🏷️ **Smart Categorization** (ML-powered)
- [ ] 🌍 **Multi-currency Support**
- [ ] 📱 **Offline Mode**

### **Technical Improvements**

- [ ] 🧪 **Unit Testing** (Jest, React Testing Library)
- [ ] 📱 **PWA Support**
- [ ] 🔍 **Search Functionality**
- [ ] 📤 **Multiple Export Formats** (PDF, Excel)
- [ ] 🌐 **Internationalization**
- [ ] ⚡ **Performance Optimization**
- [ ] 🔧 **Advanced Google Sheets Features**

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Prashant Kumar**

- 🔗 GitHub: [prashant-DS](https://github.com/prashant-DS)
- 📧 Contact: Available via GitHub

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The foundation of our UI
- [Plotly.js](https://plotly.com/javascript/) - Beautiful data visualizations
- [Google Sheets API](https://developers.google.com/sheets/api) - Cloud synchronization
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2) - Secure authentication
- [Vite](https://vitejs.dev/) - Lightning-fast development experience

---

## 💡 FAQ

### **Q: What data sources are supported?**

A: ExpenseFlow supports CSV file uploads and Google Sheets integration. You can start with either option or use both for maximum flexibility.

### **Q: How does Google Sheets integration work?**

A: Connect your Google account via OAuth, and ExpenseFlow automatically creates and syncs with a dedicated expense tracking sheet in your Google Drive.

### **Q: What CSV formats are supported?**

A: The app supports any CSV with financial data. Common formats from banks, expense apps, and spreadsheets work out of the box.

### **Q: Is my financial data secure?**

A: Yes! When using CSV files, all processing happens locally in your browser. With Google Sheets, your data stays in your own Google account with secure OAuth authentication.

### **Q: Can I use this without connecting to Google Sheets?**

A: Absolutely! You can use CSV files or start adding expenses immediately using the natural language input or manual forms.

### **Q: How accurate is the text parsing?**

A: The parser handles most common expense formats. If it doesn't parse correctly, you can always use the manual form.

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ and ☕ by [Prashant Kumar](https://github.com/prashant-DS)

_ExpenseFlow - Where natural language meets smart finance tracking with cloud synchronization_ 💸

</div>
