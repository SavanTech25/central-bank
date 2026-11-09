"""Tiny Sphinx extension for interactive multiple-choice questions (QCM).

Usage in any .rst page::

    .. qcm:: Which layer of Snowflake stores the data?
       :explanation: Storage is fully decoupled from compute.

       - [ ] Virtual warehouses
       - [x] The storage layer
       - [ ] Cloud services

Exactly one option must be marked ``[x]``. Inline ``code`` and **bold** are
supported in the question, options and explanation. Interactivity (feedback,
score, reset) is provided by ``_static/qcm.js``.
"""

import html
import re

from docutils import nodes
from docutils.parsers.rst import Directive, directives

OPTION_RE = re.compile(r"^-\s*\[( |x|X)\]\s*(.*)$")


def _inline(text: str) -> str:
    """Escape HTML, then render ``code`` and **bold**."""
    out = html.escape(text.strip())
    out = re.sub(r"``(.+?)``", r"<code>\1</code>", out)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)
    return out


class QcmDirective(Directive):
    required_arguments = 1
    final_argument_whitespace = True
    has_content = True
    option_spec = {"explanation": directives.unchanged}

    def run(self):
        options: list[list] = []  # [is_correct, text]
        for line in self.content:
            if not line.strip():
                continue
            match = OPTION_RE.match(line.strip())
            if match:
                options.append([match.group(1).lower() == "x", match.group(2)])
            elif options:  # continuation line of the previous option
                options[-1][1] += " " + line.strip()
            else:
                raise self.error(f"qcm: unexpected line before options: {line!r}")

        correct = [i for i, (ok, _) in enumerate(options) if ok]
        if len(options) < 2 or len(correct) != 1:
            raise self.error("qcm: need at least 2 options and exactly one marked [x]")

        letters = "ABCDEFGH"
        buttons = "".join(
            f'<button type="button" class="qcm-opt" data-i="{i}">'
            f'<span class="qcm-letter">{letters[i]}</span>'
            f'<span class="qcm-text">{_inline(text)}</span></button>'
            for i, (_, text) in enumerate(options)
        )
        explanation = _inline(self.options.get("explanation", ""))
        markup = (
            f'<div class="qcm" data-answer="{correct[0]}">'
            f'<p class="qcm-q"><span class="qcm-num"></span>{_inline(self.arguments[0])}</p>'
            f'<div class="qcm-options">{buttons}</div>'
            f'<div class="qcm-feedback" hidden><strong class="qcm-verdict"></strong> '
            f'<span>{explanation}</span></div>'
            f"</div>"
        )
        return [nodes.raw("", markup, format="html")]


def setup(app):
    app.add_directive("qcm", QcmDirective)
    return {"version": "1.0", "parallel_read_safe": True, "parallel_write_safe": True}
