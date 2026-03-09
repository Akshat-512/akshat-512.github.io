This is my personal site built with Zola.

Add an article:
1. Run `scripts/new-article.sh "Title of your post"`.
2. Edit the new file in `content/articles/`.
3. Run `zola serve` to preview.

Add a section-specific post:
1. Run `scripts/new-article.sh <section> "Title of your post"`.
2. Use one of: `articles` (default), `music`, `books`, `movies`.

Examples:
- `scripts/new-article.sh music "Songs on Repeat"`
- `scripts/new-article.sh books "The Stranger"`
- `scripts/new-article.sh --section movies "Solaris (1972) Notes"`

Posts are created in `content/<section>/` with a date-prefixed filename.

Publish from phone (simple UI):
1. Open `https://akshat-512.github.io/blog/publish/` from your phone.
2. Fill title, section, tags, and markdown content.
3. Tap `Open GitHub Issue`, sign in, and submit.

Only issues opened by the repository owner are auto-published. The workflow creates the post file, commits it, pushes to `main`, comments with the URL, and closes the issue.
