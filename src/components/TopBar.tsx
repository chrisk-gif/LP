"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/Sidebar";
import { CommandPalette } from "@/components/CommandPalette";
import { QuickAdd } from "@/components/QuickAdd";
import { MicButton } from "@/components/MicButton";
import {
  Menu,
  Search,
  Plus,
  LogOut,
  User,
  Settings,
  Moon,
  Sun,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  displayName: string;
  avatarUrl: string | null;
  initials: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "God natt";
  if (hour < 12) return "God morgen";
  if (hour < 17) return "God ettermiddag";
  return "God kveld";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TopBar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<string | undefined>();
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: "",
    avatarUrl: null,
    initials: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        const name = data.display_name || user.email || "Bruker";
        setProfile({
          displayName: name,
          avatarUrl: data.avatar_url,
          initials: getInitials(name),
        });
      }
    }
    fetchProfile();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function toggleDarkMode() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Meny</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigasjon</SheetTitle>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Greeting */}
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-foreground">
            {getGreeting()}
            {profile.displayName ? `, ${profile.displayName}` : ""}
          </p>
        </div>

        <div className="flex-1" />

        {/* Search / Command Palette trigger */}
        <Button
          variant="outline"
          className="hidden sm:flex items-center gap-2 text-muted-foreground h-9 w-64 justify-start px-3"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span className="text-sm">Sok...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            Ctrl+K
          </kbd>
        </Button>

        {/* Mobile search */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Sok</span>
        </Button>

        {/* Quick Add */}
        <Button
          variant="default"
          size="icon"
          className="h-8 w-8"
          onClick={() => setQuickAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Legg til</span>
        </Button>

        {/* Mic */}
        <MicButton />

        {/* Dark mode toggle */}
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {darkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">Bytt tema</span>
        </Button>

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={profile.avatarUrl ?? ""}
                  alt={profile.displayName}
                />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {profile.initials || "?"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              {profile.displayName || "Laster..."}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/innstillinger")}>
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/innstillinger")}>
              <Settings className="mr-2 h-4 w-4" />
              Innstillinger
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logg ut
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Dialogs */}
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onQuickAdd={(type) => {
          setQuickAddType(type);
          setQuickAddOpen(true);
        }}
      />
      <QuickAdd
        open={quickAddOpen}
        onOpenChange={(open) => {
          setQuickAddOpen(open);
          if (!open) setQuickAddType(undefined);
        }}
        defaultType={quickAddType}
      />
    </>
  );
}
