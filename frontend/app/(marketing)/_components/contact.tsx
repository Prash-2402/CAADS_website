export function Contact() {
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
        
        <a 
          href="mailto:contact@christuniversity.in"
          className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gold/10 border border-gold text-gold font-semibold hover:bg-gold hover:text-bg transition-colors duration-300"
        >
          Send us an email
        </a>
      </div>
    </section>
  );
}
