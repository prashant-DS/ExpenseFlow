import { createContext } from "react";

export const CsvContext = createContext({
  csvData: [],
  csvColumns: [],
  csvFile: null,
  isLoading: false,
  loadCsvFile: () => {},
  addNewEntry: () => {},
  addMultipleEntries: () => {},
  clearData: () => {},
  getUniqueValuesForColumn: () => [],
  getColumnOptions: () => [],
  isStrictDropdown: () => false,
  hasData: false,
  hasColumns: false,
});
