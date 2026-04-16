"use server";

import { revalidatePath } from "next/cache";
import { requireAdminUser } from "@/lib/auth";
import { getAdminManagedUser, getUserPlanProfile, saveUserPlanProfile } from "@/lib/store";
import { recordUsageEvent } from "@/lib/usage";
import type { PlanTier, UserPlanProfile } from "@/types";

type ActionState = {
  error?: string;
  success?: string;
};

const allowedPlans: Array<Exclude<PlanTier, "admin">> = ["free", "pro"];

export async function updateUserPlanAction(
  managedUserId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const adminUser = await requireAdminUser();
  const plan = readString(formData.get("plan"));

  if (!allowedPlans.includes(plan as Exclude<PlanTier, "admin">)) {
    return { error: "Invalid plan." };
  }

  const managedUser = await getAdminManagedUser(managedUserId);

  if (!managedUser) {
    return { error: "Managed user not found." };
  }

  if (managedUser.isAdmin) {
    return { error: "Admin email accounts are controlled by ADMIN_EMAILS." };
  }

  const now = new Date().toISOString();
  const profile: UserPlanProfile = {
    userId: managedUser.userId,
    email: managedUser.email,
    plan: plan as Exclude<PlanTier, "admin">,
    createdAt: now,
    updatedAt: now,
  };

  const existingProfile = await getUserPlanProfile(managedUser.userId);
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
      managedUserId: managedUser.userId,
      managedUserEmail: managedUser.email,
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
