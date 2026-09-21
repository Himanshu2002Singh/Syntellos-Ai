import { useState } from "react";
import { submitConsultationLead } from "../api";

const intents = [
  "Enterprise client",
  "College / institution",
  "OEM / global partner",
  "Reseller / channel partner",
  "Equipment leasing",
];

function createWhatsAppLeadUrl(lead, leadId) {
  const phone = (import.meta.env.VITE_WHATSAPP_PHONE || "919889505166").replace(
    /\D/g,
    "",
  );
  const message = [
    leadId ? "New consultation lead #" + leadId : "New consultation enquiry",
    "Name: " + lead.name,
    "Phone: " + lead.phone,
    "Email: " + lead.email,
    "Organisation: " + (lead.organization || "Not provided"),
    "City: " + (lead.city || "Not provided"),
    "Intent: " + lead.intent,
    "Brief: " + lead.message,
  ].join("\n");

  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
}

export default function Contact() {
  const initialIntent = new URLSearchParams(window.location.search).get("intent");
  const [intent, setIntent] = useState(
    initialIntent === "partner" ? "OEM / global partner" : intents[0],
  );
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setSubmission(null);

    const form = event.currentTarget;
    const fields = new FormData(form);
    const lead = Object.fromEntries(fields.entries());

    try {
      const result = await submitConsultationLead(lead);
      setSubmission({
        type: "success",
        message: result.message,
        whatsappUrl: createWhatsAppLeadUrl(lead, result.data.id),
      });
      form.reset();
      setIntent(intents[0]);
    } catch (error) {
      setSubmission({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWhatsAppSubmit(event) {
    const form = event.currentTarget.form;
    if (!form.reportValidity()) return;

    const lead = Object.fromEntries(new FormData(form).entries());
    setSubmitting(true);
    setSubmission(null);
    try {
      const result = await submitConsultationLead(lead);
      window.open(
        createWhatsAppLeadUrl(lead, result.data.id),
        "_blank",
        "noopener,noreferrer",
      );
      setSubmission({
        type: "success",
        message: "Your enquiry was saved. WhatsApp has opened so you can continue the conversation.",
      });
      form.reset();
      setIntent(intents[0]);
    } catch (error) {
      setSubmission({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="contact">
      <div>
        <span className="section-label">GET IN TOUCH</span>
        <h2>Tell us the problem. We’ll map the right AI solution.</h2>
        <p>
          Share your use case and our team — backed by our ecosystem partners’
          engineering — responds with a clear next step.
        </p>
        <ol>
          <li>Share your use case</li>
          <li>Get a transparent assessment</li>
          <li>Move toward the right AI solution</li>
        </ol>
      </div>
      <form onSubmit={handleSubmit}>
        <label>
          I’m here as
          <select
            name="intent"
            value={intent}
            onChange={(event) => setIntent(event.target.value)}
            required
          >
            {intents.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <div className="two">
          <label>
            Name
            <input
              name="name"
              required
              autoComplete="name"
              placeholder="Your full name"
            />
          </label>
          <label>
            Work email
            <input
              name="email"
              required
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
            />
          </label>
        </div>
        <div className="two">
          <label>
            WhatsApp / phone
            <input
              name="phone"
              required
              type="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
            />
          </label>
          <label>
            Organisation
            <input
              name="organization"
              autoComplete="organization"
              placeholder="Company or institution"
            />
          </label>
        </div>
        <label>
          City / state
          <input
            name="city"
            autoComplete="address-level2"
            placeholder="Where are you based?"
          />
        </label>
        <label>
          What are you exploring?
          <textarea
            name="message"
            required
            rows="5"
            placeholder="Technology, equipment, outcome, timeline or requirements"
          />
        </label>
        {submission && (
          <div
            className={"contact-status " + submission.type}
            role={submission.type === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            <p>{submission.message}</p>
            {submission.whatsappUrl && (
              <a
                className="whatsapp-link"
                href={submission.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Continue to WhatsApp →
              </a>
            )}
          </div>
        )}
        <div className="contact-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Send brief →"}
          </button>
          <button
            className="whatsapp-submit"
            type="button"
            onClick={handleWhatsAppSubmit}
            disabled={submitting}
          >
            {submitting ? "Saving enquiry..." : "Send on WhatsApp →"}
          </button>
        </div>
      </form>
    </section>
  );
}
