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

type TicketData = {
  id: number;
  delivery: string;
  code: string;
  paid: boolean | null;
  sent: boolean | null;
  timestamp: Date;
  buyer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    postal: number;
    province: string;
    country: string;
    verified: boolean;
    groupId: number;
  };
};

type FilteredDataContextType = {
  buyers: BuyerData[] | null;
  tickets: TicketData[] | null;
  setFilteredBuyers: (buyers: BuyerData[] | null) => void;
  setFilteredTickets: (tickets: TicketData[] | null) => void;
};

const FilteredDataContext = createContext<FilteredDataContextType | undefined>(undefined);

export function FilteredDataProvider({ children }: { children: ReactNode }) {
  const [buyers, setBuyers] = useState<BuyerData[] | null>(null);
  const [tickets, setTickets] = useState<TicketData[] | null>(null);

  const setFilteredBuyers = useCallback((buyers: BuyerData[] | null) => {
    setBuyers(buyers);
  }, []);

  const setFilteredTickets = useCallback((tickets: TicketData[] | null) => {
    setTickets(tickets);
  }, []);

  return (
    <FilteredDataContext.Provider value={{ buyers, tickets, setFilteredBuyers, setFilteredTickets }}>
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

