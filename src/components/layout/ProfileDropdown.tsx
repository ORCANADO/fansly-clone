"use client";

import { useEffect, useState, useRef } from "react";
import {
  User,
  Heart,
  Image as ImageIcon,
  Layers,
  Clock,
  List,
  Bookmark,
  Mail,
  Bell,
  LayoutDashboard,
  DollarSign,
  BarChart3,
  Link as LinkIcon,
  Users,
  CreditCard,
  Banknote,
  GraduationCap,
  MessageCircle,
  HelpCircle,
  ShoppingBag,
  FileText,
  ShieldCheck,
  Settings,
  Globe,
  Sun,
  Moon,
  CheckCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useSettings } from "@/hooks/useSettings";
import { FanslyLogo } from "../ui/FanslyLogo";

interface MenuItem {
  id: number;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export function ProfileDropdown() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { setIsSettingsModalOpen } = useSettings();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSettingsClick = () => {
    setIsSettingsModalOpen(true);
  };

  // Group 1: Core Navigation (14 items)
  const group1: MenuItem[] = [
    { id: 1, label: "Profile", icon: <User className="w-4 h-4" />, disabled: true },
    { id: 2, label: "Subscriptions", icon: <Heart className="w-4 h-4" />, disabled: true },
    { id: 3, label: "Media Vault", icon: <ImageIcon className="w-4 h-4" />, disabled: true },
    { id: 4, label: "Media Collection", icon: <Layers className="w-4 h-4" />, disabled: true },
    { id: 5, label: "Scheduled Post Queue", icon: <Clock className="w-4 h-4" />, disabled: true },
    { id: 6, label: "Lists", icon: <List className="w-4 h-4" />, disabled: true },
    { id: 7, label: "Bookmarks", icon: <Bookmark className="w-4 h-4" />, disabled: true },
    { id: 8, label: "Messages", icon: <Mail className="w-4 h-4" />, disabled: true },
    { id: 9, label: "Notifications", icon: <Bell className="w-4 h-4" />, disabled: true },
    { id: 10, label: "Creator Dashboard", icon: <LayoutDashboard className="w-4 h-4" />, disabled: true },
    { id: 11, label: "Earning Statistics", icon: <DollarSign className="w-4 h-4" />, disabled: true },
    { id: 12, label: "Profile Statistics", icon: <BarChart3 className="w-4 h-4" />, disabled: true },
    { id: 13, label: "Tracking Links", icon: <LinkIcon className="w-4 h-4" />, disabled: true },
    { id: 14, label: "Referrals", icon: <Users className="w-4 h-4" />, disabled: true },
  ];

  // Group 2: Financials (2 items)
  const group2: MenuItem[] = [
    { id: 15, label: "Add Payment Method", icon: <CreditCard className="w-4 h-4" />, disabled: true },
    { id: 16, label: "Add Payout Method", icon: <Banknote className="w-4 h-4" />, disabled: true },
  ];

  // Group 3: Support (4 items)
  const group3: MenuItem[] = [
    { id: 17, label: "Creator Hub (Fansly Guide)", icon: <GraduationCap className="w-4 h-4" />, disabled: true },
    { id: 18, label: "Contact Support", icon: <MessageCircle className="w-4 h-4" />, disabled: true },
    { id: 19, label: "Help Center", icon: <HelpCircle className="w-4 h-4" />, disabled: true },
    { id: 20, label: "Merch Store", icon: <ShoppingBag className="w-4 h-4" />, disabled: true },
  ];

  // Group 4: Legal (2 items)
  const group4: MenuItem[] = [
    { id: 21, label: "Terms", icon: <FileText className="w-4 h-4" />, disabled: true },
    { id: 22, label: "Privacy Policy", icon: <ShieldCheck className="w-4 h-4" />, disabled: true },
  ];

  // Group 5: System (3 items - 2 functional)
  const group5: MenuItem[] = [
    { id: 23, label: "Settings", icon: <Settings className="w-4 h-4" />, onClick: handleSettingsClick },
    { id: 24, label: "Language", icon: <Globe className="w-4 h-4" />, disabled: true },
    {
      id: 25,
      label: !mounted ? "Theme" : (theme === "dark" ? "Light Mode" : "Dark Mode"),
      icon: !mounted ? <Sun className="w-4 h-4" /> : (theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />),
      onClick: toggleTheme
    },
  ];

  const renderMenuItems = (items: MenuItem[]) => {
    return items.map((item) => (
      <DropdownMenuItem
        key={item.id}
        className={cn(
          "px-3 py-2.5 text-sm",
          item.disabled
            ? "pointer-events-none opacity-70 cursor-not-allowed"
            : "cursor-pointer hover:bg-secondary/30 hover:text-primary transition-colors"
        )}
        onClick={() => {
          if (item.onClick && !item.disabled) {
            item.onClick();
          }
        }}
        // Don't pass disabled prop if false/undefined
        {...(item.disabled ? { disabled: true } : {})}
      >
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">{item.icon}</span>
          <span>{item.label}</span>
        </div>
      </DropdownMenuItem>
    ));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative ml-2 cursor-pointer hover:opacity-90 transition-opacity">
          <div className="w-[36px] h-[36px] rounded-full bg-gray-600 overflow-hidden">
            <img
              src="/images/model_pfp.jpg"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Online Indicator Dot */}
          <div className="absolute bottom-0 right-[1px] w-[12.35px] h-[12.35px] bg-[#77CE78] border-2 border-[#16161a] rounded-full"></div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 bg-card border border-border rounded-md shadow-xl p-0 max-h-[80vh] overflow-y-auto"
        sideOffset={8}
      >
        {/* User Header Section */}
        <div className="p-6 border-b border-white/[0.08] flex flex-col items-center">
          {/* Avatar with Status */}
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 shadow-lg">
              <img
                src="/images/model_pfp.jpg"
                alt="Camila"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Online Indicator */}
            <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-[#22c55e] border-[3px] border-[#111215] rounded-full"></div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h3 className="font-bold text-white text-[17px] tracking-tight">Camila Lop...</h3>
              <CheckCircle className="w-[18px] h-[18px] text-[#1da1f2]" fill="currentColor" />
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <FanslyLogo className="h-3" />
              <p className="text-[13px] text-gray-500 font-medium tracking-wide">@smeraldamo...</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 w-full mt-6 gap-1">
            <div className="flex flex-col items-center">
              <span className="text-[16px] font-bold text-white leading-tight">13,766</span>
              <span className="text-[12px] text-gray-500 font-medium">Likes</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[16px] font-bold text-white leading-tight">9,394</span>
              <span className="text-[12px] text-gray-500 font-medium">Followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[16px] font-bold text-white leading-tight">334</span>
              <span className="text-[12px] text-gray-500 font-medium text-center">Subscribers</span>
            </div>
          </div>
        </div>

        {/* Menu Items Container */}
        <div className="p-1.5">
          {/* Group 1: Core Navigation */}
          {renderMenuItems(group1)}

          <DropdownMenuSeparator className="bg-border my-1.5" />

          {/* Group 2: Financials */}
          {renderMenuItems(group2)}

          <DropdownMenuSeparator className="bg-border my-1.5" />

          {/* Group 3: Support */}
          {renderMenuItems(group3)}

          <DropdownMenuSeparator className="bg-border my-1.5" />

          {/* Group 4: Legal */}
          {renderMenuItems(group4)}

          <DropdownMenuSeparator className="bg-border my-1.5" />

          {/* Group 5: System */}
          {renderMenuItems(group5)}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}