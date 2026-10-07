"use client";

import { MessageCircle, Mail } from "lucide-react";
import { site } from "@/data/site";
import { useContactModal } from "./ContactModalProvider";
import { Reveal } from "./Reveal";

type CTABandProps = {
  title?: string;
  subtitle?: string;
};

export function CTABand({
  title = "Have an idea? Let's make it think and work.",
  subtitle = "Book a free call or send me an email. I reply within 24 hours.",
}: CTABandProps) {
  const { openModal } = useContactModal();

  return (
    <section
      className="relative overflow-hidden section-padding"
      aria-labelledby="cta-heading"
    >
      <div
        aria-hidden
        className="glow"
        style={{
          width: "40rem",
          height: "28rem",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(255,138,61,0.22), transparent 66%)",
        }}
      />
      <div className="container-main relative">
        <Reveal className="card-glass overflow-hidden p-8 text-center md:p-16">
          <h2
            id="cta-heading"
            className="heading-lg mx-auto max-w-2xl text-text"
          >
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted">{subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={site.whatsappPrefill}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <MessageCircle size={18} />
              Book a free call
            </a>
            <button type="button" onClick={openModal} className="btn-secondary">
              <Mail size={18} />
              Send an email
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
