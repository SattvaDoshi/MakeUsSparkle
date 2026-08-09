"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

export default function CartBanner() {
    const [bannerText, setBannerText] = useState("");

    useEffect(() => {
        apiRequest<{ success: boolean; cartBannerText: string }>("/cart/banner")
            .then(res => {
                if (res.success && res.cartBannerText) {
                    setBannerText(res.cartBannerText);
                }
            })
            .catch(console.error);
    }, []);

    if (!bannerText) {
        return null;
    }

    return (
        <div style={{
            background: "#fdf8ec",
            color: "#856404",
            padding: "10px 16px",
            borderRadius: "8px",
            textAlign: "center",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "16px",
            border: "1px solid #f5e2b0"
        }}>
            {bannerText}
        </div>
    );
}
