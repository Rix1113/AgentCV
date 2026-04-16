"use server";

import { revalidatePath } from "next/cache";
import { isAdminEmail, requireAdminUser } from "@/lib/auth";
import { getUserPlanProfile, saveUserPlanProfile } from "@/lib/store";
import { recordUsageEvent } from "@/lib/usage";
import type { PlanTier, UserPlanProfile } from "@/types";

type ActionState = {
  error?: string;
  success?: string;
};

const allowedPlans: Array<Exclude<PlanTier, "admin">> = ["free", "pro"];

export async function updateUserPlanAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const adminUser = await requireAdminUser();
  const userId = readString(formData.get("userId"));
  const email = readNullableString(formData.get("email"));
  const plan = readString(formData.get("plan"));

  if (!userId) {
    return { error: "Missing user id." };
  }

  if (!allowedPlans.includes(plan as Exclude<PlanTier, "admin">)) {
    return { error: "Invalid plan." };
  }

  if (isAdminEmail(email)) {
    return { error: "Admin email accounts are controlled by ADMIN_EMAILS." };
  }

  const now = new Date().toISOString();
  const profile: UserPlanProfile = {
    userId,
    email,
    plan: plan as Exclude<PlanTier, "admin">,
    createdAt: now,
    updatedAt: now,
  };

  const existingProfile = await getUserPlanProfile(userId);
  if (existingProfile) {
    profile.createdAt = existingProfile.createdAt;
  }

  await saveUserPlanProfile(profile);
  await recordUsageEvent({
    userId: adminUser.id,
    userEmail: adminUser.email,
    eventType: "admin_user_plan_updated",
    route: "/admin",
    metadata: {
      method: "POST",
      pathname: "/admin",
      managedUserId: userId,
      managedUserEmail: email,
      assignedPlan: plan as Exclude<PlanTier, "admin">,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: `Saved ${plan} plan.` };
}

function readString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function readNullableString(value: FormDataEntryValue | null) {
  const normalized = readString(value);
  return normalized ? normalized : null;
}
