import React from "react";

interface BronzeBadgeProps {
    className?: string;
}

export function BronzeBadge({ className = "w-5 h-5" }: BronzeBadgeProps) {
    return (
        <img
            src="/bronce-badge.svg"
            alt="Bronze Badge"
            className={className}
        />
    );
}
