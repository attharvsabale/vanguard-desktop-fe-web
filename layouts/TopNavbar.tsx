"use client";

import { PanelLeft } from "lucide-react";

interface TopNavbarProps {
  brand?: string;
  onToggleSidebar?: () => void;
}

export default function TopNavbar({
  brand = "FinanceTest",
  onToggleSidebar,
}: TopNavbarProps) {
  return (
    <header className="h-14 border-b border-[#EAECF0] bg-white flex items-center px-6 sticky top-0 z-20">
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="text-[#667085] hover:text-[#101828] transition mr-3"
      >
        <PanelLeft size={18} />
      </button>
      <span className="text-[14px] font-medium text-[#101828]">{brand}</span>
    </header>
  );
}
