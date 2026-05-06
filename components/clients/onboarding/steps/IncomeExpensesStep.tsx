"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, AlertCircle } from "lucide-react";

import { useOnboardingStore } from "@/store/onboardingStore";
import {
  incomeExpensesSchema,
  type IncomeExpensesFormValues,
  type IncomeExpensesPayload,
} from "@/schemas/onboarding";
import { saveIncomeExpenses } from "@/services/onboardingService";

interface IncomeExpensesStepProps {
  onNext: () => void;
  onPrevious?: () => void;
}

// ── Reusable styles (kept identical to PersonalDetailsStep) ─────────────────

const labelCls = "block text-[12.5px] font-medium text-[#344054] mb-1.5";
const inputCls =
  "w-full h-11 px-3.5 rounded-lg bg-[#F2F4F7] border border-transparent text-[14px] text-[#101828] placeholder:text-[#98A2B3] outline-none focus:bg-white focus:border-[#0A1B3D]/30 focus:ring-2 focus:ring-[#0A1B3D]/10 transition";
const errCls = "text-[11.5px] text-[#D92D20] mt-1";

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

// ── Component ───────────────────────────────────────────────────────────────

export default function IncomeExpensesStep({
  onNext,
  onPrevious,
}: IncomeExpensesStepProps) {
  const onboardingId = useOnboardingStore((s) => s.onboardingId);
  const completedSteps = useOnboardingStore((s) => s.completedSteps);
  const markStepCompleted = useOnboardingStore((s) => s.markStepCompleted);
  const saveDraftData = useOnboardingStore((s) => s.saveDraftData);
  const draftData = useOnboardingStore((s) => s.draftData);

  const persistedDraft = (draftData["income-expenses"] ??
    null) as IncomeExpensesFormValues | null;

  const [saved, setSaved] = useState<boolean>(
    completedSteps.includes("income-expenses"),
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(
    null,
  );
  const [nextWarning, setNextWarning] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<IncomeExpensesFormValues>({
    resolver: zodResolver(incomeExpensesSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: persistedDraft ?? {},
  });

  const watched = useWatch({ control });

  const totals = useMemo(() => {
    const toNum = (v: unknown) => {
      const n =
        typeof v === "number" ? v : v === "" || v == null ? 0 : Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const income = toNum((watched as Record<string, unknown>)?.monthly_income);
    const expenses = toNum(
      (watched as Record<string, unknown>)?.monthly_expenses,
    );
    const surplus = income - expenses;
    return { income, expenses, surplus, hasInput: income > 0 || expenses > 0 };
  }, [watched]);

  const onSubmit = async (values: IncomeExpensesFormValues) => {
    if (!onboardingId) {
      setServerError(
        "No onboarding session found. Please complete Personal Details first.",
      );
      return;
    }
    try {
      setServerError(null);
      const payload = incomeExpensesSchema.parse(
        values,
      ) as IncomeExpensesPayload;
      await saveIncomeExpenses(onboardingId, payload);
      saveDraftData("income-expenses", values);
      markStepCompleted("income-expenses");
      setSaved(true);
      setToast({
        title: "Income & expenses saved",
        body: "Moving you to the next step.",
      });
      // Auto-advance after a brief pause so the toast is visible.
      setTimeout(() => onNext(), 600);
    } catch (err) {
      console.error(err);
      setServerError(
        err instanceof Error ? err.message : "Failed to save income & expenses",
      );
    }
  };

  const onInvalid = () => {
    setNextWarning("Please fix the highlighted fields before continuing.");
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      noValidate
      className="space-y-3"
    >
      {/* Card */}
      <div className="bg-white border border-[#EAECF0] rounded-2xl p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <h2 className="text-[15px] font-semibold text-[#101828] mb-1.5">
          Income / Expenses
        </h2>
        <p className="text-[12.5px] text-[#667085] mb-5">
          Other details to help us prepare your portfolio. You may leave fields
          blank if you do not have details currently.
        </p>

        {/* Monthly Income [A] */}
        <div className="mb-5">
          <label className={labelCls}>
            Approximate Monthly Income{" "}
            <span className="text-[#667085] font-normal">[A]</span>
          </label>
          <Controller
            name="monthly_income"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#98A2B3] pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  placeholder="0"
                  className={`${inputCls} pl-8`}
                  value={
                    field.value === undefined || field.value === null
                      ? ""
                      : (field.value as number | string)
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/[eE+\-]/.test(v)) return;
                    field.onChange(v === "" ? undefined : Number(v));
                  }}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key))
                      e.preventDefault();
                  }}
                  onBlur={field.onBlur}
                />
              </div>
            )}
          />
          <p className="text-[11.5px] text-[#98A2B3] mt-1.5">
            From salary, pension, rent, business, agriculture, spouse earnings,
            interest from FDs and other investments etc. — total monthly
            received in the family
          </p>
          {errors.monthly_income?.message && (
            <p className={errCls}>{errors.monthly_income.message}</p>
          )}
        </div>

        {/* Monthly Expenses [B] */}
        <div className="mb-5">
          <label className={labelCls}>
            Approximate Monthly Expenses{" "}
            <span className="text-[#667085] font-normal">[B]</span>
          </label>
          <Controller
            name="monthly_expenses"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#98A2B3] pointer-events-none">
                  ₹
                </span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  placeholder="0"
                  className={`${inputCls} pl-8`}
                  value={
                    field.value === undefined || field.value === null
                      ? ""
                      : (field.value as number | string)
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/[eE+\-]/.test(v)) return;
                    field.onChange(v === "" ? undefined : Number(v));
                  }}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-"].includes(e.key))
                      e.preventDefault();
                  }}
                  onBlur={field.onBlur}
                />
              </div>
            )}
          />
          <p className="text-[11.5px] text-[#98A2B3] mt-1.5">
            Household, children, car, medical, insurance premiums etc.
          </p>
          {errors.monthly_expenses?.message && (
            <p className={errCls}>{errors.monthly_expenses.message}</p>
          )}
        </div>

        {/* Total Investible Surplus [A-B] */}
        <div
          className={`
            flex items-center justify-between
            rounded-xl border px-4 h-12
            ${
              totals.hasInput
                ? totals.surplus >= 0
                  ? "border-[#A6F4C5] bg-[#ECFDF3]"
                  : "border-[#FECDCA] bg-[#FEF3F2]"
                : "border-[#EAECF0] bg-[#F9FAFB]"
            }
          `}
        >
          <span className="text-[13px] font-medium text-[#344054]">
            Total Investible Surplus{" "}
            <span className="text-[#667085] font-normal">[A−B]</span>
          </span>
          <span
            className={`text-[14px] font-semibold ${
              !totals.hasInput
                ? "text-[#98A2B3]"
                : totals.surplus >= 0
                  ? "text-[#067647]"
                  : "text-[#B42318]"
            }`}
          >
            {totals.hasInput
              ? `${totals.surplus < 0 ? "−" : ""}${formatINR(Math.abs(totals.surplus))}`
              : "—"}
          </span>
        </div>

        {serverError && (
          <p className="mt-4 text-[12px] text-[#D92D20] bg-[#FEF3F2] border border-[#FECDCA] rounded-lg px-3 py-2">
            {serverError}
          </p>
        )}

        {!onboardingId && (
          <div className="mt-4 flex items-start gap-2 text-[12px] text-[#B54708] bg-[#FFFAEB] border border-[#FEDF89] rounded-lg px-3 py-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>
              Personal Details haven&apos;t been saved yet. Go back to step 1
              and save before filling this section.
            </span>
          </div>
        )}
      </div>

      {/* Page-level footer (Cancel / Step / Save & Next) */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onPrevious ?? (() => history.back())}
          className="
            inline-flex items-center gap-1.5 h-10 px-4 rounded-xl
            border border-[#D0D5DD] bg-white
            text-[13px] font-medium text-[#344054]
            hover:bg-[#F9FAFB] transition
          "
        >
          <span aria-hidden>‹</span> Cancel
        </button>

        <span className="text-[12.5px] text-[#667085]">Step 2 of 5</span>

        <button
          type="submit"
          disabled={isSubmitting || !onboardingId}
          className={`
            inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-medium transition
            ${
              isSubmitting || !onboardingId
                ? "bg-[#98A2B3] text-white cursor-not-allowed"
                : "bg-[#0A1B3D] hover:bg-[#0F2452] text-white"
            }
          `}
        >
          <Check size={14} />
          {isSubmitting
            ? "Saving..."
            : saved && !isDirty
              ? "Save & Next"
              : "Save & Next"}
        </button>
      </div>

      {nextWarning && (
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
            shadow-lg px-4 py-3 max-w-sm
            flex items-start gap-3
          "
        >
          <div className="h-7 w-7 rounded-full bg-[#ECFDF3] flex items-center justify-center shrink-0">
            <Check size={15} className="text-[#067647]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#101828]">
              {toast.title}
            </p>
            <p className="text-[12px] text-[#667085] mt-0.5">{toast.body}</p>
          </div>
        </div>
      )}
    </form>
  );
}
