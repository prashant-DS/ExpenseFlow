import { useState, useContext, useEffect } from "react";
import { CsvContext } from "./csvContext";
import {
  GOOGLE_SHEETS_CONFIG,
  GOOGLE_SHEETS_TAB_NAMES,
} from "../constants/googleSheets";
import { ColumnNames, CSV_CONFIG } from "../constants/csvConfig";

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
          title: GOOGLE_SHEETS_TAB_NAMES.DATA,
        },
      },
      {
        properties: {
          title: GOOGLE_SHEETS_TAB_NAMES.CATEGORIES,
        },
      },
    ],
  });

  const spreadsheetId = createResponse.result.spreadsheetId;

  await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: {
      valueInputOption: "RAW",
      data: [
        {
          range: `${GOOGLE_SHEETS_TAB_NAMES.DATA}!A1:E1`,
          values: [CSV_CONFIG.columns],
        },
        {
          range: `${GOOGLE_SHEETS_TAB_NAMES.CATEGORIES}!A1:E1`,
          values: [CSV_CONFIG.incomeCategories],
        },
        {
          range: `${GOOGLE_SHEETS_TAB_NAMES.CATEGORIES}!A2:I2`,
          values: [CSV_CONFIG.expenseCategories],
        },
      ],
    },
  });

  return spreadsheetId;
};

const readSheet = async (spreadsheetId, accessToken) => {
  window.gapi.client.setToken({ access_token: accessToken });

  const response = await window.gapi.client.sheets.spreadsheets.values.batchGet(
    {
      spreadsheetId,
      ranges: [
        `${GOOGLE_SHEETS_TAB_NAMES.DATA}!A:Z`,
        `${GOOGLE_SHEETS_TAB_NAMES.CATEGORIES}!1:2`,
      ],
    }
  );

  const ranges = response.result.valueRanges;

  return {
    sheet1: ranges[0].values || [],
    sheet2: ranges[1].values || [],
  };
};

const convertToCsvData = (sheetData) => {
  const { sheet1 = [], sheet2 = [] } = sheetData;

  const headers = sheet1[0];

  const rows = sheet1.slice(1);
  const parsedData = rows
    .filter((row) => row && row.some((cell) => cell && cell.toString().trim()))
    .map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || "";
      });
      return obj;
    });

  const incomeCategories = sheet2[0];
  const expenseCategories = sheet2[1];

  return { headers, rows: parsedData, incomeCategories, expenseCategories };
};

export const CsvProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvColumns, setCsvColumns] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [spreadsheetId, setSpreadsheetId] = useState(null);

  // Check for existing token on app startup
  useEffect(() => {
    const checkExistingAuth = async () => {
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
  }, []);

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
      const { headers, rows, incomeCategories, expenseCategories } =
        convertToCsvData(sheetData);

      setSpreadsheetId(spreadsheetId);
      // Set data
      setCsvColumns(headers);
      setCsvData(rows);
      setIncomeCategories(incomeCategories);
      setExpenseCategories(expenseCategories);
      setIsLoading(false);
      console.log("Successfully loaded Google Sheets data");
    } catch (error) {
      console.error("Failed to load Google Sheets data:", error);
      setIsLoading(false);
      setError("Failed to load Google Sheets data: " + error.message);
    }
  };

  const addEntriesToCsv = async (entries) => {
    if (!entries || entries.length === 0) {
      console.log("No entries to add");
      return;
    }

    try {
      // Convert entries to the format expected by Google Sheets
      const values = entries.map((entry) => [
        entry[ColumnNames.DATE] ?? "",
        entry[ColumnNames.TYPE] ?? "",
        entry[ColumnNames.AMOUNT] ?? "",
        entry[ColumnNames.CATEGORY] ?? "",
        entry[ColumnNames.DESCRIPTION] || "",
      ]);

      // Append the entries to the sheet
      await window.gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${GOOGLE_SHEETS_TAB_NAMES.DATA}!A:E`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: values,
        },
      });

      // Update local state by adding the new entries
      setCsvData((prevData) => [...prevData, ...entries]);

      console.log(
        `Successfully added ${entries.length} entries to the spreadsheet`
      );
    } catch (error) {
      console.error("Failed to add entries to CSV:", error);
      setError("Failed to add entries: " + error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoading,
    error,
    csvData,
    csvColumns,
    incomeCategories,
    expenseCategories,
    addEntriesToCsv,
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
