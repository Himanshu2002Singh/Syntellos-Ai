import { ArrowUpRight } from "lucide-react";
import { offerings } from "../data/site";
export default function OfferingGrid({ onExplore }) {
  return (
    <section className="offerings">
      <div className="section-label">OUR SERVICES</div>
      <div className="section-heading">
        <h2>
          Technology services
          <br />
          <i>for your organisation.</i>
        </h2>
        <p>
          Choose the technology area you need. Each service includes consulting,
          solution design, implementation, training or equipment access as needed.
        </p>
      </div>
      <div className="offering-grid">
        {offerings.map((item, index) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              onClick={() => onExplore(index)}
              role="link"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onExplore(index);
                }
              }}
            >
              <img src={item.image} alt={item.imageAlt} />
              <div className="card-layer">
                <span>
                  0{index + 1} · {item.group}
                </span>
                <Icon size={25} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <button onClick={() => onExplore(index)}>
                  View services <ArrowUpRight size={17} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
