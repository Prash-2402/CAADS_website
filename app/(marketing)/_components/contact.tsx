"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitContactAction, type ContactState } from "../actions";

const initialState: ContactState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="
        w-full rounded-xl bg-gold px-4 py-3
        font-body text-sm font-semibold text-bg
        hover:bg-gold-bright
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
      "
    >
      {pending ? "Sending..." : "Send Message"}
    </button>
  );
}

export function Contact() {
  const [state, formAction] = useFormState(submitContactAction, initialState);
  return (
    <section id="contact" className="py-24 bg-bg border-t border-border-gold/30">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h2 className="font-display text-4xl font-bold text-ivory mb-6">
          Get in Touch
        </h2>
        <p className="font-body text-lg text-muted mb-10 max-w-2xl mx-auto">
          Have a question about our events or want to collaborate on a project? 
          Drop us a message and we&apos;ll get back to you soon.
        </p>
        
        {state.success ? (
          <div className="bg-gold/10 border border-gold rounded-xl p-8 max-w-lg mx-auto">
            <h3 className="font-display text-2xl font-bold text-gold mb-2">Message Sent!</h3>
            <p className="font-body text-muted">Thank you for reaching out. We will get back to you soon.</p>
          </div>
        ) : (
          <form action={formAction} className="max-w-lg mx-auto text-left space-y-4">
            {state.error && (
              <div className="bg-red-950/40 border border-red-800 text-red-400 p-3 rounded-lg text-sm">
                {state.error}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block font-body text-sm font-medium text-ivory mb-1">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-xl border border-border-gold bg-bg-secondary px-4 py-2.5 font-body text-sm text-ivory placeholder:text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
                {state.fieldErrors?.name && <p className="text-xs text-red-400 mt-1">{state.fieldErrors.name[0]}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block font-body text-sm font-medium text-ivory mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full rounded-xl border border-border-gold bg-bg-secondary px-4 py-2.5 font-body text-sm text-ivory placeholder:text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
                {state.fieldErrors?.email && <p className="text-xs text-red-400 mt-1">{state.fieldErrors.email[0]}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="message" className="block font-body text-sm font-medium text-ivory mb-1">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                className="w-full rounded-xl border border-border-gold bg-bg-secondary px-4 py-2.5 font-body text-sm text-ivory placeholder:text-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold resize-none"
              ></textarea>
              {state.fieldErrors?.message && <p className="text-xs text-red-400 mt-1">{state.fieldErrors.message[0]}</p>}
            </div>
            
            <SubmitButton />
          </form>
        )}
      </div>
    </section>
  );
}
