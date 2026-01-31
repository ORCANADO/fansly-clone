"use client";

import { cn } from "@/lib/utils";

interface SearchIconProps {
    className?: string;
}

export function SearchIcon({ className }: SearchIconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-full h-full", className)}
        >
            <circle
                cx="11"
                cy="11"
                r="8"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M17 17L23 23"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
