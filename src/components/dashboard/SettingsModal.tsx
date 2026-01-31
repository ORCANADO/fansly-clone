"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SettingsView } from "./SettingsView";

interface SettingsModalProps {
  targetAmount: number;
  onTargetChange: (amount: number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({
  targetAmount,
  onTargetChange,
  isOpen,
  onOpenChange,
}: SettingsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Settings & Configuration
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure your monthly targets and manage manual data overrides
          </DialogDescription>
        </DialogHeader>

        <SettingsView
          targetAmount={targetAmount}
          onTargetChange={onTargetChange}
        />
      </DialogContent>
    </Dialog>
  );
}