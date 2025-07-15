import { createContext } from "react";

export const CsvContext = createContext({
  isLoading: false,
  error: null,
  csvData: [],
  csvColumns: [],
  incomeCategories: [],
  expenseCategories: [],
  addEntriesToCsv: () => {},
  hasData: false,
});
