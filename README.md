# 💰 Money Tracker

<div align="center">

![Money Tracker Logo](https://img.shields.io/badge/💰-Money_Tracker-brightgreen?style=for-the-badge)

**A smart financial tracking app with intelligent expense parsing and insightful analytics**

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.0-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Contributing](#-contributing)

</div>

---

## 🌟 Features

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

### � **CSV Integration**

- **File Upload & Processing** - Upload existing CSV files to import transaction history
- **Dynamic Column Detection** - Automatically identifies amount, category, date, and note columns
- **Export Functionality** - Download updated CSV files with new entries
- **Format Preservation** - Maintains your original CSV structure and formatting

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

### Adding Expenses with Natural Language

```
"50 on uber for office commute"
"1200 from amazon for laptop stand"
"25 coffee with friends"
```

### Powerful Analytics

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
cd money-tracker

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

---

## 🚀 Usage

### 1. **Upload Your CSV File**

- Click "Upload CSV" in the navigation bar
- Select your financial data CSV file
- The app automatically detects columns for amounts, categories, dates, etc.

### 2. **Add New Expenses**

Navigate to the "Add Entry" tab and use either:

#### **Quick Text Input**

```
100 on groceries for weekly shopping
```

#### **Manual Form Entry**

- Fill in the form fields
- Use auto-suggestions from existing data
- Preview before adding

### 3. **Analyze Your Spending**

Switch to the "Analysis" tab to:

- View spending by category
- Filter by date ranges
- Toggle between income and expenses
- Export updated data

---

## 🏗️ Technical Architecture

### **Frontend Stack**

```
├── React 19.1.0          # UI Framework
├── React Router 7.6.3    # Navigation
├── Vite 5.4.0           # Build Tool
├── Plotly.js 3.0.1      # Data Visualization
└── PapaParse 5.5.3      # CSV Processing
```

### **Project Structure**

```
src/
├── customHooks/
│   ├── csvContext.js     # Context for CSV data management
│   └── useCsv.jsx       # Custom hook for CSV operations
├── pages/
│   ├── Homepage.jsx     # Entry addition interface
│   └── Analysis.jsx     # Analytics dashboard
├── App.jsx              # Main application component
└── main.jsx            # Application entry point
```

### **Key Components**

#### **CsvProvider** (`useCsv.jsx`)

- Manages CSV data state
- Handles file parsing and processing
- Provides data manipulation methods
- Maintains column mappings and validations

#### **Homepage** (`Homepage.jsx`)

- Natural language expense parsing
- Dynamic form generation
- Bulk entry preview and confirmation
- Smart auto-completion

#### **Analysis** (`Analysis.jsx`)

- Interactive data visualization
- Advanced filtering capabilities
- Export functionality
- Real-time chart updates

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

### **Styling**

- CSS custom properties for easy theming
- Responsive breakpoints for all devices
- Consistent color scheme throughout

### **Data Processing**

- Configurable column detection patterns
- Customizable parsing rules
- Extensible category management

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
- [ ] 🔐 **User Authentication**
- [ ] ☁️ **Cloud Sync**
- [ ] 📊 **Advanced Charts** (Line graphs, Bar charts)
- [ ] 🎯 **Budget Planning**
- [ ] 📧 **Email Reports**
- [ ] 🔄 **Bank Integration**
- [ ] 🏷️ **Smart Categorization** (ML-powered)

### **Technical Improvements**

- [ ] 🧪 **Unit Testing** (Jest, React Testing Library)
- [ ] 📱 **PWA Support**
- [ ] 🔍 **Search Functionality**
- [ ] 📤 **Multiple Export Formats** (PDF, Excel)
- [ ] 🌐 **Internationalization**

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Prashant Kumar**

- 📧 Email: [your-email@example.com](mailto:your-email@example.com)
- 💼 LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- 🐦 Twitter: [@YourTwitter](https://twitter.com/yourhandle)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The foundation of our UI
- [Plotly.js](https://plotly.com/javascript/) - Beautiful data visualizations
- [PapaParse](https://www.papaparse.com/) - Robust CSV parsing
- [Vite](https://vitejs.dev/) - Lightning-fast development experience

---

## 💡 FAQ

### **Q: What CSV formats are supported?**

A: The app supports any CSV with financial data. Common formats from banks, expense apps, and spreadsheets work out of the box.

### **Q: Is my financial data secure?**

A: Yes! All processing happens locally in your browser. No data is sent to external servers.

### **Q: Can I use this without a CSV file?**

A: Absolutely! You can start adding expenses immediately using the natural language input or manual forms.

### **Q: How accurate is the text parsing?**

A: The parser handles most common expense formats. If it doesn't parse correctly, you can always use the manual form.

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

Made with ❤️ and ☕ by [Prashant Kumar](https://github.com/your-username)

</div>
