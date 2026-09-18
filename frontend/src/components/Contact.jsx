import { useState } from "react";
const intents = [
  "Enterprise client",
  "College / institution",
  "OEM / global partner",
  "Reseller / channel partner",
  "Equipment leasing",
];
export default function Contact() {
  const [intent, setIntent] = useState(intents[0]);
  return (
    <section className="contact">
      <div>
        <span className="section-label">05 / START THE CONVERSATION</span>
        <h2>Tell us what needs to move.</h2>
        <p>
          We’ll use the brief to map a practical next step. More project details
          can be added as they are confirmed.
        </p>
        <ol>
          <li>Share the context</li>
          <li>Choose your route</li>
          <li>Get a considered response</li>
        </ol>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          I’m here as
          <select value={intent} onChange={(e) => setIntent(e.target.value)}>
            {intents.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <div className="two">
          <label>
            Name
            <input required placeholder="Your full name" />
          </label>
          <label>
            Work email
            <input required type="email" placeholder="you@company.com" />
          </label>
        </div>
        <div className="two">
          <label>
            Organisation
            <input placeholder="Company or institution" />
          </label>
          <label>
            City / state
            <input placeholder="Where are you based?" />
          </label>
        </div>
        <label>
          What are you exploring?
          <textarea
            rows="5"
            placeholder="Technology, equipment, outcome, timeline or requirements"
          />
        </label>
        <button type="submit">Send brief →</button>
      </form>
    </section>
  );
}
