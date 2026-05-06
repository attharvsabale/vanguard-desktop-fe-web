"use client";

import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import TopNavbar from "./TopNavbar";

type Props = {
  children: ReactNode;
};

export default function AppLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar />
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
