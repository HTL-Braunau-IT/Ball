"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type BuyerData = {
  id: number;
  name: string;
  email: string;
  address: string;
  postal: number;
  province: string;
  country: string;
  verified: boolean;
  group?: { name: string } | null;
};

type FilteredDataContextType = {
  buyers: BuyerData[] | null;
  setFilteredBuyers: (buyers: BuyerData[] | null) => void;
};

const FilteredDataContext = createContext<FilteredDataContextType | undefined>(undefined);

export function FilteredDataProvider({ children }: { children: ReactNode }) {
  const [buyers, setBuyers] = useState<BuyerData[] | null>(null);

  const setFilteredBuyers = useCallback((buyers: BuyerData[] | null) => {
    setBuyers(buyers);
  }, []);

  return (
    <FilteredDataContext.Provider value={{ buyers, setFilteredBuyers }}>
      {children}
    </FilteredDataContext.Provider>
  );
}

export function useFilteredData() {
  const context = useContext(FilteredDataContext);
  if (context === undefined) {
    throw new Error("useFilteredData must be used within a FilteredDataProvider");
  }
  return context;
}

