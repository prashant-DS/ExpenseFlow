import { useState, useEffect, Fragment } from "react";
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
    updateCategories,
  } = useCsv();
  const [textInput, setTextInput] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [inputMode, setInputMode] = useState("text"); // "text" or "json"
  const [pendingEntries, setPendingEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [originalInputText, setOriginalInputText] = useState("");
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'uploading', 'success', 'error'
  const [showJsonExample, setShowJsonExample] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [newIncomeCategories, setNewIncomeCategories] = useState([]);
  const [newExpenseCategories, setNewExpenseCategories] = useState([]);
  const [addingIncomeCategory, setAddingIncomeCategory] = useState(false);
  const [addingExpenseCategory, setAddingExpenseCategory] = useState(false);
  const [newIncomeCategoryInput, setNewIncomeCategoryInput] = useState("");
  const [newExpenseCategoryInput, setNewExpenseCategoryInput] = useState("");
  const [isUpdatingCategories, setIsUpdatingCategories] = useState(false);
  const [draftCount, setDraftCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [isOriginalInputCollapsed, setIsOriginalInputCollapsed] =
    useState(true);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);

  // Restore pending entries and input text from localStorage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem("pendingEntries");
    const savedInputText = localStorage.getItem("originalInputText");
    if (savedEntries && !pendingEntries.length) {
      try {
        const parsedEntries = JSON.parse(savedEntries);
        setPendingEntries(parsedEntries);
        if (savedInputText) {
          setOriginalInputText(savedInputText);
        }
        // Clean up after restoring
        localStorage.removeItem("pendingEntries");
        localStorage.removeItem("originalInputText");
      } catch (e) {
        localStorage.removeItem("pendingEntries");
        localStorage.removeItem("originalInputText");
      }
    }

    // Load draft count
    const savedDraft = localStorage.getItem("draftEntries");
    if (savedDraft) {
      try {
        const draftEntries = JSON.parse(savedDraft);
        setDraftCount(draftEntries.length);
      } catch (e) {
        console.error("Failed to load draft count:", e);
        localStorage.removeItem("draftEntries");
      }
    }
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const showConfirmDialog = (config) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        ...config,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        },
      });
    });
  };

  const handlePreview = async () => {
    if (inputMode === "text" && !textInput.trim()) return;
    if (inputMode === "json" && !jsonInput.trim()) return;

    setIsLoading(true);

    // Handle JSON mode - directly parse and populate
    if (inputMode === "json") {
      try {
        const parsedJson = JSON.parse(jsonInput);
        const entriesArray = Array.isArray(parsedJson)
          ? parsedJson
          : [parsedJson];

        // Validate that entries have the required structure
        const validatedEntries = entriesArray.map((entry) => {
          const validatedEntry = {};
          csvColumns.forEach((column) => {
            validatedEntry[column] = entry[column] || "";
          });
          return validatedEntry;
        });

        setPendingEntries((prevEntries) => [
          ...prevEntries,
          ...validatedEntries,
        ]);
        setOriginalInputText(`JSON Input: ${jsonInput}`);
        setJsonInput("");
        setIsLoading(false);
        return;
      } catch (parseError) {
        console.error("Invalid JSON format:", parseError);
        showToast(
          "Invalid JSON format. Please check your input and try again.",
          "error",
        );
        setIsLoading(false);
        return;
      }
    }

    // Store the original input text before clearing (for text mode)
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
                ", ",
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
    const confirmed = await showConfirmDialog({
      title: "Confirm Add Entries",
      message: `Are you sure you want to add ${pendingEntries.length} ${
        pendingEntries.length === 1 ? "entry" : "entries"
      } to the CSV?`,
      confirmText: "Add Entries",
      confirmStyle: "success",
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    setUploadStatus("uploading");

    try {
      await addEntriesToCsv(pendingEntries);
      setUploadStatus("success");
      setPendingEntries([]);
      setTextInput("");
      setJsonInput("");
      setOriginalInputText("");

      // Clear success status after 1 second
      setTimeout(() => {
        setUploadStatus(null);
      }, 1000);
    } catch (error) {
      setUploadStatus("error");
      console.error("Failed to upload entries:", error);

      // Save pending entries and input text to localStorage before error screen
      if (pendingEntries.length > 0) {
        localStorage.setItem("pendingEntries", JSON.stringify(pendingEntries));
        localStorage.setItem("originalInputText", originalInputText);
      }

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

  const insertEmptyRow = (index, position) => {
    // Create an empty entry with all fields empty except Date and Type
    const emptyEntry = {};
    const hoveredEntry = pendingEntries[index];

    csvColumns.forEach((column) => {
      if (column === ColumnNames.DATE) {
        // Copy date from hovered row
        emptyEntry[column] = hoveredEntry[column] || "";
      } else if (column === ColumnNames.TYPE) {
        // Set type to Expense
        emptyEntry[column] = TransactionType.EXPENSE;
      } else {
        emptyEntry[column] = "";
      }
    });

    const updated = [...pendingEntries];
    // Insert at index+1 for "below", at index for "above"
    const insertIndex = position === "below" ? index + 1 : index;
    updated.splice(insertIndex, 0, emptyEntry);
    setPendingEntries(updated);
  };

  const deleteAllEntries = () => {
    setPendingEntries([]);
    setOriginalInputText("");
  };

  const sortEntriesByDate = () => {
    const sorted = [...pendingEntries].sort((a, b) => {
      // Convert DD-MM-YYYY string to Date object for comparison
      const dateA = new Date(
        a[ColumnNames.DATE].split("-").reverse().join("-"),
      );
      const dateB = new Date(
        b[ColumnNames.DATE].split("-").reverse().join("-"),
      );
      return dateA - dateB; // Sort in ascending order (oldest first)
    });
    setPendingEntries(sorted);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (inputMode === "text") {
        setTextInput(text);
      } else {
        setJsonInput(text);
      }
      showToast("Pasted from clipboard", "success");
    } catch (error) {
      console.error("Failed to read clipboard:", error);
      showToast("Failed to paste from clipboard", "error");
    }
  };

  const handleAddDraft = () => {
    if (pendingEntries.length === 0) {
      showToast("No entries to add to draft", "warning");
      return;
    }

    try {
      const existingDraft = localStorage.getItem("draftEntries");
      let draftEntries = existingDraft ? JSON.parse(existingDraft) : [];

      // Append current entries to existing draft
      draftEntries = [...draftEntries, ...pendingEntries];

      localStorage.setItem("draftEntries", JSON.stringify(draftEntries));
      setDraftCount(draftEntries.length);
      showToast(
        `Added ${pendingEntries.length} entries to draft. Total: ${draftEntries.length}`,
        "success",
      );

      // Clear the UI after adding to draft
      setPendingEntries([]);
      setOriginalInputText("");
    } catch (e) {
      console.error("Failed to add to draft:", e);
      showToast("Failed to add entries to draft", "error");
    }
  };

  const handleReplaceDraft = () => {
    if (pendingEntries.length === 0) {
      showToast("No entries to save as draft", "warning");
      return;
    }

    try {
      localStorage.setItem("draftEntries", JSON.stringify(pendingEntries));
      setDraftCount(pendingEntries.length);
      showToast(
        `Draft replaced with ${pendingEntries.length} entries`,
        "success",
      );

      // Clear the UI after replacing draft
      setPendingEntries([]);
      setOriginalInputText("");
    } catch (e) {
      console.error("Failed to replace draft:", e);
      showToast("Failed to replace draft", "error");
    }
  };

  const handleClearDraft = async () => {
    const confirmed = await showConfirmDialog({
      title: "Clear Draft",
      message:
        "Are you sure you want to clear the draft? This cannot be undone.",
      confirmText: "Clear Draft",
      confirmStyle: "danger",
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    localStorage.removeItem("draftEntries");
    setDraftCount(0);
    showToast("Draft cleared successfully", "success");
  };

  const handleLoadDraft = () => {
    try {
      const savedDraft = localStorage.getItem("draftEntries");
      if (!savedDraft) {
        showToast("No draft found", "warning");
        return;
      }

      const draftEntries = JSON.parse(savedDraft);
      // Append to bottom of current pending entries
      setPendingEntries((prevEntries) => [...prevEntries, ...draftEntries]);
      showToast(`Loaded ${draftEntries.length} entries from draft`, "success");
    } catch (e) {
      console.error("Failed to load draft:", e);
      showToast("Failed to load draft", "error");
    }
  };

  const handleAddIncomeCategory = () => {
    if (newIncomeCategoryInput.trim()) {
      setNewIncomeCategories([
        ...newIncomeCategories,
        newIncomeCategoryInput.trim(),
      ]);
      setNewIncomeCategoryInput("");
      setAddingIncomeCategory(false);
    }
  };

  const handleAddExpenseCategory = () => {
    if (newExpenseCategoryInput.trim()) {
      setNewExpenseCategories([
        ...newExpenseCategories,
        newExpenseCategoryInput.trim(),
      ]);
      setNewExpenseCategoryInput("");
      setAddingExpenseCategory(false);
    }
  };

  const handleRemoveNewCategory = (category, type) => {
    if (type === "income") {
      setNewIncomeCategories(
        newIncomeCategories.filter((cat) => cat !== category),
      );
    } else {
      setNewExpenseCategories(
        newExpenseCategories.filter((cat) => cat !== category),
      );
    }
  };

  const handleUpdateCategories = async () => {
    try {
      setIsUpdatingCategories(true);
      const updatedIncomeCategories = [
        ...incomeCategories,
        ...newIncomeCategories,
      ];
      const updatedExpenseCategories = [
        ...expenseCategories,
        ...newExpenseCategories,
      ];

      await updateCategories(updatedIncomeCategories, updatedExpenseCategories);

      // Clear new categories after successful update
      setNewIncomeCategories([]);
      setNewExpenseCategories([]);

      showToast("Categories updated successfully!", "success");
    } catch (error) {
      console.error("Failed to update categories:", error);
      showToast("Failed to update categories. Please try again.", "error");
    } finally {
      setIsUpdatingCategories(false);
    }
  };

  const hasNewCategories =
    newIncomeCategories.length > 0 || newExpenseCategories.length > 0;

  // Group consecutive entries with the same date (preserve original order)
  const sortedDateGroups = pendingEntries.reduce((groups, entry) => {
    const date = entry[ColumnNames.DATE] || "No Date";
    const lastGroup = groups[groups.length - 1];

    if (!lastGroup || lastGroup[0] !== date) {
      // Start a new group: [date, [entries]]
      groups.push([date, [entry]]);
    } else {
      // Add to existing group
      lastGroup[1].push(entry);
    }

    return groups;
  }, []);

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
                          <td key={column} data-label={column}>
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
          <div className="section-header">
            <h2>Add New Entries</h2>
            {draftCount > 0 && (
              <span className="draft-indicator">
                Draft: {draftCount} entries
                <span className="draft-actions">
                  <button
                    onClick={handleLoadDraft}
                    className="draft-icon-btn load-icon"
                    title="Load draft entries"
                  >
                    ↓
                  </button>
                  <button
                    onClick={handleClearDraft}
                    className="draft-icon-btn clear-icon"
                    title="Clear draft"
                  >
                    ✕
                  </button>
                </span>
              </span>
            )}
          </div>

          <div className="input-container">
            <div className="input-mode-toggle">
              <button
                className={`toggle-btn ${inputMode === "text" ? "active" : ""}`}
                onClick={() => setInputMode("text")}
              >
                Text
              </button>
              <button
                className={`toggle-btn ${inputMode === "json" ? "active" : ""}`}
                onClick={() => setInputMode("json")}
              >
                JSON
              </button>
            </div>

            {inputMode === "json" && (
              <button
                className="json-example-icon"
                onClick={() => setShowJsonExample(true)}
                title="Show JSON example"
              >
                ?
              </button>
            )}

            {inputMode === "text" ? (
              <textarea
                id="expense-input"
                name="expense-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="text-input"
                placeholder="Start typing... e.g., '200 from grocery store for food'"
                rows={4}
              />
            ) : (
              <textarea
                id="json-input"
                name="json-input"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="text-input"
                placeholder="Paste JSON array here..."
                rows={8}
              />
            )}
          </div>
          <div className="button-container">
            <button
              onClick={() => setShowCategories(true)}
              className="categories-btn"
              title="View available categories"
            >
              Categories
            </button>
            <div className="center-buttons">
              <button
                onClick={handlePasteFromClipboard}
                className="paste-btn"
                title="Paste from clipboard"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  <path d="M9 14h6"></path>
                  <path d="M9 18h6"></path>
                  <path d="M9 10h6"></path>
                </svg>
              </button>
              <button
                onClick={handlePreview}
                className="preview-btn"
                disabled={
                  (inputMode === "text" && !textInput.trim()) ||
                  (inputMode === "json" && !jsonInput.trim()) ||
                  isLoading
                }
              >
                {isLoading ? "Processing..." : "Preview Entries"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {originalInputText && (
        <div className="original-input-display">
          <h4
            onClick={() =>
              setIsOriginalInputCollapsed(!isOriginalInputCollapsed)
            }
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>{isOriginalInputCollapsed ? "▶" : "▼"}</span>
            Last processed text:
          </h4>
          {!isOriginalInputCollapsed && (
            <div className="original-text">"{originalInputText}"</div>
          )}
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
                {sortedDateGroups.map(([date, entries]) => (
                  <Fragment key={`date-group-${date}`}>
                    <tr key={`date-${date}`} className="date-header-row">
                      <td
                        colSpan={csvColumns.length + 1}
                        className="date-header-cell"
                      >
                        {date}
                      </td>
                    </tr>
                    {entries.map((entry, entryIndex) => {
                      // Find the original index in pendingEntries for proper update/delete handling
                      const originalIndex = pendingEntries.findIndex(
                        (e) => e === entry,
                      );
                      const isLastInGroup = entryIndex === entries.length - 1;
                      return (
                        <tr
                          key={originalIndex}
                          className={`preview-row ${isLastInGroup ? "last-in-group" : ""}`}
                          onMouseEnter={() => setHoveredRowIndex(originalIndex)}
                          onMouseLeave={() => setHoveredRowIndex(null)}
                        >
                          {csvColumns.map((column) => (
                            <td key={column}>
                              {column === ColumnNames.AMOUNT ? (
                                <input
                                  id={`${column}-${originalIndex}`}
                                  name={`${column}-${originalIndex}`}
                                  type="number"
                                  value={entry[column] || ""}
                                  onChange={(e) =>
                                    updateEntry(
                                      originalIndex,
                                      column,
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="table-input"
                                />
                              ) : column === ColumnNames.CATEGORY ? (
                                <select
                                  id={`${column}-${originalIndex}`}
                                  name={`${column}-${originalIndex}`}
                                  value={entry[column] || ""}
                                  onChange={(e) =>
                                    updateEntry(
                                      originalIndex,
                                      column,
                                      e.target.value,
                                    )
                                  }
                                  className="table-input"
                                >
                                  {(entry[ColumnNames.TYPE] ===
                                  TransactionType.INCOME
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
                                  id={`${column}-${originalIndex}`}
                                  name={`${column}-${originalIndex}`}
                                  value={entry[column] || ""}
                                  onChange={(e) =>
                                    updateEntry(
                                      originalIndex,
                                      column,
                                      e.target.value,
                                    )
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
                                  id={`${column}-${originalIndex}`}
                                  name={`${column}-${originalIndex}`}
                                  type="text"
                                  value={entry[column] || ""}
                                  onChange={(e) =>
                                    updateEntry(
                                      originalIndex,
                                      column,
                                      e.target.value,
                                    )
                                  }
                                  className="table-input"
                                  placeholder={`Enter ${column}`}
                                />
                              )}
                            </td>
                          ))}
                          <td className="actions-cell">
                            {hoveredRowIndex === originalIndex && (
                              <>
                                <button
                                  onClick={() =>
                                    insertEmptyRow(originalIndex, "above")
                                  }
                                  className="insert-row-btn above"
                                  title="Add row above"
                                >
                                  <span className="plus-icon">+</span>
                                </button>
                                <button
                                  onClick={() =>
                                    insertEmptyRow(originalIndex, "below")
                                  }
                                  className="insert-row-btn below"
                                  title="Add row below"
                                >
                                  <span className="plus-icon">+</span>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => deleteEntry(originalIndex)}
                              className="delete-entry-btn"
                              title="Delete this entry"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="preview-actions">
            <div className="action-buttons">
              <button
                onClick={sortEntriesByDate}
                className="secondary-btn"
                title="Sort entries by date (oldest first)"
              >
                Date Sort
              </button>
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
            <div className="draft-buttons">
              <button
                onClick={handleAddDraft}
                className="draft-btn add-draft-btn"
                disabled={pendingEntries.length === 0}
                title="Add current entries to draft"
              >
                Add to Draft
              </button>
              <button
                onClick={handleReplaceDraft}
                className="draft-btn replace-draft-btn"
                disabled={pendingEntries.length === 0}
                title="Replace draft with current entries"
              >
                Replace Draft
              </button>
              <button
                onClick={handleLoadDraft}
                className="draft-btn load-draft-btn"
                disabled={draftCount === 0}
                title="Load draft entries"
              >
                Load Draft {draftCount > 0 && `(${draftCount})`}
              </button>
              <button
                onClick={handleClearDraft}
                className="draft-btn clear-draft-btn"
                disabled={draftCount === 0}
                title="Clear draft entries"
              >
                Clear Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {showJsonExample && (
        <div
          className="json-popup-overlay"
          onClick={() => setShowJsonExample(false)}
        >
          <div className="json-popup" onClick={(e) => e.stopPropagation()}>
            <div className="json-popup-header">
              <h3>JSON Example Format</h3>
              <button
                className="json-popup-close"
                onClick={() => setShowJsonExample(false)}
              >
                ✕
              </button>
            </div>
            <div className="json-popup-content">
              <div className="json-context-info">
                <p>
                  <strong>Required Fields:</strong>
                </p>
                <p>
                  • <strong>Amount:</strong> Number (positive value)
                </p>
                <p>
                  • <strong>Type:</strong> <strong>"Income"</strong> or{" "}
                  <strong>"Expense"</strong>
                </p>
                <p>
                  • <strong>Category:</strong> Income (
                  <strong>{incomeCategories.join(", ")}</strong>) | Expense (
                  <strong>{expenseCategories.join(", ")}</strong>)
                </p>
                <p>
                  • <strong>Description:</strong> Text (optional)
                </p>
                <p>
                  • <strong>Date:</strong> <strong>DD-MM-YYYY</strong> format
                  (today:{" "}
                  <strong>{new Date().toLocaleDateString("en-GB")}</strong>)
                </p>
              </div>
              <pre className="json-popup-code">
                {`[
  {
    "Amount": 200,
    "Type": "Expense",
    "Category": "Food",
    "Description": "Grocery shopping",
    "Date": "25-07-2025"
  }
]`}
              </pre>
              <button
                className="json-popup-copy-btn"
                onClick={() => {
                  const llmPrompt = `Extract the following fields from natural language expense text and return as JSON:

Field Requirements:
• Amount: Number (positive value)
• Type: Must be exactly "Income" or "Expense"
• Category: Select from available options:
  - Income: ${incomeCategories.join(", ")}
  - Expense: ${expenseCategories.join(", ")}
• Description: Short descriptive text (optional, exclude other field data)
• Date: Format as DD-MM-YYYY (today's date: ${new Date().toLocaleDateString(
                    "en-GB",
                  )})

Return an array of objects with these exact field names: ${csvColumns.join(
                    ", ",
                  )}. Use today's date if no date is mentioned. Respond ONLY in valid JSON format.

Example format:
[
  {
    "Amount": 200,
    "Type": "Expense",
    "Category": "Food",
    "Description": "Grocery shopping",
    "Date": "25-07-2025"
  }
]`;
                  navigator.clipboard.writeText(llmPrompt);
                  showToast(
                    "Complete LLM prompt copied to clipboard!",
                    "success",
                  );
                  setShowJsonExample(false);
                }}
              >
                Copy Example
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategories && (
        <div
          className="json-popup-overlay"
          onClick={() => setShowCategories(false)}
        >
          <div className="json-popup" onClick={(e) => e.stopPropagation()}>
            <div className="json-popup-header">
              <h3>Available Categories</h3>
              <button
                className="json-popup-close"
                onClick={() => setShowCategories(false)}
              >
                ✕
              </button>
            </div>
            <div className="json-popup-content">
              <div className="categories-container">
                <div className="category-section">
                  <h4 className="category-type-header">Income Categories</h4>
                  <div className="category-chips">
                    {incomeCategories.map((category) => (
                      <span
                        key={category}
                        className="category-chip income-chip"
                      >
                        {category}
                      </span>
                    ))}
                    {newIncomeCategories.map((category) => (
                      <span
                        key={category}
                        className="category-chip income-chip new-category"
                      >
                        {category}
                        <button
                          className="remove-category-btn"
                          onClick={() =>
                            handleRemoveNewCategory(category, "income")
                          }
                          title="Remove this category"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {addingIncomeCategory ? (
                      <div className="add-category-input">
                        <input
                          type="text"
                          value={newIncomeCategoryInput}
                          onChange={(e) =>
                            setNewIncomeCategoryInput(e.target.value)
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddIncomeCategory();
                            }
                          }}
                          placeholder="New category..."
                          autoFocus
                        />
                        <button
                          onClick={handleAddIncomeCategory}
                          className="confirm-btn"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setAddingIncomeCategory(false);
                            setNewIncomeCategoryInput("");
                          }}
                          className="cancel-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        className="category-chip add-chip"
                        onClick={() => setAddingIncomeCategory(true)}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
                <div className="category-section">
                  <h4 className="category-type-header">Expense Categories</h4>
                  <div className="category-chips">
                    {expenseCategories.map((category) => (
                      <span
                        key={category}
                        className="category-chip expense-chip"
                      >
                        {category}
                      </span>
                    ))}
                    {newExpenseCategories.map((category) => (
                      <span
                        key={category}
                        className="category-chip expense-chip new-category"
                      >
                        {category}
                        <button
                          className="remove-category-btn"
                          onClick={() =>
                            handleRemoveNewCategory(category, "expense")
                          }
                          title="Remove this category"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {addingExpenseCategory ? (
                      <div className="add-category-input">
                        <input
                          type="text"
                          value={newExpenseCategoryInput}
                          onChange={(e) =>
                            setNewExpenseCategoryInput(e.target.value)
                          }
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              handleAddExpenseCategory();
                            }
                          }}
                          placeholder="New category..."
                          autoFocus
                        />
                        <button
                          onClick={handleAddExpenseCategory}
                          className="confirm-btn"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => {
                            setAddingExpenseCategory(false);
                            setNewExpenseCategoryInput("");
                          }}
                          className="cancel-btn"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        className="category-chip add-chip"
                        onClick={() => setAddingExpenseCategory(true)}
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {hasNewCategories && (
                <div className="update-categories-section">
                  <button
                    className="update-categories-btn"
                    onClick={handleUpdateCategories}
                    disabled={isUpdatingCategories}
                  >
                    {isUpdatingCategories ? "Updating..." : "Update Categories"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}

      {confirmDialog && (
        <div className="json-popup-overlay" onClick={confirmDialog.onCancel}>
          <div
            className="json-popup confirm-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="json-popup-header">
              <h3>{confirmDialog.title}</h3>
              <button
                className="json-popup-close"
                onClick={confirmDialog.onCancel}
              >
                ✕
              </button>
            </div>
            <div className="json-popup-content">
              <p className="confirm-dialog-message">{confirmDialog.message}</p>
              <div className="confirm-dialog-actions">
                <button
                  className="confirm-btn-cancel"
                  onClick={confirmDialog.onCancel}
                >
                  {confirmDialog.cancelText || "Cancel"}
                </button>
                <button
                  className={`confirm-btn-${confirmDialog.confirmStyle || "primary"}`}
                  onClick={confirmDialog.onConfirm}
                >
                  {confirmDialog.confirmText || "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Homepage;
