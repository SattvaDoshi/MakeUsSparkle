"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { fetchCatalogGenders, type CatalogGender } from "@/lib/catalogApi";

type Gender = string;

interface GenderContextType {
  gender: Gender;
  setGender: (g: Gender) => void;
  genders: CatalogGender[];
  gendersLoading: boolean;
}

const DEFAULT_GENDERS: CatalogGender[] = [
  { id: "women", name: "Women", slug: "women", isActive: true },
  { id: "men", name: "Men", slug: "men", isActive: true },
  { id: "kids", name: "Kids", slug: "kids", isActive: true },
];

const GenderContext = createContext<GenderContextType>({
  gender: "women",
  setGender: () => {},
  genders: DEFAULT_GENDERS,
  gendersLoading: true,
});

export function GenderProvider({ children }: { children: ReactNode }) {
  const [gender, setGenderState] = useState<Gender>("women");
  const [genders, setGenders] = useState<CatalogGender[]>(DEFAULT_GENDERS);
  const [gendersLoading, setGendersLoading] = useState(true);

  useEffect(() => {
    const storedGender = window.localStorage.getItem("selectedGender");
    if (storedGender) {
      setGenderState(storedGender);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    fetchCatalogGenders()
      .then((items) => {
        if (!mounted) return;

        const nextGenders = items.length > 0 ? items : DEFAULT_GENDERS;
        setGenders(nextGenders);
        setGenderState((currentGender) =>
          nextGenders.some((item) => item.slug === currentGender)
            ? currentGender
            : nextGenders[0]?.slug || "women"
        );
      })
      .catch(() => {
        if (mounted) {
          setGenders(DEFAULT_GENDERS);
          setGenderState((currentGender) =>
            DEFAULT_GENDERS.some((item) => item.slug === currentGender)
              ? currentGender
              : DEFAULT_GENDERS[0].slug
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setGendersLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setGender = (nextGender: Gender) => {
    setGenderState(nextGender);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("selectedGender", nextGender);
    }
  };

  return (
    <GenderContext.Provider value={{ gender, setGender, genders, gendersLoading }}>
      {children}
    </GenderContext.Provider>
  );
}

export function useGender() {
  return useContext(GenderContext);
}