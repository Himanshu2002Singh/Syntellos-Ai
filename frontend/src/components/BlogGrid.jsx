import { ArrowUpRight } from "lucide-react";
import { demoBlogs } from "../data/site";

export default function BlogGrid({ onOpen }) {
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
        {demoBlogs.map((blog) => (
          <button className="blog-card" onClick={onOpen} key={blog.title}>
            <img src={blog.image} alt={blog.imageAlt} />
            <div>
              <span>{blog.category}</span>
              <h3>{blog.title}</h3>
              <p>{blog.text}</p>
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
