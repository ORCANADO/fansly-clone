"use client";

import { MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { FanslyLogo } from "../ui/FanslyLogo";
import { CurrencyDisplay } from "../ui/CurrencyDisplay";

interface LinkData {
    name: string;
    type: "managed" | "external";
    clicks: number;
    subs: number;
    conv: number;
    earnings: number;
    icon?: string;
}

const mockLinks: LinkData[] = [
    { name: "Fansly Suggestions", type: "managed", clicks: 3953, subs: 536, conv: 12, earnings: 540.84 },
    { name: "Fansly FYP", type: "managed", clicks: 28889, subs: 9790, conv: 307, earnings: 14840.70 },
    { name: "Fansly Search", type: "managed", clicks: 469, subs: 77, conv: 11, earnings: 2079.88 },
    { name: "Onlyfans", type: "external", clicks: 4, subs: 2, conv: 1, earnings: 10 },
    { name: "Twitter", type: "external", clicks: 120, subs: 7, conv: 0, earnings: 0 },
];

export function TrackingLinks() {
    return (
        <div className="mb-4">
            {/* Header Content - Now outside */}
            <div className="mb-4 px-1">
                <h3 className="text-[15.3px] font-bold text-[#D6DCE8] tracking-tight">Tracking Links</h3>
                <p className="text-[14px] text-[#637395] mt-1.5 leading-snug">
                    Create and manage individual tracking links. Track user engagement and measure the success of your promotional efforts.
                </p>
                <p className="text-[14px] text-[#637395] mt-3 font-medium">
                    Managed tracking links track your internal traffic.
                </p>
            </div>

            {/* List Cards */}
            <div className="space-y-4">
                {mockLinks.map((link) => (
                    <div
                        key={link.name}
                        className="bg-[#111215] border border-[#26292D] rounded-[10px] flex items-center justify-between h-[58px] pl-[14.5px] pr-4 transition-colors cursor-pointer group shadow-sm"
                    >
                        {/* Left: Name and Icon */}
                        <div className="flex items-center gap-[7px]">
                            {link.name.includes("Fansly") && (
                                <div className="flex items-center justify-center w-[18px]">
                                    <FanslyLogo className="h-[16.2px] w-auto text-[#2599F7]" />
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-[15px] text-[#D6DCE8] tracking-tight">
                                    {link.name}
                                    {link.type === "managed" && (
                                        <span className="text-[#2599F7] ml-1.5 font-bold text-[13.65px]">(managed)</span>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Right: Stats and Actions */}
                        <div className="flex items-center gap-[5px]">
                            <div className="flex items-center gap-2 text-gray-300">
                                {/* Hits */}
                                <div className="flex items-center gap-2 min-w-[40px] justify-end">
                                    <img
                                        src="/statistics_icon.svg"
                                        alt="Hits"
                                        className="w-[14.1px] h-[14.1px]"
                                    />
                                    <div className="flex items-center gap-[3px]">
                                        <span className="text-[14.25px] font-normal text-[#D6DCE8]">{link.clicks.toLocaleString()}</span>
                                        <img
                                            src="/question_icon.svg"
                                            alt="Info"
                                            className="w-[14.28px] h-[14.28px] cursor-help"
                                        />
                                    </div>
                                </div>
                                {/* Subs */}
                                <div className="flex items-center gap-2 min-w-[40px] justify-end">
                                    <img
                                        src="/persons_icon.svg"
                                        alt="Subs"
                                        className="w-[16.5px] h-[16.5px]"
                                    />
                                    <span className="text-[14.25px] font-normal text-[#D6DCE8]">{link.subs.toLocaleString()}</span>
                                </div>
                                {/* Star */}
                                <div className="flex items-center gap-2 min-w-[30px] justify-end">
                                    <img
                                        src="/star_icon.svg"
                                        alt="Stars"
                                        className="w-[16.5px] h-[16.5px]"
                                    />
                                    <span className="text-[14.25px] font-normal text-[#D6DCE8]">{link.conv}</span>
                                </div>
                                {/* Revenue */}
                                <div className="flex items-center gap-1 min-w-[60px] justify-end">
                                    <span className="text-[14.25px] font-normal text-[#D6DCE8]">
                                        <CurrencyDisplay value={link.earnings} />
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {link.type === "external" && (
                                    <div className="flex items-center gap-3">
                                        <button className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-white/5 rounded-md transition-colors text-gray-400 hover:text-white border border-transparent hover:border-white/10">
                                            <img src="/copy_icon.svg" alt="Copy" className="w-[16.5px] h-[16.5px]" />
                                            <span className="text-[13.42px] font-normal text-[#D6DCE8]">Copy</span>
                                        </button>
                                        <button className="p-2 hover:bg-white/5 rounded-md transition-colors text-gray-400 hover:text-white">
                                            <img src="/edit_icon.svg" alt="Edit" className="w-[16.5px] h-[16.5px]" />
                                        </button>
                                        <button className="p-2 hover:bg-white/5 rounded-md transition-colors text-gray-400 hover:text-white">
                                            <img src="/trash_icon.svg" alt="Trash" className="w-[16.5px] h-[16.5px]" />
                                        </button>
                                    </div>
                                )}
                                <svg
                                    className="w-[22px] h-[22px] text-[#D6DCE8]"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.0} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Elements */}
            <div className="mt-4 flex flex-col items-center gap-4">
                <button className="text-[15px] text-[#637395] font-medium hover:underline cursor-pointer tracking-tight">
                    Show 4 More
                </button>
                <div className="w-fit self-start">
                    <button className="bg-[#2599F7] text-white px-3.5 py-2 rounded-[5px] text-[13.5px] font-medium transition-all active:scale-[0.98] shadow-lg shadow-blue-500/10">
                        Create Tracking Link
                    </button>
                </div>
            </div>
        </div>
    );
}
