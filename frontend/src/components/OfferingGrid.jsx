import { ArrowUpRight } from "lucide-react";
import { offerings } from "../data/site";
export default function OfferingGrid() {
  return (
    <section className="offerings">
      <div className="section-label">02 / WHAT WE PUT TO WORK</div>
      <div className="section-heading">
        <h2>
          Technology for the
          <br />
          <i>work in front of you.</i>
        </h2>
        <p>
          Consulting, implementation and equipment access come together around a
          real-world outcome.
        </p>
      </div>
      <div className="offering-grid">
        {offerings.map((item, index) => {
          const Icon = item.icon;
          return (
            <article key={item.title}>
              <img src={item.image} alt={item.imageAlt} />
              <div className="card-layer">
                <span>
                  0{index + 1} · {item.group}
                </span>
                <Icon size={25} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <button>
                  Explore <ArrowUpRight size={17} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
