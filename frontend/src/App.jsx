import { useEffect, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { getPublishedBlogs } from "./api";
import Header from "./components/Header";
import Bridge from "./components/Bridge";
import OfferingGrid from "./components/OfferingGrid";
import BlogGrid from "./components/BlogGrid";
import Contact from "./components/Contact";
import Newsletter from "./components/Newsletter";
import AdminPanel from "./components/AdminPanel";
import {
  ecosystemPartners,
  audiencePaths,
  faqs,
  industryCards,
  leasingBenefits,
  leasingOptions,
  offerings,
  proofPoints,
  differentiators,
  deliverySteps,
  partnerSteps,
  insightArticles,
} from "./data/site";

function MediaPreview({
  description,
  image,
  imagePosition = "center",
  video,
  videoPosition = "center",
  videoZoom = 1,
  videoOrigin = "center",
}) {
  return (
    <div
      className="media-preview"
      role="img"
      aria-label={description}
      style={{
        backgroundImage: video ? "none" : "url(" + image + ")",
        backgroundPosition: imagePosition,
      }}
    >
      {video && (
        <video
          className="media-preview-video"
          src={video}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={image}
          aria-hidden="true"
          style={{
            objectPosition: videoPosition,
            transform: "scale(" + videoZoom + ")",
            transformOrigin: videoOrigin,
          }}
        />
      )}
    </div>
  );
}
function Home({ setPage, blogs }) {
  return (
    <>
      <section className="mv-hero">
        <img
          className="mv-hero-fallback"
          src="/media/images/stock-robotics-poster.jpg"
          alt="Industrial robotic arm operating in a modern factory"
        />
        <video
          className="mv-hero-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/media/images/stock-robotics-poster.jpg"
          aria-hidden="true"
        >
          <source
            src="/media/videos/stock-robotics.mp4"
            type="video/mp4"
          />
        </video>
        <div className="mv-hero-shade" />
        <div className="mv-hero-copy">
          <span>INDIA GTM & DELIVERY PARTNER FOR AI ECOSYSTEM PARTNERS</span>
          <h1>
            Silicon Valley AI engineering,
            <br />
            <em>built for Indian enterprise.</em>
          </h1>
          <p>
            Syntellos AI brings its ecosystem partners' production-ready GenAI,
            computer vision, predictive AI and agentic AI systems to Indian
            manufacturing, BFSI, energy and IT leaders — with local strategy,
            local delivery, and a partner who has been on the ground for three years.
          </p>
          <button onClick={() => setPage("contact")}>
            Talk to Our Team <ArrowUpRight size={19} />
          </button>
        </div>
      </section>
      <div className="announcement">
        Backed by an ecosystem of engineering, cloud, XR and financing relationships.
      </div>
      <section className="pathfinder">
        <div className="pathfinder-heading">
          <span>FIND THE RIGHT SERVICE</span>
          <h2>What do you need help with?</h2>
          <p>Choose the option that best matches your organisation and the service you need.</p>
        </div>
        <div className="pathfinder-grid">
          {audiencePaths.map((path, index) => (
            <button onClick={() => setPage(path.page)} key={path.title}>
              <span>{String(index + 1).padStart(2, "0")} / {path.eyebrow}</span>
              <h3>{path.title}</h3>
              <p>{path.text}</p>
              <b>{path.action} <ArrowUpRight size={16} /></b>
            </button>
          ))}
        </div>
      </section>
      <section className="proof-strip" aria-label="Syntellos AI proof points">
        {proofPoints.map((item) => (
          <div key={item.value + item.label}>
            <strong>{item.value}</strong>
            {item.suffix && <b>{item.suffix}</b>}
            <span>{item.label}</span>
          </div>
        ))}
      </section>
      <section className="mv-intro">
        <div>
          <span>WHAT WE DELIVER</span>
          <h2>
            We help you choose,
            <br />
            <i>deploy and use technology.</i>
          </h2>
        </div>
        <div className="intro-side">
          <MediaPreview
            description="Mixed-reality workflow demonstration"
            image="/media/images/pico-ultra-sensor.png"
            video="/media/videos/pico-mixed-reality-workflow.mp4"
          />
          <p>
            Every offering pairs Syntellos AI's on-ground go-to-market strategy
            with our ecosystem partners' engineering — so Indian enterprises get
            a local relationship and a globally proven build.
          </p>
        </div>
      </section>
      <Bridge />
      <OfferingGrid onExplore={() => setPage("offerings")} />
      <section className="difference-section">
        <div className="difference-heading">
          <span>WHAT MAKES THIS OFFERING GENUINELY DIFFERENT</span>
          <h2>
            What makes this offering
            <br />
            <i>genuinely different.</i>
          </h2>
          <p>
            Most AI vendors in India sell either software or strategy — rarely both,
            and rarely with real local accountability. Here's where Syntellos AI's
            positioning actually differs.
          </p>
        </div>
        <div className="difference-list">
          {differentiators.map((item, index) => (
            <article key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <BlogGrid blogs={blogs} fallback={insightArticles} onOpen={() => setPage("insights")} />
      <section className="leasing-callout">
        <div className="lease-title">
          <span>EQUIPMENT LEASING</span>
          <h2>
            Access the equipment
            <br />
            <i>your project needs.</i>
          </h2>
          <button onClick={() => setPage("leasing")}>
            View equipment options <ArrowUpRight size={18} />
          </button>
        </div>
        <div className="lease-side">
          <MediaPreview
            description="Automation equipment operating in a warehouse"
            image="/media/images/stock-robotics-poster.jpg"
            video="/media/videos/stock-robotics.mp4"
            videoPosition="center"
            videoZoom={1.25}
            videoOrigin="center"
          />
          <p>
            Robotics, GPUs, XR systems, cameras and edge equipment, shaped
            around the duration and outcome of your work.
          </p>
        </div>
      </section>
      <Faqs />
      <Newsletter />
      <Contact />
    </>
  );
}

function Faqs() {
  const [open, setOpen] = useState(0);
  return (
    <section className="faqs">
      <div>
        <span className="section-label">FAQ</span>
        <h2>
          Common questions from Indian
          <br />
          <i>enterprises.</i>
        </h2>
      </div>
      <div>
        {faqs.map(([q, a], i) => (
          <article className={open === i ? "open" : ""} key={q}>
            <button onClick={() => setOpen(open === i ? -1 : i)}>
              {q}
              <Plus size={20} />
            </button>
            {open === i && <p>{a}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}

function SimplePage({ title, label, description, children }) {
  return (
    <main className="page">
      <div className="page-intro">
        <span>{label}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children}
      <Contact />
    </main>
  );
}
function Steps({ title, text, steps }) {
  return (
    <section className="content-steps">
      <div>
        <span>HOW IT WORKS</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className="content-step-list">
        {steps.map((step) => (
          <article key={step.number}>
            <span>{step.number}</span>
            <div><h3>{step.title}</h3><p>{step.text}</p></div>
          </article>
        ))}
      </div>
    </section>
  );
}
function IndustryPage({ setPage }) {
  return (
    <SimplePage
      label="INDUSTRIES WE SERVE"
      title={
        <>
          Technology solutions for
          <br />
          <i>your industry.</i>
        </>
      }
      description="We begin with the work your teams need to improve, then match the right AI, IoT, robotics or XR solution to that setting."
    >
      <section className="industry-grid">
        {industryCards.map((industry, i) => (
          <article key={industry.name}>
            <img src={industry.image} alt={industry.imageAlt} />
            <div>
              <span>0{i + 1}</span>
              <h2>{industry.name}</h2>
              <p>{industry.text}</p>
              <ul className="card-use-cases">
                {industry.useCases.map((useCase) => <li key={useCase}>{useCase}</li>)}
              </ul>
              <button onClick={() => setPage("offerings")}>
                View relevant services <ArrowUpRight size={16} />
              </button>
            </div>
          </article>
        ))}
      </section>
      <Steps title="Start with a use case your team can measure." text="A good first project solves a visible problem, has an owner and gives the team a clear way to judge whether it worked." steps={deliverySteps} />
    </SimplePage>
  );
}
function EcosystemPage({ onPartner }) {
  return (
    <SimplePage
      label="PARTNERS AND DELIVERY"
      title={
        <>
          Work with one India-based
          <br />
          <i>technology partner.</i>
        </>
      }
      description="For global technology providers, Syntellos AI provides local go-to-market support, enterprise access and delivery coordination in India."
    >
      <Bridge />
      <Steps title="A straightforward route into the Indian market." text="We focus on a clear customer fit and a practical first opportunity before expanding the partnership." steps={partnerSteps} />
      <div className="page-action"><button onClick={onPartner}>Register as a partner <ArrowUpRight size={18} /></button></div>
      <section className="partner-list">
        {ecosystemPartners.map((partner, i) => {
          const cardClassName =
            partner.imageType === "logo"
              ? "partner-card partner-card-logo"
              : "partner-card";

          return (
            <article className={cardClassName} key={partner.name}>
              <div className="partner-media">
                <img src={partner.image} alt={partner.imageAlt} />
                {partner.logo && (
                  <img
                    className="partner-mark"
                    src={partner.logo}
                    alt={partner.name + " logo"}
                  />
                )}
              </div>
              <div className="partner-card-copy">
                <span>
                  0{i + 1} / {partner.category}
                </span>
                <b>{partner.name}</b>
                <p>{partner.text}</p>
                <ArrowUpRight size={20} />
              </div>
            </article>
          );
        })}
      </section>
    </SimplePage>
  );
}
function LeasingPage({ setPage }) {
  return (
    <SimplePage
      label="EQUIPMENT LEASING"
      title={
        <>
          Lease technology equipment
          <br />
          <i>for pilots and rollouts.</i>
        </>
      }
      description="Access the technology your project needs without committing to a full purchase before the value is proven."
    >
      <section className="leasing-overview">
        <div>
          <span>FLEXIBLE ACCESS / LOWER UPFRONT COMMITMENT</span>
          <h2>Convert a large equipment decision into a staged deployment.</h2>
          <p>
            Access structures can be explored for GPUs, robotics, XR headsets,
            camera arrays and edge servers so a pilot can prove value before a
            wider capital commitment.
          </p>
        </div>
        <ul>
          {leasingBenefits.map((benefit) => <li key={benefit}>{benefit}</li>)}
        </ul>
      </section>
      <section className="lease-list">
        {leasingOptions.map((option, i) => (
          <article key={option.title}>
            <img src={option.image} alt={option.imageAlt} />
            <div>
              <span>0{i + 1}</span>
              <h2>{option.title}</h2>
              <p>{option.text}</p>
              <button onClick={() => setPage("contact")}>
                Discuss availability <ArrowUpRight size={16} />
              </button>
            </div>
          </article>
        ))}
      </section>
      <Steps title="Use equipment when your project needs it." text="We help you explore availability and commercial options for a focused pilot, a temporary requirement or a wider deployment." steps={deliverySteps} />
    </SimplePage>
  );
}
function Insights({ blogs = [] }) {
  const articles = blogs.length ? blogs : insightArticles;
  return (
    <SimplePage
      label="INSIGHTS"
      title={
        <>
          Practical guides for
          <br />
          <i>technology teams.</i>
        </>
      }
      description="Useful starting points for leaders and teams exploring AI, IoT, robotics, XR, training and operational technology projects."
    >
      <section className="articles">
        {articles.map((blog, i) => (
          <article className="article-card" key={blog.slug || blog.title}>
            {(blog.featured_image || blog.image) && (
              <img src={blog.featured_image || blog.image} alt={blog.title} />
            )}
            <div>
              <span>
                {blog.category} / {String(i + 1).padStart(2, "0")}
              </span>
              <h2>{blog.title}</h2>
              <p>{blog.excerpt || blog.text}</p>
              <p className="article-note">Talk to our team to explore this for your organisation.</p>
            </div>
          </article>
        ))}
      </section>
    </SimplePage>
  );
}

function OfferingsPage({ setPage }) {
  return (
    <main className="page offerings-page">
      <section className="offerings-hero">
        <span>SOLUTIONS & SERVICES</span>
        <h1>
          Technology services for
          <br />
          <i>enterprises and institutions.</i>
        </h1>
        <p>
          Explore AI, IoT, robotics and XR services. We can support consulting,
          implementation, training, labs and equipment access based on your needs.
        </p>
      </section>
      <nav className="offering-jump" aria-label="Offering categories">
        {offerings.map((offering, index) => {
          const Icon = offering.icon;
          return (
            <a
              href={`#offering-${index + 1}`}
              key={offering.title}
              className="offering-jump-item"
            >
              <div className="offering-jump-top">
                <span className="offering-jump-num">0{index + 1}</span>
                {Icon && <Icon size={20} className="offering-jump-icon" aria-hidden="true" />}
              </div>
              <div className="offering-jump-body">
                <strong className="offering-jump-title">
                  {offering.shortTitle || offering.title}
                </strong>
                <span className="offering-jump-group">{offering.group}</span>
              </div>
              <span className="offering-jump-action">
                View section <ArrowUpRight size={14} />
              </span>
            </a>
          );
        })}
      </nav>
      <section className="offering-detail-list">
        {offerings.map((offering, index) => {
          const Icon = offering.icon;
          return (
            <article id={`offering-${index + 1}`} key={offering.title}>
              <div className="offering-detail-intro">
                <span>0{index + 1} / {offering.group}</span>
                <Icon size={32} aria-hidden="true" />
                <h2>{offering.title}</h2>
                <p>{offering.text}</p>
                <button onClick={() => setPage("contact")}>
                  Discuss this offering <ArrowUpRight size={17} />
                </button>
              </div>
              <div className="offering-detail-content">
                <div className="offering-visual">
                  {index === 2 ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      poster="/media/images/stock-robotics-poster.jpg"
                      aria-label="Industrial automation system in operation"
                    >
                      <source
                        src="/media/videos/stock-robotics.mp4"
                        type="video/mp4"
                      />
                    </video>
                  ) : (
                    <img src={offering.image} alt={offering.imageAlt} />
                  )}
                  <span>{offering.group}</span>
                </div>
                <div className="offering-services">
                  {offering.services.map((service) => (
                    <div key={service.title}>
                      <h3>{service.title}</h3>
                      <p>{service.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </section>
      <Steps
        title="From requirements to live operations."
        text="We help you explore availability and commercial options for a focused pilot, a temporary requirement or a wider deployment."
        steps={deliverySteps}
      />
      <Contact />
    </main>
  );
}

const routeByPage = {
  home: "/",
  offerings: "/offerings",
  industries: "/industries",
  ecosystem: "/ecosystem",
  leasing: "/leases",
  insights: "/blogs",
  contact: "/contact",
  admin: "/admin",
};
const pageFromPath = () => {
  if (window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/")) {
    return "admin";
  }
  return Object.entries(routeByPage).find(
    ([, path]) => path === window.location.pathname,
  )?.[0] || "home";
};

export default function App() {
  const [page, setPage] = useState(pageFromPath);
  const [blogs, setBlogs] = useState([]);
  const [blogError, setBlogError] = useState("");
  useEffect(() => {
    let active = true;
    getPublishedBlogs(100)
      .then((items) => {
        if (active) setBlogs(items || []);
      })
      .catch((error) => {
        if (active) setBlogError(error.message);
      });

    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const handlePopState = () => setPage(pageFromPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const navigate = (next) => {
    const path = routeByPage[next] || "/";
    if (window.location.pathname !== path)
      window.history.pushState({}, "", path);
    setPage(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const navigatePartner = () => {
    window.history.pushState({}, "", "/contact?intent=partner");
    setPage("contact");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const navigateFromHome = (next) => {
    if (next === "partner") navigatePartner();
    else navigate(next);
  };
  const view = {
    home: <Home setPage={navigateFromHome} blogs={blogs} />,
    industries: <IndustryPage setPage={navigate} />,
    ecosystem: <EcosystemPage onPartner={navigatePartner} />,
    leasing: <LeasingPage setPage={navigate} />,
    insights: <Insights blogs={blogs} />,
    offerings: <OfferingsPage setPage={navigate} />,
    contact: (
      <SimplePage
        label="CONTACT / NEXT STEP"
        title={
          <>
            Start with the
            <br />
            <i>outcome.</i>
          </>
        }
      ></SimplePage>
    ),
    admin: <AdminPanel onExit={() => navigate("home")} />,
  };
  return (
    <>
      {page !== "admin" && <Header page={page} setPage={navigate} onPartner={navigatePartner} />}
      {blogError && page === "insights" && blogs.length > 0 && (
        <div className="api-error" role="alert">
          Blog content could not be loaded. {blogError}
        </div>
      )}
      {view[page] || view.home}
      {page !== "admin" && <footer>
        <b>Syntellos AI</b>
        <span>Global technology. Local delivery. Practical access.</span>
        <small>© 2026 Syntellos AI</small>
      </footer>}
    </>
  );
}
