---
title: "Publish Post"
description: "Quick publisher for adding a post from phone"
---

Use this page to open a prefilled GitHub issue. Only posts opened by the repository owner are auto-published.

<div class="publish-panel">
  <form id="publish-form" class="publish-form">
    <label for="post-title">Title</label>
    <input id="post-title" name="title" type="text" required maxlength="120" placeholder="Post title">
    <label for="post-section">Section</label>
    <select id="post-section" name="section" required>
      <option value="essays">essays</option>
      <option value="music">music</option>
      <option value="books">books</option>
      <option value="movies">movies</option>
    </select>
    <label for="post-tags">Tags (comma-separated, optional)</label>
    <input id="post-tags" name="tags" type="text" placeholder="music, review">
    <label for="post-content">Content</label>
    <textarea id="post-content" name="content" required rows="12" placeholder="Paste Markdown, rich text, or image embeds..."></textarea>
    <button type="submit">Open GitHub Issue</button>
  </form>
  <p id="publish-help" class="publish-help">After tapping submit, GitHub will ask you to sign in if needed. Submit the issue there to publish.</p>
</div>

<script>
(function () {
  const owner = "akshat-512";
  const repo = "akshat-512.github.io";
  const form = document.getElementById("publish-form");
  const contentInput = document.getElementById("post-content");
  const help = document.getElementById("publish-help");

  function normalizeLineEndings(text) {
    return text.replace(/\r\n/g, "\n").trim();
  }

  function escapeMarkdown(text) {
    return text.replace(/\\/g, "\\\\").replace(/\[/g, "\\[").replace(/\]/g, "\\]");
  }

  function cleanText(text) {
    return text.replace(/\s+/g, " ").trim();
  }

  function htmlToMarkdown(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");

    function walk(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return "";
      }

      const tag = node.tagName.toLowerCase();
      const children = Array.from(node.childNodes).map(walk).join("");

      if (tag === "br") {
        return "\n";
      }

      if (tag === "p" || tag === "div" || tag === "section" || tag === "article") {
        return "\n\n" + children.trim() + "\n\n";
      }

      if (/^h[1-6]$/.test(tag)) {
        const level = Number(tag.slice(1));
        return "\n\n" + "#".repeat(level) + " " + cleanText(children) + "\n\n";
      }

      if (tag === "strong" || tag === "b") {
        return "**" + children.trim() + "**";
      }

      if (tag === "em" || tag === "i") {
        return "*" + children.trim() + "*";
      }

      if (tag === "a") {
        const href = node.getAttribute("href");
        return href ? "[" + cleanText(children || href) + "](" + href + ")" : children;
      }

      if (tag === "img") {
        const src = node.getAttribute("src");
        const alt = node.getAttribute("alt") || "image";
        return src ? "\n\n![" + escapeMarkdown(alt) + "](" + src + ")\n\n" : "";
      }

      if (tag === "li") {
        return "- " + children.trim() + "\n";
      }

      if (tag === "ul" || tag === "ol") {
        return "\n" + children + "\n";
      }

      if (tag === "blockquote") {
        return "\n\n" + children.trim().split("\n").map(function (line) {
          return line ? "> " + line : ">";
        }).join("\n") + "\n\n";
      }

      return children;
    }

    return normalizeLineEndings(Array.from(doc.body.childNodes).map(walk).join(""));
  }

  function insertAtCursor(text) {
    const start = contentInput.selectionStart;
    const end = contentInput.selectionEnd;
    const before = contentInput.value.slice(0, start);
    const after = contentInput.value.slice(end);
    const spacerBefore = before && !before.endsWith("\n") ? "\n\n" : "";
    const spacerAfter = after && !text.endsWith("\n") ? "\n\n" : "";
    contentInput.value = before + spacerBefore + text + spacerAfter + after;
    const position = (before + spacerBefore + text).length;
    contentInput.setSelectionRange(position, position);
    contentInput.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  contentInput.addEventListener("paste", async function (event) {
    const data = event.clipboardData;
    if (!data) {
      return;
    }

    const imageFiles = Array.from(data.files || []).filter(function (file) {
      return file.type.indexOf("image/") === 0;
    });

    const html = data.getData("text/html");
    if (html) {
      event.preventDefault();
      insertAtCursor(htmlToMarkdown(html));
      return;
    }

    if (imageFiles.length > 0) {
      event.preventDefault();
      const chunks = await Promise.all(imageFiles.map(async function (file, index) {
        const src = await readFileAsDataUrl(file);
        const name = file.name || "pasted-image-" + (index + 1);
        return "![" + escapeMarkdown(name) + "](" + src + ")";
      }));
      insertAtCursor(chunks.join("\n\n"));
    }
  });

  async function copyToClipboard(text) {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      return false;
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = form.title.value.trim();
    const section = form.section.value.trim();
    const tags = form.tags.value.trim();
    const content = normalizeLineEndings(form.content.value);

    if (!title || !section || !content) {
      return;
    }

    const body = [
      "### Section",
      section,
      "",
      "### Tags",
      tags,
      "",
      "### Content",
      content,
      ""
    ].join("\n");

    const params = new URLSearchParams({
      labels: "publish-post",
      title: title,
      body: body
    });

    const fullUrl = "https://github.com/" + owner + "/" + repo + "/issues/new?" + params.toString();
    if (fullUrl.length < 6500 && body.indexOf("data:image/") === -1) {
      window.location.href = fullUrl;
      return;
    }

    copyToClipboard(body).then(function (copied) {
      const fallbackBody = [
        "Paste the copied publish body here before submitting.",
        "",
        "The post contains embedded images or is too long for a prefilled URL."
      ].join("\n");
      const fallbackParams = new URLSearchParams({
        labels: "publish-post",
        title: title,
        body: fallbackBody
      });
      help.textContent = copied
        ? "Copied the full post body. Paste it into the GitHub issue before submitting."
        : "The post is too long for a prefilled URL. Copy the content manually into the GitHub issue before submitting.";
      window.location.href = "https://github.com/" + owner + "/" + repo + "/issues/new?" + fallbackParams.toString();
    });
  });
})();
</script>
