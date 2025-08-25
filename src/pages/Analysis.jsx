import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useCsv } from "../customHooks/useCsv";
import { ColumnNames, TransactionType } from "../constants/csvConfig";
import Plotly from "plotly.js-dist-min";
import "./Analysis.scss";

function Analysis() {
  const { csvData, hasData } = useCsv();
  const [currentMode, setCurrentMode] = useState("expense");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [filteredData, setFilteredData] = useState([]);
  const [tableFilter, setTableFilter] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
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

  // Use our specific column names from csvConfig
  const amountColumn = ColumnNames.AMOUNT;
  const typeColumn = ColumnNames.TYPE;
  const categoryColumn = ColumnNames.CATEGORY;
  const notesColumn = ColumnNames.DESCRIPTION;
  const timeColumn = ColumnNames.DATE;

  // Format date for display (from DD-MM-YYYY to locale format)
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = parseDate(dateStr);
    return date ? date.toLocaleDateString() : dateStr;
  };

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

  // Helper function to parse dates in DD-MM-YYYY format
  const parseDate = (dateStr) => {
    if (!dateStr) return null;

    // Handle DD-MM-YYYY format
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    }

    // Fallback to standard parsing
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

    // Convert to YYYY-MM-DD format for HTML date inputs
    const minDate = dates[0].toISOString().split("T")[0];
    const maxDate = dates[dates.length - 1].toISOString().split("T")[0];

    return { min: minDate, max: maxDate };
  }, [csvData, timeColumn]);

  // Get available months from the data for the month selector
  const getAvailableMonths = useMemo(() => {
    if (!csvData.length || !timeColumn) return [];

    const months = new Set();
    csvData.forEach((item) => {
      const date = parseDate(item[timeColumn]);
      if (date) {
        const year = date.getFullYear();
        const month = date.getMonth(); // 0-indexed
        const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
        months.add(monthKey);
      }
    });

    // Convert to array and sort in descending order (newest first)
    const sortedMonths = Array.from(months).sort().reverse();

    // Convert to display format
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return sortedMonths.map((monthKey) => {
      const [year, month] = monthKey.split("-");
      const monthIndex = parseInt(month) - 1;
      return {
        value: monthKey,
        label: `${monthNames[monthIndex]} ${year}`,
      };
    });
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
        // Check exact transaction type match
        const type = String(item[typeColumn] || "");
        const matchesType =
          currentMode === "income"
            ? type === TransactionType.INCOME
            : type === TransactionType.EXPENSE;

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

    if (categoryTotals.length === 0) {
      // Clear the chart when no data is available
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
      return;
    }

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
      const categories = [
        ...new Set(
          csvData
            .filter((item) => {
              // Check exact transaction type match
              const type = String(item[typeColumn] || "");
              const matchesType =
                currentMode === "income"
                  ? type === TransactionType.INCOME
                  : type === TransactionType.EXPENSE;
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
        // Check exact transaction type match
        const type = String(item[typeColumn] || "");
        const matchesMode =
          currentMode === "income"
            ? type === TransactionType.INCOME
            : type === TransactionType.EXPENSE;
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

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
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

  const getSortedData = () => {
    if (!sortConfig.key) return filteredData;

    const sortedData = [...filteredData].sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.key === "date") {
        aValue =
          timeColumn && a[timeColumn] ? new Date(a[timeColumn]) : new Date(0);
        bValue =
          timeColumn && b[timeColumn] ? new Date(b[timeColumn]) : new Date(0);
      } else if (sortConfig.key === "amount") {
        aValue = parseFloat(a[amountColumn] || 0);
        bValue = parseFloat(b[amountColumn] || 0);
      } else {
        return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    return sortedData;
  };

  const sortedTableData = getSortedData();

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
            <h3 className={`total-amount ${currentMode}`}>
              Total {currentMode === "income" ? "Income" : "Expense"}: ₹
              {formatIndianNumber(getTotalAmount())}
            </h3>
          </div>

          {/* Date Range Filter */}
          {timeColumn && getDateRange.min && getDateRange.max && (
            <div className="date-filter-section">
              <h3>Date Range Filter</h3>
              <div className="date-inputs">
                <div className="date-input-group">
                  <label htmlFor="month-select">Quick Select:</label>
                  <select
                    id="month-select"
                    className="month-select"
                    onChange={(e) => {
                      if (e.target.value) {
                        const [year, month] = e.target.value.split("-");
                        const startDate = `${year}-${month}-01`;
                        const endDate = new Date(year, month, 0)
                          .toISOString()
                          .split("T")[0]; // Last day of month
                        setDateRange({ startDate, endDate });
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="">Select month...</option>
                    {getAvailableMonths.map((monthOption) => (
                      <option key={monthOption.value} value={monthOption.value}>
                        {monthOption.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                <div className="no-data-message">
                  {selectedCategories.size === 0 ? (
                    <div>
                      <p className="no-categories-selected">
                        📋 No categories selected
                      </p>
                      <p className="no-categories-subtitle">
                        Please select at least one category from the filters to
                        view data
                      </p>
                    </div>
                  ) : (
                    <p className="no-records-message">
                      No records to display for selected categories
                    </p>
                  )}
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th
                        onClick={() => handleSort("date")}
                        className="sortable"
                        title="Click to sort by date"
                      >
                        Date{" "}
                        {sortConfig.key === "date" && (
                          <span className="sort-indicator">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th
                        onClick={() => handleSort("amount")}
                        className="sortable"
                        title="Click to sort by amount"
                      >
                        Amount{" "}
                        {sortConfig.key === "amount" && (
                          <span className="sort-indicator">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </th>
                      <th>Category</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTableData.map((item, index) => (
                      <tr key={index}>
                        <td>{formatDateForDisplay(item[timeColumn])}</td>
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
