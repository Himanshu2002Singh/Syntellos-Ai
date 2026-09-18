import { ArrowUpRight, Menu } from "lucide-react";
export default function Header({ page, setPage }) {
  const links = [
    ["Blogs", "insights"],
    ["Industries", "industries"],
    ["Ecosystem", "ecosystem"],
    ["Leasing", "leasing"],
  ];
  return (
    <header className="nav">
      <button className="wordmark" onClick={() => setPage("home")}>
        <span>syntellos</span>
        <b>AI</b>
      </button>
      <nav>
        {links.map(([label, key]) => (
          <button
            className={page === key ? "on" : ""}
            onClick={() => setPage(key)}
            key={key}
          >
            {label}
          </button>
        ))}
      </nav>
      <button className="consult" onClick={() => setPage("contact")}>
        Book consultation <ArrowUpRight size={16} />
      </button>
      <Menu className="hamburger" />
    </header>
  );
}
