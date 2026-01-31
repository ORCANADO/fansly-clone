import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Precise Fansly-inspired palette
                background: "#111215", // Deep navy base
                foreground: "#ffffff",
                card: {
                    DEFAULT: "#16212e", // Lighter navy for cards
                    foreground: "#ffffff",
                },
                popover: {
                    DEFAULT: "#16212e",
                    foreground: "#ffffff",
                },
                primary: {
                    DEFAULT: "#1da1f2", // Action blue
                    foreground: "#ffffff",
                },
                secondary: {
                    DEFAULT: "#2a3948", // Border/Gray elements
                    foreground: "#ffffff",
                },
                muted: {
                    DEFAULT: "#2a3948",
                    foreground: "#94a3b8",
                },
                accent: {
                    DEFAULT: "#1da1f2",
                    foreground: "#ffffff",
                },
                // Chart specific colors extracted from your screenshots
                stats: {
                    tips: "#a855f7",     // Purple line
                    subs: "#22c55e",     // Green line
                    media: "#ffffff",    // White line
                    referral: "#3b82f6", // Blue line
                }
            },
            borderRadius: {
                lg: "0.5rem",
                md: "calc(0.5rem - 2px)",
                sm: "calc(0.5rem - 4px)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;