"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

type MainBannerResponse = {
  success: boolean;
  banner?: {
    _id: string;
    image?: string;
    link?: string;
    isActive?: boolean;
  } | null;
};

export default function Home() {
  const [mainBanner, setMainBanner] = useState<MainBannerResponse["banner"] | null>(null);

  useEffect(() => {
    let active = true;

    const loadMainBanner = async () => {
      try {
        const result = await apiRequest<MainBannerResponse>("/banners/main");
        if (!active) return;
        setMainBanner(result.banner || null);
      } catch {
        if (!active) return;
        setMainBanner(null);
      }
    };

    void loadMainBanner();

    return () => {
      active = false;
    };
  }, []);

  if (mainBanner && mainBanner.isActive !== false && mainBanner.image) {
    return (
      <main
        style={{
          margin: 0,
          padding: 0,
          width: "100%",
          height: "100%"
        }}
      >
        <style>{`
          .hero-container {
            position: relative;
            width: 100%;
            aspect-ratio: 16 / 5;
          }
          @media (max-width: 768px) {
            .hero-container {
              aspect-ratio: 1 / 1;
            }
          }
        `}</style>

        <a className="hero-container" href={mainBanner.link || "#"}>
          <Image
            src={mainBanner.image}
            alt="Main Banner"
            fill
            priority
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 100vw"
          />
        </a>
      </main>
    );
  }

  return null;
}