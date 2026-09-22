import { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Paperclip,
  Quote,
  Redo2,
  Undo2,
  X,
} from "lucide-react";
import { adminUpload } from "../api";

function humanFileSize(bytes) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = Number(bytes);
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(index ? 1 : 0)} ${units[index]}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function youtubeEmbedUrl(value = "") {
  try {
    const url = new URL(value.trim());
    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace(/^\/+/, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
    if (url.hostname.includes("youtube.com")) {
      if (url.pathname.startsWith("/embed/")) return value.trim();
      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
  } catch {
    return "";
  }
  return "";
}

function rangeAtPoint(x, y) {
  if (document.caretRangeFromPoint) {
    return document.caretRangeFromPoint(x, y);
  }
  if (document.caretPositionFromPoint) {
    const position = document.caretPositionFromPoint(x, y);
    if (!position) return null;
    const range = document.createRange();
    range.setStart(position.offsetNode, position.offset);
    range.collapse(true);
    return range;
  }
  return null;
}

function sanitizePastedHtml(html = "") {
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, meta, link, iframe, video, object, embed").forEach((node) => node.remove());
  doc.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      if (attribute.name !== "href" && attribute.name !== "src" && attribute.name !== "alt" && attribute.name !== "target") {
        node.removeAttribute(attribute.name);
      }
    });
  });
  return doc.body.innerHTML
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/<p>\s*<\/p>/gi, "<p><br></p>");
}

