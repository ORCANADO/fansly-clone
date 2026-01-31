"use client";

import { cn } from "@/lib/utils";

interface StatisticsIconProps {
    className?: string;
}

export function StatisticsIcon({ className }: StatisticsIconProps) {
    return (
        <img
            src="/chart-icon.svg"
            alt="Statistics"
            className={cn("w-full h-full object-contain pointer-events-none select-none", className)}
            draggable={false}
        />
    );
}
