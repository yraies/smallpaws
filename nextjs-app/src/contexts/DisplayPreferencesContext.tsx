import React, { createContext, useContext, useState, ReactNode } from "react";

interface DisplayPreferencesContextType {
  showIcon: boolean;
  setShowIcon: (value: boolean) => void;
  advancedOptions: boolean;
  setAdvancedOptions: (value: boolean) => void;
}

const DisplayPreferencesContext = createContext<
  DisplayPreferencesContextType | undefined
>(undefined);

export function DisplayPreferencesProvider({
  children,
  initialShowIcon = false,
  initialAdvancedOptions = false,
}: {
  children: ReactNode;
  initialShowIcon?: boolean;
  initialAdvancedOptions?: boolean;
}) {
  const [showIcon, setShowIcon] = useState(initialShowIcon);
  const [advancedOptions, setAdvancedOptions] = useState(
    initialAdvancedOptions
  );

  return (
    <DisplayPreferencesContext.Provider
      value={{ showIcon, setShowIcon, advancedOptions, setAdvancedOptions }}
    >
      {children}
    </DisplayPreferencesContext.Provider>
  );
}

export function useDisplayPreferences() {
  const context = useContext(DisplayPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useDisplayPreferences must be used within a DisplayPreferencesProvider"
    );
  }
  return context;
}
