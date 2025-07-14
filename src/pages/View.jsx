import { useMemo } from "react";
import { useCsv } from "../customHooks/useCsv";
import "./View.scss";

function View() {
  const { csvData, csvColumns, hasData } = useCsv();

  // Reverse the CSV data order (newest first)
  const reversedCsvData = useMemo(() => {
    if (!csvData || csvData.length === 0) return [];
    return [...csvData].reverse();
  }, [csvData]);

  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    return isNaN(num)
      ? amount
      : `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isNaN(date) ? dateStr : date.toLocaleDateString("en-IN");
  };

  if (!hasData) {
    return (
      <div className="view-page">
        <div className="no-data">
          <h2>📊 No Data Available</h2>
          <p>Add some transactions first to view your records.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="view-page">
      {/* Table */}
      <table className="data-table">
        <thead>
          <tr>
            {csvColumns.map((column, index) => (
              <th key={index}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reversedCsvData.map((row, index) => (
            <tr key={index}>
              {csvColumns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={
                    column.toLowerCase().includes("amount") ? "amount-cell" : ""
                  }
                >
                  {column.toLowerCase().includes("amount")
                    ? formatAmount(row[column])
                    : column.toLowerCase().includes("date")
                    ? formatDate(row[column])
                    : row[column] || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default View;
