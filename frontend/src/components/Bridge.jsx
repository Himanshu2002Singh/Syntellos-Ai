import { ArrowUpRight } from "lucide-react";
const panels = [
  [
    "Global technology partners",
    "Specialist AI, robotics, IoT and XR technology that can be adapted for Indian enterprise requirements.",
    "/media/images/stock-robotics-poster.jpg",
    "Unbranded industrial automation system",
  ],
  [
    "Syntellos AI in India",
    "We handle use-case scoping, local go-to-market, deployment coordination, training and ongoing customer support.",
    "/media/images/xterra-robot-01.webp",
    "Industrial automation system in operation",
  ],
  [
    "Your organisation",
    "Enterprise teams, colleges and institutions that need technology to solve a real business, operations or learning problem.",
    "/media/images/realwear-frontline.jpg",
    "Frontline worker using a connected wearable device",
  ],
];
export default function Bridge() {
  return (
    <section className="ecosystem-feature">
      <div className="ecosystem-intro">
        <span>HOW WE WORK</span>
        <h2>
          How we bring
          <br />
          <i>technology to India.</i>
        </h2>
        <p>
          Syntellos AI connects global technology providers with Indian
          enterprises and institutions—from the first discussion through local
          deployment, training and support.
        </p>
      </div>
      <div className="ecosystem-panels">
        {panels.map(([title, copy, image, imageAlt], index) => (
          <button key={title} className={`ecosystem-panel panel-${index + 1}`}>
            <img src={image} alt={imageAlt} />
            <div>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <b>
                How it works <ArrowUpRight size={16} />
              </b>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
