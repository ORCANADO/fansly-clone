import React from 'react';

interface CurrencyDisplayProps {
    value: number;
    className?: string;
    iconSize?: number;
}

export function CurrencyDisplay({ value, className = "", iconSize = 16 }: CurrencyDisplayProps) {
    const formatted = new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);

    return (
        <span className={`inline-flex items-baseline gap-0 text-[#D6DCE8] ${className}`}>
            <img
                src="/icons/dollar.svg"
                alt="$"
                className="relative top-[2px] ml-1 -mr-0.5"
                style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
            />
            {formatted}
        </span>
    );
}
