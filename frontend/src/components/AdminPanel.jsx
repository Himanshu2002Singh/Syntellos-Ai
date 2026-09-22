import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FilePlus2,
  FileText,
  LogOut,
  Mail,
  PenLine,
  Radio,
  RefreshCw,
  Save,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { adminLogin, adminRequest, adminUpload } from "../api";
import RichBlogEditor from "./RichBlogEditor";

const blankPost = {
  title: "",
  slug: "",
  category: "AI & Technology",
  excerpt: "",
  content: "",
  featured_image: "",
  // featured_video is retained in the data model for a future release.
  author: "Syntellos AI Editorial",
  read_time: "5 min read",
  tags: "",
  is_published: false,
};

function looksLikeHtml(value = "") {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function formatIST(value, includeTime = true) {
  if (!value) return "—";
  const raw = String(value);
  const date = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(raw) ? raw : `${raw.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(date);
}

function markdownToEditorHtml(value = "") {
  if (!value || looksLikeHtml(value)) return value || "";

  const inline = (text) => text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  const lines = value.replace(/\r/g, "").split("\n");
  const output = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;
    output.push(`<ul>${listItems.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  lines.forEach((raw) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      return;
    }
    if (/^-\s+/.test(line)) {
      listItems.push(line.replace(/^-\s+/, ""));
      return;
    }

    flushList();
    if (line.startsWith("#### ")) output.push(`<h4>${inline(line.slice(5))}</h4>`);
    else if (line.startsWith("### ")) output.push(`<h3>${inline(line.slice(4))}</h3>`);
    else if (line.startsWith("## ")) output.push(`<h2>${inline(line.slice(3))}</h2>`);
    else if (line.startsWith("# ")) output.push(`<h2>${inline(line.slice(2))}</h2>`);
    else if (line.startsWith("> ")) output.push(`<blockquote>${inline(line.slice(2))}</blockquote>`);
    else output.push(`<p>${inline(line)}</p>`);
  });

  flushList();
  return output.join("");
}

const editablePostKeys = [
  "title",
  "slug",
  "category",
  "excerpt",
  "content",
  "featured_image",
  "author",
  "read_time",
  "tags",
  "is_published",
];

function editableSnapshot(post) {
  return Object.fromEntries(editablePostKeys.map((key) => [key, post?.[key] ?? blankPost[key] ?? ""]));
}

function draftKeyFor(post) {
  return `syntellos_blog_editor_draft_${post?.id || "new"}`;
}

