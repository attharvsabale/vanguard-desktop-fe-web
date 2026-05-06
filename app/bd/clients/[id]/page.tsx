"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import AppLayout from "@/layouts/AppLayout";
import StatusPill from "@/components/clients/StatusPill";
import {
  listClients,
  type ClientListItem,
} from "@/services/clientsService";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClientDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [client, setClient] = useState<ClientListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listClients()
      .then((list) => {
        if (cancelled) return;
        const match = list.find((c) => c.id === id) ?? null;
        setClient(match);
        if (!match) setError("Client not found");
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Failed to load client");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <AppLayout>
      <div className="max-w-[900px] mx-auto">
        <Link
          href="/bd/clients"
          className="inline-flex items-center gap-2 text-[13px] text-[#475467] hover:text-[#101828] transition mb-4"
        >
          <ArrowLeft size={14} />
          Back to Clients
        </Link>

        {loading ? (
          <div className="h-[120px] rounded-2xl bg-white border border-[#EAECF0] animate-pulse" />
        ) : error || !client ? (
          <div className="rounded-2xl border border-dashed border-[#EAECF0] bg-white p-10 text-center">
            <p className="text-[14px] font-medium text-[#101828]">
              {error || "Client not found"}
            </p>
            <Link
              href="/bd/clients"
              className="inline-flex items-center gap-2 mt-4 h-9 px-4 rounded-lg bg-[#0A1B3D] hover:bg-[#0F2452] text-white text-[12.5px] font-medium transition"
            >
              Back to Clients
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white border border-[#EAECF0] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-[24px] leading-tight font-semibold text-[#0A1B3D]">
                    {client.name}
                  </h1>
                  <p className="text-[13px] text-[#667085] mt-1">
                    {client.email}
                  </p>
                </div>
                <StatusPill status={client.status} />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.08em] text-[#667085] uppercase">
                    BD
                  </p>
                  <p className="text-[13px] text-[#101828] mt-1">
                    {client.bd_name}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.08em] text-[#667085] uppercase">
                    RM
                  </p>
                  <p className="text-[13px] text-[#101828] mt-1">
                    {client.rm_name ?? "Not assigned"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-[#EAECF0] bg-white p-8 text-center">
              <p className="text-[13px] text-[#667085]">
                Detailed client view coming soon.
              </p>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
