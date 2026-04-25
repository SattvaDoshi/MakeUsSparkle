"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

type Gender = "women" | "men";

interface GenderContextType {
  gender: Gender;
  setGender: (g: Gender) => void;
}

const GenderContext = createContext<GenderContextType>({
  gender: "women",
  setGender: () => {},
});

export function GenderProvider({ children }: { children: ReactNode }) {
  const [gender, setGender] = useState<Gender>("women");
  return (
    <GenderContext.Provider value={{ gender, setGender }}>
      {children}
    </GenderContext.Provider>
  );
}

export function useGender() {
  return useContext(GenderContext);
}