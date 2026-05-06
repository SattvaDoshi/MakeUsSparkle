"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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
  const [gender, setGenderState] = useState<Gender>("women");

  useEffect(() => {
    const storedGender = window.localStorage.getItem("selectedGender");
    if (storedGender === "women" || storedGender === "men") {
      setGenderState(storedGender);
    }
  }, []);

  const setGender = (nextGender: Gender) => {
    setGenderState(nextGender);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("selectedGender", nextGender);
    }
  };

  return (
    <GenderContext.Provider value={{ gender, setGender }}>
      {children}
    </GenderContext.Provider>
  );
}

export function useGender() {
  return useContext(GenderContext);
}