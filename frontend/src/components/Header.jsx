import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
export default function Header({ page, setPage, onPartner }) {
  const [open, setOpen] = useState(false);
  const links = [
    ["Solutions", "offerings"],
    ["Industries", "industries"],
    ["Equipment", "leasing"],
    ["Partners", "ecosystem"],
    ["Insights", "insights"],
  ];
  const goTo = (key) => {
    setPage(key);
    setOpen(false);
  };
  return (
    <header className="nav">
      <button
        className="wordmark"
        onClick={() => goTo("home")}
        aria-label="Syntellos AI home"
      >
        <span>Syntellos</span>
        <b>AI</b>
      </button>
      <nav className={open ? "open" : ""} aria-label="Primary navigation">
        {links.map(([label, key]) => (
          <button
            className={page === key ? "on" : ""}
            onClick={() => goTo(key)}
            key={key}
          >
            {label}
          </button>
        ))}
      </nav>
      <button className="consult" onClick={() => { onPartner(); setOpen(false); }}>
        Register as a partner <ArrowUpRight size={16} />
      </button>
      <button
        className="hamburger"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
      >
        {open ? <X /> : <Menu />}
      </button>
    </header>
  );
}
