"use client";

import { cn } from "@/lib/utils";

interface BellIconProps {
    className?: string;
}

export function BellIcon({ className }: BellIconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-full h-full", className)}
        >
            <path
                d="M18 8C18 4.68629 15.3137 2 12 2C8.68629 2 6 4.68629 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <path
                d="M10.3 21C10.6 21.6 11.25 22 12 22C12.75 22 13.4 21.6 13.7 21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
