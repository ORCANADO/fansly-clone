"use client";

import { useState, useEffect, useRef } from "react";
import { Edit, Trash2, Plus, Calendar, DollarSign, Download, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAllManualOverrides,
  getMonthsWithOverrides,
  formatMonthKey,
  dateToMonthKey,
  deleteManualOverride,
  saveManualOverride,
  getManualOverrideCount,
  downloadManualOverridesCSV,
  importManualOverridesFromFile
} from "@/lib/storage";
import { createMonthlyOverride } from "@/types/overrides";
import { formatCurrency } from "@/lib/utils";
import { EditOverrideDialog } from "./EditOverrideDialog";
import type { MonthlyOverride } from "@/types/overrides";

interface ManagementDashboardProps {
  onDataChange?: () => void;
}

export function ManagementDashboard({ onDataChange }: ManagementDashboardProps) {
  const [overrides, setOverrides] = useState<Record<string, MonthlyOverride>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMonthKey, setEditingMonthKey] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: string[];
    total: number;
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load overrides on mount
  useEffect(() => {
    loadOverrides();
  }, []);

  const loadOverrides = () => {
    const allOverrides = getAllManualOverrides();
    setOverrides(allOverrides);
  };

  const handleEdit = (monthKey: string) => {
    setEditingMonthKey(monthKey);
    setIsAddingNew(false);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    // Default to current month
    const currentMonthKey = dateToMonthKey(new Date());
    setEditingMonthKey(currentMonthKey);
    setIsAddingNew(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (monthKey: string) => {
    if (confirm(`Are you sure you want to delete the manual override for ${formatMonthKey(monthKey)}?`)) {
      deleteManualOverride(monthKey);
      loadOverrides();
      onDataChange?.();
    }
  };

  const handleSave = (monthKey: string, data: MonthlyOverride) => {
    saveManualOverride(monthKey, data);
    loadOverrides();
    setIsDialogOpen(false);
    onDataChange?.();
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingMonthKey(null);
  };

  const handleExportCSV = () => {
    downloadManualOverridesCSV();
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importManualOverridesFromFile(file);
      setImportResult(result);
      
      if (result.success > 0) {
        // Reload overrides and trigger data change
        loadOverrides();
        onDataChange?.();
      }
    } catch (error) {
      setImportResult({
        success: 0,
        errors: [`Import failed: ${error instanceof Error ? error.message : String(error)}`],
        total: 0
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const monthsWithOverrides = getMonthsWithOverrides();
  const totalOverrides = getManualOverrideCount();

  // Generate suggested months (current month and previous 5 months)
  const suggestedMonths: string[] = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = dateToMonthKey(date);
    if (!overrides[monthKey]) {
      suggestedMonths.push(monthKey);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manual Overrides Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage manual data entries that take precedence over simulated data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {totalOverrides} manual override{totalOverrides !== 1 ? 's' : ''}
          </div>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Manual Override
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="dense-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Months with Overrides</p>
              <p className="text-2xl font-bold">{totalOverrides}</p>
            </div>
          </div>
        </div>
        <div className="dense-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Net Income</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  Object.values(overrides).reduce((sum, override) => sum + override.netIncome, 0)
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="dense-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Gross Income</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  Object.values(overrides).reduce((sum, override) => sum + override.grossIncome, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overrides Table */}
      <div className="dense-card">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Manual Overrides</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manual overrides take 100% precedence over simulated data
          </p>
        </div>

        {monthsWithOverrides.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">No Manual Overrides</h4>
            <p className="text-muted-foreground mb-6">
              Add manual overrides to override simulated data for specific months
            </p>
            <Button onClick={handleAddNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Override
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Month</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Net Income</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Gross Income</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Categories</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Updated</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {monthsWithOverrides.map((monthKey) => {
                  const override = overrides[monthKey];
                  if (!override) return null;

                  return (
                    <tr key={monthKey} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="p-4">
                        <div className="font-medium">{formatMonthKey(monthKey)}</div>
                        <div className="text-xs text-muted-foreground">{monthKey}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono font-bold">{formatCurrency(override.netIncome)}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono">{formatCurrency(override.grossIncome)}</div>
                        <div className="text-xs text-muted-foreground">+20% platform fee</div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Media:</span>
                            <span className="font-mono">{formatCurrency(override.categories.media)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Media Sets:</span>
                            <span className="font-mono">{formatCurrency(override.categories.mediaSets)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Tips:</span>
                            <span className="font-mono">{formatCurrency(override.categories.tips)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Subscriptions:</span>
                            <span className="font-mono">{formatCurrency(override.categories.subscriptions)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground">
                          {new Date(override.lastUpdated).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(override.lastUpdated).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(monthKey)}
                            className="gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(monthKey)}
                            className="gap-1 text-destructive border-destructive/20 hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suggested Months */}
      {suggestedMonths.length > 0 && (
        <div className="dense-card">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Suggested Months</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Months without manual overrides that you might want to add
            </p>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {suggestedMonths.map((monthKey) => (
                <Button
                  key={monthKey}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingMonthKey(monthKey);
                    setIsAddingNew(true);
                    setIsDialogOpen(true);
                  }}
                  className="gap-2"
                >
                  <Plus className="w-3 h-3" />
                  {formatMonthKey(monthKey)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Portability Section */}
      <div className="dense-card">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Data Portability</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Export and import manual overrides to safeguard your data
          </p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Card */}
            <div className="dense-card p-4 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Download className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Export to CSV</h4>
                  <p className="text-sm text-muted-foreground">
                    Download all manual overrides as a CSV file
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  CSV file includes all months with their net income, gross income, category breakdowns, notes, and timestamps.
                </p>
                <Button
                  onClick={handleExportCSV}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Download className="w-4 h-4" />
                  Export {totalOverrides} Override{totalOverrides !== 1 ? 's' : ''} to CSV
                </Button>
              </div>
            </div>

            {/* Import Card */}
            <div className="dense-card p-4 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Import from CSV</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload a CSV file to restore manual overrides
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Import overrides from a previously exported CSV file. Existing data for matching months will be overwritten.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportCSV}
                  accept=".csv"
                  className="hidden"
                />
                <Button
                  onClick={handleTriggerImport}
                  className="w-full gap-2"
                  variant="outline"
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Import from CSV File
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Supported format: CSV with Month, Net Income, Gross Income, Media, Media Sets, Tips, Subscriptions, Note, Last Updated, Is Manual columns
                </p>
              </div>
            </div>
          </div>

          {/* Import Results */}
          {importResult && (
            <div className={`mt-4 p-4 rounded-lg ${importResult.success > 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-destructive/10 border border-destructive/20'}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${importResult.success > 0 ? 'text-green-500' : 'text-destructive'}`}>
                  {importResult.success > 0 ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${importResult.success > 0 ? 'text-green-600' : 'text-destructive'}`}>
                    {importResult.success > 0
                      ? `Successfully imported ${importResult.success} of ${importResult.total} overrides`
                      : 'Import failed'
                    }
                  </h4>
                  {importResult.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium text-foreground">Errors:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {importResult.errors.map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            <span>{error}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {importResult.success > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      The dashboard will now use the imported data. You may need to refresh the page to see all changes.
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImportResult(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      {isDialogOpen && editingMonthKey && (
        <EditOverrideDialog
          monthKey={editingMonthKey}
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          onSave={handleSave}
          initialData={isAddingNew ? undefined : overrides[editingMonthKey]}
        />
      )}
    </div>
  );
}