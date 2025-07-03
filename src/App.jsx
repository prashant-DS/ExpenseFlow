import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { CsvProvider, useCsv } from "./customHooks/useCsv";
import Homepage from "./pages/Homepage";
import Analysis from "./pages/Analysis";
import "./App.css";

function NavBar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-left">
          <h1>💸 ExpenseFlow</h1>
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
      </div>
    </nav>
  );
}

function AppContent() {
  const { isLoading, error, loadGoogleSheetsData } = useCsv();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Login successful:", tokenResponse);
      try {
        // Store the access token
        localStorage.setItem("google_access_token", tokenResponse.access_token);
        localStorage.setItem(
          "google_token_expiry",
          (Date.now() + tokenResponse.expires_in * 1000).toString()
        );

        // Load Google Sheets data
        await loadGoogleSheetsData(tokenResponse.access_token);
      } catch (error) {
        console.error("Failed to load Google Sheets data:", error);
      }
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
    scope:
      "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file",
  });

  const handleSignIn = () => {
    login();
  };

  // Auto-trigger login when required
  useEffect(() => {
    if (error === "auto_login_required") {
      console.log("Auto-triggering login...");
      setTimeout(() => {
        login();
      }, 1000); // Small delay to ensure UI is ready
    }
  }, [error, login]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-overlay">
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <p>Loading your data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show sign-in screen if there's an error and no data
  if (error) {
    return (
      <div className="app">
        <div className="error-state">
          <div className="error-container">
            <h2>📊 Connect to Google Sheets</h2>
            <p className="error-message">
              Sign in with your Google account to access your expense tracking
              data.
            </p>
            <div className="error-actions">
              <button className="signin-btn" onClick={handleSignIn}>
                Sign in with Google
              </button>
              <p className="help-text">
                Your data will be stored securely in your Google Sheets.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only render the full app (including navbar) when we have data

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
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <div className="app">
        <div className="error-state">
          <div className="error-container">
            <h2>⚙️ Configuration Required</h2>
            <p className="error-message">
              Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID
              in your .env file.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <CsvProvider>
        <Router>
          <AppContent />
        </Router>
      </CsvProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
