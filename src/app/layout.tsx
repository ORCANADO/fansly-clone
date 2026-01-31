import type { Metadata } from "next";
import { Inter, Geologica } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";

const inter = Inter({ subsets: ["latin"] });
const geologica = Geologica({
    subsets: ["latin"],
    variable: "--font-geologica",
});

export const metadata: Metadata = {
    title: "VibeStats | Personal Earnings Simulator",
    description: "High-fidelity earnings dashboard simulation",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn(
                inter.className,
                geologica.variable,
                "min-h-screen bg-background text-foreground overflow-x-hidden"
            )}>
                <ThemeProvider
                    attribute="data-theme"
                    defaultTheme="dark"
                    enableSystem={false}
                    storageKey="vibestats-theme"
                >
                    <SettingsProvider>
                        {children}
                    </SettingsProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}

