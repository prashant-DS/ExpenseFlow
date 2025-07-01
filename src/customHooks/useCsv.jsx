import { useState, useContext } from "react";
import Papa from "papaparse";
import { CsvContext } from "./csvContext";

export const CsvProvider = ({ children }) => {
  const [csvData, setCsvData] = useState([]);
  const [csvColumns, setCsvColumns] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCsvFile = (file) => {
    setIsLoading(true);
    setCsvFile(file);

    Papa.parse(file, {
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = results.data[0];
          const rows = results.data.slice(1);

          setCsvColumns(headers);

          const parsedData = rows
            .filter(
              (row) =>
                row.length >= headers.length && row.some((cell) => cell.trim())
            )
            .map((row) => {
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] || "";
              });
              return obj;
            });

          setCsvData(parsedData);
        }
        setIsLoading(false);
      },
      header: false,
      skipEmptyLines: true,
      error: (error) => {
        console.error("CSV parsing error:", error);
        setIsLoading(false);
      },
    });
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
    a.download = csvFile?.name || "money-tracker.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearData = () => {
    setCsvData([]);
    setCsvColumns([]);
    setCsvFile(null);
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
    loadCsvFile,
    addNewEntry,
    addMultipleEntries,
    clearData,
    getUniqueValuesForColumn,
    getColumnOptions,
    isStrictDropdown,
    hasData: csvData.length > 0,
    hasColumns: csvColumns.length > 0,
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
