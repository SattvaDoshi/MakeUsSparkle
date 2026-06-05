// "use client";

// import Image from "next/image";
// import { useEffect, useState } from "react";
// import { apiRequest } from "@/lib/api";

// type MainBannerResponse = {
//   success: boolean;
//   banner?: {
//     _id: string;
//     image?: string;
//     link?: string;
//     isActive?: boolean;
//   } | null;
// };
  
// export default function Home() {
//   const [mainBanner, setMainBanner] = useState<MainBannerResponse["banner"] | null>(null);

//   useEffect(() => {
//     let active = true;

//     const loadMainBanner = async () => {
//       try {
//         const result = await apiRequest<MainBannerResponse>("/banners/main");
//         if (!active) return;
//         setMainBanner(result.banner || null);
//       } catch {
//         if (!active) return;
//         setMainBanner(null);
//       }
//     };

//     void loadMainBanner();

//     return () => {
//       active = false;
//     };
//   }, []);

//   if (mainBanner && mainBanner.isActive !== false && mainBanner.image) {
//     return (
//       <main
//         style={{
//           margin: 0,
//           padding: 0,
//           width: "100%",
//           height: "100%"
//         }}
//       >
//         <style>{`
//           .hero-container {
//             position: relative;
//             width: 100%;
//             aspect-ratio: 16 / 5;
//           }
//           @media (max-width: 768px) {
//             .hero-container {
//               aspect-ratio: 1 / 1;
//             }
//           }
//         `}</style>

//         <a className="hero-container" href={mainBanner.link || "#"}>
//           <Image
//             src={mainBanner.image}
//             alt="Main Banner"
//             fill
//             priority
//             style={{ objectFit: "cover" }}
//             sizes="(max-width: 768px) 100vw, 100vw"
//           />
//         </a>
//       </main>
//     );
//   }

//   return null;
// }




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
    const load = async () => {
      try {
        const result = await apiRequest<MainBannerResponse>("/banners/main");
        if (active) setMainBanner(result.banner || null);
      } catch {
        if (active) setMainBanner(null);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  if (!mainBanner || mainBanner.isActive === false || !mainBanner.image) return null;

  return (
    <main style={{ margin: 0, padding: 0, width: "100%" }}>
      <style>{`
        .hero-wrap {
          /* Matches BannerSection .bs-card height exactly */
          width: 100%;
          height: clamp(300px, 36vw, 520px);
          display: block;
          position: relative;
          overflow: hidden;
          border-radius: 0;
          margin: 0;
          padding: 0;
        }

        /* Tablet 640–1023px — matches .bs-card tablet height */
        @media (min-width: 640px) and (max-width: 1023px) {
          .hero-wrap {
            height: clamp(280px, 46vw, 420px);
          }
        }

        /* Mobile ≤639px — matches .bs-card:nth-child(1) mobile height */
        @media (max-width: 639px) {
          .hero-wrap {
            height: clamp(320px, 95vw, 480px);
          }
        }
      `}</style>

      <a href={mainBanner.link || "#"} className="hero-wrap">
        <Image
          src={mainBanner.image}
          alt="Main Banner"
          fill
          priority
          style={{ objectFit: "cover", objectPosition: "center" }}
          sizes="100vw"
        />
      </a>
    </main>
  );
}