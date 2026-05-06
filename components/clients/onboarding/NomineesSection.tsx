"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import {
  nomineeSchema,
  RELATIONSHIPS,
  type NomineeFormValues,
  type NomineePayload,
} from "@/schemas/onboarding";
import {
  addNominee as apiAddNominee,
  deleteNominee as apiDeleteNominee,
} from "@/services/onboardingService";

interface NomineesSectionProps {
  onboardingId: string;
  /** Called whenever there are dirty/unsaved nominee rows. */
  onPendingChange?: (hasPending: boolean) => void;
}

interface NomineeRow {
  /** Server id once persisted; client-only id otherwise. */
  id: string;
  /** Whether this row has been saved to backend. */
  saved: boolean;
  values: NomineeFormValues;
  expanded: boolean;
  errors: Partial<Record<keyof NomineeFormValues, string>>;
  saving: boolean;
  serverError: string | null;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const labelCls = "block text-[12.5px] font-medium text-[#344054] mb-1.5";
const inputCls =
  "w-full h-10 px-3.5 rounded-lg bg-[#F9FAFB] border border-[#EAECF0] text-[13px] text-[#101828] placeholder:text-[#98A2B3] outline-none focus:bg-white focus:border-[#0A1B3D]/30 focus:ring-2 focus:ring-[#0A1B3D]/10 transition";
const selectCls =
  "h-10 px-3 rounded-lg bg-[#F9FAFB] border border-[#EAECF0] text-[13px] text-[#344054] outline-none focus:bg-white focus:border-[#0A1B3D]/30 focus:ring-2 focus:ring-[#0A1B3D]/10 transition appearance-none w-full";
const textareaCls =
  "w-full px-3.5 py-2.5 rounded-lg bg-[#F9FAFB] border border-[#EAECF0] text-[13px] text-[#101828] placeholder:text-[#98A2B3] outline-none focus:bg-white focus:border-[#0A1B3D]/30 focus:ring-2 focus:ring-[#0A1B3D]/10 transition resize-y";
const errCls = "text-[11.5px] text-[#D92D20] mt-1";

const emptyNominee = (): NomineeFormValues => ({
  name: "",
  dob: "",
  contact_no: "",
  email: "",
  relationship: "Spouse",
  pan_no: "",
  address: "",
});

const newRow = (): NomineeRow => ({
  id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  saved: false,
  values: emptyNominee(),
  expanded: true,
  errors: {},
  saving: false,
  serverError: null,
});

export default function NomineesSection({
  onboardingId,
  onPendingChange,
}: NomineesSectionProps) {
  const [rows, setRows] = useState<NomineeRow[]>([newRow()]);

  // A row is "pending" if the user typed anything but hasn't saved it.
  useEffect(() => {
    const hasPending = rows.some((r) => {
      if (r.saved) return false;
      const v = r.values;
      return Boolean(
        v.name?.trim() ||
        v.dob ||
        v.contact_no?.trim() ||
        v.email?.trim() ||
        v.pan_no?.trim() ||
        v.address?.trim(),
      );
    });
    onPendingChange?.(hasPending);
  }, [rows, onPendingChange]);

  const updateRow = (id: string, patch: Partial<NomineeRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const updateValue = <K extends keyof NomineeFormValues>(
    id: string,
    key: K,
    value: NomineeFormValues[K],
  ) =>
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              values: { ...r.values, [key]: value },
              errors: { ...r.errors, [key]: undefined },
            }
          : r,
      ),
    );

  const handleAdd = () => {
    if (rows.length >= 3) return;
    setRows((prev) => [
      ...prev.map((r) => ({ ...r, expanded: false })),
      newRow(),
    ]);
  };

  const handleRemove = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    if (row.saved) {
      try {
        await apiDeleteNominee(onboardingId, row.id);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to remove nominee";
        updateRow(id, { serverError: message });
        return;
      }
    }
    setRows((prev) =>
      prev.length === 1 ? [newRow()] : prev.filter((r) => r.id !== id),
    );
  };

  const handleSave = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    const parsed = nomineeSchema.safeParse(row.values);
    if (!parsed.success) {
      const fieldErrors: NomineeRow["errors"] = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof NomineeFormValues;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      updateRow(id, { errors: fieldErrors });
      return;
    }

    updateRow(id, { saving: true, serverError: null });
    try {
      const payload = parsed.data as NomineePayload;
      const res = await apiAddNominee(onboardingId, payload);
      updateRow(id, {
        id: res.id,
        saved: true,
        saving: false,
        expanded: false,
        errors: {},
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save nominee";
      updateRow(id, { saving: false, serverError: message });
    }
  };

  return (
    <section className="mt-8">
      <p className="text-[11px] font-semibold tracking-[0.08em] text-[#667085] uppercase mb-3">
        Nominees
      </p>

      <div className="bg-[#F0F6FF] border border-[#D1E0FF] rounded-xl px-4 py-3 mb-3 text-[12.5px] text-[#1849A9]">
        Investments will be in a single name. Preferably have your spouse as the
        sole nominee. You can have up to 3 nominees. Nomination can be amended
        anytime.
      </div>

      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div
            key={row.id}
            className="border border-[#EAECF0] rounded-xl bg-white"
          >
            {/* Header */}
            <button
              type="button"
              onClick={() => updateRow(row.id, { expanded: !row.expanded })}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-[13px] font-semibold text-[#101828]">
                Nominee {idx + 1}
                {row.saved && (
                  <span className="ml-2 text-[11px] font-medium text-[#067647]">
                    ✓ Saved
                  </span>
                )}
              </span>
              {row.expanded ? (
                <ChevronUp size={16} className="text-[#667085]" />
              ) : (
                <ChevronDown size={16} className="text-[#667085]" />
              )}
            </button>

            {row.expanded && (
              <div className="px-4 pb-4 pt-0 space-y-4">
                {/* Name */}
                <div>
                  <label className={labelCls}>Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    maxLength={255}
                    className={inputCls}
                    value={row.values.name}
                    onChange={(e) =>
                      updateValue(
                        row.id,
                        "name",
                        e.target.value.replace(/[^A-Za-z .'\-]/g, ""),
                      )
                    }
                  />
                  {row.errors.name && (
                    <p className={errCls}>{row.errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* DOB */}
                  <NomineeDob
                    value={row.values.dob ?? ""}
                    onChange={(v) => updateValue(row.id, "dob", v)}
                  />

                  {/* Contact */}
                  <div>
                    <label className={labelCls}>Contact Number</label>
                    <input
                      type="text"
                      inputMode="tel"
                      placeholder="+91 98765 43210"
                      maxLength={50}
                      className={inputCls}
                      value={row.values.contact_no ?? ""}
                      onChange={(e) =>
                        updateValue(
                          row.id,
                          "contact_no",
                          e.target.value.replace(/[^\d\s+\-/(),]/g, ""),
                        )
                      }
                    />
                    {row.errors.contact_no && (
                      <p className={errCls}>{row.errors.contact_no}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className={labelCls}>Email ID</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      maxLength={254}
                      className={`${inputCls} lowercase`}
                      value={row.values.email ?? ""}
                      onChange={(e) =>
                        updateValue(
                          row.id,
                          "email",
                          e.target.value.replace(/\s/g, "").toLowerCase(),
                        )
                      }
                    />
                    {row.errors.email && (
                      <p className={errCls}>{row.errors.email}</p>
                    )}
                  </div>

                  {/* Relationship */}
                  <div>
                    <label className={labelCls}>Relationship</label>
                    <select
                      className={selectCls}
                      value={row.values.relationship}
                      onChange={(e) =>
                        updateValue(
                          row.id,
                          "relationship",
                          e.target.value as NomineeFormValues["relationship"],
                        )
                      }
                    >
                      {RELATIONSHIPS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    {row.errors.relationship && (
                      <p className={errCls}>{row.errors.relationship}</p>
                    )}
                  </div>
                </div>

                {/* PAN */}
                <div>
                  <label className={labelCls}>Nominee PAN Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    spellCheck={false}
                    placeholder="ABCDE1234F"
                    className={`${inputCls} uppercase tracking-wider`}
                    value={row.values.pan_no ?? ""}
                    onChange={(e) =>
                      updateValue(
                        row.id,
                        "pan_no",
                        e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 10),
                      )
                    }
                  />
                  {row.errors.pan_no && (
                    <p className={errCls}>{row.errors.pan_no}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className={labelCls}>Address</label>
                  <textarea
                    placeholder="Nominee's address"
                    rows={3}
                    maxLength={500}
                    className={textareaCls}
                    value={row.values.address ?? ""}
                    onChange={(e) =>
                      updateValue(row.id, "address", e.target.value)
                    }
                  />
                  {row.errors.address && (
                    <p className={errCls}>{row.errors.address}</p>
                  )}
                </div>

                {row.serverError && (
                  <p className="text-[12px] text-[#D92D20] bg-[#FEF3F2] border border-[#FECDCA] rounded-lg px-3 py-2">
                    {row.serverError}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => handleRemove(row.id)}
                    className="inline-flex items-center gap-1.5 text-[12.5px] text-[#B42318] hover:text-[#7A271A] transition"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>

                  <button
                    type="button"
                    disabled={row.saving}
                    onClick={() => handleSave(row.id)}
                    className={`
                      inline-flex items-center gap-2 h-9 px-4 rounded-lg text-[12.5px] font-medium transition
                      ${
                        row.saving
                          ? "bg-[#98A2B3] text-white cursor-not-allowed"
                          : row.saved
                            ? "bg-[#1FAD91] hover:bg-[#188A75] text-white"
                            : "bg-[#0A1B3D] hover:bg-[#0F2452] text-white"
                      }
                    `}
                  >
                    {row.saving
                      ? "Saving..."
                      : row.saved
                        ? "Re-save Nominee"
                        : "Save Nominee"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={rows.length >= 3}
        className={`
          mt-3 inline-flex items-center gap-2 h-9 px-3.5 rounded-lg
          border border-[#D0D5DD] bg-white text-[13px] font-medium text-[#344054]
          transition
          ${rows.length >= 3 ? "opacity-50 cursor-not-allowed" : "hover:bg-[#F9FAFB]"}
        `}
      >
        <Plus size={14} />
        Add Nominee
      </button>
      {rows.length >= 3 && (
        <p className="text-[11.5px] text-[#98A2B3] mt-1.5">
          Maximum 3 nominees allowed.
        </p>
      )}
    </section>
  );
}

// ── DOB sub-component ──────────────────────────────────────────────────────

function NomineeDob({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  // Keep partial selections in local state so individual pickers "stick"
  // even before all three (day/month/year) have been chosen.
  const [parts, setParts] = useState(() =>
    value && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? { y: value.slice(0, 4), m: value.slice(5, 7), d: value.slice(8, 10) }
      : { y: "", m: "", d: "" },
  );

  // Sync from parent when the ISO value changes externally (e.g. reset).
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      setParts({
        y: value.slice(0, 4),
        m: value.slice(5, 7),
        d: value.slice(8, 10),
      });
    } else if (!value) {
      setParts({ y: "", m: "", d: "" });
    }
  }, [value]);

  const set = (next: Partial<typeof parts>) => {
    const merged = { ...parts, ...next };
    setParts(merged);
    if (merged.d && merged.m && merged.y) {
      onChange(`${merged.y}-${merged.m}-${merged.d}`);
    } else {
      onChange("");
    }
  };

  const days = Array.from({ length: 31 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );
  const now = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(now - i));

  return (
    <div>
      <label className={labelCls}>Date of Birth</label>
      <div className="grid grid-cols-3 gap-2">
        <select
          className={selectCls}
          value={parts.d}
          onChange={(e) => set({ d: e.target.value })}
        >
          <option value="">Day</option>
          {days.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select
          className={selectCls}
          value={parts.m}
          onChange={(e) => set({ m: e.target.value })}
        >
          <option value="">Month</option>
          {MONTHS.map((label, i) => (
            <option key={label} value={String(i + 1).padStart(2, "0")}>
              {label}
            </option>
          ))}
        </select>
        <select
          className={selectCls}
          value={parts.y}
          onChange={(e) => set({ y: e.target.value })}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
