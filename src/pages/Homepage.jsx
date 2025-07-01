import { useState } from "react";
import { useCsv } from "../customHooks/useCsv";
import "./Homepage.scss";

function Homepage() {
  const {
    csvColumns,
    hasData,
    addMultipleEntries,
    getColumnOptions,
    isStrictDropdown,
    getUniqueValuesForColumn,
  } = useCsv();
  const [textInput, setTextInput] = useState("");
  const [pendingEntries, setPendingEntries] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [inlineSuggestion, setInlineSuggestion] = useState("");

  const parseText = (text) => {
    // For input field, we only parse a single line
    const line = text.trim();
    if (!line) return [];

    const entry = parseLineToEntry(line);
    return entry ? [entry] : [];
  };

  const parseNoteFromLine = (line) => {
    const trimmedLine = line.trim();

    // Pattern: "x on y for z" -> return z
    const onForMatch = trimmedLine.match(
      /\d+(?:\.\d{2})?\s+on\s+(.+?)\s+for\s+(.+)/i
    );
    if (onForMatch) {
      return onForMatch[2].trim(); // Return the "z" part
    }

    // Pattern: "x from y for z" -> return z
    const fromForMatch = trimmedLine.match(
      /\d+(?:\.\d{2})?\s+from\s+(.+?)\s+for\s+(.+)/i
    );
    if (fromForMatch) {
      return fromForMatch[2].trim(); // Return the "z" part
    }

    // Pattern: "x on y" -> return y
    const onMatch = trimmedLine.match(/\d+(?:\.\d{2})?\s+on\s+(.+)/i);
    if (onMatch) {
      return onMatch[1].trim(); // Return the "y" part
    }

    // Pattern: "x from y" -> return y
    const fromMatch = trimmedLine.match(/\d+(?:\.\d{2})?\s+from\s+(.+)/i);
    if (fromMatch) {
      return fromMatch[1].trim(); // Return the "y" part
    }

    // Fallback: return the entire line if no pattern matches
    return trimmedLine;
  };

  const parseLineToEntry = (line) => {
    const amountMatch = line.match(/(\d+(?:\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    const lowerLine = line.toLowerCase();

    // Helper function to detect and use the same date format as CSV
    const getDateInCsvFormat = (column) => {
      const existingDates = getUniqueValuesForColumn(column);

      if (existingDates.length === 0) {
        // Default to ISO format if no existing dates
        return new Date().toISOString().split("T")[0];
      }

      // Try to detect the date format from existing dates
      const sampleDate = existingDates.find((date) => date && date.trim());

      if (!sampleDate) {
        return new Date().toISOString().split("T")[0];
      }

      const today = new Date();

      // Common date format patterns
      if (sampleDate.includes("/")) {
        // Check if it's MM/DD/YYYY or DD/MM/YYYY or similar
        const parts = sampleDate.split("/");
        if (parts.length === 3) {
          // Assume MM/DD/YYYY format (most common in CSV)
          const month = String(today.getMonth() + 1).padStart(2, "0");
          const day = String(today.getDate()).padStart(2, "0");
          const year = today.getFullYear();
          return `${month}/${day}/${year}`;
        }
      } else if (sampleDate.includes("-")) {
        // Check if it's YYYY-MM-DD or DD-MM-YYYY or similar
        const parts = sampleDate.split("-");
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            // YYYY-MM-DD format
            return today.toISOString().split("T")[0];
          } else {
            // DD-MM-YYYY format
            const day = String(today.getDate()).padStart(2, "0");
            const month = String(today.getMonth() + 1).padStart(2, "0");
            const year = today.getFullYear();
            return `${day}-${month}-${year}`;
          }
        }
      } else if (sampleDate.includes(".")) {
        // DD.MM.YYYY format
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();
        return `${day}.${month}.${year}`;
      }

      // Fallback to ISO format
      return today.toISOString().split("T")[0];
    };

    // Helper function to detect and use the same time format as CSV
    const getTimeInCsvFormat = (column) => {
      const existingTimes = getUniqueValuesForColumn(column);

      if (existingTimes.length === 0) {
        // Default to ISO timestamp if no existing times
        return new Date().toISOString();
      }

      // Try to detect the time format from existing times
      const sampleTime = existingTimes.find((time) => time && time.trim());

      if (!sampleTime) {
        return new Date().toISOString();
      }

      const now = new Date();

      // Check if it's a full ISO timestamp
      if (sampleTime.includes("T") && sampleTime.includes("Z")) {
        return now.toISOString();
      }

      // Check if it's just time (HH:MM or HH:MM:SS)
      if (sampleTime.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");

        if (sampleTime.includes(":") && sampleTime.split(":").length === 3) {
          // HH:MM:SS format
          const seconds = String(now.getSeconds()).padStart(2, "0");
          return `${hours}:${minutes}:${seconds}`;
        } else {
          // HH:MM format
          return `${hours}:${minutes}`;
        }
      }

      // Check if it's datetime without timezone (YYYY-MM-DD HH:MM:SS)
      if (sampleTime.includes(" ") && sampleTime.includes(":")) {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }

      // Fallback to ISO timestamp
      return now.toISOString();
    };

    // Helper function to find the best matching value for any column
    const findBestMatch = (column, existingValues) => {
      if (!existingValues || existingValues.length === 0) return "";

      const lowerColumn = column.toLowerCase();

      // Special handling for type column
      if (lowerColumn.includes("type")) {
        // First, try exact word matching
        const exactMatch = existingValues.find((value) => {
          if (!value) return false;
          const lowerValue = value.toLowerCase();
          return lowerLine.includes(lowerValue);
        });

        if (exactMatch) return exactMatch;

        // For type column, check the word immediately after the number
        const amountMatch = lowerLine.match(/(\d+(?:\.\d{2})?)\s+(\w+)/);
        let type = "-"; // Default to expense

        if (amountMatch && amountMatch[2] === "from") {
          type = "+";
        }

        return existingValues.find((value) => {
          if (!value) return false;
          const lowerValue = value.toLowerCase();
          return lowerValue.includes(type);
        });
      }

      // For other columns, use the original matching logic
      // First, try exact word matching
      const exactMatch = existingValues.find((value) => {
        if (!value) return false;
        const lowerValue = value.toLowerCase();
        return lowerLine.includes(lowerValue);
      });

      if (exactMatch) return exactMatch;

      // Then try partial word matching (split by spaces)
      const partialMatch = existingValues.find((value) => {
        if (!value) return false;
        const lowerValue = value.toLowerCase();
        const valueWords = lowerValue.split(/[\s-_]+/);
        return valueWords.some(
          (word) => word.length > 2 && lowerLine.includes(word)
        );
      });

      if (partialMatch) return partialMatch;

      // No hardcoded fallbacks - only use CSV data
      return "";
    };

    // Create entry object based on CSV columns
    const entry = {};
    csvColumns.forEach((column) => {
      const lowerColumn = column.toLowerCase();

      if (lowerColumn.includes("date")) {
        entry[column] = getDateInCsvFormat(column);
      } else if (lowerColumn.includes("amount")) {
        entry[column] = amount;
      } else if (lowerColumn.includes("time")) {
        entry[column] = getTimeInCsvFormat(column);
      } else if (
        lowerColumn.includes("note") ||
        lowerColumn.includes("description") ||
        lowerColumn.includes("comment")
      ) {
        // Parse note/description/comment based on pattern
        const noteValue = parseNoteFromLine(line);
        entry[column] = noteValue;
      } else {
        // For all other columns, try to find the best matching value from CSV data
        const existingValues = getUniqueValuesForColumn(column);

        // If there's only one unique value in the column, use it as default
        if (
          existingValues.length === 1 &&
          existingValues[0] &&
          existingValues[0].trim()
        ) {
          entry[column] = existingValues[0];
        } else {
          // Try to find the best matching value from CSV data
          const matchedValue = findBestMatch(column, existingValues);
          entry[column] = matchedValue;
        }
      }
    });

    return entry;
  };

  const handlePreview = () => {
    if (!textInput.trim()) return;

    const parsed = parseText(textInput);
    setPendingEntries((prevEntries) => [...prevEntries, ...parsed]); // Append new entries
    setShowPreview(true);
    setTextInput(""); // Clear the input after preview
    setInlineSuggestion("");
  };

  const handleAddAll = () => {
    addMultipleEntries(pendingEntries);
    setPendingEntries([]);
    setTextInput("");
    setShowPreview(false);
  };

  const updateEntry = (index, field, value) => {
    const updated = [...pendingEntries];
    updated[index][field] = value;
    setPendingEntries(updated);
  };

  const deleteEntry = (index) => {
    const updated = pendingEntries.filter((_, i) => i !== index);
    setPendingEntries(updated);
    if (updated.length === 0) {
      setShowPreview(false);
    }
  };

  const deleteAllEntries = () => {
    setPendingEntries([]);
    setShowPreview(false);
  };

  // Generate subtle inline suggestion like VS Code autocomplete
  const generateInlineSuggestion = (input) => {
    if (!input.trim()) return "";

    const trimmedInput = input.trim();

    // Check if user typed a number at the start
    const amountMatch = trimmedInput.match(/^(\d+(?:\.\d{0,2})?)(\s+(.*))?$/);
    if (amountMatch) {
      const amount = amountMatch[1];
      const restOfInput = amountMatch[3] || "";

      // Case 1: If they just typed a number, suggest "on"
      if (!restOfInput) {
        return `${amount} on`;
      }

      // Case 2: If after number and space, user types "f", suggest "from"
      if (restOfInput === "f") {
        return `${amount} from`;
      }

      // Case 3a: After "on" and category text, suggest "for"
      if (restOfInput.startsWith("on ") && restOfInput.length > 3) {
        const afterOn = restOfInput.substring(3);
        // If there's text after "on " but no "for" yet, suggest "for"
        if (afterOn && !afterOn.includes("for")) {
          return `${amount} on ${afterOn} for`;
        }
      }

      // Case 3b: After "from" and category text, suggest "for"
      if (restOfInput.startsWith("from ") && restOfInput.length > 5) {
        const afterFrom = restOfInput.substring(5);
        // If there's text after "from " but no "for" yet, suggest "for"
        if (afterFrom && !afterFrom.includes("for")) {
          return `${amount} from ${afterFrom} for`;
        }
      }
    }

    return "";
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setTextInput(value);

    // Generate inline suggestion
    const suggestion = generateInlineSuggestion(value);
    setInlineSuggestion(suggestion);
  };

  const handleKeyDown = (e) => {
    // Accept suggestion with Tab key
    if (e.key === "Tab" && inlineSuggestion && inlineSuggestion !== textInput) {
      e.preventDefault();
      setTextInput(inlineSuggestion + " ");
      setInlineSuggestion("");
      return;
    }

    // Handle Enter for preview
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (textInput.trim()) {
        handlePreview();
      }
    }

    // Clear suggestion on Escape
    if (e.key === "Escape") {
      setInlineSuggestion("");
    }
  };

  if (!hasData) {
    return (
      <div className="homepage">
        <div className="welcome-section">
          <h1>Welcome to ExpenseFlow</h1>
          <p>
            Upload a CSV file to get started with tracking your finances. Once
            uploaded, you can add new entries or analyze your financial data.
          </p>
        </div>

        <div className="add-entries-section">
          <h2>Add New Entries</h2>
          <div className="input-container">
            <input
              id="expense-input-disabled"
              name="expense-input-disabled"
              type="text"
              className="text-input"
              placeholder="Enter your expenses or income (e.g., '50 on bus', '200 for lunch at restaurant', 'salary received 50000', 'electricity bill 1500')"
              disabled
            />
          </div>
          <button className="preview-btn" disabled>
            Preview Entries
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage">
      <div className="welcome-section">
        <h1>Welcome to ExpenseFlow</h1>
        <p>
          Upload a CSV file to get started with tracking your finances. Once
          uploaded, you can add new entries or analyze your financial data.
        </p>
      </div>

      <div className="add-entries-section">
        <h2>Add New Entries</h2>
        <div className="input-container">
          <input
            id="expense-input"
            name="expense-input"
            type="text"
            value={textInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="text-input"
            placeholder="Start typing 'Amount on Category for Description'... e.g., '200 from grocery store for food'"
          />

          {/* Inline suggestion overlay */}
          {inlineSuggestion && inlineSuggestion !== textInput && (
            <div className="inline-suggestion-overlay">
              <span className="typed-text">{textInput}</span>
              <span className="suggestion-text">
                {inlineSuggestion.substring(textInput.length)}
              </span>
            </div>
          )}

          {/* Subtle hint */}
          {inlineSuggestion && inlineSuggestion !== textInput && (
            <div className="tab-hint">Press Tab to accept</div>
          )}
        </div>
        <button
          onClick={handlePreview}
          className="preview-btn"
          disabled={!textInput.trim()}
        >
          Preview Entries
        </button>
      </div>

      {showPreview && pendingEntries.length > 0 && (
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
                        {column.toLowerCase().includes("amount") ? (
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
                            step="0.01"
                            className="table-input"
                          />
                        ) : column.toLowerCase().includes("category") ? (
                          isStrictDropdown(column) ? (
                            <select
                              id={`${column}-${index}`}
                              name={`${column}-${index}`}
                              value={entry[column] || ""}
                              onChange={(e) =>
                                updateEntry(index, column, e.target.value)
                              }
                              className="table-input"
                            >
                              <option value="">Select Category</option>
                              {getColumnOptions(column).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div>
                              <input
                                id={`${column}-${index}`}
                                name={`${column}-${index}`}
                                type="text"
                                value={entry[column] || ""}
                                onChange={(e) =>
                                  updateEntry(index, column, e.target.value)
                                }
                                list={`${column}-options`}
                                className="table-input"
                                placeholder={`Select or enter ${column}`}
                              />
                              <datalist id={`${column}-options`}>
                                {getColumnOptions(column).map((option) => (
                                  <option key={option} value={option} />
                                ))}
                              </datalist>
                            </div>
                          )
                        ) : column.toLowerCase().includes("type") ? (
                          isStrictDropdown(column) ? (
                            <select
                              id={`${column}-${index}`}
                              name={`${column}-${index}`}
                              value={entry[column] || ""}
                              onChange={(e) =>
                                updateEntry(index, column, e.target.value)
                              }
                              className="table-input"
                            >
                              <option value="">Select Type</option>
                              {getColumnOptions(column).map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div>
                              <input
                                id={`${column}-${index}`}
                                name={`${column}-${index}`}
                                type="text"
                                value={entry[column] || ""}
                                onChange={(e) =>
                                  updateEntry(index, column, e.target.value)
                                }
                                list={`${column}-options`}
                                className="table-input"
                                placeholder={`Select or enter ${column}`}
                              />
                              <datalist id={`${column}-options`}>
                                {getColumnOptions(column).map((option) => (
                                  <option key={option} value={option} />
                                ))}
                              </datalist>
                            </div>
                          )
                        ) : column.toLowerCase().includes("note") ||
                          column.toLowerCase().includes("description") ||
                          column.toLowerCase().includes("comment") ||
                          column.toLowerCase().includes("memo") ? (
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
                        ) : getColumnOptions(column).length > 0 ? (
                          <div>
                            <input
                              id={`${column}-${index}`}
                              name={`${column}-${index}`}
                              type="text"
                              value={entry[column] || ""}
                              onChange={(e) =>
                                updateEntry(index, column, e.target.value)
                              }
                              list={`${column}-options`}
                              className="table-input"
                              placeholder={`Select or enter ${column}`}
                            />
                            <datalist id={`${column}-options`}>
                              {getColumnOptions(column).map((option) => (
                                <option key={option} value={option} />
                              ))}
                            </datalist>
                          </div>
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
            <button onClick={handleAddAll} className="preview-btn">
              Add All Entries to CSV
            </button>
            <button onClick={deleteAllEntries} className="delete-all-btn">
              Delete All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;
