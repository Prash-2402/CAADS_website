"use client";

import { useFormState, useFormStatus } from "react-dom";
import { registerForEventAction, type ActionState } from "../../actions";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

type RegistrationButtonProps = {
  eventId: string;
  isRegistered: boolean;
  isLoggedIn: boolean;
};

const initialState: ActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="
        w-full sm:w-auto px-8 py-4 rounded-xl bg-gold text-bg font-semibold 
        hover:bg-gold-bright transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
      "
    >
      {pending ? "Registering..." : "Register Now"}
    </button>
  );
}

export function RegistrationButton({ eventId, isRegistered, isLoggedIn }: RegistrationButtonProps) {
  const router = useRouter();
  
  // Need to bind the eventId to the server action
  const actionWithEventId = registerForEventAction.bind(null, eventId);
  const [state, formAction] = useFormState(actionWithEventId, initialState);

  if (isRegistered || state.success) {
    return (
      <div className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gold/10 text-gold font-semibold border border-gold/30">
        <CheckCircle2 size={20} />
        <span>You are registered for this event</span>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => router.push(`/login?next=/events/${eventId}`)}
        className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gold text-bg font-semibold hover:bg-gold-bright transition-all duration-300"
      >
        Sign in to Register
      </button>
    );
  }

  return (
    <form action={formAction} className="inline-block">
      {state.error && (
        <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg p-3">
          {state.error}
        </div>
      )}
      <SubmitButton />
    </form>
  );
}
