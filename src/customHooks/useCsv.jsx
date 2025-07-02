import { useState, useContext, useEffect } from "react";
import Papa from "papaparse";
import { CsvContext } from "./csvContext";
import { GOOGLE_SHEETS_CONFIG } from "../constants/googleSheets";

// Simple Google Sheets API functions
const loadGoogleSheetsAPI = async () => {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const initializeGoogleAPI = async () => {
  await new Promise((resolve) => {
    window.gapi.load("client", resolve);
  });

  await window.gapi.client.init({
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    discoveryDocs: [
      "https://sheets.googleapis.com/$discovery/rest?version=v4",
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
    ],
  });
};

const searchForSpreadsheet = async (accessToken) => {
  window.gapi.client.setToken({ access_token: accessToken });

  const response = await window.gapi.client.drive.files.list({
    q: `name='${GOOGLE_SHEETS_CONFIG.fileName}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: "files(id, name)",
  });

  const files = response.result.files || [];
  return files.length > 0 ? files[0].id : null;
};

const createSpreadsheet = async (accessToken) => {
  window.gapi.client.setToken({ access_token: accessToken });

  const createResponse = await window.gapi.client.sheets.spreadsheets.create({
    properties: {
      title: GOOGLE_SHEETS_CONFIG.fileName,
    },
    sheets: [
      {
        properties: {
          title: "Sheet1",
        },
      },
    ],
  });

  const spreadsheetId = createResponse.result.spreadsheetId;

  // Add headers
  await window.gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId,
    range: "A1:E1",
    valueInputOption: "RAW",
    resource: {
      values: [GOOGLE_SHEETS_CONFIG.columns],
    },
  });

  return spreadsheetId;
};

const readSheet = async (spreadsheetId, accessToken) => {
  window.gapi.client.setToken({ access_token: accessToken });

  const response = await window.gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId,
    range: "A:Z",
  });

  return response.result.values || [];
};

const convertToCsvData = (sheetData) => {
  if (!sheetData || sheetData.length === 0) {
    return { headers: GOOGLE_SHEETS_CONFIG.columns, rows: [] };
  }

  const headers = sheetData[0] || GOOGLE_SHEETS_CONFIG.columns;
  const rows = sheetData.slice(1);

  const parsedData = rows
    .filter((row) => row && row.some((cell) => cell && cell.toString().trim()))
    .map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || "";
      });
      return obj;
    });

  return { headers, rows: parsedData };
};

export const CsvProvider = ({ children }) => {
  const [csvData, setCsvData] = useState([]);
  const [csvColumns, setCsvColumns] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoLoadAttempted, setAutoLoadAttempted] = useState(false);
  const [error, setError] = useState(null);

  // Check for existing token on app startup
  useEffect(() => {
    const checkExistingAuth = async () => {
      if (autoLoadAttempted || csvData.length > 0) {
        return;
      }

      setAutoLoadAttempted(true);
      setIsLoading(true);

      try {
        const storedToken = localStorage.getItem("google_access_token");
        const storedExpiry = localStorage.getItem("google_token_expiry");

        if (storedToken && storedExpiry) {
          const expiry = parseInt(storedExpiry);

          if (Date.now() < expiry) {
            console.log("Found valid stored token, loading data...");
            await loadGoogleSheetsData(storedToken);
            return;
          } else {
            console.log("Stored token expired, clearing...");
            localStorage.removeItem("google_access_token");
            localStorage.removeItem("google_token_expiry");
          }
        }

        console.log("No valid token found, triggering automatic login...");
        // Instead of showing error, trigger automatic login
        setError("auto_login_required");
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to check existing auth:", err);
        setIsLoading(false);
        setError("auto_login_required");
      }
    };

    checkExistingAuth();
  }, [autoLoadAttempted, csvData.length]);

  const loadGoogleSheetsData = async (accessToken) => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize Google API
      await loadGoogleSheetsAPI();
      await initializeGoogleAPI();

      // Search for existing spreadsheet
      let spreadsheetId = await searchForSpreadsheet(accessToken);

      if (!spreadsheetId) {
        console.log("Spreadsheet not found, creating new one...");
        spreadsheetId = await createSpreadsheet(accessToken);
      }

      console.log(`Using spreadsheet ID: ${spreadsheetId}`);

      // Load data
      const sheetData = await readSheet(spreadsheetId, accessToken);
      const { headers, rows } = convertToCsvData(sheetData);

      // Set data
      setCsvColumns(headers);
      setCsvData(rows);
      setCsvFile({
        name: GOOGLE_SHEETS_CONFIG.fileName + ".csv",
      });

      setIsLoading(false);
      console.log("Successfully loaded Google Sheets data");
    } catch (error) {
      console.error("Failed to load Google Sheets data:", error);
      setIsLoading(false);
      setError("Failed to load Google Sheets data: " + error.message);
    }
  };

  const addNewEntry = (entry) => {
    const newData = [...csvData, entry];
    setCsvData(newData);
    updateCsvFile(newData);
  };

  const addMultipleEntries = (entries) => {
    const newData = [...csvData, ...entries];
    setCsvData(newData);
    updateCsvFile(newData);
  };

  const updateCsvFile = (data) => {
    if (csvColumns.length === 0) return;

    const csvContent = Papa.unparse(data, {
      columns: csvColumns,
    });

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = csvFile?.name || "expense-flow-data.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearData = () => {
    setCsvData([]);
    setCsvColumns([]);
    setCsvFile(null);
    setError(null);
    setAutoLoadAttempted(false);
    // Clear stored tokens
    localStorage.removeItem("google_access_token");
    localStorage.removeItem("google_token_expiry");
  };

  const getUniqueValuesForColumn = (columnName) => {
    if (!csvData.length || !columnName) return [];

    const values = csvData
      .map((row) => row[columnName])
      .filter((value) => value && value.toString().trim() !== "")
      .map((value) => value.toString().trim());

    return [...new Set(values)].sort();
  };

  const getColumnOptions = (columnName) => {
    const lowerColumn = columnName.toLowerCase();

    // For notes/comments columns, return empty array (no dropdown)
    if (
      lowerColumn.includes("note") ||
      lowerColumn.includes("description") ||
      lowerColumn.includes("comment") ||
      lowerColumn.includes("memo")
    ) {
      return [];
    }

    // For specific columns, return unique values from CSV
    if (
      lowerColumn.includes("category") ||
      lowerColumn.includes("type") ||
      lowerColumn.includes("account")
    ) {
      return getUniqueValuesForColumn(columnName);
    }

    // For other text columns (excluding date, amount, time), return unique values from CSV
    if (
      !lowerColumn.includes("date") &&
      !lowerColumn.includes("amount") &&
      !lowerColumn.includes("time")
    ) {
      return getUniqueValuesForColumn(columnName);
    }

    return [];
  };

  const isStrictDropdown = (columnName) => {
    const lowerColumn = columnName.toLowerCase();
    return lowerColumn.includes("category") || lowerColumn.includes("type");
  };

  const value = {
    csvData,
    csvColumns,
    csvFile,
    isLoading,
    error,
    addNewEntry,
    addMultipleEntries,
    clearData,
    getUniqueValuesForColumn,
    getColumnOptions,
    isStrictDropdown,
    hasData: csvData.length > 0,
    hasColumns: csvColumns.length > 0,
    loadGoogleSheetsData,
  };

  return <CsvContext.Provider value={value}>{children}</CsvContext.Provider>;
};

// Custom hook to use the CSV context
export const useCsv = () => {
  const context = useContext(CsvContext);
  if (!context) {
    throw new Error("useCsv must be used within a CsvProvider");
  }
  return context;
};
