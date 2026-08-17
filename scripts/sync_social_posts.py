#!/usr/bin/env python3
"""
Sync social media posts from the `social-media-posts` vault into this site.

Reads every *.md file in the vault (each file = one social post, written the
way Mileena archives them: the post text, then an optional trailer with
"Posted: <date>", engagement numbers and "What people are saying:") and
writes one Jekyll document per post into `_social/`.

Only the post text and the date carry over. Engagement numbers and other
people's comments are deliberately left in the vault.

Usage:
    python3 scripts/sync_social_posts.py --vault /path/to/social-media-posts

Settings live in `_data/social_feed.yml`:
    exclude:            # vault filenames that should NOT be published
      - README.md

Dating a post that has no "Posted:" line: add one at the very end of the
vault file, using the same format as the others, e.g.

    Posted: June 3rd, 2026 at 14:05

and the next sync will pick it up and sort the post into place.
"""

import argparse
import datetime as dt
import html
import os
import re
import sys

try:
    import yaml  # PyYAML ships with GitHub Actions runners and macOS Python via pip
except ImportError:  # pragma: no cover
    yaml = None

MONTHS = {m.lower(): i for i, m in enumerate(
    ["January", "February", "March", "April", "May", "June", "July",
     "August", "September", "October", "November", "December"], start=1)}
MONTHS.update({k[:3]: v for k, v in list(MONTHS.items())})

# Where the post text ends and the archive trailer begins.
TRAILER_RE = re.compile(
    r"(?:(?<=\s)|^)Posted:\s"                                             # "Posted: April 12th, 2026 at 02:36"
    r"|^(?:Reactions|Views|Comments|Shares|Bookmarks):\s*[\d,\.]+[KkMm]?\s*$"  # engagement counters
    r"|^What people are saying:",                                          # other people's comments
    re.MULTILINE,
)
POSTED_RE = re.compile(r"Posted:\s*(?P<rest>[^\n]*)")
DATE_RE = re.compile(
    r"(?P<month>[A-Za-z]+)\.?\s+(?P<day>\d{1,2})(?:st|nd|rd|th)?"
    r"(?:,?\s*(?P<year>\d{4}))?"
    r"(?:\s*(?:at|@)\s*(?P<time>\d{1,2}:?\d{2})\s*(?P<ampm>[AaPp][Mm])?)?",
)

CONTRACTIONS = {
    "im": "I'm", "ive": "I've", "id": "I'd", "ill": "I'll",
    "dont": "Don't", "didnt": "Didn't", "doesnt": "Doesn't", "cant": "Can't",
    "wont": "Won't", "isnt": "Isn't", "wasnt": "Wasn't", "arent": "Aren't",
    "youre": "You're", "youve": "You've", "theyre": "They're", "thats": "That's",
    "whats": "What's", "hes": "He's", "shes": "She's", "its": "It's",
    "couldnt": "Couldn't", "wouldnt": "Wouldn't", "shouldnt": "Shouldn't",
    "vs": "vs.",
}

URL_RE = re.compile(r"(https?://[^\s<>\"']+)")
BULLET_RE = re.compile(r"^\s*[\*\-\u2022]\s+")
NUMBERED_RE = re.compile(r"^\s*\d+[\.\)]\s+")


def title_from_filename(name: str) -> str:
    stem = os.path.splitext(name)[0]
    words = []
    for w in stem.split("-"):
        if not w:
            continue
        fixed = CONTRACTIONS.get(w.lower())
        if fixed:
            # keep the original casing style for the first letter
            words.append(fixed if w[0].isupper() or fixed[0] == "I" else fixed.lower())
        else:
            words.append(w)
    return " ".join(words)


def slug_from_filename(name: str) -> str:
    stem = os.path.splitext(name)[0].lower()
    stem = re.sub(r"[^a-z0-9]+", "-", stem).strip("-")
    return stem or "post"


