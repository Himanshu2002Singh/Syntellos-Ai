import { ArrowUpRight } from "lucide-react";

export default function BlogGrid({ blogs = [], fallback = [], onOpen }) {
  const cards = blogs.length ? blogs : fallback;
  return (
    <section className="blog-preview">
      <div className="blog-heading">
        <div>
        <span>INSIGHTS AND UPDATES</span>
          <h2>
          Industry insights
            <br />
          <i>for business and technology teams.</i>
          </h2>
        </div>
        <button onClick={onOpen}>
          View all blogs <ArrowUpRight size={18} />
        </button>
      </div>
      <div className="blog-grid">
        {cards.slice(0, 3).map((blog) => (
          <button className="blog-card" onClick={onOpen} key={blog.slug || blog.title}>
            {(blog.featured_image || blog.image) && (
              <img src={blog.featured_image || blog.image} alt={blog.title} />
            )}
            <div>
              <span>{blog.category}</span>
              <h3>{blog.title}</h3>
              <p>{blog.excerpt || blog.text}</p>
              <b>
                Read article <ArrowUpRight size={16} />
              </b>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
