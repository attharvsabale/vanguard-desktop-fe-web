"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Check } from "lucide-react";

import { useClientOnboarding } from "@/hooks/useClientOnboarding";
import { useOnboardingStore } from "@/store/onboardingStore";
import NomineesSection from "@/components/clients/onboarding/NomineesSection";
import {
  personalDetailsSchema,
  type PersonalDetailsFormValues,
  type PersonalDetailsPayload,
} from "@/schemas/onboarding";

interface PersonalDetailsStepProps {
  data?: Record<string, unknown>;
  onNext: () => void;
  onPrevious?: () => void;
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

const composeIsoDate = (d: string, m: string, y: string): string => {
  if (!d || !m || !y) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

// ── Reusable styles ─────────────────────────────────────────────────────────

const labelCls = "block text-[12.5px] font-medium text-[#344054] mb-1.5";
const inputCls =
  "w-full h-10 px-3.5 rounded-lg bg-[#F2F4F7] border border-transparent text-[13px] text-[#101828] placeholder:text-[#98A2B3] outline-none focus:bg-white focus:border-[#0A1B3D]/30 focus:ring-2 focus:ring-[#0A1B3D]/10 transition";
const selectCls =
  "h-10 px-3 rounded-lg bg-[#F2F4F7] border border-transparent text-[13px] text-[#344054] outline-none focus:bg-white focus:border-[#0A1B3D]/30 focus:ring-2 focus:ring-[#0A1B3D]/10 transition appearance-none";
const textareaCls =
  "w-full px-3.5 py-2.5 rounded-lg bg-[#F2F4F7] border border-transparent text-[13px] text-[#101828] placeholder:text-[#98A2B3] outline-none focus:bg-white focus:border-[#0A1B3D]/30 focus:ring-2 focus:ring-[#0A1B3D]/10 transition resize-y";
const errCls = "text-[11.5px] text-[#D92D20] mt-1";
const sectionTitleCls =
  "text-[11px] font-semibold tracking-[0.08em] text-[#667085] uppercase";

// ── Component ───────────────────────────────────────────────────────────────

export default function PersonalDetailsStep({
  onNext,
}: PersonalDetailsStepProps) {
  const { createPersonal, isLoading, error } = useClientOnboarding();
  const onboardingId = useOnboardingStore((s) => s.onboardingId);
  const [saved, setSaved] = useState<boolean>(Boolean(onboardingId));
  const [toast, setToast] = useState<{ title: string; body: string } | null>(
    null,
  );
  const [hasPendingNominee, setHasPendingNominee] = useState(false);
  const [nextWarning, setNextWarning] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<PersonalDetailsFormValues>({
    resolver: zodResolver(personalDetailsSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      full_name: "",
      rank: "",
      pan_no: "",
      exact_pan_name: "",
      dob: "",
      marriage_anniversary: "",
      occupation: "",
      email: "",
      annual_income: undefined,
      aadhaar_no: "",
      place_of_birth: "",
      current_address: "",
      contact_numbers: "",
      bank_name: "",
      savings_account_no: "",
      micr_code: "",
      ifsc_code: "",
      branch_address: "",
      mother_name: "",
      father_name: "",
      assigned_rm_id: "",
    },
  });

  // ── DOB & anniversary helpers ─────────────────────────────────────────────
  // Track the 3 parts as local state so each select keeps its own value
  // independently. We only push the composed ISO date into the form value
  // (which triggers validation) when all three parts are filled.
  const [dobParts, setDobParts] = useState({ d: "", m: "", y: "" });
  const [annParts, setAnnParts] = useState({ d: "", m: "", y: "" });

  const setDob = (next: Partial<typeof dobParts>) => {
    const merged = { ...dobParts, ...next };
    setDobParts(merged);
    setValue("dob", composeIsoDate(merged.d, merged.m, merged.y), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };
  const setAnn = (next: Partial<typeof annParts>) => {
    const merged = { ...annParts, ...next };
    setAnnParts(merged);
    setValue(
      "marriage_anniversary",
      composeIsoDate(merged.d, merged.m, merged.y),
      {
        shouldDirty: true,
      },
    );
  };

  const days = useMemo(
    () => Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")),
    [],
  );
  const yearsBirth = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 90 }, (_, i) => String(now - 18 - i));
  }, []);
  const yearsAnn = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 70 }, (_, i) => String(now - i));
  }, []);

  const onSubmit = async (values: PersonalDetailsFormValues) => {
    try {
      const payload = personalDetailsSchema.parse(
        values,
      ) as PersonalDetailsPayload;
      await createPersonal(payload);
      setSaved(true);
      setToast({
        title: "Personal details saved",
        body: "You can now add nominees below.",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleNext = () => {
    if (!saved) {
      setNextWarning("Please save personal details before continuing.");
      return;
    }
    if (hasPendingNominee) {
      setNextWarning(
        "You have an unsaved nominee. Save it or remove the row before continuing.",
      );
      return;
    }
    setNextWarning(null);
    onNext();
  };

  const canProceed = saved && !hasPendingNominee;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
      {/* Card */}
      <div className="bg-white border border-[#EAECF0] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <h2 className="text-[15px] font-semibold text-[#101828] mb-5">
          Applicant Details
        </h2>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className={labelCls}>Full Name *</label>
            <input
              type="text"
              placeholder="As per PAN card"
              maxLength={255}
              autoComplete="name"
              className={inputCls}
              {...register("full_name", {
                onChange: (e) => {
                  // Allow only letters, spaces, . ' -
                  e.target.value = e.target.value.replace(
                    /[^A-Za-z .'\-]/g,
                    "",
                  );
                },
              })}
            />
            {errors.full_name && (
              <p className={errCls}>{errors.full_name.message}</p>
            )}
          </div>

          {/* Rank / Designation */}
          <div>
            <label className={labelCls}>Rank / Designation</label>
            <input
              type="text"
              placeholder="e.g. Col. — add date of retirement if applicable"
              maxLength={120}
              className={inputCls}
              {...register("rank")}
            />
          </div>

          {/* PAN */}
          <div>
            <label className={labelCls}>PAN No. *</label>
            <input
              type="text"
              placeholder="ABCDE1234F"
              maxLength={10}
              autoComplete="off"
              spellCheck={false}
              className={`${inputCls} uppercase tracking-wider`}
              {...register("pan_no", {
                onChange: (e) => {
                  // Force uppercase + alphanumerics only.
                  e.target.value = e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 10);
                },
              })}
            />
            {errors.pan_no && <p className={errCls}>{errors.pan_no.message}</p>}
          </div>

          {/* Exact PAN Name */}
          <div>
            <label className={labelCls}>EXACT Name on PAN Card *</label>
            <input
              type="text"
              placeholder="Name exactly as printed on PAN card"
              maxLength={255}
              className={inputCls}
              {...register("exact_pan_name", {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(
                    /[^A-Za-z .'\-]/g,
                    "",
                  );
                },
              })}
            />
            <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-[#B54708]">
              <AlertCircle size={13} />
              <span>
                Investments will be done as per the exact name on your PAN card
                only
              </span>
            </div>
            <p className="text-[11.5px] text-[#98A2B3] mt-0.5">
              Name exactly as printed on PAN card — this is how investments will
              be registered
            </p>
            {errors.exact_pan_name && (
              <p className={errCls}>{errors.exact_pan_name.message}</p>
            )}
          </div>

          {/* DOB + Marriage Anniversary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date of Birth *</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  className={selectCls}
                  value={dobParts.d}
                  onChange={(e) => setDob({ d: e.target.value })}
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
                  value={dobParts.m}
                  onChange={(e) => setDob({ m: e.target.value })}
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
                  value={dobParts.y}
                  onChange={(e) => setDob({ y: e.target.value })}
                >
                  <option value="">Year</option>
                  {yearsBirth.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              {errors.dob && <p className={errCls}>{errors.dob.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Marriage Anniversary</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  className={selectCls}
                  value={annParts.d}
                  onChange={(e) => setAnn({ d: e.target.value })}
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
                  value={annParts.m}
                  onChange={(e) => setAnn({ m: e.target.value })}
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
                  value={annParts.y}
                  onChange={(e) => setAnn({ y: e.target.value })}
                >
                  <option value="">Year</option>
                  {yearsAnn.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Occupation + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Occupation</label>
              <input
                type="text"
                placeholder="e.g. Army Officer, Business Owner, Retired"
                maxLength={120}
                className={inputCls}
                {...register("occupation")}
              />
            </div>
            <div>
              <label className={labelCls}>Email ID *</label>
              <input
                type="email"
                placeholder="email@example.com"
                maxLength={254}
                autoComplete="email"
                spellCheck={false}
                className={`${inputCls} lowercase`}
                {...register("email", {
                  onChange: (e) => {
                    e.target.value = e.target.value
                      .replace(/\s/g, "")
                      .toLowerCase();
                  },
                })}
              />
              {errors.email && <p className={errCls}>{errors.email.message}</p>}
            </div>
          </div>

          {/* Annual Income + Aadhaar */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Annual Income *</label>
              <Controller
                name="annual_income"
                control={control}
                render={({ field }) => (
                  <input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    placeholder="₹  0"
                    className={inputCls}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      // Block negatives / exponent / scientific notation.
                      if (/[eE+\-]/.test(v)) return;
                      field.onChange(v === "" ? undefined : Number(v));
                    }}
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-"].includes(e.key))
                        e.preventDefault();
                    }}
                    onBlur={field.onBlur}
                  />
                )}
              />
              {errors.annual_income && (
                <p className={errCls}>{errors.annual_income.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Aadhar No. *</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                autoComplete="off"
                placeholder="123456789012"
                className={inputCls}
                {...register("aadhaar_no", {
                  onChange: (e) => {
                    e.target.value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 12);
                  },
                })}
              />
              {errors.aadhaar_no && (
                <p className={errCls}>{errors.aadhaar_no.message}</p>
              )}
            </div>
          </div>

          {/* Place of Birth */}
          <div>
            <label className={labelCls}>Place of Birth *</label>
            <input
              type="text"
              placeholder="City / Town"
              maxLength={120}
              className={`${inputCls} max-w-[50%]`}
              {...register("place_of_birth")}
            />
            {errors.place_of_birth && (
              <p className={errCls}>{errors.place_of_birth.message}</p>
            )}
          </div>

          {/* Current Address */}
          <div>
            <label className={labelCls}>Current Address with PIN Code *</label>
            <textarea
              placeholder="Door no., Street, City — PIN Code"
              rows={3}
              maxLength={500}
              className={textareaCls}
              {...register("current_address")}
            />
            <p className="text-[11.5px] text-[#98A2B3] mt-1">
              Where you would like to receive your Mutual Fund correspondence
            </p>
            {errors.current_address && (
              <p className={errCls}>{errors.current_address.message}</p>
            )}
          </div>

          {/* Contact Numbers */}
          <div>
            <label className={labelCls}>Contact Numbers *</label>
            <textarea
              placeholder="Mobile, residence and office numbers — include STD code where required"
              rows={3}
              maxLength={200}
              className={textareaCls}
              {...register("contact_numbers", {
                onChange: (e) => {
                  // Allow digits, spaces, + - / ( ) and commas only.
                  e.target.value = e.target.value.replace(
                    /[^\d\s+\-/(),]/g,
                    "",
                  );
                },
              })}
            />
            {errors.contact_numbers && (
              <p className={errCls}>{errors.contact_numbers.message}</p>
            )}
          </div>

          {/* Bank section */}
          <div className="pt-3 border-t border-[#EAECF0]">
            <p className={sectionTitleCls}>
              BANK ACCOUNT FOR INVESTMENTS &amp; REDEMPTIONS
            </p>
            <p className="text-[11.5px] text-[#98A2B3] mt-1.5 mb-3">
              This will be your primary bank account. All redemptions will be
              credited here. Cheques sent with investment forms must be from
              this bank only.
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Name of Bank *</label>
                  <input
                    type="text"
                    placeholder="e.g. State Bank of India"
                    maxLength={120}
                    className={inputCls}
                    {...register("bank_name")}
                  />
                  {errors.bank_name && (
                    <p className={errCls}>{errors.bank_name.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Savings Account No. *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={20}
                    autoComplete="off"
                    placeholder="Account number"
                    className={inputCls}
                    {...register("savings_account_no", {
                      onChange: (e) => {
                        e.target.value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 20);
                      },
                    })}
                  />
                  {errors.savings_account_no && (
                    <p className={errCls}>
                      {errors.savings_account_no.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>MICR Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="000000000"
                    className={inputCls}
                    {...register("micr_code", {
                      onChange: (e) => {
                        e.target.value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 9);
                      },
                    })}
                  />
                  <p className="text-[11.5px] text-[#98A2B3] mt-1">
                    9-digit code on your cheque, immediately to the right of the
                    cheque number
                  </p>
                  {errors.micr_code && (
                    <p className={errCls}>{errors.micr_code.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelCls}>IFSC Code</label>
                  <input
                    type="text"
                    maxLength={11}
                    spellCheck={false}
                    placeholder="SBIN0004384"
                    className={`${inputCls} uppercase tracking-wider`}
                    {...register("ifsc_code", {
                      onChange: (e) => {
                        e.target.value = e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 11);
                      },
                    })}
                  />
                  <p className="text-[11.5px] text-[#98A2B3] mt-1">
                    11-digit alphanumeric code — e.g. SBIN0004384. If unknown,
                    leave blank but provide correct branch address.
                  </p>
                  {errors.ifsc_code && (
                    <p className={errCls}>{errors.ifsc_code.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Branch Address with PIN Code *
                </label>
                <textarea
                  placeholder="Bank branch address with PIN code"
                  rows={2}
                  maxLength={500}
                  className={textareaCls}
                  {...register("branch_address")}
                />
                {errors.branch_address && (
                  <p className={errCls}>{errors.branch_address.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Family section */}
          <div className="pt-3 border-t border-[#EAECF0]">
            <p className={sectionTitleCls}>FAMILY</p>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className={labelCls}>Mother&apos;s Name *</label>
                <input
                  type="text"
                  placeholder="Full name"
                  maxLength={255}
                  className={inputCls}
                  {...register("mother_name", {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(
                        /[^A-Za-z .'\-]/g,
                        "",
                      );
                    },
                  })}
                />
                {errors.mother_name && (
                  <p className={errCls}>{errors.mother_name.message}</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Father&apos;s Name *</label>
                <input
                  type="text"
                  placeholder="Full name"
                  maxLength={255}
                  className={inputCls}
                  {...register("father_name", {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(
                        /[^A-Za-z .'\-]/g,
                        "",
                      );
                    },
                  })}
                />
                {errors.father_name && (
                  <p className={errCls}>{errors.father_name.message}</p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-[#D92D20] bg-[#FEF3F2] border border-[#FECDCA] rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Card footer */}
        <div className="mt-6 pt-4 border-t border-[#EAECF0] flex items-center justify-between">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[#067647]">
              <Check size={14} />
              Personal details saved
            </span>
          ) : isDirty && !isValid ? (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-[#B42318]">
              <AlertCircle size={13} />
              Some fields need attention — see highlighted errors above
            </span>
          ) : (
            <span className="text-[12px] text-[#667085]">
              Fill all required fields (*) above, then save to proceed
            </span>
          )}
          <button
            type="submit"
            disabled={isLoading || !isValid}
            aria-invalid={isDirty && !isValid}
            className={`
              inline-flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] font-medium
              transition-[background-color,box-shadow,border-color] duration-300
              border
              ${
                isLoading || !isValid
                  ? isDirty && !isValid
                    ? "bg-[#98A2B3] text-white cursor-not-allowed border-[#FDA29B] shadow-[0_0_0_3px_rgba(217,45,32,0.12)] animate-[pulse-error_2s_ease-in-out_infinite]"
                    : "bg-[#98A2B3] text-white cursor-not-allowed border-transparent"
                  : saved
                    ? "bg-[#1FAD91] hover:bg-[#188A75] text-white border-transparent"
                    : "bg-[#0A1B3D] hover:bg-[#0F2452] text-white border-transparent"
              }
            `}
          >
            <Check size={14} />
            {isLoading
              ? "Saving..."
              : saved
                ? "Re-save Personal Details"
                : "Save Personal Details"}
          </button>
        </div>

        {/* Nominees — only shown after personal details saved */}
        {saved && onboardingId && (
          <NomineesSection
            onboardingId={onboardingId}
            onPendingChange={setHasPendingNominee}
          />
        )}
      </div>

      {/* Page-level footer (Cancel / Step / Save & Next) */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          className="
            inline-flex items-center gap-1.5 h-10 px-4 rounded-xl
            border border-[#D0D5DD] bg-white
            text-[13px] font-medium text-[#344054]
            hover:bg-[#F9FAFB] transition
          "
          onClick={() => history.back()}
        >
          <span aria-hidden>‹</span> Cancel
        </button>

        <span className="text-[12.5px] text-[#667085]">Step 1 of 5</span>

        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          aria-disabled={!canProceed}
          title={
            !saved
              ? "Save personal details first"
              : hasPendingNominee
                ? "Save or remove the unsaved nominee first"
                : ""
          }
          className={`
            inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-medium transition
            ${
              !canProceed
                ? "bg-[#98A2B3] text-white cursor-not-allowed"
                : "bg-[#0A1B3D] hover:bg-[#0F2452] text-white"
            }
          `}
        >
          <Check size={14} />
          Save &amp; Next
        </button>
      </div>

      {nextWarning && !canProceed && (
        <div
          role="alert"
          className="
            mt-2 text-[12px] text-[#B54708]
            bg-[#FFFAEB] border border-[#FEDF89]
            rounded-lg px-3 py-2
          "
        >
          {nextWarning}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="
            fixed bottom-6 right-6 z-50
            bg-white border border-[#EAECF0] rounded-xl
            shadow-[0_8px_24px_rgba(16,24,40,0.12)]
            px-4 py-3 min-w-[260px] max-w-[340px]
          "
        >
          <p className="text-[13px] font-semibold text-[#101828]">
            {toast.title}
          </p>
          <p className="text-[12.5px] text-[#667085] mt-0.5">{toast.body}</p>
        </div>
      )}
    </form>
  );
}
