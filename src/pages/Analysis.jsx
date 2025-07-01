import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useCsv } from "../customHooks/useCsv";
import Plotly from "plotly.js-dist-min";

function Analysis() {
  const { csvData, csvColumns, hasData } = useCsv();
  const [currentMode, setCurrentMode] = useState("expense");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [filteredData, setFilteredData] = useState([]);
  const [tableFilter, setTableFilter] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const plotRef = useRef(null);

  const colors = useMemo(
    () => [
      "#6366f1",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#06b6d4",
      "#84cc16",
      "#f97316",
      "#ec4899",
      "#14b8a6",
      "#a855f7",
      "#3b82f6",
      "#eab308",
      "#22c55e",
      "#f43f5e",
      "#8b5cf6",
      "#0ea5e9",
      "#84cc16",
      "#f59e0b",
      "#ef4444",
    ],
    []
  );

  // Find the appropriate column names based on content
  const getColumnName = (searchTerms) => {
    return csvColumns.find((col) =>
      searchTerms.some((term) => col.toLowerCase().includes(term.toLowerCase()))
    );
  };

  const amountColumn = getColumnName(["amount", "amt", "price", "value"]);
  const typeColumn = getColumnName([
    "type",
    "transaction_type",
    "debit_credit",
  ]);
  const categoryColumn = getColumnName(["category", "cat", "group", "tag"]);
  const notesColumn = getColumnName([
    "note",
    "description",
    "comment",
    "memo",
    "details",
  ]);
  const timeColumn = getColumnName(["time", "date", "timestamp", "created"]);

  // Debug logging
  console.log("CSV Data sample:", csvData.slice(0, 3));
  console.log("CSV Columns:", csvColumns);
  console.log("Detected columns:", {
    amountColumn,
    typeColumn,
    categoryColumn,
    notesColumn,
    timeColumn,
  });
  console.log("Current mode:", currentMode);
  console.log("Selected categories:", selectedCategories);
  console.log("Filtered data length:", filteredData.length);

  const formatIndianNumber = (num) => {
    if (num >= 10000000) {
      return `${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      return `${(num / 100000).toFixed(2)} L`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)} K`;
    } else {
      return num.toFixed(2);
    }
  };

  // Helper function to parse and validate dates
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  // Get date range from CSV data
  const getDateRange = useMemo(() => {
    if (!csvData.length || !timeColumn) return { min: "", max: "" };

    const dates = csvData
      .map((item) => parseDate(item[timeColumn]))
      .filter((date) => date !== null)
      .sort((a, b) => a - b);

    if (dates.length === 0) return { min: "", max: "" };

    const minDate = dates[0].toISOString().split("T")[0];
    const maxDate = dates[dates.length - 1].toISOString().split("T")[0];

    return { min: minDate, max: maxDate };
  }, [csvData, timeColumn]);

  // Initialize date range when CSV data changes
  useEffect(() => {
    if (csvData.length > 0 && timeColumn) {
      const range = getDateRange;
      setDateRange({
        startDate: range.min,
        endDate: range.max,
      });
    }
  }, [csvData, timeColumn, getDateRange]);

  // Check if a date falls within the selected range
  const isDateInRange = useCallback(
    (dateStr) => {
      if (!dateRange.startDate || !dateRange.endDate) return true;

      const date = parseDate(dateStr);
      if (!date) return false;

      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999); // Include the entire end date

      return date >= start && date <= end;
    },
    [dateRange.startDate, dateRange.endDate]
  );

  const getTotalAmount = () => {
    if (!amountColumn) return 0;
    return filteredData.reduce(
      (sum, item) => sum + parseFloat(item[amountColumn] || 0),
      0
    );
  };

  const getCategoryTotals = useCallback(() => {
    if (!csvData.length || !typeColumn || !categoryColumn || !amountColumn)
      return [];

    const totals = {};
    const counts = {};
    csvData
      .filter((item) => {
        // Handle different type formats - check for substring containing + or -
        const type = String(item[typeColumn] || "");
        const matchesType =
          currentMode === "income" ? type.includes("+") : type.includes("-");

        // Check date range if timeColumn exists
        const matchesDate = !timeColumn || isDateInRange(item[timeColumn]);

        return matchesType && matchesDate;
      })
      .forEach((item) => {
        const category = item[categoryColumn];
        const amount = parseFloat(item[amountColumn] || 0);
        totals[category] = (totals[category] || 0) + amount;
        counts[category] = (counts[category] || 0) + 1;
      });

    return Object.entries(totals)
      .map(([category, amount]) => ({
        category,
        amount,
        count: counts[category],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [
    csvData,
    currentMode,
    typeColumn,
    categoryColumn,
    amountColumn,
    timeColumn,
    isDateInRange,
  ]);

  const renderChart = useCallback(() => {
    const categoryTotals = getCategoryTotals().filter((item) =>
      selectedCategories.has(item.category)
    );

    if (categoryTotals.length === 0) return;

    const trace = {
      type: "pie",
      labels: categoryTotals.map((item) => item.category),
      values: categoryTotals.map((item) => item.amount),
      textinfo: "label+percent",
      textposition: "inside",
      marker: {
        colors: colors.slice(0, categoryTotals.length),
      },
      hoverinfo: "label+value+percent",
      sort: false,
      direction: "clockwise",
    };

    const layout = {
      height: 450,
      showlegend: false, // Hide legend
      margin: { t: 30, b: 30, l: 50, r: 50 }, // Reduced bottom margin since no legend
      paper_bgcolor: "transparent", // Make chart background transparent
      plot_bgcolor: "transparent", // Make plot area background transparent
      font: {
        color: "#cbd5e1", // text-secondary color for all text
      },
    };

    const config = {
      responsive: true,
      displayModeBar: false,
    };

    Plotly.newPlot(plotRef.current, [trace], layout, config).then(() => {
      plotRef.current.on("plotly_click", (data) => {
        const category = data.points[0].label;
        setTableFilter(tableFilter === category ? null : category);
      });
    });
  }, [selectedCategories, tableFilter, colors, getCategoryTotals]);

  useEffect(() => {
    if (csvData.length > 0 && typeColumn && categoryColumn) {
      // Get all possible values for type column to understand the format
      const typeValues = [...new Set(csvData.map((item) => item[typeColumn]))];
      console.log("Type values found:", typeValues);

      const categories = [
        ...new Set(
          csvData
            .filter((item) => {
              // Handle different type formats - check for substring containing + or -
              const type = String(item[typeColumn] || "");
              const matchesType =
                currentMode === "income"
                  ? type.includes("+")
                  : type.includes("-");
              const matchesDate =
                !timeColumn || isDateInRange(item[timeColumn]);

              return matchesType && matchesDate;
            })
            .map((item) => item[categoryColumn])
        ),
      ];
      setSelectedCategories(new Set(categories));
    }
  }, [
    csvData,
    currentMode,
    typeColumn,
    categoryColumn,
    timeColumn,
    isDateInRange,
  ]);

  useEffect(() => {
    if (csvData.length > 0 && typeColumn && categoryColumn) {
      const filtered = csvData.filter((item) => {
        // Handle different type formats - check for substring containing + or -
        const type = String(item[typeColumn] || "");
        const matchesMode =
          currentMode === "income" ? type.includes("+") : type.includes("-");
        const matchesCategory = selectedCategories.has(item[categoryColumn]);
        const matchesTableFilter =
          !tableFilter || item[categoryColumn] === tableFilter;
        const matchesDate = !timeColumn || isDateInRange(item[timeColumn]);

        return (
          matchesMode && matchesCategory && matchesTableFilter && matchesDate
        );
      });
      setFilteredData(filtered);
    }
  }, [
    csvData,
    currentMode,
    selectedCategories,
    tableFilter,
    typeColumn,
    categoryColumn,
    timeColumn,
    isDateInRange,
  ]);

  useEffect(() => {
    if (filteredData.length > 0 && plotRef.current) {
      renderChart();
    }
  }, [filteredData, selectedCategories, renderChart]);

  const handleCategoryToggle = (category) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedCategories(newSelected);
  };

  const handleBulkSelect = (action) => {
    const categoryTotals = getCategoryTotals();
    let newSelected = new Set();

    switch (action) {
      case "top5":
        categoryTotals
          .slice(0, 5)
          .forEach((item) => newSelected.add(item.category));
        break;
      case "bottom5":
        categoryTotals
          .slice(-5)
          .forEach((item) => newSelected.add(item.category));
        break;
      case "all":
        categoryTotals.forEach((item) => newSelected.add(item.category));
        break;
      case "none":
        newSelected = new Set();
        break;
    }

    setSelectedCategories(newSelected);
    setTableFilter(null); // Clear any table filter when bulk selecting
  };

  const categoryTotals = getCategoryTotals();

  if (!hasData) {
    return (
      <div className="analysis">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h2>No Data to Analyze</h2>
          <p>
            Please upload your CSV file using the button in the navigation to
            start analyzing your financial data.
          </p>
          <div className="empty-features">
            <div className="feature">
              <span className="feature-icon">📤</span>
              <div>
                <h3>Upload CSV</h3>
                <p>Upload your financial data in CSV format</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">🔄</span>
              <div>
                <h3>Toggle Views</h3>
                <p>Switch between income and expense analysis</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">📈</span>
              <div>
                <h3>Interactive Charts</h3>
                <p>Explore your data with dynamic visualizations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if required columns are not detected
  if (!amountColumn || !typeColumn || !categoryColumn) {
    return (
      <div className="analysis">
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h2>Column Detection Issue</h2>
          <p>Unable to detect required columns in your CSV file.</p>
          <div
            style={{
              textAlign: "left",
              margin: "20px auto",
              maxWidth: "600px",
            }}
          >
            <h3>Required columns:</h3>
            <ul>
              <li>Amount column: {amountColumn || "❌ Not found"}</li>
              <li>Type column: {typeColumn || "❌ Not found"}</li>
              <li>Category column: {categoryColumn || "❌ Not found"}</li>
            </ul>
            <h3>Available columns in your CSV:</h3>
            <p>{csvColumns.join(", ")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis">
      <div className="dashboard-container">
        <div className="toggle-section">
          <div className="toggle-switch">
            <label
              className={`toggle-label income ${
                currentMode === "income" ? "active" : ""
              }`}
            >
              Income
            </label>
            <div
              className="toggle-slider"
              onClick={() =>
                setCurrentMode(currentMode === "income" ? "expense" : "income")
              }
            >
              <div
                className={`slider ${
                  currentMode === "expense" ? "expense" : ""
                }`}
              ></div>
            </div>
            <label
              className={`toggle-label expense ${
                currentMode === "expense" ? "active" : ""
              }`}
            >
              Expense
            </label>
          </div>

          <div className="summary-section">
            <div className={`total-amount ${currentMode}`}>
              Total {currentMode === "income" ? "Income" : "Expense"}: ₹
              {formatIndianNumber(getTotalAmount())}
            </div>
          </div>

          {/* Date Range Filter */}
          {timeColumn && getDateRange.min && getDateRange.max && (
            <div className="date-filter-section">
              <h3>📅 Date Range Filter</h3>
              <div className="date-inputs">
                <div className="date-input-group">
                  <label htmlFor="start-date">From:</label>
                  <input
                    id="start-date"
                    type="date"
                    value={dateRange.startDate}
                    min={getDateRange.min}
                    max={getDateRange.max}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="date-input"
                  />
                </div>
                <div className="date-input-group">
                  <label htmlFor="end-date">To:</label>
                  <input
                    id="end-date"
                    type="date"
                    value={dateRange.endDate}
                    min={getDateRange.min}
                    max={getDateRange.max}
                    onChange={(e) =>
                      setDateRange((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="date-input"
                  />
                </div>
                <button
                  className="reset-date-btn"
                  onClick={() =>
                    setDateRange({
                      startDate: getDateRange.min,
                      endDate: getDateRange.max,
                    })
                  }
                  title="Reset to full date range"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-content">
          <div className="sidebar">
            <div className="category-panel">
              <h3>🏷️ Category Filters</h3>

              <div className="filter-buttons">
                <button
                  className="filter-btn"
                  onClick={() => handleBulkSelect("top5")}
                >
                  Top 5
                </button>
                <button
                  className="filter-btn"
                  onClick={() => handleBulkSelect("bottom5")}
                >
                  Bottom 5
                </button>
                <button
                  className="filter-btn"
                  onClick={() => handleBulkSelect("all")}
                >
                  Select All
                </button>
                <button
                  className="filter-btn"
                  onClick={() => handleBulkSelect("none")}
                >
                  Unselect All
                </button>
              </div>

              <div className="category-list">
                {categoryTotals.map(({ category, amount, count }) => (
                  <label
                    key={category}
                    className="category-item"
                    title={`${category} (${count} transactions)`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(category)}
                      onChange={() => handleCategoryToggle(category)}
                    />
                    <span className="category-name" title={category}>
                      {category}
                    </span>
                    <span className="category-amount">
                      ₹{formatIndianNumber(amount)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="main-content-analysis">
            <div className="chart-container">
              <div ref={plotRef}></div>
            </div>

            <div className="table-section">
              <div className="table-header">
                <h3>
                  {currentMode === "income" ? "📈 Incomes" : "📉 Expenses"}
                  {tableFilter ? `: ${tableFilter}` : ""}
                  {filteredData.length > 0 &&
                    ` (Total: ₹${formatIndianNumber(getTotalAmount())})`}
                </h3>
                {tableFilter && (
                  <button
                    className="clear-filter-btn btn btn-secondary btn-sm"
                    onClick={() => setTableFilter(null)}
                    title="Clear category filter"
                  >
                    ✕ Clear Filter
                  </button>
                )}
              </div>

              {filteredData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  {selectedCategories.size === 0 ? (
                    <div>
                      <p
                        style={{
                          color: "var(--gray-500)",
                          marginBottom: "1rem",
                        }}
                      >
                        📋 No categories selected
                      </p>
                      <p
                        style={{ color: "var(--gray-400)", fontSize: "0.9rem" }}
                      >
                        Please select at least one category from the filters to
                        view data
                      </p>
                    </div>
                  ) : (
                    <p style={{ color: "var(--gray-500)" }}>
                      No records to display for selected categories
                    </p>
                  )}
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={index}>
                        <td>
                          {timeColumn && item[timeColumn]
                            ? new Date(item[timeColumn]).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className={`amount ${currentMode}`}>
                          ₹
                          {parseFloat(item[amountColumn] || 0).toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </td>
                        <td>{item[categoryColumn] || "N/A"}</td>
                        <td>{item[notesColumn] || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analysis;
