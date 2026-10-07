"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, MessageCircle, Mail } from "lucide-react";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";
import { useContactModal } from "./ContactModalProvider";

type FormState = "idle" | "loading" | "success" | "error";

const serviceOptions = [
  "Website development",
  "Mobile app development",
  "AI automation",
  "WhatsApp automation",
];

export function ContactModal() {
  const { open, closeModal } = useContactModal();
  const reduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Focus management + body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeModal]);

  const validate = (data: FormData) => {
    const next: Record<string, string> = {};
    if (!String(data.get("name")).trim()) next.name = "Please enter your name.";
    const email = String(data.get("email")).trim();
    if (!email) next.email = "Please enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Please enter a valid email.";
    if (!String(data.get("service"))) next.service = "Please select a service.";
    if (!String(data.get("message")).trim())
      next.message = "Please tell me a bit about your project.";
    return next;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const validation = validate(data);
    setErrors(validation);
    if (Object.keys(validation).length) return;

    setFormState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: site.formAccessKey,
          name: data.get("name"),
          email: data.get("email"),
          service: data.get("service"),
          message: data.get("message"),
          subject: "New enquiry from cognit.co.in",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(
          json.message ||
            "Something went wrong. Please try WhatsApp or email instead."
        );
      }
      setFormState("success");
      form.reset();
    } catch (err) {
      setFormState("error");
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Could not send your message. Try WhatsApp or email hello@cognit.co.in."
      );
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
        >
          {/* Dimmed backdrop */}
          <button
            type="button"
            aria-label="Close contact form"
            onClick={closeModal}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-bg-2 p-6 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.75)] sm:p-8"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-2 text-text transition-colors hover:bg-surface"
            >
              <X size={18} />
            </button>

            <h2
              id="contact-modal-title"
              className="font-heading text-2xl font-bold text-text"
            >
              Send me an email
            </h2>
            <p className="mt-2 text-sm text-muted">
              Tell me about your project and I&apos;ll reply within 24 hours.
              Prefer chat? Use WhatsApp below.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={site.whatsappPrefill}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
              <a
                href={`mailto:${site.email}`}
                className="btn-secondary text-sm"
              >
                <Mail size={16} />
                {site.email}
              </a>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              <Field id="name" label="Name" error={errors.name}>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className={inputClass(errors.name)}
                />
              </Field>

              <Field id="email" label="Email" error={errors.email}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={inputClass(errors.email)}
                />
              </Field>

              <Field id="service" label="What do you need?" error={errors.service}>
                <select
                  id="service"
                  name="service"
                  defaultValue=""
                  className={inputClass(errors.service)}
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  {serviceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="message" label="Message" error={errors.message}>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className={cn(inputClass(errors.message), "resize-y")}
                />
              </Field>

              <button
                type="submit"
                disabled={formState === "loading"}
                className="btn-primary w-full disabled:opacity-60"
              >
                {formState === "loading" ? "Sending..." : "Send message"}
              </button>

              {formState === "success" && (
                <p className="text-center text-success" role="status">
                  Thanks, I&apos;ll reply within 24 hours.
                </p>
              )}
              {formState === "error" && (
                <p className="text-center text-red-400" role="alert">
                  {errorMsg}
                </p>
              )}

              <p className="text-center text-xs text-muted">
                Your details are only used to reply to your enquiry.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function inputClass(error?: string) {
  return cn(
    "w-full rounded-xl border bg-surface-2 px-4 py-3 text-text outline-none focus:border-accent",
    error ? "border-red-500" : "border-border"
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-text">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
