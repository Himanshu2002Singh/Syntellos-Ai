import { ArrowUpRight } from "lucide-react";
const panels = [
  [
    "Global technology",
    "Proven systems, specialist engineering and products with a role to play in India.",
    "/media/images/addverb-dynamo.jpg",
    "Warehouse automation systems",
  ],
  [
    "Syntellos delivery",
    "The local team that connects the brief, the partners, the deployment and the people using it.",
    "/media/images/xterra-robot-01.webp",
    "Industrial automation system in operation",
  ],
  [
    "Indian teams",
    "Enterprise and institutional teams turning new capability into everyday momentum.",
    "/media/images/realwear-frontline.jpg",
    "Frontline worker using a connected wearable device",
  ],
];
export default function Bridge() {
  return (
    <section className="ecosystem-feature">
      <div className="ecosystem-intro">
        <span>01 / THE DELIVERY ECOSYSTEM</span>
        <h2>
          Technology travels
          <br />
          further with the
          <br />
          <i>right people around it.</i>
        </h2>
        <p>
          We keep global innovation, local delivery and the people who will use
          it in the same conversation.
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
                Explore the connection <ArrowUpRight size={16} />
              </b>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
