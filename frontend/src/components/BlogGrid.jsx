import { ArrowUpRight } from "lucide-react";

export default function BlogGrid({ blogs = [], onOpen }) {
  return (
    <section className="blog-preview">
      <div className="blog-heading">
        <div>
          <span>FROM THE JOURNAL</span>
          <h2>
            Practical thinking
            <br />
            <i>for work in motion.</i>
          </h2>
        </div>
        <button onClick={onOpen}>
          View all blogs <ArrowUpRight size={18} />
        </button>
      </div>
      <div className="blog-grid">
        {blogs.slice(0, 3).map((blog) => (
          <button className="blog-card" onClick={onOpen} key={blog.slug}>
            {blog.featured_image && (
              <img src={blog.featured_image} alt={blog.title} />
            )}
            <div>
              <span>{blog.category}</span>
              <h3>{blog.title}</h3>
              <p>{blog.excerpt}</p>
              <b>
                Read article <ArrowUpRight size={16} />
              </b>
            </div>
          </button>
        ))}
        {blogs.length === 0 && (
          <p className="empty-content">New perspectives are coming soon.</p>
        )}
      </div>
    </section>
  );
}
