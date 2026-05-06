"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Search, X } from "lucide-react";

import AppLayout from "@/layouts/AppLayout";
import StatusPill, { type ClientStatus } from "@/components/clients/StatusPill";
import { listClients, type ClientListItem } from "@/services/clientsService";

const initials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

type FilterValue = ClientStatus | "all";

const FILTER_TABS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "bd-progress", label: "BD in progress" },
  { value: "awaiting-rm", label: "Awaiting RM" },
  { value: "onboarded", label: "Onboarded" },
];

export default function ClientsListPage() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listClients()
      .then((data) => {
        if (!cancelled) setClients(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load clients");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Counts per status for the filter chip badges.
  const counts = useMemo(() => {
    const c = { all: clients.length, "bd-progress": 0, "awaiting-rm": 0, onboarded: 0 } as Record<FilterValue, number>;
    for (const cl of clients) c[cl.status]++;
    return c;
  }, [clients]);

  // Apply status filter + search.
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.bd_name.toLowerCase().includes(q) ||
        (c.rm_name?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [clients, filter, search]);

  const filterPillCls = (active: boolean) =>
    `inline-flex items-center gap-2 h-8 px-3 rounded-full text-[12.5px] font-medium border transition ${
      active
        ? "bg-[#0A1B3D] text-white border-[#0A1B3D]"
        : "bg-white text-[#475467] border-[#EAECF0] hover:border-[#D0D5DD]"
    }`;

  return (
    <AppLayout>
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-[28px] leading-tight font-semibold text-[#0A1B3D]">
              Clients
            </h1>
            <p className="text-[13px] text-[#667085] mt-1">
              {loading
                ? "Loading…"
                : `${visible.length} of ${clients.length} clients`}
            </p>
          </div>

          <Link
            href="/bd/clients/add"
            className="
              inline-flex items-center gap-2
              h-10 px-4
              bg-[#0A1B3D] hover:bg-[#0F2452]
              text-white text-[13px] font-medium
              rounded-xl
              transition
            "
          >
            <Plus size={16} strokeWidth={2.4} />
            Add Client
          </Link>
        </div>

        {/* Search + filter chips */}
        <div className="flex flex-col gap-3 mb-5">
          {/* Search */}
          <div className="relative max-w-md">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3] pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, BD or RM…"
              className="
                w-full h-10 pl-9 pr-9 rounded-xl
                bg-white border border-[#EAECF0]
                text-[13px] text-[#101828] placeholder:text-[#98A2B3]
                outline-none focus:border-[#0A1B3D]/40 focus:ring-2 focus:ring-[#0A1B3D]/10
                transition
              "
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#98A2B3] hover:text-[#475467] hover:bg-[#F2F4F7] transition"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {FILTER_TABS.map((tab) => {
              const active = filter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFilter(tab.value)}
                  className={filterPillCls(active)}
                  aria-pressed={active}
                >
                  {tab.value !== "all" && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        tab.value === "bd-progress"
                          ? "bg-[#F79009]"
                          : tab.value === "awaiting-rm"
                          ? "bg-[#3538CD]"
                          : "bg-[#12B76A]"
                      }`}
                    />
                  )}
                  {tab.label}
                  <span
                    className={`px-1.5 rounded-full text-[10.5px] font-semibold ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-[#F2F4F7] text-[#475467]"
                    }`}
                  >
                    {counts[tab.value] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Client cards */}
        {error && (
          <p className="text-sm text-[#D92D20] bg-[#FEF3F2] border border-[#FECDCA] rounded-xl px-3 py-2 mb-3">
            {error}
          </p>
        )}

        {loading ? (
          <ul className="space-y-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="h-[76px] rounded-2xl bg-white border border-[#EAECF0] animate-pulse"
              />
            ))}
          </ul>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#EAECF0] bg-white p-10 text-center">
            {clients.length === 0 ? (
              <>
                <p className="text-[14px] font-medium text-[#101828]">
                  No clients yet
                </p>
                <p className="text-[12.5px] text-[#667085] mt-1">
                  Get started by adding your first client.
                </p>
                <Link
                  href="/bd/clients/add"
                  className="inline-flex items-center gap-2 mt-4 h-9 px-4 rounded-lg bg-[#0A1B3D] hover:bg-[#0F2452] text-white text-[12.5px] font-medium transition"
                >
                  <Plus size={14} />
                  Add Client
                </Link>
              </>
            ) : (
              <>
                <p className="text-[14px] font-medium text-[#101828]">
                  No clients match your filters
                </p>
                <p className="text-[12.5px] text-[#667085] mt-1">
                  Try a different status or clear the search.
                </p>
              </>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {visible.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/bd/clients/${c.id}`}
                  className="
                    group flex items-center gap-4
                    bg-white border border-[#EAECF0]
                    rounded-2xl px-5 py-4
                    hover:border-[#D0D5DD]
                    shadow-[0_1px_2px_rgba(16,24,40,0.04)]
                    transition
                  "
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#0A1B3D] text-white flex items-center justify-center text-[12px] font-semibold shrink-0">
                    {initials(c.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold text-[#101828] truncate">
                        {c.name}
                      </p>
                      <StatusPill status={c.status} />
                    </div>
                    <p className="text-[12.5px] text-[#667085] mt-1 truncate">
                      {c.email}
                      <span className="mx-2 text-[#D0D5DD]">·</span>
                      <span className="text-[#3538CD] font-medium">BD:</span>{" "}
                      <span className="text-[#475467]">{c.bd_name}</span>
                      {c.rm_name && (
                        <>
                          <span className="mx-2 text-[#D0D5DD]">·</span>
                          <span className="text-[#C11574] font-medium">
                            RM:
                          </span>{" "}
                          <span className="text-[#475467]">{c.rm_name}</span>
                        </>
                      )}
                      {typeof c.goals_count === "number" && (
                        <>
                          <span className="mx-2 text-[#D0D5DD]">·</span>
                          <span className="text-[#475467]">
                            {c.goals_count} goals
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* View */}
                  <span className="inline-flex items-center gap-1 text-[13px] font-medium text-[#475467] group-hover:text-[#101828] transition">
                    View
                    <ChevronRight size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}
