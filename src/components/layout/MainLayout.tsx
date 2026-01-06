import type { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
}

export function MainLayout({
  children,
  showHeader = true,
  showNav = true,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showHeader && <Header />}
      <main className="flex-1 pb-20">{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
}
