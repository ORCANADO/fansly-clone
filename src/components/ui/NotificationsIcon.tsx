"use client";

import { cn } from "@/lib/utils";

interface NotificationsIconProps {
    className?: string;
}

export function NotificationsIcon({ className }: NotificationsIconProps) {
    return (
        <img
            src="/notifications-final.svg"
            alt="Notifications"
            className={cn("w-full h-full object-contain pointer-events-none select-none", className)}
            draggable={false}
        />
    );
}