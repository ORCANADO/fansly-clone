"use client";

import { cn } from "@/lib/utils";

interface WalletIconProps {
    className?: string;
}

export function WalletIcon({ className }: WalletIconProps) {
    return (
        <img
            src="/wallet.svg"
            alt="Wallet"
            className={cn("w-full h-full object-contain pointer-events-none select-none", className)}
            draggable={false}
        />
    );
}
