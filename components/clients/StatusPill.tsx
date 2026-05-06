"use client";

import { Clock3, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

export type ClientStatus = "bd-progress" | "awaiting-rm" | "onboarded";

interface StatusPillProps {
  status: ClientStatus;
  size?: "sm" | "md";
}

const config: Record<
  ClientStatus,
  { label: string; cls: string; icon: ReactNode }
> = {
  "bd-progress": {
    label: "BD in progress",
    cls: "bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]",
    icon: <Clock3 size={12} strokeWidth={2.2} />,
  },
  "awaiting-rm": {
    label: "Awaiting RM",
    cls: "bg-[#EFF4FF] text-[#3538CD] border-[#C7D7FE]",
    icon: <Clock3 size={12} strokeWidth={2.2} />,
  },
  onboarded: {
    label: "Onboarded",
    cls: "bg-[#ECFDF3] text-[#067647] border-[#ABEFC6]",
    icon: <CheckCircle2 size={12} strokeWidth={2.2} />,
  },
};

export default function StatusPill({ status, size = "sm" }: StatusPillProps) {
  const c = config[status];
  const pad =
    size === "md" ? "px-2.5 py-[3px] text-[12px]" : "px-2 py-[2px] text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${pad} ${c.cls}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
}