def parse_posted_date(rest: str, today: dt.date):
    """Return (datetime|None, warning|None) from the text after 'Posted:'."""
    m = DATE_RE.search(rest)
    if not m:
        return None, f"could not read a date from 'Posted: {rest.strip()}'"
    month = MONTHS.get(m.group("month").lower())
    if not month:
        return None, f"unknown month in 'Posted: {rest.strip()}'"
    day = int(m.group("day"))
    year = int(m.group("year")) if m.group("year") else None
    hour, minute = 0, 0
    if m.group("time"):
        t = m.group("time").replace(":", "")
        if len(t) == 3:
            t = "0" + t
        hour, minute = int(t[:2]), int(t[2:])
        ampm = (m.group("ampm") or "").lower()
        if ampm == "pm" and hour < 12:
            hour += 12
        if ampm == "am" and hour == 12:
            hour = 0
    warning = None
    if year is None:
        # No year written: assume the most recent year in which this date has already happened.
        year = today.year
        try:
            if dt.date(year, month, day) > today:
                year -= 1
        except ValueError:
            pass
        warning = f"no year in 'Posted: {rest.strip()}' — assumed {year}"
    try:
        return dt.datetime(year, month, day, hour, minute), warning
    except ValueError as e:
        return None, f"invalid date in 'Posted: {rest.strip()}' ({e})"


def split_front_matter(text: str):
    """Optional YAML front matter in a vault file (title/date/tags/excerpt)."""
    if text.startswith("---\n"):
        end = text.find("\n---", 4)
        if end != -1:
            raw = text[4:end]
            body = text[end + 4:].lstrip("\n")
            data = {}
            if yaml:
                try:
                    data = yaml.safe_load(raw) or {}
                except Exception:
                    data = {}
            return data, body
    return {}, text


def linkify(escaped: str) -> str:
    return URL_RE.sub(lambda m: f'<a href="{m.group(1)}" rel="noopener" target="_blank">{m.group(1)}</a>', escaped)


NOTE_LABEL_RE = re.compile(r"^\[[^\]]{1,60}\]$")           # a line that is only "[Visual Description]"
NOTE_INLINE_RE = re.compile(r"^\[[^\]]*\]\s*$", re.DOTALL)  # a whole paragraph wrapped in [ ... ]


def paragraphs(body: str):
    """Split post text into (kind, lines) paragraphs.

    kind is one of: "text", "note" (image descriptions such as
    "[Image 1: ...]" or a "[Visual Description]" block), "ul", "ol".
    """
    body = body.replace("\r\n", "\n").replace("\u2028", "\n").replace("\u2029", "\n\n")
    body = re.sub(r"[ \t]+\n", "\n", body)
    body = re.sub(r"\n{3,}", "\n\n", body).strip()
    result = []
    for para in body.split("\n\n"):
        lines = [ln.rstrip() for ln in para.split("\n") if ln.strip()]
        if not lines:
            continue
        if all(BULLET_RE.match(ln) for ln in lines):
            result.append(("ul", [BULLET_RE.sub("", ln) for ln in lines]))
        elif all(NUMBERED_RE.match(ln) for ln in lines):
            result.append(("ol", [NUMBERED_RE.sub("", ln) for ln in lines]))
        elif NOTE_LABEL_RE.match(lines[0]) or NOTE_INLINE_RE.match("\n".join(lines)):
            result.append(("note", lines))
        else:
            result.append(("text", lines))
    return result


def render_body_html(body: str) -> str:
    """Turn plain post text into tidy HTML, preserving the line breaks she wrote."""
    out = []
    for kind, lines in paragraphs(body):
        if kind == "ul" or kind == "ol":
            items = "".join("<li>" + linkify(html.escape(ln)) + "</li>" for ln in lines)
            out.append("<" + kind + ">" + items + "</" + kind + ">")
        elif kind == "note":
            out.append('<p class="social-note">' + "<br>\n".join(linkify(html.escape(ln)) for ln in lines) + "</p>")
        else:
            out.append("<p>" + "<br>\n".join(linkify(html.escape(ln)) for ln in lines) + "</p>")
    return "\n\n".join(out)


def plain_excerpt(body: str, limit: int) -> str:
    """First `limit` characters of the post text (skipping image descriptions)."""
    words = []
    for kind, lines in paragraphs(body):
        if kind == "note":
            continue
        words.append(" ".join(lines))
    text = re.sub(r"\s+", " ", " ".join(words)).strip()
    if len(text) <= limit:
        return text
    cut = text[:limit].rsplit(" ", 1)[0]
    return cut.rstrip(" ,;:\u2014-") + "\u2026"


