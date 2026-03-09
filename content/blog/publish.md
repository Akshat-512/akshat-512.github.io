---
title: "Publish Post"
description: "Quick publisher for adding a post from phone"
---

Use this page to open a prefilled GitHub issue. Only posts opened by the repository owner are auto-published.

<div class="publish-panel">
  <form id="publish-form" class="publish-form">
    <label for="post-title">Title</label>
    <input id="post-title" name="title" type="text" required maxlength="120" placeholder="Post title" />

    <label for="post-section">Section</label>
    <select id="post-section" name="section" required>
      <option value="articles">articles</option>
      <option value="music">music</option>
      <option value="books">books</option>
      <option value="movies">movies</option>
    </select>

    <label for="post-tags">Tags (comma-separated, optional)</label>
    <input id="post-tags" name="tags" type="text" placeholder="music, review" />

    <label for="post-content">Content (Markdown)</label>
    <textarea id="post-content" name="content" required rows="12" placeholder="Write your post in Markdown..."></textarea>

    <button type="submit">Open GitHub Issue</button>
  </form>

  <p class="publish-help">After tapping submit, GitHub will ask you to sign in if needed. Submit the issue there to publish.</p>
</div>

<script>
(function () {
  const owner = "akshat-512";
  const repo = "akshat-512.github.io";
  const form = document.getElementById("publish-form");

  function normalizeLineEndings(text) {
    return text.replace(/\r\n/g, "\n").trim();
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

    const url = "https://github.com/" + owner + "/" + repo + "/issues/new?" + params.toString();
    window.location.href = url;
  });
})();
</script>
