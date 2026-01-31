"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { CurrencyDisplay } from "../ui/CurrencyDisplay";

interface StatCardsProps {
    subs: number;
    tips: number;
    media: number;
    mediaSets: number;
}

export function StatCards({ subs, tips, media, mediaSets }: StatCardsProps) {
    const stats = useMemo(() => [
        {
            label: "Tips",
            value: tips,
            icon: (
                <img
                    src="/icons/tips.svg"
                    alt="Tips"
                    className="w-[21.6px] h-[21.6px] object-contain"
                />
            )
        },
        {
            label: "Subscriptions",
            value: subs,
            icon: (
                <img
                    src="/icons/subscriptions.svg"
                    alt="Subscriptions"
                    className="w-6 h-6 object-contain"
                />
            )
        },
        {
            label: "Media",
            value: media,
            icon: (
                <img
                    src="/icons/media.svg"
                    alt="Media"
                    className="w-[22.8px] h-[22.8px] object-contain"
                />
            )
        },
        {
            label: "Media Sets",
            value: mediaSets,
            icon: (
                <img
                    src="/icons/media_sets.svg"
                    alt="Media Sets"
                    className="w-6 h-6 object-contain"
                />
            )
        },
    ], [subs, tips, media, mediaSets]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-[#16161A] border border-[#3C3D43] rounded-lg py-1.5 px-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 flex items-center justify-center">
                            {stat.icon}
                        </div>
                        <span className="font-light text-[16px] text-[#637394]">{stat.label}</span>
                    </div>
                    <span className="font-light text-[17px] text-[#D6DCE8] tracking-tight">
                        <CurrencyDisplay value={stat.value} />
                    </span>
                </div>
            ))}
        </div>
    );
}
