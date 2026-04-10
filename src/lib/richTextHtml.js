/**
 * Detect Quill / RTE "empty" HTML so we store '' instead of <p></p> or <p><br></p>.
 */
export function isEmptyRichTextHtml(html) {
  if (html == null) return true;
  const t = String(html).trim();
  if (!t) return true;
  const textOnly = t.replace(/<[^>]+>/g, '').replace(/\u00a0/g, ' ').trim();
  if (textOnly.length > 0) return false;
  // No text: treat as empty only if markup is blank Quill paragraph(s) (keeps <p class="..."> valid)
  return /^(?:<p[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>\s*)+$/i.test(t);
}

/** Empty → ''; otherwise unchanged string (trimmed). */
export function normalizeRichTextHtml(html) {
  return isEmptyRichTextHtml(html) ? '' : String(html);
}