function BlogEditor({ initial, onCancel, onSaved, token, mailConfigured }) {
  const basePost = {
    ...blankPost,
    ...(initial || {}),
    content: markdownToEditorHtml(initial?.content || ""),
  };
  const serverPostRef = useRef(basePost);
  const initialDraftKey = draftKeyFor(basePost);

  let restored = null;
  try {
    const raw = localStorage.getItem(initialDraftKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      const draftSnapshot = parsed?.post;
      if (
        draftSnapshot &&
        JSON.stringify(editableSnapshot(draftSnapshot)) !== JSON.stringify(editableSnapshot(basePost))
      ) {
        restored = {
          ...basePost,
          ...draftSnapshot,
          content: markdownToEditorHtml(draftSnapshot.content || ""),
        };
      }
    }
  } catch {
    restored = null;
  }

  const [post, setPost] = useState(restored || basePost);
  const [notifySubscribers, setNotifySubscribers] = useState(() => !initial?.is_published && mailConfigured);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [restoredDraft, setRestoredDraft] = useState(Boolean(restored));
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef(null);
  const draftKeyRef = useRef(initialDraftKey);
  const autosaveTimer = useRef(null);

  const update = (key, value) => setPost((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    autosaveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(
          draftKeyRef.current,
          JSON.stringify({ post: editableSnapshot(post), savedAt: Date.now() }),
        );
      } catch {
        // Browser storage is best-effort only.
      }
    }, 650);

    return () => {
      if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current);
    };
  }, [post]);

  function discardLocalDraft() {
    try {
      localStorage.removeItem(draftKeyRef.current);
    } catch {
      // Ignore unavailable browser storage.
    }
    setPost(serverPostRef.current);
    setRestoredDraft(false);
    setMessage("Restored the last saved version.");
    setEditorResetKey((value) => value + 1);
  }

  async function save(publishNow) {
    if (!post.title.trim() || !post.category.trim() || !post.excerpt.trim() || !post.content.replace(/<[^>]*>/g, "").trim()) {
      setMessage("Please complete all required fields: title, category, short description and article content.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const isNew = !post.id;
      const targetPublished = publishNow ? true : (isNew ? false : Boolean(post.is_published));
      const payload = {
        ...post,
        is_published: targetPublished,
        send_email_notification: publishNow && !post.is_published && notifySubscribers && mailConfigured,
      };
      const path = post.id ? `/blogs/admin/${post.id}` : "/blogs/admin";
      const result = await adminRequest(path, token, {
        method: post.id ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      const savedPost = {
        ...result.data.blog,
        content: markdownToEditorHtml(result.data.blog.content || ""),
      };

      try {
        localStorage.removeItem(draftKeyRef.current);
      } catch {
        // Ignore unavailable browser storage.
      }

      if (isNew && savedPost.id) {
        draftKeyRef.current = draftKeyFor(savedPost);
        window.history.replaceState({}, "", `/admin/edit/${savedPost.id}`);
      }

      serverPostRef.current = savedPost;
      setPost(savedPost);
      setRestoredDraft(false);
      setMessage(result.message);
      onSaved(savedPost, publishNow);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadFeaturedImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setImageUploading(true);
    try {
      const result = await adminUpload("/media/upload", token, formData);
      update("featured_image", result.data.url);
    } catch (error) {
      setMessage(`Image upload failed: ${error.message}`);
    } finally {
      setImageUploading(false);
    }
  }

  const canPublish = !post.is_published;

  return (
    <section className="admin-editor rich-admin-editor">
      <div className="admin-editor-head">
        <div>
          <span>CONTENT EDITOR</span>
          <h2>{post.id ? "Edit blog post" : "Write a new blog post"}</h2>
          <p>Rich text, images and attachments — with browser autosave while you work.</p>
        </div>
        <button className="admin-link" onClick={onCancel}><ArrowLeft size={16} /> Back to posts</button>
      </div>

      {restoredDraft && (
        <div className="editor-draft-recovery">
          <div>
            <b>Unsaved work restored</b>
            <span>We found newer changes saved in this browser.</span>
          </div>
          <button type="button" onClick={discardLocalDraft}>Discard local draft</button>
        </div>
      )}

      <div className="editor-layout rich-editor-layout">
        <div className="editor-main">
          <label>
            Title <span className="field-required">Required</span>
            <input required value={post.title} onChange={(e) => update("title", e.target.value)} placeholder="Clear, specific post title" />
          </label>

          <div className="editor-two">
            <label>
              Slug <span className="field-optional">Optional · auto-generated</span>
              <input value={post.slug || ""} onChange={(e) => update("slug", e.target.value)} placeholder="generated-from-title" />
            </label>
            <label>
              Category <span className="field-required">Required</span>
              <input required value={post.category} onChange={(e) => update("category", e.target.value)} />
            </label>
          </div>

          <div className="editor-two">
            <label>
              Reading time <span className="field-optional">Optional</span>
              <input value={post.read_time} onChange={(e) => update("read_time", e.target.value)} />
            </label>
            <label>
              Author <span className="field-optional">Optional</span>
              <input value={post.author} onChange={(e) => update("author", e.target.value)} />
            </label>
          </div>

          <label>
            Short description <span className="field-required">Required · max 300 characters</span>
            <textarea
              className="editor-excerpt"
              value={post.excerpt || ""}
              onChange={(e) => update("excerpt", e.target.value)}
              placeholder="What the reader will learn"
              rows="3"
              maxLength="300"
              required
            />
            <small className="field-count">{(post.excerpt || "").length}/300</small>
          </label>

          <label>
            Featured image <span className="field-optional">Optional</span>
            <div className="image-url-row">
              <input value={post.featured_image || ""} onChange={(e) => update("featured_image", e.target.value)} placeholder="Paste an image URL or upload a file" />
              <button type="button" onClick={() => imageInputRef.current?.click()} disabled={imageUploading}>{imageUploading ? "Uploading…" : "Upload image"}</button>
              <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={uploadFeaturedImage} />
            </div>
          </label>

          <div className="editor-content-head">
            <div>
              <div className="editor-label">Article content <span className="field-required">Required</span></div>
              <small>Paste from Word/Google Docs or compose directly. Formatting is stored as rich HTML.</small>
            </div>
            <span>Autosaves locally</span>
          </div>

          <RichBlogEditor
            key={editorResetKey}
            content={post.content || ""}
            onChange={(html) => update("content", html)}
            token={token}
          />

          <label>
            Tags <span className="field-optional">Optional</span>
            <input value={post.tags || ""} onChange={(e) => update("tags", e.target.value)} placeholder="AI, IoT, technology" />
          </label>

          {canPublish && (
            <label className="notify-toggle">
              <input
                type="checkbox"
                checked={notifySubscribers}
                disabled={!mailConfigured}
                onChange={(e) => setNotifySubscribers(e.target.checked)}
              />
              <span>
                <b>Notify newsletter subscribers on publish</b>
                <small>{mailConfigured
                  ? "Sends the branded new-post email through the configured SMTP account."
                  : "SMTP is not configured yet. Publish will still work, but no email will be sent."}</small>
              </span>
            </label>
          )}

          {message && <p className="admin-message admin-message-box">{message}</p>}

          <div className="editor-actions">
            <button onClick={() => save(false)} disabled={saving}>
              <Save size={17} /> {post.is_published ? "Save changes" : "Save draft"}
            </button>
            {canPublish && (
              <button className="publish" onClick={() => save(true)} disabled={saving}>
                <Send size={17} /> {saving ? "Publishing..." : "Publish post"}
              </button>
            )}
          </div>
        </div>

        <aside className="editor-preview rich-editor-preview">
          <div className="preview-head"><span>LIVE PREVIEW</span><button type="button" onClick={() => setPreviewOpen(true)}><Eye size={15} /> Open larger preview</button></div>
          <div className="preview-meta">{post.category || "Category"} · {post.read_time || "5 min read"}</div>
          <h1>{post.title || "Your post title"}</h1>
          <p>{post.excerpt || "A short description will appear here."}</p>
          {post.featured_image ? (
            <img src={post.featured_image} alt="Post preview" />
          ) : null}
          <div
            className="rich-preview blog-rich-content"
            dangerouslySetInnerHTML={{ __html: post.content || "<p>Start writing to preview the article.</p>" }}
          />
        </aside>
      </div>
      {previewOpen && (
        <div className="preview-modal-backdrop" role="dialog" aria-modal="true" onMouseDown={() => setPreviewOpen(false)}>
          <section className="preview-modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="preview-modal-head"><b>Article preview</b><button type="button" onClick={() => setPreviewOpen(false)}>Close</button></div>
            <div className="preview-modal-body">
              <div className="preview-meta">{post.category || "Category"} · {post.read_time || "5 min read"}</div>
              <h1>{post.title || "Your post title"}</h1>
              <p>{post.excerpt || "A short description will appear here."}</p>
              {post.featured_image && <img src={post.featured_image} alt="Post preview" />}
              <div className="blog-rich-content" dangerouslySetInnerHTML={{ __html: post.content || "<p>Start writing to preview the article.</p>" }} />
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function NewsletterPanel({ token, subscribers, stats, mailStatus, onReload }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [subscriberPage, setSubscriberPage] = useState(1);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");

  const filteredSubscribers = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return subscribers;
    return subscribers.filter((sub) =>
      `${sub.name || ""} ${sub.email || ""}`.toLowerCase().includes(needle)
    );
  }, [search, subscribers]);
  const visibleSubscribers = filteredSubscribers.slice((subscriberPage - 1) * 10, subscriberPage * 10);
  const subscriberPages = Math.max(1, Math.ceil(filteredSubscribers.length / 10));

  async function sendBroadcast(event) {
    event.preventDefault();
    if (!subject.trim() || !body.trim()) {
      setMessage("Add a subject and newsletter body first.");
      return;
    }
    if (!window.confirm(`Send this newsletter to ${stats.active || 0} active subscriber(s)?`)) return;

    setSending(true);
    setMessage("");
    try {
      const result = await adminRequest("/newsletter/broadcast", token, {
        method: "POST",
        body: JSON.stringify({ subject: subject.trim(), plainText: body.trim() }),
      });
      setMessage(result.message);
      setSubject("");
      setBody("");
      onReload();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSending(false);
    }
  }

  async function verifySmtp() {
    setVerifying(true);
    setMessage("");
    try {
      const result = await adminRequest("/newsletter/mail-status/verify", token, { method: "POST" });
      setMessage(result.message);
      onReload();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setVerifying(false);
    }
  }

  async function removeSubscriber(subscriber) {
    if (!window.confirm(`Remove ${subscriber.email} from the subscriber database?`)) return;
    try {
      const result = await adminRequest(`/newsletter/subscribers/${subscriber.id}`, token, { method: "DELETE" });
      setMessage(result.message);
      onReload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="admin-dashboard newsletter-admin">
      <div className="admin-dashboard-head">
        <div>
          <span>NEWSLETTER STUDIO</span>
          <h1>Subscribers & broadcasts</h1>
          <p>Manage the audience, verify SMTP delivery and send standalone newsletters without touching the codebase.</p>
        </div>
        <button className="refresh-admin" onClick={onReload}><RefreshCw size={17} /> Refresh</button>
      </div>

      <div className="admin-stats admin-stats-four">
        <div><b>{stats.total || 0}</b><span>Total subscribers</span></div>
        <div><b>{stats.active || 0}</b><span>Active</span></div>
        <div><b>{stats.unsubscribed || 0}</b><span>Unsubscribed</span></div>
        <div>
          <b className={mailStatus.configured ? "status-good" : "status-warn"}>
            {mailStatus.configured ? "Ready" : mailStatus.endpointAvailable === false ? "Update" : "Setup"}
          </b>
          <span>SMTP delivery</span>
        </div>
      </div>

      <div className="newsletter-admin-grid">
        <form className="newsletter-composer" onSubmit={sendBroadcast}>
          <div className="admin-card-kicker"><Radio size={16} /> COMPOSE BROADCAST</div>
          <h2>Send a newsletter</h2>
          <p>Every message is wrapped in the Syntellos AI email template and gets a subscriber-specific unsubscribe link.</p>

          <label>
            Subject
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What should subscribers see in their inbox?" />
          </label>
          <label>
            Message
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={"Write the newsletter in plain text.\n\nParagraph breaks are preserved in the branded email."}
              rows="12"
            />
          </label>
          <div className="newsletter-send-row">
            <small>{body.length} characters · {stats.active || 0} active recipient(s)</small>
            <button type="submit" disabled={sending || !mailStatus.configured}>
              <Send size={17} /> {sending ? "Sending..." : "Send newsletter"}
            </button>
          </div>
        </form>

        <aside className="smtp-card">
          <div className="admin-card-kicker"><Mail size={16} /> EMAIL DELIVERY</div>
          <h2>
            {mailStatus.configured
              ? "SMTP is configured"
              : mailStatus.endpointAvailable === false
                ? "Backend update required"
                : "SMTP setup required"}
          </h2>
          <p>
            {mailStatus.configured
              ? "Credentials are present. Verify the connection before the first campaign or after changing providers."
              : mailStatus.endpointAvailable === false
                ? "The deployed backend does not have the newsletter mail-status route yet. Redeploy the updated backend, then refresh this page."
                : "Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM to the backend environment."}
          </p>
          <dl>
            <div><dt>Host</dt><dd>{mailStatus.host || "—"}</dd></div>
            <div><dt>Port</dt><dd>{mailStatus.port || "—"}</dd></div>
            <div><dt>Security</dt><dd>{mailStatus.secure ? "SSL/TLS" : "STARTTLS / provider default"}</dd></div>
            <div><dt>From</dt><dd>{mailStatus.from || "—"}</dd></div>
          </dl>
          <button
            className="smtp-verify"
            onClick={verifySmtp}
            disabled={verifying || !mailStatus.configured || mailStatus.endpointAvailable === false}
          >
            <CheckCircle2 size={16} /> {verifying ? "Verifying..." : "Verify SMTP connection"}
          </button>
        </aside>
      </div>

      {message && <p className="admin-message admin-message-box">{message}</p>}

      <section className="subscriber-section">
        <div className="subscriber-head">
          <div>
            <span>YOUR AUDIENCE</span>
            <h2>Subscribers</h2>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
            aria-label="Search subscribers"
          />
        </div>

        <div className="subscriber-table">
          <div className="subscriber-row subscriber-row-head">
            <span>Subscriber</span><span>Status</span><span>Joined</span><span></span>
          </div>
          {visibleSubscribers.map((subscriber) => (
            <div className="subscriber-row" key={subscriber.id}>
              <div>
                <b>{subscriber.name || "Subscriber"}</b>
                <small>{subscriber.email}</small>
              </div>
              <span className={subscriber.is_active ? "subscriber-active" : "subscriber-inactive"}>
                {subscriber.is_active ? "Active" : "Unsubscribed"}
              </span>
              <span>{formatIST(subscriber.subscribed_at, false)}</span>
              <button onClick={() => removeSubscriber(subscriber)} title="Remove subscriber"><Trash2 size={16} /></button>
            </div>
          ))}
          {visibleSubscribers.length === 0 && <p className="empty-admin">No subscribers match this search.</p>}
        </div>
        {subscriberPages > 1 && <div className="admin-pagination"><button disabled={subscriberPage === 1} onClick={() => setSubscriberPage((page) => page - 1)}>Previous</button><span>Page {subscriberPage} of {subscriberPages}</span><button disabled={subscriberPage === subscriberPages} onClick={() => setSubscriberPage((page) => page + 1)}>Next</button></div>}
      </section>
    </section>
  );
}

function QueriesPanel({ leads, loading, onResolve }) {
  const [page, setPage] = useState(1);
  const visibleLeads = leads.slice((page - 1) * 10, page * 10);
  const pages = Math.max(1, Math.ceil(leads.length / 10));
  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard-head">
        <div>
          <span>CONTACT INBOX</span>
          <h1>Queries</h1>
          <p>Review every submitted enquiry. New queries are unresolved until an admin marks them resolved.</p>
        </div>
      </div>
      <div className="admin-stats admin-stats-four">
        <div><b>{leads.length}</b><span>Total queries</span></div>
        <div><b>{leads.filter((lead) => lead.status === "new").length}</b><span>Unresolved</span></div>
        <div><b>{leads.filter((lead) => lead.status === "closed").length}</b><span>Resolved</span></div>
      </div>
      <div className="query-table">
        {loading ? <p>Loading queries…</p> : visibleLeads.map((lead) => (
          <article key={lead.id} className={lead.status === "closed" ? "resolved" : ""}>
            <div>
              <span>#{lead.id} · {lead.intent}</span>
              <h2>{lead.name}</h2>
              <p>{lead.message}</p>
              <small>{lead.email} · {lead.phone || "No phone"} · {formatIST(lead.created_at)}</small>
            </div>
            <button disabled={lead.status === "closed"} onClick={() => onResolve(lead)}>
              <CheckCircle2 size={16} /> {lead.status === "closed" ? "Resolved" : "Mark resolved"}
            </button>
          </article>
        ))}
        {!loading && leads.length === 0 && <p className="empty-admin">No queries yet.</p>}
      </div>
      {pages > 1 && <div className="admin-pagination"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span>Page {page} of {pages}</span><button disabled={page === pages} onClick={() => setPage((value) => value + 1)}>Next</button></div>}
    </section>
  );
}

export default function AdminPanel({ onExit }) {
  const [token, setToken] = useState(() => localStorage.getItem("syntellos_admin_token") || "");
  const [posts, setPosts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [subscriberStats, setSubscriberStats] = useState({ total: 0, active: 0, unsubscribed: 0 });
  const [mailStatus, setMailStatus] = useState({ configured: false, endpointAvailable: true });
  const [dashboard, setDashboard] = useState({ metrics: {} });
  const [activeTab, setActiveTab] = useState(() =>
    window.location.pathname.startsWith("/admin/queries") ? "queries" : window.location.pathname.startsWith("/admin/newsletter") ? "newsletter" : "blogs"
  );
  const [editing, setEditing] = useState(() => {
    const path = window.location.pathname;
    if (path === "/admin/create") return "new";
    const match = path.match(/^\/admin\/edit\/(\d+)$/);
    return match ? Number(match[1]) : null;
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [postPage, setPostPage] = useState(1);

  const logout = () => {
    localStorage.removeItem("syntellos_admin_token");
    setToken("");
  };

  const loadAdminData = async (currentToken = token) => {
    if (!currentToken) return;
    setLoading(true);
    setError("");

    try {
      // SMTP status is optional. Do not let a stale backend deployment break the
      // entire admin dashboard just because this newer endpoint is unavailable.
      const [postResult, subscriberResult, subscriberStatsResult, dashboardResult, leadResult] = await Promise.all([
        adminRequest("/blogs/admin/all?limit=100", currentToken),
        adminRequest("/newsletter/subscribers?limit=100", currentToken),
        adminRequest("/newsletter/stats", currentToken),
        adminRequest("/stats/dashboard", currentToken),
        adminRequest("/leads?limit=100", currentToken),
      ]);

      setPosts(postResult.data.blogs || []);
      setSubscribers(subscriberResult.data.subscribers || []);
      setSubscriberStats(subscriberStatsResult.data.stats || {});
      setDashboard(dashboardResult.data || { metrics: {} });
      setLeads(leadResult.data.leads || []);

      try {
        const mailResult = await adminRequest("/newsletter/mail-status", currentToken);
        setMailStatus({
          configured: false,
          endpointAvailable: true,
          ...(mailResult.data || {}),
        });
      } catch (mailError) {
        setMailStatus({
          configured: false,
          endpointAvailable: false,
          error: mailError.message,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadAdminData(token);
  }, [token]);

  useEffect(() => {
    const onPopState = () => {
      const path = window.location.pathname;
      setActiveTab(path.startsWith("/admin/queries") ? "queries" : path.startsWith("/admin/newsletter") ? "newsletter" : "blogs");
      if (path === "/admin/create") setEditing("new");
      else {
        const match = path.match(/^\/admin\/edit\/(\d+)$/);
        setEditing(match ? Number(match[1]) : null);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigateAdmin = (path) => {
    window.history.pushState({}, "", path);
    if (path.startsWith("/admin/newsletter")) {
      setActiveTab("newsletter");
      setEditing(null);
    } else if (path.startsWith("/admin/queries")) {
      setActiveTab("queries");
      setEditing(null);
    } else {
      setActiveTab("blogs");
      if (path === "/admin/create") setEditing("new");
      else {
        const match = path.match(/^\/admin\/edit\/(\d+)$/);
        setEditing(match ? Number(match[1]) : null);
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  async function login(event) {
    event.preventDefault();
    setError("");
    const credentials = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await adminLogin(credentials);
      localStorage.setItem("syntellos_admin_token", result.data.token);
      setToken(result.data.token);
    } catch (err) {
      setError(err.message);
    }
  }

  async function togglePublish(post) {
    setNotice("");
    try {
      const result = await adminRequest(`/blogs/admin/${post.id}/publish`, token, {
        method: "PATCH",
        body: JSON.stringify({ is_published: !post.is_published, send_email_notification: false }),
      });
      setNotice(result.message);
      await loadAdminData();
    } catch (err) {
      setNotice(err.message);
    }
  }

  async function broadcastBlog(post) {
    if (!window.confirm(`Email "${post.title}" to all active subscribers?`)) return;
    setNotice("");
    try {
      const result = await adminRequest(`/blogs/admin/${post.id}/broadcast`, token, { method: "POST" });
      setNotice(result.message);
      await loadAdminData();
    } catch (err) {
      setNotice(err.message);
    }
  }

  async function deletePost(post) {
    if (!window.confirm(`Delete "${post.title}" permanently?`)) return;
    setNotice("");
    try {
      const result = await adminRequest(`/blogs/admin/${post.id}`, token, { method: "DELETE" });
      setNotice(result.message);
      await loadAdminData();
    } catch (err) {
      setNotice(err.message);
    }
  }

  async function resolveLead(lead) {
    try {
      await adminRequest(`/leads/${lead.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status: "closed" }),
      });
      await loadAdminData();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!token) {
    return (
      <main className="admin-login">
        <section>
          <span>SYNTELLOS AI / OWNER ACCESS</span>
          <h1>Manage content & audience.</h1>
          <p>Sign in to publish articles, manage subscribers and send newsletters.</p>
          <form onSubmit={login}>
            <label>Email<input name="email" type="email" required /></label>
            <label>Password<input name="password" type="password" required /></label>
            {error && <p className="admin-error">{error}</p>}
            <button type="submit">Sign in</button>
          </form>
          <button className="admin-link" onClick={onExit}><ArrowLeft size={16} /> Back to website</button>
        </section>
      </main>
    );
  }

  if (editing) {
    const selectedPost = editing === "new" ? null : posts.find((post) => post.id === editing);
    if (editing !== "new" && !selectedPost) {
      return (
        <main className="admin-shell">
          <header className="admin-top"><b>Syntellos <i>AI</i></b></header>
          <section className="admin-dashboard"><p>{loading ? "Loading post…" : "Post not found."}</p></section>
        </main>
      );
    }
    return (
      <main className="admin-shell">
        <header className="admin-top">
          <b>Syntellos <i>AI</i></b>
          <button onClick={logout}><LogOut size={16} /> Sign out</button>
        </header>
        <BlogEditor
          initial={selectedPost}
          token={token}
          mailConfigured={mailStatus.configured}
          onCancel={() => navigateAdmin("/admin")}
          onSaved={async (_savedPost, publishedNow) => {
            await loadAdminData();
            if (publishedNow) navigateAdmin("/admin");
          }}
        />
      </main>
    );
  }

  const metrics = dashboard.metrics || {};
  const postsOnPage = posts.slice((postPage - 1) * 10, postPage * 10);
  const postPages = Math.max(1, Math.ceil(posts.length / 10));

  return (
    <main className="admin-shell">
      <header className="admin-top">
        <b>Syntellos <i>AI</i></b>
        <div>
          <button className="admin-link" onClick={onExit}><Eye size={16} /> View website</button>
          <button onClick={logout}><LogOut size={16} /> Sign out</button>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Admin sections">
        <button className={activeTab === "blogs" ? "active" : ""} onClick={() => navigateAdmin("/admin")}>
          <FileText size={17} /> Blog
        </button>
        <button className={activeTab === "newsletter" ? "active" : ""} onClick={() => navigateAdmin("/admin/newsletter")}>
          <Mail size={17} /> Newsletter
          <span>{subscriberStats.active || 0}</span>
        </button>
        <button className={activeTab === "queries" ? "active" : ""} onClick={() => navigateAdmin("/admin/queries")}>
          <CheckCircle2 size={17} /> Queries <span>{leads.filter((lead) => lead.status === "new").length}</span>
        </button>
      </nav>

      {activeTab === "queries" ? (
        <QueriesPanel leads={leads} loading={loading} onResolve={resolveLead} />
      ) : activeTab === "newsletter" ? (
        <NewsletterPanel
          token={token}
          subscribers={subscribers}
          stats={subscriberStats}
          mailStatus={mailStatus}
          onReload={loadAdminData}
        />
      ) : (
        <section className="admin-dashboard">
          <div className="admin-dashboard-head">
            <div>
              <span>CONTENT DASHBOARD</span>
              <h1>Blog posts</h1>
              <p>Create drafts, publish articles and decide exactly when subscribers should be notified.</p>
            </div>
            <button className="new-post" onClick={() => navigateAdmin("/admin/create")}><FilePlus2 size={18} /> New blog post</button>
          </div>

          {error && <p className="admin-error">{error}</p>}
          {notice && <p className="admin-message admin-message-box">{notice}</p>}

          <div className="admin-stats admin-stats-four">
            <div><b>{posts.length}</b><span>Total posts</span></div>
            <div><b>{posts.filter((post) => post.is_published).length}</b><span>Published</span></div>
            <div><b>{posts.filter((post) => !post.is_published).length}</b><span>Drafts</span></div>
            <div><b>{metrics.totalBlogViews || 0}</b><span>Total views</span></div>
          </div>

          <div className="admin-section-title">
            <div><span>CONTENT LIBRARY</span><h2>All posts</h2></div>
            <small>{loading ? "Refreshing…" : `${posts.length} post(s)`}</small>
          </div>

          <div className="post-table">
            {loading && posts.length === 0 ? <p>Loading posts…</p> : postsOnPage.map((post) => (
              <article key={post.id}>
                <div className="post-copy">
                  <span>{post.is_published ? "PUBLISHED" : "DRAFT"} · {post.category}</span>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <small>{post.read_time || "5 min read"} · {post.views || 0} views</small>
                </div>
                <div className="post-actions">
                  <button onClick={() => navigateAdmin(`/admin/edit/${post.id}`)}><PenLine size={16} /> Edit</button>
                  <button onClick={() => togglePublish(post)}>{post.is_published ? "Unpublish" : "Publish"}</button>
                  {post.is_published && (
                    <button onClick={() => broadcastBlog(post)} disabled={!mailStatus.configured}>
                      <Radio size={16} /> Email subscribers
                    </button>
                  )}
                  <button className="danger" onClick={() => deletePost(post)}><Trash2 size={16} /> Delete</button>
                </div>
              </article>
            ))}
            {!loading && posts.length === 0 && <p className="empty-admin">No posts yet. Create the first one.</p>}
          </div>
          {postPages > 1 && <div className="admin-pagination"><button disabled={postPage === 1} onClick={() => setPostPage((page) => page - 1)}>Previous</button><span>Page {postPage} of {postPages}</span><button disabled={postPage === postPages} onClick={() => setPostPage((page) => page + 1)}>Next</button></div>}

          <div className="admin-footer-note">
            <Users size={16} />
            <span>{subscriberStats.active || 0} active newsletter subscriber(s) · {metrics.totalEmailsLogged || 0} email delivery log(s)</span>
          </div>
        </section>
      )}
    </main>
  );
}
