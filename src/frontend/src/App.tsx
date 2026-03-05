import { Toaster } from "@/components/ui/sonner";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Menu,
  PlusCircle,
  Settings,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useSettings } from "./hooks/useQueries";
import { DashboardPage } from "./pages/DashboardPage";
import { EntriesPage } from "./pages/EntriesPage";
import { EntryFormPage } from "./pages/EntryFormPage";
import { SettingsPage } from "./pages/SettingsPage";
import type { NavPage } from "./types";
import { DEFAULT_LABELS, getLabel } from "./utils/entryUtils";

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>("dashboard");
  const [focusEntryId, setFocusEntryId] = useState<bigint | undefined>(
    undefined,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { data: settings } = useSettings();

  const labels = settings?.labels ?? [];

  const navItems = [
    {
      id: "dashboard" as NavPage,
      label: getLabel(labels, "nav_dashboard", DEFAULT_LABELS),
      icon: LayoutDashboard,
      ocid: "nav.dashboard.tab",
    },
    {
      id: "entries" as NavPage,
      label: getLabel(labels, "nav_entries", DEFAULT_LABELS),
      icon: FileText,
      ocid: "nav.entries.tab",
    },
    {
      id: "new-entry" as NavPage,
      label: getLabel(labels, "nav_new_entry", DEFAULT_LABELS),
      icon: PlusCircle,
      ocid: "nav.new_entry.tab",
    },
    {
      id: "settings" as NavPage,
      label: getLabel(labels, "nav_settings", DEFAULT_LABELS),
      icon: Settings,
      ocid: "nav.settings.tab",
    },
  ];

  const appTitle = getLabel(labels, "app_title", DEFAULT_LABELS);
  const appSubtitle = getLabel(labels, "app_subtitle", DEFAULT_LABELS);

  const handleNavigate = (page: NavPage, entryId?: bigint) => {
    setCurrentPage(page);
    setFocusEntryId(entryId);
    setMobileSidebarOpen(false);
  };

  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo / App Title */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="w-8 h-8 object-contain rounded-lg shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-sidebar-primary" />
            </div>
          )}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden min-w-0"
              >
                <p className="font-display font-bold text-sm text-sidebar-foreground leading-tight truncate">
                  {appTitle}
                </p>
                <p className="text-xs text-sidebar-foreground/50 truncate mt-0.5">
                  {appSubtitle}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              data-ocid={item.ocid}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/55 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground/90"
              }`}
            >
              <Icon
                className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                  isActive
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/45"
                }`}
              />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/30 leading-relaxed">
            © {year}. Built with{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-sidebar-foreground/60 transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      )}

      {/* Collapse toggle (desktop) */}
      <button
        type="button"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="hidden lg:flex items-center justify-center w-5 h-5 rounded-full bg-sidebar-border hover:bg-sidebar-accent absolute -right-2.5 top-1/2 -translate-y-1/2 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors border border-sidebar-border"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 60 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:block relative flex-shrink-0 nav-sidebar-bg border-r border-sidebar-border overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 w-60 nav-sidebar-bg border-r border-sidebar-border z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            {settings?.logoUrl && (
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="w-6 h-6 object-contain"
              />
            )}
            <span className="font-display font-bold text-sm">{appTitle}</span>
          </div>
          <button
            type="button"
            className="ml-auto p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Banner */}
        {settings?.bannerUrl && (
          <div className="h-24 overflow-hidden shrink-0">
            <img
              src={settings.bannerUrl}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-7 sm:py-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {currentPage === "dashboard" && (
                  <DashboardPage onNavigate={handleNavigate} />
                )}
                {currentPage === "entries" && (
                  <EntriesPage
                    onNavigate={handleNavigate}
                    focusEntryId={focusEntryId}
                    onClearFocus={() => setFocusEntryId(undefined)}
                  />
                )}
                {currentPage === "new-entry" && (
                  <EntryFormPage onNavigate={handleNavigate} />
                )}
                {currentPage === "settings" && <SettingsPage />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <Toaster richColors position="bottom-right" />
    </div>
  );
}
