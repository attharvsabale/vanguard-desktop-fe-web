"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";

import AppLayout from "@/layouts/AppLayout";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function AddClientPage() {
  const router = useRouter();
  const resetOnboarding = useOnboardingStore((s) => s.resetOnboarding);

  const startManualEntry = () => {
    // Always begin a fresh client at step 1 — clears any stale persisted state.
    resetOnboarding();
    router.push("/bd/clients/add/manual");
  };

  return (
    <AppLayout>
      <div className="max-w-[760px] mx-auto pt-2">
        {/* Header row: back arrow + title + BD pill, with subtitle indented */}
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Back"
              onClick={() => router.push("/bd/clients")}
              className="
                inline-flex items-center justify-center
                w-8 h-8 rounded-lg
                text-[#667085]
                hover:bg-[#1FAD91] hover:text-white
                active:bg-[#188A75] active:text-white
                transition
              "
            >
              <ArrowLeft size={18} />
            </button>

            <h1 className="text-[22px] leading-tight font-semibold text-[#0A1B3D]">
              New Client — BD Form
            </h1>

            <span className="bg-[#EEF4FF] text-[#3538CD] text-[10px] font-semibold tracking-wide px-2 py-[2px] rounded-full">
              BD
            </span>
          </div>

          <p className="text-[#667085] text-[13px] mt-1.5 ml-[30px]">
            Fill in all sections, then submit to Relationship Manager
          </p>
        </div>

        {/* Selection Card */}
        <div className="bg-white border border-[#EAECF0] rounded-2xl p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <p className="text-[13px] text-[#344054] mb-4">
            How would you like to fill the client data?
          </p>

          {/* Upload (compact, auto width) */}
          <button
            type="button"
            className="
              inline-flex items-center gap-2
              h-10 px-4
              border border-[#D0D5DD]
              rounded-xl
              text-[13px] font-medium text-[#101828]
              bg-white hover:bg-[#F9FAFB]
              transition
            "
          >
            <FileText size={16} className="text-[#475467]" />
            Upload client document
          </button>

          {/* Divider with "or" */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#EAECF0]" />
            <span className="text-[12px] text-[#98A2B3]">or</span>
            <div className="flex-1 h-px bg-[#EAECF0]" />
          </div>

          {/* Fill manually (full width) */}
          <Link
            href="/bd/clients/add/manual"
            onClick={(e) => {
              e.preventDefault();
              startManualEntry();
            }}
            className="
              flex items-center justify-center
              w-full h-11
              border border-[#D0D5DD]
              rounded-xl
              text-[13px] font-medium text-[#101828]
              bg-white
              hover:bg-[#1FAD91] hover:text-white hover:border-[#1FAD91]
              transition
            "
          >
            Fill manually
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
