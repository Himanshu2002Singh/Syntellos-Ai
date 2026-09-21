import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { subscribeToNewsletter } from "../api";

export default function Newsletter() {
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  async function subscribe(event) {
    event.preventDefault();
    setSending(true);
    setStatus(null);
    const form = event.currentTarget;
    const subscriber = Object.fromEntries(new FormData(form).entries());
    try {
      const result = await subscribeToNewsletter(subscriber);
      setStatus({ type: "success", text: result.message });
      form.reset();
    } catch (error) {
      setStatus({ type: "error", text: error.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="newsletter" aria-labelledby="newsletter-title">
      <div>
        <span>SYNTELLOS AI JOURNAL</span>
        <h2 id="newsletter-title">Technology insights,<br /><i>without the noise.</i></h2>
        <p>Get new Syntellos AI articles plus occasional field notes on AI, IoT, robotics, XR and technology delivery in India.</p>
        <small>New posts + occasional newsletters. Unsubscribe at any time.</small>
      </div>
      <form onSubmit={subscribe}>
        <label>Name<input name="name" required autoComplete="name" placeholder="Your name" /></label>
        <label>Email<input name="email" required type="email" autoComplete="email" placeholder="you@company.com" /></label>
        <button type="submit" disabled={sending}>{sending ? "Subscribing..." : <>Subscribe to the journal <ArrowUpRight size={18} /></>}</button>
        {status && <p className={`newsletter-status ${status.type}`} role="status">{status.text}</p>}
      </form>
    </section>
  );
}
