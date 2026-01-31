"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const SETTINGS_STORAGE_KEY = "vibestats_settings";

interface Settings {
    isSettingsOpen: boolean;
    isSettingsModalOpen: boolean;
}

interface SettingsContextType extends Settings {
    setIsSettingsOpen: (isOpen: boolean) => void;
    setIsSettingsModalOpen: (isOpen: boolean) => void;
}

const defaultSettings: Settings = {
    isSettingsOpen: false,
    isSettingsModalOpen: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [mounted, setMounted] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setSettings({ ...defaultSettings, ...parsed });
                } catch (e) {
                    console.error("Failed to parse settings from localStorage", e);
                }
            }
        }
    }, []);

    // Save settings to localStorage when they change
    useEffect(() => {
        if (mounted && typeof window !== "undefined") {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        }
    }, [settings, mounted]);

    const setIsSettingsOpen = (isOpen: boolean) => {
        setSettings(prev => ({ ...prev, isSettingsOpen: isOpen }));

        // Dispatch custom event for legacy components if any
        if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("settings-toggle", { detail: isOpen }));
        }
    };

    const setIsSettingsModalOpen = (isOpen: boolean) => {
        setSettings(prev => ({ ...prev, isSettingsModalOpen: isOpen }));
    };

    const value = {
        ...settings,
        setIsSettingsOpen,
        setIsSettingsModalOpen,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettingsContext() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettingsContext must be used within a SettingsProvider");
    }
    return context;
}
