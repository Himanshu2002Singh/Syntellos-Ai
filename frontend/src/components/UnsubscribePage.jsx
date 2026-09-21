import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert } from "lucide-react";
import { unsubscribeFromNewsletter } from "../api";

export default function UnsubscribePage({ onBack }) {
  const [state, setState] = useState({ loading: true, error: "", message: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");

    if (!token && !email) {
      setState({ loading: false, error: "This unsubscribe link is incomplete.", message: "" });
      return;
    }

    unsubscribeFromNewsletter({ token, email })
      .then((result) => setState({ loading: false, error: "", message: result.message }))
      .catch((error) => setState({ loading: false, error: error.message, message: "" }));
  }, []);

  return (
    <main className="unsubscribe-page">
      <section>
        <span>SYNTELLOS AI JOURNAL</span>
        {state.loading ? (
          <>
            <h1>Updating your subscription…</h1>
            <p>Please keep this page open for a moment.</p>
          </>
        ) : state.error ? (
          <>
            <CircleAlert size={34} />
            <h1>We couldn’t update your subscription.</h1>
            <p>{state.error}</p>
          </>
        ) : (
          <>
            <CheckCircle2 size={34} />
            <h1>You’re unsubscribed.</h1>
            <p>{state.message}</p>
          </>
        )}
        <button onClick={onBack}><ArrowLeft size={16} /> Back to insights</button>
      </section>
    </main>
  );
}
