"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { AdminManagedUser, PlanTier } from "@/types";

type ActionState = {
  error?: string;
  success?: string;
};

type AdminPlanFormProps = {
  user: AdminManagedUser;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
};

const PLAN_OPTIONS: Array<Exclude<PlanTier, "admin">> = ["free", "pro"];

const initialState: ActionState = {};

export function AdminPlanForm({ user, action }: AdminPlanFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const isLocked = user.isAdmin;

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <select
        name="plan"
        defaultValue={user.editablePlan}
        className="input min-w-32 py-2"
        disabled={isLocked}
      >
        {PLAN_OPTIONS.map((plan) => (
          <option key={plan} value={plan}>
            {plan}
          </option>
        ))}
      </select>
      <SubmitButton disabled={isLocked} />
      {state.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-300">{state.success}</p> : null}
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button-secondary text-sm" disabled={disabled || pending}>
      {disabled ? "Email-managed admin" : pending ? "Saving..." : "Save plan"}
    </button>
  );
}
