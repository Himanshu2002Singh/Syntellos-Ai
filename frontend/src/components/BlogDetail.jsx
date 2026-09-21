import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Clock3, Eye, UserRound } from "lucide-react";
import { getPublishedBlogBySlug } from "../api";
import Newsletter from "./Newsletter";
import Contact from "./Contact";

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

function MarkdownContent({ content = "" }) {
  const lines = content.replace(/\r/g, "").split("\n");
  const blocks = [];
  let list = [];

  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`list-${blocks.length}`}>
        {list.map((item, index) => <li key={index}>{renderInline(item)}</li>)}
      </ul>
    );
    list = [];
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      flushList();
      return;
    }
    if (/^-\s+/.test(line)) {
      list.push(line.replace(/^-\s+/, ""));
      return;
    }

    flushList();
    if (line.startsWith("### ")) {
      blocks.push(<h3 key={index}>{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      blocks.push(<h2 key={index}>{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      blocks.push(<h2 key={index}>{renderInline(line.slice(2))}</h2>);
    } else if (line.startsWith("> ")) {
      blocks.push(<blockquote key={index}>{renderInline(line.slice(2))}</blockquote>);
    } else {
      blocks.push(<p key={index}>{renderInline(line)}</p>);
    }
  });

  flushList();
  return <div className="blog-body">{blocks}</div>;
}


function RichContent({ content = "" }) {
  if (/<\/?[a-z][\s\S]*>/i.test(content)) {
    return <div className="blog-body blog-rich-content" dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return <MarkdownContent content={content} />;
}

export default function BlogDetail({ slug, onBack, onOpen }) {
  const [state, setState] = useState({ loading: true, blog: null, related: [], error: "" });

  useEffect(() => {
    let active = true;
    setState({ loading: true, blog: null, related: [], error: "" });
    getPublishedBlogBySlug(slug)
      .then((data) => {
        if (active) setState({ loading: false, blog: data.blog, related: data.relatedBlogs || [], error: "" });
      })
      .catch((error) => {
        if (active) setState({ loading: false, blog: null, related: [], error: error.message });
      });
    return () => { active = false; };
  }, [slug]);

  if (state.loading) {
    return <main className="blog-detail-page"><div className="blog-state">Loading article…</div></main>;
  }

  if (state.error || !state.blog) {
    return (
      <main className="blog-detail-page">
        <div className="blog-state">
          <span>ARTICLE UNAVAILABLE</span>
          <h1>We couldn’t load this article.</h1>
          <p>{state.error || "The article may have been moved or unpublished."}</p>
          <button onClick={onBack}><ArrowLeft size={17} /> Back to all insights</button>
        </div>
      </main>
    );
  }

  const blog = state.blog;
  return (
    <main className="blog-detail-page">
      <header className="blog-detail-hero">
        <button className="blog-back" onClick={onBack}><ArrowLeft size={16} /> All insights</button>
        <div className="blog-detail-meta">
          <span>{blog.category}</span>
          <span><Clock3 size={14} /> {blog.read_time || "5 min read"}</span>
          <span><Eye size={14} /> {blog.views || 0} views</span>
        </div>
        <h1>{blog.title}</h1>
        {blog.excerpt && <p className="blog-detail-excerpt">{blog.excerpt}</p>}
        <div className="blog-author"><UserRound size={15} /> {blog.author || "Syntellos AI Editorial"}</div>
      </header>

      {(blog.featured_image || blog.featured_video) && (
        <section className="blog-feature-media">
          {blog.featured_video ? (
            <video controls poster={blog.featured_image || undefined}>
              <source src={blog.featured_video} />
            </video>
          ) : (
            <img src={blog.featured_image} alt={blog.title} />
          )}
        </section>
      )}

      <article className="blog-article">
        <RichContent content={blog.content} />
      </article>

      {state.related.length > 0 && (
        <section className="related-posts">
          <div className="related-posts-head">
            <span>KEEP READING</span>
            <h2>More from the journal.</h2>
          </div>
          <div className="related-posts-grid">
            {state.related.slice(0, 3).map((item) => (
              <button key={item.id || item.slug} onClick={() => onOpen(item.slug)}>
                <span>{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <b>Read article <ArrowUpRight size={15} /></b>
              </button>
            ))}
          </div>
        </section>
      )}

      <Newsletter />
      <Contact />
    </main>
  );
}
