import Image from "next/image";
import heroImage from "@/public/images/hero.png";

export default function Home() {
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

      <div className="hero-container">
        <Image
          src={heroImage}
          alt="Hero"
          fill
          priority
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, 100vw"
        />
      </div>
    </main>
  );
}