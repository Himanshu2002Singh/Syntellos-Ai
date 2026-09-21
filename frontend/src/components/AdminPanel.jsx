import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Eye, FilePlus2, LogOut, PenLine, Save, Send } from "lucide-react";
import { adminLogin, adminRequest } from "../api";

const blankPost = {
  title: "", category: "AI & Technology", excerpt: "", content: "", featured_image: "", author: "Syntellos AI Editorial", read_time: "5 min read", tags: "", is_published: false,
};

function BlogEditor({ initial, onCancel, onSaved, token }) {
  const [post, setPost] = useState(initial || blankPost);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const contentRef = useRef(null);
  const update = (key, value) => setPost((current) => ({ ...current, [key]: value }));
  const insert = (before, after = "") => {
    const node = contentRef.current;
    const start = node.selectionStart;
    const end = node.selectionEnd;
    const chosen = post.content.slice(start, end) || "write here";
    const content = `${post.content.slice(0, start)}${before}${chosen}${after}${post.content.slice(end)}`;
    update("content", content);
    requestAnimationFrame(() => { node.focus(); node.setSelectionRange(start + before.length, start + before.length + chosen.length); });
  };
  async function save(publish) {
    setSaving(true); setMessage("");
    try {
      const payload = { ...post, is_published: publish };
      const path = post.id ? `/blogs/admin/${post.id}` : "/blogs/admin";
      const result = await adminRequest(path, token, { method: post.id ? "PUT" : "POST", body: JSON.stringify(payload) });
      setMessage(result.message); onSaved(result.data.blog);
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  }
  return <section className="admin-editor">
    <div className="admin-editor-head"><div><span>CONTENT EDITOR</span><h2>{post.id ? "Edit blog post" : "Write a new blog post"}</h2></div><button className="admin-link" onClick={onCancel}><ArrowLeft size={16}/> Back to posts</button></div>
    <div className="editor-layout"><div className="editor-main">
      <label>Title<input value={post.title} onChange={(e) => update("title", e.target.value)} placeholder="Clear, specific post title" /></label>
      <div className="editor-two"><label>Category<input value={post.category} onChange={(e) => update("category", e.target.value)} /></label><label>Reading time<input value={post.read_time} onChange={(e) => update("read_time", e.target.value)} /></label></div>
      <label>Short description<input value={post.excerpt} onChange={(e) => update("excerpt", e.target.value)} placeholder="What the reader will learn" /></label>
      <label>Featured image URL<input value={post.featured_image} onChange={(e) => update("featured_image", e.target.value)} placeholder="/media/images/example.jpg or https://..." /></label>
      <div className="editor-label">Article content</div><div className="editor-toolbar"><button type="button" onClick={() => insert("## ")}>Heading</button><button type="button" onClick={() => insert("**", "**")}>Bold</button><button type="button" onClick={() => insert("- ")}>List</button><button type="button" onClick={() => insert("> ")}>Quote</button></div>
      <textarea ref={contentRef} value={post.content} onChange={(e) => update("content", e.target.value)} placeholder="Write the article here. Use the formatting buttons for Markdown headings, lists and emphasis." rows="18" />
      <div className="editor-two"><label>Author<input value={post.author} onChange={(e) => update("author", e.target.value)} /></label><label>Tags<input value={post.tags} onChange={(e) => update("tags", e.target.value)} placeholder="AI, IoT, technology" /></label></div>
      {message && <p className="admin-message">{message}</p>}
      <div className="editor-actions"><button onClick={() => save(false)} disabled={saving}><Save size={17}/> Save draft</button><button className="publish" onClick={() => save(true)} disabled={saving}><Send size={17}/> {saving ? "Saving..." : "Publish post"}</button></div>
    </div><aside className="editor-preview"><span>PREVIEW</span><h1>{post.title || "Your post title"}</h1><p>{post.excerpt || "A short description will appear here."}</p>{post.featured_image && <img src={post.featured_image} alt="Post preview" />}<div className="markdown-preview">{post.content || "Start writing to preview the article structure."}</div></aside></div>
  </section>;
}

export default function AdminPanel({ onExit }) {
  const [token, setToken] = useState(() => localStorage.getItem("syntellos_admin_token") || "");
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(() => {
    const path = window.location.pathname;
    if (path === "/admin/create") return "new";
    const match = path.match(/^\/admin\/edit\/(\d+)$/);
    return match ? Number(match[1]) : null;
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigateAdmin = (path) => {
    window.history.pushState({}, "", path);
    setEditing(path === "/admin/create" ? "new" : null);
  };
  const loadPosts = async (currentToken = token) => { setLoading(true); try { const result = await adminRequest("/blogs/admin/all", currentToken); setPosts(result.data.blogs); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { if (token) loadPosts(); }, [token]);
  async function login(event) { event.preventDefault(); setError(""); const credentials = Object.fromEntries(new FormData(event.currentTarget)); try { const result = await adminLogin(credentials); localStorage.setItem("syntellos_admin_token", result.data.token); setToken(result.data.token); } catch (err) { setError(err.message); } }
  if (!token) return <main className="admin-login"><section><span>SYNTELLOS AI / OWNER ACCESS</span><h1>Manage website content.</h1><p>Sign in to write, save and publish blog posts.</p><form onSubmit={login}><label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" required /></label>{error && <p className="admin-error">{error}</p>}<button type="submit">Sign in</button></form><button className="admin-link" onClick={onExit}><ArrowLeft size={16}/> Back to website</button></section></main>;
  if (editing) {
    const selectedPost = editing === "new" ? null : posts.find((post) => post.id === editing);
    if (editing !== "new" && !selectedPost) {
      return <main className="admin-shell"><header className="admin-top"><b>Syntellos <i>AI</i></b></header><section className="admin-dashboard"><p>Loading post…</p></section></main>;
    }
    return <main className="admin-shell"><header className="admin-top"><b>Syntellos <i>AI</i></b><button onClick={() => { localStorage.removeItem("syntellos_admin_token"); setToken(""); }}><LogOut size={16}/> Sign out</button></header><BlogEditor initial={selectedPost} token={token} onCancel={() => navigateAdmin("/admin")} onSaved={() => { navigateAdmin("/admin"); loadPosts(); }} /></main>;
  }
  return <main className="admin-shell"><header className="admin-top"><b>Syntellos <i>AI</i></b><div><button className="admin-link" onClick={onExit}><Eye size={16}/> View website</button><button onClick={() => { localStorage.removeItem("syntellos_admin_token"); setToken(""); }}><LogOut size={16}/> Sign out</button></div></header><section className="admin-dashboard"><div className="admin-dashboard-head"><div><span>OWNER DASHBOARD</span><h1>Blog posts</h1><p>Create a draft, edit it, and publish when it is ready for the website.</p></div><button className="new-post" onClick={() => navigateAdmin("/admin/create")}><FilePlus2 size={18}/> New blog post</button></div>{error && <p className="admin-error">{error}</p>}<div className="admin-stats"><div><b>{posts.length}</b><span>Total posts</span></div><div><b>{posts.filter((post) => post.is_published).length}</b><span>Published</span></div><div><b>{posts.filter((post) => !post.is_published).length}</b><span>Drafts</span></div></div><div className="post-table">{loading ? <p>Loading posts…</p> : posts.map((post) => <article key={post.id}><div><span>{post.is_published ? "PUBLISHED" : "DRAFT"} · {post.category}</span><h2>{post.title}</h2><p>{post.excerpt}</p></div><button onClick={() => navigateAdmin(`/admin/edit/${post.id}`)}><PenLine size={16}/> Edit</button></article>)}{!loading && posts.length === 0 && <p>No posts yet. Create the first one.</p>}</div></section></main>;
}
