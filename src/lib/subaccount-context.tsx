"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { DEFAULT_SUBACCOUNT_NAME } from "@/lib/subaccount-constants";

type SubaccountContextValue = {
  subaccountName: string;
  setSubaccountName: (name: string) => void;
};

const SubaccountContext = createContext<SubaccountContextValue | undefined>(
  undefined,
);

function storageKey(owner: string) {
  return `nadocove:active-subaccount:${owner.toLowerCase()}`;
}

function readStoredSubaccount(address: string | undefined): string {
  if (!address || typeof window === "undefined") return DEFAULT_SUBACCOUNT_NAME;
  return localStorage.getItem(storageKey(address)) ?? DEFAULT_SUBACCOUNT_NAME;
}

export function SubaccountProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();

  // "Adjusting state when a prop changes" — react.dev's own pattern for
  // resetting derived state during render rather than in a useEffect (which
  // would cause an extra render pass). Only fires when the wallet's address
  // identity actually changes, e.g. on connect/disconnect/account switch.
  const [lastAddress, setLastAddress] = useState(address);
  const [subaccountName, setSubaccountNameState] = useState(() =>
    readStoredSubaccount(address),
  );
  if (address !== lastAddress) {
    setLastAddress(address);
    setSubaccountNameState(readStoredSubaccount(address));
  }

  const setSubaccountName = (name: string) => {
    setSubaccountNameState(name);
    if (address) localStorage.setItem(storageKey(address), name);
  };

  return (
    <SubaccountContext.Provider value={{ subaccountName, setSubaccountName }}>
      {children}
    </SubaccountContext.Provider>
  );
}

export function useActiveSubaccount(): SubaccountContextValue {
  const ctx = useContext(SubaccountContext);
  if (!ctx) {
    throw new Error(
      "useActiveSubaccount must be used within a SubaccountProvider",
    );
  }
  return ctx;
}
