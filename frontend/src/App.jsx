import { useEffect, useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { getPublishedBlogs } from "./api";
import Header from "./components/Header";
import Bridge from "./components/Bridge";
import OfferingGrid from "./components/OfferingGrid";
import BlogGrid from "./components/BlogGrid";
import Contact from "./components/Contact";
import {
  ecosystemPartners,
  faqs,
  industryCards,
  leasingOptions,
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
          src="/media/images/realwear-home-hero.png"
          alt="Technician using a wearable device beside an industrial robot"
        />
        <video
          className="mv-hero-video"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/media/images/realwear-home-hero.png"
          aria-hidden="true"
        >
          <source
            src="/media/videos/addverb-physical-ai-hero.mp4"
            type="video/mp4"
          />
        </video>
        <div className="mv-hero-shade" />
        <div className="mv-hero-copy">
          <span>INDIA GTM · DELIVERY · EQUIPMENT ACCESS</span>
          <h1>
            Technology that
            <br />
            moves <em>business forward.</em>
          </h1>
          <p>
            Syntellos helps Indian enterprises and institutions evaluate, access
            and deploy AI, robotics, XR and connected technology with the right
            global ecosystem around them.
          </p>
          <button onClick={() => setPage("contact")}>
            Talk to us <ArrowUpRight size={19} />
          </button>
        </div>
      </section>
      <div className="announcement">
        We connect global technology with Indian enterprise delivery, equipment
        access and practical enablement.
      </div>
      <section className="mv-intro">
        <div>
          <span>WHY SYNTELLOS</span>
          <h2>
            One partner.
            <br />
            <i>More ways to move.</i>
          </h2>
        </div>
        <div className="intro-side">
          <MediaPreview
            description="Mixed-reality workflow demonstration"
            image="/media/images/pico-ultra-sensor.png"
            video="/media/videos/pico-mixed-reality-workflow.mp4"
          />
          <p>
            From an early use case through partner evaluation, deployment,
            training and commercial access, we bring the moving pieces together
            in one clear conversation.
          </p>
        </div>
      </section>
      <Bridge />
      <OfferingGrid />
      <BlogGrid blogs={blogs} onOpen={() => setPage("insights")} />
      <section className="leasing-callout">
        <div className="lease-title">
          <span>ACCESS THE EQUIPMENT</span>
          <h2>
            Run the pilot.
            <br />
            Lease the hardware.
            <br />
            <i>Keep the momentum.</i>
          </h2>
          <button onClick={() => setPage("leasing")}>
            Explore equipment access <ArrowUpRight size={18} />
          </button>
        </div>
        <div className="lease-side">
          <MediaPreview
            description="Automation equipment operating in a warehouse"
            image="/media/images/addverb-travect.jpg"
            video="/media/videos/addverb-amr-demo.mp4"
            videoPosition="right center"
            videoZoom={2.4}
            videoOrigin="right center"
          />
          <p>
            Robotics, GPUs, XR systems, cameras and edge equipment, shaped
            around the duration and outcome of your work.
          </p>
        </div>
      </section>
      <Faqs />
      <Contact />
    </>
  );
}

function Faqs() {
  const [open, setOpen] = useState(0);
  return (
    <section className="faqs">
      <div>
        <span className="section-label">04 / FAQ</span>
        <h2>
          The important questions,
          <br />
          <i>answered clearly.</i>
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

function SimplePage({ title, label, children }) {
  return (
    <main className="page">
      <div className="page-intro">
        <span>{label}</span>
        <h1>{title}</h1>
      </div>
      {children}
      <Contact />
    </main>
  );
}
function IndustryPage() {
  return (
    <SimplePage
      label="INDUSTRIES / CONTEXT FIRST"
      title={
        <>
          Different work.
          <br />
          <i>Different technology path.</i>
        </>
      }
    >
      <section className="industry-grid">
        {industryCards.map((industry, i) => (
          <article key={industry.name}>
            <img src={industry.image} alt={industry.imageAlt} />
            <div>
              <span>0{i + 1}</span>
              <h2>{industry.name}</h2>
              <p>{industry.text}</p>
              <button>
                See relevant capabilities <ArrowUpRight size={16} />
              </button>
            </div>
          </article>
        ))}
      </section>
    </SimplePage>
  );
}
function EcosystemPage() {
  return (
    <SimplePage
      label="ECOSYSTEM / CONNECTED DELIVERY"
      title={
        <>
          The right people
          <br />
          <i>on the same side.</i>
        </>
      }
    >
      <Bridge />
      <section className="partner-list">
        {ecosystemPartners.map((partner, i) => {
          const cardClassName =
            partner.imageType === "logo"
              ? "partner-card partner-card-logo"
              : "partner-card";

          return (
            <button className={cardClassName} key={partner.name}>
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
            </button>
          );
        })}
      </section>
    </SimplePage>
  );
}
function LeasingPage() {
  return (
    <SimplePage
      label="LEASING / EQUIPMENT ACCESS"
      title={
        <>
          Ambition moves faster
          <br />
          <i>with room to test.</i>
        </>
      }
    >
      <section className="lease-list">
        {leasingOptions.map((option, i) => (
          <article key={option.title}>
            <img src={option.image} alt={option.imageAlt} />
            <div>
              <span>0{i + 1}</span>
              <h2>{option.title}</h2>
              <p>{option.text}</p>
              <button>
                Discuss availability <ArrowUpRight size={16} />
              </button>
            </div>
          </article>
        ))}
      </section>
    </SimplePage>
  );
}
function Insights({ blogs = [] }) {
  return (
    <SimplePage
      label="BLOGS / PRACTICAL PERSPECTIVES"
      title={
        <>
          Ideas for teams
          <br />
          <i>that have to deliver.</i>
        </>
      }
    >
      <section className="articles">
        {blogs.map((blog, i) => (
          <article className="article-card" key={blog.slug}>
            {blog.featured_image && (
              <img src={blog.featured_image} alt={blog.title} />
            )}
            <div>
              <span>
                {blog.category} / {String(i + 1).padStart(2, "0")}
              </span>
              <h2>{blog.title}</h2>
              <p>{blog.excerpt}</p>
              <button>
                Read article <ArrowUpRight size={16} />
              </button>
            </div>
          </article>
        ))}
      </section>
    </SimplePage>
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
};
const pageFromPath = () =>
  Object.entries(routeByPage).find(
    ([, path]) => path === window.location.pathname,
  )?.[0] || "home";

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
  const view = {
    home: <Home setPage={navigate} blogs={blogs} />,
    industries: <IndustryPage />,
    ecosystem: <EcosystemPage />,
    leasing: <LeasingPage />,
    insights: <Insights blogs={blogs} />,
    offerings: (
      <SimplePage
        label="OFFERINGS / TECHNOLOGY IN PRACTICE"
        title={
          <>
            Capabilities that
            <br />
            <i>meet the moment.</i>
          </>
        }
      >
        <OfferingGrid />
      </SimplePage>
    ),
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
  };
  return (
    <>
      <Header page={page} setPage={navigate} />
      {blogError && (
        <div className="api-error" role="alert">
          Blog content could not be loaded. {blogError}
        </div>
      )}
      {view[page] || view.home}
      <footer>
        <b>syntellos AI</b>
        <span>Global technology. Local delivery. Practical access.</span>
        <small>© 2026 Syntellos AI</small>
      </footer>
    </>
  );
}
