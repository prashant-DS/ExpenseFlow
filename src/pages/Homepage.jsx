import { useState } from "react";
import { Link } from "react-router-dom";
import { useCsv } from "../customHooks/useCsv";
import { parseMultipleEntries } from "../utils/stringParser";
import "./Homepage.scss";
import {
  ColumnNames,
  CSV_CONFIG,
  TransactionType,
} from "../constants/csvConfig";

function Homepage() {
  const {
    csvColumns,
    addEntriesToCsv,
    incomeCategories,
    expenseCategories,
    csvData,
  } = useCsv();
  const [textInput, setTextInput] = useState("");
  const [pendingEntries, setPendingEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [originalInputText, setOriginalInputText] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'uploading', 'success', 'error'

  const handlePreview = async () => {
    if (!textInput.trim()) return;

    setIsLoading(true);
    // Store the original input text before clearing
    setOriginalInputText(textInput);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            {
              role: "system",
              content: `Extract the following fields from natural language expense text:
- ${ColumnNames.AMOUNT}: number (positive value)
- ${ColumnNames.TYPE}: must be exactly "${TransactionType.INCOME}" or "${
                TransactionType.EXPENSE
              }"
- ${ColumnNames.CATEGORY}: select from:
  * For Income: ${incomeCategories.join(", ")}
  * For Expense: ${expenseCategories.join(", ")}
- ${
                ColumnNames.DESCRIPTION
              }: short descriptive text which should not include any other fields. if nothing to describe, leave empty
- ${ColumnNames.DATE}: format as ${
                CSV_CONFIG.dateFormat
              }, take today as reference for day,month,year. Today's date is ${new Date().toLocaleDateString()}

Return an array of objects with these exact field names: ${csvColumns.join(
                ", "
              )}. Use today's date if no date is mentioned. Respond ONLY in valid JSON format.`,
            },
            {
              role: "user",
              content: textInput,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("API Error:", {
          status: res.status,
          statusText: res.statusText,
          error: errorData,
        });
        throw new Error(`API request failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (aiResponse) {
        try {
          // Parse the AI response as JSON
          const parsedEntries = JSON.parse(aiResponse);
          const entriesArray = Array.isArray(parsedEntries)
            ? parsedEntries
            : [parsedEntries];

          // Update pending entries with parsed data
          setPendingEntries((prevEntries) => [...prevEntries, ...entriesArray]);
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError);
          console.log("AI Response was:", aiResponse);
          // Fallback: create a basic entry structure for manual editing
          const fallbackEntry = {};
          csvColumns.forEach((column) => {
            fallbackEntry[column] = "";
          });
          setPendingEntries((prevEntries) => [...prevEntries, fallbackEntry]);
        }
      }
    } catch (error) {
      console.error("API call failed:", error);
      // Fallback: use simple string parser
      const parsedEntries = parseMultipleEntries(textInput, csvColumns);
      setPendingEntries((prevEntries) => [...prevEntries, ...parsedEntries]);
    } finally {
      setIsLoading(false);
      setTextInput("");
    }
  };

  const handleAddAll = async () => {
    setUploadStatus("uploading");

    try {
      await addEntriesToCsv(pendingEntries);
      setUploadStatus("success");
      setPendingEntries([]);
      setTextInput("");
      setOriginalInputText("");

      // Clear success status after 1 second
      setTimeout(() => {
        setUploadStatus(null);
      }, 1000);
    } catch (error) {
      setUploadStatus("error");
      console.error("Failed to upload entries:", error);

      // Clear error status after 3 seconds
      setTimeout(() => {
        setUploadStatus(null);
      }, 3000);
    }
  };

  const updateEntry = (index, field, value) => {
    const updated = [...pendingEntries];
    updated[index][field] = value;
    setPendingEntries(updated);
  };

  const deleteEntry = (index) => {
    const updated = pendingEntries.filter((_, i) => i !== index);
    setPendingEntries(updated);
  };

  const deleteAllEntries = () => {
    setPendingEntries([]);
    setOriginalInputText("");
  };

  return (
    <div className="homepage">
      <div className="top-section">
        <div className="latest-entries-section">
          <h2>Recent Entries</h2>
          {csvData && csvData.length > 0 ? (
            <div className="latest-entries-container">
              <table className="latest-entries-table">
                <thead>
                  <tr>
                    {csvColumns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData
                    .slice(-10)
                    .reverse()
                    .map((entry, index) => (
                      <tr key={index}>
                        {csvColumns.map((column) => (
                          <td key={column}>
                            {column === ColumnNames.AMOUNT
                              ? `₹${entry[column]}`
                              : entry[column] || ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-entries">
              <p>No entries found. Add your first entry below!</p>
            </div>
          )}
          <Link to="/view" className="preview-btn view-all-btn">
            View All
          </Link>
        </div>

        <div className="add-entries-section">
          <h2>Add New Entries</h2>
          <div className="input-container">
            <textarea
              id="expense-input"
              name="expense-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="text-input"
              placeholder="Start typing... e.g., '200 from grocery store for food'"
              rows={4}
            />
          </div>
          <button
            onClick={handlePreview}
            className="preview-btn"
            disabled={!textInput.trim() || isLoading}
          >
            {isLoading ? "Processing..." : "Preview Entries"}
          </button>
        </div>
      </div>

      {originalInputText && (
        <div className="original-input-display">
          <h4>Last processed text:</h4>
          <div className="original-text">"{originalInputText}"</div>
        </div>
      )}

      {pendingEntries.length > 0 && (
        <div className="preview-section">
          <h3>Preview</h3>
          <div className="preview-table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  {csvColumns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingEntries.map((entry, index) => (
                  <tr key={index}>
                    {csvColumns.map((column) => (
                      <td key={column}>
                        {column === ColumnNames.AMOUNT ? (
                          <input
                            id={`${column}-${index}`}
                            name={`${column}-${index}`}
                            type="number"
                            value={entry[column] || ""}
                            onChange={(e) =>
                              updateEntry(
                                index,
                                column,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="table-input"
                          />
                        ) : column === ColumnNames.CATEGORY ? (
                          <select
                            id={`${column}-${index}`}
                            name={`${column}-${index}`}
                            value={entry[column] || ""}
                            onChange={(e) =>
                              updateEntry(index, column, e.target.value)
                            }
                            className="table-input"
                          >
                            {(entry[ColumnNames.TYPE] === TransactionType.INCOME
                              ? incomeCategories
                              : expenseCategories
                            ).map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : column === ColumnNames.TYPE ? (
                          <select
                            id={`${column}-${index}`}
                            name={`${column}-${index}`}
                            value={entry[column] || ""}
                            onChange={(e) =>
                              updateEntry(index, column, e.target.value)
                            }
                            className="table-input"
                          >
                            {CSV_CONFIG.transactionTypes.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={`${column}-${index}`}
                            name={`${column}-${index}`}
                            type="text"
                            value={entry[column] || ""}
                            onChange={(e) =>
                              updateEntry(index, column, e.target.value)
                            }
                            className="table-input"
                            placeholder={`Enter ${column}`}
                          />
                        )}
                      </td>
                    ))}
                    <td>
                      <button
                        onClick={() => deleteEntry(index)}
                        className="delete-entry-btn"
                        title="Delete this entry"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="preview-actions">
            <div className="action-buttons">
              <button
                onClick={handleAddAll}
                className="preview-btn"
                disabled={uploadStatus === "uploading"}
              >
                {uploadStatus === "uploading"
                  ? "Uploading..."
                  : "Add All Entries to CSV"}
              </button>
              <button onClick={deleteAllEntries} className="delete-all-btn">
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;