export default function RichBlogEditor({ content = "", onChange, token }) {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const savedRangeRef = useRef(null);
  const lastHtmlRef = useRef(content || "");
  const [uploading, setUploading] = useState(false);
  const [youtubeOpen, setYoutubeOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [, forceToolbarUpdate] = useState(0);

  useEffect(() => {
    const node = editorRef.current;
    if (!node) return;
    if (node.innerHTML !== content && document.activeElement !== node) {
      node.innerHTML = content || "";
      lastHtmlRef.current = content || "";
    }
  }, [content]);

  useEffect(() => {
    const updateSelection = () => {
      const node = editorRef.current;
      const selection = window.getSelection();
      if (!node || !selection?.rangeCount) return;
      const range = selection.getRangeAt(0);
      if (node.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
        forceToolbarUpdate((value) => value + 1);
      }
    };
    document.addEventListener("selectionchange", updateSelection);
    return () => document.removeEventListener("selectionchange", updateSelection);
  }, []);

  function emitChange() {
    const html = editorRef.current?.innerHTML || "";
    lastHtmlRef.current = html;
    onChange?.(html);
  }

  function restoreSelection(range = savedRangeRef.current) {
    const node = editorRef.current;
    if (!node) return;
    const selection = window.getSelection();
    if (!selection) return;

    // Keep the browser's current selection when the toolbar is clicked. A live
    // Range saved before formatting can become stale after the DOM is wrapped
    // in <strong>/<em>, which made the second click fail to toggle formatting.
    if (selection.rangeCount && node.contains(selection.getRangeAt(0).commonAncestorContainer)) {
      node.focus();
      return;
    }

    node.focus();

    selection.removeAllRanges();
    if (range) {
      try {
        selection.addRange(range);
        return;
      } catch {
        // Fall through to end-of-editor placement.
      }
    }

    const fallback = document.createRange();
    fallback.selectNodeContents(node);
    fallback.collapse(false);
    selection.addRange(fallback);
  }

  function insertHtml(html, range) {
    restoreSelection(range);
    document.execCommand("insertHTML", false, html);
    emitChange();
  }

  function command(name, value = null) {
    restoreSelection();
    document.execCommand(name, false, value);
    emitChange();
    forceToolbarUpdate((current) => current + 1);
  }

  function active(commandName) {
    try {
      return document.queryCommandState(commandName);
    } catch {
      return false;
    }
  }

  async function uploadFile(file) {
    const data = new FormData();
    data.append("file", file);
    const result = await adminUpload("/media/upload", token, data);
    return result.data;
  }

  async function insertUploadedFile(file, range = savedRangeRef.current) {
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadFile(file);
      if (data.kind === "image") {
        insertHtml(
          `<img src="${escapeHtml(data.url)}" alt="${escapeHtml(data.original_name || "")}" class="editor-img editor-img-large editor-img-center" data-width="large" data-align="center">`,
          range,
        );
        return;
      }

      if (data.kind === "video") {
        insertHtml(
          `<video src="${escapeHtml(data.url)}" controls preload="metadata" class="blog-editor-video"></video><p><br></p>`,
          range,
        );
        return;
      }

      const label = data.original_name || "Download file";
      const size = humanFileSize(data.size);
      insertHtml(
        `<a href="${escapeHtml(data.url)}" target="_blank" rel="noopener noreferrer" class="attachment-card" download>📎 ${escapeHtml(label)}${size ? ` · ${escapeHtml(size)}` : ""}</a><p><br></p>`,
        range,
      );
    } catch (error) {
      window.alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  function handleMediaPick(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    insertUploadedFile(file);
  }

  function handleAttachmentPick(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    insertUploadedFile(file);
  }

  function handleDrop(event) {
    const files = Array.from(event.dataTransfer?.files || []);
    if (!files.length) return;
    event.preventDefault();
    const dropRange = rangeAtPoint(event.clientX, event.clientY);
    files.forEach((file, index) => insertUploadedFile(file, index === 0 ? dropRange : undefined));
  }

  function handlePaste(event) {
    const items = Array.from(event.clipboardData?.items || []);
    const fileItem = items.find((item) => item.kind === "file" && item.type.startsWith("image/"));
    if (fileItem) {
      const file = fileItem.getAsFile();
      if (!file) return;
      event.preventDefault();
      insertUploadedFile(file);
      return;
    }

    event.preventDefault();
    const html = event.clipboardData?.getData("text/html");
    const text = event.clipboardData?.getData("text/plain") || "";
    if (html) {
      insertHtml(sanitizePastedHtml(html));
    } else {
      const safeText = text.split(/\r?\n/).map((line) => `<p>${escapeHtml(line)}</p>`).join("");
      insertHtml(safeText || "<p><br></p>");
    }
  }

  function handleKeyDown(event) {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (event.altKey && ["2", "3", "4"].includes(key)) {
      event.preventDefault();
      formatHeading(Number(key));
      return;
    }
    const commandName = key === "b" ? "bold" : key === "i" ? "italic" : key === "u" ? "underline" : key === "z" ? "undo" : key === "y" ? "redo" : "";
    if (!commandName) return;
    event.preventDefault();
    document.execCommand(commandName, false, null);
    emitChange();
    forceToolbarUpdate((current) => current + 1);
  }

  function formatHeading(level) {
    command("formatBlock", `H${level}`);
  }

  function handleEditorClick(event) {
    const target = event.target;
    if (target instanceof HTMLImageElement) {
      setSelectedImage(target);
      return;
    }
    setSelectedImage(null);
  }

  function updateImage(width, align) {
    if (!selectedImage || !editorRef.current?.contains(selectedImage)) return;
    const nextWidth = width || selectedImage.dataset.width || "large";
    const nextAlign = align || selectedImage.dataset.align || "center";

    selectedImage.dataset.width = nextWidth;
    selectedImage.dataset.align = nextAlign;
    selectedImage.className = `editor-img editor-img-${nextWidth} editor-img-${nextAlign}`;
    emitChange();
    forceToolbarUpdate((current) => current + 1);
  }

  function addLink() {
    const href = window.prompt("Paste the link URL");
    if (!href) return;
    command("createLink", href);
  }

  function confirmYoutube(event) {
    event.preventDefault();
    const embed = youtubeEmbedUrl(youtubeUrl);
    if (!embed) {
      window.alert("Please enter a valid YouTube video URL.");
      return;
    }
    setYoutubeOpen(false);
    insertHtml(
      `<div class="blog-youtube" contenteditable="false"><iframe src="${escapeHtml(embed)}" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><p><br></p>`,
    );
    setYoutubeUrl("");
  }

  const Button = ({ title, isActive = false, onClick, disabled = false, children }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={isActive ? "rich-editor-btn active" : "rich-editor-btn"}
      disabled={disabled}
      onMouseDown={(event) => {
        // Prevent focus loss, but explicitly preserve the selection before the
        // browser dispatches the toolbar click.
        event.preventDefault();
        const selection = window.getSelection();
        if (selection?.rangeCount && editorRef.current?.contains(selection.getRangeAt(0).commonAncestorContainer)) {
          savedRangeRef.current = selection.getRangeAt(0).cloneRange();
        }
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className="rich-editor-shell">
      <div className="rich-editor-toolbar" aria-label="Article formatting tools">
        <Button title="Bold" isActive={active("bold")} onClick={() => command("bold")}><Bold size={16} /></Button>
        <Button title="Italic" isActive={active("italic")} onClick={() => command("italic")}><Italic size={16} /></Button>
        <Button title="Heading 2" onClick={() => command("formatBlock", "H2")}><Heading2 size={16} /></Button>
        <Button title="Heading 3" onClick={() => command("formatBlock", "H3")}><Heading3 size={16} /></Button>
        <Button title="Heading 4" onClick={() => formatHeading(4)}><span className="rich-editor-heading-button">H4</span></Button>
        <Button title="Bullet list" isActive={active("insertUnorderedList")} onClick={() => command("insertUnorderedList")}><List size={16} /></Button>
        <Button title="Numbered list" isActive={active("insertOrderedList")} onClick={() => command("insertOrderedList")}><ListOrdered size={16} /></Button>
        <Button title="Quote" onClick={() => command("formatBlock", "BLOCKQUOTE")}><Quote size={16} /></Button>
        <Button title="Code block" onClick={() => command("formatBlock", "PRE")}><Code2 size={16} /></Button>
        <Button title="Add link" onClick={addLink}><Link2 size={16} /></Button>

        <span className="rich-editor-divider" />

        <Button title="Undo" onClick={() => command("undo")}><Undo2 size={16} /></Button>
        <Button title="Redo" onClick={() => command("redo")}><Redo2 size={16} /></Button>

        <span className="rich-editor-divider" />

        <Button title="Upload image" disabled={uploading} onClick={() => imageInputRef.current?.click()}><ImageIcon size={16} /></Button>
        {/* Video upload/embed is intentionally disabled for now; retain the implementation for a future release. */}
        {/* <Button title="Upload video" disabled={uploading} onClick={() => videoInputRef.current?.click()}><Film size={16} /></Button> */}
        {/* <Button title="Embed YouTube video" disabled={uploading} onClick={() => setYoutubeOpen(true)}><Youtube size={16} /></Button> */}
        <Button title="Attach file" disabled={uploading} onClick={() => attachmentInputRef.current?.click()}><Paperclip size={16} /></Button>

        {uploading && <span className="rich-editor-uploading"><Loader2 size={14} /> Uploading…</span>}
        <span className="rich-editor-tip">Paste from Word/Docs · drag files here · paste screenshots</span>

        <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleMediaPick} />
        {/* <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={handleMediaPick} /> */}
        <input ref={attachmentInputRef} type="file" hidden onChange={handleAttachmentPick} />
      </div>

      {selectedImage && (
        <div className="rich-image-controls">
          <span>Image</span>
          {["small", "medium", "large", "full"].map((size) => (
            <button
              type="button"
              key={size}
              className={selectedImage.dataset.width === size ? "active" : ""}
              onClick={() => updateImage(size, null)}
            >
              {size === "small" ? "S" : size === "medium" ? "M" : size === "large" ? "L" : "Full"}
            </button>
          ))}
          <span className="rich-editor-divider" />
          <button type="button" className={selectedImage.dataset.align === "left" ? "active" : ""} onClick={() => updateImage(null, "left")}><AlignLeft size={14} /></button>
          <button type="button" className={(selectedImage.dataset.align || "center") === "center" ? "active" : ""} onClick={() => updateImage(null, "center")}><AlignCenter size={14} /></button>
          <button type="button" className={selectedImage.dataset.align === "right" ? "active" : ""} onClick={() => updateImage(null, "right")}><AlignRight size={14} /></button>
        </div>
      )}

      <div
        ref={editorRef}
        className="rich-blog-editor blog-rich-content"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder="Paste an article from Word or Google Docs, or start writing here…"
        onInput={emitChange}
        onBlur={emitChange}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        onPaste={handlePaste}
        onClick={handleEditorClick}
      />

      {youtubeOpen && (
        <div className="editor-modal-backdrop" onMouseDown={() => setYoutubeOpen(false)}>
          <form className="editor-modal" onSubmit={confirmYoutube} onMouseDown={(event) => event.stopPropagation()}>
            <div className="editor-modal-head">
              <div><Youtube size={19} /><b>Embed YouTube video</b></div>
              <button type="button" onClick={() => setYoutubeOpen(false)}><X size={18} /></button>
            </div>
            <p>Paste a YouTube watch, Shorts, share or embed URL.</p>
            <input
              autoFocus
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <div className="editor-modal-actions">
              <button type="button" onClick={() => setYoutubeOpen(false)}>Cancel</button>
              <button type="submit">Insert video</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
