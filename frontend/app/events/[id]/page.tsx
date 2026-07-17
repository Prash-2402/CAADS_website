import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Calendar, Clock, MapPin, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RegistrationButton } from "./_components/registration-button";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: event } = await supabase
    .from("events_public")
    .select("title, description")
    .eq("id", params.id)
    .single();

  if (!event) return { title: "Event Not Found" };

  return {
    title: event.title,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  // 1. Fetch event (public view only)
  const { data: event, error: eventError } = await supabase
    .from("events_public")
    .select("*")
    .eq("id", params.id)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // 2. Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;
  
  // 3. Check if already registered
  let isRegistered = false;
  if (isLoggedIn) {
    const { data: registration } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", params.id)
      .eq("user_id", user.id)
      .maybeSingle();
      
    if (registration) {
      isRegistered = true;
    }
  }

  const eventDate = parseISO(event.date);
  const isPastEvent = eventDate < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className="min-h-screen bg-bg pt-24 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link 
          href="/events"
          className="inline-flex items-center gap-2 text-muted hover:text-ivory transition-colors mb-8 font-body text-sm"
        >
          <ArrowLeft size={16} />
          Back to Calendar
        </Link>
        
        <div className="bg-bg-secondary rounded-2xl border border-border-gold shadow-gold overflow-hidden">
          {/* Header/Poster Area */}
          <div className="relative h-48 md:h-64 bg-gold/5 border-b border-border-gold flex items-center justify-center overflow-hidden group">
            {event.poster_url ? (
              // Would use next/image here when real URLs are available
              <img 
                src={event.poster_url} 
                alt={event.title} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/20 via-bg-secondary to-bg-secondary" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary to-transparent" />
          </div>

          <div className="p-8 md:p-12 relative -mt-16 z-10">
            <h1 className="font-display text-3xl md:text-5xl font-bold text-ivory mb-6 leading-tight">
              {event.title}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-gold mt-1" size={20} />
                  <div>
                    <h3 className="font-display font-semibold text-ivory">Date</h3>
                    <p className="font-body text-muted">{format(eventDate, "EEEE, MMMM d, yyyy")}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="text-gold mt-1" size={20} />
                  <div>
                    <h3 className="font-display font-semibold text-ivory">Time</h3>
                    <p className="font-body text-muted">{event.time ? event.time.substring(0, 5) : "TBD"}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="text-gold mt-1" size={20} />
                  <div>
                    <h3 className="font-display font-semibold text-ivory">Venue</h3>
                    <p className="font-body text-muted">{event.venue || "TBD"}</p>
                  </div>
                </div>
                
                {event.speaker && (
                  <div className="flex items-start gap-3">
                    <User className="text-gold mt-1" size={20} />
                    <div>
                      <h3 className="font-display font-semibold text-ivory">Speaker</h3>
                      <p className="font-body text-muted">{event.speaker}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-12">
              <h3 className="font-display text-xl font-bold text-ivory mb-4 border-b border-border-gold/50 pb-2">
                About this event
              </h3>
              <div className="font-body text-muted leading-relaxed whitespace-pre-wrap">
                {event.description || "No description provided."}
              </div>
            </div>
            
            <div className="pt-8 border-t border-border-gold/50 flex flex-col items-center sm:items-start">
              {isPastEvent ? (
                <div className="inline-flex items-center px-6 py-3 rounded-xl bg-bg border border-border-gold text-muted font-semibold">
                  This event has ended
                </div>
              ) : (
                <RegistrationButton 
                  eventId={event.id}
                  isRegistered={isRegistered}
                  isLoggedIn={isLoggedIn}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
