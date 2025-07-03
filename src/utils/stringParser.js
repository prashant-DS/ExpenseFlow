/**
 * Simple string parser to extract expense/income information from natural language text
 * This serves as a fallback when the AI API is unavailable
 */

import {
  CSV_CONFIG,
  ColumnNames,
  TransactionType,
} from "../constants/csvConfig.ts";

export const parseExpenseString = (text, csvColumns) => {
  if (!text || !text.trim()) return null;

  const normalizedText = text.toLowerCase().trim();

  // Initialize entry with all required columns
  const entry = {};
  csvColumns.forEach((column) => {
    entry[column] = "";
  });

  // Extract amount (look for numbers with optional currency symbols)
  const amountMatch = normalizedText.match(/(\$|₹|€|£)?(\d+(?:\.\d{1,2})?)/);
  if (amountMatch) {
    entry[ColumnNames.AMOUNT] = parseFloat(amountMatch[2]);
  }

  // Determine type (Income vs Expense) using constants
  const incomeKeywords = [
    "salary",
    "income",
    "earned",
    "received",
    "paid to me",
    "bonus",
    "refund",
    "freelance",
    "business",
    "interest",
  ];
  const expenseKeywords = [
    "spent",
    "bought",
    "paid",
    "cost",
    "expense",
    "purchase",
  ];

  const hasIncomeKeyword = incomeKeywords.some((keyword) =>
    normalizedText.includes(keyword)
  );
  const hasExpenseKeyword = expenseKeywords.some((keyword) =>
    normalizedText.includes(keyword)
  );

  if (hasIncomeKeyword && !hasExpenseKeyword) {
    entry[ColumnNames.TYPE] = TransactionType.INCOME;
  } else {
    entry[ColumnNames.TYPE] = TransactionType.EXPENSE;
  }

  let description = text.trim();
  if (amountMatch) {
    description = description.replace(amountMatch[0], "").trim();
  }
  // Remove common filler words
  description = description.replace(
    /\b(spent|paid|bought|from|for|at|on|the|a|an)\b/gi,
    " "
  );
  description = description.replace(/\s+/g, " ").trim();

  entry[ColumnNames.DESCRIPTION] = description || text.trim();

  const today = new Date();
  // Format as "DD MM, YYYY" as specified in csvConfig
  const day = today.getDate().toString().padStart(2, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const year = today.getFullYear();
  entry[ColumnNames.DATE] = `${day}-${month}-${year}`;

  return entry;
};

/**
 * Parse multiple entries from a single text block
 * Attempts to split by common separators and parse each line
 */
export const parseMultipleEntries = (text, csvColumns) => {
  if (!text || !text.trim()) return [];

  // Split by newlines, commas, or "and" to handle multiple entries
  const lines = text
    .split(/\n|,(?=\s*\d)|(?:\s+and\s+)/i)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const entries = [];

  for (const line of lines) {
    const entry = parseExpenseString(line, csvColumns);
    if (entry && Object.values(entry).some((value) => value !== "")) {
      entries.push(entry);
    }
  }

  // If no valid entries found, return at least one empty entry
  if (entries.length === 0) {
    const fallbackEntry = {};
    csvColumns.forEach((column) => {
      fallbackEntry[column] = "";
    });
    entries.push(fallbackEntry);
  }

  return entries;
};
