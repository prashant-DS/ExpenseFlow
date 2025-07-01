import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { CsvProvider, useCsv } from "./customHooks/useCsv";
import Homepage from "./pages/Homepage";
import Analysis from "./pages/Analysis";
import "./App.css";

function NavBar() {
  const { csvFile, loadCsvFile, clearData, hasData } = useCsv();
  const location = useLocation();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      loadCsvFile(file);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <h1>Money Tracker</h1>
        </div>

        <div className="nav-center">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            Add Entry
          </Link>
          <Link
            to="/analysis"
            className={`nav-link ${
              location.pathname === "/analysis" ? "active" : ""
            }`}
          >
            Analysis
          </Link>
        </div>

        <div className="nav-right">
          <div className="csv-controls">
            {!hasData ? (
              <div className="upload-section">
                <button
                  className="upload-btn"
                  onClick={() => document.getElementById("csv-upload").click()}
                >
                  Upload CSV
                </button>
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
              </div>
            ) : (
              <div className="csv-status">
                <span className="csv-info">
                  {csvFile?.name || "CSV Loaded"}
                </span>
                <button onClick={clearData} className="clear-btn">
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="app">
      <div className="main-app-content">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/analysis" element={<Analysis />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <CsvProvider>
      <Router>
        <AppContent />
      </Router>
    </CsvProvider>
  );
}

export default App;
