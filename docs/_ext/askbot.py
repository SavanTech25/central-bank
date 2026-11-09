"""Export the site content as small text chunks for the in-browser "Ask the docs" bot.

At the end of an HTML build, writes ``<outdir>/search-chunks.json``: one entry per
section (split when long) with its page title, section title, URL and plain text.
``scripts/embed-index.mjs`` then turns it into ``search-index.json`` (with embeddings).
The browser side lives in ``_static/askbot.js``.
"""

import json
import re
from pathlib import Path

from docutils import nodes

EXCLUDED_DOCS = re.compile(r"^(index|genindex|search|quiz/.*)$")
MAX_CHARS = 900
OVERLAP = 150


def _clean(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def _own_text(section: nodes.section) -> str:
    """Text of a section without its sub-sections, raw HTML, comments or diagrams."""
    copy = section.deepcopy()
    for node in list(copy.findall(lambda n: isinstance(n, (nodes.section, nodes.raw, nodes.comment, nodes.title)) or n.__class__.__name__ == "mermaid")):
        if node is not copy and node.parent is not None:
            node.parent.remove(node)
    return _clean(copy.astext())


def _split(text: str) -> list[str]:
    if len(text) <= MAX_CHARS:
        return [text]
    parts, current = [], ""
    for para in text.split("\n\n"):
        if current and len(current) + len(para) > MAX_CHARS:
            parts.append(current)
            current = current[-OVERLAP:]
        current = f"{current}\n\n{para}" if current else para
        while len(current) > MAX_CHARS * 1.5:  # very long paragraph
            parts.append(current[:MAX_CHARS])
            current = current[MAX_CHARS - OVERLAP:]
    if current.strip():
        parts.append(current)
    return parts


def write_chunks(app, exception):
    if exception or app.builder.format != "html":
        return
    chunks = []
    for docname in sorted(app.env.found_docs):
        if EXCLUDED_DOCS.match(docname):
            continue
        doctree = app.env.get_doctree(docname)
        page_title = app.env.titles[docname].astext() if docname in app.env.titles else docname
        page_url = app.builder.get_target_uri(docname)
        for i, section in enumerate(doctree.findall(nodes.section)):
            text = _own_text(section)
            if len(text) < 40:
                continue
            title = section.next_node(nodes.title)
            section_title = title.astext() if title else page_title
            anchor = "" if i == 0 or not section["ids"] else f"#{section['ids'][0]}"
            for part in _split(text):
                chunks.append({
                    "page": page_title,
                    "section": section_title,
                    "url": page_url + anchor,
                    "text": part,
                })
    out = Path(app.outdir) / "search-chunks.json"
    out.write_text(json.dumps(chunks, ensure_ascii=False), encoding="utf-8")


def setup(app):
    app.connect("build-finished", write_chunks)
    return {"version": "1.0", "parallel_read_safe": True, "parallel_write_safe": True}
