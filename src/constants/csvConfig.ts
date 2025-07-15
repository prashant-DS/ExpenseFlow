export enum ColumnNames {
  DATE = "Date",
  TYPE = "Type",
  AMOUNT = "Amount",
  CATEGORY = "Category",
  DESCRIPTION = "Description",
}

export enum TransactionType {
  INCOME = "Income",
  EXPENSE = "Expense",
}

export const CSV_CONFIG = {
  columns: [
    ColumnNames.DATE,
    ColumnNames.TYPE,
    ColumnNames.AMOUNT,
    ColumnNames.CATEGORY,
    ColumnNames.DESCRIPTION,
  ],
  transactionTypes: [TransactionType.INCOME, TransactionType.EXPENSE],
  incomeCategories: ["Salary", "Freelance", "Business", "Interest", "Other"],
  expenseCategories: [
    "Food",
    "Transport",
    "Rent",
    "Utilities",
    "Health",
    "Shopping",
    "Entertainment",
    "Travel",
    "Other",
  ],

  // Date format configuration
  dateFormat: "DD-MM-YYYY",
};
