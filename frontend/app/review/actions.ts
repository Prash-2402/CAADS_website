"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/auth";

const ReviewSchema = z.object({
  message: z.string().min(10, "Review must be at least 10 characters."),
  rating: z.coerce.number().min(1).max(5).optional().or(z.literal("")),
});

export type ReviewState = {
  error?: string;
  success?: boolean;
  fieldErrors?: {
    message?: string[];
    rating?: string[];
  };
};

export async function submitReviewAction(
  _prevState: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  // Only authenticated users can submit reviews
  const profile = await getProfile();
  if (!profile) {
    return { error: "You must be logged in to submit a review." };
  }

  const raw = {
    message: formData.get("message"),
    rating: formData.get("rating"),
  };

  const parsed = ReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const ratingValue = parsed.data.rating === "" ? null : Number(parsed.data.rating);

  const supabase = createClient();
  const { error } = await supabase.from("reviews").insert({
    user_id: profile.id,
    message: parsed.data.message,
    rating: ratingValue,
  });

  if (error) {
    return { error: "Failed to submit review. Please try again later." };
  }

  return { success: true };
}
