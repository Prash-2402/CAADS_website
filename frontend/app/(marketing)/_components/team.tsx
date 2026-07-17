import { marketingData } from "@/data/marketing";
import { Briefcase } from "lucide-react";
import Image from "next/image";

export function Team() {
  const { team } = marketingData;

  return (
    <section id="team" className="py-24 bg-bg-secondary">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-ivory mb-4">
            Meet the Core Team
          </h2>
          <p className="font-body text-muted max-w-2xl mx-auto">
            The student leaders driving the vision and execution of CAADS.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, i) => (
            <div 
              key={i}
              className="bg-bg border border-border-gold rounded-2xl overflow-hidden group hover:border-gold transition-colors duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-bg-secondary">
                {/* Fallback pattern if image is missing */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold via-bg to-bg" />
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              
              <div className="p-6 relative">
                <h3 className="font-display text-xl font-bold text-ivory mb-1">
                  {member.name}
                </h3>
                <p className="font-mono text-xs text-gold uppercase tracking-wider mb-4">
                  {member.role}
                </p>
                <a 
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted hover:text-ivory transition-colors"
                >
                  <Briefcase size={18} />
                  <span>Connect</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
