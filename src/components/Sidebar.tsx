"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  CheckSquare,
  Target,
  FolderKanban,
  Briefcase,
  Rocket,
  Home,
  Wallet,
  Dumbbell,
  BookOpen,
  Inbox,
  Bot,
  Settings,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "I dag", href: "/idag", icon: CalendarCheck },
  { label: "Kalender", href: "/kalender", icon: Calendar },
  { label: "Oppgaver", href: "/oppgaver", icon: CheckSquare },
  { label: "Mål", href: "/maal", icon: Target },
  { label: "Prosjekter", href: "/prosjekter", icon: FolderKanban },
  { label: "Asplan Viak", href: "/asplan-viak", icon: Briefcase },
  { label: "ytly.no", href: "/ytly", icon: Rocket },
  { label: "Privat", href: "/privat", icon: Home },
  { label: "Økonomi", href: "/okonomi", icon: Wallet },
  { label: "Trening", href: "/trening", icon: Dumbbell },
  { label: "Logg & Refleksjon", href: "/logg", icon: BookOpen },
  { label: "Innboks", href: "/innboks", icon: Inbox },
  { label: "Assistent", href: "/assistent", icon: Bot },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "/asplan-viak",
  ]);

  function toggleExpanded(href: string) {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((h) => h !== href)
        : [...prev, href]
    );
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div
      className={cn(
        "flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      {/* Logo / Brand */}
      <div className="flex h-14 items-center gap-2 px-4 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
          LP
        </div>
        <span className="font-semibold text-lg tracking-tight">
          Livsplanlegg
        </span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const expanded = expandedItems.includes(item.href);
            const hasChildren = item.children && item.children.length > 0;

            return (
              <div key={item.href}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center">
                      <Link
                        href={hasChildren ? item.href : item.href}
                        onClick={(e) => {
                          if (hasChildren) {
                            e.preventDefault();
                            toggleExpanded(item.href);
                          }
                          onNavigate?.();
                        }}
                        className={cn(
                          "flex flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          active &&
                            "bg-sidebar-accent text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge != null && (
                          <Badge
                            variant="secondary"
                            className="ml-auto h-5 min-w-5 justify-center px-1.5 text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {hasChildren && (
                          <span className="ml-auto">
                            {expanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </span>
                        )}
                      </Link>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="md:hidden">
                    {item.label}
                  </TooltipContent>
                </Tooltip>

                {/* Sub-items */}
                {hasChildren && expanded && (
                  <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => onNavigate?.()}
                        className={cn(
                          "flex items-center rounded-md px-3 py-1.5 text-sm transition-colors",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive(child.href) &&
                            "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom section */}
      <Separator className="bg-sidebar-border" />
      <div className="p-2">
        <Link
          href="/innstillinger"
          onClick={() => onNavigate?.()}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive("/innstillinger") &&
              "bg-sidebar-accent text-sidebar-accent-foreground"
          )}
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Innstillinger</span>
        </Link>
      </div>
    </div>
  );
}
