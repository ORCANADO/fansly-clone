"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    Wallet,
    BarChart2,
    MessageCircle,
    Bell,
    User,
    Search,
    Globe,
    Mail,
    Menu
} from "lucide-react";
import { FanslyLogo } from "../ui/FanslyLogo";
import { LeaderboardIcon } from "../ui/LeaderboardIcon";
import { MessagesIcon } from "../ui/MessagesIcon";
import { SearchIcon } from "../ui/SearchIcon";
import { GlobeIcon } from "../ui/GlobeIcon";
import { MailIcon } from "../ui/MailIcon";
import { NotificationsIcon } from "../ui/NotificationsIcon";
import { ProfileDropdown } from "./ProfileDropdown";
import { CurrencyDisplay } from "../ui/CurrencyDisplay";

export function TopNav() {
    return (
        <header className="h-[70px] border-b border-white/[0.08] bg-[#16161a] flex items-center justify-between pl-[35px] pr-4 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                {/* Logo */}
                <div className="flex items-center gap-2.5 cursor-pointer">
                    <FanslyLogo className="h-[39px]" />
                    <span
                        className="text-[31px] text-white tracking-tight mb-1 select-none"
                        style={{ fontFamily: 'var(--font-geologica), sans-serif', fontWeight: 550 }}
                    >
                        fansly
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2.5 text-gray-400">
                <div className="flex items-center gap-0">
                    {/* Leaderboard */}
                    <div className="p-1.5 hover:bg-white/5 rounded-full cursor-pointer transition-colors group">
                        <LeaderboardIcon className="w-[30px] h-[30px]" />
                    </div>

                    {/* Messages (Custom Logo) */}
                    <div className="p-1.5 hover:bg-white/5 rounded-full cursor-pointer transition-colors">
                        <MessagesIcon className="w-[30px] h-[30px]" />
                    </div>

                    {/* Search */}
                    <div className="p-2 hover:bg-white/5 rounded-full cursor-pointer transition-colors">
                        <SearchIcon className="w-[22px] h-[22px] text-[#9DA2AD]" />
                    </div>

                    {/* Global */}
                    <div className="p-2 hover:bg-white/5 rounded-full cursor-pointer transition-colors">
                        <GlobeIcon className="w-[28px] h-[28px]" />
                    </div>

                    {/* Messages */}
                    <div className="p-2 hover:bg-white/5 rounded-full cursor-pointer transition-colors relative">
                        <MailIcon className="h-[26px] w-auto text-[#9DA2AD]" />
                    </div>

                    {/* Notifications */}
                    <div className="p-2 hover:bg-white/5 rounded-full cursor-pointer transition-colors relative">
                        <NotificationsIcon className="h-[22px] w-auto text-[#9DA2AD]" />

                    </div>
                </div>

                <div className="bg-[#111215] hover:bg-[#232428] cursor-pointer ml-1 px-[15px] py-1.5 rounded-[8px] text-[14px] font-normal text-[#D6DCE8] transition-colors tracking-tight">
                    <CurrencyDisplay value={793.84} />
                </div>

                <div className="ml-1">
                    <ProfileDropdown />
                </div>
            </div>
        </header>
    );
}

export function Sidebar() {
    // Hidden sidebar for now, assuming top-nav focus like the screenshot
    return null;
}
