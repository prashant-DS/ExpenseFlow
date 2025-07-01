import { useState, useEffect, useRef } from "react";
import { useCsv } from "../customHooks/useCsv";
import Plotly from "plotly.js-dist-min";

function Analysis() {
  const { csvData, csvColumns, hasData } = useCsv();
  const [currentMode, setCurrentMode] = useState("expense");
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [filteredData, setFilteredData] = useState([]);
  const [tableFilter, setTableFilter] = useState(null);
  const plotRef = useRef(null);

  const colors = [
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
  ];

  // Find the appropriate column names based on content
  const getColumnName = (searchTerms) => {
    return csvColumns.find((col) =>
      searchTerms.some((term) => col.toLowerCase().includes(term.toLowerCase()))
    );
  };

  const amountColumn = getColumnName(["amount"]);
  const typeColumn = getColumnName(["type"]);
  const categoryColumn = getColumnName(["category"]);
  const notesColumn = getColumnName(["note", "description", "comment"]);
  const timeColumn = getColumnName(["time", "date"]);

  useEffect(() => {
    if (csvData.length > 0 && typeColumn && categoryColumn) {
      const categories = [
        ...new Set(
          csvData
            .filter(
              (item) =>
                item[typeColumn] === (currentMode === "income" ? "+" : "-")
            )
            .map((item) => item[categoryColumn])
        ),
      ];
      setSelectedCategories(new Set(categories));
    }
  }, [csvData, currentMode, typeColumn, categoryColumn]);

  useEffect(() => {
    if (csvData.length > 0 && typeColumn && categoryColumn) {
      const filtered = csvData.filter((item) => {
        const matchesMode =
          item[typeColumn] === (currentMode === "income" ? "+" : "-");
        const matchesCategory = selectedCategories.has(item[categoryColumn]);
        const matchesTableFilter =
          !tableFilter || item[categoryColumn] === tableFilter;
        return matchesMode && matchesCategory && matchesTableFilter;
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
  ]);

  useEffect(() => {
    if (filteredData.length > 0 && plotRef.current) {
      renderChart();
    }
  }, [filteredData, selectedCategories]);

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

  const getTotalAmount = () => {
    if (!amountColumn) return 0;
    return filteredData.reduce(
      (sum, item) => sum + parseFloat(item[amountColumn] || 0),
      0
    );
  };

  const getCategoryTotals = () => {
    if (!csvData.length || !typeColumn || !categoryColumn || !amountColumn)
      return [];

    const totals = {};
    csvData
      .filter(
        (item) => item[typeColumn] === (currentMode === "income" ? "+" : "-")
      )
      .forEach((item) => {
        const category = item[categoryColumn];
        const amount = parseFloat(item[amountColumn] || 0);
        totals[category] = (totals[category] || 0) + amount;
      });

    return Object.entries(totals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const renderChart = () => {
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
    };

    const layout = {
      height: 450,
      showlegend: true,
      legend: {
        orientation: "h",
        y: -0.1,
      },
      margin: { t: 30, b: 100, l: 50, r: 50 },
    };

    Plotly.newPlot(plotRef.current, [trace], layout).then(() => {
      plotRef.current.on("plotly_click", (data) => {
        const category = data.points[0].label;
        setTableFilter(tableFilter === category ? null : category);
      });
    });
  };

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

  return (
    <div className="analysis">
      <div className="dashboard-header">
        <h1>📊 Financial Insights Dashboard</h1>
      </div>

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
        </div>

        <div className="summary-section">
          <h2 className={`total-amount ${currentMode}`}>
            Total {currentMode === "income" ? "Income" : "Expense"}: ₹
            {formatIndianNumber(getTotalAmount())}
          </h2>
        </div>

        <div className="dashboard-content">
          <div className="sidebar">
            <div className="category-panel">
              <h3>🏷️ Category Filters</h3>

              <div className="filter-buttons">
                <button onClick={() => handleBulkSelect("top5")}>Top 5</button>
                <button onClick={() => handleBulkSelect("bottom5")}>
                  Bottom 5
                </button>
                <button onClick={() => handleBulkSelect("all")}>
                  Select All
                </button>
                <button onClick={() => handleBulkSelect("none")}>
                  Unselect All
                </button>
              </div>

              <div className="category-list">
                {categoryTotals.map(({ category, amount }) => (
                  <label key={category} className="category-item">
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
              <h3>
                {tableFilter ? `📂 ${tableFilter} Records` : "📋 All Records"}
                {filteredData.length > 0 &&
                  ` (₹${formatIndianNumber(getTotalAmount())})`}
              </h3>

              {filteredData.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--gray-500)",
                    padding: "2rem",
                  }}
                >
                  No records to display
                </p>
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
                          {formatIndianNumber(
                            parseFloat(item[amountColumn] || 0)
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