def yaml_str(s: str) -> str:
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def load_settings(path: str) -> dict:
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as fh:
        raw = fh.read()
    if yaml:
        try:
            return yaml.safe_load(raw) or {}
        except Exception:
            pass
    # tiny fallback parser for the simple `exclude:` list
    data, key = {}, None
    for line in raw.splitlines():
        if re.match(r"^\w+:\s*$", line):
            key = line.split(":")[0]
            data[key] = []
        elif key and line.strip().startswith("- "):
            data[key].append(line.strip()[2:].strip().strip('"\''))
    return data


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vault", required=True, help="path to the social-media-posts folder")
    ap.add_argument("--out", default="_social", help="output collection folder (default: _social)")
    ap.add_argument("--settings", default="_data/social_feed.yml")
    ap.add_argument("--today", default=None, help="override today's date (YYYY-MM-DD) for year inference")
    ap.add_argument("--timezone", default="America/Chicago", help="timezone the 'Posted:' times were written in")
    args = ap.parse_args()

    try:
        from zoneinfo import ZoneInfo
        tz = ZoneInfo(args.timezone)
    except Exception:  # pragma: no cover
        tz = None

    today = dt.date.fromisoformat(args.today) if args.today else dt.date.today()
    settings = load_settings(args.settings)
    exclude = {e.strip() for e in (settings.get("exclude") or [])}
    exclude.add("README.md")

    os.makedirs(args.out, exist_ok=True)
    existing = {f for f in os.listdir(args.out) if f.endswith(".html")}
    written, undated, excluded, warnings = [], [], [], []

    for name in sorted(os.listdir(args.vault)):
        if not name.endswith(".md") or name.startswith("."):
            continue
        if name in exclude:
            excluded.append(name)
            continue
        path = os.path.join(args.vault, name)
        with open(path, encoding="utf-8") as fh:
            raw = fh.read()

        fm, text = split_front_matter(raw)
        text = text.replace("\r\n", "\n").replace("\u2028", "\n")

        m = TRAILER_RE.search(text)
        body = text[:m.start()] if m else text
        trailer = text[m.start():] if m else ""

        posted = None
        pm = POSTED_RE.search(trailer)
        if pm:
            posted, warn = parse_posted_date(pm.group("rest"), today)
            if warn:
                warnings.append(f"{name}: {warn}")
        if fm.get("date"):
            d = fm["date"]
            if isinstance(d, dt.datetime):
                posted = d.replace(tzinfo=None)
            elif isinstance(d, dt.date):
                posted = dt.datetime(d.year, d.month, d.day)
            else:
                p, warn = parse_posted_date(str(d), today)
                posted = p or posted
        if not body.strip():
            warnings.append(f"{name}: no post text found — skipped")
            continue

        title = str(fm.get("title") or title_from_filename(name))
        slug = slug_from_filename(name)
        body_html = render_body_html(body)
        excerpt = plain_excerpt(body, 300)
        description = plain_excerpt(body, 155)

        lines = ["---", "layout: social", f"title: {yaml_str(title)}"]
        if posted:
            # Written with an explicit UTC offset so Jekyll never mistakes the
            # local time for UTC (a bare YAML timestamp is read as UTC).
            stamped = posted.replace(tzinfo=tz) if tz else posted
            lines.append("date: " + stamped.strftime("%Y-%m-%d %H:%M:%S %z").strip())
        else:
            lines.append("undated: true")
            undated.append(name)
        lines += [
            'category: "Social Media"',
            "tags: [social-media]",
            f"source_file: {yaml_str(name)}",
            f"excerpt: {yaml_str(excerpt)}",
            f"description: {yaml_str(description)}",
            "---",
        ]
        if fm.get("tags"):
            tags = fm["tags"] if isinstance(fm["tags"], list) else [fm["tags"]]
            lines[lines.index("tags: [social-media]")] = "tags: [" + ", ".join(
                ["social-media"] + [str(t) for t in tags]) + "]"

        content = "\n".join(lines) + "\n" + body_html.replace("{{", "{ {").replace("{%", "{ %") + "\n"
        out_name = f"{slug}.html"
        out_path = os.path.join(args.out, out_name)
        old = open(out_path, encoding="utf-8").read() if os.path.exists(out_path) else None
        if old != content:
            with open(out_path, "w", encoding="utf-8") as fh:
                fh.write(content)
        written.append(out_name)
        existing.discard(out_name)

    # Remove documents whose vault file is gone (or now excluded)
    for stale in sorted(existing):
        os.remove(os.path.join(args.out, stale))

    print(f"Synced {len(written)} social posts into {args.out}/")
    print(f"  dated: {len(written) - len(undated)}   undated: {len(undated)}   excluded: {len(excluded)}   removed: {len(existing)}")
    if excluded:
        print("  excluded: " + ", ".join(sorted(excluded)))
    if undated:
        print("  undated (add a 'Posted:' line to the vault file to date them):")
        for n in undated:
            print(f"    - {n}")
    if warnings:
        print("  notes:")
        for w in warnings:
            print(f"    - {w}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
