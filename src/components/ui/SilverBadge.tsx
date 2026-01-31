import React from "react";

interface SilverBadgeProps {
    className?: string;
}

export function SilverBadge({ className = "w-5 h-5" }: SilverBadgeProps) {
    return (
        <img
            src="/silver-badge.svg"
            alt="Silver Badge"
            className={className}
        />
    );
}
