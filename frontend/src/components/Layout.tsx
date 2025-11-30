import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { WalletButton } from "./WalletButton";
import { ThemeToggle } from "./ThemeToggle";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex items-center px-6 justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">V</span>
                </div>
                <h1 className="text-xl font-bold gradient-text hidden md:block">ChainTrain</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <WalletButton />
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
